import LocationToggle from '../LocationToggle';
import { useState } from 'react';

export default function LocationToggleExample() {
  const [location, setLocation] = useState<'portland' | 'murrayhill'>('portland');

  return (
    <div className="p-6 max-w-md">
      <LocationToggle
        selectedLocation={location}
        onLocationChange={setLocation}
      />
    </div>
  );
}
