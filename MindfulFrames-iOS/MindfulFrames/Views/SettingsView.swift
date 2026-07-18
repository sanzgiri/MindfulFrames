//
//  SettingsView.swift
//  MindfulFrames
//
//  Start date, location preference, journal overview, and reset.
//

import SwiftUI

struct SettingsView: View {
    @EnvironmentObject private var store: AppStore
    @StateObject private var notifications = NotificationManager.shared
    @State private var showResetConfirm = false
    @State private var remindersEnabled = false
    @State private var reminderTime = Date()
    @State private var reminderWeekday = 7
    @State private var showPermissionDeniedAlert = false

    private let weekdaySymbols = Calendar.current.weekdaySymbols

    var body: some View {
        NavigationStack {
            Form {
                Section {
                    DatePicker(
                        "Journey Start Date",
                        selection: Binding(
                            get: { store.startDate },
                            set: { store.startDate = $0 }
                        ),
                        displayedComponents: .date
                    )
                    LabeledContent("Current Week", value: "Week \(store.currentWeek) of \(CourseContent.totalWeeks)")
                } header: {
                    Text("Journey")
                } footer: {
                    Text("Your current pause is calculated from this date, advancing one pause each week.")
                }

                Section {
                    Picker("Location Guide", selection: Binding(
                        get: { store.locationVariant },
                        set: { store.locationVariant = $0 }
                    )) {
                        ForEach(LocationVariant.allCases, id: \.self) { variant in
                            Text(variant.displayName).tag(variant)
                        }
                    }
                } header: {
                    Text("Location Preference")
                } footer: {
                    Text("Choose which set of curated Oregon locations appears first in each pause's resources.")
                }

                Section {
                    Toggle("Weekly Reminder", isOn: $remindersEnabled)
                    if remindersEnabled {
                        Picker("Day", selection: $reminderWeekday) {
                            ForEach(1...7, id: \.self) { day in
                                Text(weekdaySymbols[day - 1]).tag(day)
                            }
                        }
                        DatePicker("Time", selection: $reminderTime, displayedComponents: .hourAndMinute)
                    }
                } header: {
                    Text("Reminders")
                } footer: {
                    Text("An optional local notification nudging you to make time for each week's pause. You can turn it off anytime.")
                }

                Section("Your Practice") {
                    LabeledContent("Photos Captured", value: "\(store.photoCount)")
                    LabeledContent("Journal Entries", value: "\(store.allEntriesSorted.count)")
                    NavigationLink {
                        JournalArchiveView()
                    } label: {
                        Label("Journal Archive", systemImage: "book.closed")
                    }
                }

                Section {
                    Button(role: .destructive) {
                        showResetConfirm = true
                    } label: {
                        Label("Reset All Progress", systemImage: "arrow.counterclockwise")
                    }
                } footer: {
                    Text("Removes all completed activities, journal entries, and photos. Your start date and location preference are kept.")
                }

                Section {
                    LabeledContent("Version", value: "1.0")
                } footer: {
                    Text("MindfulFrames · A 10-week journey of mindfulness and photography. All data is stored on this device.")
                }
            }
            .navigationTitle("Settings")
            .confirmationDialog("Reset all progress?", isPresented: $showResetConfirm, titleVisibility: .visible) {
                Button("Reset Everything", role: .destructive) {
                    store.resetProgress()
                }
                Button("Cancel", role: .cancel) {}
            } message: {
                Text("This cannot be undone.")
            }
            .alert("Notifications Off", isPresented: $showPermissionDeniedAlert) {
                Button("Open Settings") {
                    if let url = URL(string: UIApplication.openSettingsURLString) {
                        UIApplication.shared.open(url)
                    }
                }
                Button("Not Now", role: .cancel) {}
            } message: {
                Text("Enable notifications for MindfulFrames in Settings to receive weekly reminders.")
            }
            .task {
                loadReminderState()
                await notifications.refreshAuthorizationStatus()
            }
            .onChange(of: remindersEnabled) { _, enabled in
                Task { await handleReminderToggle(enabled) }
            }
            .onChange(of: reminderWeekday) { _, _ in
                Task { await applyReminderSchedule() }
            }
            .onChange(of: reminderTime) { _, _ in
                Task { await applyReminderSchedule() }
            }
        }
    }

    // MARK: - Reminder logic

    private func loadReminderState() {
        let r = store.reminders
        remindersEnabled = r.isEnabled
        reminderWeekday = r.weekday
        var comps = DateComponents()
        comps.hour = r.hour
        comps.minute = r.minute
        reminderTime = Calendar.current.date(from: comps) ?? Date()
    }

    private func currentReminderSettings(enabled: Bool) -> ReminderSettings {
        let comps = Calendar.current.dateComponents([.hour, .minute], from: reminderTime)
        return ReminderSettings(
            isEnabled: enabled,
            weekday: reminderWeekday,
            hour: comps.hour ?? 9,
            minute: comps.minute ?? 0
        )
    }

    private func handleReminderToggle(_ enabled: Bool) async {
        if enabled {
            // Request permission contextually.
            await notifications.refreshAuthorizationStatus()
            if notifications.authorizationStatus == .notDetermined {
                let granted = await notifications.requestAuthorization()
                if !granted {
                    remindersEnabled = false
                    store.reminders = currentReminderSettings(enabled: false)
                    return
                }
            } else if notifications.authorizationStatus == .denied {
                remindersEnabled = false
                store.reminders = currentReminderSettings(enabled: false)
                showPermissionDeniedAlert = true
                return
            }
        }
        await applyReminderSchedule()
    }

    private func applyReminderSchedule() async {
        let settings = currentReminderSettings(enabled: remindersEnabled)
        store.reminders = settings
        await notifications.scheduleWeeklyReminder(settings)
    }
}

// MARK: - Journal Archive

struct JournalArchiveView: View {
    @EnvironmentObject private var store: AppStore

    var body: some View {
        Group {
            if store.allEntriesSorted.isEmpty {
                EmptyStateView(
                    symbol: "book.closed",
                    title: "No Entries Yet",
                    message: "Reflections you write in each pause's journal will collect here."
                )
            } else {
                List {
                    ForEach(store.allEntriesSorted) { entry in
                        VStack(alignment: .leading, spacing: 6) {
                            Text(CourseContent.pause(id: entry.pauseID)?.title ?? "Pause \(entry.pauseID)")
                                .font(.caption.weight(.semibold))
                                .foregroundStyle(Theme.accent)
                            Text(entry.promptText)
                                .font(.subheadline.weight(.medium))
                            Text(entry.text)
                                .font(.subheadline)
                                .foregroundStyle(.secondary)
                            Text(entry.updatedAt.formatted(date: .abbreviated, time: .shortened))
                                .font(.caption2)
                                .foregroundStyle(.tertiary)
                        }
                        .padding(.vertical, 4)
                    }
                    .onDelete { offsets in
                        let entries = store.allEntriesSorted
                        for index in offsets { store.deleteJournal(entries[index]) }
                    }
                }
            }
        }
        .navigationTitle("Journal Archive")
        .navigationBarTitleDisplayMode(.inline)
    }
}
