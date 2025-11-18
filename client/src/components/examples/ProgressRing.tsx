import ProgressRing from '../ProgressRing';

export default function ProgressRingExample() {
  return (
    <div className="p-6 flex gap-8">
      <ProgressRing progress={25} label="Week 1" />
      <ProgressRing progress={65} label="Overall" />
      <ProgressRing progress={100} label="Pause 1" />
    </div>
  );
}
