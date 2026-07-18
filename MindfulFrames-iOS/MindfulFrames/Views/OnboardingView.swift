//
//  OnboardingView.swift
//  MindfulFrames
//
//  Polished first-launch onboarding. Explains the 10-week journey and lets the
//  user choose a start date and location guide before entering the app.
//  No notification permission is requested here (that happens contextually
//  from Settings).
//

import SwiftUI

struct OnboardingView: View {
    @EnvironmentObject private var store: AppStore

    @State private var page = 0
    @State private var startDate = Date()
    @State private var locationVariant: LocationVariant = .portland

    var body: some View {
        ZStack {
            LinearGradient(
                colors: [Theme.accent.opacity(0.18), Theme.canvas],
                startPoint: .top, endPoint: .bottom
            )
            .ignoresSafeArea()

            TabView(selection: $page) {
                welcomePage.tag(0)
                journeyPage.tag(1)
                setupPage.tag(2)
            }
            .tabViewStyle(.page(indexDisplayMode: .always))
            .indexViewStyle(.page(backgroundDisplayMode: .always))
        }
    }

    // MARK: - Page 1: Welcome

    private var welcomePage: some View {
        VStack(spacing: 24) {
            Spacer()
            Image(systemName: "camera.macro")
                .font(.system(size: 72, weight: .thin))
                .foregroundStyle(Theme.accent)
            Text("Welcome to MindfulFrames")
                .font(.largeTitle.weight(.bold))
                .multilineTextAlignment(.center)
            Text("A 10-week journey that weaves together mindfulness and photography — one gentle pause each week.")
                .font(.title3)
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.center)
                .padding(.horizontal, 32)
            Spacer()
            nextButton(title: "Continue") { withAnimation { page = 1 } }
            Spacer().frame(height: 40)
        }
        .padding()
    }

    // MARK: - Page 2: How it works

    private var journeyPage: some View {
        VStack(spacing: 20) {
            Spacer()
            Text("How the Journey Works")
                .font(.title.weight(.bold))
                .multilineTextAlignment(.center)

            VStack(alignment: .leading, spacing: 18) {
                pillar(symbol: "figure.mind.and.body", title: "Mindfulness",
                       text: "A short daily meditation to cultivate present-moment awareness.")
                pillar(symbol: "camera.aperture", title: "Photography",
                       text: "A weekly project that transforms how you see and capture the world.")
                pillar(symbol: "square.and.pencil", title: "Journaling",
                       text: "Tailored reflection prompts to deepen each week's insight.")
                pillar(symbol: "map", title: "Exploration",
                       text: "Curated Oregon locations for weekend excursions.")
            }
            .padding(.horizontal, 28)

            Spacer()
            nextButton(title: "Continue") { withAnimation { page = 2 } }
            Spacer().frame(height: 40)
        }
        .padding()
    }

    private func pillar(symbol: String, title: String, text: String) -> some View {
        HStack(alignment: .top, spacing: 14) {
            Image(systemName: symbol)
                .font(.title2)
                .foregroundStyle(Theme.accent)
                .frame(width: 34)
            VStack(alignment: .leading, spacing: 3) {
                Text(title).font(.headline)
                Text(text).font(.subheadline).foregroundStyle(.secondary)
            }
        }
    }

    // MARK: - Page 3: Setup

    private var setupPage: some View {
        VStack(spacing: 22) {
            Spacer()
            Text("Set Up Your Journey")
                .font(.title.weight(.bold))

            VStack(alignment: .leading, spacing: 20) {
                VStack(alignment: .leading, spacing: 6) {
                    Label("Start Date", systemImage: "calendar")
                        .font(.headline)
                    DatePicker("Journey Start Date", selection: $startDate, displayedComponents: .date)
                        .labelsHidden()
                    Text("Your current pause advances one week from this date.")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }

                VStack(alignment: .leading, spacing: 6) {
                    Label("Location Guide", systemImage: "mappin.and.ellipse")
                        .font(.headline)
                    Picker("Location Guide", selection: $locationVariant) {
                        ForEach(LocationVariant.allCases, id: \.self) { variant in
                            Text(variant.displayName).tag(variant)
                        }
                    }
                    .pickerStyle(.segmented)
                    Text("Which set of curated Oregon locations appears first each week.")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
            }
            .padding(20)
            .background(Theme.card, in: RoundedRectangle(cornerRadius: Theme.cardCornerRadius, style: .continuous))
            .padding(.horizontal, 24)

            Spacer()
            nextButton(title: "Begin Your Journey") {
                store.completeOnboarding(startDate: startDate, locationVariant: locationVariant)
            }
            Spacer().frame(height: 40)
        }
        .padding()
    }

    // MARK: - Shared

    private func nextButton(title: String, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            Text(title)
                .font(.headline)
                .frame(maxWidth: .infinity)
                .padding(.vertical, 6)
        }
        .buttonStyle(.borderedProminent)
        .tint(Theme.accent)
        .padding(.horizontal, 40)
    }
}
