# Sensor Simulator Documentation

---

# Overview

The **Sensor Simulator** is the core data generation component of the **Smart Tourism & Crowd Management Platform**.

Its primary purpose is to simulate real-time tourism activity across major Egyptian tourist attractions in the absence of physical IoT sensors.

In a real-world deployment, visitor information would typically come from:

- Smart Gates
- Ticketing Systems
- CCTV Analytics
- Mobile Device Tracking
- WiFi Access Points
- IoT Sensors

Since these data sources are unavailable during development, the Sensor Simulator was designed to generate realistic tourism records that mimic real operational conditions.

The simulator creates one record for each tourist attraction and estimates:

- Visitor Count
- Crowd Density
- Crowd Level
- Resource Requirements
- Noise Levels
- Visitor Satisfaction
- Event Impact
- Weather Impact

The generated data serves as the foundation for:

- Machine Learning Models
- Snowflake Data Warehouse
- Analytics Dashboards
- Tourism Forecasting
- Crowd Prediction

---

# Sensor Architecture

The Sensor Simulator integrates information from three major sources:

1. Tourist Locations Dataset
2. Events Dataset
3. Weather API

These sources are processed through specialized engines before generating the final tourism record.

## Architecture Flow

```text
Core Locations Dataset
        +
Events Dataset
        +
Weather API

        ↓

Weather Engine

        ↓

Event Engine

        ↓

Crowd Engine

        ↓

Sensor Simulator

        ↓

Tourism Dataset
```

---

# Sensor Data Flow

## Step 1 — Load Tourist Attractions

The simulator loads all tourist attractions from:

```text
core_locations.csv
```

Each attraction contains:

- Location ID
- Name
- City
- Type
- Coordinates
- Capacity
- Opening Hours
- Closing Hours
- Popularity Weight

---

## Step 2 — Load Tourism Events

The simulator loads:

```text
holidays_events.csv
```

This file contains:

- Public Holidays
- Religious Holidays
- National Holidays
- Festivals
- School Vacations
- Tourism Seasons
- Sports Events

These events influence tourism demand.

---

## Step 3 — Retrieve Weather Information

The Weather Engine retrieves:

- Temperature
- Humidity
- Weather Condition

from OpenWeather API.

Weather information is later converted into a tourism demand factor.

---

## Step 4 — Determine Active Events

The current date is compared against:

```text
start_date
end_date
```

for every event.

Only active events are selected.

Events are then filtered by city.

---

## Step 5 — Check Operating Hours

The simulator verifies whether the attraction is currently open.

### Inputs

- Current Hour
- Opening Hour
- Closing Hour

### Output

```text
is_open
```

Possible values:

```text
1 = Open
0 = Closed
```

If a location is closed:

```python
visitor_count = 0
```

This ensures realistic behavior.

---

## Step 6 — Calculate Tourism Demand

Tourism demand is estimated using:

- Attraction Popularity
- Attraction Capacity
- Weather Conditions
- Active Events
- Time of Day

These variables are combined to estimate visitor activity.

---

## Step 7 — Generate Crowd Metrics

Once visitors are generated, additional operational metrics are calculated.

Metrics include:

- Crowd Density
- Crowd Level
- Resource Usage
- Noise Level
- Satisfaction Score
- Peak Flag

---

## Step 8 — Generate Final Record

The final record is appended to the dataset.

One record is created for every tourist attraction.

---

# Why A Sensor Simulator?

A real Smart Tourism platform would normally receive data from:

- Camera Systems
- Mobile Devices
- Smart Gates
- WiFi Tracking
- Ticketing Systems
- IoT Sensors

However, these sources are unavailable during development.

Therefore, a simulation layer was introduced to create realistic tourism data.

### Benefits

- Enables early model development
- Supports machine learning training
- Allows pipeline testing
- Allows dashboard development
- Provides historical data generation

---

# Sensor Output Dataset

Each row represents the state of a tourist attraction at a specific moment.

### Example

```text
Pyramids of Giza
23 June 2026
14:00
```

The record contains all operational indicators related to that attraction.

---

# Dataset Column Definitions

---

## timestamp

### Description

Timestamp indicating when the record was generated.

### Purpose

Allows time-series analysis and historical tracking.

### Example

```text
2026-06-23T14:00:00
```

---

## simulation_hour

### Description

Hour used during simulation.

### Purpose

Captures hourly tourism patterns.

### Example

```text
14
```

Meaning:

```text
2 PM
```

---

## day_of_week

### Description

Current day name.

### Example

```text
Tuesday
```

