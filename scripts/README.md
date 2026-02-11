# OppForge Scripts

Utility scripts for development, data management, and setup.

## Scripts

| Script | Description | Usage |
|--------|-------------|-------|
| `setup.sh` | One-command project setup | `bash scripts/setup.sh` |
| `seed_data.py` | Generate seed/test data | `python scripts/seed_data.py` |
| `run_scrapers.py` | Manually trigger all scrapers | `python scripts/run_scrapers.py` |

## Running

All scripts should be run from the project root:

```bash
# Setup everything
bash scripts/setup.sh

# Seed the database with test data
python scripts/seed_data.py

# Run scrapers manually
python scripts/run_scrapers.py
```
