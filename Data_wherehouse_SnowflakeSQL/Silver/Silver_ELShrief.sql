-- ============================================================
-- SCRIPT 02: SILVER LAYER — COMPLETE CLEAN VERSION
-- Run this AFTER loading data into Bronze
-- Run each block separately (highlight → click ▶)
-- ============================================================

-- ============================================================
-- BLOCK 1: Setup
-- ============================================================

USE DATABASE TOURISM_DB;
USE SCHEMA SILVER;


-- ============================================================
-- BLOCK 2: Create Metadata Table
-- ============================================================

CREATE TABLE IF NOT EXISTS SILVER.META_LOAD_LOG (
    log_id          INT AUTOINCREMENT PRIMARY KEY,
    load_timestamp  TIMESTAMP DEFAULT CURRENT_TIMESTAMP(),
    table_name      STRING,
    source_layer    STRING,
    rows_loaded     INT,
    rows_rejected   INT,
    source_type     STRING,
    notes           STRING
);


-- ============================================================
-- BLOCK 3: Build STG_SENSOR_DATA
-- Cleans BRONZE.RAW_SENSOR_DATA
-- ============================================================

CREATE OR REPLACE TABLE SILVER.STG_SENSOR_DATA AS
WITH ranked AS (
    SELECT
        TRY_TO_TIMESTAMP(timestamp)             AS sensor_timestamp,
        DATE(TRY_TO_TIMESTAMP(timestamp))       AS sensor_date,
        simulation_hour                         AS hour,
        day_of_week,
        CASE WHEN is_weekend = 1
             THEN TRUE ELSE FALSE END           AS is_weekend,
        UPPER(TRIM(location_id))                AS location_id,
        INITCAP(TRIM(location_name))            AS location_name,
        INITCAP(TRIM(city))                     AS city,
        INITCAP(TRIM(location_type))            AS location_type,
        latitude,
        longitude,
        opening_hour,
        closing_hour,
        CASE WHEN is_open = 1
             THEN TRUE ELSE FALSE END           AS is_open,
        COALESCE(visitor_count, 0)              AS visitor_count,
        CASE
            WHEN crowd_density < 0 THEN 0.0
            WHEN crowd_density > 1 THEN 1.0
            ELSE COALESCE(crowd_density, 0.0)
        END                                     AS crowd_density,
        UPPER(TRIM(crowd_level))                AS crowd_level,
        COALESCE(noise_level_db, 0)             AS noise_level_db,
        satisfaction_score,
        CASE WHEN peak_flag = 1
             THEN TRUE ELSE FALSE END           AS peak_flag,
        ROUND(temperature_c, 1)                 AS temperature_c,
        COALESCE(humidity, 50)                  AS humidity,
        INITCAP(TRIM(weather_condition))        AS weather_condition,
        COALESCE(weather_factor, 1.0)           AS weather_factor,
        event_name,
        event_type,
        COALESCE(event_multiplier, 1.0)         AS event_multiplier,
        CASE WHEN holiday_overlap = 1
             THEN TRUE ELSE FALSE END           AS holiday_overlap,
        CASE WHEN school_vacation = 1
             THEN TRUE ELSE FALSE END           AS school_vacation,
        CASE WHEN tourism_season = 1
             THEN TRUE ELSE FALSE END           AS tourism_season_flag,
        resource_usage,
        _ingested_at,
        'sensor'                                AS data_source,
        CASE
            WHEN timestamp IS NULL         THEN 'missing_timestamp'
            WHEN location_id IS NULL       THEN 'missing_location'
            WHEN visitor_count < 0         THEN 'negative_visitors'
            WHEN crowd_density > 1         THEN 'density_over_100pct'
            WHEN temperature_c > 55        THEN 'extreme_temperature'
            ELSE 'ok'
        END                                     AS dq_flag,
        ROW_NUMBER() OVER (
            PARTITION BY location_id, TRY_TO_TIMESTAMP(timestamp)
            ORDER BY _ingested_at DESC
        )                                       AS row_num
    FROM TOURISM_DB.BRONZE.RAW_SENSOR_DATA
    WHERE timestamp IS NOT NULL
      AND location_id IS NOT NULL
      AND visitor_count >= 0
)
SELECT
    sensor_timestamp,
    sensor_date,
    hour,
    day_of_week,
    is_weekend,
    location_id,
    location_name,
    city,
    location_type,
    latitude,
    longitude,
    opening_hour,
    closing_hour,
    is_open,
    visitor_count,
    crowd_density,
    crowd_level,
    noise_level_db,
    satisfaction_score,
    peak_flag,
    temperature_c,
    humidity,
    weather_condition,
    weather_factor,
    event_name,
    event_type,
    event_multiplier,
    holiday_overlap,
    school_vacation,
    tourism_season_flag,
    resource_usage,
    ROUND(
        (crowd_density * 0.60)
        + ((LEAST(event_multiplier, 2.5) / 2.5) * 0.25)
        + (weather_factor * 0.15)
    , 3)                                        AS cpi,
    _ingested_at,
    data_source,
    dq_flag
