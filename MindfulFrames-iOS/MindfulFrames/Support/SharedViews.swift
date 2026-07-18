//
//  SharedViews.swift
//  MindfulFrames
//
//  Small reusable UI building blocks.
//

import SwiftUI

// MARK: - Progress Ring

struct ProgressRing: View {
    var progress: Double            // 0...1
    var lineWidth: CGFloat = 8
    var tint: Color = Theme.accent

    var body: some View {
        ZStack {
            Circle()
                .stroke(tint.opacity(0.18), lineWidth: lineWidth)
            Circle()
                .trim(from: 0, to: max(0.0001, min(progress, 1)))
                .stroke(tint, style: StrokeStyle(lineWidth: lineWidth, lineCap: .round))
                .rotationEffect(.degrees(-90))
                .animation(.easeInOut(duration: 0.5), value: progress)
        }
        .accessibilityElement()
        .accessibilityLabel("Progress")
        .accessibilityValue("\(Int((progress * 100).rounded())) percent")
    }
}

// MARK: - Section Header

struct SectionHeader: View {
    let title: String
    var symbol: String? = nil

    var body: some View {
        HStack(spacing: 8) {
            if let symbol {
                Image(systemName: symbol)
                    .foregroundStyle(Theme.accent)
            }
            Text(title)
                .font(.title3.weight(.semibold))
            Spacer()
        }
        .accessibilityAddTraits(.isHeader)
    }
}

// MARK: - Empty State

struct EmptyStateView: View {
    let symbol: String
    let title: String
    let message: String

    var body: some View {
        VStack(spacing: 14) {
            Image(systemName: symbol)
                .font(.system(size: 44, weight: .light))
                .foregroundStyle(Theme.accent.opacity(0.8))
            Text(title)
                .font(.headline)
                .multilineTextAlignment(.center)
            Text(message)
                .font(.subheadline)
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.center)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 40)
        .padding(.horizontal, 24)
    }
}

// MARK: - Activity type pill

struct TypePill: View {
    let type: ActivityType

    var body: some View {
        Label(type.displayName, systemImage: type.symbolName)
            .font(.caption.weight(.medium))
            .padding(.horizontal, 10)
            .padding(.vertical, 5)
            .background(Theme.accent.opacity(0.14), in: Capsule())
            .foregroundStyle(Theme.accent)
    }
}

// MARK: - Thumbnail image (ImageIO-downsampled, cached, off main thread)

/// Displays a downsampled thumbnail for a stored photo. Grids and strips use
/// this so they never decode full-resolution images. Decoding happens off the
/// main thread; results are cached in `PhotoStorage`'s NSCache.
struct PhotoFileImage: View {
    let fileName: String
    /// Point size of the display area; converted to pixels using screen scale.
    var displayPoints: CGFloat = 108

    @State private var image: UIImage?

    var body: some View {
        Group {
            if let image {
                Image(uiImage: image)
                    .resizable()
                    .scaledToFill()
            } else {
                Rectangle()
                    .fill(Theme.accent.opacity(0.12))
                    .overlay(
                        Image(systemName: "photo")
                            .foregroundStyle(.secondary)
                    )
            }
        }
        .task(id: fileName) {
            guard image == nil else { return }
            let scale = UIScreen.main.scale
            // Add headroom so fill-mode crops stay sharp.
            let maxPixel = Int((displayPoints * scale * 1.3).rounded())
            let name = fileName
            let thumb = await Task.detached(priority: .userInitiated) {
                PhotoStorage.thumbnail(named: name, maxPixel: maxPixel)
            }.value
            if !Task.isCancelled {
                image = thumb
            }
        }
    }
}

// MARK: - Full-resolution image (viewer only)

/// Loads the full-resolution image off the main thread. Used only by the
/// full-screen viewer where full detail is required.
struct FullResolutionImage: View {
    let fileName: String
    @State private var image: UIImage?

    var body: some View {
        Group {
            if let image {
                Image(uiImage: image)
                    .resizable()
                    .scaledToFit()
            } else {
                ProgressView()
                    .tint(.white)
                    .controlSize(.large)
            }
        }
        .task(id: fileName) {
            guard image == nil else { return }
            let name = fileName
            let loaded = await Task.detached(priority: .userInitiated) {
                PhotoStorage.loadImage(named: name)
            }.value
            if !Task.isCancelled {
                image = loaded
            }
        }
    }
}
