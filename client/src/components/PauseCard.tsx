import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Calendar, Camera, Brain } from "lucide-react";

interface PauseCardProps {
  pauseNumber: number;
  title: string;
  theme: string;
  dateRange: string;
  progress: number;
  imageUrl?: string;
  onClick: () => void;
}

export default function PauseCard({ 
  pauseNumber, 
  title, 
  theme, 
  dateRange, 
  progress,
  imageUrl,
  onClick 
}: PauseCardProps) {
  return (
    <Card 
      className="cursor-pointer overflow-visible"
      onClick={onClick}
      data-testid={`card-pause-${pauseNumber}`}
    >
      {imageUrl && (
        <div className="h-32 md:h-40 overflow-hidden">
          <img 
            src={imageUrl} 
            alt={title}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2 mb-2">
          <Badge variant="secondary" data-testid={`badge-pause-${pauseNumber}`}>
            Pause {pauseNumber}
          </Badge>
          <span className="text-xs text-muted-foreground">{dateRange}</span>
        </div>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">{theme}</p>
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Progress</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" data-testid={`progress-pause-${pauseNumber}`} />
        </div>
        <div className="flex gap-4 text-xs text-muted-foreground pt-2">
          <div className="flex items-center gap-1">
            <Brain className="h-3 w-3" />
            <span>Meditations</span>
          </div>
          <div className="flex items-center gap-1">
            <Camera className="h-3 w-3" />
            <span>Projects</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
