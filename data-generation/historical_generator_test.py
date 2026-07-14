# -*- coding: utf-8 -*-
"""
historical_generator_test.py
Spirit of Ankh - MULTI-PERIOD TEST

Tests 4 specific scenarios to verify all fixes:

TEST 1: Jan 19-21 2024 (Friday + Saturday + Sunday)
        → Verifies is_weekend is TRUE for Fri/Sat, FALSE for Sun

TEST 2: Mar 11-13 2024 (Ramadan start)
        → Verifies Ramadan event detected, multiplier = 1.20

TEST 3: Apr 10-12 2024 (Eid Al Fitr)
        → Verifies Eid Al Fitr multiplier = 1.50
        → Verifies Eid comes AFTER Ramadan ends

TEST 4: Jul 15-17 2024 (Summer)
        → Verifies Cairo = Low season (multiplier 0.75)
        → Verifies Alexandria = Peak season (multiplier 1.50)
        → Verifies temperatures are realistic (not too low)

Uses ALL 45 locations (not just 5)
Saves one CSV per test period
"""

import os
import random
import pandas as pd
from datetime import datetime

from historical_rules import (
    get_context_score,
    get_crowd_status,
    get_school_vacation,
    is_weekend,
    calculate_cpi,
    get_anomaly_flag
)

from historical_weather import generate_weather

from historical_events_engine import (
    load_events,
    get_event_info
)


# ==========================================================
# CONFIG
# ==========================================================

LOCATIONS_FILE = "data/core_locations.csv"
EVENTS_FILE    = "data/holidays_events.csv"
OUTPUT_DIR     = "output"

TEST_PERIODS = [
    {
        "name":  "weekend_test",
        "label": "TEST 1 — Weekend Detection (Fri/Sat/Sun)",
        "start": "2024-01-19 00:00:00",
        "end":   "2024-01-21 23:00:00"
    },
    {
        "name":  "ramadan_test",
        "label": "TEST 2 — Ramadan Start",
        "start": "2024-03-11 00:00:00",
        "end":   "2024-03-13 23:00:00"
    },
    {
        "name":  "eid_test",
        "label": "TEST 3 — Eid Al Fitr",
        "start": "2024-04-10 00:00:00",
        "end":   "2024-04-12 23:00:00"
    },
    {
        "name":  "summer_test",
        "label": "TEST 4 — Summer (Cairo Low / Alexandria Peak)",
        "start": "2024-07-15 00:00:00",
        "end":   "2024-07-17 23:00:00"
    }
]

BASE_UTILIZATION = {
    "Tier1": 0.45,
    "Tier2": 0.30,
    "Tier3": 0.20
}


# ==========================================================
# HOUR FACTOR
# ==========================================================

def get_hour_factor(hour, opening_hour, closing_hour):

    # Handle 24h locations (opening_hour=0)
    if opening_hour == 0 and closing_hour == 23:
        if 0 <= hour <= 5:   return 0.30
        elif 6 <= hour <= 9: return 0.60
        elif 10 <= hour <= 15: return 1.20
        elif 16 <= hour <= 20: return 1.00
        return 0.50

    if hour < opening_hour or hour >= closing_hour:
        return 0.0

    operating_hours = closing_hour - opening_hour
    if operating_hours <= 0:
        return 0.0

    progress = (hour - opening_hour) / operating_hours

    if progress < 0.20:   return 0.60
    elif progress < 0.40: return 0.90
    elif progress < 0.70: return 1.30
    elif progress < 0.90: return 1.00
    return 0.70


# ==========================================================
# VISITOR COUNT
# ==========================================================

def generate_visitor_count(row, context, weather, hour_factor):

    tier = row.get("popularity_tier", "Tier2")
    base = row["max_capacity"] * BASE_UTILIZATION.get(tier, 0.30)

    visitors = (
        base
        * row["popularity_weight"]
        * hour_factor
        * context["total_multiplier"]
        * weather["weather_factor"]
        * random.gauss(1.0, 0.08)
    )

    return max(0, min(int(visitors), int(row["max_capacity"])))


# ==========================================================
# GENERATE ONE TEST PERIOD
# ==========================================================

