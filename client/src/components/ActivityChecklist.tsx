import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";

interface Activity {
  id: string;
  title: string;
  duration?: string;
  completed: boolean;
}

interface ActivityChecklistProps {
  title: string;
  activities: Activity[];
  onToggle: (activityId: string) => void;
}

export default function ActivityChecklist({ title, activities, onToggle }: ActivityChecklistProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className="flex items-start gap-3 p-3 rounded-md hover-elevate"
            data-testid={`activity-${activity.id}`}
          >
            <Checkbox
              id={activity.id}
              checked={activity.completed}
              onCheckedChange={() => onToggle(activity.id)}
              className="mt-0.5"
              data-testid={`checkbox-${activity.id}`}
            />
            <label
              htmlFor={activity.id}
              className="flex-1 cursor-pointer space-y-1"
            >
              <div className={`text-sm font-medium ${activity.completed ? 'line-through text-muted-foreground' : ''}`}>
                {activity.title}
              </div>
              {activity.duration && (
                <div className="text-xs text-muted-foreground">{activity.duration}</div>
              )}
            </label>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
