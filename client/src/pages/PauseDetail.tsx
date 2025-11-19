import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import ActivityChecklist from "@/components/ActivityChecklist";
import JournalEntry from "@/components/JournalEntry";
import PhotoUpload from "@/components/PhotoUpload";
import LocationCard from "@/components/LocationCard";
import PhotographerReference from "@/components/PhotographerReference";
import SpotifyPlaylist from "@/components/SpotifyPlaylist";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation, useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import type { Pause, Activity, Location, Photographer } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { useProgress } from "@/hooks/use-progress";
import { usePhotos } from "@/hooks/use-photos";
import { useJournal } from "@/hooks/use-journal";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import autumnLeaves from '@assets/generated_images/Autumn_leaves_water_droplets_7fbabb58.png';
import willamette from '@assets/generated_images/Willamette_River_golden_hour_7e552f50.png';
import forestDawn from '@assets/generated_images/Forest_Park_misty_dawn_07796f10.png';
import rainDroplets from '@assets/generated_images/Rain_droplets_window_reflection_ff4bc57a.png';
import mossBark from '@assets/generated_images/Moss_covered_bark_texture_5f821545.png';

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
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };
  
  return `${formatDate(weekStart)} - ${formatDate(weekEnd)}`;
}

export default function PauseDetail() {
  const [, params] = useRoute("/pause/:weekNumber");
  const [, setLocation] = useLocation();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const weekNumber = params?.weekNumber ? parseInt(params.weekNumber) : 1;

  // Authentication is disabled - using demo user

  const { data: pauses = [], isLoading: pausesLoading } = useQuery<Pause[]>({
    queryKey: ["/api/pauses"],
    enabled: isAuthenticated,
    retry: false,
  });

  const pause = pauses.find(p => p.weekNumber === weekNumber);
  const pauseNotFound = !pausesLoading && pauses.length > 0 && !pause;

  const { data: activities = [], isLoading: activitiesLoading } = useQuery<Activity[]>({
    queryKey: ["/api/pauses", pause?.id, "activities"],
    enabled: !!pause?.id && isAuthenticated,
    retry: false,
  });

  const { data: locations = [] } = useQuery<Location[]>({
    queryKey: ["/api/pauses", pause?.id, "locations"],
    enabled: !!pause?.id && isAuthenticated,
    retry: false,
  });

  const { data: photographers = [] } = useQuery<Photographer[]>({
    queryKey: ["/api/pauses", pause?.id, "photographers"],
    enabled: !!pause?.id && isAuthenticated,
    retry: false,
  });

  const { progress, toggleActivity } = useProgress();
  const { uploadAndCreatePhoto } = usePhotos(pause?.id);
  const { entries, createEntry, updateEntry } = useJournal(pause?.id);

  const startDate = user?.startDate ? new Date(user.startDate) : new Date();
  const dateRange = pause ? getDateRange(startDate, pause.weekNumber) : '';

  const activityItems = activities.map(activity => {
    const isCompleted = progress.some(p => p.activityId === activity.id);
    return {
      id: String(activity.id),
      title: activity.title,
      duration: activity.duration || undefined,
      completed: isCompleted,
    };
  });

  const handleActivityToggle = async (activityId: string) => {
    const activity = activities.find(a => a.id === parseInt(activityId));
    if (!activity) return;
    
    const isCurrentlyCompleted = progress.some(p => p.activityId === activity.id);
    await toggleActivity(activity.id, !isCurrentlyCompleted);
  };

  const handlePhotoUpload = async (files: File[]) => {
    if (!pause) return;
    
    for (const file of files) {
      await uploadAndCreatePhoto(file, pause.id);
    }
  };

  const handleJournalSave = async (content: string, promptText: string) => {
    if (!pause) return;

    const existingEntry = entries.find(e => e.prompt === promptText);
    
    if (existingEntry) {
      await updateEntry(existingEntry.id, content);
    } else {
      await createEntry({
        pauseId: pause.id,
        prompt: promptText,
        content,
      });
    }
  };

  const defaultJournalPrompts = [
    `Reflect on this week's ${pause?.title || 'practice'}. What did you notice?`,
    `How did this week's exercises change your perspective?`,
  ];

  if (pauseNotFound) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold">Pause Not Found</h2>
          <p className="text-muted-foreground">This pause doesn't exist in your journey.</p>
          <Button onClick={() => setLocation('/dashboard')} data-testid="button-back-to-dashboard">
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  if (!pause || pausesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading pause details...</p>
        </div>
      </div>
    );
  }

  const imageUrl = pauseImages[pause.id - 1] || autumnLeaves;

  return (
    <div className="min-h-screen">
      <div 
        className="relative h-[40vh] min-h-[300px] w-full overflow-hidden"
        style={{
          backgroundImage: `url(${imageUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70" />
        
        <div className="relative h-full flex flex-col justify-between p-4 md:p-8">
          <Button 
            variant="ghost" 
            size="sm"
            className="w-fit text-white hover:bg-white/10"
            onClick={() => setLocation('/dashboard')}
            data-testid="button-back"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>

          <div>
            <Badge variant="secondary" className="mb-3 bg-white/20 text-white border-0">
              Pause {pause.weekNumber}
            </Badge>
            <h1 className="text-white text-3xl md:text-4xl font-bold mb-2">
              {pause.title}
            </h1>
            <p className="text-white/90 text-lg">
              {pause.theme}
            </p>
            <p className="text-white/70 text-sm mt-2">
              {dateRange}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
            <TabsTrigger value="practice" data-testid="tab-practice">Practice</TabsTrigger>
            <TabsTrigger value="resources" data-testid="tab-resources">Resources</TabsTrigger>
            <TabsTrigger value="journal" data-testid="tab-journal">Journal</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Theme</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm max-w-none">
                <p className="text-muted-foreground">
                  {pause.description || 'Explore this week\'s theme through mindfulness and photography practices.'}
                </p>
              </CardContent>
            </Card>

            <ActivityChecklist
              title="This Week's Activities"
              activities={activityItems}
              onToggle={handleActivityToggle}
            />
          </TabsContent>

          <TabsContent value="practice" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Mindfulness Practice Guide</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm max-w-none space-y-4">
                {activities.filter(a => a.activityType === 'meditation').length > 0 ? (
                  activities.filter(a => a.activityType === 'meditation').map(activity => (
                    <div key={activity.id} className="space-y-3 pb-4 border-b last:border-0 last:pb-0">
                      <h3 className="font-semibold text-base text-foreground">{activity.title}</h3>
                      {activity.duration && (
                        <p className="text-sm text-muted-foreground">Duration: {activity.duration}</p>
                      )}
                      {activity.description && (
                        <p className="text-sm text-muted-foreground">{activity.description}</p>
                      )}
                      <div className="text-sm text-muted-foreground mt-3">
                        <p className="font-medium text-foreground mb-2">How to practice:</p>
                        <ol className="space-y-1 ml-4 list-decimal">
                          <li>Find a quiet space where you won't be disturbed</li>
                          <li>Sit comfortably with your spine upright but relaxed</li>
                          <li>Set a timer for the recommended duration</li>
                          <li>Begin the practice as described, returning to the focus point whenever your mind wanders</li>
                          <li>When the timer sounds, take a moment to notice how you feel before ending</li>
                        </ol>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground">No meditation practices assigned for this pause.</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Photography Project Guide</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {activities.filter(a => a.activityType === 'project').length > 0 ? (
                  activities.filter(a => a.activityType === 'project').map(activity => (
                    <div key={activity.id} className="space-y-3">
                      <h3 className="font-semibold text-base">{activity.title}</h3>
                      {activity.description && (
                        <p className="text-sm text-muted-foreground">{activity.description}</p>
                      )}
                      <div className="text-sm text-muted-foreground mt-3">
                        <p className="font-medium text-foreground mb-2">Tips for this project:</p>
                        <ul className="space-y-1 ml-4 list-disc">
                          <li>Take your time - this is about seeing, not just shooting</li>
                          <li>Experiment with different times of day and lighting conditions</li>
                          <li>Review your photos each evening and notice what draws your eye</li>
                          <li>Don't judge your work - this is a practice, not a performance</li>
                        </ul>
                      </div>
                      <div className="mt-4 pt-4 border-t">
                        <PhotoUpload
                          onUpload={handlePhotoUpload}
                          maxFiles={10}
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground">No photography projects assigned for this pause.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="resources" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {pause.spotifyPlaylistUrl && (
                <SpotifyPlaylist
                  title={`${pause.title} Playlist`}
                  description={pause.spotifyDescription || "Curated music for this week's practice"}
                  spotifyUrl={pause.spotifyPlaylistUrl}
                />
              )}

              {locations.map(location => (
                <LocationCard
                  key={location.id}
                  name={location.name}
                  description={location.description || ''}
                  address={location.address || ''}
                  onGetDirections={() => {
                    if (location.address) {
                      const address = encodeURIComponent(location.address);
                      window.open(`https://maps.apple.com/?address=${address}`, '_blank');
                    }
                  }}
                />
              ))}
            </div>

            {photographers.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Photographer References</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  {photographers.filter(p => p.externalLink).map(photographer => (
                    <PhotographerReference
                      key={photographer.id}
                      name={photographer.name}
                      description={photographer.description || ''}
                      sampleImages={
                        Array.isArray(photographer.sampleImages) 
                          ? photographer.sampleImages as string[]
                          : ['/api/placeholder/150/150', '/api/placeholder/150/150', '/api/placeholder/150/150']
                      }
                      externalLink={photographer.externalLink!}
                    />
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="journal" className="space-y-6">
            {defaultJournalPrompts.map((prompt, index) => {
              const existingEntry = entries.find(e => e.prompt === prompt);
              return (
                <JournalEntry
                  key={index}
                  prompt={prompt}
                  initialValue={existingEntry?.content || ''}
                  onSave={(content) => handleJournalSave(content, prompt)}
                />
              );
            })}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
