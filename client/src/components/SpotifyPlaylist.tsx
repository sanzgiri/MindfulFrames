import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Music } from "lucide-react";
import { SiSpotify } from "react-icons/si";

interface SpotifyPlaylistProps {
  title: string;
  description: string;
  spotifyUrl: string;
}

export default function SpotifyPlaylist({ title, description, spotifyUrl }: SpotifyPlaylistProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start gap-3">
          <Music className="h-5 w-5 text-primary mt-0.5" />
          <div className="flex-1">
            <CardTitle className="text-base">{title}</CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{description}</p>
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full"
          onClick={() => window.open(spotifyUrl, '_blank')}
          data-testid="button-open-spotify"
        >
          <SiSpotify className="h-4 w-4 mr-2" />
          Open in Spotify
        </Button>
      </CardContent>
    </Card>
  );
}
