# sensor/

Real-time IoT crowd sensor simulator for 45 Egyptian tourist attractions.

---

## What it does

Simulates IoT sensors placed at Egyptian attractions. Each run produces
one snapshot of current crowd levels based on real weather, time of
day, active events, and location popularity.

```
sensor_simulator.py
        |
        v
fetches real weather (OpenWeatherMap API)
        |
        v
calculates visitor count, crowd density, noise, satisfaction
        |
        v
saves output/tourism_sensor_data.csv (45 rows)
```

---

## Files

| File | Purpose |
|---|---|
| `sensor_simulator.py` | main script — run this |
| `config.py` | settings, paths, loads `.env` (absolute path, works from any directory) |
| `weather_engine.py` | fetches real weather; handles missing key / 401 / 429 / timeout; overrides condition to Hot/Sunny/Cold by temperature |
| `crowd_engine.py` | visitor count, crowd density, crowd level, noise, satisfaction score, peak flag |
| `event_engine.py` | checks active holidays/events per location for the current date |

---

## Output columns (30)

`timestamp, simulation_hour, day_of_week, is_weekend, location_id,
location_name, city, location_type, latitude, longitude, is_open,
opening_hour, closing_hour, visitor_count, crowd_density, crowd_level,
temperature_c, humidity, weather_condition, weather_factor, event_name,
event_type, event_multiplier, holiday_overlap, school_vacation,
tourism_season, resource_usage, noise_level_db, satisfaction_score,
peak_flag`

---

## How to run

```bash
pip install pandas requests python-dotenv snowflake-connector-python
```

Create `.env` in this folder (see `.env.example` in repo root):
```
OPENWEATHER_API_KEY=your_key
SF_USER=...
SF_PASSWORD=...
SF_ACCOUNT=...
```

Run:
```bash
python sensor_simulator.py
```

Expected output:
```
Starting Spirit of Ankh Sensor Simulator...
Fetching weather data...
  [Cairo] Temp: 34.5°C | Condition: Clear
  [Luxor] Temp: 39.2°C | Condition: Sunny
Generated Records : 45
Output saved to   : output/tourism_sensor_data.csv
Done!
```

---

## How crowd is calculated

```
visitor_count = base_visitors
              × popularity_weight
              × hour_factor        (peak hours = 1.2x)
              × weather_factor     (hot weather = 0.75x)
              × event_multiplier   (Eid = 1.5x)
              × random_noise       (±8%)
```

---

## Notes

- Run every 10 minutes for continuous monitoring (see `airflow-docker/`)
- Each run overwrites the previous CSV
- Loaded into Snowflake via `snowflake/snowflake_loader.py`
- Weather condition is real API data — "Clear" most of the time in
  Egyptian summer is expected, not a bug
