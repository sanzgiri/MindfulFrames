import { db } from "./db";
import { pauses, activities, locations, photographers } from "@shared/schema";

async function seed() {
  console.log("Seeding database...");

  // Pause 1: Arrival
  await db.insert(pauses).values({
    id: 1,
    weekNumber: 1,
    title: "Arrival",
    theme: "Beginning Your Journey",
    description: "Welcome to your 10-week journey of mindfulness and photography. This first pause is about arriving in the present moment and learning to see with fresh eyes.",
    spotifyPlaylistUrl: "https://open.spotify.com/playlist/37i9dQZF1DWZqd5JICZI0u",
    spotifyDescription: "Calming ambient sounds for your first meditation practice",
  }).onConflictDoNothing();

  await db.insert(activities).values([
    {
      pauseId: 1,
      title: "Body Scan Meditation",
      description: "A 15-minute guided body scan to ground yourself in the present moment.",
      duration: "15 min",
      activityType: "meditation",
      orderIndex: 1,
    },
    {
      pauseId: 1,
      title: "Weekly Project: Light & Shadow",
      description: "Spend this week photographing the interplay of light and shadow. Notice how light transforms ordinary spaces throughout the day.",
      duration: "Daily practice",
      activityType: "project",
      orderIndex: 2,
    },
    {
      pauseId: 1,
      title: "Micro-Practice: Morning Awareness",
      description: "Each morning, before checking your phone, take three conscious breaths and notice how you feel.",
      duration: "1 min",
      activityType: "micro-practice",
      orderIndex: 3,
    },
  ]).onConflictDoNothing();

  await db.insert(locations).values([
    {
      pauseId: 1,
      name: "Japanese Garden",
      description: "Practice mindful photography in this serene Portland landmark. Notice the reflection pools and stone arrangements.",
      address: "611 SW Kingston Ave, Portland, OR 97205",
      locationType: "portland",
    },
    {
      pauseId: 1,
      name: "Tualatin Hills Nature Park",
      description: "Begin your journey on the quiet forest trails near Beaverton. Perfect for practicing presence in nature.",
      address: "15655 SW Millikan Way, Beaverton, OR 97003",
      locationType: "murrayhill",
    },
  ]).onConflictDoNothing();

  await db.insert(photographers).values([
    {
      pauseId: 1,
      name: "Ansel Adams",
      description: "Master of light and shadow in landscape photography. Study his use of tonal range.",
      externalLink: "https://www.anseladams.com/",
      sampleImages: JSON.stringify([
        "https://www.anseladams.com/moonrise-hernandez-new-mexico/",
        "https://www.anseladams.com/clearing-winter-storm/"
      ]),
    },
  ]).onConflictDoNothing();

  // Pause 2: Breath
  await db.insert(pauses).values({
    id: 2,
    weekNumber: 2,
    title: "Breath",
    theme: "Finding Rhythm",
    description: "This week, we explore the breath as an anchor to the present moment. In photography, learn to capture movement and stillness.",
    spotifyPlaylistUrl: "https://open.spotify.com/playlist/37i9dQZF1DX3Ogo9pFvBkY",
    spotifyDescription: "Flowing rhythms to accompany your breath work",
  }).onConflictDoNothing();

  await db.insert(activities).values([
    {
      pauseId: 2,
      title: "Breath Counting Meditation",
      description: "A 20-minute practice of counting breaths to develop concentration.",
      duration: "20 min",
      activityType: "meditation",
      orderIndex: 1,
    },
    {
      pauseId: 2,
      title: "Weekly Project: Motion & Stillness",
      description: "Capture both moving and still subjects. Experiment with shutter speed to convey different feelings.",
      duration: "Daily practice",
      activityType: "project",
      orderIndex: 2,
    },
    {
      pauseId: 2,
      title: "Micro-Practice: Breath Before Action",
      description: "Before taking any photo, pause and take one conscious breath.",
      duration: "1 min",
      activityType: "micro-practice",
      orderIndex: 3,
    },
  ]).onConflictDoNothing();

  await db.insert(locations).values([
    {
      pauseId: 2,
      name: "Waterfront Park",
      description: "The flowing Willamette River provides endless opportunities to photograph water in motion.",
      address: "Waterfront Park, Portland, OR 97204",
      locationType: "portland",
    },
    {
      pauseId: 2,
      name: "Fanno Creek Trail",
      description: "Follow the creek's gentle movement through Beaverton, capturing the interplay of water and light.",
      address: "Fanno Creek Trail, Beaverton, OR 97005",
      locationType: "murrayhill",
    },
  ]).onConflictDoNothing();

  await db.insert(photographers).values([
    {
      pauseId: 2,
      name: "Ernst Haas",
      description: "Pioneer of color photography and master of motion blur. Study his ability to capture the energy of movement.",
      externalLink: "https://www.ernst-haas.com/",
      sampleImages: JSON.stringify([
        "https://www.ernst-haas.com/gallery/motion/",
        "https://www.ernst-haas.com/gallery/abstractions/"
      ]),
    },
  ]).onConflictDoNothing();

  // Pause 3: Attention
  await db.insert(pauses).values({
    id: 3,
    weekNumber: 3,
    title: "Attention",
    theme: "The Art of Noticing",
    description: "Develop your capacity for sustained attention, both in meditation and in seeing the world through your lens.",
    spotifyPlaylistUrl: "https://open.spotify.com/playlist/37i9dQZF1DWZd79rJ6a7lp",
    spotifyDescription: "Music to deepen your focus and attention",
  }).onConflictDoNothing();

  await db.insert(activities).values([
    {
      pauseId: 3,
      title: "Single Point Focus Meditation",
      description: "25 minutes of focusing on a single point - your breath, a candle flame, or a sound.",
      duration: "25 min",
      activityType: "meditation",
      orderIndex: 1,
    },
    {
      pauseId: 3,
      title: "Weekly Project: Micro Worlds",
      description: "Find beauty in the smallest details. Use macro perspective to reveal hidden worlds.",
      duration: "Daily practice",
      activityType: "project",
      orderIndex: 2,
    },
    {
      pauseId: 3,
      title: "Micro-Practice: One Thing Fully",
      description: "Once today, do one simple thing with complete attention - drinking tea, walking, washing dishes.",
      duration: "5 min",
      activityType: "micro-practice",
      orderIndex: 3,
    },
  ]).onConflictDoNothing();

  await db.insert(locations).values([
    {
      pauseId: 3,
      name: "Portland Rose Garden",
      description: "Practice macro photography among thousands of rose varieties. Notice the intricate details.",
      address: "400 SW Kingston Ave, Portland, OR 97205",
      locationType: "portland",
    },
    {
      pauseId: 3,
      name: "Jenkins Estate",
      description: "Explore the historic gardens and find small wonders in unexpected places.",
      address: "8005 SW Grabhorn Rd, Beaverton, OR 97007",
      locationType: "murrayhill",
    },
  ]).onConflictDoNothing();

  await db.insert(photographers).values([
    {
      pauseId: 3,
      name: "Edward Weston",
      description: "Master of close-up studies revealing hidden beauty in everyday objects. Notice his attention to form and detail.",
      externalLink: "https://www.edwardweston.com/",
      sampleImages: JSON.stringify([
        "https://www.edwardweston.com/peppers/",
        "https://www.edwardweston.com/shells/"
      ]),
    },
  ]).onConflictDoNothing();

  // Pause 4: Space
  await db.insert(pauses).values({
    id: 4,
    weekNumber: 4,
    title: "Space",
    theme: "Embracing Emptiness",
    description: "Learn to work with negative space and silence. In meditation, we explore the space between thoughts. In photography, we learn that what we leave out is as important as what we include.",
    spotifyPlaylistUrl: "https://open.spotify.com/playlist/37i9dQZF1DX4PP3DA4J0N8",
    spotifyDescription: "Minimalist ambient soundscapes for contemplative practice",
  }).onConflictDoNothing();

  await db.insert(activities).values([
    {
      pauseId: 4,
      title: "Open Awareness Meditation",
      description: "30 minutes of spacious awareness. Allow thoughts to arise and pass like clouds in the sky.",
      duration: "30 min",
      activityType: "meditation",
      orderIndex: 1,
    },
    {
      pauseId: 4,
      title: "Weekly Project: Negative Space",
      description: "Create images where empty space tells as much story as the subject. Explore minimalism.",
      duration: "Daily practice",
      activityType: "project",
      orderIndex: 2,
    },
    {
      pauseId: 4,
      title: "Micro-Practice: Pause in Silence",
      description: "Find a quiet spot. Sit in complete silence for five minutes. Notice the quality of spaciousness.",
      duration: "5 min",
      activityType: "micro-practice",
      orderIndex: 3,
    },
  ]).onConflictDoNothing();

  await db.insert(locations).values([
    {
      pauseId: 4,
      name: "OHSU Sky Bridge",
      description: "Capture the vast sky and minimal architecture. Perfect for exploring negative space.",
      address: "3181 SW Sam Jackson Park Rd, Portland, OR 97239",
      locationType: "portland",
    },
    {
      pauseId: 4,
      name: "Cooper Mountain Nature Park",
      description: "Wide open hilltops with expansive sky views. Practice minimalist landscape composition.",
      address: "18892 SW Kemmer Rd, Beaverton, OR 97007",
      locationType: "murrayhill",
    },
  ]).onConflictDoNothing();

  await db.insert(photographers).values([
    {
      pauseId: 4,
      name: "Hiroshi Sugimoto",
      description: "Master of minimalist seascapes and architectural photography. Study his use of negative space and meditation on emptiness.",
      externalLink: "https://www.sugimotohiroshi.com/",
      sampleImages: JSON.stringify([
        "https://www.sugimotohiroshi.com/seascapes/",
        "https://www.sugimotohiroshi.com/architecture/"
      ]),
    },
  ]).onConflictDoNothing();

  // Pause 5: Color
  await db.insert(pauses).values({
    id: 5,
    weekNumber: 5,
    title: "Color",
    theme: "Emotional Palette",
    description: "This week, we explore how color affects mood and emotion. Notice the feelings different colors evoke in your meditation practice and photography.",
    spotifyPlaylistUrl: "https://open.spotify.com/playlist/37i9dQZF1DX0MLFaUdXnjA",
    spotifyDescription: "Vibrant, colorful music to match your exploration",
  }).onConflictDoNothing();

  await db.insert(activities).values([
    {
      pauseId: 5,
      title: "Loving-Kindness Meditation",
      description: "25 minutes of metta practice. Notice the warmth and color of compassionate feelings.",
      duration: "25 min",
      activityType: "meditation",
      orderIndex: 1,
    },
    {
      pauseId: 5,
      title: "Weekly Project: Color Stories",
      description: "Choose one color each day. Create a photo series exploring that color's emotional impact.",
      duration: "Daily practice",
      activityType: "project",
      orderIndex: 2,
    },
    {
      pauseId: 5,
      title: "Micro-Practice: Color Awareness",
      description: "Walk slowly for 10 minutes. Notice every shade and hue. How do different colors make you feel?",
      duration: "10 min",
      activityType: "micro-practice",
      orderIndex: 3,
    },
  ]).onConflictDoNothing();

  await db.insert(locations).values([
    {
      pauseId: 5,
      name: "Alberta Arts District",
      description: "Vibrant street art and colorful murals. Perfect for exploring bold, emotional color.",
      address: "NE Alberta St, Portland, OR 97211",
      locationType: "portland",
    },
    {
      pauseId: 5,
      name: "Progress Ridge TownSquare",
      description: "Modern architecture with pops of color. Practice finding color in unexpected urban settings.",
      address: "14865 SW Barrows Rd, Beaverton, OR 97007",
      locationType: "murrayhill",
    },
  ]).onConflictDoNothing();

  await db.insert(photographers).values([
    {
      pauseId: 5,
      name: "William Eggleston",
      description: "Pioneer of color photography as art form. Study his ability to find profound beauty in everyday color.",
      externalLink: "https://egglestontrust.com/",
      sampleImages: JSON.stringify([
        "https://egglestontrust.com/los-alamos/",
        "https://egglestontrust.com/democratic-camera/"
      ]),
    },
  ]).onConflictDoNothing();

  // Pause 6: Texture
  await db.insert(pauses).values({
    id: 6,
    weekNumber: 6,
    title: "Texture",
    theme: "The Feel of Things",
    description: "Engage your sense of touch through visual means. In meditation, feel the texture of your experience. In photography, learn to convey tactile sensations through images.",
    spotifyPlaylistUrl: "https://open.spotify.com/playlist/37i9dQZF1DX4dyzvuaRJ0n",
    spotifyDescription: "Rich, layered textures in sound",
  }).onConflictDoNothing();

  await db.insert(activities).values([
    {
      pauseId: 6,
      title: "Body Sensation Meditation",
      description: "30 minutes exploring physical sensations. Notice the texture of each moment's experience.",
      duration: "30 min",
      activityType: "meditation",
      orderIndex: 1,
    },
    {
      pauseId: 6,
      title: "Weekly Project: Tactile Photography",
      description: "Photograph surfaces that convey touch: rough bark, smooth water, soft petals. Make viewers want to reach out.",
      duration: "Daily practice",
      activityType: "project",
      orderIndex: 2,
    },
    {
      pauseId: 6,
      title: "Micro-Practice: Touch Awareness",
      description: "Close your eyes. Touch three different surfaces. Really feel their texture before photographing them.",
      duration: "5 min",
      activityType: "micro-practice",
      orderIndex: 3,
    },
  ]).onConflictDoNothing();

  await db.insert(locations).values([
    {
      pauseId: 6,
      name: "Forest Park Trails",
      description: "Ancient trees with deeply textured bark. Moss-covered stones. Nature's texture gallery.",
      address: "NW Forest Park Dr, Portland, OR 97210",
      locationType: "portland",
    },
    {
      pauseId: 6,
      name: "Tualatin Valley Highway Historic Buildings",
      description: "Weathered wood and aged brick. Explore the texture of time and history.",
      address: "Tualatin Valley Hwy, Beaverton, OR 97006",
      locationType: "murrayhill",
    },
  ]).onConflictDoNothing();

  await db.insert(photographers).values([
    {
      pauseId: 6,
      name: "Aaron Siskind",
      description: "Abstract photographer who found beauty in textures and surfaces. Study his transformation of ordinary walls and peeling paint into art.",
      externalLink: "https://www.aaronsiskind.org/",
      sampleImages: JSON.stringify([
        "https://www.aaronsiskind.org/abstractions/",
        "https://www.aaronsiskind.org/pleasures-and-terrors/"
      ]),
    },
  ]).onConflictDoNothing();

  // Pause 7: Perspective
  await db.insert(pauses).values({
    id: 7,
    weekNumber: 7,
    title: "Perspective",
    theme: "Shifting Views",
    description: "Halfway through your journey. This week, practice seeing from different angles—both literally and metaphorically. Change your viewpoint and discover new understanding.",
    spotifyPlaylistUrl: "https://open.spotify.com/playlist/37i9dQZF1DWYcDnBA8r0zA",
    spotifyDescription: "Music that shifts and transforms perspective",
  }).onConflictDoNothing();

  await db.insert(activities).values([
    {
      pauseId: 7,
      title: "Perspective-Taking Meditation",
      description: "25 minutes reflecting on different viewpoints. Imagine seeing your life from different perspectives.",
      duration: "25 min",
      activityType: "meditation",
      orderIndex: 1,
    },
    {
      pauseId: 7,
      title: "Weekly Project: Unusual Angles",
      description: "Photograph familiar subjects from completely new angles. Lie down. Climb up. Get very close or very far.",
      duration: "Daily practice",
      activityType: "project",
      orderIndex: 2,
    },
    {
      pauseId: 7,
      title: "Micro-Practice: Change Your View",
      description: "Visit a familiar place. View it from a position you've never tried before. Notice what changes.",
      duration: "10 min",
      activityType: "micro-practice",
      orderIndex: 3,
    },
  ]).onConflictDoNothing();

  await db.insert(locations).values([
    {
      pauseId: 7,
      name: "St. Johns Bridge",
      description: "Iconic Portland bridge offering dramatic vantage points from above and below. Perfect for perspective play.",
      address: "St Johns Bridge, Portland, OR 97203",
      locationType: "portland",
    },
    {
      pauseId: 7,
      name: "Murrayhill Marketplace Parking Structure",
      description: "Unexpected angles in everyday architecture. Multiple levels for shifting perspectives.",
      address: "14900 SW Barrows Rd, Beaverton, OR 97007",
      locationType: "murrayhill",
    },
  ]).onConflictDoNothing();

  await db.insert(photographers).values([
    {
      pauseId: 7,
      name: "André Kertész",
      description: "Master of unusual angles and distorted perspectives. Study his playful approach to viewpoint and composition.",
      externalLink: "https://www.artsy.net/artist/andre-kertesz",
      sampleImages: JSON.stringify([
        "https://www.artsy.net/artist/andre-kertesz/works",
        "https://www.metmuseum.org/art/collection/search#!/search?q=Andre%20Kertesz"
      ]),
    },
  ]).onConflictDoNothing();

  // Pause 8: Weather
  await db.insert(pauses).values({
    id: 8,
    weekNumber: 8,
    title: "Weather",
    theme: "Accepting Conditions",
    description: "Learn to work with conditions as they are, not as you wish them to be. Weather in meditation and photography teaches acceptance and adaptation.",
    spotifyPlaylistUrl: "https://open.spotify.com/playlist/37i9dQZF1DWW1zJdhlKITm",
    spotifyDescription: "Sounds of rain, storms, and natural weather",
  }).onConflictDoNothing();

  await db.insert(activities).values([
    {
      pauseId: 8,
      title: "Equanimity Meditation",
      description: "30 minutes cultivating balance with whatever arises. Weather the storms of your mind with calm acceptance.",
      duration: "30 min",
      activityType: "meditation",
      orderIndex: 1,
    },
    {
      pauseId: 8,
      title: "Weekly Project: All Weather Photography",
      description: "Go out in rain, fog, wind, sun. Don't wait for perfect conditions. Find beauty in each weather.",
      duration: "Daily practice",
      activityType: "project",
      orderIndex: 2,
    },
    {
      pauseId: 8,
      title: "Micro-Practice: Weather Acceptance",
      description: "Whatever the weather today, spend 5 minutes appreciating it. Find one beautiful thing about these exact conditions.",
      duration: "5 min",
      activityType: "micro-practice",
      orderIndex: 3,
    },
  ]).onConflictDoNothing();

  await db.insert(locations).values([
    {
      pauseId: 8,
      name: "Washington Park in the Rain",
      description: "Portland's flagship park transforms in different weather. Embrace the rain.",
      address: "Washington Park, Portland, OR 97205",
      locationType: "portland",
    },
    {
      pauseId: 8,
      name: "Greenway Park During Fog",
      description: "Morning fog creates ethereal conditions. Practice acceptance of whatever weather you find.",
      address: "SW Greenway Park, Beaverton, OR 97005",
      locationType: "murrayhill",
    },
  ]).onConflictDoNothing();

  await db.insert(photographers).values([
    {
      pauseId: 8,
      name: "Galen Rowell",
      description: "Adventure photographer who excelled in challenging weather conditions. Study his ability to capture dramatic mountain light and storms.",
      externalLink: "https://www.mountainlight.com/",
      sampleImages: JSON.stringify([
        "https://www.mountainlight.com/stock-photography/",
        "https://www.mountainlight.com/fine-art/"
      ]),
    },
  ]).onConflictDoNothing();

  // Pause 9: Twilight
  await db.insert(pauses).values({
    id: 9,
    weekNumber: 9,
    title: "Twilight",
    theme: "In-Between Moments",
    description: "As your journey nears completion, explore the liminal spaces—dawn and dusk, sleeping and waking, ending and beginning. Find beauty in transitions.",
    spotifyPlaylistUrl: "https://open.spotify.com/playlist/37i9dQZF1DWSiZVO2J6WeI",
    spotifyDescription: "Gentle music for dawn and dusk",
  }).onConflictDoNothing();

  await db.insert(activities).values([
    {
      pauseId: 9,
      title: "Twilight Meditation",
      description: "Practice at dawn or dusk. 25 minutes sitting with transition, with change, with the in-between.",
      duration: "25 min",
      activityType: "meditation",
      orderIndex: 1,
    },
    {
      pauseId: 9,
      title: "Weekly Project: Golden Hour Series",
      description: "Photograph during the first and last light of day. Capture the magic of transition times.",
      duration: "Daily practice",
      activityType: "project",
      orderIndex: 2,
    },
    {
      pauseId: 9,
      title: "Micro-Practice: Threshold Awareness",
      description: "Notice the transitions in your day. Pause at each threshold—doorways, beginnings, endings.",
      duration: "Throughout the day",
      activityType: "micro-practice",
      orderIndex: 3,
    },
  ]).onConflictDoNothing();

  await db.insert(locations).values([
    {
      pauseId: 9,
      name: "Mt. Tabor at Sunrise",
      description: "Volcanic cinder cone with 360-degree views of Portland. Perfect for dawn photography.",
      address: "SE 60th Ave & Salmon St, Portland, OR 97215",
      locationType: "portland",
    },
    {
      pauseId: 9,
      name: "Summerlake Park at Sunset",
      description: "Peaceful lake reflecting the changing light. Ideal for twilight meditation and photography.",
      address: "10855 SW Summerlake Dr, Tigard, OR 97223",
      locationType: "murrayhill",
    },
  ]).onConflictDoNothing();

  await db.insert(photographers).values([
    {
      pauseId: 9,
      name: "Michael Kenna",
      description: "Master of long-exposure twilight photography. Study his meditative approach to photographing between day and night.",
      externalLink: "https://www.michaelkenna.com/",
      sampleImages: JSON.stringify([
        "https://www.michaelkenna.com/photography/",
        "https://www.michaelkenna.com/about/"
      ]),
    },
  ]).onConflictDoNothing();

  // Pause 10: Return
  await db.insert(pauses).values({
    id: 10,
    weekNumber: 10,
    title: "Return",
    theme: "Coming Home",
    description: "Your journey comes full circle. This final week is about integration—bringing your practice home to everyday life. Photograph your own world with fresh eyes.",
    spotifyPlaylistUrl: "https://open.spotify.com/playlist/37i9dQZF1DWXe9gFZCPaLg",
    spotifyDescription: "Reflective music for completion and new beginnings",
  }).onConflictDoNothing();

  await db.insert(activities).values([
    {
      pauseId: 10,
      title: "Gratitude Meditation",
      description: "30 minutes reflecting on your journey. Notice how you've changed. Appreciate what you've discovered.",
      duration: "30 min",
      activityType: "meditation",
      orderIndex: 1,
    },
    {
      pauseId: 10,
      title: "Weekly Project: Home",
      description: "Photograph your immediate surroundings—your home, your street, your daily path. See the familiar with beginner's eyes.",
      duration: "Daily practice",
      activityType: "project",
      orderIndex: 2,
    },
    {
      pauseId: 10,
      title: "Micro-Practice: Daily Commitment",
      description: "Create a simple daily practice to continue after this course. What will you keep?",
      duration: "Ongoing",
      activityType: "micro-practice",
      orderIndex: 3,
    },
  ]).onConflictDoNothing();

  await db.insert(locations).values([
    {
      pauseId: 10,
      name: "Ladd's Addition",
      description: "Portland's historic rose-filled neighborhood. Walk the diagonal streets and photograph home, belonging, and everyday beauty.",
      address: "SE 16th Ave & Division St, Portland, OR 97202",
      locationType: "portland",
    },
    {
      pauseId: 10,
      name: "Murrayhill Neighborhood Park",
      description: "A familiar community gathering spot. Document the ordinary moments that make a place home.",
      address: "14142 SW Downing Ct, Beaverton, OR 97008",
      locationType: "murrayhill",
    },
  ]).onConflictDoNothing();

  await db.insert(photographers).values([
    {
      pauseId: 10,
      name: "Sally Mann",
      description: "Photographer of intimate, personal imagery. Study her ability to find profound meaning in family and home.",
      externalLink: "https://www.sallymann.com/",
      sampleImages: JSON.stringify([
        "https://www.sallymann.com/selected-works/",
        "https://www.gagosian.com/artists/sally-mann/"
      ]),
    },
  ]).onConflictDoNothing();

  console.log("Database seeded successfully!");
}

seed().catch((error) => {
  console.error("Error seeding database:", error);
  process.exit(1);
});
