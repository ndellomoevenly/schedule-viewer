import { TCSchedule } from '@/lib/types';

interface StatsOverviewProps {
  schedules: TCSchedule[];
}

export default function StatsOverview({ schedules }: StatsOverviewProps) {
  const totalTCs = new Set(schedules.map((s) => s.tcName)).size;
  const totalAppointments = schedules.reduce((sum, s) => sum + s.appointments.length, 0);
  const totalLocations = new Set(schedules.map((s) => s.location)).size;

  const busyTCs = schedules.filter((s) => s.appointments.length >= 5).length;
  const idleTCs = schedules.filter((s) => s.appointments.length === 0).length;

  // Data quality metrics
  const exactMatches = schedules.filter((s) => s.matchQuality === 'exact').length;
  const matchRate = schedules.length > 0 ? Math.round((exactMatches / schedules.length) * 100) : 0;

  return (
    <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
      <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4">
        <div className="text-3xl font-bold text-blue-900">{totalTCs}</div>
        <div className="text-sm text-blue-700">Active TCs</div>
      </div>

      <div className="bg-purple-50 border-2 border-purple-300 rounded-lg p-4">
        <div className="text-3xl font-bold text-purple-900">{totalAppointments}</div>
        <div className="text-sm text-purple-700">Total Appts</div>
      </div>

      <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4">
        <div className="text-3xl font-bold text-green-900">{totalLocations}</div>
        <div className="text-sm text-green-700">Locations</div>
      </div>

      <div className="bg-orange-50 border-2 border-orange-300 rounded-lg p-4">
        <div className="text-3xl font-bold text-orange-900">{busyTCs}</div>
        <div className="text-sm text-orange-700">Busy (5+ appts)</div>
      </div>

      <div className="bg-gray-50 border-2 border-gray-300 rounded-lg p-4">
        <div className="text-3xl font-bold text-gray-900">{idleTCs}</div>
        <div className="text-sm text-gray-700">Idle (0 appts)</div>
      </div>

      <div className="bg-teal-50 border-2 border-teal-300 rounded-lg p-4">
        <div className="text-3xl font-bold text-teal-900">{matchRate}%</div>
        <div className="text-sm text-teal-700">Location Match</div>
        <div className="text-xs text-teal-600 mt-1">{exactMatches} exact</div>
      </div>
    </div>
  );
}
