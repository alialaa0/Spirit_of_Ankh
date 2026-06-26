# -*- coding: utf-8 -*-
"""
historical_generator.py
Spirit of Ankh - Historical Dataset Generator

Generates 3 years of simulated hourly tourism data
for Egyptian attractions.

Output per year:
- historical_YYYY.csv
- historical_YYYY.parquet

New columns vs v1:
- humidity
- cpi (Crowd Persistence Index)
- anomaly_flag
- weather_condition now includes Sandstorm, Rainy

Dependencies:
-------------
historical_rules.py
historical_weather.py
historical_events_engine.py

Input files:
------------
data/core_locations.csv
data/holidays_events.csv
"""

import os
import random
import pandas as pd

from historical_rules import (
    get_context_score,
    get_crowd_status,
    get_school_vacation,
    is_weekend,
    calculate_cpi,
    get_anomaly_flag
)

from historical_weather import (
    generate_weather
)

from historical_events_engine import (
    load_events,
    get_event_info
)


# ==========================================================
# CONFIG
# ==========================================================

LOCATIONS_FILE  = "data/core_locations.csv"
EVENTS_FILE     = "data/holidays_events.csv"
OUTPUT_DIR      = "output/historical"

YEARS_TO_GENERATE = [2023, 2024, 2025]

# Base utilization per popularity tier
BASE_UTILIZATION = {
    "Tier1": 0.45,
    "Tier2": 0.30,
    "Tier3": 0.20
}


# ==========================================================
# HOUR FACTOR
# How busy a location is at each hour of operation
# ==========================================================

def get_hour_factor(
    hour: int,
    opening_hour: int,
    closing_hour: int
) -> float:

    # FIX: Handle locations open 24h or from midnight (opening_hour=0)
    if opening_hour == 0 and closing_hour == 23:
        # Open all day — just use time-of-day pattern
        if 0 <= hour <= 5:
            return 0.30     # very quiet at night
        elif 6 <= hour <= 9:
            return 0.60     # morning
        elif 10 <= hour <= 15:
            return 1.20     # peak
        elif 16 <= hour <= 20:
            return 1.00     # afternoon/evening
        return 0.50         # late night

    # Outside operating hours → skip row
    if hour < opening_hour or hour >= closing_hour:
        return 0.0

    operating_hours = closing_hour - opening_hour
    if operating_hours <= 0:
        return 0.0

    progress = (hour - opening_hour) / operating_hours

    if progress < 0.20:
        return 0.60     # just opened, quiet
    elif progress < 0.40:
        return 0.90     # picking up
    elif progress < 0.70:
        return 1.30     # peak hours
    elif progress < 0.90:
        return 1.00     # afternoon steady
    return 0.70         # winding down before close


# ==========================================================
# VISITOR COUNT GENERATOR
# ==========================================================

def generate_visitor_count(
    row: pd.Series,
    context: dict,
    weather: dict,
    hour_factor: float
) -> int:

    tier = row.get("popularity_tier", "Tier2")

    base_visitors = (
        row["max_capacity"]
        * BASE_UTILIZATION.get(tier, 0.30)
    )

    popularity_factor = row["popularity_weight"]
    weather_factor    = weather["weather_factor"]

    # Gaussian noise for natural variation
    noise = random.gauss(1.0, 0.08)

    visitor_count = (
        base_visitors
        * popularity_factor
        * hour_factor
        * context["total_multiplier"]
        * weather_factor
        * noise
    )

    # Must be 0 to max_capacity
    visitor_count = max(0, int(visitor_count))
    visitor_count = min(visitor_count, int(row["max_capacity"]))

    return visitor_count


# ==========================================================
# GENERATE ONE YEAR
# ==========================================================

