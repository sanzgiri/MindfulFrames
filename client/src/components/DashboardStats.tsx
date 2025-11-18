import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Camera, BookOpen, Calendar } from "lucide-react";

interface Stat {
  label: string;
  value: string | number;
  icon: 'check' | 'camera' | 'book' | 'calendar';
}

interface DashboardStatsProps {
  stats: Stat[];
}

const iconMap = {
  check: CheckCircle,
  camera: Camera,
  book: BookOpen,
  calendar: Calendar,
};

export default function DashboardStats({ stats }: DashboardStatsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat, index) => {
        const Icon = iconMap[stat.icon];
        return (
          <Card key={index} data-testid={`stat-${stat.label.toLowerCase().replace(/\s/g, '-')}`}>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center space-y-2">
                <Icon className="h-8 w-8 text-primary" />
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
