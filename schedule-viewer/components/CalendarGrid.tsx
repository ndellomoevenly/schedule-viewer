'use client';

import { useMemo, useState } from 'react';
import { TCSchedule } from '@/lib/types';
import AppointmentDetailModal from './AppointmentDetailModal';

interface CalendarGridProps {
  schedules: TCSchedule[];
}

interface CalendarCell {
  tcName: string;
  region: string;
  date: string;
  schedule?: TCSchedule;
}

export default function CalendarGrid({ schedules }: CalendarGridProps) {
  const [selectedCell, setSelectedCell] = useState<TCSchedule | null>(null);

  // Get next 14 days starting from today
  const dateColumns = useMemo(() => {
    const dates: Date[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 14; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      dates.push(date);
    }

    return dates;
  }, []);

  // Get unique TCs
  const uniqueTCs = useMemo(() => {
    const tcSet = new Set<string>();

    schedules.forEach((schedule) => {
      tcSet.add(schedule.tcName);
    });

    // Sort TC names alphabetically
    return Array.from(tcSet).sort();
  }, [schedules]);

  // Create a map for quick schedule lookup
  const scheduleMap = useMemo(() => {
    const map = new Map<string, TCSchedule>();

    schedules.forEach((schedule) => {
      const scheduleDate = new Date(schedule.date);
      scheduleDate.setHours(0, 0, 0, 0);
      const dateKey = scheduleDate.toISOString().split('T')[0];
      const key = `${schedule.tcName}|${dateKey}`;
      map.set(key, schedule);
    });

    return map;
  }, [schedules]);

  const getCellData = (tcName: string, date: Date): TCSchedule | undefined => {
    const dateKey = date.toISOString().split('T')[0];
    const key = `${tcName}|${dateKey}`;
    return scheduleMap.get(key);
  };

  const calculateTotalHours = (schedule: TCSchedule): string => {
    const start = new Date(`2000-01-01 ${schedule.startTime}`);
    const end = new Date(`2000-01-01 ${schedule.endTime}`);
    const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    return `${hours.toFixed(1)}h`;
  };

  const getAppointmentSummary = (schedule: TCSchedule): string => {
    const total = schedule.appointments.length;
    const consults = schedule.appointments.filter(a => a.is_consult === 'TRUE').length;
    const regular = total - consults;

    if (consults > 0 && regular > 0) {
      return `${consults}C, ${regular}R`;
    } else if (consults > 0) {
      return `${consults} Consult${consults !== 1 ? 's' : ''}`;
    } else {
      return `${regular} Reg${regular !== 1 ? '' : ''}`;
    }
  };

  return (
    <>
      <div className="overflow-auto border-2 border-slate-200 rounded-xl bg-white shadow-lg max-h-[calc(100vh-200px)]">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gradient-to-r from-slate-700 to-slate-600 border-b-2 border-slate-300 sticky top-0 z-20">
              <th className="border-r border-slate-300 px-4 py-4 text-left font-semibold text-sm min-w-[150px] sticky left-0 bg-gradient-to-r from-slate-700 to-slate-600 z-30 text-white">
                TC Name
              </th>
              {dateColumns.map((date) => (
                <th
                  key={date.toISOString()}
                  className="border-r border-slate-300 px-2 py-3 text-center font-semibold text-sm w-[120px] text-white"
                >
                  <div className="text-sm">{date.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                  <div className="text-xs font-normal text-slate-200">
                    {date.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' })}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {uniqueTCs.map((tcName) => (
              <tr key={tcName} className="border-b border-slate-200 hover:bg-slate-50 transition-colors">
                <td className="border-r border-slate-200 px-4 py-3 text-sm font-semibold text-slate-800 sticky left-0 bg-white z-10 shadow-sm">
                  {tcName}
                </td>
                {dateColumns.map((date) => {
                  const cellSchedule = getCellData(tcName, date);

                  return (
                    <td
                      key={date.toISOString()}
                      className={`border-r border-slate-200 px-3 py-3 text-xs h-[90px] align-top transition-all ${
                        cellSchedule
                          ? 'cursor-pointer hover:bg-blue-50 hover:shadow-inner bg-white'
                          : 'bg-slate-50'
                      }`}
                      onClick={() => cellSchedule && setSelectedCell(cellSchedule)}
                    >
                      {cellSchedule && (
                        <div className="space-y-1.5">
                          <div className="font-bold text-slate-900 truncate text-xs leading-tight" title={cellSchedule.location}>
                            {cellSchedule.location.replace(/^Deliveries\s+/, '').split(' - ')[1] || cellSchedule.location.replace(/^Deliveries\s+/, '')}
                          </div>
                          <div className="text-slate-600 text-xs font-medium">
                            ⏱ {calculateTotalHours(cellSchedule)}
                          </div>
                          <div className="text-blue-600 font-semibold text-xs bg-blue-50 px-2 py-0.5 rounded inline-block">
                            {getAppointmentSummary(cellSchedule)}
                          </div>
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Detail Modal */}
      {selectedCell && (
        <AppointmentDetailModal
          schedule={selectedCell}
          onClose={() => setSelectedCell(null)}
        />
      )}
    </>
  );
}
