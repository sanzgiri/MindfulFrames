//
//  AppStore.swift
//  MindfulFrames
//
//  Local-first observable store. Persists AppState as JSON on disk and photo
//  bytes via PhotoStorage. No backend, no auth, no CloudKit.
//

import Foundation
import Combine
import SwiftUI
import UIKit
import os

@MainActor
final class AppStore: ObservableObject {

    @Published private(set) var state: AppState {
        didSet { scheduleSave() }
    }

    /// Set when the most recent decode failed so the UI could, if desired,
    /// warn the user rather than silently continuing on a fresh state.
    @Published private(set) var didFailToLoad = false

    private let stateURL: URL
    private var saveWorkItem: DispatchWorkItem?
    private let log = Logger(subsystem: "com.sanzgiri.mindfulframes", category: "AppStore")

    // MARK: - Init / Persistence

    init() {
        let base = FileManager.default.urls(for: .applicationSupportDirectory, in: .userDomainMask).first
            ?? FileManager.default.temporaryDirectory
        let dir = base.appendingPathComponent("MindfulFrames", isDirectory: true)
        if !FileManager.default.fileExists(atPath: dir.path) {
            try? FileManager.default.createDirectory(at: dir, withIntermediateDirectories: true)
        }
        self.stateURL = dir.appendingPathComponent("app-state.json")

        // Load with explicit, logged error handling. We only fall back to a
        // fresh state when there is genuinely no file; a decode error keeps a
        // backup so the user's data is never silently discarded.
        if FileManager.default.fileExists(atPath: stateURL.path) {
            do {
                let data = try Data(contentsOf: stateURL)
                self.state = try Self.decoder.decode(AppState.self, from: data)
            } catch {
                log.error("Failed to decode app state: \(error.localizedDescription, privacy: .public)")
                // Preserve the unreadable file for recovery instead of overwriting.
                Self.backupCorruptFile(at: stateURL, log: log)
                self.state = .initial
                self.didFailToLoad = true
            }
        } else {
            self.state = .initial
        }

        applyFileProtection(to: stateURL)
        reconcilePhotos()
    }

    private static let decoder: JSONDecoder = {
        let d = JSONDecoder()
        d.dateDecodingStrategy = .iso8601
        return d
    }()

    private static let encoder: JSONEncoder = {
        let e = JSONEncoder()
        e.dateEncodingStrategy = .iso8601
        e.outputFormatting = [.prettyPrinted, .sortedKeys]
        return e
    }()

    private static func backupCorruptFile(at url: URL, log: Logger) {
        let backup = url.deletingLastPathComponent()
            .appendingPathComponent("app-state.corrupt-\(Int(Date().timeIntervalSince1970)).json")
        do {
            try FileManager.default.copyItem(at: url, to: backup)
            log.notice("Backed up unreadable state to \(backup.lastPathComponent, privacy: .public)")
        } catch {
            log.error("Failed to back up corrupt state: \(error.localizedDescription, privacy: .public)")
        }
    }

    /// Debounced write to avoid churning disk on rapid edits.
    private func scheduleSave() {
        saveWorkItem?.cancel()
        let snapshot = state
        let url = stateURL
        let work = DispatchWorkItem {
            Self.write(snapshot, to: url)
        }
        saveWorkItem = work
        DispatchQueue.global(qos: .utility).asyncAfter(deadline: .now() + 0.4, execute: work)
    }

    /// Write the state to disk with file protection and error logging.
    private static func write(_ snapshot: AppState, to url: URL) {
        do {
            let data = try encoder.encode(snapshot)
            try data.write(to: url, options: [.atomic, .completeFileProtectionUntilFirstUserAuthentication])
        } catch {
            Logger(subsystem: "com.sanzgiri.mindfulframes", category: "AppStore")
                .error("Failed to write app state: \(error.localizedDescription, privacy: .public)")
        }
    }

    /// Force an immediate synchronous write, cancelling any pending debounce.
    /// Call from scene phase `.inactive` / `.background` so nothing is lost if
    /// the app is suspended or terminated.
    func flush() {
        saveWorkItem?.cancel()
        saveWorkItem = nil
        Self.write(state, to: stateURL)
    }

    private func applyFileProtection(to url: URL) {
        guard FileManager.default.fileExists(atPath: url.path) else { return }
        do {
            try FileManager.default.setAttributes(
                [.protectionKey: FileProtectionType.completeUntilFirstUserAuthentication],
                ofItemAtPath: url.path
            )
        } catch {
            log.error("Failed to set state file protection: \(error.localizedDescription, privacy: .public)")
        }
    }

    // MARK: - Launch-time reconciliation

    /// Reconcile metadata with files on disk:
    /// - Drop metadata whose backing image file is missing (safe: nothing to show).
    /// - Delete orphaned image files no longer referenced by any metadata.
    private func reconcilePhotos() {
        let onDisk = PhotoStorage.existingFileNames()
        let referenced = Set(state.photos.map(\.fileName))

        // Remove metadata for missing files.
        let missing = state.photos.filter { !onDisk.contains($0.fileName) }
        if !missing.isEmpty {
            log.notice("Reconcile: dropping \(missing.count) photo(s) with missing files")
            state.photos.removeAll { !onDisk.contains($0.fileName) }
        }

        // Delete orphaned files.
        let orphans = onDisk.subtracting(referenced)
        if !orphans.isEmpty {
            log.notice("Reconcile: deleting \(orphans.count) orphaned image file(s)")
            PhotoStorage.deleteOrphans(keeping: referenced)
        }
    }