FROM ranked
WHERE row_num = 1;


-- ============================================================
-- BLOCK 4: Build STG_HISTORICAL_DATA
-- Cleans BRONZE.HISTORICAL_DATA
-- ============================================================

CREATE OR REPLACE TABLE SILVER.STG_HISTORICAL_DATA AS
WITH ranked AS (
    SELECT
        timestamp                               AS sensor_timestamp,
        date                                    AS sensor_date,
        year, month, day, hour,
        day_of_week,
        is_weekend,
        UPPER(TRIM(location_id))                AS location_id,
        INITCAP(TRIM(location_name))            AS location_name,
        INITCAP(TRIM(city))                     AS city,
        INITCAP(TRIM(location_type))            AS location_type,
        latitude, longitude,
        opening_hour, closing_hour,
        popularity_tier, popularity_weight, max_capacity,
        COALESCE(visitor_count, 0)              AS visitor_count,
        CASE
            WHEN occupancy_rate < 0 THEN 0.0
            WHEN occupancy_rate > 1 THEN 1.0
            ELSE COALESCE(occupancy_rate, 0.0)
        END                                     AS occupancy_rate,
        INITCAP(TRIM(crowd_status))             AS crowd_status,
        COALESCE(cpi, 0.0)                      AS cpi,
        COALESCE(anomaly_flag, FALSE)           AS anomaly_flag,
        ROUND(temperature_c, 1)                 AS temperature_c,
        COALESCE(humidity, 50)                  AS humidity,
        INITCAP(TRIM(weather_condition))        AS weather_condition,
        COALESCE(weather_factor, 1.0)           AS weather_factor,
        is_real_weather,
        INITCAP(TRIM(tourism_season))           AS tourism_season,
        COALESCE(season_multiplier, 1.0)        AS season_multiplier,
        COALESCE(vacation_multiplier, 1.0)      AS vacation_multiplier,
        COALESCE(weekend_multiplier, 1.0)       AS weekend_multiplier,
        COALESCE(holiday_multiplier, 1.0)       AS holiday_multiplier,
        COALESCE(event_multiplier, 1.0)         AS event_multiplier,
        COALESCE(total_multiplier, 1.0)         AS total_multiplier,
        special_event, event_type,
        COALESCE(event_duration_days, 0)        AS event_duration_days,
        COALESCE(is_holiday, FALSE)             AS is_holiday,
        COALESCE(school_vacation, FALSE)        AS school_vacation,
        COALESCE(holiday_overlap, FALSE)        AS holiday_overlap,
        data_source,
        _ingested_at,
        CASE
            WHEN timestamp IS NULL             THEN 'missing_timestamp'
            WHEN location_id IS NULL           THEN 'missing_location'
            WHEN visitor_count < 0             THEN 'negative_visitors'
            WHEN occupancy_rate > 1            THEN 'occupancy_over_100pct'
            WHEN temperature_c > 55            THEN 'extreme_temperature'
            WHEN temperature_c < 0             THEN 'below_zero_temp'
            ELSE 'ok'
        END                                     AS dq_flag,
        ROW_NUMBER() OVER (
            PARTITION BY location_id, timestamp
            ORDER BY _ingested_at DESC
        )                                       AS row_num
    FROM TOURISM_DB.BRONZE.HISTORICAL_DATA
    WHERE timestamp IS NOT NULL
      AND location_id IS NOT NULL
      AND visitor_count >= 0
)
SELECT
    sensor_timestamp, sensor_date, year, month, day, hour,
    day_of_week, is_weekend, location_id, location_name,
    city, location_type, latitude, longitude,
    opening_hour, closing_hour, popularity_tier,
    popularity_weight, max_capacity, visitor_count,
    occupancy_rate, crowd_status, cpi, anomaly_flag,
    temperature_c, humidity, weather_condition,
    weather_factor, is_real_weather, tourism_season,
    season_multiplier, vacation_multiplier, weekend_multiplier,
    holiday_multiplier, event_multiplier, total_multiplier,
    special_event, event_type, event_duration_days,
    is_holiday, school_vacation, holiday_overlap,
    data_source, _ingested_at, dq_flag
