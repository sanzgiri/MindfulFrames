import PhotographerReference from '../PhotographerReference';

export default function PhotographerReferenceExample() {
  return (
    <div className="p-6 max-w-md">
      <PhotographerReference
        name="Saul Leiter"
        description="Master of seeing the ordinary with fresh eyes"
        sampleImages={[
          '/api/placeholder/150/150',
          '/api/placeholder/150/150',
          '/api/placeholder/150/150',
        ]}
        externalLink="https://www.saulleiter.org"
      />
    </div>
  );
}
