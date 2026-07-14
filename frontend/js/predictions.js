// =============================================================================
// Spirit of Ankh — js/predictions.js
// -----------------------------------------------------------------------------
// PURPOSE: ML crowd prediction integration.
//
//          Tries to fetch tomorrow's predictions from the live Flask API
//          (Tourism-ANKHSpirit/app.py). If the API is offline, falls back
//          to the pre-calculated offline dataset in data/predictions.data.js.
//
//          Also renders the per-attraction hourly forecast line chart
//          (Chart.js) inside the detail drawer.
//
// DEPENDS: state.js (writes predictionsData, insightsData,
//                    reads drawerForecastChartInstance)
//          data/predictions.data.js (reads offlinePredictions, offlineInsights)
//          dashboard.js (calls updateDashboardData after load)
// =============================================================================

// ── API Configuration ─────────────────────────────────────────────────────────
const API_BASE_URL = "http://127.0.0.1:5000";

// ── ID Mapping: Frontend attraction ID ↔ Database location_id ────────────────
// The ML model uses short region codes (e.g. "CAI_01"). This map translates
// between the human-readable frontend IDs and the database codes.
const locationIdMap = {
  "egyptian-museum":         "CAI_01",
  "nmec":                    "CAI_02",
  "citadel-saladin":         "CAI_03",
  "khan-el-khalili":         "CAI_04",
  "al-muizz-street":         "CAI_05",
  "cairo-tower":             "CAI_06",
  "al-azhar-park":           "CAI_07",
  "giza-pyramids":           "GIZ_01",
  "great-sphinx":            "GIZ_02",
  "grand-egyptian-museum":   "GIZ_03",
  "saqqara":                 "GIZ_04",
  "dahshur-pyramids":        "GIZ_05",
  "bibliotheca-alexandrina": "ALX_01",
  "qaitbay-citadel":         "ALX_02",
  "catacombs-kom-el-shoqafa":"ALX_03",
  "montaza-palace":          "ALX_04",
  "stanley-bridge":          "ALX_05",
  "karnak-temple":           "LUX_01",
  "luxor-temple":            "LUX_02",
  "valley-of-the-kings":     "LUX_03",
  "hatshepsut-temple":       "LUX_04",
  "valley-of-the-queens":    "LUX_05",
  "luxor-museum":            "LUX_06",
  "abu-simbel":              "ASW_01",
  "philae-temple":           "ASW_02",
  "nubian-village":          "ASW_03",
  "nubian-museum":           "ASW_04",
  "unfinished-obelisk":      "ASW_05",
  "ras-mohammed":            "SHM_01",
  "soho-square":             "SHM_02",
  "naama-bay":               "SHM_03",
  "sharks-bay":              "SHM_04",
  "old-market-sharm":        "SHM_05",
  "blue-hole":               "DAH_01",
  "dahab-lagoon":            "DAH_02",
  "lighthouse-reef":         "DAH_03",
  "three-pools":             "DAH_04",
  "giftun-island":           "HRG_01",
  "hurghada-marina":         "HRG_02",
  "mahmya-island":           "HRG_03",
  "sand-city":               "HRG_04",
  "wadi-el-hitan":           "FYM_01",
  "tunis-village":           "FYM_02",
  "lake-qarun":              "FYM_03",
  "wadi-el-rayan":           "FYM_04"
};

// Reverse map: database ID → frontend ID
const dbToFrontendMap = {};
for (const [frontId, dbId] of Object.entries(locationIdMap)) {
  dbToFrontendMap[dbId] = frontId;
}

// ── Load Predictions & Insights ───────────────────────────────────────────────
// Fetches from the live API first; falls back to offline data if unavailable.
async function loadPredictionsAndInsights() {
  console.log("Spirit of Ankh: Loading ML predictions and insights...");
  try {
    const [predRes, insRes] = await Promise.all([
      fetch(`${API_BASE_URL}/api/predictions/tomorrow`),
      fetch(`${API_BASE_URL}/api/insights/tomorrow`)
    ]);

    if (predRes.ok && insRes.ok) {
      predictionsData = mapLivePredictions(await predRes.json());
      insightsData    = mapLiveInsights(await insRes.json());
      console.log("Spirit of Ankh: Live ML predictions fetched from Snowflake API.");
    } else {
      throw new Error("API responded with an error status.");
    }
  } catch (err) {
    console.warn("Spirit of Ankh: API offline — using pre-calculated offline predictions.", err);
    predictionsData = offlinePredictions;
    insightsData    = offlineInsights;
  }

  // Refresh dashboard if predictions mode is already active
  const dashSection = document.getElementById("view-dashboard");
  if (dashSection && dashSection.classList.contains("active") && activeDashboardMode === "predictions") {
    updateDashboardData();
  }
}

