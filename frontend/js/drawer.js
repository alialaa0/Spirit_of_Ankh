// =============================================================================
// Spirit of Ankh — js/drawer.js
// -----------------------------------------------------------------------------
// PURPOSE: Slide-out detail drawer panel shown when a map marker or
//          attraction card is clicked.
//
//          Shows: attraction photo, name, crowd status, live visitor count,
//                 occupancy bar, weather widget, ML forecast chart,
//                 facilities checklist, and nearby attractions.
//
//          Also handles live in-place DOM updates (updateDrawerLiveValues)
//          so the drawer refreshes without re-rendering the whole panel.
//
// DEPENDS: state.js (reads/writes currentSelectedAttractionId,
//                    drawerForecastChartInstance, map)
//          data/attractions.data.js (reads attractionsData)
//          predictions.js (calls initDrawerForecastChart)
//          attractions.js (calls closeAttractionsTab)
// =============================================================================

// ── Open Detail Drawer ────────────────────────────────────────────────────────
// Renders the full detail panel for the attraction with the given ID and
// flies the Leaflet map to centre the marker in the remaining left viewport.
window.openDetails = function(id) {
  currentSelectedAttractionId = id;
  const attraction = attractionsData.find(a => a.id === id);
  if (!attraction) return;

  // Auto-close the attractions list tab when opening a detail view
  closeAttractionsTab();

  const drawer    = document.getElementById("detail-drawer");
  const container = document.getElementById("detail-drawer-content");

  // ── Crowd status calculation ───────────────────────────────────────────────
  const occupancy = (attraction.currentVisitors / attraction.capacity) * 100;
  let crowdStatus = "Normal";
  let statusClass = "normal";
  if (occupancy > 85) { crowdStatus = "Overcrowded"; statusClass = "overcrowded"; }
  else if (occupancy > 60) { crowdStatus = "Busy"; statusClass = "busy"; }

  // ── Facility item HTML helper ─────────────────────────────────────────────
  const getFacilityHTML = (key, label) => {
    const isSupported = attraction.facilities[key];
    const status = isSupported ? "supported" : "not-supported";
    return `
      <div class="facility-item ${status}">
        <svg viewBox="0 0 24 24">
          ${isSupported
            ? `<path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>`  // ✓
            : `<path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>`} // ✗
        </svg>
        <span>${label}</span>
      </div>
    `;
  };

  // ── Nearby attractions HTML ────────────────────────────────────────────────
  const nearbyHTML = attraction.nearby.map(nearbyName => {
    const nearObj = attractionsData.find(a => a.name === nearbyName);
    if (!nearObj) return "";
    return `
      <div class="nearby-card" onclick="openDetails('${nearObj.id}')" style="padding: 12px 15px;">
        <div class="nearby-card-info">
          <span class="nearby-card-name">${nearObj.name}</span>
          <span class="nearby-card-meta">${nearObj.city} • ${nearObj.category}</span>
        </div>
      </div>
    `;
  }).join("");

  // ── Render drawer HTML ─────────────────────────────────────────────────────
  container.innerHTML = `
    <div class="info-drawer-header">
      <button class="close-drawer-btn" onclick="closeDetails()">
        <svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
      </button>
    </div>

    <!-- Attraction Photo -->
    <img class="info-drawer-image"
         src="${attraction.image}"
         style="width: calc(100% - 30px); height: 200px; object-fit: cover;
                border-radius: 12px; margin: 15px 15px 0 15px;
                border: 1px solid var(--glass-border); flex-shrink: 0;"
         alt="${attraction.name}">

    <!-- Body -->
    <div class="info-body" style="padding-top: 10px;">
      <div class="info-title-row">
        <h2>${attraction.name}</h2>
        <span class="info-loc">${attraction.city}, ${attraction.governorate}</span>
      </div>

      <div class="info-tags">
        <span class="info-tag">${attraction.category}</span>
        <span class="info-tag crowd-status-pill ${statusClass}" id="drawer-crowd-status-pill">${crowdStatus}</span>
      </div>

      <p class="info-desc">${attraction.description}</p>

      <!-- Live Telemetry Card -->
      <div class="live-metrics-box">
        <div class="metric-item">
          <span class="metric-label">Live Active Visitors</span>
          <span class="metric-val" id="drawer-live-visitors">${attraction.currentVisitors.toLocaleString()}</span>
        </div>
        <div class="metric-item">
          <span class="metric-label">Max Capacity Limit</span>
          <span class="metric-val">${attraction.capacity.toLocaleString()}</span>
        </div>
        <div class="occupancy-bar-wrapper">
          <div style="display: flex; justify-content: space-between; font-size: 0.75rem; color: var(--color-sandstone);">
            <span>Occupancy Rate</span>
            <span id="drawer-occupancy-percent">${Math.round(occupancy)}%</span>
          </div>
          <div class="occupancy-bar-bg">
            <div class="occupancy-bar-fill" id="drawer-occupancy-bar"
                 style="width: ${occupancy}%; background-color: var(--status-${statusClass});"></div>
          </div>
        </div>
      </div>

      <!-- Quick Details Grid -->
      <div class="detail-grid">
        <div class="detail-item">
          <span class="detail-label">Opening Hours</span>
          <span class="detail-val">${attraction.openingHours}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Ticket price</span>
          <span class="detail-val">${attraction.ticketPrice === 0 ? "Free Entry" : attraction.ticketPrice + " EGP"}</span>
        </div>
        <div class="detail-item" style="grid-column: span 2;">
          <span class="detail-label">Best Time to Visit</span>
          <span class="detail-val">${attraction.bestTimeToVisit}</span>
        </div>

        <!-- Live Weather Widget -->
        <div class="weather-widget" style="margin-bottom: 15px;">
          <div class="weather-header">
            <span class="detail-label" style="margin:0;">Live Climate Telemetry</span>
            <span class="weather-temp" id="drawer-weather-temp">${attraction.weather.temp}°C</span>
          </div>
          <div class="weather-details-row">
            <span>Condition: <strong id="drawer-weather-condition" style="color:#fff;">${attraction.weather.condition}</strong></span>
            <span>Humidity: <strong id="drawer-weather-humidity" style="color:#fff;">${attraction.weather.humidity}%</strong></span>
            <span>Wind: <strong id="drawer-weather-wind" style="color:#fff;">${attraction.weather.windSpeed} km/h</strong></span>
          </div>
        </div>

        <!-- Tomorrow's ML Crowd Forecast Chart -->
        <div class="forecast-section" style="margin-top: 15px; border-top: 1px solid rgba(212,175,55,0.15); padding-top: 15px;">
          <h4 style="color: var(--color-gold); font-size: 0.85rem; margin-bottom: 8px;
                     text-transform: uppercase; letter-spacing: 0.5px; font-weight:600;">
            Tomorrow's Crowd Forecast (ML)
          </h4>
          <div id="drawer-prediction-alert" style="display: none; margin-bottom: 12px; font-size: 0.8rem;
               padding: 10px; border-radius: 6px; font-weight: 600;"></div>
          <div class="forecast-chart-container"
               style="position: relative; height: 160px; width: 100%; margin-bottom: 10px;
                      background: rgba(7, 11, 25, 0.4); border-radius: 8px;
                      border: 1px solid var(--glass-border); padding: 8px;">
            <canvas id="drawer-forecast-chart"></canvas>
          </div>
        </div>
      </div>

      <!-- Facilities Checklist -->
      <div class="facilities-section">
        <h4>Visitor Amenities</h4>
        <div class="facilities-grid">
          ${getFacilityHTML("wheelchair",  "Wheelchair Access")}
          ${getFacilityHTML("parking",     "Vehicle Parking")}
          ${getFacilityHTML("restaurants", "Dining Options")}
          ${getFacilityHTML("giftShop",    "Gift Shops")}
          ${getFacilityHTML("cafes",       "Coffee & Cafés")}
          ${getFacilityHTML("restrooms",   "Public Restrooms")}
        </div>
      </div>

      <!-- Nearby Destinations -->
      <div class="nearby-section">
        <h4>Discover Nearby Attractions</h4>
        <div class="nearby-list">${nearbyHTML}</div>
      </div>
    </div>
  `;

  drawer.classList.add("active");

  // Initialise the ML forecast mini-chart inside the drawer
  setTimeout(() => { initDrawerForecastChart(id); }, 100);

  // Fly the map to centre the marker, offset by half the drawer width
  let targetLng = attraction.coordinates[1];
  if (map && window.innerWidth > 768) {
    targetLng += 0.25; // ~210px offset at zoom 10 in Egypt
  }
  map.flyTo([attraction.coordinates[0], targetLng], 10);

  // Trigger the AI Chatbot helper to check crowd levels and show suggestions
  if (typeof checkIfCrowded === "function") {
    checkIfCrowded(attraction.name);
  }
};

