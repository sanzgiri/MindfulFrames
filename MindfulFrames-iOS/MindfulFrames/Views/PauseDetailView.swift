//
//  PauseDetailView.swift
//  MindfulFrames
//
//  A single pause: overview + activity checklist, photography practice with
//  camera entry, resources (map / photographer / Spotify), and journal.
//

import SwiftUI

struct PauseDetailView: View {
    let pause: Pause
    @EnvironmentObject private var store: AppStore
    @State private var showCamera = false

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 24) {
                overview
                activitiesSection
                guidanceSection
                photographySection
                resourcesSection
                JournalSection(pause: pause)
            }
            .padding(.horizontal, 16)
            .padding(.bottom, 40)
        }
        .background(Theme.canvas)
        .navigationTitle("Pause \(pause.weekNumber)")
        .navigationBarTitleDisplayMode(.inline)
        .fullScreenCover(isPresented: $showCamera) {
            CameraCaptureView(pause: pause)
        }
    }

    // MARK: - Overview

    private var overview: some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack {
                VStack(alignment: .leading, spacing: 4) {
                    Text(pause.title)
                        .font(.largeTitle.weight(.bold))
                    Text(pause.theme)
                        .font(.headline)
                        .foregroundStyle(Theme.hue(for: pause.weekNumber))
                    Text(pause.dateRange(startDate: store.startDate))
                        .font(.caption.weight(.medium))
                        .foregroundStyle(.tertiary)
                }
                Spacer()
                ProgressRing(progress: store.progress(for: pause), lineWidth: 7)
                    .frame(width: 48, height: 48)
            }
            Text(pause.description)
                .font(.body)
                .foregroundStyle(.secondary)
        }
        .padding(.top, 8)
    }

    // MARK: - Activities

    private var activitiesSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            SectionHeader(title: "This Week's Practice", symbol: "checklist")
            VStack(spacing: 0) {
                ForEach(Array(pause.activities.enumerated()), id: \.element.id) { index, activity in
                    ActivityRow(activity: activity,
                                isDone: store.isCompleted(activity.id)) {
                        withAnimation(.snappy) { store.toggle(activity.id) }
                    }
                    if index < pause.activities.count - 1 {
                        Divider().padding(.leading, 44)
                    }
                }
            }
            .mindfulCard()
        }
    }

    // MARK: - Practice Guidance (meditation steps + project tips)

    private var guidanceSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            SectionHeader(title: "Practice Guide", symbol: "figure.mind.and.body")

            // Meditation — show the concise generic "how to practice" steps
            // alongside any meditation activities in this pause.
            let meditations = pause.activities.filter { $0.type == .meditation }
            if !meditations.isEmpty {
                VStack(alignment: .leading, spacing: 10) {
                    Text("Mindfulness Practice")
                        .font(.headline)
                    ForEach(meditations) { activity in
                        Text(activity.title)
                            .font(.subheadline.weight(.semibold))
                        if !activity.duration.isEmpty {
                            Text("Duration: \(activity.duration)")
                                .font(.caption)
                                .foregroundStyle(.secondary)
                        }
                    }
                    Text("How to practice:")
                        .font(.subheadline.weight(.medium))
                        .padding(.top, 2)
                    ForEach(Array(pause.meditationSteps.enumerated()), id: \.offset) { index, step in
                        HStack(alignment: .top, spacing: 8) {
                            Text("\(index + 1).")
                                .font(.subheadline.weight(.semibold))
                                .foregroundStyle(Theme.accent)
                            Text(step)
                                .font(.subheadline)
                                .foregroundStyle(.secondary)
                        }
                    }
                }
                .frame(maxWidth: .infinity, alignment: .leading)
                .mindfulCard()
            }

            // Photography project tips.
            let projects = pause.activities.filter { $0.type == .project }
            if !projects.isEmpty {
                VStack(alignment: .leading, spacing: 10) {
                    Text("Photography Project")
                        .font(.headline)
                    ForEach(projects) { activity in
                        Text(activity.title)
                            .font(.subheadline.weight(.semibold))
                        Text(activity.description)
                            .font(.subheadline)
                            .foregroundStyle(.secondary)
                    }
                    Text("Tips for this project:")
                        .font(.subheadline.weight(.medium))
                        .padding(.top, 2)
                    ForEach(pause.projectTips, id: \.self) { tip in
                        HStack(alignment: .top, spacing: 8) {
                            Image(systemName: "circle.fill")
                                .font(.system(size: 5))
                                .foregroundStyle(Theme.accent)
                                .padding(.top, 6)
                            Text(tip)
                                .font(.subheadline)
                                .foregroundStyle(.secondary)
                        }
                    }
                }
                .frame(maxWidth: .infinity, alignment: .leading)
                .mindfulCard()
            }
        }
    }

    // MARK: - Photography Practice

    private var photographySection: some View {
        VStack(alignment: .leading, spacing: 12) {
            SectionHeader(title: "Photography Practice", symbol: "camera.aperture")
            VStack(alignment: .leading, spacing: 14) {
                Text("Bring your mindful attention to the lens. Capture what this week's theme reveals to you.")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)

                Button {
                    showCamera = true
                } label: {
                    Label("Open Camera", systemImage: "camera.fill")
                        .font(.headline)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 4)
                }
                .buttonStyle(.borderedProminent)
                .tint(Theme.accent)

                let photos = store.photos(for: pause.id)
                if photos.isEmpty {
                    Text("No photos yet for this pause.")
                        .font(.footnote)
                        .foregroundStyle(.tertiary)
                } else {
                    ScrollView(.horizontal, showsIndicators: false) {
                        HStack(spacing: 10) {
                            ForEach(photos.prefix(12)) { meta in
                                PhotoFileImage(fileName: meta.fileName, displayPoints: 84)
                                    .frame(width: 84, height: 84)
                                    .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
                            }
                        }
                    }
                    Text("\(photos.count) photo\(photos.count == 1 ? "" : "s") · view all in Gallery")
                        .font(.caption)
                        .foregroundStyle(.tertiary)
                }
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            .mindfulCard()
        }
    }

    // MARK: - Resources

    private var resourcesSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            SectionHeader(title: "Resources", symbol: "map")

            // Show both location variants, preferred first.
            ForEach(pause.locations(preferring: store.locationVariant)) { location in
                LocationCard(location: location,
                             isPreferred: location.variant == store.locationVariant)
            }
            ForEach(pause.photographers) { photographer in
                PhotographerCard(photographer: photographer)
            }
            PlaylistCard(url: pause.spotifyPlaylistURL, description: pause.spotifyDescription)
        }
    }
}

