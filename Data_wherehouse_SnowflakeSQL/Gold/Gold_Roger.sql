TOURISM_DB.GOLDTOURISM_DB.GOLD.DIM_DATETOURISM_DB.GOLD.DIM_DATETOURISM_DB.GOLD.DIM_DATE-- ============================================================
-- SCRIPT 03: GOLD LAYER — COMPLETE CLEAN VERSION
-- Run AFTER Silver layer is complete
-- Run each block separately (highlight → click ▶)
-- ============================================================

-- ============================================================
-- BLOCK 1: Setup
-- ============================================================

USE DATABASE TOURISM_DB;
USE SCHEMA GOLD;


-- ============================================================
-- BLOCK 2: DIM_LOCATION
-- One row per location — master reference table
-- ============================================================

CREATE OR REPLACE TABLE GOLD.DIM_LOCATION AS
SELECT DISTINCT
    location_id,
    location_name,
    city,
    location_type,
    latitude,
    longitude,
    opening_hour,
    closing_hour,
    popularity_tier,
    popularity_weight,
    max_capacity,
    ROUND(max_capacity * 0.85)              AS safe_capacity,
    CASE
        WHEN opening_hour = 0 AND closing_hour = 23 THEN 24
        ELSE closing_hour - opening_hour
    END                                     AS daily_operating_hours,
    CASE city
        WHEN 'Cairo'           THEN 'Greater Cairo'
        WHEN 'Giza'            THEN 'Greater Cairo'
        WHEN 'Alexandria'      THEN 'North Coast'
        WHEN 'Luxor'           THEN 'Upper Egypt'
        WHEN 'Aswan'           THEN 'Upper Egypt'
        WHEN 'Hurghada'        THEN 'Red Sea'
        WHEN 'Sharm El Sheikh' THEN 'Red Sea'
        WHEN 'Dahab'           THEN 'Red Sea'
        WHEN 'Fayoum'          THEN 'Oasis'
        ELSE 'Other'
    END                                     AS region
FROM TOURISM_DB.SILVER.STG_HISTORICAL_DATA
WHERE location_id IS NOT NULL
ORDER BY city, location_name;


-- ============================================================
-- BLOCK 3: DIM_DATE
-- Full calendar 2023-2025 with Egypt-specific flags
-- ============================================================

