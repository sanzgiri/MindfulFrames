import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, X } from "lucide-react";
import { useState } from "react";

interface Photo {
  id: string;
  url: string;
  caption?: string;
  date: string;
  pauseNumber: number;
}

interface PhotoGalleryProps {
  photos: Photo[];
  onPhotoClick?: (photo: Photo) => void;
}

export default function PhotoGallery({ photos, onPhotoClick }: PhotoGalleryProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);

  const handlePhotoClick = (photo: Photo) => {
    setSelectedPhoto(photo);
    onPhotoClick?.(photo);
  };

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {photos.map((photo) => (
          <Card
            key={photo.id}
            className="overflow-hidden hover-elevate active-elevate-2 cursor-pointer group"
            onClick={() => handlePhotoClick(photo)}
            data-testid={`photo-${photo.id}`}
          >
            <div className="aspect-square relative overflow-hidden">
              <img
                src={photo.url}
                alt={photo.caption || 'Photo'}
                className="w-full h-full object-cover transition-transform group-hover:scale-105"
              />
              <div className="absolute top-2 right-2">
                <Badge variant="secondary" className="bg-black/50 text-white border-0">
                  Pause {photo.pauseNumber}
                </Badge>
              </div>
            </div>
            {photo.caption && (
              <div className="p-3 space-y-1">
                <p className="text-xs text-muted-foreground line-clamp-2">{photo.caption}</p>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  <span>{photo.date}</span>
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>

      {selectedPhoto && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedPhoto(null)}
          data-testid="photo-lightbox"
        >
          <button
            className="absolute top-4 right-4 text-white hover-elevate p-2 rounded-md"
            onClick={() => setSelectedPhoto(null)}
            data-testid="button-close-lightbox"
          >
            <X className="h-6 w-6" />
          </button>
          <img
            src={selectedPhoto.url}
            alt={selectedPhoto.caption || 'Photo'}
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}
