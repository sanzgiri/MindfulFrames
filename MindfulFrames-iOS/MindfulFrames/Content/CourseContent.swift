//
//  CourseContent.swift
//  MindfulFrames
//
//  Full 10-week course content, ported verbatim from server/seed.ts.
//  10 pauses · 30 activities · 20 locations · 10 photographers · 10 playlists.
//

import Foundation

enum CourseContent {

    static let totalWeeks = 10

    static let pauses: [Pause] = [
        // MARK: Pause 1 — Arrival
        Pause(
            id: 1, weekNumber: 1, title: "Arrival", theme: "Beginning Your Journey",
            description: "Welcome to your 10-week journey of mindfulness and photography. This first pause is about arriving in the present moment and learning to see with fresh eyes.",
            spotifyPlaylistURL: "https://open.spotify.com/playlist/37i9dQZF1DWZqd5JICZI0u",
            spotifyDescription: "Calming ambient sounds for your first meditation practice",
            activities: [
                Activity(id: "1-1", title: "Body Scan Meditation", description: "A 15-minute guided body scan to ground yourself in the present moment.", duration: "15 min", type: .meditation, orderIndex: 1),
                Activity(id: "1-2", title: "Weekly Project: Light & Shadow", description: "Spend this week photographing the interplay of light and shadow. Notice how light transforms ordinary spaces throughout the day.", duration: "Daily practice", type: .project, orderIndex: 2),
                Activity(id: "1-3", title: "Micro-Practice: Morning Awareness", description: "Each morning, before checking your phone, take three conscious breaths and notice how you feel.", duration: "1 min", type: .microPractice, orderIndex: 3),
            ],
            locations: [
                CourseLocation(id: "1-portland", name: "Japanese Garden", description: "Practice mindful photography in this serene Portland landmark. Notice the reflection pools and stone arrangements.", address: "611 SW Kingston Ave, Portland, OR 97205", variant: .portland),
                CourseLocation(id: "1-murrayhill", name: "Tualatin Hills Nature Park", description: "Begin your journey on the quiet forest trails near Beaverton. Perfect for practicing presence in nature.", address: "15655 SW Millikan Way, Beaverton, OR 97003", variant: .murrayhill),
            ],
            photographers: [
                Photographer(id: "1-1", name: "Ansel Adams", description: "Master of light and shadow in landscape photography. Study his use of tonal range.", externalLink: "https://www.anseladams.com/", sampleImages: ["https://www.anseladams.com/moonrise-hernandez-new-mexico/", "https://www.anseladams.com/clearing-winter-storm/"]),
            ]
        ),
        // MARK: Pause 2 — Breath
        Pause(
            id: 2, weekNumber: 2, title: "Breath", theme: "Finding Rhythm",
            description: "This week, we explore the breath as an anchor to the present moment. In photography, learn to capture movement and stillness.",
            spotifyPlaylistURL: "https://open.spotify.com/playlist/37i9dQZF1DX3Ogo9pFvBkY",
            spotifyDescription: "Flowing rhythms to accompany your breath work",
            activities: [
                Activity(id: "2-1", title: "Breath Counting Meditation", description: "A 20-minute practice of counting breaths to develop concentration.", duration: "20 min", type: .meditation, orderIndex: 1),
                Activity(id: "2-2", title: "Weekly Project: Motion & Stillness", description: "Capture both moving and still subjects. Experiment with shutter speed to convey different feelings.", duration: "Daily practice", type: .project, orderIndex: 2),
                Activity(id: "2-3", title: "Micro-Practice: Breath Before Action", description: "Before taking any photo, pause and take one conscious breath.", duration: "1 min", type: .microPractice, orderIndex: 3),
            ],
            locations: [
                CourseLocation(id: "2-portland", name: "Waterfront Park", description: "The flowing Willamette River provides endless opportunities to photograph water in motion.", address: "Waterfront Park, Portland, OR 97204", variant: .portland),
                CourseLocation(id: "2-murrayhill", name: "Fanno Creek Trail", description: "Follow the creek's gentle movement through Beaverton, capturing the interplay of water and light.", address: "Fanno Creek Trail, Beaverton, OR 97005", variant: .murrayhill),
            ],
            photographers: [
                Photographer(id: "2-1", name: "Ernst Haas", description: "Pioneer of color photography and master of motion blur. Study his ability to capture the energy of movement.", externalLink: "https://www.ernst-haas.com/", sampleImages: ["https://www.ernst-haas.com/gallery/motion/", "https://www.ernst-haas.com/gallery/abstractions/"]),
            ]
        ),
        // MARK: Pause 3 — Attention
        Pause(
            id: 3, weekNumber: 3, title: "Attention", theme: "The Art of Noticing",
            description: "Develop your capacity for sustained attention, both in meditation and in seeing the world through your lens.",
            spotifyPlaylistURL: "https://open.spotify.com/playlist/37i9dQZF1DWZd79rJ6a7lp",
            spotifyDescription: "Music to deepen your focus and attention",
            activities: [
                Activity(id: "3-1", title: "Single Point Focus Meditation", description: "25 minutes of focusing on a single point - your breath, a candle flame, or a sound.", duration: "25 min", type: .meditation, orderIndex: 1),
                Activity(id: "3-2", title: "Weekly Project: Micro Worlds", description: "Find beauty in the smallest details. Use macro perspective to reveal hidden worlds.", duration: "Daily practice", type: .project, orderIndex: 2),
                Activity(id: "3-3", title: "Micro-Practice: One Thing Fully", description: "Once today, do one simple thing with complete attention - drinking tea, walking, washing dishes.", duration: "5 min", type: .microPractice, orderIndex: 3),
            ],
            locations: [
                CourseLocation(id: "3-portland", name: "Portland Rose Garden", description: "Practice macro photography among thousands of rose varieties. Notice the intricate details.", address: "400 SW Kingston Ave, Portland, OR 97205", variant: .portland),
                CourseLocation(id: "3-murrayhill", name: "Jenkins Estate", description: "Explore the historic gardens and find small wonders in unexpected places.", address: "8005 SW Grabhorn Rd, Beaverton, OR 97007", variant: .murrayhill),
            ],
            photographers: [
                Photographer(id: "3-1", name: "Edward Weston", description: "Master of close-up studies revealing hidden beauty in everyday objects. Notice his attention to form and detail.", externalLink: "https://www.edwardweston.com/", sampleImages: ["https://www.edwardweston.com/peppers/", "https://www.edwardweston.com/shells/"]),
            ]
        ),
        // MARK: Pause 4 — Space
        Pause(
            id: 4, weekNumber: 4, title: "Space", theme: "Embracing Emptiness",
            description: "Learn to work with negative space and silence. In meditation, we explore the space between thoughts. In photography, we learn that what we leave out is as important as what we include.",
            spotifyPlaylistURL: "https://open.spotify.com/playlist/37i9dQZF1DX4PP3DA4J0N8",
            spotifyDescription: "Minimalist ambient soundscapes for contemplative practice",
            activities: [
                Activity(id: "4-1", title: "Open Awareness Meditation", description: "30 minutes of spacious awareness. Allow thoughts to arise and pass like clouds in the sky.", duration: "30 min", type: .meditation, orderIndex: 1),
                Activity(id: "4-2", title: "Weekly Project: Negative Space", description: "Create images where empty space tells as much story as the subject. Explore minimalism.", duration: "Daily practice", type: .project, orderIndex: 2),
                Activity(id: "4-3", title: "Micro-Practice: Pause in Silence", description: "Find a quiet spot. Sit in complete silence for five minutes. Notice the quality of spaciousness.", duration: "5 min", type: .microPractice, orderIndex: 3),
            ],
            locations: [
                CourseLocation(id: "4-portland", name: "OHSU Sky Bridge", description: "Capture the vast sky and minimal architecture. Perfect for exploring negative space.", address: "3181 SW Sam Jackson Park Rd, Portland, OR 97239", variant: .portland),
                CourseLocation(id: "4-murrayhill", name: "Cooper Mountain Nature Park", description: "Wide open hilltops with expansive sky views. Practice minimalist landscape composition.", address: "18892 SW Kemmer Rd, Beaverton, OR 97007", variant: .murrayhill),
            ],
            photographers: [
                Photographer(id: "4-1", name: "Hiroshi Sugimoto", description: "Master of minimalist seascapes and architectural photography. Study his use of negative space and meditation on emptiness.", externalLink: "https://www.sugimotohiroshi.com/", sampleImages: ["https://www.sugimotohiroshi.com/seascapes/", "https://www.sugimotohiroshi.com/architecture/"]),
            ]
        ),
        // MARK: Pause 5 — Color
        Pause(
            id: 5, weekNumber: 5, title: "Color", theme: "Emotional Palette",
            description: "This week, we explore how color affects mood and emotion. Notice the feelings different colors evoke in your meditation practice and photography.",
            spotifyPlaylistURL: "https://open.spotify.com/playlist/37i9dQZF1DX0MLFaUdXnjA",
            spotifyDescription: "Vibrant, colorful music to match your exploration",
            activities: [
                Activity(id: "5-1", title: "Loving-Kindness Meditation", description: "25 minutes of metta practice. Notice the warmth and color of compassionate feelings.", duration: "25 min", type: .meditation, orderIndex: 1),
                Activity(id: "5-2", title: "Weekly Project: Color Stories", description: "Choose one color each day. Create a photo series exploring that color's emotional impact.", duration: "Daily practice", type: .project, orderIndex: 2),
                Activity(id: "5-3", title: "Micro-Practice: Color Awareness", description: "Walk slowly for 10 minutes. Notice every shade and hue. How do different colors make you feel?", duration: "10 min", type: .microPractice, orderIndex: 3),
            ],
            locations: [
                CourseLocation(id: "5-portland", name: "Alberta Arts District", description: "Vibrant street art and colorful murals. Perfect for exploring bold, emotional color.", address: "NE Alberta St, Portland, OR 97211", variant: .portland),
                CourseLocation(id: "5-murrayhill", name: "Progress Ridge TownSquare", description: "Modern architecture with pops of color. Practice finding color in unexpected urban settings.", address: "14865 SW Barrows Rd, Beaverton, OR 97007", variant: .murrayhill),
            ],
            photographers: [
                Photographer(id: "5-1", name: "William Eggleston", description: "Pioneer of color photography as art form. Study his ability to find profound beauty in everyday color.", externalLink: "https://egglestontrust.com/", sampleImages: ["https://egglestontrust.com/los-alamos/", "https://egglestontrust.com/democratic-camera/"]),
            ]
        ),
        // MARK: Pause 6 — Texture
        Pause(
            id: 6, weekNumber: 6, title: "Texture", theme: "The Feel of Things",
            description: "Engage your sense of touch through visual means. In meditation, feel the texture of your experience. In photography, learn to convey tactile sensations through images.",
            spotifyPlaylistURL: "https://open.spotify.com/playlist/37i9dQZF1DX4dyzvuaRJ0n",
            spotifyDescription: "Rich, layered textures in sound",
            activities: [
                Activity(id: "6-1", title: "Body Sensation Meditation", description: "30 minutes exploring physical sensations. Notice the texture of each moment's experience.", duration: "30 min", type: .meditation, orderIndex: 1),
                Activity(id: "6-2", title: "Weekly Project: Tactile Photography", description: "Photograph surfaces that convey touch: rough bark, smooth water, soft petals. Make viewers want to reach out.", duration: "Daily practice", type: .project, orderIndex: 2),
                Activity(id: "6-3", title: "Micro-Practice: Touch Awareness", description: "Close your eyes. Touch three different surfaces. Really feel their texture before photographing them.", duration: "5 min", type: .microPractice, orderIndex: 3),
            ],
            locations: [
                CourseLocation(id: "6-portland", name: "Forest Park Trails", description: "Ancient trees with deeply textured bark. Moss-covered stones. Nature's texture gallery.", address: "NW Forest Park Dr, Portland, OR 97210", variant: .portland),
                CourseLocation(id: "6-murrayhill", name: "Tualatin Valley Highway Historic Buildings", description: "Weathered wood and aged brick. Explore the texture of time and history.", address: "Tualatin Valley Hwy, Beaverton, OR 97006", variant: .murrayhill),
            ],
            photographers: [
                Photographer(id: "6-1", name: "Aaron Siskind", description: "Abstract photographer who found beauty in textures and surfaces. Study his transformation of ordinary walls and peeling paint into art.", externalLink: "https://www.aaronsiskind.org/", sampleImages: ["https://www.aaronsiskind.org/abstractions/", "https://www.aaronsiskind.org/pleasures-and-terrors/"]),
            ]
        ),
        // MARK: Pause 7 — Perspective
        Pause(
            id: 7, weekNumber: 7, title: "Perspective", theme: "Shifting Views",
            description: "Halfway through your journey. This week, practice seeing from different angles—both literally and metaphorically. Change your viewpoint and discover new understanding.",
            spotifyPlaylistURL: "https://open.spotify.com/playlist/37i9dQZF1DWYcDnBA8r0zA",
            spotifyDescription: "Music that shifts and transforms perspective",
            activities: [
                Activity(id: "7-1", title: "Perspective-Taking Meditation", description: "25 minutes reflecting on different viewpoints. Imagine seeing your life from different perspectives.", duration: "25 min", type: .meditation, orderIndex: 1),
                Activity(id: "7-2", title: "Weekly Project: Unusual Angles", description: "Photograph familiar subjects from completely new angles. Lie down. Climb up. Get very close or very far.", duration: "Daily practice", type: .project, orderIndex: 2),
                Activity(id: "7-3", title: "Micro-Practice: Change Your View", description: "Visit a familiar place. View it from a position you've never tried before. Notice what changes.", duration: "10 min", type: .microPractice, orderIndex: 3),
            ],
            locations: [
                CourseLocation(id: "7-portland", name: "St. Johns Bridge", description: "Iconic Portland bridge offering dramatic vantage points from above and below. Perfect for perspective play.", address: "St Johns Bridge, Portland, OR 97203", variant: .portland),
                CourseLocation(id: "7-murrayhill", name: "Murrayhill Marketplace Parking Structure", description: "Unexpected angles in everyday architecture. Multiple levels for shifting perspectives.", address: "14900 SW Barrows Rd, Beaverton, OR 97007", variant: .murrayhill),
            ],
            photographers: [
                Photographer(id: "7-1", name: "André Kertész", description: "Master of unusual angles and distorted perspectives. Study his playful approach to viewpoint and composition.", externalLink: "https://www.artsy.net/artist/andre-kertesz", sampleImages: ["https://www.artsy.net/artist/andre-kertesz/works", "https://www.metmuseum.org/art/collection/search#!/search?q=Andre%20Kertesz"]),
            ]
        ),
        // MARK: Pause 8 — Weather
        Pause(
            id: 8, weekNumber: 8, title: "Weather", theme: "Accepting Conditions",
            description: "Learn to work with conditions as they are, not as you wish them to be. Weather in meditation and photography teaches acceptance and adaptation.",
            spotifyPlaylistURL: "https://open.spotify.com/playlist/37i9dQZF1DWW1zJdhlKITm",
            spotifyDescription: "Sounds of rain, storms, and natural weather",
            activities: [
                Activity(id: "8-1", title: "Equanimity Meditation", description: "30 minutes cultivating balance with whatever arises. Weather the storms of your mind with calm acceptance.", duration: "30 min", type: .meditation, orderIndex: 1),
                Activity(id: "8-2", title: "Weekly Project: All Weather Photography", description: "Go out in rain, fog, wind, sun. Don't wait for perfect conditions. Find beauty in each weather.", duration: "Daily practice", type: .project, orderIndex: 2),
                Activity(id: "8-3", title: "Micro-Practice: Weather Acceptance", description: "Whatever the weather today, spend 5 minutes appreciating it. Find one beautiful thing about these exact conditions.", duration: "5 min", type: .microPractice, orderIndex: 3),
            ],
            locations: [
                CourseLocation(id: "8-portland", name: "Washington Park in the Rain", description: "Portland's flagship park transforms in different weather. Embrace the rain.", address: "Washington Park, Portland, OR 97205", variant: .portland),
                CourseLocation(id: "8-murrayhill", name: "Greenway Park During Fog", description: "Morning fog creates ethereal conditions. Practice acceptance of whatever weather you find.", address: "SW Greenway Park, Beaverton, OR 97005", variant: .murrayhill),
            ],
            photographers: [
                Photographer(id: "8-1", name: "Galen Rowell", description: "Adventure photographer who excelled in challenging weather conditions. Study his ability to capture dramatic mountain light and storms.", externalLink: "https://www.mountainlight.com/", sampleImages: ["https://www.mountainlight.com/stock-photography/", "https://www.mountainlight.com/fine-art/"]),
            ]
        ),
        // MARK: Pause 9 — Twilight
        Pause(
            id: 9, weekNumber: 9, title: "Twilight", theme: "In-Between Moments",
            description: "As your journey nears completion, explore the liminal spaces—dawn and dusk, sleeping and waking, ending and beginning. Find beauty in transitions.",
            spotifyPlaylistURL: "https://open.spotify.com/playlist/37i9dQZF1DWSiZVO2J6WeI",
            spotifyDescription: "Gentle music for dawn and dusk",
            activities: [
                Activity(id: "9-1", title: "Twilight Meditation", description: "Practice at dawn or dusk. 25 minutes sitting with transition, with change, with the in-between.", duration: "25 min", type: .meditation, orderIndex: 1),
                Activity(id: "9-2", title: "Weekly Project: Golden Hour Series", description: "Photograph during the first and last light of day. Capture the magic of transition times.", duration: "Daily practice", type: .project, orderIndex: 2),
                Activity(id: "9-3", title: "Micro-Practice: Threshold Awareness", description: "Notice the transitions in your day. Pause at each threshold—doorways, beginnings, endings.", duration: "Throughout the day", type: .microPractice, orderIndex: 3),
            ],
            locations: [
                CourseLocation(id: "9-portland", name: "Mt. Tabor at Sunrise", description: "Volcanic cinder cone with 360-degree views of Portland. Perfect for dawn photography.", address: "SE 60th Ave & Salmon St, Portland, OR 97215", variant: .portland),
                CourseLocation(id: "9-murrayhill", name: "Summerlake Park at Sunset", description: "Peaceful lake reflecting the changing light. Ideal for twilight meditation and photography.", address: "10855 SW Summerlake Dr, Tigard, OR 97223", variant: .murrayhill),
            ],
            photographers: [
                Photographer(id: "9-1", name: "Michael Kenna", description: "Master of long-exposure twilight photography. Study his meditative approach to photographing between day and night.", externalLink: "https://www.michaelkenna.com/", sampleImages: ["https://www.michaelkenna.com/photography/", "https://www.michaelkenna.com/about/"]),
            ]
        ),
        // MARK: Pause 10 — Return
        Pause(
            id: 10, weekNumber: 10, title: "Return", theme: "Coming Home",
            description: "Your journey comes full circle. This final week is about integration—bringing your practice home to everyday life. Photograph your own world with fresh eyes.",
            spotifyPlaylistURL: "https://open.spotify.com/playlist/37i9dQZF1DWXe9gFZCPaLg",
            spotifyDescription: "Reflective music for completion and new beginnings",
            activities: [
                Activity(id: "10-1", title: "Gratitude Meditation", description: "30 minutes reflecting on your journey. Notice how you've changed. Appreciate what you've discovered.", duration: "30 min", type: .meditation, orderIndex: 1),
                Activity(id: "10-2", title: "Weekly Project: Home", description: "Photograph your immediate surroundings—your home, your street, your daily path. See the familiar with beginner's eyes.", duration: "Daily practice", type: .project, orderIndex: 2),
                Activity(id: "10-3", title: "Micro-Practice: Daily Commitment", description: "Create a simple daily practice to continue after this course. What will you keep?", duration: "Ongoing", type: .microPractice, orderIndex: 3),
            ],
            locations: [
                CourseLocation(id: "10-portland", name: "Ladd's Addition", description: "Portland's historic rose-filled neighborhood. Walk the diagonal streets and photograph home, belonging, and everyday beauty.", address: "SE 16th Ave & Division St, Portland, OR 97202", variant: .portland),
                CourseLocation(id: "10-murrayhill", name: "Murrayhill Neighborhood Park", description: "A familiar community gathering spot. Document the ordinary moments that make a place home.", address: "14142 SW Downing Ct, Beaverton, OR 97008", variant: .murrayhill),
            ],
            photographers: [
                Photographer(id: "10-1", name: "Sally Mann", description: "Photographer of intimate, personal imagery. Study her ability to find profound meaning in family and home.", externalLink: "https://www.sallymann.com/", sampleImages: ["https://www.sallymann.com/selected-works/", "https://www.gagosian.com/artists/sally-mann/"]),
            ]
        ),
    ]

    static func pause(id: Int) -> Pause? {
        pauses.first { $0.id == id }
    }

    static var totalActivities: Int {
        pauses.reduce(0) { $0 + $1.activities.count }
    }
}
