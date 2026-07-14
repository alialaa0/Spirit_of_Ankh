# -*- coding: utf-8 -*-
"""
historical_events_engine.py
Spirit of Ankh - Historical Events Engine

Handles:
- Regular events from CSV (year-aware date matching)
- Islamic holidays hardcoded with correct moving dates:
    * Ramadan (moves ~11 days earlier each year)
    * Eid Al Fitr (always 1 day after Ramadan ends)
    * Eid Al Adha (moves every year independently)
"""

import pandas as pd
from datetime import timedelta


# ==========================================================
# ISLAMIC HOLIDAYS — CORRECT MOVING DATES
# Ramadan, Eid Al Fitr, Eid Al Adha
# ==========================================================

ISLAMIC_HOLIDAYS = {

    2023: {
        "Ramadan": {
            "start": "2023-03-23",
            "end":   "2023-04-21",   # 30 days
        },
        "Eid Al Fitr": {
            "start": "2023-04-22",   # 1 day after Ramadan ends
            "end":   "2023-04-24",   # 3 day celebration
        },
        "Eid Al Adha": {
            "start": "2023-06-28",
            "end":   "2023-07-01",   # 4 day celebration
        }
    },

    2024: {
        "Ramadan": {
            "start": "2024-03-11",
            "end":   "2024-04-09",   # 30 days
        },
        "Eid Al Fitr": {
            "start": "2024-04-10",   # 1 day after Ramadan ends
            "end":   "2024-04-12",   # 3 day celebration
        },
        "Eid Al Adha": {
            "start": "2024-06-16",
            "end":   "2024-06-19",   # 4 day celebration
        }
    },

    2025: {
        "Ramadan": {
            "start": "2025-03-01",
            "end":   "2025-03-30",   # 30 days
        },
        "Eid Al Fitr": {
            "start": "2025-03-31",   # 1 day after Ramadan ends
            "end":   "2025-04-02",   # 3 day celebration
        },
        "Eid Al Adha": {
            "start": "2025-06-06",
            "end":   "2025-06-09",   # 4 day celebration
        }
    }
}

# Multipliers for Islamic holidays
ISLAMIC_MULTIPLIERS = {
    "Ramadan":     1.20,   # busy but different pattern
    "Eid Al Fitr": 1.50,   # very busy
    "Eid Al Adha": 1.60,   # busiest holiday
}

ISLAMIC_SCHOOL_VACATION = {
    "Ramadan":     False,
    "Eid Al Fitr": True,
    "Eid Al Adha": True,
}


# ==========================================================
# LOAD EVENTS FROM CSV
# ==========================================================

def load_events(file_path: str) -> pd.DataFrame:

    events_df = pd.read_csv(file_path)

    events_df["start_date"] = pd.to_datetime(
        events_df["start_date"]
    )

    events_df["end_date"] = pd.to_datetime(
        events_df["end_date"]
    )

    # Remove any Ramadan/Eid rows from CSV
    # because we handle them in code correctly
    islamic_names = ["Ramadan", "Eid Al Fitr", "Eid Al Adha"]

    events_df = events_df[
        ~events_df["event_name"].isin(islamic_names)
    ].reset_index(drop=True)

    return events_df


# ==========================================================
# CHECK ISLAMIC HOLIDAYS
# ==========================================================

def check_islamic_holiday(
    current_date: pd.Timestamp
) -> dict:

    year = current_date.year

    year_holidays = ISLAMIC_HOLIDAYS.get(year, {})

    for holiday_name, dates in year_holidays.items():

        start = pd.Timestamp(dates["start"])
        end   = pd.Timestamp(dates["end"])

        if start <= current_date <= end:

            duration = (end - start).days + 1

            return {
                "is_holiday":          True,
                "event_name":          holiday_name,
                "event_type":          "Religious Holiday",
                "visitor_multiplier":  ISLAMIC_MULTIPLIERS.get(
                                           holiday_name, 1.30
                                       ),
                "school_vacation":     ISLAMIC_SCHOOL_VACATION.get(
                                           holiday_name, False
                                       ),
                "tourism_season":      True,
                "event_duration_days": duration
            }

    return None


# ==========================================================
# GET EVENT INFO FOR A DATE + CITY
# ==========================================================

def get_event_info(
    timestamp: pd.Timestamp,
    city: str,
    events_df: pd.DataFrame
) -> dict:

    current_date = pd.Timestamp(timestamp).normalize()

    # Step 1 — Check Islamic holidays first (moving dates)
    islamic_result = check_islamic_holiday(current_date)

    if islamic_result:
        return islamic_result

    # Step 2 — Check regular events from CSV (year-aware)
    for _, event in events_df.iterrows():

        city_match = (
            city in str(event["cities_affected"])
            or "Nationwide" in str(event["cities_affected"])
        )

        if not city_match:
            continue

        if event["start_date"] <= current_date <= event["end_date"]:

            duration = (
                event["end_date"] - event["start_date"]
            ).days + 1

            return {
                "is_holiday":          True,
                "event_name":          event["event_name"],
                "event_type":          event["event_type"],
                "visitor_multiplier":  float(event["visitor_multiplier"]),
                "school_vacation":     bool(event["school_vacation"]),
                "tourism_season":      bool(event["tourism_season"]),
                "event_duration_days": duration
            }

    # Step 3 — No event found → regular day
    return {
        "is_holiday":            False,
        "event_name":            None,
        "event_type":            None,
        "visitor_multiplier":    1.0,
        "school_vacation":       False,
        "tourism_season":        False,
        "event_duration_days":   0
    }
