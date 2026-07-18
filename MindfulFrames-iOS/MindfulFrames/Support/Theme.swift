//
//  Theme.swift
//  MindfulFrames
//
//  Calm, premium design tokens. Uses semantic colors so light/dark and
//  accessibility settings are respected automatically.
//

import SwiftUI

enum Theme {

    // Warm, contemplative accent that adapts to color scheme.
    static let accent = Color(
        light: Color(red: 0.36, green: 0.47, blue: 0.44),   // muted sage
        dark: Color(red: 0.56, green: 0.71, blue: 0.66)
    )

    static let secondaryAccent = Color(
        light: Color(red: 0.78, green: 0.58, blue: 0.40),   // warm clay
        dark: Color(red: 0.85, green: 0.66, blue: 0.47)
    )

    /// Soft grouped background that feels calmer than pure system background.
    static let canvas = Color(.systemGroupedBackground)
    static let card = Color(.secondarySystemGroupedBackground)

    static let cardCornerRadius: CGFloat = 16
    static let cardShadow = Color.black.opacity(0.06)

    /// A gentle color signature per pause week for subtle visual variety.
    static func hue(for week: Int) -> Color {
        let hues: [Double] = [0.08, 0.55, 0.33, 0.60, 0.95, 0.10, 0.72, 0.58, 0.80, 0.42]
        let h = hues[(week - 1) % hues.count]
        return Color(hue: h, saturation: 0.42, brightness: 0.72)
    }
}

extension Color {
    /// Convenience initializer for a color that differs by color scheme.
    init(light: Color, dark: Color) {
        self.init(uiColor: UIColor { traits in
            traits.userInterfaceStyle == .dark ? UIColor(dark) : UIColor(light)
        })
    }
}

// MARK: - Reusable card container

struct CardModifier: ViewModifier {
    func body(content: Content) -> some View {
        content
            .padding(16)
            .background(Theme.card)
            .clipShape(RoundedRectangle(cornerRadius: Theme.cardCornerRadius, style: .continuous))
            .shadow(color: Theme.cardShadow, radius: 8, x: 0, y: 3)
    }
}

extension View {
    func mindfulCard() -> some View { modifier(CardModifier()) }
}
