#!/usr/bin/env python3
"""
Connecteam API Data Extraction Script

This script extracts shift data from the Connecteam API for all schedulers
and outputs it to a CSV file matching the provided format.
It properly uses the users endpoint to populate the assignedUsers field.
"""

import requests
import csv
import datetime
import time
import os
from typing import List, Dict, Any, Optional
import logging
import sys
import json
from datetime import date

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("connecteam_extraction.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger("connecteam_extractor")

# API Configuration
API_KEY = "a05102e6-2d71-439b-98a3-916aff879915"
BASE_URL = "https://api.connecteam.com"
SCHEDULERS_ENDPOINT = "/scheduler/v1/schedulers"
SHIFTS_ENDPOINT = "/scheduler/v1/schedulers/{scheduler_id}/shifts"
USERS_ENDPOINT = "/users/v1/users"
JOBS_ENDPOINT = "/jobs/v1/jobs"
HEADERS = {
    "X-API-KEY": API_KEY,
    "accept": "application/json"
}

start_date = date(2025, 7, 1)
today = date.today()
DAYS_OF_DATA = (today - start_date).days
#DAYS_OF_DATA = 180
print(DAYS_OF_DATA)
# Output files
OUTPUT_FILE = "managed_tables/connect_teams/schedule_data.csv"
LOCATION_MAPPING_FILE = "managed_tables/connect_teams/location_mapping.csv"

# CSV field names (matching the provided CSV structure)
CSV_FIELDS = [
    "id", "assignedUsers", "startDateTime", "endDateTime", "startDate", "endDate",
    "startTime", "endTime", "timeZone", "isOpenShift", "title", "location",
    "address", "normalized_address", "jobId", "isPublished", "updatedDateTime",
    "createdDateTime", "shiftName"
]

def get_unix_timestamp(days_offset: int) -> int:
    """
    Get Unix timestamp for the current date plus/minus the specified number of days.
    
    Args:
        days_offset: Number of days to add (positive) or subtract (negative) from current date
        
    Returns:
        Unix timestamp in seconds
    """
    target_date = datetime.datetime.now() + datetime.timedelta(days=days_offset)
    return int(target_date.timestamp())

def get_all_users() -> Dict[str, Dict[str, Any]]:
    """
    Retrieve all users from the Connecteam API and create a mapping of user IDs to user details.
    
    Returns:
        Dictionary mapping user IDs to user details
    """
    url = f"{BASE_URL}{USERS_ENDPOINT}"
    logger.info(f"Fetching users from {url}")
    
    user_map = {}
    offset = 0
    limit = 200  # Maximum allowed by API
    total_users = 0
    
    try:
        # Paginate through all users
        while True:
            params = {
                "limit": limit,
                "offset": offset
            }

            
            response = requests.get(url, headers=HEADERS, params=params)
            response.raise_for_status()
            response_data = response.json()
            
            # Extract users based on the response structure
            users = []
            if isinstance(response_data, dict):
                if "data" in response_data:
                    if isinstance(response_data["data"], list):
                        users = response_data["data"]
                    elif isinstance(response_data["data"], dict) and "users" in response_data["data"]:
                        users = response_data["data"]["users"]
                elif "users" in response_data:
                    users = response_data["users"]
                elif "items" in response_data:
                    users = response_data["items"]
            elif isinstance(response_data, list):
                users = response_data
            
            if not users:
                logger.warning("No users found in response structure")
                break
                
            # Add users to the mapping - use userId instead of id
            for user in users:
                # Check for userId first, then fall back to id
                user_id = str(user.get("userId", user.get("id", "")))
                if user_id:
                    first_name = user.get("firstName", "")
                    last_name = user.get("lastName", "")
                    full_name = f"{first_name} {last_name}".strip()
                    
                    user_map[user_id] = {
                        "name": full_name if full_name else user.get("email", ""),
                        "firstName": first_name,
                        "lastName": last_name,
                        "email": user.get("email", ""),
                        "phone": user.get("phoneNumber", user.get("phone", ""))
                    }
                    
                    # Debug log for user mapping
                    logger.debug(f"Mapped user ID {user_id} to name: {full_name}")
            
            total_users += len(users)
            
            # Check if we've reached the end of the pagination
            if "paging" in response_data and "hasMore" in response_data["paging"]:
                if not response_data["paging"]["hasMore"]:
                    break
            elif len(users) < limit:
                break
                
            offset += limit
            time.sleep(0.5)  # Add a small delay to avoid rate limiting
        
        logger.info(f"Successfully retrieved {total_users} users ({len(user_map)} unique IDs)")
        
        # Log a sample of the user map for debugging
        sample_ids = list(user_map.keys())[:5]
        for user_id in sample_ids:
            logger.info(f"User ID {user_id} mapped to: {user_map[user_id]['name']}")
        
        return user_map
    except requests.exceptions.RequestException as e:
        logger.error(f"Error fetching users: {e}")
        if hasattr(e, 'response') and e.response:
            logger.error(f"Response status: {e.response.status_code}")
            logger.error(f"Response body: {e.response.text}")
        return {}

def get_all_schedulers() -> List[Dict[str, Any]]:
    """
    Retrieve all schedulers from the Connecteam API.
    
    Returns:
        List of scheduler objects
    """
    url = f"{BASE_URL}{SCHEDULERS_ENDPOINT}"
    logger.info(f"Fetching schedulers from {url}")
    
    try:
        response = requests.get(url, headers=HEADERS)
        response.raise_for_status()
        schedulers = response.json()
        logger.info(f"Successfully retrieved schedulers response")
        
        # Debug the structure of the response
        logger.info(f"Scheduler response type: {type(schedulers)}")
        
        return schedulers
    except requests.exceptions.RequestException as e:
        logger.error(f"Error fetching schedulers: {e}")
        if hasattr(e, 'response') and e.response:
            logger.error(f"Response status: {e.response.status_code}")
            logger.error(f"Response body: {e.response.text}")
        return []

def get_shifts_for_scheduler(scheduler_id: str, start_time: int, end_time: int) -> List[Dict[str, Any]]:
    """
    Retrieve shifts for a specific scheduler within the given time range.
    
    Args:
        scheduler_id: ID of the scheduler
        start_time: Start time as Unix timestamp
        end_time: End time as Unix timestamp
        
    Returns:
        List of shift objects
    """
    url = f"{BASE_URL}{SHIFTS_ENDPOINT.format(scheduler_id=scheduler_id)}"
    
    all_shifts = []
    offset = 0
    limit = 500  # Use a reasonable page size
    
    logger.info(f"Fetching shifts for scheduler {scheduler_id} from {start_time} to {end_time}")
    
    try:
        # Use pagination to get all shifts
        while True:
            params = {
                "startTime": start_time,
                "endTime": end_time,
                "limit": limit,
                "offset": offset
            }
            
            response = requests.get(url, headers=HEADERS, params=params)
            response.raise_for_status()
            response_data = response.json()
            
            # Extract shifts based on the response structure
            shifts = []
            if isinstance(response_data, dict):
                # Check for common response patterns
                if "data" in response_data and "shifts" in response_data["data"]:
                    shifts = response_data["data"]["shifts"]
                elif "data" in response_data and isinstance(response_data["data"], list):
                    shifts = response_data["data"]
                elif "shifts" in response_data:
                    shifts = response_data["shifts"]
                elif "items" in response_data:
                    shifts = response_data["items"]
            elif isinstance(response_data, list):
                shifts = response_data
            
            if not shifts:
                break
                
            # Log the structure of the first shift for debugging
            if shifts and offset == 0:
                logger.info(f"First shift structure: {json.dumps(shifts[0])}")
                
                # Specifically log assignedUserIds if present
                if "assignedUserIds" in shifts[0]:
                    logger.info(f"First shift assignedUserIds: {shifts[0]['assignedUserIds']}")
            
            all_shifts.extend(shifts)
            
            # Check if we've reached the end of the pagination
            if len(shifts) < limit:
                break
                
            offset += limit
            time.sleep(0.5)  # Add a small delay to avoid rate limiting
        
        logger.info(f"Successfully retrieved {len(all_shifts)} shifts for scheduler {scheduler_id}")
        return all_shifts
    except requests.exceptions.RequestException as e:
        logger.error(f"Error fetching shifts for scheduler {scheduler_id}: {e}")
        if hasattr(e, 'response') and e.response:
            logger.error(f"Response status: {e.response.status_code}")
            logger.error(f"Response body: {e.response.text}")
        return []

def format_datetime(timestamp: Optional[int]) -> str:
    """
    Format Unix timestamp to M/D/YY H:MM format.
    
    Args:
        timestamp: Unix timestamp in seconds
        
    Returns:
        Formatted date string
    """
    if not timestamp:
        return ""
    
    dt = datetime.datetime.fromtimestamp(timestamp)
    return dt.strftime("%-m/%-d/%y %-H:%M")

def format_date(timestamp: Optional[int]) -> str:
    """
    Format Unix timestamp to M/D/YY format.
    
    Args:
        timestamp: Unix timestamp in seconds
        
    Returns:
        Formatted date string
    """
    if not timestamp:
        return ""
    
    dt = datetime.datetime.fromtimestamp(timestamp)
    return dt.strftime("%-m/%-d/%y")

def format_time(timestamp: Optional[int]) -> str:
    """
    Format Unix timestamp to H:MM:SS AM/PM format.
    
    Args:
        timestamp: Unix timestamp in seconds
        
    Returns:
        Formatted time string
    """
    if not timestamp:
        return ""
    
    dt = datetime.datetime.fromtimestamp(timestamp)
    return dt.strftime("%-I:%M:%S %p")

def get_all_jobs() -> Dict[str, Dict[str, Any]]:
    """
    Retrieve all jobs from the Connecteam API and create a mapping.

    Returns:
        Dictionary mapping job IDs to job details including location info
    """
    url = f"{BASE_URL}{JOBS_ENDPOINT}"
    logger.info(f"Fetching jobs from {url}")

    job_map = {}
    offset = 0
    limit = 200
    total_jobs = 0

    try:
        while True:
            params = {
                "limit": limit,
                "offset": offset
            }

            response = requests.get(url, headers=HEADERS, params=params)
            response.raise_for_status()
            response_data = response.json()

            # Extract jobs based on response structure
            jobs = []
            if isinstance(response_data, dict):
                if "data" in response_data:
                    if isinstance(response_data["data"], list):
                        jobs = response_data["data"]
                    elif isinstance(response_data["data"], dict) and "jobs" in response_data["data"]:
                        jobs = response_data["data"]["jobs"]
                elif "jobs" in response_data:
                    jobs = response_data["jobs"]
                elif "items" in response_data:
                    jobs = response_data["items"]
            elif isinstance(response_data, list):
                jobs = response_data

            if not jobs:
                break

            # Map jobs with their location details
            for job in jobs:
                job_id = str(job.get("jobId", job.get("id", "")))
                if job_id:
                    job_name = job.get("name", "")
                    job_code = job.get("code", "")

                    # Extract location/address if available
                    location = job.get("location", {})
                    address = ""
                    if isinstance(location, dict):
                        address = location.get("address", "")
                        if not address and "gps" in location:
                            gps_data = location.get("gps", {})
                            if isinstance(gps_data, dict):
                                address = gps_data.get("address", "")
                    elif isinstance(location, str):
                        address = location

                    job_map[job_id] = {
                        "name": job_name,
                        "code": job_code,
                        "address": address,
                        "raw_location": location
                    }

                    logger.debug(f"Mapped job ID {job_id} to {job_name} at {address}")

            total_jobs += len(jobs)

            # Check pagination
            if "paging" in response_data and "hasMore" in response_data["paging"]:
                if not response_data["paging"]["hasMore"]:
                    break
            elif len(jobs) < limit:
                break

            offset += limit
            time.sleep(0.5)

        logger.info(f"Successfully retrieved {total_jobs} jobs ({len(job_map)} unique IDs)")
        return job_map
    except requests.exceptions.RequestException as e:
        logger.error(f"Error fetching jobs: {e}")
        if hasattr(e, 'response') and e.response:
            logger.error(f"Response status: {e.response.status_code}")
            logger.error(f"Response body: {e.response.text}")
        return {}

def normalize_address(address: str) -> str:
    """
    Normalize address for better matching.

    Args:
        address: Raw address string

    Returns:
        Normalized address string
    """
    if not address:
        return ""

    # Convert to lowercase
    normalized = address.lower()

    # Replace common abbreviations
    replacements = {
        ' street': ' st',
        ' avenue': ' ave',
        ' road': ' rd',
        ' drive': ' dr',
        ' boulevard': ' blvd',
        ' suite': ' ste',
        ' northwest': ' nw',
        ' northeast': ' ne',
        ' southwest': ' sw',
        ' southeast': ' se',
        ',': '',
        '.': '',
        '  ': ' '
    }

    for old, new in replacements.items():
        normalized = normalized.replace(old, new)

    # Remove extra whitespace
    normalized = ' '.join(normalized.split())

    return normalized.strip()

def get_scheduler_details() -> Dict[str, str]:
    """
    Get scheduler details including names.
    
    Returns:
        Dictionary mapping scheduler IDs to scheduler names
    """
    url = f"{BASE_URL}{SCHEDULERS_ENDPOINT}"
    logger.info(f"Fetching scheduler details from {url}")
    
    scheduler_map = {}
    
    try:
        response = requests.get(url, headers=HEADERS)
        response.raise_for_status()
        response_data = response.json()
        
        schedulers = []
        if isinstance(response_data, dict):
            if "data" in response_data and "schedulers" in response_data["data"]:
                schedulers = response_data["data"]["schedulers"]
            elif "schedulers" in response_data:
                schedulers = response_data["schedulers"]
            elif "data" in response_data and isinstance(response_data["data"], list):
                schedulers = response_data["data"]
        elif isinstance(response_data, list):
            schedulers = response_data
        
        for scheduler in schedulers:
            if isinstance(scheduler, dict):
                scheduler_id = str(scheduler.get("schedulerId", scheduler.get("id", "")))
                scheduler_name = scheduler.get("name", "")
                if scheduler_id:
                    scheduler_map[scheduler_id] = scheduler_name
        
        logger.info(f"Successfully retrieved {len(scheduler_map)} scheduler names")
        return scheduler_map
    except requests.exceptions.RequestException as e:
        logger.error(f"Error fetching scheduler details: {e}")
        if hasattr(e, 'response') and e.response:
            logger.error(f"Response status: {e.response.status_code}")
            logger.error(f"Response body: {e.response.text}")
        return {}

def transform_shift_data(shift: Dict[str, Any], user_map: Dict[str, Dict[str, Any]],
                        scheduler_name_map: Dict[str, str], job_map: Dict[str, Dict[str, Any]]) -> Dict[str, Any]:
    """
    Transform shift data to match the CSV structure.

    Args:
        shift: Raw shift data from API
        user_map: Dictionary mapping user IDs to user details
        scheduler_name_map: Dictionary mapping scheduler IDs to scheduler names
        job_map: Dictionary mapping job IDs to job details

    Returns:
        Transformed shift data matching CSV structure
    """
    shift_id = shift.get("id", "")
    
    # Extract assigned users from assignedUserIds field
    assigned_users = ""
    if "assignedUserIds" in shift and shift["assignedUserIds"]:
        # Extract user IDs from the list
        user_ids = [str(user_id) for user_id in shift["assignedUserIds"]]
        
        # Map user IDs to names
        user_names = []
        for user_id in user_ids:
            if user_id in user_map:
                user_names.append(user_map[user_id]["name"])
                logger.debug(f"Mapped user ID {user_id} to name: {user_map[user_id]['name']} for shift {shift_id}")
            else:
                logger.warning(f"User ID {user_id} not found in user map for shift {shift_id}")
                user_names.append(f"User {user_id}")
        
        assigned_users = ", ".join(filter(None, user_names))
        logger.debug(f"Shift {shift_id} assigned users: {assigned_users}")
    else:
        logger.debug(f"Shift {shift_id} has no assignedUserIds")
    
    # Format timestamps
    start_timestamp = shift.get("startTime")
    end_timestamp = shift.get("endTime")
    created_timestamp = shift.get("creationTime")
    updated_timestamp = shift.get("updateTime")
    
    start_datetime = format_datetime(start_timestamp)
    end_datetime = format_datetime(end_timestamp)
    
    # Extract location information and jobId
    location_name = ""
    address = ""
    job_id = ""

    # Try to get jobId from shift
    if "jobId" in shift:
        job_id = str(shift.get("jobId", ""))
        # If we have the job in our job_map, use that data
        if job_id in job_map:
            job_data = job_map[job_id]
            if not location_name and job_data.get("name"):
                location_name = job_data["name"]
            if not address and job_data.get("address"):
                address = job_data["address"]

    # Extract from locationData if not already set
    if "locationData" in shift:
        location_data = shift["locationData"]
        if isinstance(location_data, dict):
            if "name" in location_data and not location_name:
                location_name = location_data["name"]

            # Check for address in different possible structures
            if "address" in location_data and not address:
                address = location_data["address"]
            elif "gps" in location_data and isinstance(location_data["gps"], dict):
                if "address" in location_data["gps"] and not address:
                    address = location_data["gps"]["address"]
    
    # Get scheduler name for shift name
    scheduler_id = shift.get("schedulerId", "")
    shift_name = scheduler_name_map.get(str(scheduler_id), "")
    
    # Format timestamps for created and updated
    created_datetime = ""
    if created_timestamp:
        created_dt = datetime.datetime.fromtimestamp(created_timestamp)
        created_datetime = created_dt.strftime("%-m/%-d/%y %H:%M")
        
    updated_datetime = ""
    if updated_timestamp:
        updated_dt = datetime.datetime.fromtimestamp(updated_timestamp)
        updated_datetime = updated_dt.strftime("%-m/%-d/%y %H:%M")
    
    # Normalize the address for better matching
    normalized_address = normalize_address(address)

    # Transform to match CSV structure
    return {
        "id": shift_id,
        "assignedUsers": assigned_users,
        "startDateTime": start_datetime,
        "endDateTime": end_datetime,
        "startDate": format_date(start_timestamp),
        "endDate": format_date(end_timestamp),
        "startTime": format_time(start_timestamp),
        "endTime": format_time(end_timestamp),
        "timeZone": shift.get("timezone", ""),
        "isOpenShift": "1" if shift.get("isOpenShift") else "0",
        "title": shift.get("title", ""),
        "location": location_name,
        "address": address,
        "normalized_address": normalized_address,
        "jobId": job_id,
        "isPublished": "1" if shift.get("isPublished") else "0",
        "updatedDateTime": updated_datetime,
        "createdDateTime": created_datetime,
        "shiftName": shift_name
    }

def write_to_csv(shifts: List[Dict[str, Any]], filename: str) -> None:
    """
    Write shifts data to CSV file.

    Args:
        shifts: List of transformed shift data
        filename: Output CSV filename
    """
    logger.info(f"Writing {len(shifts)} shifts to {filename}")

    try:
        with open(filename, 'w', newline='', encoding='utf-8-sig') as csvfile:
            writer = csv.DictWriter(csvfile, fieldnames=CSV_FIELDS)
            writer.writeheader()
            writer.writerows(shifts)
        logger.info(f"Successfully wrote data to {filename}")
    except Exception as e:
        logger.error(f"Error writing to CSV: {e}")
        raise

def write_location_mapping(shifts: List[Dict[str, Any]], filename: str) -> None:
    """
    Write unique location mappings to CSV file for reference.

    Args:
        shifts: List of transformed shift data
        filename: Output CSV filename
    """
    logger.info("Creating location mapping file")

    # Extract unique locations
    location_map = {}
    for shift in shifts:
        address = shift.get("address", "")
        if address and address not in location_map:
            location_map[address] = {
                "address": address,
                "normalized_address": shift.get("normalized_address", ""),
                "location_name": shift.get("location", ""),
                "jobId": shift.get("jobId", "")
            }

    try:
        with open(filename, 'w', newline='', encoding='utf-8-sig') as csvfile:
            fieldnames = ["address", "normalized_address", "location_name", "jobId"]
            writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(location_map.values())
        logger.info(f"Successfully wrote {len(location_map)} unique locations to {filename}")
    except Exception as e:
        logger.error(f"Error writing location mapping: {e}")
        raise

def extract_scheduler_ids(schedulers_response: Any) -> List[str]:
    """
    Extract scheduler IDs from the API response.
    
    Args:
        schedulers_response: API response containing scheduler data
        
    Returns:
        List of scheduler IDs
    """
    scheduler_ids = []
    
    if isinstance(schedulers_response, dict):
        if "data" in schedulers_response and "schedulers" in schedulers_response["data"]:
            scheduler_dicts = schedulers_response["data"]["schedulers"]
            scheduler_ids = [str(s["schedulerId"]) for s in scheduler_dicts if "schedulerId" in s]
        elif "schedulers" in schedulers_response:
            scheduler_dicts = schedulers_response["schedulers"]
            scheduler_ids = [str(s["schedulerId"]) if isinstance(s, dict) and "schedulerId" in s else str(s) for s in scheduler_dicts]
        elif "data" in schedulers_response:
            if isinstance(schedulers_response["data"], list):
                scheduler_dicts = schedulers_response["data"]
                scheduler_ids = [str(s["schedulerId"]) if isinstance(s, dict) and "schedulerId" in s else str(s) for s in scheduler_dicts]
    elif isinstance(schedulers_response, list):
        scheduler_ids = [str(s["schedulerId"]) if isinstance(s, dict) and "schedulerId" in s else str(s) for s in schedulers_response]
    
    logger.info(f"Extracted {len(scheduler_ids)} scheduler IDs")
    return scheduler_ids

def main():
    """Main function to orchestrate the data extraction process."""
    logger.info("Starting Connecteam data extraction")
    
    # Calculate time range (90 days past to 90 days future for comprehensive coverage)
    start_time = get_unix_timestamp(-DAYS_OF_DATA)
    end_time = get_unix_timestamp(DAYS_OF_DATA)
    
    print(start_time)
    print(end_time)
    
    logger.info(f"Time range: {format_datetime(start_time)} to {format_datetime(end_time)}")
    
    try:
        # Get all users first to create a mapping of user IDs to names
        user_map = get_all_users()
        logger.info(f"User map contains {len(user_map)} entries")

        # Get all jobs to create a mapping of job IDs to locations
        job_map = get_all_jobs()
        logger.info(f"Job map contains {len(job_map)} entries")

        # Get scheduler details including names
        scheduler_name_map = get_scheduler_details()
        print(scheduler_name_map)
        # Get all schedulers
        schedulers_response = get_all_schedulers()
        
        # Extract scheduler IDs
        scheduler_ids = extract_scheduler_ids(schedulers_response)
        
        if not scheduler_ids:
            logger.error("No scheduler IDs found in the response")
            return
        
        all_shifts = []
        
        # Get shifts for each scheduler
        for scheduler_id in scheduler_ids:
            logger.info(f"Processing scheduler ID: {scheduler_id}")
            shifts = get_shifts_for_scheduler(scheduler_id, start_time, end_time)
            
            # Transform each shift to match CSV structure
            transformed_shifts = []
            for shift in shifts:
                transformed = transform_shift_data(shift, user_map, scheduler_name_map, job_map)
                transformed_shifts.append(transformed)

                # Log the first few transformations for debugging
                if len(transformed_shifts) <= 3:
                    logger.info(f"Transformed shift {shift.get('id', '')}: assignedUsers = '{transformed['assignedUsers']}', location = '{transformed['location']}'")

            all_shifts.extend(transformed_shifts)
            
            # Add a small delay to avoid rate limiting
            time.sleep(0.5)
        
        logger.info(f"Total shifts after transformation: {len(all_shifts)}")
        
        # Check for empty assignedUsers
        empty_assigned_users = sum(1 for shift in all_shifts if not shift['assignedUsers'])
        logger.info(f"Shifts with empty assignedUsers: {empty_assigned_users} ({empty_assigned_users/len(all_shifts)*100:.2f}%)")
        
        # Write all shifts to CSV
        write_to_csv(all_shifts, OUTPUT_FILE)

        # Write location mapping file
        write_location_mapping(all_shifts, LOCATION_MAPPING_FILE)

        logger.info(f"Data extraction completed successfully. Total shifts: {len(all_shifts)}")
        
    except Exception as e:
        logger.error(f"Error in data extraction process: {e}")
        raise

if __name__ == "__main__":
    main()
