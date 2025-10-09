#!/usr/bin/env python3
"""
Data Preprocessing Script for Schedule Viewer

This script joins the three CSV files (schedules, appointments, locations)
into a single denormalized CSV for easier data inspection and debugging.

Creates ONE ROW PER APPOINTMENT - each schedule can have multiple rows
if there are multiple appointments.

Input files:
  - public/data/schedule_data.csv (from Connecteam)
  - public/data/cloud9_appts.csv (appointments data)
  - public/data/job_locations.csv (location mappings)

Output file:
  - public/data/joined_schedules.csv (ready for app to load)
"""

import csv
import sys
from typing import List, Dict, Any, Optional
from datetime import datetime
import os

def format_date_for_comparison(date_str: str) -> str:
    """Convert M/D/YY format to YYYY-MM-DD format."""
    try:
        parts = date_str.split('/')
        if len(parts) == 3:
            month = parts[0].zfill(2)
            day = parts[1].zfill(2)
            year = parts[2] if len(parts[2]) == 4 else f"20{parts[2]}"
            return f"{year}-{month}-{day}"
    except Exception as e:
        print(f"Error formatting date '{date_str}': {e}")
    return date_str

def normalize_string(s: str) -> str:
    """Normalize string for comparison."""
    if not s:
        return ""
    return s.lower().strip()

def matches_location(appt_location: str, schedule_location: str) -> bool:
    """
    Check if appointment location matches schedule location.
    Uses EXACT matching only - appt_care_center_location must match schedule location.
    """
    if not appt_location or not schedule_location:
        return False

    # Normalize both for comparison
    normalized_appt = normalize_string(appt_location)
    normalized_schedule = normalize_string(schedule_location)

    # EXACT match only - no substring matching
    # This ensures appointments at "Paul Chaskes, DMD" don't match "East Cedar Dental"
    return normalized_appt == normalized_schedule

def find_location_by_address(address: str, locations: List[Dict[str, str]]) -> Optional[str]:
    """Find job location name by address."""
    if not address:
        return None

    # Try exact match first
    for loc in locations:
        if loc.get('Location', '') == address:
            return loc.get('Job', '')

    # Try partial match
    for loc in locations:
        location_addr = loc.get('Location', '')
        if location_addr and location_addr.split(',')[0] in address:
            return loc.get('Job', '')

    return None

def load_csv(filepath: str) -> List[Dict[str, str]]:
    """Load CSV file into list of dictionaries."""
    try:
        with open(filepath, 'r', encoding='utf-8-sig') as f:
            reader = csv.DictReader(f)
            return list(reader)
    except FileNotFoundError:
        print(f"ERROR: File not found: {filepath}")
        sys.exit(1)
    except Exception as e:
        print(f"ERROR loading {filepath}: {e}")
        sys.exit(1)

