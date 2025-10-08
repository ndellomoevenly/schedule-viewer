# Data Pipeline Improvements Summary

## Overview
Complete overhaul of the data pipeline to improve location matching from ~60-70% to 90%+ accuracy by implementing multi-source joins with fuzzy matching.

## Problems Solved

### 1. Poor Address-Based Joins
**Before:** Joining Connect Teams shifts to Cloud9 appointments solely on:
- TC name matching
- Date matching
- Unreliable address string matching

**After:** Multi-key joins using:
- TC name + Date (primary)
- Store GUID (when available)
- Store name with fuzzy matching
- Normalized addresses
- Location name variations

### 2. Inconsistent Location Identifiers
**Before:** Different location formats across systems:
- Connect Teams: Full addresses ("1619 Connecticut Ave NW, Washington, DC 20009, USA")
- Cloud9: Location names ("Dupont Flagship", "Rizzo Dental Group")
- No common ID

**After:** Centralized location master (dim_store.csv) with:
- store_guid: Unique identifier
- store_name: Canonical name
- address: Standardized address
- All systems mapped to this master

### 3. Data Quality Invisibility
**Before:** No visibility into:
- How many locations matched successfully
- Which records failed to join
- Quality of fuzzy matches

**After:** Built-in data quality tracking:
- Match quality indicators (exact/fuzzy/unmatched)
- Match rate statistics in dashboard
- Visual indicators on schedule cards

## Changes Made

### 1. Python Extractor (`connecteam_data_extractor_fixed.py`)

#### Added Jobs API Integration
```python
def get_all_jobs() -> Dict[str, Dict[str, Any]]:
    # Fetches job/location data from Connect Teams
    # Creates mapping of jobId -> location details
```

#### Address Normalization
```python
def normalize_address(address: str) -> str:
    # Standardizes addresses for better matching
    # Handles: street/st, avenue/ave, suite/ste, etc.
    # Removes commas, periods, extra whitespace
```

#### Enhanced CSV Output
New fields added:
- `normalized_address`: Standardized address for matching
- `jobId`: Connect Teams job identifier
- `store_guid`, `store_name`, `store_id`: Enriched from R script

#### Location Mapping Export
Creates `location_mapping.csv` with:
- All unique locations from shifts
- Normalized addresses
- Job IDs for reference

### 2. R Script (`run_connect_teams.R`)

#### dim_store Integration
```r
dim_store <- read_csv('data/dim_store.csv')
```
Uses store dimension table as master location reference

#### Fuzzy Address Matching
```r
library(fuzzyjoin)
library(stringdist)

# Two-stage matching:
# 1. Exact match on normalized addresses
# 2. Fuzzy match (Levenshtein distance) for unmatchedrecords
```

#### Match Statistics Logging
```r
message(sprintf("Location matching complete: %d/%d shifts matched (%.1f%%)",
                matched_shifts, total_shifts, match_rate))
```

#### Enriched Export
Exports schedule data with:
- store_guid, store_name, store_id
- normalized_address for verification
- All original Connect Teams fields

### 3. Dashboard Types (`schedule-viewer/lib/types.ts`)

#### New Store Interface
```typescript
export interface Store {
  store_guid: string;
  store_name: string;
  store_id: string;
  address: string;
  city: string;
  state: string;
  region: string;
  // ... more fields
}
```

#### Enhanced ScheduleEntry
```typescript
export interface ScheduleEntry {
  // ... existing fields
  store_guid?: string;
  store_name?: string;
  store_id?: string;
  normalized_address?: string;
  jobId?: string;
}
```

#### Match Quality Tracking
```typescript
export interface TCSchedule {
  // ... existing fields
  matchQuality?: 'exact' | 'fuzzy' | 'unmatched';
}
```

### 4. Data Loader (`schedule-viewer/lib/data-loader.ts`)

#### Improved Join Logic
```typescript
// Primary join: TC name + date
// Secondary filter: location matching if store_name available
// Fallback: address-based lookup
```

#### Location Matching Function
```typescript
function matchesLocation(apptLocation: string, storeName?: string, shiftLocation?: string): boolean
```
Handles partial matches and variations in location names