    // MARK: - Onboarding

    var hasCompletedOnboarding: Bool {
        state.hasCompletedOnboarding
    }

    /// Finish onboarding, persisting the chosen start date and location.
    func completeOnboarding(startDate: Date, locationVariant: LocationVariant) {
        state.startDate = startDate
        state.locationVariant = locationVariant
        state.hasCompletedOnboarding = true
        flush()
    }

    // MARK: - Reminders

    var reminders: ReminderSettings {
        get { state.reminders }
        set { state.reminders = newValue }
    }

    // MARK: - Settings

    var startDate: Date {
        get { state.startDate }
        set { state.startDate = newValue }
    }

    var locationVariant: LocationVariant {
        get { state.locationVariant }
        set { state.locationVariant = newValue }
    }

    // MARK: - Journey Progress

    /// The current week (1...10) computed from the start date, clamped.
    var currentWeek: Int {
        let days = Calendar.current.dateComponents([.day], from: Calendar.current.startOfDay(for: state.startDate), to: Date()).day ?? 0
        let week = (days / 7) + 1
        return min(max(week, 1), CourseContent.totalWeeks)
    }

    var currentPause: Pause? {
        CourseContent.pause(id: currentWeek)
    }

    func isCompleted(_ activityID: String) -> Bool {
        state.completedActivityIDs.contains(activityID)
    }

    func setCompleted(_ activityID: String, _ completed: Bool) {
        if completed {
            state.completedActivityIDs.insert(activityID)
        } else {
            state.completedActivityIDs.remove(activityID)
        }
    }

    func toggle(_ activityID: String) {
        setCompleted(activityID, !isCompleted(activityID))
    }

    /// Fraction (0...1) of activities completed within a pause.
    func progress(for pause: Pause) -> Double {
        guard !pause.activities.isEmpty else { return 0 }
        let done = pause.activities.filter { isCompleted($0.id) }.count
        return Double(done) / Double(pause.activities.count)
    }

    func completedCount(for pause: Pause) -> Int {
        pause.activities.filter { isCompleted($0.id) }.count
    }

    /// Overall fraction (0...1) across all pauses.
    var overallProgress: Double {
        let total = CourseContent.totalActivities
        guard total > 0 else { return 0 }
        return Double(state.completedActivityIDs.count) / Double(total)
    }

    var completedPauseCount: Int {
        CourseContent.pauses.filter { progress(for: $0) >= 1.0 }.count
    }

    // MARK: - Journal

    func entries(for pauseID: Int) -> [JournalEntry] {
        state.journalEntries
            .filter { $0.pauseID == pauseID }
            .sorted { $0.updatedAt > $1.updatedAt }
    }

    var allEntriesSorted: [JournalEntry] {
        state.journalEntries.sorted { $0.updatedAt > $1.updatedAt }
    }

    /// Existing saved entry for a specific prompt, if any.
    func entry(pauseID: Int, promptIndex: Int) -> JournalEntry? {
        state.journalEntries.first { $0.pauseID == pauseID && $0.promptIndex == promptIndex }
    }

    /// Upsert a prompt-based journal entry. Empty text removes the entry.
    func saveJournal(pauseID: Int, promptIndex: Int, promptText: String, text: String) {
        let trimmed = text.trimmingCharacters(in: .whitespacesAndNewlines)
        if let idx = state.journalEntries.firstIndex(where: { $0.pauseID == pauseID && $0.promptIndex == promptIndex }) {
            if trimmed.isEmpty {
                state.journalEntries.remove(at: idx)
            } else {
                state.journalEntries[idx].text = text
                state.journalEntries[idx].promptText = promptText
                state.journalEntries[idx].updatedAt = Date()
            }
        } else if !trimmed.isEmpty {
            let entry = JournalEntry(pauseID: pauseID, promptIndex: promptIndex, promptText: promptText, text: text)
            state.journalEntries.append(entry)
        }
    }

    func deleteJournal(_ entry: JournalEntry) {
        state.journalEntries.removeAll { $0.id == entry.id }
    }

    // MARK: - Photos

    func photos(for pauseID: Int) -> [PhotoMeta] {
        state.photos
            .filter { $0.pauseID == pauseID }
            .sorted { $0.createdAt > $1.createdAt }
    }

    var allPhotosSorted: [PhotoMeta] {
        state.photos.sorted { $0.createdAt > $1.createdAt }
    }

    var photoCount: Int { state.photos.count }

    /// Save image bytes and register metadata against a pause.
    @discardableResult
    func addPhoto(_ image: UIImage, pauseID: Int, source: PhotoSource) -> PhotoMeta? {
        do {
            let fileName = try PhotoStorage.save(image)
            let meta = PhotoMeta(pauseID: pauseID, fileName: fileName, source: source)
            state.photos.append(meta)
            return meta
        } catch {
            log.error("Failed to save photo: \(error.localizedDescription, privacy: .public)")
            return nil
        }
    }

    func updateCaption(_ caption: String, for photoID: UUID) {
        guard let idx = state.photos.firstIndex(where: { $0.id == photoID }) else { return }
        state.photos[idx].caption = caption
    }

    func deletePhoto(_ meta: PhotoMeta) {
        PhotoStorage.delete(fileName: meta.fileName)
        state.photos.removeAll { $0.id == meta.id }
    }

    // MARK: - Reset (Settings)

    func resetProgress() {
        for meta in state.photos { PhotoStorage.delete(fileName: meta.fileName) }
        state.completedActivityIDs = []
        state.journalEntries = []
        state.photos = []
        flush()
    }
}
