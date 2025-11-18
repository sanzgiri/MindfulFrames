import PhotoGallery from "@/components/PhotoGallery";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Camera } from "lucide-react";

export default function Gallery() {
  //todo: remove mock functionality - replace with real data
  const mockPhotos = [
    { id: '1', url: '/api/placeholder/400/400', caption: 'Morning light through window', date: 'Oct 25, 2025', pauseNumber: 1 },
    { id: '2', url: '/api/placeholder/400/400', caption: 'First sight project - coffee cup', date: 'Oct 26, 2025', pauseNumber: 1 },
    { id: '3', url: '/api/placeholder/400/400', caption: 'Raindrops on glass', date: 'Oct 27, 2025', pauseNumber: 1 },
    { id: '4', url: '/api/placeholder/400/400', caption: 'Forest Park mist', date: 'Oct 28, 2025', pauseNumber: 1 },
    { id: '5', url: '/api/placeholder/400/400', caption: 'Light through clouds', date: 'Nov 2, 2025', pauseNumber: 2 },
    { id: '6', url: '/api/placeholder/400/400', caption: 'Willamette at golden hour', date: 'Nov 3, 2025', pauseNumber: 2 },
    { id: '7', url: '/api/placeholder/400/400', date: 'Nov 4, 2025', pauseNumber: 2 },
    { id: '8', url: '/api/placeholder/400/400', caption: 'Burnside Bridge reflections', date: 'Nov 5, 2025', pauseNumber: 2 },
  ];

  const pause1Photos = mockPhotos.filter(p => p.pauseNumber === 1);
  const pause2Photos = mockPhotos.filter(p => p.pauseNumber === 2);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Camera className="h-8 w-8 text-primary" />
            <h1 className="text-3xl md:text-4xl font-bold">Your Gallery</h1>
          </div>
          <p className="text-muted-foreground">
            View all your photography work organized by pause
          </p>
        </div>

        <Tabs defaultValue="all" className="space-y-6">
          <TabsList>
            <TabsTrigger value="all" data-testid="tab-all-photos">All Photos</TabsTrigger>
            <TabsTrigger value="pause1" data-testid="tab-pause1-photos">Pause 1</TabsTrigger>
            <TabsTrigger value="pause2" data-testid="tab-pause2-photos">Pause 2</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <PhotoGallery
              photos={mockPhotos}
              onPhotoClick={(photo) => console.log('Photo clicked:', photo)}
            />
          </TabsContent>

          <TabsContent value="pause1">
            <PhotoGallery
              photos={pause1Photos}
              onPhotoClick={(photo) => console.log('Photo clicked:', photo)}
            />
          </TabsContent>

          <TabsContent value="pause2">
            <PhotoGallery
              photos={pause2Photos}
              onPhotoClick={(photo) => console.log('Photo clicked:', photo)}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
