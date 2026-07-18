//
//  MindfulFramesApp.swift
//  MindfulFrames
//
//  A 10-week journey of mindfulness and photography. Local-first, no backend.
//

import SwiftUI

@main
struct MindfulFramesApp: App {
    @StateObject private var store = AppStore()
    @Environment(\.scenePhase) private var scenePhase

    var body: some Scene {
        WindowGroup {
            RootView()
                .environmentObject(store)
        }
        .onChange(of: scenePhase) { _, phase in
            // Explicitly flush persisted state when leaving the foreground so
            // nothing is lost on suspension or termination.
            if phase == .inactive || phase == .background {
                store.flush()
            }
        }
    }
}

/// Chooses between onboarding and the main tab shell based on saved state.
struct RootView: View {
    @EnvironmentObject private var store: AppStore

    var body: some View {
        if store.hasCompletedOnboarding {
            ContentView()
        } else {
            OnboardingView()
        }
    }
}
