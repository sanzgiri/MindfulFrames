import PhotoGallery from '../PhotoGallery';

export default function PhotoGalleryExample() {
  const mockPhotos = [
    { id: '1', url: '/api/placeholder/400/400', caption: 'Morning light through window', date: 'Oct 25, 2025', pauseNumber: 1 },
    { id: '2', url: '/api/placeholder/400/400', caption: 'First sight project', date: 'Oct 26, 2025', pauseNumber: 1 },
    { id: '3', url: '/api/placeholder/400/400', caption: 'Raindrops on glass', date: 'Oct 27, 2025', pauseNumber: 1 },
    { id: '4', url: '/api/placeholder/400/400', date: 'Oct 28, 2025', pauseNumber: 2 },
  ];

  return (
    <div className="p-6">
      <PhotoGallery
        photos={mockPhotos}
        onPhotoClick={(photo) => console.log('Photo clicked:', photo)}
      />
    </div>
  );
}
