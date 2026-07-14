# -*- coding: utf-8 -*-
"""
dags/sensor_pipeline.py
Spirit of Ankh - Airflow DAG (Docker version)

This runs INSIDE the Docker container.
The container needs access to your project files via a mounted volume
(we set this up in docker-compose.yaml in Step 5).

Paths here refer to where files are INSIDE Docker, not on your PC.
"""

from datetime import datetime, timedelta
from airflow import DAG
from airflow.operators.python import PythonOperator
import subprocess
import os

# ==========================================
# PATH INSIDE DOCKER CONTAINER
# This is the mounted path — set up in Step 5
# ==========================================

PROJECT_PATH = "/opt/airflow/project"


# ==========================================
# DEFAULT SETTINGS FOR ALL TASKS
# ==========================================

default_args = {
    "owner":            "abood",
    "depends_on_past":  False,
    "start_date":       datetime(2024, 1, 1),
    "retries":          1,
    "retry_delay":      timedelta(minutes=2),
    "email_on_failure": False,
}


# ==========================================
# TASK FUNCTIONS
# ==========================================

def run_sensor():
    """Task 1: Generate sensor data"""
    print("Running sensor simulator...")
    result = subprocess.run(
        ["python", "sensor_simulator.py"],
        cwd=PROJECT_PATH,
        capture_output=True,
        text=True
    )
    print(result.stdout)
    if result.returncode != 0:
        raise Exception(f"Sensor failed: {result.stderr}")
    print("Sensor done ✅")


def load_to_snowflake():
    """Task 2: Load sensor CSV to Snowflake Bronze"""
    print("Loading to Snowflake...")
    result = subprocess.run(
        ["python", "snowflake_loader.py"],
        cwd=PROJECT_PATH,
        capture_output=True,
        text=True
    )
    print(result.stdout)
    if result.returncode != 0:
        raise Exception(f"Loader failed: {result.stderr}")
    print("Snowflake load done ✅")


def check_data_quality():
    """Task 3: Quick quality check"""
    import snowflake.connector
    from dotenv import load_dotenv

    load_dotenv(f"{PROJECT_PATH}/.env")

    conn = snowflake.connector.connect(
        user=os.getenv("SF_USER"),
        password=os.getenv("SF_PASSWORD"),
        account=os.getenv("SF_ACCOUNT"),
        warehouse=os.getenv("SF_WAREHOUSE", "TOURISM_WH"),
        database=os.getenv("SF_DATABASE", "TOURISM_DB"),
        schema="BRONZE"
    )

    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) FROM BRONZE.RAW_SENSOR_DATA")
    count = cursor.fetchone()[0]
    cursor.close()
    conn.close()

    print(f"Total sensor rows in Snowflake: {count:,} ✅")

    if count == 0:
        raise Exception("No data in Snowflake! Pipeline failed.")


# ==========================================
# DEFINE THE DAG
# ==========================================

with DAG(
    dag_id="spirit_of_ankh_sensor_pipeline",
    description="Runs sensor every 10 minutes and loads to Snowflake",
    default_args=default_args,
    schedule_interval="*/10 * * * *",
    catchup=False,
    tags=["spirit_of_ankh", "sensor", "snowflake"]
) as dag:

    task_run_sensor = PythonOperator(
        task_id="run_sensor_simulator",
        python_callable=run_sensor,
    )

    task_load_snowflake = PythonOperator(
        task_id="load_to_snowflake",
        python_callable=load_to_snowflake,
    )

    task_check_quality = PythonOperator(
        task_id="check_data_quality",
        python_callable=check_data_quality,
    )

    task_run_sensor >> task_load_snowflake >> task_check_quality
