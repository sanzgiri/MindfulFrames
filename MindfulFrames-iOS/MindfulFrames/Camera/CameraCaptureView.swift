//
//  CameraCaptureView.swift
//  MindfulFrames
//
//  Full-screen mindful capture experience with permission/unavailable states,
//  front/back switch, an optional cancellable 3-second timer, an iOS-standard
//  captured-image review (Use Photo / Retake), and visible capture errors.
//

import SwiftUI
import PhotosUI

struct CameraCaptureView: View {
    let pause: Pause
    @EnvironmentObject private var store: AppStore
    @Environment(\.dismiss) private var dismiss
    @Environment(\.scenePhase) private var scenePhase
    @StateObject private var camera = CameraController()

    @State private var timerEnabled = false
    @State private var countdown: Int? = nil
    @State private var isCapturing = false
    @State private var pickerItem: PhotosPickerItem?
    @State private var showSavedToast = false

    /// The image awaiting Use Photo / Retake confirmation before persistence.
    @State private var reviewImage: UIImage?
    @State private var reviewSource: PhotoSource = .camera

    /// Cancellable countdown task so leaving the screen stops the timer.
    @State private var timerTask: Task<Void, Never>?

    var body: some View {
        NavigationStack {
            ZStack {
                Color.black.ignoresSafeArea()
                content
                if let countdown, countdown > 0 {
                    Text("\(countdown)")
                        .font(.system(size: 120, weight: .thin, design: .rounded))
                        .foregroundStyle(.white)
                        .transition(.scale.combined(with: .opacity))
                        .id(countdown)
                }
                if showSavedToast {
                    savedToast
                }
            }
            .navigationTitle("Capture · \(pause.title)")
            .navigationBarTitleDisplayMode(.inline)
            .toolbarColorScheme(.dark, for: .navigationBar)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Done") { dismiss() }
                }
            }
        }
        .preferredColorScheme(.dark)
        .onAppear { camera.prepare() }
        .onDisappear {
            timerTask?.cancel()
            timerTask = nil
            camera.stop()
        }
        .onChange(of: scenePhase) { _, phase in
            switch phase {
            case .active:
                camera.start()
            case .background, .inactive:
                timerTask?.cancel()
                timerTask = nil
                camera.stop()
            @unknown default:
                break
            }
        }
        // Consolidated PhotosPicker change handling for the whole view.
        .onChange(of: pickerItem) { _, newItem in
            guard let newItem else { return }
            Task { await importPicked(newItem) }
        }
        // Visible capture errors.
        .alert(
            "Capture Problem",
            isPresented: Binding(
                get: { camera.captureErrorMessage != nil },
                set: { if !$0 { camera.captureErrorMessage = nil } }
            ),
            actions: { Button("OK", role: .cancel) { camera.captureErrorMessage = nil } },
            message: { Text(camera.captureErrorMessage ?? "") }
        )
        // Captured-image review sheet.
        .fullScreenCover(item: reviewBinding) { review in
            CapturedImageReview(
                image: review.image,
                onUse: { useReviewedPhoto() },
                onRetake: { reviewImage = nil }
            )
        }
    }

    // MARK: - Review binding

    /// Wrap the optional review image in an Identifiable for `fullScreenCover(item:)`.
    private var reviewBinding: Binding<ReviewImage?> {
        Binding(
            get: { reviewImage.map { ReviewImage(image: $0) } },
            set: { if $0 == nil { reviewImage = nil } }
        )
    }

    // MARK: - Content states

    @ViewBuilder
    private var content: some View {
        switch camera.status {
        case .ready:
            cameraLiveView
        case .denied:
            permissionDenied
        case .unavailable:
            unavailableView
        case .failed(let message):
            failureView(message)
        case .unknown:
            ProgressView()
                .tint(.white)
                .controlSize(.large)
        }
    }

    // MARK: - Live camera

    private var cameraLiveView: some View {
        VStack(spacing: 0) {
            ZStack {
                CameraPreview(session: camera.session, controller: camera)
                    .ignoresSafeArea(edges: .horizontal)
                    .clipShape(RoundedRectangle(cornerRadius: 24, style: .continuous))
                    .padding(.horizontal, 8)
            }
            controls
        }
        .padding(.vertical, 12)
    }

    private var controls: some View {
        VStack(spacing: 18) {
            Toggle(isOn: $timerEnabled) {
                Label("3-second timer", systemImage: "timer")
                    .foregroundStyle(.white)
                    .font(.subheadline)
            }
            .tint(Theme.accent)
            .padding(.horizontal, 40)

            HStack {
                // Library import (no Photo Library permission required with PhotosPicker)
                PhotosPicker(selection: $pickerItem, matching: .images, photoLibrary: .shared()) {
                    Image(systemName: "photo.on.rectangle")
                        .font(.title2)
                        .foregroundStyle(.white)
                        .frame(width: 56, height: 56)
                        .background(.white.opacity(0.15), in: Circle())
                }
                .accessibilityLabel("Import from library")

                Spacer()

                Button(action: triggerCapture) {
                    ZStack {
                        Circle().stroke(.white, lineWidth: 4).frame(width: 74, height: 74)
                        Circle().fill(.white).frame(width: 60, height: 60)
                    }
                }
                .disabled(isCapturing || countdown != nil)
                .accessibilityLabel("Capture photo")

                Spacer()

                Button {
                    camera.switchCamera()
                } label: {
                    Image(systemName: "arrow.triangle.2.circlepath.camera")
                        .font(.title2)
                        .foregroundStyle(.white)
                        .frame(width: 56, height: 56)
                        .background(.white.opacity(0.15), in: Circle())
                }
                .accessibilityLabel("Switch camera")
            }
            .padding(.horizontal, 28)
        }
        .padding(.top, 20)
        .padding(.bottom, 8)
    }

    // MARK: - Non-ready states

    private var permissionDenied: some View {
        VStack(spacing: 18) {
            Image(systemName: "camera.metering.none")
                .font(.system(size: 52, weight: .light))
                .foregroundStyle(.white.opacity(0.85))
            Text("Camera Access Needed")
                .font(.title3.weight(.semibold))
                .foregroundStyle(.white)
            Text("Enable camera access in Settings to practice mindful photography in the app. You can still import from your library below.")
                .font(.subheadline)
                .foregroundStyle(.white.opacity(0.75))
                .multilineTextAlignment(.center)
            Button {
                if let url = URL(string: UIApplication.openSettingsURLString) {
                    UIApplication.shared.open(url)
                }
            } label: {
                Text("Open Settings").fontWeight(.semibold)
            }
            .buttonStyle(.borderedProminent)
            .tint(Theme.accent)

            libraryFallbackButton
        }
        .padding(32)
    }

    private var unavailableView: some View {
        VStack(spacing: 18) {
            Image(systemName: "camera.fill")
                .font(.system(size: 52, weight: .light))
                .foregroundStyle(.white.opacity(0.85))
            Text("No Camera Detected")
                .font(.title3.weight(.semibold))
                .foregroundStyle(.white)
            Text("This device (or the Simulator) has no camera. You can import a photo from your library instead.")
                .font(.subheadline)
                .foregroundStyle(.white.opacity(0.75))
                .multilineTextAlignment(.center)
            libraryFallbackButton
        }
        .padding(32)
    }

    private func failureView(_ message: String) -> some View {
        VStack(spacing: 18) {
            Image(systemName: "exclamationmark.triangle")
                .font(.system(size: 52, weight: .light))
                .foregroundStyle(.white.opacity(0.85))
            Text("Camera Unavailable")
                .font(.title3.weight(.semibold))
                .foregroundStyle(.white)
            Text(message)
                .font(.subheadline)
                .foregroundStyle(.white.opacity(0.75))
                .multilineTextAlignment(.center)
            libraryFallbackButton
        }
        .padding(32)
    }

    private var libraryFallbackButton: some View {
        // Uses the same `pickerItem` binding; change handling is consolidated
        // at the view root, so no per-button `onChange` is needed.
        PhotosPicker(selection: $pickerItem, matching: .images, photoLibrary: .shared()) {
            Label("Import from Library", systemImage: "photo.on.rectangle")
                .fontWeight(.semibold)
        }
        .buttonStyle(.bordered)
        .tint(.white)
    }

    private var savedToast: some View {
        VStack {
            Spacer()
            Label("Saved to Gallery", systemImage: "checkmark.circle.fill")
                .font(.subheadline.weight(.semibold))
                .padding(.horizontal, 18).padding(.vertical, 12)
                .background(.ultraThinMaterial, in: Capsule())
                .padding(.bottom, 120)
        }
        .transition(.move(edge: .bottom).combined(with: .opacity))
    }

    // MARK: - Actions

    private func triggerCapture() {
        if timerEnabled {
            runTimer()
        } else {
            Task { await performCapture() }
        }
    }

    private func runTimer() {
        timerTask?.cancel()
        countdown = 3
        timerTask = Task {
            for value in stride(from: 3, through: 1, by: -1) {
                if Task.isCancelled { await MainActor.run { countdown = nil } ; return }
                await MainActor.run { withAnimation { countdown = value } }
                try? await Task.sleep(nanoseconds: 1_000_000_000)
            }
            if Task.isCancelled { await MainActor.run { countdown = nil } ; return }
            await MainActor.run { withAnimation { countdown = nil } }
            await performCapture()
        }
    }

    private func performCapture() async {
        guard !isCapturing else { return }
        isCapturing = true
        defer { isCapturing = false }
        if let image = await camera.capturePhoto() {
            // Present review instead of persisting immediately.
            reviewSource = .camera
            reviewImage = image
        }
    }

    private func importPicked(_ item: PhotosPickerItem) async {
        if let data = try? await item.loadTransferable(type: Data.self),
           let image = UIImage(data: data) {
            reviewSource = .library
            reviewImage = image
        }
        pickerItem = nil
    }

    /// Persist the reviewed photo after the user taps "Use Photo".
    private func useReviewedPhoto() {
        guard let image = reviewImage else { return }
        store.addPhoto(image, pauseID: pause.id, source: reviewSource)
        reviewImage = nil
        flashSaved()
    }

    private func flashSaved() {
        withAnimation { showSavedToast = true }
        Task {
            try? await Task.sleep(nanoseconds: 1_600_000_000)
            await MainActor.run { withAnimation { showSavedToast = false } }
        }
    }
}