### Purpose

Tourism demand varies significantly by weekday.

---

## is_weekend

### Description

Weekend indicator.

### Values

```text
1 = Weekend
0 = Weekday
```

### Purpose

Tourist activity typically increases during weekends.

---

## location_id

### Description

Unique identifier for each attraction.

### Purpose

Primary key for tracking locations.

### Example

```text
GIZ_01
```

---

## location_name

### Description

Name of tourist attraction.

### Example

```text
Pyramids of Giza
```

---

## city

### Description

City where the attraction is located.

### Purpose

Used for weather, event filtering, and analytics.

---

## location_type

### Description

Category of attraction.

### Examples

- Museum
- Historical
- Market
- Beach
- Leisure

### Purpose

Supports segmentation and analysis.

---

## latitude

### Description

Latitude coordinate.

### Purpose

Geographic mapping and GIS analysis.

---

## longitude

### Description

Longitude coordinate.

### Purpose

Location visualization and geospatial analytics.

---

## is_open

### Description

Indicates whether the attraction is currently operating.

### Values

```text
1 = Open
0 = Closed
```

### Purpose

Prevents unrealistic visitor generation outside operating hours.

---

## opening_hour

### Description

Official opening hour.

### Example

```text
08
```

Meaning:

```text
8 AM
```

---

## closing_hour

### Description

Official closing hour.

### Example

```text
17
```

Meaning:

```text
5 PM
```

---

## visitor_count

### Description

Estimated number of visitors currently present.

### Purpose

Main target variable of the entire dataset.

### Business Importance

Represents tourism demand.

### Calculation Inputs

- Capacity
- Popularity
- Weather
- Events
- Time of Day

---

## crowd_density

### Description

Normalized crowd measurement.

### Formula

```text
Crowd Density =
Visitor Count / Maximum Capacity
```

### Purpose

Allows fair comparison across attractions of different sizes.

---

## crowd_level

### Description

Human-readable crowd classification.

### Values

```text
Low
Medium
High
Critical
```

### Purpose

Simplifies operational decision-making.

---

## temperature_c

### Description

Current temperature.

### Unit

```text
Celsius
```

### Purpose

Used in weather impact calculations.

---

## humidity

### Description

Current humidity percentage.

### Purpose

Provides additional weather context.

---

## weather_condition

### Description

Normalized weather category.

### Possible Values

```text
Clear
Cloudy
Windy
Rain
Storm
```

### Purpose

Used to estimate tourism demand.

---

## weather_factor

### Description

Numerical weather impact multiplier.

### Examples

```text
Clear = 1.00
Rain  = 0.70
Storm = 0.50
```

### Purpose

Adjusts expected visitor volume.

---

## event_name

### Description

Highest-priority active event.

### Purpose

Provides context for tourism spikes.

---

## event_type

### Description

Category of active event.

### Examples

```text
Festival
Holiday
Tourism Season
School Vacation
```

---

## event_multiplier

### Description

Combined tourism impact of active events.

### Purpose

Increases expected visitor demand during major events.

---

## holiday_overlap

### Description

Number of overlapping active events.

### Purpose

Measures event stacking effects.

---

## school_vacation

### Description

School vacation indicator.

### Values

```text
1 = Active
0 = Not Active
```

### Purpose

School breaks significantly affect tourism volume.

---

## tourism_season

### Description

Tourism season indicator.

### Values

```text
1 = Active
0 = Not Active
```

### Purpose

Captures seasonal tourism patterns.

---

## resource_usage

### Description

Estimated operational resource requirement.

### Values

```text
Low
Medium
High
Emergency
```

### Purpose

Supports resource allocation planning.

---

## noise_level_db

### Description

Estimated environmental noise level.

### Unit

```text
Decibels (dB)
```

### Purpose

Represents crowd-generated noise.

---

## satisfaction_score

### Description

Estimated visitor satisfaction level.

### Range

```text
0 → 100
```

### Purpose

Represents visitor experience quality.

---

## peak_flag

### Description

Peak crowd indicator.

### Values

```text
1 = Peak Situation
0 = Normal Situation
```

### Purpose

Used for alerts, analytics, and machine learning.

---

# Sensor Output Purpose

The generated dataset is designed to support:

- Crowd Monitoring
- Tourism Analytics
- Historical Data Generation
- Machine Learning Training
- Demand Forecasting
- Snowflake Data Warehouse Loading
- Power BI Dashboards

The Sensor Simulator serves as the primary data source for the entire Smart Tourism & Crowd Management Platform.
