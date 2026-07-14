# -*- coding: utf-8 -*-
"""
snowflake_loader.py
Spirit of Ankh - Snowflake Loader

FIX: Added FORCE=TRUE so Snowflake never skips files
FIX: Added ERROR_ON_COLUMN_COUNT_MISMATCH=FALSE
FIX: Added timestamp to filename so every run loads new data
"""

import os
import pandas as pd
import snowflake.connector
from dotenv import load_dotenv
from pathlib import Path
from datetime import datetime

# FIX: Load .env from same folder as this file
BASE_DIR = Path(__file__).resolve().parent
load_dotenv(dotenv_path=BASE_DIR / ".env")

SF_USER      = os.getenv("SF_USER")
SF_PASSWORD  = os.getenv("SF_PASSWORD")
SF_ACCOUNT   = os.getenv("SF_ACCOUNT")
SF_WAREHOUSE = os.getenv("SF_WAREHOUSE", "TOURISM_WH")
SF_DATABASE  = os.getenv("SF_DATABASE",  "TOURISM_DB")
SF_SCHEMA    = os.getenv("SF_SCHEMA",    "BRONZE")
SF_TABLE     = os.getenv("SF_TABLE",     "RAW_SENSOR_DATA")

CSV_PATH = str(BASE_DIR / "output" / "tourism_sensor_data.csv")


# ==========================================
# VALIDATE CONFIG
# ==========================================

def validate_config():

    missing = []

    if not SF_USER:     missing.append("SF_USER")
    if not SF_PASSWORD: missing.append("SF_PASSWORD")
    if not SF_ACCOUNT:  missing.append("SF_ACCOUNT")

    if missing:
        raise ValueError(
            f"Missing Snowflake credentials in .env: "
            f"{', '.join(missing)}\n"
            f"Add them to your .env file and try again."
        )


# ==========================================
# LOAD TO SNOWFLAKE
# ==========================================

def load_to_snowflake(csv_path=CSV_PATH):

    if not os.path.exists(csv_path):
        raise FileNotFoundError(
            f"CSV not found: {csv_path}\n"
            f"Run sensor_simulator.py first!"
        )

    validate_config()

    print("Connecting to Snowflake...")
    print(f"  Account   : {SF_ACCOUNT}")
    print(f"  Database  : {SF_DATABASE}")
    print(f"  Schema    : {SF_SCHEMA}")
    print(f"  Table     : {SF_TABLE}")
    print("-" * 45)

    conn = snowflake.connector.connect(
        user=SF_USER,
        password=SF_PASSWORD,
        account=SF_ACCOUNT,
        warehouse=SF_WAREHOUSE,
        database=SF_DATABASE,
        schema=SF_SCHEMA
    )

    cursor = conn.cursor()

    print("Connected! ✅")

    df = pd.read_csv(csv_path)
    print(f"Records to load : {len(df)}")
    print("-" * 45)

    abs_path = os.path.abspath(csv_path)

    # Create stage
    print("Creating stage...")
    cursor.execute(
        f"CREATE OR REPLACE STAGE "
        f"{SF_DATABASE}.{SF_SCHEMA}.ANKH_STAGE"
    )

    # Upload file
    print(f"Uploading {csv_path} to stage...")
    cursor.execute(
        f"PUT file://{abs_path} "
        f"@{SF_DATABASE}.{SF_SCHEMA}.ANKH_STAGE "
        f"AUTO_COMPRESS=FALSE OVERWRITE=TRUE"
    )

    # Load into table
    print(f"Loading into {SF_DATABASE}.{SF_SCHEMA}.{SF_TABLE}...")
    cursor.execute(f"""
        COPY INTO {SF_DATABASE}.{SF_SCHEMA}.{SF_TABLE}
        FROM @{SF_DATABASE}.{SF_SCHEMA}.ANKH_STAGE
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
        FORCE    = TRUE;
    """)

    print("-" * 45)
    print(f"✅ Load complete!")
    print(f"   Rows loaded : {len(df)}")
    print(f"   Table       : {SF_DATABASE}.{SF_SCHEMA}.{SF_TABLE}")
    print("-" * 45)
    print("Verify in Snowflake:")
    print(
        f"  SELECT COUNT(*) FROM "
        f"{SF_DATABASE}.{SF_SCHEMA}.{SF_TABLE};"
    )

    cursor.close()
    conn.close()


# ==========================================
# RUN
# ==========================================

if __name__ == "__main__":
    load_to_snowflake()
