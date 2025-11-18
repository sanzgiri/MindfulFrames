# Mindfulness & Photography Course App - Design Guidelines

## Design Approach

**Selected System:** Apple Human Interface Guidelines (HIG)
**Rationale:** iPhone deployment priority, photography-focused content, contemplative user experience requiring clean, distraction-free interface. The HIG's emphasis on content-first design and established mobile patterns perfectly supports a mindfulness learning platform.

**Core Principles:**
- **Clarity:** Every element serves the learning journey
- **Deference:** Interface recedes to let photography and content shine
- **Depth:** Visual hierarchy guides users through structured course content

---

## Typography

**Font System:** San Francisco (SF Pro)
- **Display (Headings):** SF Pro Display
  - Pause titles: 32px/Bold
  - Section headers: 24px/Semibold
  - Card titles: 18px/Medium
- **Text (Body):** SF Pro Text
  - Body content: 16px/Regular (line-height 1.5)
  - Captions/metadata: 14px/Regular
  - Small labels: 12px/Medium

---

## Layout System

**Spacing Primitives:** Tailwind units of 2, 4, 6, 8, 12, 16
- Component padding: p-4 (mobile), p-6 (tablet+)
- Section spacing: my-8 (mobile), my-12 (desktop)
- Card gaps: gap-4
- Content max-width: max-w-4xl for readability

**Grid Structure:**
- Single column mobile (below md:)
- Two-column layouts for comparison content (md:grid-cols-2)
- Three-column for photo galleries only (lg:grid-cols-3)

---

## Component Library

### Navigation
- **Top App Bar:** Fixed header with course logo, current pause indicator, user menu
- **Tab Navigation:** For switching between Dashboard, Current Week, Gallery, Journal
- **Progress Breadcrumb:** "Pause 3 > Day 2 > Morning Meditation"

### Core Components
- **Pause Cards:** Large cards for each week with thumbnail image, title, completion ring
- **Activity Checklist:** iOS-style checkboxes with subtle animations on completion
- **Journal Entry:** Full-screen modal with autosave, timestamp, character count
- **Photo Upload:** Drag-drop zone + camera button, grid preview of uploaded images
- **Progress Ring:** Circular progress indicator (iOS Health app style) for weekly completion
- **Timeline View:** Vertical timeline showing past/current/future pauses

### Data Display
- **Photographer Reference Cards:** Portrait image + name + sample work thumbnail grid
- **Location Cards:** Map preview thumbnail + name + "Get Directions" button
- **Playlist Cards:** Spotify icon + playlist name + "Open in Spotify" link

### Forms & Inputs
- **Text Input:** Rounded corners (8px), subtle border, focus state with accent color
- **Image Upload Button:** Prominent, bottom-aligned floating action button (iOS Camera style)
- **Date Picker:** Native iOS calendar picker for start date selection

### Overlays
- **Photo Viewer:** Full-screen lightbox with swipe gestures, pinch-to-zoom
- **Activity Detail Modal:** Slide-up sheet (iOS style) with practice instructions

---

## Animations

**Minimal, Purposeful Motion:**
- Checkbox completion: Subtle scale + checkmark draw animation (300ms)
- Photo upload: Fade-in + slight lift (200ms)
- Progress ring: Smooth arc animation when percentage updates (500ms)
- Tab switching: Crossfade only (200ms)
- **No scroll-triggered animations** - maintains calm, focused experience

---

## Images

### Hero Image Strategy
**Dashboard Hero:** Calming Portland landscape (Forest Park mist or Willamette River at dawn) - 40vh height on mobile, 50vh on desktop. Overlaid text: "Your 10-Week Journey" with start date.

### Supporting Images
- **Each Pause:** Curated header image reflecting weekly theme (fall leaves for Pause 1, light through clouds for Pause 2, etc.)
- **Photographer Samples:** 3x3 grid of reference work per photographer (small thumbnails linking to external galleries)
- **Location Cards:** Map thumbnail preview or location photo
- **Gallery View:** User's uploaded photos in responsive masonry grid

### Image Treatment
- Subtle rounded corners (12px) on all images
- Soft shadows on photo cards (shadow-md)
- Buttons over images: Frosted glass effect (backdrop-blur-md + bg-white/20)

---

## Key Pages/Views

1. **Dashboard:** Progress overview, current pause card, upcoming activities, quick stats
2. **Pause Detail:** Full weekly content - theme, practices, projects, daily schedule
3. **Photo Gallery:** Filterable by pause/week, grid view, full-screen viewer
4. **Journal:** Chronological entries with search, tied to specific activities
5. **Settings:** Start date picker, location version toggle (Portland/Beaverton), Spotify link preferences

---

## Mobile-First Considerations

- Touch targets minimum 44x44px
- Thumb-friendly bottom navigation
- Swipe gestures for photo gallery navigation
- Pull-to-refresh for dashboard
- Safe area insets for iPhone notch/home indicator
- Landscape mode disabled for focused mobile experience