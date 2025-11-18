import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin } from "lucide-react";

interface LocationToggleProps {
  selectedLocation: 'portland' | 'murrayhill';
  onLocationChange: (location: 'portland' | 'murrayhill') => void;
}

export default function LocationToggle({ selectedLocation, onLocationChange }: LocationToggleProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start gap-3">
          <MapPin className="h-5 w-5 text-primary mt-0.5" />
          <CardTitle className="text-base">Location Version</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={selectedLocation} onValueChange={(v) => onLocationChange(v as 'portland' | 'murrayhill')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="portland" data-testid="tab-portland">Portland</TabsTrigger>
            <TabsTrigger value="murrayhill" data-testid="tab-murrayhill">Murrayhill/Beaverton</TabsTrigger>
          </TabsList>
        </Tabs>
        <p className="text-xs text-muted-foreground mt-3">
          {selectedLocation === 'portland' 
            ? 'Showing Portland-specific locations and activities' 
            : 'Showing Murrayhill/Beaverton-specific locations and activities'}
        </p>
      </CardContent>
    </Card>
  );
}
