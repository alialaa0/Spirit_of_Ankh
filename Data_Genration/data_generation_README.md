# data_generation/

Generates 3 years (2023-2025) of realistic hourly tourism data for 45
Egyptian attractions — approximately 586,000 rows total.

---

## What it does

```
historical_generator.py
        |
        v reads
data/core_locations.csv      data/holidays_events.csv
        |
        v uses
historical_rules.py          tourism seasons, multipliers, CPI, anomaly
historical_weather.py        simulated weather per city per season
historical_events_engine.py  events + Islamic holidays (year-aware)
        |
        v outputs
output/historical/
    historical_2023.csv / .parquet
    historical_2024.csv / .parquet
    historical_2025.csv / .parquet
```

---

## Files

| File | Purpose |
|---|---|
| `historical_generator.py` | full 3-year generator — run this for real output |
| `historical_generator_test.py` | fast multi-period test (weekend, Ramadan, Eid, summer) — run this first |
| `historical_rules.py` | tourism seasons per city, season/vacation/weekend/holiday multipliers, CPI formula, anomaly detection, crowd status thresholds |
| `historical_weather.py` | simulated weather per city per season (includes Sandstorm, Rainy) |
| `historical_events_engine.py` | regular events from CSV + Islamic holidays hardcoded per year (Ramadan/Eid shift ~11 days yearly) |

---

## Output columns (43)

Time: `timestamp, date, year, month, day, hour, day_of_week, is_weekend`
Location: `location_id, location_name, city, location_type, latitude,
longitude, opening_hour, closing_hour, popularity_tier,
popularity_weight, max_capacity`
Crowd: `visitor_count, occupancy_rate, crowd_status, cpi, anomaly_flag`
Weather: `temperature_c, humidity, weather_condition, weather_factor,
is_real_weather`
Context: `tourism_season, season_multiplier, vacation_multiplier,
weekend_multiplier, holiday_multiplier, event_multiplier,
total_multiplier`
Events: `special_event, event_type, event_duration_days, is_holiday,
school_vacation, holiday_overlap`
Metadata: `data_source`

---

## Islamic holidays (moving dates)

| Year | Ramadan | Eid Al Fitr | Eid Al Adha |
|---|---|---|---|
| 2023 | Mar 23 – Apr 21 | Apr 22 – Apr 24 | Jun 28 – Jul 1 |
| 2024 | Mar 11 – Apr 9 | Apr 10 – Apr 12 | Jun 16 – Jun 19 |
| 2025 | Mar 1 – Mar 30 | Mar 31 – Apr 2 | Jun 6 – Jun 9 |

---

## CPI formula

```
CPI = (occupancy_rate × 0.60)
    + (total_multiplier / 2.5 × 0.25)
    + (weather_factor × 0.15)
```
Score 0.0 (empty) to 1.0 (maximum crowding) — a weighted average, not a
multiplication, to avoid clustering near 1.0.

## Anomaly detection

```
(occupancy >= 0.90 AND total_multiplier >= 1.80)
OR occupancy >= 0.99
```

---

## How to run

```bash
python historical_generator_test.py   # verify first, fast
python historical_generator.py        # full run, 15-30 minutes
```