// MARK: - Activity Row

struct ActivityRow: View {
    let activity: Activity
    let isDone: Bool
    let toggle: () -> Void

    var body: some View {
        Button(action: toggle) {
            HStack(alignment: .top, spacing: 12) {
                Image(systemName: isDone ? "checkmark.circle.fill" : "circle")
                    .font(.title2)
                    .foregroundStyle(isDone ? Theme.accent : Color.secondary)
                    .symbolEffect(.bounce, value: isDone)
                VStack(alignment: .leading, spacing: 5) {
                    HStack {
                        Text(activity.title)
                            .font(.headline)
                            .foregroundStyle(.primary)
                            .strikethrough(isDone, color: .secondary)
                        Spacer()
                    }
                    Text(activity.description)
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                    HStack(spacing: 8) {
                        TypePill(type: activity.type)
                        Label(activity.duration, systemImage: "clock")
                            .font(.caption)
                            .foregroundStyle(.tertiary)
                    }
                    .padding(.top, 2)
                }
            }
            .padding(.vertical, 12)
        }
        .buttonStyle(.plain)
        .accessibilityLabel("\(activity.title), \(activity.type.displayName), \(activity.duration)")
        .accessibilityValue(isDone ? "Completed" : "Not completed")
        .accessibilityAddTraits(.isButton)
    }
}

// MARK: - Location Card

struct LocationCard: View {
    let location: CourseLocation
    var isPreferred: Bool = false
    @Environment(\.openURL) private var openURL

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack(spacing: 8) {
                Label(location.variant.shortName, systemImage: "mappin.circle.fill")
                    .font(.caption.weight(.semibold))
                    .foregroundStyle(Theme.secondaryAccent)
                if isPreferred {
                    Text("Your Guide")
                        .font(.caption2.weight(.bold))
                        .padding(.horizontal, 7).padding(.vertical, 3)
                        .background(Theme.accent, in: Capsule())
                        .foregroundStyle(.white)
                }
            }
            Text(location.name).font(.headline)
            Text(location.description)
                .font(.subheadline)
                .foregroundStyle(.secondary)
            Text(location.address)
                .font(.caption)
                .foregroundStyle(.tertiary)
            Button {
                openMaps()
            } label: {
                Label("Get Directions", systemImage: "arrow.triangle.turn.up.right.diamond.fill")
                    .font(.subheadline.weight(.medium))
            }
            .buttonStyle(.bordered)
            .tint(Theme.accent)
            .padding(.top, 2)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .mindfulCard()
    }

    private func openMaps() {
        let query = location.address.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed) ?? ""
        if let url = URL(string: "http://maps.apple.com/?q=\(query)") {
            openURL(url)
        }
    }
}

// MARK: - Photographer Card

struct PhotographerCard: View {
    let photographer: Photographer
    @Environment(\.openURL) private var openURL

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Label("Photographer to Study", systemImage: "person.crop.square.badge.camera")
                .font(.caption.weight(.semibold))
                .foregroundStyle(Theme.secondaryAccent)
            Text(photographer.name).font(.headline)
            Text(photographer.description)
                .font(.subheadline)
                .foregroundStyle(.secondary)
            if let url = URL(string: photographer.externalLink) {
                Button {
                    openURL(url)
                } label: {
                    Label("View Work", systemImage: "safari")
                        .font(.subheadline.weight(.medium))
                }
                .buttonStyle(.bordered)
                .tint(Theme.accent)
                .padding(.top, 2)
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .mindfulCard()
    }
}

// MARK: - Playlist Card

struct PlaylistCard: View {
    let url: String
    let description: String
    @Environment(\.openURL) private var openURL

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Label("Listening", systemImage: "music.note.list")
                .font(.caption.weight(.semibold))
                .foregroundStyle(Theme.secondaryAccent)
            Text(description).font(.subheadline)
            if let link = URL(string: url) {
                Button {
                    openURL(link)
                } label: {
                    Label("Open in Spotify", systemImage: "play.circle.fill")
                        .font(.subheadline.weight(.medium))
                }
                .buttonStyle(.bordered)
                .tint(Theme.accent)
                .padding(.top, 2)
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .mindfulCard()
    }
}
