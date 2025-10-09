# Data Pipeline Scripts

This directory contains the script for extracting data from the Connecteam API.

## Script

### `connecteam_extractor.py`
Python script that extracts schedule data from the Connecteam API and writes directly to the app's data directory.

**Outputs:**
- `public/data/schedule_data.csv` - Main schedule data used by the app
- `data-pipelines/connecteam/location_mapping.csv` - Location reference data
- `data-pipelines/connecteam/connecteam_extraction.log` - Extraction log

**Requirements:**
- Python 3
- `requests` module: `pip3 install requests`

**Usage:**
```bash
# From the schedule-viewer directory:
npm run refresh-data

# OR directly:
python3 scripts/connecteam_extractor.py
```

## Data Flow

```
Connecteam API
    ↓
[connecteam_extractor.py]
    ↓
public/data/schedule_data.csv  ← App reads from here
```

## Configuration

The Connecteam API key is currently hardcoded in `connecteam_extractor.py`. For production, this should be moved to an environment variable:

```python
API_KEY = os.getenv("CONNECTEAM_API_KEY", "default-key")
```

## Logs

Extraction logs are stored in `data-pipelines/connecteam/connecteam_extraction.log`