def generate_period(
    period: dict,
    locations_df: pd.DataFrame,
    events_df: pd.DataFrame
) -> pd.DataFrame:

    print(f"\n{'='*55}")
    print(f"  {period['label']}")
    print(f"{'='*55}")

    timestamps = pd.date_range(
        start=period["start"],
        end=period["end"],
        freq="h"
    )

    records = []

    for timestamp in timestamps:

        school_vacation, _ = get_school_vacation(timestamp.month)
        event_cache = {}

        for _, row in locations_df.iterrows():

            city = row["city"]

            if city not in event_cache:
                event_cache[city] = get_event_info(
                    timestamp, city, events_df
                )

            event_info = event_cache[city]

            hour_factor = get_hour_factor(
                timestamp.hour,
                row["opening_hour"],
                row["closing_hour"]
            )

            if hour_factor == 0:
                continue

            context = get_context_score(
                city=city,
                timestamp=timestamp,
                is_holiday=event_info["is_holiday"],
                holiday_type=event_info["event_type"],
                event_multiplier=event_info["visitor_multiplier"],
                event_name=event_info["event_name"]
            )

            weather = generate_weather(
                city=city,
                month=timestamp.month,
                hour=timestamp.hour
            )

            visitor_count = generate_visitor_count(
                row, context, weather, hour_factor
            )

            occupancy_rate = round(
                visitor_count / row["max_capacity"], 3
            )

            records.append({
                "timestamp":        timestamp,
                "date":             timestamp.date(),
                "year":             timestamp.year,
                "month":            timestamp.month,
                "day":              timestamp.day,
                "hour":             timestamp.hour,
                "day_of_week":      timestamp.strftime("%A"),
                "is_weekend":       is_weekend(timestamp),
                "location_id":      row["location_id"],
                "location_name":    row["location_name"],
                "city":             city,
                "location_type":    row["location_type"],
                "latitude":         row["latitude"],
                "longitude":        row["longitude"],
                "opening_hour":     row["opening_hour"],
                "closing_hour":     row["closing_hour"],
                "popularity_tier":  row.get("popularity_tier"),
                "popularity_weight": row["popularity_weight"],
                "max_capacity":     row["max_capacity"],
                "visitor_count":    visitor_count,
                "occupancy_rate":   occupancy_rate,
                "crowd_status":     get_crowd_status(occupancy_rate),
                "cpi":              calculate_cpi(
                                        occupancy_rate,
                                        context["total_multiplier"],
                                        weather["weather_factor"]
                                    ),
                "anomaly_flag":     get_anomaly_flag(
                                        occupancy_rate,
                                        context["total_multiplier"]
                                    ),
                "temperature_c":    weather["temperature_c"],
                "humidity":         weather["humidity"],
                "weather_condition": weather["weather_condition"],
                "weather_factor":   weather["weather_factor"],
                "is_real_weather":  False,
                "tourism_season":       context["tourism_season"],
                "season_multiplier":    context["season_multiplier"],
                "vacation_multiplier":  context["vacation_multiplier"],
                "weekend_multiplier":   context["weekend_multiplier"],
                "holiday_multiplier":   context["holiday_multiplier"],
                "event_multiplier":     context["event_multiplier"],
                "total_multiplier":     context["total_multiplier"],
                "special_event":        event_info["event_name"],
                "event_type":           event_info["event_type"],
                "event_duration_days":  event_info["event_duration_days"],
                "is_holiday":           event_info["is_holiday"],
                "school_vacation":      school_vacation,
                "holiday_overlap":      (
                    event_info["is_holiday"] and school_vacation
                ),
                "data_source": "historical_simulation"
            })

    df = pd.DataFrame(records)

    # Print summary
    print(f"\n  Rows generated : {len(df):,}")

    if len(df) > 0:

        print(f"\n  --- WEEKEND CHECK ---")
        weekend_summary = df.groupby(['day_of_week', 'is_weekend']).size().reset_index()
        for _, r in weekend_summary.iterrows():
            print(f"  {r['day_of_week']:10} | is_weekend={r['is_weekend']} | rows={r[0]}")

        print(f"\n  --- EVENTS CHECK ---")
        events = df[df['special_event'].notna()]['special_event'].value_counts()
        if len(events) > 0:
            for event, count in events.items():
                mult = df[df['special_event']==event]['holiday_multiplier'].iloc[0]
                print(f"  {event:20} | rows={count:>5} | holiday_multiplier={mult}")
        else:
            print("  No events this period")

        print(f"\n  --- TEMPERATURE CHECK ---")
        temp_by_city = df.groupby('city')['temperature_c'].agg(['min','max','mean']).round(1)
        print(temp_by_city.to_string())

        print(f"\n  --- TOURISM SEASON CHECK ---")
        season = df.groupby(['city','tourism_season'])['total_multiplier'].mean().round(3)
        print(season.to_string())

        print(f"\n  --- CROWD STATUS ---")
        total = len(df)
        for status, count in df['crowd_status'].value_counts().items():
            print(f"  {status:12} : {count:>5} ({count/total*100:.1f}%)")

    return df


# ==========================================================
# MAIN
# ==========================================================

if __name__ == "__main__":

    print("=" * 55)
    print("  Spirit of Ankh - MULTI-PERIOD TEST")
    print("=" * 55)

    os.makedirs(OUTPUT_DIR, exist_ok=True)

    locations_df = pd.read_csv(LOCATIONS_FILE)
    events_df    = load_events(EVENTS_FILE)

    print(f"\nLocations : {len(locations_df)}")
    print(f"Events    : {len(events_df)}")

    all_results = {}

    for period in TEST_PERIODS:

        df = generate_period(period, locations_df, events_df)

        path = os.path.join(OUTPUT_DIR, f"{period['name']}.csv")
        df.to_csv(path, index=False)

        all_results[period["name"]] = df

        print(f"\n  Saved → {path} ✅")

    print(f"\n{'='*55}")
    print("  ALL TESTS COMPLETE ✅")
    print(f"{'='*55}")
    print("\nFiles saved:")
    for period in TEST_PERIODS:
        print(f"  output/{period['name']}.csv")
