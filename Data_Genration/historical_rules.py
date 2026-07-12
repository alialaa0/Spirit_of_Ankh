# -*- coding: utf-8 -*-
"""
historical_rules.py
Spirit of Ankh - Business Rules Engine

FIXES:
1. Crowd status thresholds rebalanced
2. Anomaly flag threshold raised
3. Holiday multiplier checks event_name first
4. is_weekend correctly detects Friday=4, Saturday=5
"""

from datetime import datetime


# ==========================================================
# TOURISM SEASONS BY CITY
# ==========================================================

TOURISM_SEASONS = {
    "Cairo": {
        "Peak":   [11, 12, 1, 2],
        "High":   [3, 4, 10],
        "Normal": [5, 9],
        "Low":    [6, 7, 8]
    },
    "Giza": {
        "Peak":   [11, 12, 1, 2],
        "High":   [3, 4, 10],
        "Normal": [5, 9],
        "Low":    [6, 7, 8]
    },
    "Luxor": {
        "Peak":   [11, 12, 1, 2],
        "High":   [3, 4, 10],
        "Normal": [5, 9],
        "Low":    [6, 7, 8]
    },
    "Aswan": {
        "Peak":   [11, 12, 1, 2],
        "High":   [3, 4, 10],
        "Normal": [5, 9],
        "Low":    [6, 7, 8]
    },
    "Alexandria": {
        "Peak":   [6, 7, 8],
        "High":   [5, 9],
        "Normal": [4, 10],
        "Low":    [11, 12, 1, 2, 3]
    },
    "Hurghada": {
        "Peak":   [6, 7, 8, 12, 1],
        "High":   [4, 5, 9, 10],
        "Normal": [2, 3, 11],
        "Low":    []
    },
    "Sharm El Sheikh": {
        "Peak":   [6, 7, 8, 12, 1],
        "High":   [4, 5, 9, 10],
        "Normal": [2, 3, 11],
        "Low":    []
    },
    "Dahab": {
        "Peak":   [6, 7, 8],
        "High":   [4, 5, 9, 10],
        "Normal": [11, 12, 1, 2, 3],
        "Low":    []
    },
    "Fayoum": {
        "Peak":   [10, 11, 12, 1, 2, 3],
        "High":   [4, 5],
        "Normal": [9],
        "Low":    [6, 7, 8]
    }
}


# ==========================================================
# SEASON MULTIPLIERS
# ==========================================================

SEASON_MULTIPLIERS = {
    "Peak":   1.50,
    "High":   1.25,
    "Normal": 1.00,
    "Low":    0.75
}


# ==========================================================
# SCHOOL VACATIONS
# ==========================================================

SUMMER_VACATION_MONTHS  = [6, 7, 8]
MIDYEAR_VACATION_MONTHS = [1]

VACATION_MULTIPLIERS = {
    "summer":  1.25,
    "midyear": 1.15,
    "none":    1.00
}


# ==========================================================
# WEEKEND — Egypt: Friday=4, Saturday=5
# ==========================================================

WEEKEND_MULTIPLIER = 1.15


# ==========================================================
# HOLIDAY MULTIPLIERS
# ==========================================================

HOLIDAY_MULTIPLIERS = {
    "National Holiday":  1.15,
    "Religious Holiday": 1.30,
    "Ramadan":           1.20,
    "Eid Al Fitr":       1.50,
    "Eid Al Adha":       1.60,
    "Christmas":         1.10,
    "New Year":          1.10,
    "Cultural Event":    1.20,
    "Sports Event":      1.25,
    "Festival":          1.30,
    "Regular":           1.00
}


# ==========================================================
# FIX 1: CROWD STATUS — rebalanced thresholds
# ==========================================================

def get_crowd_status(occupancy_rate: float) -> str:

    if occupancy_rate >= 0.85:
        return "Overcrowded"
    elif occupancy_rate >= 0.65:
        return "Busy"
    elif occupancy_rate >= 0.35:
        return "Moderate"
    return "Low"


# ==========================================================
# FIX 2: ANOMALY FLAG — stricter threshold ~5% of rows
# ==========================================================

