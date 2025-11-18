import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

interface PhotographerReferenceProps {
  name: string;
  description: string;
  sampleImages: string[];
  externalLink: string;
}

export default function PhotographerReference({ 
  name, 
  description, 
  sampleImages,
  externalLink 
}: PhotographerReferenceProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{name}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{description}</p>
        
        <div className="grid grid-cols-3 gap-2">
          {sampleImages.map((url, index) => (
            <div key={index} className="aspect-square overflow-hidden rounded-md">
              <img 
                src={url} 
                alt={`${name} sample ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>

        <Button 
          variant="outline" 
          size="sm" 
          className="w-full"
          onClick={() => window.open(externalLink, '_blank')}
          data-testid="button-view-gallery"
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          View Full Gallery
        </Button>
      </CardContent>
    </Card>
  );
}
