//
//  ContentView.swift
//  MindfulFrames
//
//  Root tab shell: Journey · Gallery · Settings.
//

import SwiftUI

struct ContentView: View {
    var body: some View {
        TabView {
            JourneyView()
                .tabItem { Label("Journey", systemImage: "leaf.fill") }

            GalleryView()
                .tabItem { Label("Gallery", systemImage: "photo.on.rectangle.angled") }

            SettingsView()
                .tabItem { Label("Settings", systemImage: "gearshape.fill") }
        }
        .tint(Theme.accent)
    }
}

#Preview {
    ContentView()
        .environmentObject(AppStore())
}