def get_anomaly_flag(
    occupancy_rate: float,
    total_multiplier: float
) -> bool:

    return (
        (occupancy_rate >= 0.90 and total_multiplier >= 1.80)
        or occupancy_rate >= 0.99
    )


# ==========================================================
# CPI — Crowd Persistence Index (0.0 to 1.0)
# ==========================================================

def calculate_cpi(
    occupancy_rate: float,
    total_multiplier: float,
    weather_factor: float
) -> float:

    cpi = (
        (occupancy_rate * 0.60)
        + ((min(total_multiplier, 2.5) / 2.5) * 0.25)
        + (weather_factor * 0.15)
    )

    return round(min(cpi, 1.0), 3)


# ==========================================================
# TOURISM SEASON
# ==========================================================

def get_tourism_season(city: str, month: int) -> str:

    city_rules = TOURISM_SEASONS.get(city)

    if not city_rules:
        return "Normal"

    for season_name, months in city_rules.items():
        if month in months:
            return season_name

    return "Normal"


# ==========================================================
# SEASON MULTIPLIER
# ==========================================================

def get_season_multiplier(city: str, month: int) -> float:

    season = get_tourism_season(city, month)
    return SEASON_MULTIPLIERS.get(season, 1.0)


# ==========================================================
# SCHOOL VACATION
# ==========================================================

def get_school_vacation(month: int):

    if month in SUMMER_VACATION_MONTHS:
        return True, "summer"
    if month in MIDYEAR_VACATION_MONTHS:
        return True, "midyear"
    return False, "none"


def get_vacation_multiplier(month: int) -> float:

    _, vacation_type = get_school_vacation(month)
    return VACATION_MULTIPLIERS[vacation_type]


# ==========================================================
# FIX 4: WEEKEND — explicitly checks Friday=4, Saturday=5
# ==========================================================

def is_weekend(timestamp: datetime) -> bool:
    # Egypt weekend: Friday = weekday 4, Saturday = weekday 5
    return timestamp.weekday() in [4, 5]


def get_weekend_multiplier(timestamp: datetime) -> float:

    if is_weekend(timestamp):
        return WEEKEND_MULTIPLIER
    return 1.0


# ==========================================================
# FIX 3: HOLIDAY MULTIPLIER
# Checks event_name first then falls back to event_type
# ==========================================================

def get_holiday_multiplier(
    is_holiday: bool,
    holiday_type: str = "Regular",
    event_name: str = None
) -> float:

    if not is_holiday:
        return 1.0

    # Check specific event name first
    if event_name and event_name in HOLIDAY_MULTIPLIERS:
        return HOLIDAY_MULTIPLIERS[event_name]

    # Fall back to event type
    return HOLIDAY_MULTIPLIERS.get(holiday_type, 1.15)


# ==========================================================
# MASTER CONTEXT ENGINE
# ==========================================================

def get_context_score(
    city: str,
    timestamp: datetime,
    is_holiday: bool = False,
    holiday_type: str = "Regular",
    event_multiplier: float = 1.0,
    event_name: str = None
) -> dict:

    month = timestamp.month

    season_multiplier   = get_season_multiplier(city, month)
    vacation_multiplier = get_vacation_multiplier(month)
    weekend_multiplier  = get_weekend_multiplier(timestamp)
    holiday_multiplier  = get_holiday_multiplier(
        is_holiday, holiday_type, event_name
    )

    total_multiplier = (
        season_multiplier
        * vacation_multiplier
        * weekend_multiplier
        * holiday_multiplier
        * event_multiplier
    )

    total_multiplier = min(total_multiplier, 2.50)

    return {
        "tourism_season":      get_tourism_season(city, month),
        "season_multiplier":   round(season_multiplier,   3),
        "vacation_multiplier": round(vacation_multiplier, 3),
        "weekend_multiplier":  round(weekend_multiplier,  3),
        "holiday_multiplier":  round(holiday_multiplier,  3),
        "event_multiplier":    round(event_multiplier,    3),
        "total_multiplier":    round(total_multiplier,    3)
    }
