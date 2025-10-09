import Papa from 'papaparse';
import { JoinedSchedule, TCSchedule, DashboardData } from './types';

export async function loadCSV<T>(url: string): Promise<T[]> {
  const response = await fetch(url);
  const csvText = await response.text();

  return new Promise((resolve, reject) => {
    Papa.parse<T>(csvText, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        resolve(results.data);
      },
      error: (error: Error) => {
        reject(error);
      },
    });
  });
}

export async function loadAllData(): Promise<DashboardData> {
  // Load the pre-joined data
  const joinedData = await loadCSV<JoinedSchedule>('/data/joined_schedules.csv');

  // Group by TC + date + location to create TC schedules
  const tcSchedules = buildTCSchedulesFromJoinedData(joinedData);

  return {
    tcSchedules,
    allJoinedData: joinedData,
  };
}

function buildTCSchedulesFromJoinedData(joinedData: JoinedSchedule[]): TCSchedule[] {
  // Group rows by schedule_id (each schedule can have multiple appointment rows)
  const scheduleMap = new Map<string, JoinedSchedule[]>();

  for (const row of joinedData) {
    const key = row.schedule_id;
    if (!scheduleMap.has(key)) {
      scheduleMap.set(key, []);
    }
    scheduleMap.get(key)!.push(row);
  }

  // Build TC schedules from grouped data
  const schedules: TCSchedule[] = [];

  for (const [scheduleId, rows] of scheduleMap.entries()) {
    // All rows for this schedule share the same schedule info
    const firstRow = rows[0];

    // Filter out empty appointment rows (schedules with no appointments)
    const appointmentRows = rows.filter(r => r.appt_guid && r.appt_guid.trim() !== '');

    // Determine match quality
    let matchQuality: 'exact' | 'fuzzy' | 'unmatched' = 'unmatched';
    if (firstRow.match_quality === 'exact') {
      matchQuality = 'exact';
    } else if (firstRow.match_quality === 'fuzzy') {
      matchQuality = 'fuzzy';
    }

    schedules.push({
      tcName: firstRow.tc_name,
      date: firstRow.date,
      location: firstRow.schedule_location,
      address: firstRow.schedule_address,
      startTime: firstRow.start_time,
      endTime: firstRow.end_time,
      appointmentCount: appointmentRows.length,
      appointments: appointmentRows,
      matchQuality,
    });
  }

  // Sort by date, then by TC name
  schedules.sort((a, b) => {
    const dateCompare = new Date(a.date).getTime() - new Date(b.date).getTime();
    if (dateCompare !== 0) return dateCompare;
    return a.tcName.localeCompare(b.tcName);
  });

  return schedules;
}
