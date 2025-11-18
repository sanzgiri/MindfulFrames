import ActivityChecklist from '../ActivityChecklist';
import { useState } from 'react';

export default function ActivityChecklistExample() {
  const [activities, setActivities] = useState([
    { id: '1', title: 'Beginner\'s Mind Meditation', duration: '10 minutes', completed: true },
    { id: '2', title: 'First Sight Photography Project', duration: '20 minutes', completed: false },
    { id: '3', title: 'Morning Window Observation', duration: '5 minutes', completed: false },
  ]);

  const handleToggle = (id: string) => {
    setActivities(prev => 
      prev.map(a => a.id === id ? { ...a, completed: !a.completed } : a)
    );
  };

  return (
    <div className="p-6 max-w-md">
      <ActivityChecklist
        title="Today's Practices"
        activities={activities}
        onToggle={handleToggle}
      />
    </div>
  );
}