CREATE OR REPLACE TABLE GOLD.DIM_DATE AS
WITH date_spine AS (
    SELECT DATEADD(DAY, SEQ4(), '2023-01-01') AS date_value
    FROM TABLE(GENERATOR(ROWCOUNT => 1096))
)
SELECT
    date_value                                          AS date,
    YEAR(date_value)                                    AS year,
    MONTH(date_value)                                   AS month,
    DAY(date_value)                                     AS day,
    QUARTER(date_value)                                 AS quarter,
    DAYNAME(date_value)                                 AS day_name,
    WEEKOFYEAR(date_value)                              AS week_of_year,
    CASE WHEN DAYOFWEEK(date_value) IN (6, 7)
         THEN TRUE ELSE FALSE END                       AS is_weekend,
    CASE MONTH(date_value)
        WHEN 1 THEN 'January'   WHEN 2 THEN 'February'
        WHEN 3 THEN 'March'     WHEN 4 THEN 'April'
        WHEN 5 THEN 'May'       WHEN 6 THEN 'June'
        WHEN 7 THEN 'July'      WHEN 8 THEN 'August'
        WHEN 9 THEN 'September' WHEN 10 THEN 'October'
        WHEN 11 THEN 'November' WHEN 12 THEN 'December'
    END                                                 AS month_name,
    CASE MONTH(date_value)
        WHEN 1 THEN 'Q1' WHEN 2 THEN 'Q1' WHEN 3 THEN 'Q1'
        WHEN 4 THEN 'Q2' WHEN 5 THEN 'Q2' WHEN 6 THEN 'Q2'
        WHEN 7 THEN 'Q3' WHEN 8 THEN 'Q3' WHEN 9 THEN 'Q3'
        ELSE 'Q4'
    END                                                 AS quarter_name,
    CASE
        WHEN MONTH(date_value) IN (12,1,2) THEN 'Winter'
        WHEN MONTH(date_value) IN (3,4,5)  THEN 'Spring'
        WHEN MONTH(date_value) IN (6,7,8)  THEN 'Summer'
        ELSE 'Autumn'
    END                                                 AS calendar_season,
    CASE
        WHEN MONTH(date_value) IN (6,7,8) THEN 'Summer Vacation'
        WHEN MONTH(date_value) = 1        THEN 'Midyear Vacation'
        ELSE 'School Days'
    END                                                 AS school_period,
    CASE
        WHEN date_value BETWEEN '2023-03-23' AND '2023-04-21' THEN 'Ramadan 2023'
        WHEN date_value BETWEEN '2023-04-22' AND '2023-04-24' THEN 'Eid Al Fitr 2023'
        WHEN date_value BETWEEN '2023-06-28' AND '2023-07-01' THEN 'Eid Al Adha 2023'
        WHEN date_value BETWEEN '2024-03-11' AND '2024-04-09' THEN 'Ramadan 2024'
        WHEN date_value BETWEEN '2024-04-10' AND '2024-04-12' THEN 'Eid Al Fitr 2024'
        WHEN date_value BETWEEN '2024-06-16' AND '2024-06-19' THEN 'Eid Al Adha 2024'
        WHEN date_value BETWEEN '2025-03-01' AND '2025-03-30' THEN 'Ramadan 2025'
        WHEN date_value BETWEEN '2025-03-31' AND '2025-04-02' THEN 'Eid Al Fitr 2025'
        WHEN date_value BETWEEN '2025-06-06' AND '2025-06-09' THEN 'Eid Al Adha 2025'
        ELSE NULL
    END                                                 AS islamic_holiday,
    CASE
        WHEN date_value BETWEEN '2023-03-23' AND '2023-07-01' THEN TRUE
        WHEN date_value BETWEEN '2024-03-11' AND '2024-06-19' THEN TRUE
        WHEN date_value BETWEEN '2025-03-01' AND '2025-06-09' THEN TRUE
        ELSE FALSE
    END                                                 AS is_islamic_holiday
FROM date_spine
ORDER BY date_value;


-- ============================================================
-- BLOCK 4: FCT_CROWD_UNIFIED
-- Joins sensor + historical into one fact table
-- ============================================================

CREATE OR REPLACE TABLE GOLD.FCT_CROWD_UNIFIED AS

-- Historical data
SELECT
    sensor_timestamp                        AS timestamp,
    sensor_date                             AS date,
    hour,
    location_id,
    city,
    visitor_count,
    occupancy_rate,
    crowd_status,
    cpi,
    anomaly_flag,
    temperature_c,
    humidity,
    weather_condition,
    weather_factor,
    tourism_season,
    total_multiplier,
    special_event,
    event_type,
    is_holiday,
    school_vacation,
    is_weekend,
    dq_flag,
    'historical'                            AS source_type,
    CASE
        WHEN cpi >= 0.80 THEN 'Critical'
        WHEN cpi >= 0.60 THEN 'High'
        WHEN cpi >= 0.40 THEN 'Moderate'
        ELSE 'Low'
    END                                     AS cpi_label
FROM TOURISM_DB.SILVER.STG_HISTORICAL_DATA

UNION ALL

-- Sensor data
SELECT
    sensor_timestamp                        AS timestamp,
    sensor_date                             AS date,
    hour,
    location_id,
    city,
    visitor_count,
    crowd_density                           AS occupancy_rate,
    crowd_level                             AS crowd_status,
    cpi,
    CASE WHEN peak_flag = TRUE
         THEN TRUE ELSE FALSE END           AS anomaly_flag,
    temperature_c,
    humidity,
    weather_condition,
    weather_factor,
    NULL                                    AS tourism_season,
    COALESCE(event_multiplier, 1.0)         AS total_multiplier,
    event_name                              AS special_event,
    event_type,
    FALSE                                   AS is_holiday,
    school_vacation,
    is_weekend,
    dq_flag,
    'sensor'                                AS source_type,
    CASE
        WHEN cpi >= 0.80 THEN 'Critical'
        WHEN cpi >= 0.60 THEN 'High'
        WHEN cpi >= 0.40 THEN 'Moderate'
        ELSE 'Low'
    END                                     AS cpi_label
FROM TOURISM_DB.SILVER.STG_SENSOR_DATA;