FROM ranked
WHERE row_num = 1;


-- ============================================================
-- BLOCK 5: Data Quality View
-- ============================================================

CREATE OR REPLACE VIEW SILVER.VW_DATA_QUALITY_REPORT AS
SELECT
    'sensor'                                    AS source,
    dq_flag,
    COUNT(*)                                    AS row_count,
    ROUND(COUNT(*) * 100.0
        / SUM(COUNT(*)) OVER (), 2)             AS pct_of_total
FROM SILVER.STG_SENSOR_DATA
GROUP BY dq_flag
UNION ALL
SELECT
    'historical'                                AS source,
    dq_flag,
    COUNT(*)                                    AS row_count,
    ROUND(COUNT(*) * 100.0
        / SUM(COUNT(*)) OVER (), 2)             AS pct_of_total
FROM SILVER.STG_HISTORICAL_DATA
GROUP BY dq_flag
ORDER BY source, dq_flag;


-- ============================================================
-- BLOCK 6: Log to Metadata
-- ============================================================

INSERT INTO SILVER.META_LOAD_LOG
    (table_name, source_layer, rows_loaded, rows_rejected, source_type, notes)
VALUES (
    'STG_SENSOR_DATA', 'BRONZE',
    (SELECT COUNT(*) FROM SILVER.STG_SENSOR_DATA),
    0, 'sensor',
    'Silver refresh ' || CURRENT_TIMESTAMP()
);

INSERT INTO SILVER.META_LOAD_LOG
    (table_name, source_layer, rows_loaded, rows_rejected, source_type, notes)
VALUES (
    'STG_HISTORICAL_DATA', 'BRONZE',
    (SELECT COUNT(*) FROM SILVER.STG_HISTORICAL_DATA),
    0, 'historical',
    'Silver refresh ' || CURRENT_TIMESTAMP()
);


-- ============================================================
-- BLOCK 7: Verify Silver
-- ============================================================

SELECT 'STG_SENSOR_DATA' AS table_name,
       COUNT(*) AS row_count,
       SUM(CASE WHEN dq_flag != 'ok' THEN 1 ELSE 0 END) AS dq_issues
FROM SILVER.STG_SENSOR_DATA
UNION ALL
SELECT 'STG_HISTORICAL_DATA' AS table_name,
       COUNT(*) AS row_count,
       SUM(CASE WHEN dq_flag != 'ok' THEN 1 ELSE 0 END) AS dq_issues
FROM SILVER.STG_HISTORICAL_DATA;


-- ============================================================
-- BLOCK 8: Check Data Quality Report
-- ============================================================

SELECT * FROM SILVER.VW_DATA_QUALITY_REPORT;
