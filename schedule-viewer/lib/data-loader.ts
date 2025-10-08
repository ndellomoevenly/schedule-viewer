import Papa from 'papaparse';
import { Appointment, JobLocation, ScheduleEntry, TCSchedule, DashboardData } from './types';

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
  const [appointments, locations, scheduleEntries] = await Promise.all([
    loadCSV<Appointment>('/data/cloud9_appts.csv'),
    loadCSV<JobLocation>('/data/job_locations.csv'),
    loadCSV<ScheduleEntry>('/data/schedule_data.csv'),
  ]);

  // Build TC schedules by combining schedule entries with their appointments
  const tcSchedules = buildTCSchedules(scheduleEntries, appointments, locations);

  return {
    tcSchedules,
    allAppointments: appointments,
    allLocations: locations,
    allScheduleEntries: scheduleEntries,
  };
}

function buildTCSchedules(
  scheduleEntries: ScheduleEntry[],
  appointments: Appointment[],
  locations: JobLocation[]
): TCSchedule[] {
  const schedules: TCSchedule[] = [];

  // Filter out entries without assigned users and only include published or recent entries
  const validEntries = scheduleEntries.filter(
    (entry) => entry.assignedUsers && entry.assignedUsers.trim() !== ''
  );

  for (const entry of validEntries) {
    const tcName = entry.assignedUsers;
    const date = entry.startDate;

    // Find matching appointments for this TC on this date
    // Try multiple join strategies for better matching
    let tcAppointments = appointments.filter(
      (appt) =>
        appt.assigned_tc === tcName &&
        appt.appt_date === formatDateForComparison(date)
    );

    // If we have store_name from the enriched data, also try to filter by location
    if (entry.store_name && tcAppointments.length > 0) {
      // Further filter by matching location if possible
      const locationFilteredAppts = tcAppointments.filter((appt) =>
        matchesLocation(appt.appt_care_center_location, entry.store_name, entry.location)
      );

      // Only use location-filtered results if we found matches
      if (locationFilteredAppts.length > 0) {
        tcAppointments = locationFilteredAppts;
      }
    }

    // Determine match quality
    let matchQuality: 'exact' | 'fuzzy' | 'unmatched' = 'unmatched';
    if (entry.store_guid) {
      matchQuality = 'exact';
    } else if (entry.location || entry.address) {
      matchQuality = 'fuzzy';
    }

    // Use store_name if available, otherwise fall back to location or address lookup
    const displayLocation = entry.store_name ||
                           entry.location ||
                           findLocationByAddress(entry.address, locations)?.Job ||
                           'Unknown Location';

    schedules.push({
      tcName,
      date,
      store_guid: entry.store_guid,
      store_name: entry.store_name,
      store_id: entry.store_id,
      location: displayLocation,
      address: entry.address,
      startTime: entry.startTime,
      endTime: entry.endTime,
      appointments: tcAppointments,
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

function matchesLocation(apptLocation: string, storeName?: string, shiftLocation?: string): boolean {
  if (!apptLocation) return false;

  const normalizedAppt = apptLocation.toLowerCase().trim();

  // Check against store name
  if (storeName) {
    const normalizedStore = storeName.toLowerCase().trim();
    if (normalizedAppt === normalizedStore ||
        normalizedAppt.includes(normalizedStore) ||
        normalizedStore.includes(normalizedAppt)) {
      return true;
    }
  }

  // Check against shift location
  if (shiftLocation) {
    const normalizedShift = shiftLocation.toLowerCase().trim();
    if (normalizedAppt === normalizedShift ||
        normalizedAppt.includes(normalizedShift) ||
        normalizedShift.includes(normalizedAppt)) {
      return true;
    }
  }

  return false;
}

function formatDateForComparison(dateStr: string): string {
  // Convert M/D/YY format to YYYY-MM-DD format
  try {
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      const month = parts[0].padStart(2, '0');
      const day = parts[1].padStart(2, '0');
      const year = parts[2].length === 2 ? `20${parts[2]}` : parts[2];
      return `${year}-${month}-${day}`;
    }
  } catch (e) {
    console.error('Error formatting date:', dateStr, e);
  }
  return dateStr;
}

function findLocationByAddress(address: string, locations: JobLocation[]): JobLocation | undefined {
  if (!address) return undefined;

  // Try exact match first
  const exactMatch = locations.find((loc) => loc.Location === address);
  if (exactMatch) return exactMatch;

  // Try partial match on address
  const partialMatch = locations.find((loc) =>
    loc.Location && address.includes(loc.Location.split(',')[0])
  );

  return partialMatch;
}
