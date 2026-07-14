CREATE WAREHOUSE IF NOT EXISTS TOURISM_WH
    WAREHOUSE_SIZE = 'X-SMALL'
    AUTO_SUSPEND = 60
    AUTO_RESUME = TRUE;

CREATE DATABASE IF NOT EXISTS TOURISM_DB;

CREATE SCHEMA IF NOT EXISTS TOURISM_DB.BRONZE;
CREATE SCHEMA IF NOT EXISTS TOURISM_DB.SILVER;
CREATE SCHEMA IF NOT EXISTS TOURISM_DB.GOLD;
USE DATABASE TOURISM_DB;
USE SCHEMA BRONZE;

CREATE OR REPLACE TABLE RAW_SENSOR_DATA (
    timestamp               STRING,
    simulation_hour         INT,
    day_of_week             STRING,
    is_weekend              INT,
    location_id             STRING,
    location_name           STRING,
    city                    STRING,
    location_type           STRING,
    latitude                FLOAT,
    longitude               FLOAT,
    is_open                 INT,
    opening_hour            INT,
    closing_hour            INT,
    visitor_count           INT,
    crowd_density           FLOAT,
    crowd_level             STRING,
    temperature_c           FLOAT,
    humidity                FLOAT,
    weather_condition       STRING,
    weather_factor          FLOAT,
    event_name              STRING,
    event_type              STRING,
    event_multiplier        FLOAT,
    holiday_overlap         INT,
    school_vacation         INT,
    tourism_season          INT,
    resource_usage          STRING,
    noise_level_db          FLOAT,
    satisfaction_score      FLOAT,
    peak_flag               INT,
    _ingested_at            TIMESTAMP DEFAULT CURRENT_TIMESTAMP()
);
SELECT COUNT(*) FROM TOURISM_DB.BRONZE.HISTORICAL_DATA;