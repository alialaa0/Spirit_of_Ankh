-- ============================================================
-- SCRIPT 04: GOLD VIEWS — COMPLETE CLEAN VERSION
-- Run AFTER Gold layer tables are created
-- Run as ONE block (highlight all → click ▶)
-- ============================================================

USE DATABASE TOURISM_DB;
USE SCHEMA GOLD;


-- ============================================================
-- VIEW 0: VW_DATA_FRESHNESS
-- Shows when data was last refreshed
-- ============================================================

CREATE OR REPLACE VIEW GOLD.VW_DATA_FRESHNESS AS
SELECT
    table_name,
    source_type,
    MAX(load_timestamp)                     AS last_refreshed,
    DATEDIFF('minute',
        MAX(load_timestamp),
        CURRENT_TIMESTAMP()
    )                                       AS minutes_ago,
    SUM(rows_loaded)                        AS total_rows_loaded
FROM SILVER.META_LOAD_LOG
GROUP BY table_name, source_type
ORDER BY last_refreshed DESC;


-- ============================================================
-- VIEW 1: VW_CURRENT_STATUS
-- Live crowd status per location
-- ============================================================

CREATE OR REPLACE VIEW GOLD.VW_CURRENT_STATUS AS
SELECT
    f.timestamp,
    f.date,
    f.hour,
    f.location_id,
    l.location_name,
    f.city,
    l.region,
    l.location_type,
    l.latitude,
    l.longitude,
    l.max_capacity,
    l.safe_capacity,
    l.popularity_tier,
    f.visitor_count,
    f.occupancy_rate,
    ROUND(f.occupancy_rate * 100, 1)        AS occupancy_pct,
    f.crowd_status,
    f.cpi,
    f.cpi_label,
    f.temperature_c,
    f.humidity,
    f.weather_condition,
    f.special_event,
    f.is_holiday,
    f.is_weekend,
    f.anomaly_flag,
    GREATEST(f.visitor_count - l.safe_capacity, 0) AS visitors_over_safe,
    CASE f.crowd_status
        WHEN 'Overcrowded' THEN 'RED - Overcrowded'
        WHEN 'Busy'        THEN 'YELLOW - Busy'
        WHEN 'Moderate'    THEN 'GREEN - Moderate'
        WHEN 'Low'         THEN 'WHITE - Low'
        ELSE f.crowd_status
    END                                     AS status_label,
    CASE
        WHEN f.anomaly_flag = TRUE
         AND f.crowd_status = 'Overcrowded'
             THEN 'CRITICAL: Overcrowding + Anomaly!'
        WHEN f.crowd_status = 'Overcrowded'
             THEN 'WARNING: Overcrowded - action needed'
        WHEN f.anomaly_flag = TRUE
             THEN 'WARNING: Unusual crowd spike detected'
        ELSE NULL
    END                                     AS alert_message,
    DATEDIFF('minute', f.timestamp, CURRENT_TIMESTAMP()) AS minutes_since_reading
FROM GOLD.FCT_CROWD_UNIFIED f
JOIN GOLD.DIM_LOCATION l ON f.location_id = l.location_id
WHERE f.source_type = 'sensor'
ORDER BY f.timestamp DESC;


-- ============================================================
-- VIEW 2: VW_ACTIVE_ALERTS
-- Only overcrowded or anomalous locations
-- ============================================================

