import PauseCard from '../PauseCard';

export default function PauseCardExample() {
  return (
    <div className="p-6 max-w-sm">
      <PauseCard
        pauseNumber={1}
        title="Awakening the Gaze"
        theme="Learning to See the Present Moment"
        dateRange="Oct 25-31"
        progress={65}
        imageUrl="/api/placeholder/400/200"
        onClick={() => console.log('Pause card clicked')}
      />
    </div>
  );
}
