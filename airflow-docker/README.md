# airflow-docker/

Automates the sensor pipeline to run every 10 minutes without manual
intervention. Uses Docker because Apache Airflow requires `fcntl`, a
POSIX-only module unavailable on native Windows.

---

## Files

| File | Purpose |
|---|---|
| `docker-compose.yaml` | official Airflow compose file, modified to mount the real project folder |
| `Dockerfile` | extends Airflow image with project Python dependencies |
| `requirements.txt` | dependencies installed into the Airflow image |
| `.env` | only `AIRFLOW_UID=50000` — separate from the project's real `.env` |
| `dags/sensor_pipeline.py` | the DAG definition |

---

## The DAG

```
run_sensor_simulator
        |
        v
load_to_snowflake
        |
        v
check_data_quality
        |
        v
run_ml_predictions
```

Schedule: `*/10 * * * *` (every 10 minutes)

---

## Required setup

1. Install Docker Desktop, enable WSL2 when prompted, restart PC
2. Mount your real project folder in `docker-compose.yaml`:
   ```yaml
   volumes:
     - C:/Users/YOUR_USER/Desktop/spirit_of_ankh:/opt/airflow/project
   ```
3. Make sure `spirit_of_ankh/sensor/.env` exists with real credentials
   — Docker reads it through the mounted volume

---

## How to run

```bash
docker-compose up airflow-init    # once, downloads + initializes
docker-compose up -d              # starts everything in background
```

Open `http://localhost:8080` (login: `airflow` / `airflow`), find
`spirit_of_ankh_sensor_pipeline`, toggle it ON.

```bash
docker-compose down                # stop everything
docker ps                          # check what's running
docker-compose logs                # see logs if something fails
```

---

## What must stay open

| What | Required? |
|---|---|
| PC powered on | Yes |
| Docker Desktop app | Yes (can be minimized) |
| VS Code | No |
| Terminal | No |
| Browser | No — only needed to check status |

`docker-compose up -d` runs detached — it keeps running in the
background even after closing VS Code and the terminal.

---

## Common errors

| Error | Fix |
|---|---|
| Docker Desktop not running | Open the app first |
| Port 8080 already in use | Close other apps using it, or change port in yaml |
| `ModuleNotFoundError: snowflake` | Confirm Dockerfile + requirements.txt are set up |
| `No such file sensor_simulator.py` | Check the volume mount path in docker-compose.yaml |
| Containers won't start | `docker-compose down` then `docker-compose up -d` again |
