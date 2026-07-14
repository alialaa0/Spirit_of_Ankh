# 🏛️ Spirit of Ankh
### Smart Tourism Management System with Real-Time AI Insights

![Egypt Tourism](frontend/images/hero_egypt.png)

---

## 📖 Overview

**Spirit of Ankh** is an intelligent, real-time tourism management dashboard for Egypt. It combines interactive maps, AI-driven crowd predictions, live attraction data, and a rich media gallery — all within a stunning Egyptian-themed web interface.

Built to help tourists plan smarter visits and help operators manage crowd flow across **45 of Egypt's greatest attractions**.

---

## ✨ Features

- 🗺️ **Interactive Map** — Leaflet.js-powered map with all 45 Egyptian attractions as clickable markers
- 🔍 **Smart Search** — Real-time autocomplete search bar with map zoom-to-location
- 🏛️ **Attractions Panel** — Filter by category (Historical, Museum, Beach, Desert, Park, Religious)
- 📊 **AI Crowd Predictions** — ML-based visitor forecasting with Chart.js visualizations
- 🌡️ **Live Sensor Data** — Simulated real-time weather and occupancy data per attraction
- 🖼️ **Photo Gallery** — High-quality photo galleries for each attraction
- 🏷️ **Detailed Info Cards** — Ticket prices, opening hours, facilities, ratings & more
- 📱 **Responsive Design** — Works on desktop and mobile
- 🌙 **Egyptian Dark Theme** — Premium gold-and-dark UI inspired by ancient Egypt

---

## 📁 Project Structure

```
Spirit_of_Ankh/
│
├── frontend/                   # 🌐 Web Application
│   ├── index.html              # Main HTML entry point
│   ├── styles.css              # All styling (Egyptian dark theme)
│   ├── app.js                  # Main application logic & map interactions
│   ├── data.js                 # All 45 attractions data (coordinates, info, etc.)
│   ├── predictions_data.js     # AI crowd prediction datasets
│   ├── db_predictions.json     # Prediction model output database
│   ├── egypt_governorates.json # Egypt governorate boundary GeoJSON
│   └── images/                 # Attraction photos (55+ images)
│
├── Tourism-ANKHSpirit/         # 🤖 AI / ML Backend
│   ├── app.py                  # Flask prediction API server
│   ├── sample.ipynb            # Model training notebook
│   ├── saved_model.pkl         # Trained ML model
│   ├── encoders.pkl            # Feature encoders
│   ├── requirements.txt        # Python dependencies
│   └── README.md               # Backend documentation
│
├── sensor_simulator/           # 📡 IoT Sensor Simulation
│   ├── src/                    # Simulator source code
│   ├── data/                   # Simulated sensor output data
│   ├── docs/                   # Simulator documentation
│   ├── output/                 # Generated reports
│   ├── tourism_sensor_data.csv # Sample sensor readings
│   ├── requirements.txt        # Python dependencies
│   └── README.md               # Simulator documentation
│
├── historical_data_generator/  # 📈 Data Generation Tools
│   └── src/                    # Generator source code
│
├── data/                       # 📂 Shared Data Assets
│   ├── core_locations.csv      # Core attraction location data
│   ├── collected_data/         # Raw collected datasets
│   └── historical_data_generated/ # Generated historical datasets
│
├── docs/                       # 📚 Project Documentation
│   ├── 01_project_planning.md
│   ├── 02_literature_review.md
│   ├── 03_requirements.md
│   ├── 04_system_design.md
│   └── data_dictionary.md
│
├── .gitignore                  # Git ignore rules
└── README.md                   # ← You are here
```

---

## 🚀 Quick Start

### Run the Frontend (No Installation Required)

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/Spirit_of_Ankh.git
cd Spirit_of_Ankh

# Start a local web server
python -m http.server 8080 --directory frontend

# Open in browser
# → http://127.0.0.1:8080
```

### Run the AI Backend (Optional)

```bash
cd Tourism-ANKHSpirit
pip install -r requirements.txt
python app.py
```

### Run the Sensor Simulator (Optional)

```bash
cd sensor_simulator
pip install -r requirements.txt
python src/main.py
```

---

## 🗺️ The 45 Attractions

The system covers attractions across **8 regions of Egypt**:

| Region | Attractions |
|---|---|
| 🏙️ Cairo | Egyptian Museum, NMEC, Citadel of Saladin, Khan El Khalili, Al Muizz Street, Cairo Tower, Al Azhar Park |
| 🔺 Giza | Pyramids of Giza, Great Sphinx, Grand Egyptian Museum, Saqqara, Dahshur Pyramids |
| 🌊 Alexandria | Bibliotheca Alexandrina, Qaitbay Citadel, Catacombs of Kom El Shoqafa, Montaza Palace, Stanley Bridge |
| 🏛️ Luxor | Karnak Temple, Luxor Temple, Valley of the Kings, Hatshepsut Temple, Valley of the Queens, Luxor Museum |
| ⛵ Aswan | Abu Simbel, Philae Temple, Nubian Village, Nubian Museum, Unfinished Obelisk |
| 🤿 Sharm El Sheikh | Ras Mohammed, SOHO Square, Naama Bay, Sharks Bay, Old Market |
| 🌊 Dahab | Blue Hole, Dahab Lagoon, Lighthouse Reef, Three Pools |
| 🏖️ Hurghada | Giftun Island, Hurghada Marina, Mahmya Island, Sand City |
| 🌿 Fayoum | Wadi El Hitan, Tunis Village, Lake Qarun, Wadi El Rayan |
| 🏔️ Sinai | Saint Catherine Monastery |
| 🌾 Western Desert | White Desert, Siwa Oasis |

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| Frontend | HTML5, CSS3 (Vanilla), JavaScript (ES6+) |
| Map | Leaflet.js + OpenStreetMap |
| Charts | Chart.js |
| AI/ML Backend | Python, Flask, Scikit-learn |
| Sensor Simulation | Python |
| Data | GeoJSON, CSV, JSON |

---

## 📸 Screenshots

> Open the website and explore 45 Egyptian attractions with real photos, live data, and AI predictions.

---

## 👥 Team

**Spirit of Ankh** — Smart Tourism Management System

---

## 📄 License

This project is for educational purposes. All attraction photos are sourced from Wikimedia Commons under open licenses.
