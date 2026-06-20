# Data Dictionary v1.1

## Table Schema

| Column | Data Type | Description | Example |
|---------|----------|-------------|---------|
| timestamp | TIMESTAMP | Full date and time of the observation | 2025-07-01 14:30:00 |
| date | DATE | Date only | 2025-07-01 |
| year | INTEGER | Year | 2025 |
| month | INTEGER | Month number | 7 |
| day | INTEGER | Day of month | 1 |
| hour | INTEGER | Hour of day (24h format) | 14 |
| minute | INTEGER | Minute of hour | 30 |
| location_id | VARCHAR | Unique location identifier | GZ001 |
| location_name | VARCHAR | Tourist attraction name | Pyramids of Giza |
| location_type | VARCHAR | Attraction category | Historical |
| city | VARCHAR | City / Governorate | Giza |
| capacity | INTEGER | Maximum operational capacity | 2500 |
| visitor_count | INTEGER | Current number of visitors | 1800 |
| occupancy_rate | FLOAT | Visitor count divided by capacity | 0.72 |
| crowd_status | VARCHAR | Crowd condition level | Busy |
| temperature_c | FLOAT | Temperature in Celsius | 34.5 |
| weather_condition | VARCHAR | Weather category | Sunny |
| is_real_weather | BOOLEAN | Weather source indicator | 0 |
| special_event | BOOLEAN | Indicates event occurrence | 1 |
| is_weekend | BOOLEAN | Weekend indicator | 1 |

---

# Business Rules

## 1. Crowd Status Classification

Crowd status is derived from the occupancy rate.

### Formula

```text
occupancy_rate = visitor_count / capacity
```

### Classification Rules

| Occupancy Rate | Crowd Status |
|----------------|-------------|
| < 60% | Normal |
| 60% - 85% | Busy |
| > 85% | Overcrowded |

### Examples

| Visitor Count | Capacity | Occupancy Rate | Crowd Status |
|--------------|----------|----------------|-------------|
| 1200 | 2500 | 0.48 | Normal |
| 1800 | 2500 | 0.72 | Busy |
| 2300 | 2500 | 0.92 | Overcrowded |

---

## 2. Weather Condition

### Allowed Values

| Value | Description |
|---------|------------|
| Sunny | Clear sky and sunny weather |
| Cloudy | Mostly cloudy conditions |
| Rainy | Rain is occurring |
| Windy | High wind conditions |
| Foggy | Reduced visibility due to fog |

---

## 3. Location Type

### Allowed Values

| Value | Description |
|---------|------------|
| Historical | Historical landmarks and heritage sites |
| Museum | Museums and exhibitions |
| Cultural | Cultural attractions and centers |
| Natural | Natural attractions and parks |
| Market | Traditional markets and shopping areas |

---

## 4. Special Event

Indicates whether a special event is taking place at the location.

### Allowed Values

| Value | Meaning |
|---------|---------|
| 0 | No Event |
| 1 | Event Active |

### Event Examples

- Cultural Festival
- Museum Exhibition
- National Holiday
- Tourism Campaign Event
- Concert
- International Conference

---

## 5. Weekend Indicator

Determines whether the observation date falls on a weekend.

| Value | Meaning |
|---------|---------|
| 0 | Weekday |
| 1 | Weekend |

---

## 6. Real Weather Indicator

Specifies the source of weather information.

| Value | Meaning |
|---------|---------|
| 0 | Simulated / Generated Weather Data |
| 1 | Real Weather Data |

---

# Data Relationships

## Occupancy Flow

```text
visitor_count
      │
      ▼
occupancy_rate
      │
      ▼
crowd_status
```

## Relationship Description

1. `visitor_count` records the number of visitors present.
2. `capacity` defines the maximum supported visitors.
3. `occupancy_rate` is calculated using:

```text
occupancy_rate = visitor_count / capacity
```

4. `crowd_status` is determined from the occupancy rate according to the business rules.

---

# Data Quality Rules

| Rule | Description |
|--------|-------------|
| visitor_count <= capacity | Visitor count cannot exceed capacity |
| occupancy_rate >= 0 | Occupancy rate cannot be negative |
| occupancy_rate <= 1 | Occupancy rate cannot exceed 100% |
| temperature_c > -20 | Minimum expected temperature |
| temperature_c < 60 | Maximum expected temperature |
| location_id IS NOT NULL | Location identifier is mandatory |
| timestamp IS NOT NULL | Timestamp is mandatory |
| crowd_status IN (Normal, Busy, Overcrowded) | Valid crowd status values only |
| weather_condition IN (Sunny, Cloudy, Rainy, Windy, Foggy) | Valid weather categories only |

---

# Sample Record

| Column | Value |
|----------|---------|
| timestamp | 2025-07-01 14:30:00 |
| date | 2025-07-01 |
| year | 2025 |
| month | 7 |
| day | 1 |
| hour | 14 |
| minute | 30 |
| location_id | GZ001 |
| location_name | Pyramids of Giza |
| location_type | Historical |
| city | Giza |
| capacity | 2500 |
| visitor_count | 1800 |
| occupancy_rate | 0.72 |
| crowd_status | Busy |
| temperature_c | 34.5 |
| weather_condition | Sunny |
| is_real_weather | 0 |
| special_event | 1 |
| is_weekend | 1 |

---

# Version History

| Version | Date | Description |
|----------|----------|-------------|
| 1.0 | June 2025 | Initial Data Dictionary |
| 1.1 | July 2025 | Added business rules, data quality checks, relationships, and sample records |
