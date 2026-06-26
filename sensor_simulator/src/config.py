# -*- coding: utf-8 -*-
"""
config.py
Spirit of Ankh - Configuration

FIX: load_dotenv now finds .env correctly
regardless of which directory you run from.
"""

import os
from pathlib import Path
from dotenv import load_dotenv

# FIX: Always find .env relative to THIS file's location
# So it works no matter where you run the script from
BASE_DIR = Path(__file__).resolve().parent
ENV_PATH = BASE_DIR / ".env"

load_dotenv(dotenv_path=ENV_PATH)

# ==========================================
# OPENWEATHER API
# ==========================================

OPENWEATHER_API_KEY = os.getenv("OPENWEATHER_API_KEY")

if not OPENWEATHER_API_KEY:
    print(
        "[Config Warning] OPENWEATHER_API_KEY not found in .env file.\n"
        f"Looking for .env at: {ENV_PATH}\n"
        "Weather data will use default fallback values.\n"
        "To fix: add OPENWEATHER_API_KEY=your_key to your .env file.\n"
        "Get a free key at: https://openweathermap.org/api\n"
    )

# ==========================================
# FILE PATHS — absolute paths so they always work
# ==========================================

CORE_LOCATIONS_FILE  = str(BASE_DIR / "data" / "core_locations.csv")
HOLIDAYS_EVENTS_FILE = str(BASE_DIR / "data" / "holidays_events.csv")

# ==========================================
# SYSTEM CONFIGURATION
# ==========================================

INTERVAL_SECONDS = 600

# ==========================================
# HOURLY FACTORS
# ==========================================

HOURLY_FACTORS = {
    "early_morning": 0.40,
    "peak_hours":    1.20,
    "afternoon":     0.90,
    "evening":       0.70,
    "night":         0.20
}

# ==========================================
# WEEKEND FACTORS
# ==========================================

FRIDAY_FACTOR      = 1.25
SATURDAY_FACTOR    = 1.20
DEFAULT_DAY_FACTOR = 1.00

# ==========================================
# WEATHER FACTORS
# ==========================================

TEMPERATURE_FACTORS = {
    "ideal":   1.00,
    "warm":    0.90,
    "hot":     0.75,
    "extreme": 0.60
}

WEATHER_CONDITION_FACTORS = {
    "Clear":  1.00,
    "Cloudy": 0.95,
    "Windy":  0.90,
    "Rain":   0.70,
    "Storm":  0.50
}

# ==========================================
# RANDOMIZATION
# ==========================================

RANDOM_MIN = 0.92
RANDOM_MAX = 1.08

# ==========================================
# CROWD LEVEL THRESHOLDS
# ==========================================

LOW_THRESHOLD    = 0.30
MEDIUM_THRESHOLD = 0.60
HIGH_THRESHOLD   = 0.85

# ==========================================
# RESOURCE MAPPING
# ==========================================

RESOURCE_MAPPING = {
    "Low":      "Low",
    "Medium":   "Medium",
    "High":     "High",
    "Critical": "Emergency"
}

# ==========================================
# DEFAULT WEATHER FALLBACK
# ==========================================

DEFAULT_TEMPERATURE = 25
DEFAULT_HUMIDITY    = 50
DEFAULT_CONDITION   = "Clear"

# ==========================================
# SNOWFLAKE CONFIG
# ==========================================

SF_USER      = os.getenv("SF_USER")
SF_PASSWORD  = os.getenv("SF_PASSWORD")
SF_ACCOUNT   = os.getenv("SF_ACCOUNT")
SF_WAREHOUSE = os.getenv("SF_WAREHOUSE", "TOURISM_WH")
SF_DATABASE  = os.getenv("SF_DATABASE",  "TOURISM_DB")
SF_SCHEMA    = os.getenv("SF_SCHEMA",    "BRONZE")
SF_TABLE     = os.getenv("SF_TABLE",     "RAW_SENSOR_DATA")
