# snowflake/

All SQL scripts and Python loaders that build and populate the
Spirit of Ankh data warehouse.

---

## Architecture

```
TOURISM_DB
├── BRONZE
│   ├── RAW_SENSOR_DATA      real-time sensor readings
│   └── HISTORICAL_DATA      3 years of historical data
│
├── SILVER
│   ├── STG_SENSOR_DATA      cleaned + deduplicated + CPI calculated
│   ├── STG_HISTORICAL_DATA  cleaned + deduplicated + validated
│   ├── META_LOAD_LOG        load tracking
│   └── VW_DATA_QUALITY_REPORT
│
└── GOLD
    ├── DIM_LOCATION                45 locations, region, safe_capacity
    ├── DIM_DATE                    full calendar 2023-2025 + Islamic holidays
    ├── FCT_CROWD_UNIFIED           sensor + historical joined
    ├── FCT_CROWD_SUMMARY           daily aggregated KPIs
    ├── LOCATION_QUALITY_SCORE      hidden gems scoring
    ├── ML_PREDICTIONS_NEXT_HOUR    ML output
    ├── ML_PREDICTIONS_TOMORROW     ML output
    └── 9 views (see below)
```

---

## Files

| File | Purpose |
|---|---|
| `snowflake_loader.py` | loads sensor CSV into `BRONZE.RAW_SENSOR_DATA` |
| `historical_loader.py` | loads historical CSVs into `BRONZE.HISTORICAL_DATA` (`--year 2023/2024/2025`) |
| `01_bronze_setup.sql` | warehouse, database, 3 schemas, 2 raw tables |
| `02_silver_layer.sql` | clean, deduplicate, validate, calculate sensor CPI |
| `03_gold_layer.sql` | dimensions, fact tables, sensor+historical join |
| `04_gold_views.sql` | 7 Power BI views |
| `05_verify_everything.sql` | 13-block QA checklist |
| `06_hidden_gems.sql` | quality score table + 2 hidden gems views |
| `07_ui_ready_views.sql` | map/detail/hourly-pattern views for any future app |
| `08_ml_tables.sql` | ML prediction tables + dashboard view |

---

## Run order

```
1. 01_bronze_setup.sql          (Snowflake)
2. python snowflake_loader.py
   python historical_loader.py --year 2023
   python historical_loader.py --year 2024
   python historical_loader.py --year 2025
3. 02_silver_layer.sql          (Snowflake)
4. 03_gold_layer.sql            (Snowflake)
5. 04_gold_views.sql            (Snowflake)
6. 05_verify_everything.sql     (Snowflake, QA)
7. 06_hidden_gems.sql           (Snowflake)
8. 07_ui_ready_views.sql        (Snowflake)
9. 08_ml_tables.sql             (Snowflake, before running ml/)
```

Run multi-statement scripts as one block in Snowflake Worksheets unless
noted otherwise inside the file.

---

## The 7 Gold views (04_gold_views.sql)

| View | Purpose |
|---|---|
| `VW_DATA_FRESHNESS` | last refresh time per table |
| `VW_CURRENT_STATUS` | live crowd status per location |
| `VW_ACTIVE_ALERTS` | only overcrowded/anomalous locations, with severity |
| `VW_MONTHLY_TREND` | 3-year monthly trends, MoM change |
| `VW_LOCATION_PERFORMANCE` | full KPI scorecard + city/overall rank |
| `VW_WEATHER_IMPACT` | weather effect on visitor numbers |
| `VW_HOLIDAY_IMPACT` | holiday/event effect on crowds |

## Hidden Gems views (06_hidden_gems.sql)

| View/Table | Purpose |
|---|---|
| `LOCATION_QUALITY_SCORE` | quality_score = (avg_visitors/capacity) / avg_occupancy |
| `VW_HIDDEN_GEMS_NOW` | real-time: suggests quiet alternative to a crowded location |
| `VW_HIDDEN_GEMS_HISTORICAL` | best-kept-secret locations ranked per city |

## UI-ready views (07_ui_ready_views.sql)

| View | Purpose |
|---|---|
| `VW_MAP_LIVE` | one row per location — coordinates, pin color, gem suggestion |
| `VW_LOCATION_DETAIL` | full detail card for one location |
| `VW_HOURLY_PATTERN` | best/worst hour to visit per location |

---

## PK / FK reference

| Table | Primary Key | Foreign Keys |
|---|---|---|
| `BRONZE.RAW_SENSOR_DATA` | `_ingested_at + location_id` | none |
| `BRONZE.HISTORICAL_DATA` | `location_id + timestamp` | none |
| `SILVER.STG_SENSOR_DATA` | `location_id + sensor_timestamp` | none |
| `SILVER.STG_HISTORICAL_DATA` | `location_id + sensor_timestamp` | none |
| `SILVER.META_LOAD_LOG` | `log_id` (autoincrement) | none |
| `GOLD.DIM_LOCATION` | `location_id` | none |
| `GOLD.DIM_DATE` | `date` | none |
| `GOLD.FCT_CROWD_UNIFIED` | `location_id + timestamp + source_type` | `location_id → DIM_LOCATION`, `date → DIM_DATE` |
| `GOLD.FCT_CROWD_SUMMARY` | `location_id + date + source_type` | `location_id → DIM_LOCATION`, `date → DIM_DATE` |
| `GOLD.LOCATION_QUALITY_SCORE` | `location_id` | `location_id → DIM_LOCATION` |

Snowflake does not enforce these physically — relationships exist
through JOINs in views and fact tables.

---

## Account

```
Cloud      : AWS
Region     : EU Frankfurt
Edition    : Enterprise
Account    : ITCOYES-GF39385
Warehouse  : TOURISM_WH (X-Small, auto-suspend 60s)
```
