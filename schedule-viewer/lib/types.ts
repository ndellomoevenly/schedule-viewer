// Data types for the Evenly Schedule Viewer

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

export interface Store {
  store_guid: string;
  store_name: string;
  store_id: string;
  store_id_text: string;
  name_for_lists: string;
  business_name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  location_phone: string;
  email_contact: string;
  program_contact: string;
  region: string;
  status: string;
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

export interface TCSchedule {
  tcName: string;
  date: string;
  store_guid?: string;
  store_name?: string;
  store_id?: string;
  location: string;
  address: string;
  startTime: string;
  endTime: string;
  appointments: Appointment[];
  matchQuality?: 'exact' | 'fuzzy' | 'unmatched';
}

export interface DashboardData {
  tcSchedules: TCSchedule[];
  allAppointments: Appointment[];
  allLocations: JobLocation[];
  allScheduleEntries: ScheduleEntry[];
}
