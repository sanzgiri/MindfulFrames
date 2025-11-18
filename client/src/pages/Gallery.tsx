import PhotoGallery from "@/components/PhotoGallery";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Camera } from "lucide-react";
import { usePhotos } from "@/hooks/use-photos";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Pause } from "@shared/schema";

export default function Gallery() {
  const { photos, isLoading } = usePhotos();
  const { data: pauses = [] } = useQuery<Pause[]>({
    queryKey: ["/api/pauses"],
  });

  const formattedPhotos = useMemo(() => {
    return photos.map(photo => ({
      id: String(photo.id),
      url: photo.objectPath,
      caption: photo.caption || undefined,
      date: new Date(photo.createdAt!).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      pauseNumber: photo.pauseId,
    }));
  }, [photos]);

  const uniquePauseNumbers = Array.from(new Set(formattedPhotos.map(p => p.pauseNumber))).sort();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your photos...</p>
        </div>
      </div>
    );
  }

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

        {formattedPhotos.length === 0 ? (
          <div className="text-center py-16">
            <Camera className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No photos yet</h3>
            <p className="text-muted-foreground">
              Start uploading photos as you work through your pauses
            </p>
          </div>
        ) : (
          <Tabs defaultValue="all" className="space-y-6">
            <TabsList>
              <TabsTrigger value="all" data-testid="tab-all-photos">
                All Photos ({formattedPhotos.length})
              </TabsTrigger>
              {uniquePauseNumbers.map(pauseNum => {
                const pausePhotos = formattedPhotos.filter(p => p.pauseNumber === pauseNum);
                const pause = pauses.find(p => p.id === pauseNum);
                return (
                  <TabsTrigger 
                    key={pauseNum} 
                    value={`pause${pauseNum}`}
                    data-testid={`tab-pause${pauseNum}-photos`}
                  >
                    {pause?.title || `Pause ${pauseNum}`} ({pausePhotos.length})
                  </TabsTrigger>
                );
              })}
            </TabsList>

            <TabsContent value="all">
              <PhotoGallery
                photos={formattedPhotos}
                onPhotoClick={(photo) => console.log('Photo clicked:', photo)}
              />
            </TabsContent>

            {uniquePauseNumbers.map(pauseNum => {
              const pausePhotos = formattedPhotos.filter(p => p.pauseNumber === pauseNum);
              return (
                <TabsContent key={pauseNum} value={`pause${pauseNum}`}>
                  <PhotoGallery
                    photos={pausePhotos}
                    onPhotoClick={(photo) => console.log('Photo clicked:', photo)}
                  />
                </TabsContent>
              );
            })}
          </Tabs>
        )}
      </div>
    </div>
  );
}
