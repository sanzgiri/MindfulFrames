import HeroSection from "@/components/HeroSection";
import PauseCard from "@/components/PauseCard";
import DashboardStats from "@/components/DashboardStats";
import ProgressRing from "@/components/ProgressRing";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import forestDawn from '@assets/generated_images/Forest_Park_misty_dawn_07796f10.png';
import rainDroplets from '@assets/generated_images/Rain_droplets_window_reflection_ff4bc57a.png';
import willamette from '@assets/generated_images/Willamette_River_golden_hour_7e552f50.png';
import autumnLeaves from '@assets/generated_images/Autumn_leaves_water_droplets_7fbabb58.png';
import mossBark from '@assets/generated_images/Moss_covered_bark_texture_5f821545.png';
import zenGarden from '@assets/generated_images/Zen_garden_stones_water_ca2e4906.png';

export default function Home() {
  //todo: remove mock functionality - replace with real data
  const mockStats = [
    { label: 'Pauses Complete', value: 2, icon: 'check' as const },
    { label: 'Photos Uploaded', value: 24, icon: 'camera' as const },
    { label: 'Journal Entries', value: 8, icon: 'book' as const },
    { label: 'Days Active', value: 15, icon: 'calendar' as const },
  ];

  //todo: remove mock functionality - replace with real data
  const mockPauses = [
    {
      pauseNumber: 1,
      title: "Awakening the Gaze",
      theme: "Learning to See the Present Moment",
      dateRange: "Oct 25-31",
      progress: 100,
      imageUrl: autumnLeaves,
    },
    {
      pauseNumber: 2,
      title: "Breathing with Light",
      theme: "Synchronizing Breath and Vision",
      dateRange: "Nov 1-7",
      progress: 65,
      imageUrl: willamette,
    },
    {
      pauseNumber: 3,
      title: "The Body as Landscape",
      theme: "Embodied Awareness",
      dateRange: "Nov 8-14",
      progress: 0,
      imageUrl: mossBark,
    },
    {
      pauseNumber: 4,
      title: "Textures of Emotion",
      theme: "Feeling Through Seeing",
      dateRange: "Nov 15-21",
      progress: 0,
      imageUrl: rainDroplets,
    },
  ];

  return (
    <div className="min-h-screen">
      <div 
        className="relative h-[50vh] min-h-[400px] w-full overflow-hidden"
        style={{
          backgroundImage: `url(${forestDawn})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70" />
        
        <div className="relative h-full flex flex-col items-center justify-center text-center px-4 md:px-8">
          <h1 className="text-white text-3xl md:text-5xl font-bold mb-4 max-w-4xl">
            Your 10-Week Journey
          </h1>
          <p className="text-white/90 text-lg md:text-xl mb-2">
            Photography & Mindfulness
          </p>
          <p className="text-white/70 text-sm md:text-base mb-8">
            Day 15 • Pause 2 of 10
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 space-y-12">
        <section>
          <div className="flex items-center justify-center mb-8">
            <ProgressRing progress={20} size={140} label="Overall Progress" />
          </div>
          <DashboardStats stats={mockStats} />
        </section>

        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold">Your Pauses</h2>
            <Button variant="ghost" size="sm" data-testid="button-view-all">
              View All
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockPauses.map((pause) => (
              <PauseCard
                key={pause.pauseNumber}
                {...pause}
                onClick={() => console.log('Navigate to pause', pause.pauseNumber)}
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