def generate_year_dataset(
    year: int,
    locations_df: pd.DataFrame,
    events_df: pd.DataFrame
) -> pd.DataFrame:

    records = []

    timestamps = pd.date_range(
        start=f"{year}-01-01 00:00:00",
        end=f"{year}-12-31 23:00:00",
        freq="h"
    )

    total_hours = len(timestamps)
    total_locations = len(locations_df)

    print(f"\nGenerating {year}...")
    print(f"  Hours     : {total_hours:,}")
    print(f"  Locations : {total_locations}")
    print(f"  Est. rows : ~{total_hours * total_locations:,}")
    print(f"  Processing...", end="", flush=True)

    for i, timestamp in enumerate(timestamps):

        # Progress every 1000 hours
        if i % 1000 == 0:
            print(".", end="", flush=True)

        school_vacation, _ = get_school_vacation(
            timestamp.month
        )

        # Get event info once per timestamp per city
        event_cache = {}

        for _, row in locations_df.iterrows():

            city = row["city"]

            # Cache event lookup per city per timestamp
            if city not in event_cache:
                event_cache[city] = get_event_info(
                    timestamp,
                    city,
                    events_df
                )

            event_info = event_cache[city]

            # Hour factor — skip if outside hours
            hour_factor = get_hour_factor(
                timestamp.hour,
                row["opening_hour"],
                row["closing_hour"]
            )

            if hour_factor == 0:
                continue

            # Context score
            context = get_context_score(
                city=city,
                timestamp=timestamp,
                is_holiday=event_info["is_holiday"],
                holiday_type=event_info["event_type"],
                event_multiplier=event_info["visitor_multiplier"],
                event_name=event_info["event_name"]
            )

            # Weather
            weather = generate_weather(
                city=city,
                month=timestamp.month,
                hour=timestamp.hour
            )

            # Visitor count
            visitor_count = generate_visitor_count(
                row,
                context,
                weather,
                hour_factor
            )

            # Occupancy
            occupancy_rate = round(
                visitor_count / row["max_capacity"],
                3
            )

            # Crowd status
            crowd_status = get_crowd_status(occupancy_rate)

            # CPI — Crowd Persistence Index
            cpi = calculate_cpi(
                occupancy_rate,
                context["total_multiplier"],
                weather["weather_factor"]
            )

            # Anomaly flag
            anomaly_flag = get_anomaly_flag(
                occupancy_rate,
                context["total_multiplier"]
            )

            records.append({

                # Time dimensions
                "timestamp":        timestamp,
                "date":             timestamp.date(),
                "year":             timestamp.year,
                "month":            timestamp.month,
                "day":              timestamp.day,
                "hour":             timestamp.hour,
                "day_of_week":      timestamp.strftime("%A"),
                "is_weekend":       is_weekend(timestamp),

                # Location
                "location_id":      row["location_id"],
                "location_name":    row["location_name"],
                "city":             city,
                "location_type":    row["location_type"],
                "latitude":         row["latitude"],
                "longitude":        row["longitude"],
                "opening_hour":     row["opening_hour"],
                "closing_hour":     row["closing_hour"],
                "popularity_tier":  row.get("popularity_tier", None),
                "popularity_weight": row["popularity_weight"],
                "max_capacity":     row["max_capacity"],

                # Visitors & Crowd
                "visitor_count":    visitor_count,
                "occupancy_rate":   occupancy_rate,
                "crowd_status":     crowd_status,
                "cpi":              cpi,
                "anomaly_flag":     anomaly_flag,

                # Weather
                "temperature_c":    weather["temperature_c"],
                "humidity":         weather["humidity"],
                "weather_condition": weather["weather_condition"],
                "weather_factor":   weather["weather_factor"],
                "is_real_weather":  weather["is_real_weather"],

                # Context multipliers
                "tourism_season":       context["tourism_season"],
                "season_multiplier":    context["season_multiplier"],
                "vacation_multiplier":  context["vacation_multiplier"],
                "weekend_multiplier":   context["weekend_multiplier"],
                "holiday_multiplier":   context["holiday_multiplier"],
                "event_multiplier":     context["event_multiplier"],
                "total_multiplier":     context["total_multiplier"],

                # Events
                "special_event":        event_info["event_name"],
                "event_type":           event_info["event_type"],
                "event_duration_days":  event_info["event_duration_days"],
                "is_holiday":           event_info["is_holiday"],
                "school_vacation":      school_vacation,
                "holiday_overlap":      (
                    event_info["is_holiday"] and school_vacation
                ),

                # Metadata
                "data_source": "historical_simulation"
            })

    print(" Done!")

    dataset = pd.DataFrame(records)

    return dataset


# ==========================================================
# SAVE DATASET
# ==========================================================

def save_dataset(
    dataset: pd.DataFrame,
    year: int
) -> None:

    os.makedirs(OUTPUT_DIR, exist_ok=True)

    csv_path     = os.path.join(OUTPUT_DIR, f"historical_{year}.csv")
    parquet_path = os.path.join(OUTPUT_DIR, f"historical_{year}.parquet")

    dataset.to_csv(csv_path, index=False)
    dataset.to_parquet(parquet_path, index=False)

    print(f"  Saved CSV     : {csv_path}")
    print(f"  Saved Parquet : {parquet_path}")
    print(f"  Total rows    : {len(dataset):,}")
    print(f"  Columns       : {len(dataset.columns)}")


# ==========================================================
# MAIN
# ==========================================================

if __name__ == "__main__":

    print("=" * 50)
    print("Spirit of Ankh - Historical Data Generator")
    print("=" * 50)

    # Load input files
    print("\nLoading input files...")

    locations_df = pd.read_csv(LOCATIONS_FILE)
    events_df    = load_events(EVENTS_FILE)

    print(f"  Locations loaded : {len(locations_df)}")
    print(f"  Events loaded    : {len(events_df)}")

    # Generate each year
    for year in YEARS_TO_GENERATE:

        dataset = generate_year_dataset(
            year,
            locations_df,
            events_df
        )

        save_dataset(dataset, year)

    print("\n" + "=" * 50)
    print("All years generated successfully! ✅")
    print("=" * 50)
