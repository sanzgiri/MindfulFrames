import DashboardStats from '../DashboardStats';

export default function DashboardStatsExample() {
  const mockStats = [
    { label: 'Activities Done', value: 12, icon: 'check' as const },
    { label: 'Photos Uploaded', value: 24, icon: 'camera' as const },
    { label: 'Journal Entries', value: 8, icon: 'book' as const },
    { label: 'Days Active', value: 15, icon: 'calendar' as const },
  ];

  return (
    <div className="p-6">
      <DashboardStats stats={mockStats} />
    </div>
  );
}
