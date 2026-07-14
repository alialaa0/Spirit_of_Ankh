// =============================================================================
// Spirit of Ankh — js/dashboard.js
// -----------------------------------------------------------------------------
// PURPOSE: Live analytics dashboard with two modes:
//
//   "Live" mode   — Shows real-time visitor counts and occupancy from the
//                   telemetry simulator (updates every 4 seconds).
//
//   "Predictions" mode — Shows tomorrow's ML crowd forecasts: peak load,
//                        average predicted occupancy, busiest cities/categories.
//
//          Two Chart.js charts are managed here:
//            - Regional Visitors Bar Chart (by city)
//            - Category Distribution Doughnut Chart
//
//          Also renders the ML Insights panel (overcrowding warnings +
//          best-hour recommendations by city).
//
// DEPENDS: state.js (reads/writes regionalChartInstance, categoryChartInstance,
//                    activeDashboardMode, predictionsData, insightsData)
//          data/attractions.data.js (reads attractionsData)
//          router.js (switchDashboardMode is called from HTML buttons)
// =============================================================================

// ── Dashboard Initialization ──────────────────────────────────────────────────
// Creates the two Chart.js chart instances and performs the first data render.
function initDashboard() {
  const regionalCanvas = document.getElementById("chart-regional-visitors");
  const categoryCanvas = document.getElementById("chart-category-distribution");
  if (!regionalCanvas || !categoryCanvas) return;

  // Set global Chart.js defaults to match the Egyptian dark theme
  Chart.defaults.color      = "#E0D0C0";
  Chart.defaults.font.family = "'Montserrat', sans-serif";

  // ── Bar Chart: Visitors by City ──────────────────────────────────────────
  regionalChartInstance = new Chart(regionalCanvas, {
    type: "bar",
    data: {
      labels: [],
      datasets: [{
        label: "Current Visitors",
        data: [],
        backgroundColor:     "rgba(212, 175, 55, 0.75)",
        borderColor:         "#D4AF37",
        borderWidth:         1.5,
        hoverBackgroundColor: "#FFD700"
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { grid: { color: "rgba(255, 255, 255, 0.05)" } },
        y: { grid: { color: "rgba(255, 255, 255, 0.05)" }, beginAtZero: true }
      },
      plugins: { legend: { display: false } }
    }
  });

  // ── Doughnut Chart: Attraction Count by Category ──────────────────────────
  categoryChartInstance = new Chart(categoryCanvas, {
    type: "doughnut",
    data: {
      labels: [],
      datasets: [{
        data: [],
        backgroundColor: ["#D4AF37", "#10B981", "#3B82F6", "#F59E0B", "#EC4899", "#8B5CF6"],
        borderWidth: 1,
        borderColor: "#070B19"
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: "right", labels: { boxWidth: 12, padding: 12 } }
      }
    }
  });

  updateDashboardData();
}

// ── Dashboard Data Update ─────────────────────────────────────────────────────
// Recalculates all KPI cards, table rows, and chart data.
// Behaviour differs based on activeDashboardMode ('live' | 'predictions').
function updateDashboardData() {
  if (!regionalChartInstance || !categoryChartInstance) return;

  let totalVisitors    = 0;
  let activeLocations  = attractionsData.length;
  let occupancySum     = 0;
  let topDestinationName = "None";
  let highestOccupancy   = -1;

  const cityLoads      = {};
  const categoryCounts = {};
  const detailsList    = [];

  const isPredMode = (activeDashboardMode === "predictions" && predictionsData);

  if (isPredMode) {
    // ── Predictions Mode ────────────────────────────────────────────────────
    // Aggregate hourly ML predictions across all attractions to find the
    // global peak load hour and per-city/category forecasted visitor counts.

    const hourlyTotalVisitors = Array(24).fill(0);

    attractionsData.forEach(attraction => {
      const hourlyPred = predictionsData[attraction.id] || [];
      hourlyPred.forEach(pred => {
        hourlyTotalVisitors[pred.hour] += Math.round(pred.predicted_occupancy * attraction.capacity);
      });
    });

    // Find global peak hour during visiting hours (08:00–22:00)
    let globalPeakHour    = 12;
    let maxGlobalVisitors = 0;
    for (let hr = 8; hr <= 22; hr++) {
      if (hourlyTotalVisitors[hr] > maxGlobalVisitors) {
        maxGlobalVisitors = hourlyTotalVisitors[hr];
        globalPeakHour    = hr;
      }
    }

    attractionsData.forEach(attraction => {
      const hourlyPred = predictionsData[attraction.id] || [];
      let avgOccSum = 0;
      let peakOcc   = -1;
      let peakVisitors = 0;

      hourlyPred.forEach(pred => {
        avgOccSum += pred.predicted_occupancy;
        if (pred.predicted_occupancy > peakOcc) {
          peakOcc      = pred.predicted_occupancy;
          peakVisitors = Math.round(pred.predicted_occupancy * attraction.capacity);
        }
      });

      const avgOcc = (hourlyPred.length > 0) ? (avgOccSum / hourlyPred.length) * 100 : 25;

      totalVisitors += peakVisitors;
      occupancySum  += avgOcc;

      cityLoads[attraction.city]          = (cityLoads[attraction.city] || 0)          + peakVisitors;
      categoryCounts[attraction.category] = (categoryCounts[attraction.category] || 0) + peakVisitors;

      detailsList.push({ name: attraction.name, id: attraction.id, city: attraction.city, visitors: peakVisitors, occupancy: avgOcc });
    });

    const avgOccupancy = occupancySum / activeLocations;

    document.getElementById("dash-total-visitors").textContent   = totalVisitors.toLocaleString();
    document.getElementById("dash-active-locations").textContent = activeLocations;
    document.getElementById("dash-avg-occupancy").textContent    = Math.round(avgOccupancy) + "%";

    const topDestCardLabel = document.querySelector(".metric-card:nth-child(4) h4");
    if (topDestCardLabel) topDestCardLabel.textContent = "Global Peak Hour";
    document.getElementById("dash-top-destination").textContent =
      `${globalPeakHour % 12 || 12}:00 ${globalPeakHour >= 12 ? "PM" : "AM"}`;

    const topDestSubtext = document.querySelector(".metric-card:nth-child(4) .sub-val");
    if (topDestSubtext) topDestSubtext.textContent = "Forecasted peak load window";

    const totalVisitorsLabel = document.querySelector(".metric-card:nth-child(1) h4");
    if (totalVisitorsLabel) totalVisitorsLabel.textContent = "Forecasted Max Visitors";
    const avgOccLabel = document.querySelector(".metric-card:nth-child(3) h4");
    if (avgOccLabel) avgOccLabel.textContent = "Avg. Occupancy (Tomorrow)";

  } else {
    // ── Live Mode ───────────────────────────────────────────────────────────
    // Uses real-time visitor counts from the telemetry simulator.
    attractionsData.forEach(attraction => {
      const occ = (attraction.currentVisitors / attraction.capacity) * 100;
      totalVisitors += attraction.currentVisitors;
      occupancySum  += occ;

      if (occ > highestOccupancy) {
        highestOccupancy   = occ;
        topDestinationName = attraction.name;
      }

      cityLoads[attraction.city]          = (cityLoads[attraction.city] || 0) + attraction.currentVisitors;
      categoryCounts[attraction.category] = (categoryCounts[attraction.category] || 0) + 1;

      detailsList.push({ name: attraction.name, id: attraction.id, city: attraction.city, visitors: attraction.currentVisitors, occupancy: occ });
    });

    const avgOccupancy = occupancySum / activeLocations;

    document.getElementById("dash-total-visitors").textContent   = totalVisitors.toLocaleString();
    document.getElementById("dash-active-locations").textContent = activeLocations;
    document.getElementById("dash-avg-occupancy").textContent    = Math.round(avgOccupancy) + "%";

    const topDestCardLabel = document.querySelector(".metric-card:nth-child(4) h4");
    if (topDestCardLabel) topDestCardLabel.textContent = "Top Destination";
    document.getElementById("dash-top-destination").textContent = topDestinationName;

    const topDestSubtext = document.querySelector(".metric-card:nth-child(4) .sub-val");
    if (topDestSubtext) topDestSubtext.textContent = "Highest concurrent occupancy";

    const totalVisitorsLabel = document.querySelector(".metric-card:nth-child(1) h4");
    if (totalVisitorsLabel) totalVisitorsLabel.textContent = "Visitors Today";
    const avgOccLabel = document.querySelector(".metric-card:nth-child(3) h4");
    if (avgOccLabel) avgOccLabel.textContent = "Avg. Occupancy";
  }

  // ── Busy / Peaceful Table Rows ────────────────────────────────────────────
  const busyList     = [...detailsList].sort((a, b) => b.occupancy - a.occupancy).slice(0, 5);
  const peacefulList = [...detailsList].sort((a, b) => a.occupancy - b.occupancy).slice(0, 5);

  const getOccupancyClass = occ => occ > 85 ? "high" : occ > 60 ? "medium" : "low";
  const getOccupancyLabel = occ => occ > 85 ? "Overcrowded" : occ > 60 ? "Busy" : "Normal";

  const renderTableRows = (list, containerId) => {
    const tbody = document.getElementById(containerId);
    if (!tbody) return;
    tbody.innerHTML = list.map(item => `
      <tr style="cursor: pointer;" onclick="navigateToAttraction('${item.id}')">
        <td style="font-weight:600; color:#fff;">${item.name}</td>
        <td>${item.city}</td>
        <td>${item.visitors.toLocaleString()}</td>
        <td><span class="occupancy-badge ${getOccupancyClass(item.occupancy)}">${Math.round(item.occupancy)}% (${getOccupancyLabel(item.occupancy)})</span></td>
      </tr>
    `).join("");
  };

  renderTableRows(busyList,     "dash-busy-table-body");
  renderTableRows(peacefulList, "dash-peaceful-table-body");

  // ── Update Charts ─────────────────────────────────────────────────────────
  regionalChartInstance.data.labels                  = Object.keys(cityLoads);
  regionalChartInstance.data.datasets[0].data        = Object.values(cityLoads);
  regionalChartInstance.update();

  categoryChartInstance.data.labels           = Object.keys(categoryCounts);
  categoryChartInstance.data.datasets[0].data = Object.values(categoryCounts);
  categoryChartInstance.update();
}

// ── Dashboard Mode Switch ─────────────────────────────────────────────────────
// Toggles between 'live' and 'predictions' tabs and refreshes dashboard.
window.switchDashboardMode = function(mode) {
  activeDashboardMode = mode;

  const liveTab      = document.getElementById("tab-live-mode");
  const predTab      = document.getElementById("tab-predictions-mode");
  const insightsPanel = document.getElementById("predictions-insights-panel");

  const activateTab   = el => { if (el) { el.classList.add("active");    el.style.background = "var(--color-gold)";       el.style.color = "var(--color-sky-dark)"; el.style.fontWeight = "700"; } };
  const deactivateTab = el => { if (el) { el.classList.remove("active"); el.style.background = "transparent";             el.style.color = "var(--color-sandstone)"; el.style.fontWeight = "600"; } };

  if (mode === "live") {
    activateTab(liveTab);
    deactivateTab(predTab);
    if (insightsPanel) insightsPanel.style.display = "none";
  } else {
    activateTab(predTab);
    deactivateTab(liveTab);
    if (insightsPanel) insightsPanel.style.display = "block";
    renderMLInsightsPanel();
  }

  updateDashboardData();
};

// ── ML Insights Panel ─────────────────────────────────────────────────────────
// Renders the overcrowding warning list and best-hour-by-city grid.
function renderMLInsightsPanel() {
  const overcrowdedContainer = document.getElementById("insight-overcrowded-list");
  const bestHoursContainer   = document.getElementById("insight-best-hours-grid");
  if (!insightsData || !overcrowdedContainer || !bestHoursContainer) return;

  // Overcrowding list
  const overcrowded = insightsData.overcrowded_afternoon || [];
  if (overcrowded.length === 0) {
    overcrowdedContainer.innerHTML =
      `<p style="font-size: 0.85rem; color: var(--color-sandstone); padding: 10px;">🟢 No afternoon overcrowding predicted tomorrow!</p>`;
  } else {
    const grouped = {};
    overcrowded.forEach(item => {
      const name = attractionsData.find(a => a.id === item.id)?.name || item.id;
      if (!grouped[name]) grouped[name] = [];
      if (!grouped[name].includes(item.hour)) grouped[name].push(item.hour);
    });

    overcrowdedContainer.innerHTML = Object.entries(grouped).map(([name, hours]) => `
      <div class="insight-item"
           style="display: flex; justify-content: space-between; align-items: center;
                  border-bottom: 1px solid rgba(255,255,255,0.03); padding-bottom: 6px; font-size: 0.85rem;">
        <span style="color:#fff; font-weight:600;">${name}</span>
        <span style="color:var(--status-overcrowded); font-weight:600; font-size:0.75rem;
                     background:rgba(239, 68, 68, 0.1); padding: 2px 6px; border-radius: 4px;">
          Overcrowded: ${hours.map(h => `${h}:00`).join(", ")}
        </span>
      </div>
    `).join("");
  }

  // Best-hour-by-city grid
  const bestHours = insightsData.best_hour_by_city || {};
  if (Object.keys(bestHours).length === 0) {
    bestHoursContainer.innerHTML =
      `<p style="font-size: 0.85rem; color: var(--color-sandstone); padding: 10px;">No recommendations available.</p>`;
  } else {
    bestHoursContainer.innerHTML = Object.entries(bestHours).map(([city, hour]) => {
      const timeStr = `${hour % 12 || 12}:00 ${hour >= 12 ? "PM" : "AM"}`;
      return `
        <div class="best-hour-card"
             style="background: rgba(16, 185, 129, 0.05); border: 1px solid rgba(16, 185, 129, 0.15);
                    border-radius: 6px; padding: 10px; text-align: center;">
          <div style="font-size: 0.75rem; color: var(--color-sandstone); text-transform: uppercase; font-weight:600; margin-bottom: 2px;">${city}</div>
          <div style="font-size: 0.9rem; color: var(--color-gold); font-weight:700;">${timeStr}</div>
        </div>
      `;
    }).join("");
  }
}
