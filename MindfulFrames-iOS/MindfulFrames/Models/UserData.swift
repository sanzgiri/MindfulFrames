//
//  UserData.swift
//  MindfulFrames
//
//  Codable user-generated data persisted locally (file-based JSON).
//

import Foundation

// MARK: - Journal Entry

struct JournalEntry: Identifiable, Codable, Hashable, Sendable {
    var id: UUID = UUID()
    var pauseID: Int
    /// Index of the prompt within the pause (0 or 1); nil for a free-form note.
    var promptIndex: Int?
    var promptText: String
    var text: String
    var createdAt: Date = Date()
    var updatedAt: Date = Date()
}

// MARK: - Captured Photo

enum PhotoSource: String, Codable, Sendable {
    case camera
    case library
}

/// Metadata for a photo captured or imported for a pause. The image bytes are
/// stored on disk (Application Support) referenced by `fileName`.
struct PhotoMeta: Identifiable, Codable, Hashable, Sendable {
    var id: UUID = UUID()
    var pauseID: Int
    var fileName: String
    var source: PhotoSource
    var caption: String = ""
    var createdAt: Date = Date()
}

// MARK: - Reminder Settings

/// User preferences for optional weekly local notifications.
struct ReminderSettings: Codable, Hashable, Sendable {
    var isEnabled: Bool = false
    /// Weekday (1 = Sunday ... 7 = Saturday), matching `Calendar` conventions.
    var weekday: Int = 7          // Saturday, matching the course's weekend cadence
    var hour: Int = 9
    var minute: Int = 0

    static let `default` = ReminderSettings()
}

// MARK: - Persisted App State

/// Everything the app persists between launches. Encoded to a single JSON file.
///
/// `schemaVersion` enables backward-compatible migrations. When new fields are
/// added they must be optional in `init(from:)` or defaulted so that state
/// written by older builds continues to decode without a silent reset.
struct AppState: Codable, Sendable {
    /// Current on-disk schema version. Bump when the shape changes in a way
    /// that requires migration logic in `init(from:)`.
    static let currentSchemaVersion = 2

    var schemaVersion: Int
    var startDate: Date
    var locationVariant: LocationVariant
    var completedActivityIDs: Set<String>
    var journalEntries: [JournalEntry]
    var photos: [PhotoMeta]

    // Added in schema v2 — must decode with a default for v1 data.
    var hasCompletedOnboarding: Bool
    var reminders: ReminderSettings

    static var initial: AppState {
        AppState(
            schemaVersion: currentSchemaVersion,
            startDate: Date(),
            locationVariant: .portland,
            completedActivityIDs: [],
            journalEntries: [],
            photos: [],
            hasCompletedOnboarding: false,
            reminders: .default
        )
    }

    enum CodingKeys: String, CodingKey {
        case schemaVersion
        case startDate
        case locationVariant
        case completedActivityIDs
        case journalEntries
        case photos
        case hasCompletedOnboarding
        case reminders
    }

    init(
        schemaVersion: Int,
        startDate: Date,
        locationVariant: LocationVariant,
        completedActivityIDs: Set<String>,
        journalEntries: [JournalEntry],
        photos: [PhotoMeta],
        hasCompletedOnboarding: Bool,
        reminders: ReminderSettings
    ) {
        self.schemaVersion = schemaVersion
        self.startDate = startDate
        self.locationVariant = locationVariant
        self.completedActivityIDs = completedActivityIDs
        self.journalEntries = journalEntries
        self.photos = photos
        self.hasCompletedOnboarding = hasCompletedOnboarding
        self.reminders = reminders
    }

    /// Backward-compatible decoding. Any field introduced after v1 is decoded
    /// with `decodeIfPresent` and a sensible default so that older on-disk
    /// state upgrades in place rather than triggering a full reset.
    init(from decoder: Decoder) throws {
        let c = try decoder.container(keyedBy: CodingKeys.self)

        // v1 files have no schemaVersion key.
        self.schemaVersion = try c.decodeIfPresent(Int.self, forKey: .schemaVersion) ?? 1

        // Core fields exist in every version; keep them required so genuinely
        // corrupt data still surfaces as a decode error the store can log.
        self.startDate = try c.decode(Date.self, forKey: .startDate)
        self.locationVariant = try c.decode(LocationVariant.self, forKey: .locationVariant)
        self.completedActivityIDs = try c.decode(Set<String>.self, forKey: .completedActivityIDs)
        self.journalEntries = try c.decode([JournalEntry].self, forKey: .journalEntries)
        self.photos = try c.decode([PhotoMeta].self, forKey: .photos)

        // Fields added in v2 — default for older data.
        //
        // For migrated v1 users we assume onboarding is already "done" so we do
        // not interrupt an existing journey with a first-launch flow.
        let decodedVersion = self.schemaVersion
        self.hasCompletedOnboarding = try c.decodeIfPresent(Bool.self, forKey: .hasCompletedOnboarding)
            ?? (decodedVersion < 2)
        self.reminders = try c.decodeIfPresent(ReminderSettings.self, forKey: .reminders) ?? .default

        // Stamp forward to the current version after successful migration.
        self.schemaVersion = AppState.currentSchemaVersion
    }
}
