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
SELECT COUNT(*) FROM TOURISM_DB.BRONZE.RAW_SENSOR_DATA;
USE DATABASE TOURISM_DB;
USE SCHEMA BRONZE;


COPY INTO RAW_SENSOR_DATA
FROM @ANKH_STAGE/tourism_sensor_data.csv
FILE_FORMAT = (
    TYPE = 'CSV'
    FIELD_OPTIONALLY_ENCLOSED_BY = '"'
    SKIP_HEADER = 1
    NULL_IF = ('', 'NULL', 'None', 'nan')
    EMPTY_FIELD_AS_NULL = TRUE
    ERROR_ON_COLUMN_COUNT_MISMATCH = FALSE
)
ON_ERROR = 'CONTINUE';

SELECT COUNT(*) FROM RAW_SENSOR_DATA;
SELECT * FROM TABLE(INFORMATION_SCHEMA.COPY_HISTORY(
    TABLE_NAME => 'RAW_SENSOR_DATA',
    START_TIME => DATEADD(HOURS, -1, CURRENT_TIMESTAMP())
));