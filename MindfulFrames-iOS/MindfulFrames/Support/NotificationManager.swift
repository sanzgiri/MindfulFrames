//
//  NotificationManager.swift
//  MindfulFrames
//
//  Optional weekly local notification reminders. Permission is requested
//  contextually (from Settings), never on first launch. Local notifications
//  require no special entitlement.
//

import Foundation
import Combine
import UserNotifications
import os

@MainActor
final class NotificationManager: ObservableObject {

    static let shared = NotificationManager()

    private let center = UNUserNotificationCenter.current()
    private let log = Logger(subsystem: "com.sanzgiri.mindfulframes", category: "Notifications")
    private let weeklyIdentifier = "com.sanzgiri.mindfulframes.weekly-reminder"

    @Published private(set) var authorizationStatus: UNAuthorizationStatus = .notDetermined

    private init() {}

    // MARK: - Authorization

    func refreshAuthorizationStatus() async {
        let settings = await center.notificationSettings()
        authorizationStatus = settings.authorizationStatus
    }

    /// Request permission contextually. Returns whether it was granted.
    @discardableResult
    func requestAuthorization() async -> Bool {
        do {
            let granted = try await center.requestAuthorization(options: [.alert, .sound, .badge])
            await refreshAuthorizationStatus()
            return granted
        } catch {
            log.error("Authorization request failed: \(error.localizedDescription, privacy: .public)")
            await refreshAuthorizationStatus()
            return false
        }
    }

    // MARK: - Scheduling

    /// Schedule (or reschedule) a repeating weekly reminder from the settings.
    /// Requesting authorization if needed is the caller's responsibility.
    func scheduleWeeklyReminder(_ reminder: ReminderSettings) async {
        // Always clear the previous one first so reschedules don't stack.
        cancelWeeklyReminder()

        guard reminder.isEnabled else { return }

        let settings = await center.notificationSettings()
        guard settings.authorizationStatus == .authorized || settings.authorizationStatus == .provisional else {
            log.notice("Skipping schedule: not authorized")
            return
        }

        let content = UNMutableNotificationContent()
        content.title = "Time for your weekly pause"
        content.body = "Step outside, breathe, and make a few mindful frames this week."
        content.sound = .default

        var components = DateComponents()
        components.weekday = reminder.weekday
        components.hour = reminder.hour
        components.minute = reminder.minute

        let trigger = UNCalendarNotificationTrigger(dateMatching: components, repeats: true)
        let request = UNNotificationRequest(identifier: weeklyIdentifier, content: content, trigger: trigger)

        do {
            try await center.add(request)
            log.notice("Scheduled weekly reminder for weekday \(reminder.weekday) at \(reminder.hour):\(reminder.minute)")
        } catch {
            log.error("Failed to schedule reminder: \(error.localizedDescription, privacy: .public)")
        }
    }

    func cancelWeeklyReminder() {
        center.removePendingNotificationRequests(withIdentifiers: [weeklyIdentifier])
    }
}
