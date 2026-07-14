# -*- coding: utf-8 -*-
"""
historical_loader.py
Spirit of Ankh — Historical Data Snowflake Loader

Loads 3 years of historical CSV data into
TOURISM_DB.BRONZE.HISTORICAL_DATA

Usage:
    py historical_loader.py              ← loads all 3 years
    py historical_loader.py --year 2023  ← loads one year only
"""

import os
import sys
import pandas as pd
import snowflake.connector
from dotenv import load_dotenv

load_dotenv()

# ==========================================================
# CONFIG
# ==========================================================

SF_USER      = os.getenv("SF_USER")
SF_PASSWORD  = os.getenv("SF_PASSWORD")
SF_ACCOUNT   = os.getenv("SF_ACCOUNT")
SF_WAREHOUSE = os.getenv("SF_WAREHOUSE", "TOURISM_WH")
SF_DATABASE  = os.getenv("SF_DATABASE",  "TOURISM_DB")
SF_SCHEMA    = "BRONZE"
SF_TABLE     = "HISTORICAL_DATA"

HISTORICAL_DIR = "output/historical"
YEARS          = [2023, 2024, 2025]


# ==========================================================
# VALIDATE CONFIG
# ==========================================================

def validate_config():

    missing = []

    if not SF_USER:     missing.append("SF_USER")
    if not SF_PASSWORD: missing.append("SF_PASSWORD")
    if not SF_ACCOUNT:  missing.append("SF_ACCOUNT")

    if missing:
        raise ValueError(
            f"Missing Snowflake credentials in .env: "
            f"{', '.join(missing)}"
        )


# ==========================================================
# CONNECT TO SNOWFLAKE
# ==========================================================

def connect():

    print("Connecting to Snowflake...")

    conn = snowflake.connector.connect(
        user=SF_USER,
        password=SF_PASSWORD,
        account=SF_ACCOUNT,
        warehouse=SF_WAREHOUSE,
        database=SF_DATABASE,
        schema=SF_SCHEMA
    )

    print(f"Connected! ✅")
    print(f"  Account  : {SF_ACCOUNT}")
    print(f"  Database : {SF_DATABASE}")
    print(f"  Schema   : {SF_SCHEMA}")
    print(f"  Table    : {SF_TABLE}")

    return conn


# ==========================================================
# LOAD ONE YEAR
# ==========================================================

def load_year(
    cursor,
    year: int
) -> int:

    csv_path = os.path.join(
        HISTORICAL_DIR,
        f"historical_{year}.csv"
    )

    if not os.path.exists(csv_path):
        print(f"  ⚠️ File not found: {csv_path} — skipping")
        return 0

    df = pd.read_csv(csv_path)
    abs_path = os.path.abspath(csv_path)

    print(f"\n  Loading {year}...")
    print(f"  File     : {csv_path}")
    print(f"  Rows     : {len(df):,}")

    # Create stage
    stage_name = f"HIST_STAGE_{year}"

    cursor.execute(
        f"CREATE OR REPLACE STAGE "
        f"{SF_DATABASE}.{SF_SCHEMA}.{stage_name}"
    )

    # Upload file
    cursor.execute(
        f"PUT file://{abs_path} "
        f"@{SF_DATABASE}.{SF_SCHEMA}.{stage_name} "
        f"AUTO_COMPRESS=FALSE OVERWRITE=TRUE"
    )

    # Load into table
    cursor.execute(f"""
        COPY INTO {SF_DATABASE}.{SF_SCHEMA}.{SF_TABLE}
        FROM @{SF_DATABASE}.{SF_SCHEMA}.{stage_name}
        FILE_FORMAT = (
            TYPE                           = 'CSV'
            FIELD_OPTIONALLY_ENCLOSED_BY   = '"'
            SKIP_HEADER                    = 1
            NULL_IF                        = ('', 'NULL', 'None', 'nan')
            EMPTY_FIELD_AS_NULL            = TRUE
            DATE_FORMAT                    = 'AUTO'
            TIMESTAMP_FORMAT               = 'AUTO'
            ERROR_ON_COLUMN_COUNT_MISMATCH = FALSE
        )
        ON_ERROR = 'CONTINUE'
        FORCE = TRUE;
    """)

    print(f"  ✅ {year} loaded successfully!")

    return len(df)


# ==========================================================
# MAIN
# ==========================================================

def load_historical(years=None):

    if years is None:
        years = YEARS

    validate_config()

    conn   = connect()
    cursor = conn.cursor()

    print("\n" + "=" * 45)

    total_rows = 0

    for year in years:
        rows = load_year(cursor, year)
        total_rows += rows

    print("\n" + "=" * 45)
    print(f"✅ All done!")
    print(f"   Total rows loaded : {total_rows:,}")
    print(f"   Table             : {SF_DATABASE}.{SF_SCHEMA}.{SF_TABLE}")
    print("=" * 45)
    print("\nVerify in Snowflake:")
    print(f"  SELECT COUNT(*) FROM {SF_DATABASE}.{SF_SCHEMA}.{SF_TABLE};")

    cursor.close()
    conn.close()


# ==========================================================
# RUN
# ==========================================================

if __name__ == "__main__":

    # Check if specific year passed as argument
    # Usage: py historical_loader.py --year 2023
    if "--year" in sys.argv:
        idx  = sys.argv.index("--year")
        year = int(sys.argv[idx + 1])
        load_historical(years=[year])
    else:
        load_historical()
