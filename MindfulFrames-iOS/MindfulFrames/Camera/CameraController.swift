//
//  CameraController.swift
//  MindfulFrames
//
//  AVFoundation capture session wrapper. Handles authorization, front/back
//  switching, capture, orientation, and graceful unavailability (e.g. Simulator).
//
//  Concurrency model:
//  - All AVCaptureSession / input / output / continuation mutation happens on a
//    dedicated serial `sessionQueue` (the class is NOT @MainActor).
//  - All @Published UI state is mutated on the MainActor via `publish { }`.
//

import Foundation
import Combine
import AVFoundation
import UIKit
import os

nonisolated final class CameraController: NSObject, ObservableObject, @unchecked Sendable {

    enum Status: Equatable {
        case unknown
        case unavailable        // No camera hardware (Simulator)
        case denied             // User denied / restricted
        case ready
        case failed(String)
    }

    // MARK: - Published UI state (MainActor only)

    @Published private(set) var status: Status = .unknown
    @Published private(set) var isFrontCamera = false
    @Published private(set) var isSessionRunning = false
    /// Surfaces a user-visible capture error (e.g. shown as a transient banner).
    @Published var captureErrorMessage: String?

    // MARK: - Session objects (sessionQueue only, except `session` handed to preview)

    let session = AVCaptureSession()
    private let photoOutput = AVCapturePhotoOutput()
    private let sessionQueue = DispatchQueue(label: "com.sanzgiri.mindfulframes.camera")
    private var currentInput: AVCaptureDeviceInput?
    private var isConfigured = false

    /// Rotation coordinator (iOS 17+) drives preview + capture orientation using
    /// modern APIs rather than the deprecated `AVCaptureConnection.videoOrientation`.
    private var rotationCoordinator: AVCaptureDevice.RotationCoordinator?

    /// Continuation for the in-flight capture. Confined to `sessionQueue`.
    private var captureContinuation: CheckedContinuation<UIImage?, Never>?
    /// Guards against overlapping captures. Confined to `sessionQueue`.
    private var isCapturing = false

    private let log = Logger(subsystem: "com.sanzgiri.mindfulframes", category: "Camera")

    // MARK: - MainActor publishing helper

    private func publish(_ block: @escaping @MainActor () -> Void) {
        Task { @MainActor in block() }
    }

    // MARK: - Availability & Permissions

    /// True when running where no capture device exists (Simulator).
    var hardwareAvailable: Bool {
        !AVCaptureDevice.DiscoverySession(
            deviceTypes: [.builtInWideAngleCamera],
            mediaType: .video,
            position: .unspecified
        ).devices.isEmpty
    }

    /// Prepare the session. Safe to call on the main actor from `.onAppear`.
    func prepare() {
        guard hardwareAvailable else {
            publish { self.status = .unavailable }
            return
        }
        switch AVCaptureDevice.authorizationStatus(for: .video) {
        case .authorized:
            configureAndStart()
        case .notDetermined:
            AVCaptureDevice.requestAccess(for: .video) { [weak self] granted in
                guard let self else { return }
                if granted {
                    self.configureAndStart()
                } else {
                    self.publish { self.status = .denied }
                }
            }
        case .denied, .restricted:
            publish { self.status = .denied }
        @unknown default:
            publish { self.status = .denied }
        }
    }

    // MARK: - Session lifecycle

    private func configureAndStart() {
        sessionQueue.async { [weak self] in
            guard let self else { return }

            if !self.isConfigured {
                self.session.beginConfiguration()
                self.session.sessionPreset = .photo

                if let input = self.makeInput(front: false), self.session.canAddInput(input) {
                    self.session.addInput(input)
                    self.currentInput = input
                }
                if self.session.canAddOutput(self.photoOutput) {
                    self.session.addOutput(self.photoOutput)
                }
                self.session.commitConfiguration()
                self.isConfigured = true
                self.configureRotationCoordinator()
            }

            if !self.session.isRunning {
                self.session.startRunning()
            }

            let running = self.session.isRunning
            self.publish {
                self.isFrontCamera = false
                self.isSessionRunning = running
                self.status = running ? .ready : .failed("Camera could not start.")
            }
        }
    }

    private func makeInput(front: Bool) -> AVCaptureDeviceInput? {
        let position: AVCaptureDevice.Position = front ? .front : .back
        guard let device = AVCaptureDevice.default(.builtInWideAngleCamera, for: .video, position: position)
                ?? AVCaptureDevice.default(for: .video),
              let input = try? AVCaptureDeviceInput(device: device) else {
            return nil
        }
        return input
    }

    /// Weakly held reference to the preview layer so rotation coordinators can
    /// be rebound when the camera device changes.
    private weak var previewLayer: AVCaptureVideoPreviewLayer?

    /// (Re)build the rotation coordinator for the active device, binding it to
    /// the current preview layer if one has been attached.
    private func configureRotationCoordinator() {
        guard let device = currentInput?.device else { return }
        let layer = previewLayer
        rotationCoordinator = AVCaptureDevice.RotationCoordinator(device: device, previewLayer: layer)
        applyPreviewRotation()
    }

    /// Apply the current preview rotation angle to the preview layer's connection
    /// on the main actor (UIKit/CoreAnimation must be touched on main).
    private func applyPreviewRotation() {
        guard let layer = previewLayer,
              let angle = rotationCoordinator?.videoRotationAngleForHorizonLevelPreview else { return }
        Task { @MainActor in
            if let connection = layer.connection, connection.isVideoRotationAngleSupported(angle) {
                connection.videoRotationAngle = angle
            }
        }
    }

    /// Called by the preview view once its layer exists so preview rotation can
    /// be set up for the current device.
    func attachPreviewLayer(_ layer: AVCaptureVideoPreviewLayer) {
        sessionQueue.async { [weak self] in
            guard let self else { return }
            self.previewLayer = layer
            guard let device = self.currentInput?.device else { return }
            self.rotationCoordinator = AVCaptureDevice.RotationCoordinator(device: device, previewLayer: layer)
            self.applyPreviewRotation()
        }
    }

    func start() {
        guard hardwareAvailable else { return }
        sessionQueue.async { [weak self] in
            guard let self, self.isConfigured, !self.session.isRunning else { return }
            self.session.startRunning()
            let running = self.session.isRunning
            self.publish {
                self.isSessionRunning = running
                if running { self.status = .ready }
            }
        }
    }

    func stop() {
        sessionQueue.async { [weak self] in
            guard let self else { return }
            if self.session.isRunning { self.session.stopRunning() }
            self.publish { self.isSessionRunning = false }
        }
    }

    func switchCamera() {
        sessionQueue.async { [weak self] in
            guard let self, self.isConfigured else { return }
            let wantFront = !(self.currentInput?.device.position == .front)

            self.session.beginConfiguration()
            if let current = self.currentInput {
                self.session.removeInput(current)
            }
            if let newInput = self.makeInput(front: wantFront), self.session.canAddInput(newInput) {
                self.session.addInput(newInput)
                self.currentInput = newInput
            } else if let current = self.currentInput, self.session.canAddInput(current) {
                self.session.addInput(current) // revert
            }
            self.session.commitConfiguration()
            self.configureRotationCoordinator()

            let nowFront = self.currentInput?.device.position == .front
            self.publish { self.isFrontCamera = nowFront }
        }
    }

    // MARK: - Capture

    /// Capture a still image. Guards against overlapping captures; a second call
    /// while one is in flight returns nil immediately.
    func capturePhoto() async -> UIImage? {
        await withCheckedContinuation { (continuation: CheckedContinuation<UIImage?, Never>) in
            sessionQueue.async { [weak self] in
                guard let self else {
                    continuation.resume(returning: nil)
                    return
                }
                guard self.isConfigured, self.session.isRunning else {
                    continuation.resume(returning: nil)
                    return
                }
                guard !self.isCapturing else {
                    // Overlapping capture — reject the new one cleanly.
                    continuation.resume(returning: nil)
                    return
                }
                self.isCapturing = true
                self.captureContinuation = continuation

                // Apply the correct capture rotation for the current orientation.
                let settings = AVCapturePhotoSettings()
                if let connection = self.photoOutput.connection(with: .video) {
                    if let angle = self.rotationCoordinator?.videoRotationAngleForHorizonLevelCapture,
                       connection.isVideoRotationAngleSupported(angle) {
                        connection.videoRotationAngle = angle
                    }
                    // Mirror front-camera output so the saved image matches the
                    // preview the user framed.
                    if connection.isVideoMirroringSupported {
                        connection.automaticallyAdjustsVideoMirroring = false
                        connection.isVideoMirrored = (self.currentInput?.device.position == .front)
                    }
                }
                self.photoOutput.capturePhoto(with: settings, delegate: self)
            }
        }
    }

    /// Finish an in-flight capture (sessionQueue only).
    private func finishCapture(with image: UIImage?, errorMessage: String?) {
        let continuation = captureContinuation
        captureContinuation = nil
        isCapturing = false
        if let errorMessage {
            publish { self.captureErrorMessage = errorMessage }
        }
        continuation?.resume(returning: image)
    }
}

// MARK: - AVCapturePhotoCaptureDelegate

extension CameraController: AVCapturePhotoCaptureDelegate {
    // The delegate is invoked on a queue AVFoundation manages; we hop back to
    // `sessionQueue` to mutate continuation/state safely.
    func photoOutput(_ output: AVCapturePhotoOutput,
                     didFinishProcessingPhoto photo: AVCapturePhoto,
                     error: Error?) {
        // Capture values off the photo synchronously; `photo` is not Sendable.
        if let error {
            log.error("Capture failed: \(error.localizedDescription, privacy: .public)")
            sessionQueue.async { [weak self] in
                self?.finishCapture(with: nil, errorMessage: "Couldn't capture the photo. Please try again.")
            }
            return
        }
        guard let data = photo.fileDataRepresentation(), let image = UIImage(data: data) else {
            sessionQueue.async { [weak self] in
                self?.finishCapture(with: nil, errorMessage: "Couldn't process the photo. Please try again.")
            }
            return
        }
        sessionQueue.async { [weak self] in
            self?.finishCapture(with: image, errorMessage: nil)
        }
    }
}
