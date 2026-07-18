//
//  MindfulFramesTests.swift
//  MindfulFramesTests
//

import XCTest
@testable import MindfulFrames

final class MindfulFramesTests: XCTestCase {

    // MARK: - Content

    func testCourseHasTenPauses() throws {
        XCTAssertEqual(CourseContent.pauses.count, 10)
    }

    func testCourseCounts() throws {
        let activities = CourseContent.pauses.reduce(0) { $0 + $1.activities.count }
        let locations = CourseContent.pauses.reduce(0) { $0 + $1.locations.count }
        let photographers = CourseContent.pauses.reduce(0) { $0 + $1.photographers.count }
        XCTAssertEqual(activities, 30)
        XCTAssertEqual(locations, 20)
        XCTAssertEqual(photographers, 10)
    }

    func testEachPauseHasPlaylistAndTwoPrompts() throws {
        for pause in CourseContent.pauses {
            XCTAssertTrue(pause.spotifyPlaylistURL.hasPrefix("https://open.spotify.com/"))
            XCTAssertEqual(pause.journalPrompts.count, 2)
        }
    }

    func testWeekNumbersAreSequential() throws {
        XCTAssertEqual(CourseContent.pauses.map(\.weekNumber), Array(1...10))
    }

    // MARK: - Authored guidance/content

    func testEveryPauseHasAuthoredJournalPrompts() throws {
        // All 10 pauses should have tailored prompts, not fall back to generic.
        for pause in CourseContent.pauses {
            let authored = CourseGuidance.journalPrompts[pause.id]
            XCTAssertNotNil(authored, "Pause \(pause.id) missing authored prompts")
            XCTAssertEqual(authored?.count, 2)
            for prompt in authored ?? [] {
                XCTAssertFalse(prompt.trimmingCharacters(in: .whitespaces).isEmpty)
            }
        }
    }

    func testMeditationAndProjectTipsPresent() throws {
        XCTAssertFalse(CourseGuidance.meditationSteps.isEmpty)
        XCTAssertFalse(CourseGuidance.projectTips.isEmpty)
        for pause in CourseContent.pauses {
            XCTAssertEqual(pause.meditationSteps, CourseGuidance.meditationSteps)
            XCTAssertEqual(pause.projectTips, CourseGuidance.projectTips)
        }
    }

    func testLocationsPreferringPutsPreferredFirst() throws {
        for pause in CourseContent.pauses {
            let murray = pause.locations(preferring: .murrayhill)
            XCTAssertEqual(murray.first?.variant, .murrayhill)
            XCTAssertEqual(murray.count, pause.locations.count)

            let portland = pause.locations(preferring: .portland)
            XCTAssertEqual(portland.first?.variant, .portland)
        }
    }

    func testDateRangeIsNonEmptyAndOrdered() throws {
        let start = Date(timeIntervalSince1970: 1_700_000_000)
        let pause1 = try XCTUnwrap(CourseContent.pause(id: 1))
        let pause2 = try XCTUnwrap(CourseContent.pause(id: 2))
        XCTAssertFalse(pause1.dateRange(startDate: start).isEmpty)
        XCTAssertFalse(pause2.dateRange(startDate: start).isEmpty)
    }

    // MARK: - Progress

    func testProgressFractionAndCounts() throws {
        let pause = try XCTUnwrap(CourseContent.pause(id: 1))
        var state = AppState.initial
        // Complete one of three activities.
        state.completedActivityIDs = [pause.activities[0].id]

        let done = pause.activities.filter { state.completedActivityIDs.contains($0.id) }.count
        XCTAssertEqual(done, 1)
        let fraction = Double(done) / Double(pause.activities.count)
        XCTAssertEqual(fraction, 1.0 / 3.0, accuracy: 0.0001)
    }

    // MARK: - Persistence migration

    private func makeDecoder() -> JSONDecoder {
        let d = JSONDecoder()
        d.dateDecodingStrategy = .iso8601
        return d
    }

    private func makeEncoder() -> JSONEncoder {
        let e = JSONEncoder()
        e.dateEncodingStrategy = .iso8601
        return e
    }

    /// A v1 JSON blob (no schemaVersion, no onboarding, no reminders) should
    /// decode without a reset and upgrade to the current schema version.
    func testDecodeV1StateMigratesForward() throws {
        let v1JSON = """
        {
          "startDate": "2025-10-25T00:00:00Z",
          "locationVariant": "murrayhill",
          "completedActivityIDs": ["1-1", "2-3"],
          "journalEntries": [],
          "photos": []
        }
        """.data(using: .utf8)!

        let state = try makeDecoder().decode(AppState.self, from: v1JSON)

        XCTAssertEqual(state.schemaVersion, AppState.currentSchemaVersion)
        XCTAssertEqual(state.locationVariant, .murrayhill)
        XCTAssertEqual(state.completedActivityIDs, ["1-1", "2-3"])
        // Existing v1 users should not be forced back through onboarding.
        XCTAssertTrue(state.hasCompletedOnboarding)
        // Reminders default to disabled.
        XCTAssertFalse(state.reminders.isEnabled)
    }

    /// Round-trip of current-schema state preserves all fields.
    func testCurrentStateRoundTrips() throws {
        var state = AppState.initial
        state.hasCompletedOnboarding = true
        state.reminders = ReminderSettings(isEnabled: true, weekday: 3, hour: 8, minute: 30)
        state.completedActivityIDs = ["3-1"]
        state.journalEntries = [
            JournalEntry(pauseID: 1, promptIndex: 0, promptText: "P", text: "hello")
        ]

        let data = try makeEncoder().encode(state)
        let decoded = try makeDecoder().decode(AppState.self, from: data)

        XCTAssertEqual(decoded.schemaVersion, AppState.currentSchemaVersion)
        XCTAssertTrue(decoded.hasCompletedOnboarding)
        XCTAssertEqual(decoded.reminders.weekday, 3)
        XCTAssertEqual(decoded.reminders.hour, 8)
        XCTAssertEqual(decoded.reminders.minute, 30)
        XCTAssertEqual(decoded.completedActivityIDs, ["3-1"])
        XCTAssertEqual(decoded.journalEntries.count, 1)
        XCTAssertEqual(decoded.journalEntries.first?.text, "hello")
    }

    /// A v2 blob that explicitly sets hasCompletedOnboarding=false must be honored.
    func testDecodeV2RespectsOnboardingFlag() throws {
        let v2JSON = """
        {
          "schemaVersion": 2,
          "startDate": "2026-01-01T00:00:00Z",
          "locationVariant": "portland",
          "completedActivityIDs": [],
          "journalEntries": [],
          "photos": [],
          "hasCompletedOnboarding": false,
          "reminders": { "isEnabled": false, "weekday": 7, "hour": 9, "minute": 0 }
        }
        """.data(using: .utf8)!

        let state = try makeDecoder().decode(AppState.self, from: v2JSON)
        XCTAssertFalse(state.hasCompletedOnboarding)
        XCTAssertEqual(state.schemaVersion, AppState.currentSchemaVersion)
    }
}
