import { TCSchedule } from '@/lib/types';
import { format } from 'date-fns';

interface ScheduleCardProps {
  schedule: TCSchedule;
}

export default function ScheduleCard({ schedule }: ScheduleCardProps) {
  const appointmentCount = schedule.appointments.length;

  // Determine card color based on workload
  const getWorkloadColor = (count: number) => {
    if (count === 0) return 'bg-gray-100 border-gray-300';
    if (count <= 2) return 'bg-green-50 border-green-300';
    if (count <= 4) return 'bg-yellow-50 border-yellow-300';
    return 'bg-red-50 border-red-300';
  };

  const formatDate = (dateStr: string) => {
    try {
      const parts = dateStr.split('/');
      if (parts.length === 3) {
        const month = parseInt(parts[0]) - 1;
        const day = parseInt(parts[1]);
        const year = parseInt(parts[2]) + 2000;
        return format(new Date(year, month, day), 'EEE, MMM d');
      }
    } catch {
      return dateStr;
    }
    return dateStr;
  };

  return (
    <div className={`border-2 rounded-lg p-4 ${getWorkloadColor(appointmentCount)}`}>
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-bold text-lg">{schedule.tcName}</h3>
          <p className="text-sm text-gray-600">{formatDate(schedule.date)}</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-gray-800">{appointmentCount}</div>
          <div className="text-xs text-gray-500">appts</div>
        </div>
      </div>

      <div className="mb-3">
        <div className="flex items-center gap-2">
          <p className="font-semibold text-sm">{schedule.location}</p>
          {schedule.matchQuality === 'fuzzy' && (
            <span className="text-xs bg-yellow-200 text-yellow-800 px-2 py-0.5 rounded" title="Location matched via fuzzy logic">
              ~
            </span>
          )}
          {schedule.matchQuality === 'unmatched' && (
            <span className="text-xs bg-red-200 text-red-800 px-2 py-0.5 rounded" title="Location not matched">
              !
            </span>
          )}
        </div>
        <p className="text-xs text-gray-600">{schedule.address}</p>
        <p className="text-xs text-gray-500 mt-1">
          {schedule.startTime} - {schedule.endTime}
        </p>
      </div>

      {schedule.appointments.length > 0 && (
        <div className="border-t pt-3 mt-3">
          <p className="text-xs font-semibold mb-2 text-gray-700">Appointments:</p>
          <div className="space-y-2">
            {schedule.appointments.map((appt) => (
              <div
                key={appt.appt_guid}
                className="bg-white rounded p-2 text-xs border border-gray-200"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold">{appt.patient_full_name}</p>
                    <p className="text-gray-600">{appt.appt_type}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{appt.appt_time}</p>
                    <p className="text-gray-500">{appt.appt_care_center_location}</p>
                  </div>
                </div>
                {appt.appt_note && (
                  <p className="mt-1 text-gray-500 italic">{appt.appt_note}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
