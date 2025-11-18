import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import ActivityChecklist from "@/components/ActivityChecklist";
import JournalEntry from "@/components/JournalEntry";
import PhotoUpload from "@/components/PhotoUpload";
import LocationCard from "@/components/LocationCard";
import PhotographerReference from "@/components/PhotographerReference";
import SpotifyPlaylist from "@/components/SpotifyPlaylist";
import { ArrowLeft, Music, MapPin, Camera as CameraIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import autumnLeaves from '@assets/generated_images/Autumn_leaves_water_droplets_7fbabb58.png';

export default function PauseDetail() {
  //todo: remove mock functionality - replace with real data
  const [activities, setActivities] = useState([
    { id: '1', title: 'Beginner\'s Mind Meditation', duration: '10 minutes', completed: true },
    { id: '2', title: 'First Sight Photography Project', duration: '20 minutes', completed: false },
    { id: '3', title: 'Morning Window Observation', duration: '5 minutes', completed: false },
    { id: '4', title: 'Weekend Excursion', completed: false },
  ]);

  const handleToggle = (id: string) => {
    setActivities(prev => 
      prev.map(a => a.id === id ? { ...a, completed: !a.completed } : a)
    );
  };

  return (
    <div className="min-h-screen">
      <div 
        className="relative h-[40vh] min-h-[300px] w-full overflow-hidden"
        style={{
          backgroundImage: `url(${autumnLeaves})`,
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
            onClick={() => console.log('Go back')}
            data-testid="button-back"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>

          <div>
            <Badge variant="secondary" className="mb-3 bg-white/20 text-white border-0">
              Pause 1
            </Badge>
            <h1 className="text-white text-3xl md:text-4xl font-bold mb-2">
              Awakening the Gaze
            </h1>
            <p className="text-white/90 text-lg">
              Learning to See the Present Moment
            </p>
            <p className="text-white/70 text-sm mt-2">
              October 25-31, 2025
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
                  Late October brings the peak of fall color and the beginning of the rainy season—perfect 
                  for noticing fresh details on wet surfaces and golden leaves. This week is about learning 
                  to see familiar surroundings with fresh eyes, as if experiencing them for the first time.
                </p>
              </CardContent>
            </Card>

            <ActivityChecklist
              title="This Week's Activities"
              activities={activities}
              onToggle={handleToggle}
            />
          </TabsContent>

          <TabsContent value="practice" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Mindfulness Practice</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <h3 className="font-medium">Beginner's Mind Meditation (10 minutes)</h3>
                <ol className="space-y-3 text-sm text-muted-foreground list-decimal list-inside">
                  <li>Sit comfortably by a window overlooking Portland's fall landscape</li>
                  <li>Take three deep breaths, inhaling the cool, moist air</li>
                  <li>Imagine seeing the world as if for the first time</li>
                  <li>When you open your eyes, observe one object nearby with fresh curiosity</li>
                  <li>Notice colors, textures, light, shadows as if you've never seen them before</li>
                </ol>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Photography Project: First Sight</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3 text-sm text-muted-foreground">
                  <p>Choose one ordinary object in your home. Spend 5 minutes just looking at it without your camera.</p>
                  <p>Take 10 photographs of this single object from different angles. Don't think about composition rules—just explore.</p>
                </div>
                <PhotoUpload
                  onUpload={(files) => console.log('Photos uploaded:', files)}
                  maxFiles={10}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="resources" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <SpotifyPlaylist
                title="Awakening Playlist"
                description="Ambient morning, awakening meditation, Brian Eno, Max Richter, Ólafur Arnalds"
                spotifyUrl="https://open.spotify.com/playlist/example"
              />

              <LocationCard
                name="Hoyt Arboretum"
                description="Explore the fall foliage with fresh attention"
                address="4000 SW Fairview Blvd, Portland, OR 97221"
                onGetDirections={() => {
                  const address = encodeURIComponent("4000 SW Fairview Blvd, Portland, OR 97221");
                  window.open(`https://maps.apple.com/?address=${address}`, '_blank');
                }}
              />
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Photographer References</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <PhotographerReference
                  name="Saul Leiter"
                  description="Master of seeing the ordinary with fresh eyes through windows, rain, and reflections"
                  sampleImages={[
                    '/api/placeholder/150/150',
                    '/api/placeholder/150/150',
                    '/api/placeholder/150/150',
                  ]}
                  externalLink="https://www.saulleiter.org"
                />
                <PhotographerReference
                  name="Vivian Maier"
                  description="Found extraordinary in everyday street scenes with a beginner's mind"
                  sampleImages={[
                    '/api/placeholder/150/150',
                    '/api/placeholder/150/150',
                    '/api/placeholder/150/150',
                  ]}
                  externalLink="https://www.vivianmaier.com"
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="journal" className="space-y-6">
            <JournalEntry
              prompt="Which image surprised you? What did you notice that you'd never seen before?"
              onSave={(content) => console.log('Journal saved:', content)}
            />
            <JournalEntry
              prompt="How did practicing beginner's mind change your relationship with familiar objects?"
              onSave={(content) => console.log('Journal saved:', content)}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
