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

  // Pause 4-10 placeholders (to be filled in with full content later)
  const remainingPauses = [
    { id: 4, weekNumber: 4, title: "Space", theme: "Embracing Emptiness" },
    { id: 5, weekNumber: 5, title: "Color", theme: "Emotional Palette" },
    { id: 6, weekNumber: 6, title: "Texture", theme: "The Feel of Things" },
    { id: 7, weekNumber: 7, title: "Perspective", theme: "Shifting Views" },
    { id: 8, weekNumber: 8, title: "Weather", theme: "Accepting Conditions" },
    { id: 9, weekNumber: 9, title: "Twilight", theme: "In-Between Moments" },
    { id: 10, weekNumber: 10, title: "Return", theme: "Coming Home" },
  ];

  for (const pause of remainingPauses) {
    await db.insert(pauses).values({
      ...pause,
      description: `Week ${pause.weekNumber} of your mindfulness and photography journey.`,
      spotifyPlaylistUrl: "https://open.spotify.com/playlist/37i9dQZF1DWZqd5JICZI0u",
      spotifyDescription: "Curated sounds for your practice",
    }).onConflictDoNothing();
  }

  console.log("Database seeded successfully!");
}

seed().catch((error) => {
  console.error("Error seeding database:", error);
  process.exit(1);
});
