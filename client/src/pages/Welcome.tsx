import HeroSection from "@/components/HeroSection";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, Camera, BookOpen, MapPin } from "lucide-react";
import StartDatePicker from "@/components/StartDatePicker";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";

export default function Welcome() {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const { user, isAuthenticated, login, updateSettings } = useAuth();
  const [, setLocation] = useLocation();

  const handleGetStarted = () => {
    if (!isAuthenticated) {
      login();
      return;
    }
    setShowDatePicker(true);
    const element = document.getElementById('date-picker');
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleDateSelect = async (date: Date) => {
    if (isAuthenticated) {
      await updateSettings({ startDate: date.toISOString() });
      setLocation('/dashboard');
    }
  };

  return (
    <div className="min-h-screen">
      <HeroSection onGetStarted={handleGetStarted} />

      <div className="max-w-6xl mx-auto px-4 md:px-8 py-16 space-y-16">
        <section className="text-center space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold">
            What is This Journey?
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            An experiential 10-week journey integrating mindfulness practices with photography 
            exercises to foster attentive, reflective, and conscious seeing.
          </p>
        </section>

        <section className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader>
              <Brain className="h-10 w-10 text-primary mb-3" />
              <CardTitle className="text-lg">Mindfulness</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Daily meditation practices designed to cultivate present-moment awareness
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Camera className="h-10 w-10 text-primary mb-3" />
              <CardTitle className="text-lg">Photography</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Weekly projects that transform how you see and capture the world
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <BookOpen className="h-10 w-10 text-primary mb-3" />
              <CardTitle className="text-lg">Journaling</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Reflective prompts to deepen your understanding and insights
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <MapPin className="h-10 w-10 text-primary mb-3" />
              <CardTitle className="text-lg">Exploration</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Curated locations in Portland and beyond for weekend excursions
              </p>
            </CardContent>
          </Card>
        </section>

        <section className="space-y-8">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold">
              The 10 Pauses
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Each week focuses on a different theme, building your skills in both mindfulness and photography
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              { num: 1, title: "Awakening the Gaze", theme: "Learning to See the Present Moment" },
              { num: 2, title: "Breathing with Light", theme: "Synchronizing Breath and Vision" },
              { num: 3, title: "The Body as Landscape", theme: "Embodied Awareness" },
              { num: 4, title: "Textures of Emotion", theme: "Feeling Through Seeing" },
              { num: 5, title: "Shadows & Silence", theme: "Embracing the Unseen" },
              { num: 6, title: "Motion & Stillness", theme: "Capturing the Flow of Time" },
              { num: 7, title: "Weather as Teacher", theme: "Photographing the Elements" },
              { num: 8, title: "Patterns of Connection", theme: "Seeing Relationships" },
              { num: 9, title: "Gratitude & Beauty", theme: "Finding Light in Darkness" },
              { num: 10, title: "Integration", theme: "Your Vision, Your Voice" },
            ].map((pause) => (
              <Card key={pause.num}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                      {pause.num}
                    </div>
                  </div>
                  <CardTitle className="text-lg">{pause.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{pause.theme}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {showDatePicker && (
          <section id="date-picker" className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to Begin?
              </h2>
              <p className="text-lg text-muted-foreground">
                Choose your start date and begin your journey
              </p>
            </div>
            <StartDatePicker
              onDateSelect={handleDateSelect}
            />
          </section>
        )}
      </div>
    </div>
  );
}
