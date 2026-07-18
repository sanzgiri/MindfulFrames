//
//  ContentModels.swift
//  MindfulFrames
//
//  Authored course content models (ported from server/seed.ts).
//

import Foundation
import SwiftUI

// MARK: - Activity

enum ActivityType: String, Codable, CaseIterable, Sendable {
    case meditation
    case project
    case microPractice = "micro-practice"

    var displayName: String {
        switch self {
        case .meditation: return "Meditation"
        case .project: return "Weekly Project"
        case .microPractice: return "Micro-Practice"
        }
    }

    var symbolName: String {
        switch self {
        case .meditation: return "figure.mind.and.body"
        case .project: return "camera.aperture"
        case .microPractice: return "sparkles"
        }
    }
}

struct Activity: Identifiable, Codable, Hashable, Sendable {
    let id: String
    let title: String
    let description: String
    let duration: String
    let type: ActivityType
    let orderIndex: Int
}

// MARK: - Location

enum LocationVariant: String, Codable, CaseIterable, Sendable {
    case portland
    case murrayhill

    var displayName: String {
        switch self {
        case .portland: return "Portland"
        case .murrayhill: return "Murray Hill / Beaverton"
        }
    }

    var shortName: String {
        switch self {
        case .portland: return "Portland"
        case .murrayhill: return "Murray Hill"
        }
    }
}

struct CourseLocation: Identifiable, Codable, Hashable, Sendable {
    let id: String
    let name: String
    let description: String
    let address: String
    let variant: LocationVariant
}

// MARK: - Photographer

struct Photographer: Identifiable, Codable, Hashable, Sendable {
    let id: String
    let name: String
    let description: String
    let externalLink: String
    let sampleImages: [String]
}

// MARK: - Pause

struct Pause: Identifiable, Codable, Hashable, Sendable {
    let id: Int
    let weekNumber: Int
    let title: String
    let theme: String
    let description: String
    let spotifyPlaylistURL: String
    let spotifyDescription: String
    let activities: [Activity]
    let locations: [CourseLocation]
    let photographers: [Photographer]

    /// Tailored, authored journal prompts grounded in the course guide.
    /// Falls back to theme-derived prompts if a week has none authored.
    var journalPrompts: [String] {
        if let authored = CourseGuidance.journalPrompts[id], !authored.isEmpty {
            return authored
        }
        return [
            "As you practiced \"\(title)\" this week, what did you notice in yourself that you hadn't seen before?",
            "How did the theme of \(theme.lowercased()) show up in the images you made?"
        ]
    }

    /// Concise, generic meditation practice steps (ported from the web app's
    /// PauseDetail practice guide).
    var meditationSteps: [String] {
        CourseGuidance.meditationSteps
    }

    /// Concise photography project tips (ported from the web app's PauseDetail
    /// practice guide).
    var projectTips: [String] {
        CourseGuidance.projectTips
    }

    func location(for variant: LocationVariant) -> CourseLocation? {
        locations.first { $0.variant == variant }
    }

    /// All locations ordered so the user's preferred variant appears first.
    func locations(preferring variant: LocationVariant) -> [CourseLocation] {
        locations.sorted { lhs, _ in lhs.variant == variant }
    }

    /// The inclusive date range for this week relative to a journey start date.
    func dateRange(startDate: Date, calendar: Calendar = .current) -> String {
        let start = calendar.startOfDay(for: startDate)
        guard let weekStart = calendar.date(byAdding: .day, value: (weekNumber - 1) * 7, to: start),
              let weekEnd = calendar.date(byAdding: .day, value: 6, to: weekStart) else {
            return ""
        }
        let df = DateFormatter()
        df.calendar = calendar
        df.locale = Locale.current
        df.setLocalizedDateFormatFromTemplate("MMMd")

        let yearDF = DateFormatter()
        yearDF.calendar = calendar
        yearDF.locale = Locale.current
        yearDF.setLocalizedDateFormatFromTemplate("MMMdyyyy")

        // Show the year on the end date for clarity.
        return "\(df.string(from: weekStart)) – \(yearDF.string(from: weekEnd))"
    }
}

// MARK: - Course Guidance (ported from web PauseDetail)

/// Generic practice guidance shared across pauses, plus per-pause authored
/// journal prompts grounded in docs/photo-mindfulness-course.md.
enum CourseGuidance {

    /// Concise meditation "How to practice" steps (from the web app).
    static let meditationSteps: [String] = [
        "Find a quiet space where you won't be disturbed.",
        "Sit comfortably with your spine upright but relaxed.",
        "Set a timer for the recommended duration.",
        "Begin the practice as described, returning to the focus point whenever your mind wanders.",
        "When the timer sounds, take a moment to notice how you feel before ending."
    ]

    /// Concise photography project tips (from the web app).
    static let projectTips: [String] = [
        "Take your time — this is about seeing, not just shooting.",
        "Experiment with different times of day and lighting conditions.",
        "Review your photos each evening and notice what draws your eye.",
        "Don't judge your work — this is a practice, not a performance."
    ]

    /// Two tailored, authored journal prompts per pause, grounded in the
    /// reflection questions of docs/photo-mindfulness-course.md.
    static let journalPrompts: [Int: [String]] = [
        1: [
            "You spent time really looking at one ordinary object before photographing it. Which image surprised you, and what did you finally notice that you'd walked past a hundred times?",
            "As you practiced seeing with beginner's eyes this week, what shifted in how present you felt in your everyday surroundings?"
        ],
        2: [
            "You paused for a few conscious breaths before each frame. How did syncing your breath to your seeing change the emotional quality of the light you captured?",
            "Returning to one place across changing light and weather, what did the shifting conditions reveal that a single visit never could?"
        ],
        3: [
            "This week your body was the landscape. Where did you notice tension, and where ease — and how did that awareness show up in the frames you chose?",
            "As you photographed details of yourself or your surroundings, what did your body seem to want to tell you in this season?"
        ],
        4: [
            "You matched textures to feelings this week. Looking back at what attracted your lens, what patterns do you see in the emotions you were drawn to photograph?",
            "Choose one strong emotion you felt. If it had a texture, temperature, and color, which of your images comes closest to holding it?"
        ],
        5: [
            "You practiced photographing emptiness and silence. What did the empty spaces tell you — and what, if anything, filled them as you looked?",
            "Where did resting in the gaps between thoughts, and the space between subjects, leave you feeling more spacious this week?"
        ],
        6: [
            "Walking at half your usual pace with a camera, what became visible that speed normally conceals?",
            "Which three things did you photograph that you have walked past countless times but never truly seen until now?"
        ],
        7: [
            "You documented something changing day by day. What did watching that transformation teach you about letting go?",
            "Where did you notice impermanence in yourself this week — in mood, attention, or how you saw — and how did you meet it?"
        ],
        8: [
            "You looked for evidence of connection and belonging. How are you held by the web of community and nature around you?",
            "Before photographing, you acknowledged 'I am connected to this.' How did that intention change what and how you saw?"
        ],
        9: [
            "You explored strong light and deep shadow, inside and out. Which parts of yourself do you keep in shadow, and which do you shine light on?",
            "As you photographed your dualities, where did you find you could accept the whole picture — both the light and the dark?"
        ],
        10: [
            "Looking back across all ten pauses, what themes keep returning in your images, and what do they say about how you uniquely see?",
            "Write a few lines of your own photographer's statement: who are you as a seer now, and what vision do you carry forward?"
        ]
    ]
}
