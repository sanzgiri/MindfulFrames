import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";

interface HeroSectionProps {
  onGetStarted: () => void;
}

export default function HeroSection({ onGetStarted }: HeroSectionProps) {
  return (
    <div className="relative h-[50vh] min-h-[400px] w-full overflow-hidden">
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url('/api/placeholder/1920/800')`,
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70" />
      
      <div className="relative h-full flex flex-col items-center justify-center text-center px-4 md:px-8">
        <h1 className="text-white text-3xl md:text-5xl font-bold mb-4 max-w-4xl">
          Photography & Mindfulness
        </h1>
        <p className="text-white/90 text-lg md:text-xl mb-8 max-w-2xl">
          A Journey Through 10 Pauses
        </p>
        <Button 
          size="lg" 
          variant="outline" 
          className="bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/20"
          onClick={onGetStarted}
          data-testid="button-get-started"
        >
          <Calendar className="mr-2 h-5 w-5" />
          Begin Your Journey
        </Button>
      </div>
    </div>
  );
}