#### Match Quality Determination
```typescript
let matchQuality: 'exact' | 'fuzzy' | 'unmatched' = 'unmatched';
if (entry.store_guid) {
  matchQuality = 'exact';
} else if (entry.location || entry.address) {
  matchQuality = 'fuzzy';
}
```

### 5. UI Components

#### ScheduleCard (`components/ScheduleCard.tsx`)
- Shows match quality indicator (~ for fuzzy, ! for unmatched)
- Displays store_id when available
- Uses store_name as primary location display

#### StatsOverview (`components/StatsOverview.tsx`)
- New "Location Match" card showing match rate percentage
- Shows count of exact matches
- 6-column grid layout (was 5)

## Expected Results

### Before
- **Match Rate**: ~60-70%
- **Unmatched Locations**: 30-40% showing as "Unknown Location"
- **User Experience**: Confusing location names, missing appointments
- **Data Quality**: No visibility into matching issues

### After
- **Match Rate**: 90%+ (depends on dim_store completeness)
- **Unmatched Locations**: <10% (flagged visually)
- **User Experience**: Consistent location names from master list
- **Data Quality**: Real-time match rate statistics, visual indicators

## Data Flow

```
1. Connect Teams API (Python)
   ↓
   - Fetch shifts with jobIds
   - Fetch jobs/locations
   - Normalize addresses
   - Export: schedule_data.csv + location_mapping.csv
   ↓
2. R Script
   ↓
   - Load dim_store.csv (master locations)
   - Exact match on normalized addresses
   - Fuzzy match on unmatched records
   - Enrich with store_guid, store_name, store_id
   - Export: enhanced schedule_data.csv
   ↓
3. Dashboard (TypeScript)
   ↓
   - Join on TC + date + location
   - Display with match quality indicators
   - Show match rate statistics
```

## Testing the Pipeline

### 1. Run Python Extractor
```bash
python connecteam_data_extractor_fixed.py
```
Check logs for:
- Number of jobs retrieved
- Number of shifts with jobIds
- Location mapping file created

### 2. Run R Script
```bash
Rscript run_connect_teams.R
```
Check output for:
- Match rate percentage
- Number of fuzzy matches attempted
- Final enriched CSV created

### 3. View Dashboard
```bash
cd schedule-viewer && npm run dev
```
Check for:
- Match rate % in stats (target: 90%+)
- Minimal "Unknown Location" entries
- Match quality indicators on cards

## Maintenance

### Adding New Locations
1. Add to `dim_store.csv` with all fields
2. Re-run R script to rematch
3. Dashboard will automatically use new locations

### Improving Match Rate
1. Check `location_mapping.csv` for unmatched addresses
2. Find corresponding entries in dim_store
3. Add alternate address formats to dim_store if needed
4. Adjust fuzzy match threshold if too strict/loose

### Debugging Mismatches
1. Look for cards with "!" indicator (unmatched)
2. Check R script output logs for fuzzy match distances
3. Review `location_mapping.csv` for the address
4. Add to dim_store or adjust normalization rules

## Files Modified

1. `/connecteam_data_extractor_fixed.py` - Enhanced extractor
2. `/run_connect_teams.R` - Fuzzy matching logic
3. `/schedule-viewer/lib/types.ts` - New interfaces
4. `/schedule-viewer/lib/data-loader.ts` - Improved joins
5. `/schedule-viewer/components/ScheduleCard.tsx` - Match indicators
6. `/schedule-viewer/components/StatsOverview.tsx` - Match rate display

## Files Created

1. `/managed_tables/connect_teams/location_mapping.csv` - Location reference

## Dependencies Added

### R
- `fuzzyjoin` - Fuzzy string matching
- `stringdist` - String distance algorithms

Install with:
```r
install.packages(c("fuzzyjoin", "stringdist"))
```

### Python
None (uses existing libraries)

### TypeScript
None (uses existing libraries)

## Next Steps

1. **Monitor Match Rates**: Track dashboard match rate stat over time
2. **Complete dim_store**: Ensure all active locations are in master table
3. **Tune Fuzzy Matching**: Adjust `max_dist` parameter if needed
4. **Add More Normalization Rules**: If specific address patterns fail
5. **Consider Store GUID in Cloud9**: If possible, add store_guid to Cloud9 for direct joins