// ── Data Mapping Helpers ──────────────────────────────────────────────────────
// Converts the flat API records array into an object keyed by frontend ID.
function mapLivePredictions(records) {
  const result = {};
  for (const frontId of Object.keys(locationIdMap)) result[frontId] = [];

  records.forEach(rec => {
    const frontId = dbToFrontendMap[rec.location_id];
    if (frontId) {
      result[frontId].push({ hour: rec.hour, predicted_occupancy: rec.predicted_occupancy });
    }
  });

  for (const frontId of Object.keys(result)) {
    result[frontId].sort((a, b) => a.hour - b.hour);
  }
  return result;
}

function mapLiveInsights(liveInsights) {
  const overcrowded = (liveInsights.overcrowded_afternoon || []).map(item => {
    const dbId   = item.LOCATION_ID || item.LOCATION_NAME || item.location_id || item.location_name || "";
    const frontId = dbToFrontendMap[dbId] || dbId;
    return {
      id: frontId,
      hour: item.HOUR || item.hour,
      predicted_occupancy: item.PREDICTED_OCCUPANCY || item.predicted_occupancy
    };
  }).filter(item => item.id);

  return {
    overcrowded_afternoon: overcrowded,
    best_hour_by_city: liveInsights.best_hour_by_city || {}
  };
}

// ── Drawer Forecast Chart ─────────────────────────────────────────────────────
// Renders a small hourly occupancy line chart inside the detail drawer.
// Shows a green "best time" or red "overcrowding" alert based on the forecast.
function initDrawerForecastChart(id) {
  const canvas = document.getElementById("drawer-forecast-chart");
  if (!canvas) return;

  const hourlyData = (predictionsData && predictionsData[id]) || [];
  if (hourlyData.length === 0) {
    canvas.parentElement.innerHTML =
      `<p style='font-size:0.8rem; color:var(--color-sandstone); text-align:center; padding: 20px;'>No forecast data available.</p>`;
    return;
  }

  // Filter to visiting hours 08:00–22:00
  const filteredData  = hourlyData.filter(d => d.hour >= 8 && d.hour <= 22);
  const labels        = filteredData.map(d => `${d.hour}:00`);
  const occupancies   = filteredData.map(d => Math.round(d.predicted_occupancy * 100));

  let peakHour = -1, peakOccupancy = -1, isOvercrowdedTomorrow = false;
  filteredData.forEach(d => {
    const occ = Math.round(d.predicted_occupancy * 100);
    if (occ > peakOccupancy) { peakOccupancy = occ; peakHour = d.hour; }
    if (occ > 85) isOvercrowdedTomorrow = true;
  });

  // Alert banner
  const alertContainer = document.getElementById("drawer-prediction-alert");
  if (alertContainer) {
    alertContainer.style.display = "block";
    if (isOvercrowdedTomorrow) {
      alertContainer.style.backgroundColor = "rgba(239, 68, 68, 0.15)";
      alertContainer.style.border          = "1px solid var(--status-overcrowded)";
      alertContainer.style.color           = "#ff8888";
      alertContainer.innerHTML = `⚠️ Overcrowding predicted at ${peakHour}:00 (${peakOccupancy}% occupancy). Consider visiting early morning or late evening.`;
    } else {
      let minOcc = 100, bestHr = 8;
      filteredData.forEach(d => {
        const occ = Math.round(d.predicted_occupancy * 100);
        if (occ < minOcc) { minOcc = occ; bestHr = d.hour; }
      });
      alertContainer.style.backgroundColor = "rgba(16, 185, 129, 0.15)";
      alertContainer.style.border          = "1px solid var(--status-normal)";
      alertContainer.style.color           = "#88ff88";
      alertContainer.innerHTML = `🟢 Recommended visit time: tomorrow at ${bestHr}:00 (${minOcc}% occupancy).`;
    }
  }

  // Destroy old chart instance before creating a new one
  if (drawerForecastChartInstance) drawerForecastChartInstance.destroy();

  drawerForecastChartInstance = new Chart(canvas.getContext("2d"), {
    type: "line",
    data: {
      labels,
      datasets: [{
        label: "Occupancy %",
        data: occupancies,
        borderColor:         "#D4AF37",
        borderWidth:         2,
        backgroundColor:     "rgba(212, 175, 55, 0.15)",
        fill:                true,
        tension:             0.4,
        pointBackgroundColor: occupancies.map(occ => occ > 85 ? "#EF4444" : "#D4AF37"),
        pointBorderColor:    "#070B19",
        pointRadius:         4,
        pointHoverRadius:    6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { grid: { display: false }, ticks: { color: "#E0D0C0", font: { size: 9 } } },
        y: { grid: { color: "rgba(255,255,255,0.05)" }, ticks: { color: "#E0D0C0", font: { size: 9 } }, min: 0, max: 100 }
      },
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: ctx => `Occupancy: ${ctx.raw}%` } }
      }
    }
  });
}
