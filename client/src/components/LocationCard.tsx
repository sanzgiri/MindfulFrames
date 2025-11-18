import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Navigation } from "lucide-react";

interface LocationCardProps {
  name: string;
  description: string;
  address?: string;
  imageUrl?: string;
  onGetDirections: () => void;
}

export default function LocationCard({ 
  name, 
  description, 
  address,
  imageUrl,
  onGetDirections 
}: LocationCardProps) {
  return (
    <Card className="overflow-hidden">
      {imageUrl && (
        <div className="h-32 overflow-hidden">
          <img 
            src={imageUrl} 
            alt={name}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-start gap-2">
          <MapPin className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
          <span>{name}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">{description}</p>
        {address && (
          <p className="text-xs text-muted-foreground">{address}</p>
        )}
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full"
          onClick={onGetDirections}
          data-testid="button-get-directions"
        >
          <Navigation className="h-4 w-4 mr-2" />
          Get Directions
        </Button>
      </CardContent>
    </Card>
  );
}