// ── Close Detail Drawer ───────────────────────────────────────────────────────
window.closeDetails = function() {
  currentSelectedAttractionId = null;
  const drawer = document.getElementById("detail-drawer");
  drawer.classList.remove("active");
};

// ── Live In-place Drawer Update ───────────────────────────────────────────────
// Updates only the dynamic fields (visitors, occupancy, weather) without
// re-rendering the full drawer — avoids layout jumps and chart resets.
function updateDrawerLiveValues(id) {
  const attraction = attractionsData.find(a => a.id === id);
  if (!attraction) return;

  const visitorsEl  = document.getElementById("drawer-live-visitors");
  const percentEl   = document.getElementById("drawer-occupancy-percent");
  const barEl       = document.getElementById("drawer-occupancy-bar");
  const tempEl      = document.getElementById("drawer-weather-temp");
  const condEl      = document.getElementById("drawer-weather-condition");
  const humEl       = document.getElementById("drawer-weather-humidity");
  const windEl      = document.getElementById("drawer-weather-wind");
  const statusPill  = document.getElementById("drawer-crowd-status-pill");

  const occupancy = (attraction.currentVisitors / attraction.capacity) * 100;
  let crowdStatus = "Normal";
  let statusClass = "normal";
  if (occupancy > 85) { crowdStatus = "Overcrowded"; statusClass = "overcrowded"; }
  else if (occupancy > 60) { crowdStatus = "Busy"; statusClass = "busy"; }

  if (visitorsEl) visitorsEl.textContent = attraction.currentVisitors.toLocaleString();
  if (percentEl)  percentEl.textContent  = Math.round(occupancy) + "%";
  if (tempEl)     tempEl.textContent     = attraction.weather.temp + "°C";
  if (condEl)     condEl.textContent     = attraction.weather.condition;
  if (humEl)      humEl.textContent      = attraction.weather.humidity + "%";
  if (windEl)     windEl.textContent     = attraction.weather.windSpeed + " km/h";

  if (barEl) {
    barEl.style.width           = occupancy + "%";
    barEl.style.backgroundColor = `var(--status-${statusClass})`;
  }

  if (statusPill) {
    statusPill.textContent = crowdStatus;
    statusPill.className   = `info-tag crowd-status-pill ${statusClass}`;
  }
}
