import LocationCard from '../LocationCard';

export default function LocationCardExample() {
  return (
    <div className="p-6 max-w-sm">
      <LocationCard
        name="Hoyt Arboretum"
        description="Explore the fall foliage with fresh attention"
        address="4000 SW Fairview Blvd, Portland, OR 97221"
        imageUrl="/api/placeholder/400/200"
        onGetDirections={() => console.log('Get directions clicked')}
      />
    </div>
  );
}
