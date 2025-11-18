import PauseCard from "@/components/PauseCard";
import DashboardStats from "@/components/DashboardStats";
import ProgressRing from "@/components/ProgressRing";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import forestDawn from '@assets/generated_images/Forest_Park_misty_dawn_07796f10.png';
import autumnLeaves from '@assets/generated_images/Autumn_leaves_water_droplets_7fbabb58.png';
import willamette from '@assets/generated_images/Willamette_River_golden_hour_7e552f50.png';
import rainDroplets from '@assets/generated_images/Rain_droplets_window_reflection_ff4bc57a.png';
import mossBark from '@assets/generated_images/Moss_covered_bark_texture_5f821545.png';
import { useQuery } from "@tanstack/react-query";
import type { Pause } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { useProgress } from "@/hooks/use-progress";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

const pauseImages = [
  autumnLeaves,
  willamette,
  mossBark,
  rainDroplets,
  forestDawn,
  autumnLeaves,
  willamette,
  mossBark,
  rainDroplets,
  forestDawn,
];

function getDateRange(startDate: Date, weekNumber: number): string {
  const weekStart = new Date(startDate);
  weekStart.setDate(weekStart.getDate() + (weekNumber - 1) * 7);
  
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };
  
  return `${formatDate(weekStart)}-${formatDate(weekEnd)}`;
}

function getCurrentWeek(startDate: Date): number {
  const now = new Date();
  const diffTime = now.getTime() - startDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const weekNumber = Math.floor(diffDays / 7) + 1;
  return Math.max(1, Math.min(10, weekNumber));
}

export default function Home() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { progress, getCompletedCount } = useProgress();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Please log in",
        description: "You need to log in to access your dashboard",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [isAuthenticated, authLoading, toast]);

  const { data: pauses = [], isLoading: pausesLoading } = useQuery<Pause[]>({
    queryKey: ["/api/pauses"],
    retry: false,
    enabled: isAuthenticated,
  });

  const { data: allActivities = [], isLoading: activitiesLoading } = useQuery<any[]>({
    queryKey: ["/api/activities"],
    enabled: isAuthenticated,
    retry: false,
  });

  const { data: photos = [] } = useQuery<any[]>({
    queryKey: ["/api/photos"],
    enabled: isAuthenticated,
    retry: false,
  });

  const { data: journalEntries = [] } = useQuery<any[]>({
    queryKey: ["/api/journal"],
    enabled: isAuthenticated,
    retry: false,
  });

  const startDate = user?.startDate ? new Date(user.startDate) : new Date();
  const currentWeek = getCurrentWeek(startDate);
  const daysActive = Math.floor((new Date().getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

  const allActivityIds = allActivities.map(a => a.id);
  const completedActivities = getCompletedCount(allActivityIds);
  const totalActivities = allActivityIds.length;
  const overallProgress = totalActivities > 0 ? Math.round((completedActivities / totalActivities) * 100) : 0;

  const pauseActivityMap = new Map<number, number[]>();
  allActivities.forEach(activity => {
    const pauseId = activity.pauseId;
    if (!pauseActivityMap.has(pauseId)) {
      pauseActivityMap.set(pauseId, []);
    }
    pauseActivityMap.get(pauseId)!.push(activity.id);
  });

  const completedPauses = pauses.filter(pause => {
    const pauseActivityIds = pauseActivityMap.get(pause.id) || [];
    return pauseActivityIds.length > 0 && getCompletedCount(pauseActivityIds) === pauseActivityIds.length;
  }).length;

  const stats = [
    { label: 'Pauses Complete', value: completedPauses, icon: 'check' as const },
    { label: 'Photos Uploaded', value: photos.length, icon: 'camera' as const },
    { label: 'Journal Entries', value: journalEntries.length, icon: 'book' as const },
    { label: 'Days Active', value: daysActive, icon: 'calendar' as const },
  ];

  const displayPauses = pauses.map(pause => {
    const pauseActivityIds = pauseActivityMap.get(pause.id) || [];
    const completed = getCompletedCount(pauseActivityIds);
    const total = pauseActivityIds.length || 1;
    const pauseProgress = Math.round((completed / total) * 100);

    return {
      pauseNumber: pause.weekNumber,
      title: pause.title,
      theme: pause.theme,
      dateRange: getDateRange(startDate, pause.weekNumber),
      progress: pauseProgress,
      imageUrl: pauseImages[pause.id - 1] || forestDawn,
    };
  });

  if (pausesLoading || activitiesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your journey...</p>
        </div>
      </div>
    );
  }

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
            Day {daysActive} • Pause {currentWeek} of 10
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 space-y-12">
        <section>
          <div className="flex items-center justify-center mb-8">
            <ProgressRing progress={overallProgress} size={140} label="Overall Progress" />
          </div>
          <DashboardStats stats={stats} />
        </section>

        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold">Your Pauses</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayPauses.map((pause) => (
              <PauseCard
                key={pause.pauseNumber}
                {...pause}
                onClick={() => setLocation(`/pause/${pause.pauseNumber}`)}
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