// MARK: - Review model + view

/// Identifiable wrapper so an optional UIImage can drive `fullScreenCover(item:)`.
private struct ReviewImage: Identifiable {
    let id = UUID()
    let image: UIImage
}

/// iOS-standard captured-image review with Use Photo / Retake.
private struct CapturedImageReview: View {
    let image: UIImage
    let onUse: () -> Void
    let onRetake: () -> Void
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        NavigationStack {
            ZStack {
                Color.black.ignoresSafeArea()
                VStack {
                    Spacer()
                    Image(uiImage: image)
                        .resizable()
                        .scaledToFit()
                    Spacer()
                    HStack {
                        Button {
                            dismiss()
                            onRetake()
                        } label: {
                            Label("Retake", systemImage: "arrow.counterclockwise")
                                .font(.headline)
                                .frame(maxWidth: .infinity)
                                .padding(.vertical, 6)
                        }
                        .buttonStyle(.bordered)
                        .tint(.white)

                        Button {
                            dismiss()
                            onUse()
                        } label: {
                            Label("Use Photo", systemImage: "checkmark")
                                .font(.headline)
                                .frame(maxWidth: .infinity)
                                .padding(.vertical, 6)
                        }
                        .buttonStyle(.borderedProminent)
                        .tint(Theme.accent)
                    }
                    .padding()
                }
            }
            .navigationTitle("Review")
            .navigationBarTitleDisplayMode(.inline)
            .toolbarColorScheme(.dark, for: .navigationBar)
        }
        .preferredColorScheme(.dark)
        .interactiveDismissDisabled(true)
    }
}