-- ============================================================
-- BLOCK 5: FCT_CROWD_SUMMARY
-- Daily aggregated KPIs — faster for Power BI
-- ============================================================

CREATE OR REPLACE TABLE GOLD.FCT_CROWD_SUMMARY AS
SELECT
    date,
    location_id,
    city,
    source_type,
    SUM(visitor_count)                      AS total_visitors,
    AVG(visitor_count)                      AS avg_hourly_visitors,
    MAX(visitor_count)                      AS peak_visitors,
    MIN(visitor_count)                      AS min_visitors,
    AVG(occupancy_rate)                     AS avg_occupancy,
    MAX(occupancy_rate)                     AS max_occupancy,
    AVG(cpi)                                AS avg_cpi,
    MAX(cpi)                                AS max_cpi,
    SUM(CASE WHEN anomaly_flag = TRUE
             THEN 1 ELSE 0 END)             AS anomaly_hours,
    COUNT(*)                                AS total_hours,
    ROUND(
        SUM(CASE WHEN anomaly_flag = TRUE
                 THEN 1 ELSE 0 END)
        * 100.0 / NULLIF(COUNT(*), 0), 2
    )                                       AS anomaly_rate_pct,
    AVG(temperature_c)                      AS avg_temperature,
    MAX(temperature_c)                      AS max_temperature,
    AVG(humidity)                           AS avg_humidity,
    MAX(weather_condition)                  AS dominant_weather,
    MAX(total_multiplier)                   AS max_multiplier,
    MAX(special_event)                      AS event_of_day,
    MAX(CASE WHEN is_holiday = TRUE
             THEN 1 ELSE 0 END)             AS is_holiday_day,
    MAX(CASE WHEN is_weekend = TRUE
             THEN 1 ELSE 0 END)             AS is_weekend_day,
    MAX(CASE WHEN school_vacation = TRUE
             THEN 1 ELSE 0 END)             AS is_school_vacation,
    SUM(CASE WHEN dq_flag != 'ok'
             THEN 1 ELSE 0 END)             AS dq_issue_hours
FROM GOLD.FCT_CROWD_UNIFIED
GROUP BY date, location_id, city, source_type;


-- ============================================================
-- BLOCK 6: Log to Metadata
-- ============================================================

INSERT INTO SILVER.META_LOAD_LOG
    (table_name, source_layer, rows_loaded, rows_rejected, source_type, notes)
VALUES (
    'FCT_CROWD_UNIFIED', 'SILVER',
    (SELECT COUNT(*) FROM GOLD.FCT_CROWD_UNIFIED),
    0, 'both',
    'Gold refresh ' || CURRENT_TIMESTAMP()
);

INSERT INTO SILVER.META_LOAD_LOG
    (table_name, source_layer, rows_loaded, rows_rejected, source_type, notes)
VALUES (
    'FCT_CROWD_SUMMARY', 'GOLD',
    (SELECT COUNT(*) FROM GOLD.FCT_CROWD_SUMMARY),
    0, 'both',
    'Gold refresh ' || CURRENT_TIMESTAMP()
);


-- ============================================================
-- BLOCK 7: Verify Gold Tables
-- ============================================================

SELECT 'DIM_LOCATION'      AS table_name, COUNT(*) AS row_count FROM GOLD.DIM_LOCATION
UNION ALL
SELECT 'DIM_DATE'          AS table_name, COUNT(*) AS row_count FROM GOLD.DIM_DATE
UNION ALL
SELECT 'FCT_CROWD_UNIFIED' AS table_name, COUNT(*) AS row_count FROM GOLD.FCT_CROWD_UNIFIED
UNION ALL
SELECT 'FCT_CROWD_SUMMARY' AS table_name, COUNT(*) AS row_count FROM GOLD.FCT_CROWD_SUMMARY;


-- ============================================================
-- BLOCK 8: Verify Sensor + Historical Split
-- ============================================================

SELECT source_type,
       COUNT(*)                                         AS total_rows,
       SUM(CASE WHEN cpi IS NULL THEN 1 ELSE 0 END)    AS null_cpi_count,
       MIN(date)                                        AS earliest_date,
       MAX(date)                                        AS latest_date
FROM GOLD.FCT_CROWD_UNIFIED
GROUP BY source_type;