CREATE OR REPLACE VIEW GOLD.VW_ACTIVE_ALERTS AS
SELECT
    f.timestamp,
    l.location_name,
    f.city,
    l.region,
    l.location_type,
    l.max_capacity,
    l.safe_capacity,
    l.popularity_tier,
    f.visitor_count,
    f.occupancy_rate,
    ROUND(f.occupancy_rate * 100, 1)        AS occupancy_pct,
    f.crowd_status,
    f.cpi,
    f.temperature_c,
    f.weather_condition,
    f.special_event,
    f.anomaly_flag,
    CASE
        WHEN f.occupancy_rate >= 0.99 THEN 'CRITICAL'
        WHEN f.occupancy_rate >= 0.90 THEN 'HIGH'
        WHEN f.occupancy_rate >= 0.85 THEN 'MEDIUM'
        ELSE 'LOW'
    END                                     AS severity,
    CASE
        WHEN f.occupancy_rate >= 0.99 THEN 4
        WHEN f.occupancy_rate >= 0.90 THEN 3
        WHEN f.occupancy_rate >= 0.85 THEN 2
        ELSE 1
    END                                     AS severity_score,
    GREATEST(f.visitor_count - l.safe_capacity, 0) AS visitors_over_safe,
    CASE
        WHEN f.occupancy_rate >= 0.99 THEN 'Close entry immediately'
        WHEN f.occupancy_rate >= 0.90 THEN 'Restrict new entries'
        WHEN f.occupancy_rate >= 0.85 THEN 'Monitor closely'
        ELSE 'Continue monitoring'
    END                                     AS recommended_action
FROM GOLD.FCT_CROWD_UNIFIED f
JOIN GOLD.DIM_LOCATION l ON f.location_id = l.location_id
WHERE f.source_type = 'sensor'
  AND (f.crowd_status = 'Overcrowded' OR f.anomaly_flag = TRUE)
ORDER BY severity_score DESC, f.occupancy_rate DESC;


-- ============================================================
-- VIEW 3: VW_MONTHLY_TREND
-- Monthly visitor trends over 3 years
-- ============================================================

CREATE OR REPLACE VIEW GOLD.VW_MONTHLY_TREND AS
SELECT
    d.year,
    d.month,
    d.month_name,
    d.quarter_name,
    d.calendar_season,
    f.city,
    l.region,
    f.location_id,
    l.location_name,
    l.location_type,
    l.popularity_tier,
    SUM(f.total_visitors)                   AS monthly_visitors,
    AVG(f.avg_occupancy)                    AS avg_occupancy,
    MAX(f.max_occupancy)                    AS peak_occupancy,
    AVG(f.avg_cpi)                          AS avg_cpi,
    SUM(f.anomaly_hours)                    AS total_anomaly_hours,
    ROUND(AVG(f.anomaly_rate_pct), 2)       AS avg_anomaly_rate_pct,
    AVG(f.avg_temperature)                  AS avg_temperature,
    SUM(f.is_holiday_day)                   AS holiday_days,
    SUM(f.is_weekend_day)                   AS weekend_days,
    SUM(f.is_school_vacation)               AS vacation_days,
    MAX(f.peak_visitors)                    AS month_peak_visitors,
    LAG(SUM(f.total_visitors)) OVER (
        PARTITION BY f.location_id
        ORDER BY d.year, d.month
    )                                       AS prev_month_visitors,
    ROUND(
        (SUM(f.total_visitors)
        - LAG(SUM(f.total_visitors)) OVER (
            PARTITION BY f.location_id
            ORDER BY d.year, d.month
          )
        ) * 100.0
        / NULLIF(LAG(SUM(f.total_visitors)) OVER (
            PARTITION BY f.location_id
            ORDER BY d.year, d.month
          ), 0)
    , 1)                                    AS mom_change_pct
FROM GOLD.FCT_CROWD_SUMMARY f
JOIN GOLD.DIM_DATE d     ON f.date = d.date
JOIN GOLD.DIM_LOCATION l ON f.location_id = l.location_id
WHERE f.source_type = 'historical'
GROUP BY
    d.year, d.month, d.month_name, d.quarter_name,
    d.calendar_season, f.city, l.region,
    f.location_id, l.location_name,
    l.location_type, l.popularity_tier
ORDER BY d.year, d.month, f.city;


-- ============================================================
-- VIEW 4: VW_LOCATION_PERFORMANCE
-- Full KPI scorecard per location
-- ============================================================

