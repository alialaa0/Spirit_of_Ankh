# Data Dictionary v1.2

## Dataset Columns

| Column | Data Type | Description | Example |
|----------|----------|----------|----------|
| timestamp | TIMESTAMP | Full date and time of the observation | 2025-07-01 14:30:00 |
| date | DATE | Date only | 2025-07-01 |
| year | INTEGER | Year | 2025 |
| month | INTEGER | Month number | 7 |
| day | INTEGER | Day of month | 1 |
| hour | INTEGER | Hour of day (24-hour format) | 14 |
| minute | INTEGER | Minute of hour | 30 |
| day_of_week | VARCHAR | Day name | Monday |
| season | VARCHAR | Season of the year | Summer |
| location_id | VARCHAR | Unique location identifier | GZ001 |
| location_name | VARCHAR | Tourist attraction name | Pyramids of Giza |
| location_type | VARCHAR | Attraction category | Historical |
| city | VARCHAR | City/Governorate | Giza |
| capacity | INTEGER | Maximum operational capacity | 2500 |
| visitor_count | INTEGER | Number of visitors at the observation time | 1800 |
| occupancy_rate | FLOAT | Visitor count divided by capacity | 0.72 |
| crowd_status | VARCHAR | Crowd condition level | Busy |
| temperature_c | FLOAT | Temperature in Celsius | 34.5 |
| weather_condition | VARCHAR | Weather category | Sunny |
| is_real_weather | BOOLEAN | Indicates whether weather data comes from a real API or simulated source | 0 |
| special_event | BOOLEAN | Indicates whether a special event is active | 1 |
| event_type | VARCHAR | Type of special event | Festival |
| is_weekend | BOOLEAN | Weekend indicator | 1 |
| is_holiday | BOOLEAN | Public holiday indicator | 1 |

---

# Business Rules

## Crowd Status

| Occupancy Rate | Status |
|---------------|---------|
| < 60% | Normal |
| 60% - 85% | Busy |
| > 85% | Overcrowded |

---

## Weather Condition

### Allowed Values

- Sunny
- Cloudy
- Rainy
- Windy
- Foggy

---

## Location Type

### Allowed Values

- Historical
- Museum
- Cultural
- Natural
- Market

---

## Season

### Allowed Values

- Winter
- Spring
- Summer
- Autumn

---

## Event Type

### Allowed Values

- None
- Festival
- Conference
- Exhibition
- National Event

---

## Special Event

### Values

| Value | Meaning |
|---------|---------|
| 0 | No Event |
| 1 | Event Active |

### Examples

- Cultural Festival
- Museum Exhibition
- National Holiday Event
- Tourism Campaign Event

---

## Is Weekend

### Values

| Value | Meaning |
|---------|---------|
| 0 | Weekday |
| 1 | Weekend |

---

## Is Holiday

### Values

| Value | Meaning |
|---------|---------|
| 0 | Normal Day |
| 1 | Public Holiday |

### Examples

- Eid Al-Fitr
- Eid Al-Adha
- Sham El-Nessim
- Revolution Day
- New Year Holiday

---

# Relationships

```text
visitor_count
      ↓
occupancy_rate
      ↓
crowd_status
```

---

# Feature Categories

## Time Features

- timestamp
- date
- year
- month
- day
- hour
- minute
- day_of_week
- season

---

## Location Features

- location_id
- location_name
- location_type
- city
- capacity

---

## Crowd Features

- visitor_count
- occupancy_rate
- crowd_status

---

## Weather Features

- temperature_c
- weather_condition
- is_real_weather

---

## Event Features

- special_event
- event_type

---

## Calendar Features

- is_weekend
- is_holiday

---

# Dataset Summary

| Item | Value |
|--------|--------|
| Total Columns | 24 |
| Tourist Locations | 25 |
| Cities Covered | 9 |
| Data Type | Tourism Crowd Analytics |
| Update Frequency | 5–10 Seconds (Live Stream) |
| Historical Data | 2M–5M+ Records |
| ML Target | visitor_count |
| Warehouse | Snowflake |
| Transformation Tool | dbt |

---

# Project

**Spirit of Ankh – Smart Tourism Intelligence Platform**

Version: **1.2**