def main():
    print("=" * 80)
    print("Schedule Viewer - Data Preprocessing (One Row Per Appointment)")
    print("=" * 80)
    print()

    # Change to script's parent directory to ensure correct paths
    script_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(os.path.join(script_dir, '..'))

    # Load input files
    print("Loading input files...")
    schedules = load_csv('public/data/schedule_data.csv')
    appointments = load_csv('public/data/cloud9_appts.csv')
    locations = load_csv('public/data/job_locations.csv')

    print(f"  ✓ Loaded {len(schedules):,} schedule entries")
    print(f"  ✓ Loaded {len(appointments):,} appointments")
    print(f"  ✓ Loaded {len(locations):,} location mappings")
    print()

    # Filter valid schedule entries (must have assigned users)
    valid_schedules = [s for s in schedules if s.get('assignedUsers', '').strip()]
    print(f"Filtered to {len(valid_schedules):,} schedules with assigned users")
    print()

    # Build joined data - ONE ROW PER APPOINTMENT
    print("Joining data (one row per appointment)...")
    print("Join logic:")
    print("  - Match on: TC name + date + EXACT appt_care_center_location")
    print("  - Location match must be EXACT (no substring matching)")
    print("  - Schedules with 'Unknown Location' will NOT match any appointments")
    print()
    joined_rows = []
    stats = {
        'schedules_processed': 0,
        'schedules_with_appointments': 0,
        'schedules_without_appointments': 0,
        'schedules_unknown_location': 0,
        'total_appointment_rows': 0,
        'exact_match': 0,
        'fuzzy_match': 0,
        'unmatched': 0
    }

    for schedule in valid_schedules:
        tc_name = schedule['assignedUsers']
        date = schedule['startDate']
        formatted_date = format_date_for_comparison(date)

        # Get location info from schedule
        store_name = schedule.get('store_name', '')
        location_name = schedule.get('location', '')

        # Determine display location
        display_location = (store_name or
                          location_name or
                          find_location_by_address(schedule.get('address', ''), locations) or
                          'Unknown Location')

        # If location is Unknown, do NOT join to any appointments
        if display_location == 'Unknown Location':
            matching_appts = []
            stats['schedules_unknown_location'] += 1
        else:
            # Find matching appointments for this TC on this date AND location
            # Join on: TC name + date + EXACT match on appt_care_center_location to display_location
            matching_appts = [
                appt for appt in appointments
                if (appt.get('assigned_tc', '') == tc_name
                    and appt.get('appt_date', '') == formatted_date
                    and matches_location(
                        appt.get('appt_care_center_location', ''),
                        display_location
                    ))
            ]

            # Note: We do NOT fall back to matching without location
            # This prevents incorrect joins across different care centers

        # Determine match quality
        match_quality = 'unmatched'
        if schedule.get('store_guid'):
            match_quality = 'exact'
            stats['exact_match'] += 1
        elif location_name or schedule.get('address'):
            match_quality = 'fuzzy'
            stats['fuzzy_match'] += 1
        else:
            stats['unmatched'] += 1

        stats['schedules_processed'] += 1

        if matching_appts:
            stats['schedules_with_appointments'] += 1

            # Create ONE ROW PER APPOINTMENT
            for appt in matching_appts:
                row = {
                    # Schedule fields
                    'schedule_id': schedule.get('id', ''),
                    'tc_name': tc_name,
                    'date': date,
                    'start_time': schedule.get('startTime', ''),
                    'end_time': schedule.get('endTime', ''),
                    'time_zone': schedule.get('timeZone', ''),

                    # Location fields (from schedule)
                    'schedule_store_guid': schedule.get('store_guid', ''),
                    'schedule_store_name': store_name,
                    'schedule_store_id': schedule.get('store_id', ''),
                    'schedule_location': display_location,
                    'schedule_address': schedule.get('address', ''),
                    'schedule_normalized_address': schedule.get('normalized_address', ''),

                    # Match metadata
                    'match_quality': match_quality,
                    'is_published': schedule.get('isPublished', ''),

                    # Appointment fields (one per row)
                    'appt_guid': appt.get('appt_guid', ''),
                    'appt_date_time': appt.get('appt_date_time', ''),
                    'appt_time': appt.get('appt_time', ''),
                    'patient_full_name': appt.get('patient_full_name', ''),
                    'cloud9_patient_name': appt.get('cloud9_patient_name', ''),
                    'patient_status': appt.get('patient_status', ''),
                    'patient_id': appt.get('patient_id', ''),
                    'appt_care_center_location': appt.get('appt_care_center_location', ''),
                    'appt_type': appt.get('appt_type', ''),
                    'is_consult': appt.get('is_consult', ''),
                    'appt_status': appt.get('appt_status', ''),
                    'chair': appt.get('chair', ''),
                    'appt_note': appt.get('appt_note', ''),
                    'pat_apt_count_all': appt.get('pat_apt_count_all', ''),
                    'assigned_care_center': appt.get('assigned_care_center', ''),
                }

                joined_rows.append(row)
                stats['total_appointment_rows'] += 1
        else:
            stats['schedules_without_appointments'] += 1

            # Create one row for schedule with no appointments
            row = {
                # Schedule fields
                'schedule_id': schedule.get('id', ''),
                'tc_name': tc_name,
                'date': date,
                'start_time': schedule.get('startTime', ''),
                'end_time': schedule.get('endTime', ''),
                'time_zone': schedule.get('timeZone', ''),

                # Location fields (from schedule)
                'schedule_store_guid': schedule.get('store_guid', ''),
                'schedule_store_name': store_name,
                'schedule_store_id': schedule.get('store_id', ''),
                'schedule_location': display_location,
                'schedule_address': schedule.get('address', ''),
                'schedule_normalized_address': schedule.get('normalized_address', ''),

                # Match metadata
                'match_quality': match_quality,
                'is_published': schedule.get('isPublished', ''),

                # Empty appointment fields
                'appt_guid': '',
                'appt_date_time': '',
                'appt_time': '',
                'patient_full_name': '',
                'cloud9_patient_name': '',
                'patient_status': '',
                'patient_id': '',
                'appt_care_center_location': '',
                'appt_type': '',
                'is_consult': '',
                'appt_status': '',
                'chair': '',
                'appt_note': '',
                'pat_apt_count_all': '',
                'assigned_care_center': '',
            }

            joined_rows.append(row)

    # Sort by date, then by TC name, then by appointment time
    joined_rows.sort(key=lambda x: (x['date'], x['tc_name'], x['appt_time']))

    # Write output file
    output_file = 'public/data/joined_schedules.csv'
    print(f"Writing joined data to {output_file}...")

    fieldnames = [
        # Schedule info
        'schedule_id', 'tc_name', 'date', 'start_time', 'end_time', 'time_zone',

        # Schedule location info
        'schedule_store_guid', 'schedule_store_name', 'schedule_store_id',
        'schedule_location', 'schedule_address', 'schedule_normalized_address',

        # Match metadata
        'match_quality', 'is_published',

        # Appointment info (one per row)
        'appt_guid', 'appt_date_time', 'appt_time',
        'patient_full_name', 'cloud9_patient_name', 'patient_status', 'patient_id',
        'appt_care_center_location', 'appt_type', 'is_consult', 'appt_status',
        'chair', 'appt_note', 'pat_apt_count_all', 'assigned_care_center'
    ]

    with open(output_file, 'w', newline='', encoding='utf-8-sig') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(joined_rows)

    print(f"  ✓ Wrote {len(joined_rows):,} rows ({stats['total_appointment_rows']:,} appointment rows + {stats['schedules_without_appointments']:,} empty schedule rows)")
    print()

    # Print statistics
    print("=" * 80)
    print("STATISTICS")
    print("=" * 80)
    print(f"Schedules processed:          {stats['schedules_processed']:,}")
    print(f"  With appointments:          {stats['schedules_with_appointments']:,} ({stats['schedules_with_appointments']/stats['schedules_processed']*100:.1f}%)")
    print(f"  Without appointments:       {stats['schedules_without_appointments']:,} ({stats['schedules_without_appointments']/stats['schedules_processed']*100:.1f}%)")
    print(f"  Unknown Location (no join): {stats['schedules_unknown_location']:,} ({stats['schedules_unknown_location']/stats['schedules_processed']*100:.1f}%)")
    print()
    print(f"Total output rows:            {len(joined_rows):,}")
    print(f"  Appointment rows:           {stats['total_appointment_rows']:,}")
    print(f"  Empty schedule rows:        {stats['schedules_without_appointments']:,}")
    print()
    print(f"Avg appointments per schedule: {stats['total_appointment_rows']/stats['schedules_with_appointments']:.1f}" if stats['schedules_with_appointments'] > 0 else "N/A")
    print()
    print(f"Match quality:")
    print(f"  Exact (has store_guid):     {stats['exact_match']:,} ({stats['exact_match']/stats['schedules_processed']*100:.1f}%)")
    print(f"  Fuzzy (has location/addr):  {stats['fuzzy_match']:,} ({stats['fuzzy_match']/stats['schedules_processed']*100:.1f}%)")
    print(f"  Unmatched:                  {stats['unmatched']:,} ({stats['unmatched']/stats['schedules_processed']*100:.1f}%)")
    print()
    print("=" * 80)
    print(f"✅ Done! Review the output file: {output_file}")
    print("   Note: Each schedule can have multiple rows (one per appointment)")
    print("=" * 80)

if __name__ == '__main__':
    main()