CREATE OR REPLACE VIEW GOLD.VW_LOCATION_PERFORMANCE AS
SELECT
    f.location_id,
    l.location_name,
    f.city,
    l.region,
    l.location_type,
    l.popularity_tier,
    l.max_capacity,
    l.safe_capacity,
    l.daily_operating_hours,
    SUM(f.total_visitors)                   AS total_visitors_3yr,
    AVG(f.avg_hourly_visitors)              AS avg_hourly_visitors,
    MAX(f.peak_visitors)                    AS all_time_peak,
    ROUND(AVG(f.avg_occupancy) * 100, 1)    AS avg_occupancy_pct,
    ROUND(MAX(f.max_occupancy) * 100, 1)    AS max_occupancy_pct,
    ROUND(AVG(f.avg_cpi), 3)               AS avg_cpi,
    ROUND(MAX(f.max_cpi), 3)               AS max_cpi,
    SUM(f.anomaly_hours)                    AS total_anomaly_hours,
    ROUND(
        SUM(f.anomaly_hours) * 100.0
        / NULLIF(SUM(f.total_hours), 0), 2
    )                                       AS anomaly_rate_pct,
    ROUND(
        SUM(CASE WHEN f.avg_occupancy >= 0.85
                 THEN 1 ELSE 0 END)
        * 100.0 / NULLIF(COUNT(*), 0), 1
    )                                       AS pct_days_overcrowded,
    ROUND(
        AVG(CASE WHEN f.is_holiday_day = 1
                 THEN f.avg_occupancy END)
        / NULLIF(AVG(CASE WHEN f.is_holiday_day = 0
                          THEN f.avg_occupancy END), 0)
        * 100 - 100, 1
    )                                       AS holiday_uplift_pct,
    RANK() OVER (
        PARTITION BY f.city
        ORDER BY SUM(f.total_visitors) DESC
    )                                       AS city_rank,
    RANK() OVER (
        ORDER BY SUM(f.total_visitors) DESC
    )                                       AS overall_rank
FROM GOLD.FCT_CROWD_SUMMARY f
JOIN GOLD.DIM_LOCATION l ON f.location_id = l.location_id
WHERE f.source_type = 'historical'
GROUP BY
    f.location_id, l.location_name, f.city, l.region,
    l.location_type, l.popularity_tier,
    l.max_capacity, l.safe_capacity, l.daily_operating_hours
ORDER BY total_visitors_3yr DESC;


-- ============================================================
-- VIEW 5: VW_WEATHER_IMPACT
-- How weather affects visitor numbers
-- ============================================================

CREATE OR REPLACE VIEW GOLD.VW_WEATHER_IMPACT AS
SELECT
    f.city,
    l.region,
    f.dominant_weather                      AS weather_condition,
    CASE
        WHEN f.avg_temperature <= 15 THEN 'Cold (15C or less)'
        WHEN f.avg_temperature <= 25 THEN 'Mild (16-25C)'
        WHEN f.avg_temperature <= 35 THEN 'Warm (26-35C)'
        WHEN f.avg_temperature <= 42 THEN 'Hot (36-42C)'
        ELSE 'Extreme (above 42C)'
    END                                     AS temp_range,
    COUNT(*)                                AS total_days,
    ROUND(AVG(f.total_visitors), 0)         AS avg_daily_visitors,
    ROUND(AVG(f.avg_occupancy) * 100, 1)    AS avg_occupancy_pct,
    ROUND(AVG(f.avg_temperature), 1)        AS avg_temp,
    ROUND(AVG(f.avg_humidity), 1)           AS avg_humidity,
    ROUND(AVG(f.avg_cpi), 3)               AS avg_cpi,
    SUM(f.anomaly_hours)                    AS total_anomalies,
    ROUND(
        AVG(f.avg_occupancy)
        / NULLIF(AVG(AVG(f.avg_occupancy))
                 OVER (PARTITION BY f.city), 0)
        * 100 - 100, 1
    )                                       AS impact_vs_avg_pct
