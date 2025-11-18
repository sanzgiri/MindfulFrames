export type Season = 'spring' | 'summer' | 'fall' | 'winter';

export function getSeason(date: Date): Season {
  const month = date.getMonth();
  
  if (month >= 2 && month <= 4) return 'spring';
  if (month >= 5 && month <= 7) return 'summer';
  if (month >= 8 && month <= 10) return 'fall';
  return 'winter';
}

export function getSeasonalText(season: Season, texts: Record<Season, string>): string {
  return texts[season];
}

export function getWeekDate(startDate: Date, weekNumber: number): Date {
  const weekDate = new Date(startDate);
  weekDate.setDate(weekDate.getDate() + (weekNumber - 1) * 7);
  return weekDate;
}

export const seasonalThemes = {
  pause1: {
    spring: "Notice the emergence of new growth and fresh light",
    summer: "Observe the abundance of light and shadow patterns",
    fall: "Witness the transformation of colors and textures",
    winter: "Find clarity in the stripped-down winter landscape",
  },
  pause2: {
    spring: "Synchronize your breath with blooming flowers",
    summer: "Feel the rhythm of warm breezes and flowing water",
    fall: "Breathe with the rustling of falling leaves",
    winter: "Match your breath to the stillness of frozen moments",
  },
  pause3: {
    spring: "Focus on tender new shoots and budding details",
    summer: "Attend to lush textures and vibrant details",
    fall: "Notice intricate patterns in decay and transition",
    winter: "See crystalline structures and subtle variations",
  },
  pause4: {
    spring: "Embrace the negative space between new growth",
    summer: "Find emptiness within abundance",
    fall: "Notice what's revealed as leaves fall away",
    winter: "Appreciate the expansive space of bare landscapes",
  },
  pause5: {
    spring: "Capture the fresh greens and delicate pastels",
    summer: "Explore bold, saturated summer hues",
    fall: "Photograph the warm palette of autumn",
    winter: "Work with muted tones and cool colors",
  },
  pause6: {
    spring: "Feel smooth new bark and soft petals",
    summer: "Experience rough bark and dense foliage",
    fall: "Touch dry, crisp fallen leaves",
    winter: "Sense the hardness of ice and frozen surfaces",
  },
  pause7: {
    spring: "Try new angles on familiar spring scenes",
    summer: "Shoot from ground level in tall grass",
    fall: "Look up through changing canopies",
    winter: "Explore low-angle winter light",
  },
  pause8: {
    spring: "Photograph gentle spring rain and mist",
    summer: "Capture dramatic summer storms",
    fall: "Work with overcast autumn days",
    winter: "Embrace snow, ice, and winter weather",
  },
  pause9: {
    spring: "Shoot the soft light of spring evenings",
    summer: "Photograph long summer sunsets",
    fall: "Capture the golden light of autumn twilight",
    winter: "Work with the brief winter dusk",
  },
  pause10: {
    spring: "Reflect on your growth this spring",
    summer: "Celebrate your flourishing practice",
    fall: "Harvest the wisdom of your journey",
    winter: "Rest and integrate your learning",
  },
};
