//
//  PhotoStorage.swift
//  MindfulFrames
//
//  File-based storage for captured/imported image bytes in Application Support.
//  Provides ImageIO-based thumbnail downsampling and an in-memory cache so that
//  grids and strips never decode full-resolution photos on the main thread.
//

import Foundation
import UIKit
import ImageIO
import os

enum PhotoStorage {

    private static let log = Logger(subsystem: "com.sanzgiri.mindfulframes", category: "PhotoStorage")

    /// In-memory thumbnail cache keyed by "\(fileName)@\(pixelSize)".
    /// NSCache is thread-safe and evicts under memory pressure automatically.
    private static let thumbnailCache: NSCache<NSString, UIImage> = {
        let cache = NSCache<NSString, UIImage>()
        cache.countLimit = 400
        return cache
    }()

    /// Directory where photo image files live: <AppSupport>/MindfulFrames/Photos
    static var photosDirectory: URL {
        let base = FileManager.default.urls(for: .applicationSupportDirectory, in: .userDomainMask).first
            ?? FileManager.default.temporaryDirectory
        let dir = base
            .appendingPathComponent("MindfulFrames", isDirectory: true)
            .appendingPathComponent("Photos", isDirectory: true)
        if !FileManager.default.fileExists(atPath: dir.path) {
            do {
                try FileManager.default.createDirectory(at: dir, withIntermediateDirectories: true)
                applyFileProtection(to: dir)
            } catch {
                log.error("Failed to create photos directory: \(error.localizedDescription, privacy: .public)")
            }
        }
        return dir
    }

    static func url(for fileName: String) -> URL {
        photosDirectory.appendingPathComponent(fileName)
    }

    /// Persist a UIImage as JPEG with file protection. Returns the file name.
    @discardableResult
    static func save(_ image: UIImage, quality: CGFloat = 0.85) throws -> String {
        let fileName = "\(UUID().uuidString).jpg"
        guard let data = image.jpegData(compressionQuality: quality) else {
            throw CocoaError(.fileWriteUnknown)
        }
        let target = url(for: fileName)
        // `.completeUntilFirstUserAuthentication` keeps files readable for
        // background flushes and reconciliation while still encrypting at rest.
        try data.write(to: target, options: [.atomic, .completeFileProtectionUntilFirstUserAuthentication])
        return fileName
    }

    /// Full-resolution load (used by the full-screen viewer only).
    static func loadImage(named fileName: String) -> UIImage? {
        guard let data = try? Data(contentsOf: url(for: fileName)) else { return nil }
        return UIImage(data: data)
    }

    // MARK: - Thumbnails (ImageIO downsampling)

    /// Downsample a stored image to a thumbnail sized for display, decoding off
    /// the caller's thread via ImageIO. Results are cached in memory.
    ///
    /// - Parameter maxPixel: the longest edge, in pixels (already scale-adjusted
    ///   by the caller).
    static func thumbnail(named fileName: String, maxPixel: Int) -> UIImage? {
        let key = "\(fileName)@\(maxPixel)" as NSString
        if let cached = thumbnailCache.object(forKey: key) {
            return cached
        }
        guard let image = downsample(url: url(for: fileName), maxPixel: maxPixel) else {
            return nil
        }
        thumbnailCache.setObject(image, forKey: key)
        return image
    }

    /// Downsample using ImageIO's thumbnail generation, which avoids decoding
    /// the full-resolution image into memory.
    static func downsample(url: URL, maxPixel: Int) -> UIImage? {
        let sourceOptions = [kCGImageSourceShouldCache: false] as CFDictionary
        guard let source = CGImageSourceCreateWithURL(url as CFURL, sourceOptions) else {
            return nil
        }
        let downsampleOptions = [
            kCGImageSourceCreateThumbnailFromImageAlways: true,
            kCGImageSourceCreateThumbnailWithTransform: true,
            kCGImageSourceShouldCacheImmediately: true,
            kCGImageSourceThumbnailMaxPixelSize: max(1, maxPixel)
        ] as CFDictionary
        guard let cgImage = CGImageSourceCreateThumbnailAtIndex(source, 0, downsampleOptions) else {
            return nil
        }
        return UIImage(cgImage: cgImage)
    }

    static func delete(fileName: String) {
        do {
            try FileManager.default.removeItem(at: url(for: fileName))
        } catch {
            // Missing file on delete is not an error worth surfacing.
            log.debug("Delete photo \(fileName, privacy: .public): \(error.localizedDescription, privacy: .public)")
        }
        // Evict any cached thumbnails for this file.
        thumbnailCache.removeObject(forKey: fileName as NSString)
    }

    /// The set of image file names currently present on disk.
    static func existingFileNames() -> Set<String> {
        guard let names = try? FileManager.default.contentsOfDirectory(atPath: photosDirectory.path) else {
            return []
        }
        return Set(names)
    }

    /// Remove image files on disk that are not referenced by any metadata
    /// (orphans left behind by a crash between write and state save).
    static func deleteOrphans(keeping referencedFileNames: Set<String>) {
        let onDisk = existingFileNames()
        for name in onDisk where !referencedFileNames.contains(name) {
            delete(fileName: name)
        }
    }

    // MARK: - File protection

    private static func applyFileProtection(to url: URL) {
        do {
            try FileManager.default.setAttributes(
                [.protectionKey: FileProtectionType.completeUntilFirstUserAuthentication],
                ofItemAtPath: url.path
            )
        } catch {
            log.error("Failed to set file protection: \(error.localizedDescription, privacy: .public)")
        }
    }
}