FROM GOLD.FCT_CROWD_SUMMARY f
JOIN GOLD.DIM_LOCATION l ON f.location_id = l.location_id
WHERE f.source_type = 'historical'
GROUP BY f.city, l.region, f.dominant_weather,
    CASE
        WHEN f.avg_temperature <= 15 THEN 'Cold (15C or less)'
        WHEN f.avg_temperature <= 25 THEN 'Mild (16-25C)'
        WHEN f.avg_temperature <= 35 THEN 'Warm (26-35C)'
        WHEN f.avg_temperature <= 42 THEN 'Hot (36-42C)'
        ELSE 'Extreme (above 42C)'
    END
ORDER BY f.city, avg_daily_visitors DESC;


-- ============================================================
-- VIEW 6: VW_HOLIDAY_IMPACT
-- How holidays and events affect crowds
-- ============================================================

CREATE OR REPLACE VIEW GOLD.VW_HOLIDAY_IMPACT AS
WITH base AS (
    SELECT
        COALESCE(f.event_of_day, 'Regular Day') AS event_name,
        f.city,
        l.region,
        f.date,
        f.total_visitors,
        f.avg_occupancy,
        f.avg_cpi,
        f.peak_visitors,
        f.anomaly_hours,
        f.is_holiday_day,
        f.is_weekend_day
    FROM GOLD.FCT_CROWD_SUMMARY f
    JOIN GOLD.DIM_LOCATION l ON f.location_id = l.location_id
    WHERE f.source_type = 'historical'
)
SELECT
    event_name,
    city,
    region,
    CASE
        WHEN MAX(is_holiday_day) = 1
         AND MAX(is_weekend_day) = 1 THEN 'Holiday Weekend'
        WHEN MAX(is_holiday_day) = 1  THEN 'Holiday'
        WHEN MAX(is_weekend_day) = 1  THEN 'Weekend'
        ELSE 'Regular Weekday'
    END                                     AS day_type,
    COUNT(DISTINCT date)                    AS total_days,
    ROUND(AVG(total_visitors), 0)           AS avg_daily_visitors,
    ROUND(AVG(avg_occupancy) * 100, 1)      AS avg_occupancy_pct,
    MAX(peak_visitors)                      AS peak_visitors,
    ROUND(AVG(avg_cpi), 3)                 AS avg_cpi,
    SUM(anomaly_hours)                      AS total_anomalies,
    ROUND(
        (AVG(avg_occupancy)
        / NULLIF(AVG(AVG(avg_occupancy))
                 OVER (PARTITION BY city), 0)
        - 1) * 100, 1
    )                                       AS occupancy_uplift_pct
FROM base
GROUP BY event_name, city, region
ORDER BY avg_daily_visitors DESC;


-- ============================================================
-- VERIFY ALL 7 VIEWS
-- ============================================================

SELECT 'VW_DATA_FRESHNESS'       AS view_name, COUNT(*) AS row_count FROM GOLD.VW_DATA_FRESHNESS
UNION ALL
SELECT 'VW_CURRENT_STATUS'       AS view_name, COUNT(*) AS row_count FROM GOLD.VW_CURRENT_STATUS
UNION ALL
SELECT 'VW_ACTIVE_ALERTS'        AS view_name, COUNT(*) AS row_count FROM GOLD.VW_ACTIVE_ALERTS
UNION ALL
SELECT 'VW_MONTHLY_TREND'        AS view_name, COUNT(*) AS row_count FROM GOLD.VW_MONTHLY_TREND
UNION ALL
SELECT 'VW_LOCATION_PERFORMANCE' AS view_name, COUNT(*) AS row_count FROM GOLD.VW_LOCATION_PERFORMANCE
UNION ALL
SELECT 'VW_WEATHER_IMPACT'       AS view_name, COUNT(*) AS row_count FROM GOLD.VW_WEATHER_IMPACT
UNION ALL
SELECT 'VW_HOLIDAY_IMPACT'       AS view_name, COUNT(*) AS row_count FROM GOLD.VW_HOLIDAY_IMPACT;