//
//  GalleryView.swift
//  MindfulFrames
//
//  Grid of all captured/imported photos, filterable by pause, with a
//  full-screen viewer and per-photo caption/delete.
//

import SwiftUI

struct GalleryView: View {
    @EnvironmentObject private var store: AppStore
    @State private var filterPauseID: Int? = nil
    @State private var selected: PhotoMeta?

    private let columns = [GridItem(.adaptive(minimum: 108), spacing: 3)]

    private var photos: [PhotoMeta] {
        if let filterPauseID {
            return store.photos(for: filterPauseID)
        }
        return store.allPhotosSorted
    }

    var body: some View {
        NavigationStack {
            Group {
                if store.allPhotosSorted.isEmpty {
                    ScrollView {
                        EmptyStateView(
                            symbol: "photo.on.rectangle.angled",
                            title: "Your Gallery Awaits",
                            message: "Photos you capture during each pause will appear here, grouped by week."
                        )
                        .padding(.top, 60)
                    }
                    .background(Theme.canvas)
                } else {
                    ScrollView {
                        filterBar
                        if photos.isEmpty {
                            EmptyStateView(
                                symbol: "camera",
                                title: "No Photos for This Pause",
                                message: "Capture something during this week's practice to see it here."
                            )
                        } else {
                            LazyVGrid(columns: columns, spacing: 3) {
                                ForEach(photos) { meta in
                                    Button {
                                        selected = meta
                                    } label: {
                                        PhotoFileImage(fileName: meta.fileName, displayPoints: 120)
                                            .aspectRatio(1, contentMode: .fill)
                                            .clipped()
                                    }
                                    .buttonStyle(.plain)
                                }
                            }
                            .padding(.horizontal, 3)
                        }
                    }
                    .background(Theme.canvas)
                }
            }
            .navigationTitle("Gallery")
            .fullScreenCover(item: $selected) { meta in
                PhotoViewer(meta: meta)
            }
        }
    }

    private var filterBar: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 8) {
                FilterChip(title: "All", isSelected: filterPauseID == nil) {
                    filterPauseID = nil
                }
                ForEach(CourseContent.pauses) { pause in
                    if !store.photos(for: pause.id).isEmpty {
                        FilterChip(title: pause.title, isSelected: filterPauseID == pause.id) {
                            filterPauseID = pause.id
                        }
                    }
                }
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 10)
        }
    }
}

struct FilterChip: View {
    let title: String
    let isSelected: Bool
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            Text(title)
                .font(.subheadline.weight(.medium))
                .padding(.horizontal, 14).padding(.vertical, 7)
                .background(isSelected ? Theme.accent : Theme.card, in: Capsule())
                .foregroundStyle(isSelected ? .white : .primary)
        }
        .buttonStyle(.plain)
    }
}

// MARK: - Photo Viewer

struct PhotoViewer: View {
    let meta: PhotoMeta
    @EnvironmentObject private var store: AppStore
    @Environment(\.dismiss) private var dismiss
    @State private var caption: String = ""
    @State private var showDeleteConfirm = false

    private var pauseTitle: String {
        CourseContent.pause(id: meta.pauseID)?.title ?? "Pause \(meta.pauseID)"
    }

    var body: some View {
        NavigationStack {
            ZStack {
                Color.black.ignoresSafeArea()
                VStack {
                    Spacer()
                    FullResolutionImage(fileName: meta.fileName)
                    Spacer()
                    VStack(alignment: .leading, spacing: 8) {
                        Label("Pause \(meta.pauseID) · \(pauseTitle)", systemImage: "leaf")
                            .font(.caption.weight(.semibold))
                            .foregroundStyle(.white.opacity(0.8))
                        TextField("Add a caption…", text: $caption, axis: .vertical)
                            .textFieldStyle(.plain)
                            .foregroundStyle(.white)
                            .padding(10)
                            .background(.white.opacity(0.12), in: RoundedRectangle(cornerRadius: 10))
                            .onChange(of: caption) { _, newValue in
                                store.updateCaption(newValue, for: meta.id)
                            }
                        Text(meta.createdAt.formatted(date: .abbreviated, time: .shortened))
                            .font(.caption2)
                            .foregroundStyle(.white.opacity(0.6))
                    }
                    .padding()
                }
            }
            .toolbarColorScheme(.dark, for: .navigationBar)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Done") { dismiss() }
                }
                ToolbarItem(placement: .destructiveAction) {
                    Button(role: .destructive) { showDeleteConfirm = true } label: {
                        Image(systemName: "trash")
                    }
                }
            }
            .confirmationDialog("Delete this photo?", isPresented: $showDeleteConfirm, titleVisibility: .visible) {
                Button("Delete", role: .destructive) {
                    store.deletePhoto(meta)
                    dismiss()
                }
                Button("Cancel", role: .cancel) {}
            }
        }
        .preferredColorScheme(.dark)
        .onAppear { caption = meta.caption }
    }
}
