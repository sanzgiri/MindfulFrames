//
//  JourneyView.swift
//  MindfulFrames
//
//  Dashboard: overall progress, "Today" current pause, and ten pause cards.
//

import SwiftUI

struct JourneyView: View {
    @EnvironmentObject private var store: AppStore

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 24) {
                    header
                    progressSummary
                    if let pause = store.currentPause {
                        todaySection(pause)
                    }
                    pausesSection
                }
                .padding(.horizontal, 16)
                .padding(.bottom, 32)
            }
            .background(Theme.canvas)
            .navigationTitle("Journey")
        }
    }

    // MARK: - Header

    private var header: some View {
        VStack(alignment: .leading, spacing: 6) {
            Text("Your 10-Week Journey")
                .font(.largeTitle.weight(.bold))
            Text("Mindfulness & photography, one pause at a time.")
                .font(.subheadline)
                .foregroundStyle(.secondary)
        }
        .padding(.top, 8)
    }

    // MARK: - Progress Summary

    private var progressSummary: some View {
        HStack(spacing: 20) {
            ProgressRing(progress: store.overallProgress, lineWidth: 10)
                .frame(width: 76, height: 76)
                .overlay(
                    Text("\(Int((store.overallProgress * 100).rounded()))%")
                        .font(.headline.weight(.semibold))
                )
            VStack(alignment: .leading, spacing: 6) {
                Text("Overall Progress")
                    .font(.headline)
                Text("Week \(store.currentWeek) of \(CourseContent.totalWeeks)")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
                HStack(spacing: 14) {
                    stat(value: "\(store.completedPauseCount)", label: "pauses done")
                    stat(value: "\(store.photoCount)", label: "photos")
                }
                .padding(.top, 2)
            }
            Spacer()
        }
        .mindfulCard()
    }

    private func stat(value: String, label: String) -> some View {
        HStack(spacing: 4) {
            Text(value).font(.subheadline.weight(.semibold)).foregroundStyle(Theme.accent)
            Text(label).font(.caption).foregroundStyle(.secondary)
        }
    }

    // MARK: - Today

    private func todaySection(_ pause: Pause) -> some View {
        VStack(alignment: .leading, spacing: 12) {
            SectionHeader(title: "Today", symbol: "sun.max")
            NavigationLink(value: pause) {
                VStack(alignment: .leading, spacing: 12) {
                    HStack {
                        Text("Pause \(pause.weekNumber) · \(pause.title)")
                            .font(.title3.weight(.semibold))
                        Spacer()
                        ProgressRing(progress: store.progress(for: pause))
                            .frame(width: 34, height: 34)
                    }
                    Text(pause.theme)
                        .font(.subheadline.weight(.medium))
                        .foregroundStyle(Theme.hue(for: pause.weekNumber))
                    Text(pause.description)
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                        .lineLimit(3)
                    Label("Continue this week", systemImage: "arrow.right.circle.fill")
                        .font(.subheadline.weight(.semibold))
                        .foregroundStyle(Theme.accent)
                }
                .frame(maxWidth: .infinity, alignment: .leading)
                .mindfulCard()
            }
            .buttonStyle(.plain)
        }
    }

    // MARK: - All Pauses

    private var pausesSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            SectionHeader(title: "All Pauses", symbol: "list.bullet.rectangle")
            ForEach(CourseContent.pauses) { pause in
                NavigationLink(value: pause) {
                    PauseCard(pause: pause,
                              progress: store.progress(for: pause),
                              completed: store.completedCount(for: pause),
                              total: pause.activities.count,
                              isCurrent: pause.id == store.currentWeek)
                }
                .buttonStyle(.plain)
            }
        }
        .navigationDestination(for: Pause.self) { pause in
            PauseDetailView(pause: pause)
        }
    }
}

// MARK: - Pause Card

struct PauseCard: View {
    let pause: Pause
    let progress: Double
    let completed: Int
    let total: Int
    let isCurrent: Bool

    var body: some View {
        HStack(spacing: 16) {
            ZStack {
                Circle()
                    .fill(Theme.hue(for: pause.weekNumber).opacity(0.22))
                    .frame(width: 52, height: 52)
                Text("\(pause.weekNumber)")
                    .font(.title3.weight(.bold))
                    .foregroundStyle(Theme.hue(for: pause.weekNumber))
            }
            VStack(alignment: .leading, spacing: 4) {
                HStack(spacing: 6) {
                    Text(pause.title)
                        .font(.headline)
                    if isCurrent {
                        Text("Now")
                            .font(.caption2.weight(.bold))
                            .padding(.horizontal, 7).padding(.vertical, 3)
                            .background(Theme.accent, in: Capsule())
                            .foregroundStyle(.white)
                    }
                }
                Text(pause.theme)
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
                Text("\(completed)/\(total) activities")
                    .font(.caption)
                    .foregroundStyle(.tertiary)
            }
            Spacer()
            ProgressRing(progress: progress)
                .frame(width: 32, height: 32)
            Image(systemName: "chevron.right")
                .font(.caption.weight(.semibold))
                .foregroundStyle(.tertiary)
        }
        .mindfulCard()
        .accessibilityElement(children: .combine)
        .accessibilityLabel("Pause \(pause.weekNumber), \(pause.title), \(pause.theme). \(completed) of \(total) activities complete.")
    }
}
