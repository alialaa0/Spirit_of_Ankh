# Crowd Prediction ML Module — Spirit of Ankh Tourism Guide

Predicts tourist location occupancy (crowd %) per location/hour, used to power website insights like overcrowded times and best times to visit.

## Data
Snowflake `TOURISM_DB.GOLD`: `FCT_CROWD_UNIFIED` (time-series occupancy), joined with `DIM_LOCATION`, `DIM_DATE`, `LOCATION_QUALITY_SCORE`. Historical data covers 2023–2025 (simulated).

## Model
- Random Forest Regressor, target = `OCCUPANCY_RATE`
- **R² ≈ 0.88, MAE ≈ 0.067**
- Features: hour (sin/cos), weekend, school period, season, location, city, location type, popularity tier, max capacity
- **Excluded:** `CPI` and averaged occupancy stats — these leaked the target

## Files
| File | Purpose |
|---|---|
| `sample.ipynb` | Training + prediction pipeline |
| `saved_model.pkl` / `encoders.pkl` | Saved model + encoders (no retraining needed each run) |
| `simulation_state.json` | Tracks simulated "current date" so predictions shift on each rerun |
| `app.py` | Flask API serving predictions |

## "Tomorrow" logic
Data doesn't extend to real-world today, so "tomorrow" = one day past the data's last date, advancing by one day on each rerun (tracked in `simulation_state.json`). Delete that file to reset.

## Retraining
Only needed if the historical dataset itself changes (e.g. new year added). Day-to-day reruns just reload the saved model and predict on new inputs.

## Running it
1. Run `sample.ipynb` top to bottom → generates predictions, pushes to `GOLD.TOMORROW_PREDICTIONS` (overwrites each time)
2. Run `python app.py` → serves them locally at `http://127.0.0.1:5000`

## API endpoints
- `GET /api/predictions/tomorrow` — raw predictions per location/hour
- `GET /api/insights/tomorrow` — summarized: overcrowded locations (1–3PM), best hour per city

## Known limitations
- Static snapshot — nothing auto-regenerates predictions
- API is local-only (`127.0.0.1`) — needs real hosting to be reachable by the live site
- No live weather/event data
- Credentials in `app.py` are hardcoded — move to env variables before sharing/deploying
