// Data types for the Evenly Schedule Viewer

// Pre-joined data structure - one row per appointment
export interface JoinedSchedule {
  // Schedule info
  schedule_id: string;
  tc_name: string;
  date: string;
  start_time: string;
  end_time: string;
  time_zone: string;

  // Schedule location info
  schedule_store_guid: string;
  schedule_store_name: string;
  schedule_store_id: string;
  schedule_location: string;
  schedule_address: string;
  schedule_normalized_address: string;

  // Match metadata
  match_quality: string;
  is_published: string;

  // Appointment info (one per row, or empty if no appointment)
  appt_guid: string;
  appt_date_time: string;
  appt_time: string;
  patient_full_name: string;
  cloud9_patient_name: string;
  patient_status: string;
  patient_id: string;
  appt_care_center_location: string;
  appt_type: string;
  is_consult: string;
  appt_status: string;
  chair: string;
  appt_note: string;
  pat_apt_count_all: string;
  assigned_care_center: string;
}

// Aggregated view for display (grouped by TC + date + location)
export interface TCSchedule {
  tcName: string;
  date: string;
  location: string;
  address: string;
  startTime: string;
  endTime: string;
  appointmentCount: number;
  appointments: JoinedSchedule[];
  matchQuality: 'exact' | 'fuzzy' | 'unmatched';
}

export interface DashboardData {
  tcSchedules: TCSchedule[];
  allJoinedData: JoinedSchedule[];
}

// Legacy types for reference (no longer used)
export interface Appointment {
  appt_guid: string;
  appt_date_time: string;
  appt_date: string;
  appt_time: string;
  patient_full_name: string;
  cloud9_patient_name: string;
  patient_status: string;
  patient_id: string;
  appt_care_center_location: string;
  appt_type: string;
  is_consult: string;
  appt_status: string;
  chair: string;
  assigned_tc: string;
  appt_note: string;
  pat_apt_count_all: string;
  assigned_care_center: string;
}

export interface JobLocation {
  Job: string;
  Location: string;
  'Job Schedules': string;
}

export interface ScheduleEntry {
  id: string;
  assignedUsers: string;
  startDateTime: string;
  endDateTime: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  timeZone: string;
  isOpenShift: string;
  title: string;
  store_guid?: string;
  store_name?: string;
  store_id?: string;
  location: string;
  address: string;
  normalized_address?: string;
  jobId?: string;
  isPublished: string;
  updatedDateTime: string;
  createdDateTime: string;
  shiftName: string;
}
