import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import StartDatePicker from "@/components/StartDatePicker";
import LocationToggle from "@/components/LocationToggle";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Settings as SettingsIcon } from "lucide-react";
import { useState } from "react";

export default function Settings() {
  const [location, setLocation] = useState<'portland' | 'murrayhill'>('portland');
  const [darkMode, setDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
    console.log('Dark mode:', !darkMode);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-12">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <SettingsIcon className="h-8 w-8 text-primary" />
            <h1 className="text-3xl md:text-4xl font-bold">Settings</h1>
          </div>
          <p className="text-muted-foreground">
            Customize your journey preferences
          </p>
        </div>

        <div className="space-y-6">
          <StartDatePicker
            onDateSelect={(date) => console.log('Start date selected:', date)}
          />

          <LocationToggle
            selectedLocation={location}
            onLocationChange={(loc) => {
              setLocation(loc);
              console.log('Location changed to:', loc);
            }}
          />

          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="dark-mode">Dark Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Toggle between light and dark themes
                  </p>
                </div>
                <Switch
                  id="dark-mode"
                  checked={darkMode}
                  onCheckedChange={toggleDarkMode}
                  data-testid="switch-dark-mode"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>About</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>
                <strong>Photography & Mindfulness:</strong> A Journey Through 10 Pauses
              </p>
              <p>
                An experiential 10-week journey integrating mindfulness practices with photography 
                exercises to foster attentive, reflective, and conscious seeing.
              </p>
              <p className="pt-2 text-xs">
                Version 1.0.0
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
