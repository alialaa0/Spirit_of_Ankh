// Spirit of Ankh - Core Application Logic



// --- Global Application State ---
let map;
let markerLayerGroup; // Kept for legacy compatibility (unused with MapLibre)
const markerMap = new Map(); // Map to store markers by attraction ID
let currentSelectedAttractionId = null;

// Chart.js instances (stored globally to allow updates)
let regionalChartInstance = null;
let categoryChartInstance = null;
let drawerForecastChartInstance = null; // Store tomorrow's forecast chart instance

// ML predictions & insights state
let predictionsData = null;
let insightsData = null;
let activeDashboardMode = 'live'; // 'live' or 'predictions'

// --- Initialize App ---
document.addEventListener("DOMContentLoaded", () => {
  initNavbarScroll();
  initRouting();
  initFeaturedGrid();
  initCitiesDropdown();
  initMap();
  initDashboard();

  // Load predictions and insights (live fetch with static fallback)
  loadPredictionsAndInsights();

  // Search input listeners for suggestions
  const searchInput = document.getElementById("map-search-input");
  if (searchInput) {
    searchInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        const suggestionsContainer = document.getElementById("search-suggestions");
        const firstSuggestion = suggestionsContainer?.querySelector(".suggestion-item");
        if (firstSuggestion) {
          firstSuggestion.click();
        }
      }
    });

    // Close suggestions dropdown when clicking outside
    document.addEventListener("click", (e) => {
      if (!e.target.closest(".search-box")) {
        const suggestionsContainer = document.getElementById("search-suggestions");
        if (suggestionsContainer) {
          suggestionsContainer.style.display = "none";
        }
      }
    });
  }

  // Start the telemetry simulation loop (ticks every 4 seconds)
  setInterval(simulateTelemetryTick, 4000);

  // Fetch real-time weather from Open-Meteo API on load
  fetchRealWeatherForAttractions();
  // Keep weather updated from real API every 5 minutes
  setInterval(fetchRealWeatherForAttractions, 300000);
});

// --- Nav Scrolling Effect ---
function initNavbarScroll() {
  const header = document.getElementById("header");
  window.addEventListener("scroll", () => {
    if (window.scrollY > 50) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }
  });
}

// --- Single Page Routing ---
function initRouting() {
  // Check hash or path if applicable, but default SPA tab switching is used
  window.switchView = function(viewId) {
    // Update active nav link
    document.querySelectorAll(".nav-menu .nav-item").forEach(item => {
      item.classList.remove("active");
    });
    const activeNavItem = document.getElementById(`nav-${viewId}`);
    if (activeNavItem) activeNavItem.classList.add("active");

    // Toggle active view sections
    document.querySelectorAll(".view-section").forEach(section => {
      section.classList.remove("active");
    });
    const activeSection = document.getElementById(`view-${viewId}`);
    if (activeSection) {
      activeSection.classList.add("active");
      
      // If switching to Map, invalidate map size to fix Leaflet rendering issues
      if (viewId === "map" && map) {
        setTimeout(() => {
          map.invalidateSize();
        }, 150);
      }
      
      // If switching to Dashboard, update charts
      if (viewId === "dashboard") {
        updateDashboardData();
      }
    }

    // Scroll to top of the view
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
}

// --- Home: Populate Featured Attractions Grid ---
function initFeaturedGrid() {
  const grid = document.getElementById("featured-attractions-grid");
  if (!grid) return;

  // Let's pick 3 highly-rated top destinations to feature on the homepage
  const featured = attractionsData
    .filter(a => ["giza-pyramids", "grand-egyptian-museum", "valley-of-the-kings"].includes(a.id))
    .slice(0, 3);

  grid.innerHTML = featured.map(attraction => {
    return `
      <div class="featured-card glass-panel" onclick="navigateToAttraction('${attraction.id}')" style="background-image: linear-gradient(to bottom, rgba(7, 11, 25, 0.4), rgba(7, 11, 25, 0.95)), url('${attraction.image}'); background-size: cover; background-position: center; border: 1px solid rgba(212, 175, 55, 0.35);">
        <div>
          <span class="featured-card-tag" style="background: var(--color-gold); color: var(--color-sky-dark);">${attraction.category}</span>
          <h3 style="margin-top: 10px; text-shadow: 0 2px 4px rgba(0,0,0,0.8);">${attraction.name}</h3>
          <p style="font-size: 0.85rem; color: var(--color-sandstone); margin-top: 5px; text-shadow: 0 1px 2px rgba(0,0,0,0.8);">
            ${attraction.city}, ${attraction.governorate}
          </p>
          <p style="font-size: 0.9rem; color: #fff; margin-top: 12px; line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; text-shadow: 0 1px 2px rgba(0,0,0,0.8);">
            ${attraction.description}
          </p>
        </div>
        <div class="featured-card-meta" style="border-top: 1px solid rgba(255, 255, 255, 0.15); text-shadow: 0 1px 2px rgba(0,0,0,0.8);">
          <span class="featured-card-rating">
            <svg style="width: 14px; height: 14px; fill: var(--color-gold);" viewBox="0 0 24 24">
              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
            </svg>
            ${attraction.rating}
          </span>
          <span style="color:#fff;">Ticket: ${attraction.ticketPrice === 0 ? "Free" : attraction.ticketPrice + " EGP"}</span>
        </div>
      </div>
    `;
  }).join("");
}

// --- Navigation helper to focus on map ---
window.navigateToAttraction = function(id) {
  switchView("map");
  setTimeout(() => {
    openDetails(id);
  }, 200);
};

// --- Map: Populate Cities Dropdown in filter panel ---
function initCitiesDropdown() {
  const select = document.getElementById("filter-city");
  if (!select) return;

  // Extract unique cities
  const cities = [...new Set(attractionsData.map(a => a.city))].sort();

  cities.forEach(city => {
    const opt = document.createElement("option");
    opt.value = city;
    opt.textContent = city;
    select.appendChild(opt);
  });
}

// --- Map Panel Toggle (Search / Refine Map) ---
window.toggleMapPanel = function(panelId) {
  const panel = document.getElementById(panelId);
  if (!panel) return;

  const isOpen = panel.classList.contains("open");

  // Close all side panels first
  document.querySelectorAll(".map-side-panel").forEach(p => {
    p.classList.remove("open");
  });

  // Update toggle button active states
  const btnMap = { "search-panel": "toggle-search-btn", "filter-panel": "toggle-filter-btn" };
  document.querySelectorAll(".map-toggle-btn").forEach(b => b.classList.remove("active"));

  // Toggle clicked panel
  if (!isOpen) {
    panel.classList.add("open");
    const btn = document.getElementById(btnMap[panelId]);
    if (btn) btn.classList.add("active");
  }
};

// --- Attractions Tab ---
const CATEGORY_ICONS = {
  "Historical": "🏛️",
  "Museum":     "🎨",
  "Beach":      "🏖️",
  "Desert":     "🏜️",
  "National Park": "🌳",
  "Religious":  "🕌",
  "Nature":     "🌿",
  "Adventure":  "🧗",
};

let attractionsListCategory = "all";

window.openAttractionsTab = function() {
  const tab = document.getElementById("attractions-tab");
  const btn = document.getElementById("attractions-open-btn");
  if (tab) tab.classList.remove("hidden");
  if (btn) btn.classList.remove("visible");
};

window.closeAttractionsTab = function() {
  const tab = document.getElementById("attractions-tab");
  const btn = document.getElementById("attractions-open-btn");
  if (tab) tab.classList.add("hidden");
  if (btn) btn.classList.add("visible");
};

window.filterAttractionsList = function(cat) {
  attractionsListCategory = cat;

  // Update active tab button
  document.querySelectorAll(".att-cat-btn").forEach(b => {
    b.classList.toggle("active", b.getAttribute("data-cat") === cat);
  });

  renderAttractionCards();
};

function buildAttractionsList() {
  renderAttractionCards();
  const countEl = document.getElementById("attractions-count");
  if (countEl) countEl.textContent = attractionsData.length;
}

function renderAttractionCards() {
  const list = document.getElementById("attractions-list");
  if (!list) return;

  const filtered = attractionsListCategory === "all"
    ? attractionsData
    : attractionsData.filter(a => a.category === attractionsListCategory);

  // Update count badge
  const countEl = document.getElementById("attractions-count");
  if (countEl) countEl.textContent = filtered.length;

  list.innerHTML = filtered.map(a => {
    const occupancy = (a.currentVisitors / a.capacity) * 100;
    let crowd = "normal";
    if (occupancy > 85) crowd = "overcrowded";
    else if (occupancy > 60) crowd = "busy";

    const icon = CATEGORY_ICONS[a.category] || "📍";

    return `
      <div class="attraction-card" onclick="openDetails('${a.id}')">
        <div class="attraction-card-icon" style="background-image: url('${a.image}'); background-size: cover; background-position: center; color: transparent;"></div>
        <div class="attraction-card-info">
          <span class="attraction-card-name">${a.name}</span>
          <div class="attraction-card-meta">
            <span>${a.city}</span>
            <span class="attraction-card-rating">★ ${a.rating}</span>
          </div>
        </div>
        <div class="attraction-card-crowd ${crowd}"></div>
      </div>
    `;
  }).join("");
}

// --- Map: Time-based theme detection ---
// Day = 06:00–19:59 local time → CartoDB Light No Labels
// Night = 20:00–05:59 local time → CartoDB Dark No Labels
let currentMapTheme = null;
let mapTileLayer = null;
let egyptLabelMarker = null;

function getMapTheme() {
  const hour = new Date().getHours();
  return (hour >= 6 && hour < 20) ? "light" : "dark";
}

function applyMapTheme(theme) {
  if (theme === currentMapTheme) return; // No change needed
  currentMapTheme = theme;

  const isDark = theme === "dark";

  const tileUrl = isDark
    ? "https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png"
    : "https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png";

  const labelColor = isDark
    ? "rgba(212, 175, 55, 0.55)"
    : "rgba(120, 80, 0, 0.45)";

  const labelShadow = isDark
    ? "0 0 12px rgba(212, 175, 55, 0.25)"
    : "0 1px 3px rgba(255,255,255,0.6), 0 0 8px rgba(120,80,0,0.15)";

  // Swap tile layer
  if (mapTileLayer) {
    map.removeLayer(mapTileLayer);
  }
  mapTileLayer = L.tileLayer(tileUrl, {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 20
  });
  mapTileLayer.addTo(map);
  // Push tile layer to bottom so markers stay on top
  mapTileLayer.bringToBack();

  // Update Egypt label color to match theme
  if (egyptLabelMarker) {
    map.removeLayer(egyptLabelMarker);
  }
  egyptLabelMarker = L.marker([26.5, 29.8], {
    icon: L.divIcon({
      className: '',
      html: `<div style="
        font-family: 'Cinzel', serif;
        font-size: 1.1rem;
        font-weight: 700;
        color: ${labelColor};
        letter-spacing: 4px;
        text-transform: uppercase;
        text-shadow: ${labelShadow};
        white-space: nowrap;
        pointer-events: none;
        user-select: none;
        transition: color 1s ease;
      ">EGYPT</div>`,
      iconSize: [120, 24],
      iconAnchor: [60, 12]
    }),
    interactive: false,
    zIndexOffset: -1000
  }).addTo(map);
}

// --- Map: Initialize Leaflet Map ---
function initMap() {
  const mapElement = document.getElementById("map");
  if (!mapElement) return;

  // Egypt + immediate surroundings bounding box
  const egyptBounds = L.latLngBounds(
    [20.5, 23.5],  // South-West: below Aswan, left of Libya border
    [32.5, 37.5]   // North-East: Mediterranean coast, right of Sinai/Red Sea
  );

  map = L.map("map", {
    zoomControl: false,
    minZoom: 6,                        // Cannot zoom out past the initial Egypt view
    maxBounds: egyptBounds,            // Hard pan boundary
    maxBoundsViscosity: 1.0            // Fully solid — map snaps back instantly
  }).setView([26.8, 30.8], 6);

  // Custom Zoom Control (positioned bottom-right for clean look)
  L.control.zoom({
    position: "bottomright"
  }).addTo(map);

  // Apply the correct theme for the current time of day
  applyMapTheme(getMapTheme());

  markerLayerGroup = L.layerGroup().addTo(map);

  // Check every 60 seconds — auto-switch at dawn (06:00) and dusk (20:00)
  setInterval(() => {
    applyMapTheme(getMapTheme());
  }, 60 * 1000);

  // Create markers
  buildMapMarkers();
}



// --- Map: Generate Markers ---
function buildMapMarkers() {
  markerLayerGroup.clearLayers();
  markerMap.clear();

  attractionsData.forEach(attraction => {
    const occupancy = (attraction.currentVisitors / attraction.capacity) * 100;
    let crowdStatus = "normal";
    if (occupancy > 85) crowdStatus = "overcrowded";
    else if (occupancy > 60) crowdStatus = "busy";

    // Custom circular marker with gold border and status-colored center glow
    const customIcon = L.divIcon({
      html: `<div class="custom-map-marker" id="marker-${attraction.id}">
               <div class="marker-inner ${crowdStatus}"></div>
             </div>`,
      className: "",
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });

    const marker = L.marker(attraction.coordinates, { icon: customIcon });

    // Bind small tooltip popup on hover
    marker.bindTooltip(`
      <div style="font-family: 'Montserrat', sans-serif; padding: 2px;">
        <h4 style="font-family: 'Cinzel', serif; color: var(--color-gold); font-size: 0.85rem; margin-bottom: 2px;">${attraction.name}</h4>
        <span style="font-size: 0.75rem; color: #aaa;">${attraction.city} • Occupancy: ${Math.round(occupancy)}%</span>
      </div>
    `, {
      direction: "top",
      offset: [0, -10],
      opacity: 0.95
    });

    // Open side panel on click
    marker.on("click", () => {
      openDetails(attraction.id);
    });

    markerLayerGroup.addLayer(marker);
    markerMap.set(attraction.id, marker);
  });

  applyFilters();
  buildAttractionsList();
}


// --- Search & Filters implementation ---
window.applyFilters = function() {
  const searchQuery = document.getElementById("map-search-input").value.toLowerCase();
  const cityFilter = document.getElementById("filter-city").value;
  const categoryFilter = document.getElementById("filter-category").value;
  const crowdFilter = document.getElementById("filter-crowd").value;
  const priceFilter = document.getElementById("filter-price").value;

  const isWheelchair = document.getElementById("filter-wheelchair").checked;
  const isParking = document.getElementById("filter-parking").checked;
  const isRestaurants = document.getElementById("filter-restaurants").checked;
  const isGiftshop = document.getElementById("filter-giftshop").checked;

  attractionsData.forEach(attraction => {
    const marker = markerMap.get(attraction.id);
    if (!marker) return;

    let matches = true;

    // Search query
    if (searchQuery) {
      const nameMatch = attraction.name.toLowerCase().includes(searchQuery);
      const descMatch = attraction.description.toLowerCase().includes(searchQuery);
      const cityMatch = attraction.city.toLowerCase().includes(searchQuery);
      if (!nameMatch && !descMatch && !cityMatch) {
        matches = false;
      }
    }

    // City
    if (cityFilter !== "all" && attraction.city !== cityFilter) {
      matches = false;
    }

    // Category
    if (categoryFilter !== "all" && attraction.category !== categoryFilter) {
      matches = false;
    }

    // Crowd status
    if (crowdFilter !== "all") {
      const occupancy = (attraction.currentVisitors / attraction.capacity) * 100;
      let crowdStatus = "normal";
      if (occupancy > 85) crowdStatus = "overcrowded";
      else if (occupancy > 60) crowdStatus = "busy";

      if (crowdStatus !== crowdFilter) {
        matches = false;
      }
    }

    // Ticket price
    if (priceFilter !== "all") {
      const priceLimit = parseInt(priceFilter);
      if (priceLimit === 0) {
        if (attraction.ticketPrice > 0) matches = false;
      } else {
        if (attraction.ticketPrice > priceLimit || attraction.ticketPrice === 0) matches = false;
      }
    }

    // Amenities / Facilities checkboxes
    if (isWheelchair && !attraction.facilities.wheelchair) matches = false;
    if (isParking && !attraction.facilities.parking) matches = false;
    if (isRestaurants && !attraction.facilities.restaurants) matches = false;
    if (isGiftshop && !attraction.facilities.giftShop) matches = false;

    // Apply visibility changes
    if (matches) {
      if (!map.hasLayer(marker)) {
        markerLayerGroup.addLayer(marker);
      }
    } else {
      if (map.hasLayer(marker)) {
        markerLayerGroup.removeLayer(marker);
      }
    }
  });
};

window.handleSearch = function(query) {
  applyFilters();

  const suggestionsContainer = document.getElementById("search-suggestions");
  if (!suggestionsContainer) return;

  if (!query.trim()) {
    suggestionsContainer.style.display = "none";
    suggestionsContainer.innerHTML = "";
    return;
  }

  const queryLower = query.toLowerCase();
  const matches = attractionsData.filter(attraction => 
    attraction.name.toLowerCase().includes(queryLower) ||
    attraction.city.toLowerCase().includes(queryLower) ||
    attraction.category.toLowerCase().includes(queryLower)
  ).slice(0, 5);

  if (matches.length > 0) {
    suggestionsContainer.innerHTML = matches.map(attraction => `
      <div class="suggestion-item" onclick="selectSuggestion('${attraction.id}')">
        <span class="suggestion-name">${attraction.name}</span>
        <span class="suggestion-meta">${attraction.city} • ${attraction.category}</span>
      </div>
    `).join("");
    suggestionsContainer.style.display = "flex";
  } else {
    suggestionsContainer.style.display = "none";
    suggestionsContainer.innerHTML = "";
  }
};

window.selectSuggestion = function(id) {
  const attraction = attractionsData.find(a => a.id === id);
  if (!attraction) return;

  // Set input value
  const searchInput = document.getElementById("map-search-input");
  if (searchInput) searchInput.value = attraction.name;

  // Hide suggestions
  const suggestionsContainer = document.getElementById("search-suggestions");
  if (suggestionsContainer) {
    suggestionsContainer.style.display = "none";
    suggestionsContainer.innerHTML = "";
  }

  // Focus on marker and open details panel
  applyFilters();
  openDetails(id);
};

window.resetFilters = function() {
  document.getElementById("map-search-input").value = "";
  document.getElementById("filter-city").value = "all";
  document.getElementById("filter-category").value = "all";
  document.getElementById("filter-crowd").value = "all";
  document.getElementById("filter-price").value = "all";

  document.getElementById("filter-wheelchair").checked = false;
  document.getElementById("filter-parking").checked = false;
  document.getElementById("filter-restaurants").checked = false;
  document.getElementById("filter-giftshop").checked = false;



  applyFilters();
};



// --- Map: Details Slide-out Drawer Panel ---
window.openDetails = function(id) {
  currentSelectedAttractionId = id;
  const attraction = attractionsData.find(a => a.id === id);
  if (!attraction) return;

  // Auto-close the attractions panel on selecting an item
  closeAttractionsTab();


  const drawer = document.getElementById("detail-drawer");
  const container = document.getElementById("detail-drawer-content");

  // Calculate live values
  const occupancy = (attraction.currentVisitors / attraction.capacity) * 100;
  let crowdStatus = "Normal";
  let statusClass = "normal";
  if (occupancy > 85) {
    crowdStatus = "Overcrowded";
    statusClass = "overcrowded";
  } else if (occupancy > 60) {
    crowdStatus = "Busy";
    statusClass = "busy";
  }



  // Render facility item Helper
  const getFacilityHTML = (key, label, svgD) => {
    const isSupported = attraction.facilities[key];
    const status = isSupported ? "supported" : "not-supported";
    return `
      <div class="facility-item ${status}">
        <svg viewBox="0 0 24 24">
          ${isSupported 
            ? `<path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>` // Checkmark
            : `<path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>` // Cross
          }
        </svg>
        <span>${label}</span>
      </div>
    `;
  };

  // Nearby attractions generator helper
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

  container.innerHTML = `
    <div class="info-drawer-header">
      <button class="close-drawer-btn" onclick="closeDetails()">
        <svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
      </button>
    </div>

    <!-- Attraction Image Header -->
    <img class="info-drawer-image" src="${attraction.image}" style="width: calc(100% - 30px); height: 200px; object-fit: cover; border-radius: 12px; margin: 15px 15px 0 15px; border: 1px solid var(--glass-border); flex-shrink: 0;" alt="${attraction.name}">

    <!-- Body Information -->
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
            <div class="occupancy-bar-fill" id="drawer-occupancy-bar" style="width: ${occupancy}%; background-color: var(--status-${statusClass});"></div>
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
        
        <!-- Dynamic Weather Widget -->
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

        <!-- Tomorrow's Hourly Forecast Chart -->
        <div class="forecast-section" style="margin-top: 15px; border-top: 1px solid rgba(212,175,55,0.15); padding-top: 15px;">
          <h4 style="color: var(--color-gold); font-size: 0.85rem; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px; font-weight:600;">Tomorrow's Crowd Forecast (ML)</h4>
          <div id="drawer-prediction-alert" style="display: none; margin-bottom: 12px; font-size: 0.8rem; padding: 10px; border-radius: 6px; font-weight: 600;"></div>
          <div class="forecast-chart-container" style="position: relative; height: 160px; width: 100%; margin-bottom: 10px; background: rgba(7, 11, 25, 0.4); border-radius: 8px; border: 1px solid var(--glass-border); padding: 8px;">
            <canvas id="drawer-forecast-chart"></canvas>
          </div>
        </div>
      </div>

      <!-- Facilities Checklist -->
      <div class="facilities-section">
        <h4>Visitor Amenities</h4>
        <div class="facilities-grid">
          ${getFacilityHTML("wheelchair", "Wheelchair Access")}
          ${getFacilityHTML("parking", "Vehicle Parking")}
          ${getFacilityHTML("restaurants", "Dining Options")}
          ${getFacilityHTML("giftShop", "Gift Shops")}
          ${getFacilityHTML("cafes", "Coffee & Cafés")}
          ${getFacilityHTML("restrooms", "Public Restrooms")}
        </div>
      </div>

      <!-- Nearby Destinations -->
      <div class="nearby-section">
        <h4>Discover Nearby Attractions</h4>
        <div class="nearby-list">
          ${nearbyHTML}
        </div>
      </div>

    </div>
  `;

  drawer.classList.add("active");

  // Initialize Tomorrow's predictions line chart
  setTimeout(() => {
    initDrawerForecastChart(id);
  }, 100);

  // Fly Leaflet map to attraction coordinates [lat, lng] with constant offset
  // to center the marker in the remaining left viewport space (clearing the 420px right drawer)
  let targetLng = attraction.coordinates[1];
  if (map && window.innerWidth > 768) {
    // 0.25 degrees is the exact offset for 210px (half of 420px drawer) at zoom 10 in Egypt
    targetLng += 0.25;
  }
  map.flyTo([attraction.coordinates[0], targetLng], 10);
};

window.closeDetails = function() {
  currentSelectedAttractionId = null;
  const drawer = document.getElementById("detail-drawer");
  drawer.classList.remove("active");
};




// --- Live Dashboard Generation & Update ---
function initDashboard() {
  const regionalCanvas = document.getElementById("chart-regional-visitors");
  const categoryCanvas = document.getElementById("chart-category-distribution");
  if (!regionalCanvas || !categoryCanvas) return;

  Chart.defaults.color = "#E0D0C0";
  Chart.defaults.font.family = "'Montserrat', sans-serif";

  // Regional Load Chart (X-Axis: Cities, Y-Axis: Total Visitors in City)
  regionalChartInstance = new Chart(regionalCanvas, {
    type: "bar",
    data: {
      labels: [],
      datasets: [{
        label: "Current Visitors",
        data: [],
        backgroundColor: "rgba(212, 175, 55, 0.75)",
        borderColor: "#D4AF37",
        borderWidth: 1.5,
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
      plugins: {
        legend: { display: false }
      }
    }
  });

  // Category Distribution (Doughnut Chart)
  categoryChartInstance = new Chart(categoryCanvas, {
    type: "doughnut",
    data: {
      labels: [],
      datasets: [{
        data: [],
        backgroundColor: [
          "#D4AF37", // Gold
          "#10B981", // Teal/Green
          "#3B82F6", // Blue
          "#F59E0B", // Amber
          "#EC4899", // Pink
          "#8B5CF6"  // Purple
        ],
        borderWidth: 1,
        borderColor: "#070B19"
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "right",
          labels: { boxWidth: 12, padding: 12 }
        }
      }
    }
  });

  updateDashboardData();
}

function updateDashboardData() {
  if (!regionalChartInstance || !categoryChartInstance) return;

  // Mode-based calculation variables
  let totalVisitors = 0;
  let activeLocations = attractionsData.length;
  let occupancySum = 0;
  let topDestinationName = "None";
  let highestOccupancy = -1;
  
  const cityLoads = {};
  const categoryCounts = {};
  const detailsList = [];

  const isPredMode = (activeDashboardMode === "predictions" && predictionsData);

  if (isPredMode) {
    // 1. Predictions Mode Calculations
    // We compute the "Peak Hourly Load" globally. Find the hour of day with maximum total occupancy/visitors.
    const hourlyTotalOccupancies = Array(24).fill(0);
    const hourlyTotalVisitors = Array(24).fill(0);
    
    attractionsData.forEach(attraction => {
      const hourlyPred = predictionsData[attraction.id] || [];
      hourlyPred.forEach(pred => {
        const hr = pred.hour;
        const occ = pred.predicted_occupancy;
        const visitors = Math.round(occ * attraction.capacity);
        
        hourlyTotalOccupancies[hr] += occ * 100;
        hourlyTotalVisitors[hr] += visitors;
      });
    });
    
    // Find peak hour globally (during visiting hours 8-22)
    let globalPeakHour = 12;
    let maxGlobalVisitors = 0;
    for (let hr = 8; hr <= 22; hr++) {
      if (hourlyTotalVisitors[hr] > maxGlobalVisitors) {
        maxGlobalVisitors = hourlyTotalVisitors[hr];
        globalPeakHour = hr;
      }
    }
    
    // Calculate average daily metrics for tomorrow
    attractionsData.forEach(attraction => {
      const hourlyPred = predictionsData[attraction.id] || [];
      
      let avgOccSum = 0;
      let peakOcc = -1;
      let peakVisitors = 0;
      
      hourlyPred.forEach(pred => {
        avgOccSum += pred.predicted_occupancy;
        if (pred.predicted_occupancy > peakOcc) {
          peakOcc = pred.predicted_occupancy;
          peakVisitors = Math.round(pred.predicted_occupancy * attraction.capacity);
        }
      });
      
      const avgOcc = (hourlyPred.length > 0) ? (avgOccSum / hourlyPred.length) * 100 : 25;
      
      totalVisitors += peakVisitors; // Maximum concurrent visitors
      occupancySum += avgOcc;
      
      // City loads represent peak visitor load tomorrow in the city
      cityLoads[attraction.city] = (cityLoads[attraction.city] || 0) + peakVisitors;
      
      // Category counts represent peak visitor load tomorrow by category
      categoryCounts[attraction.category] = (categoryCounts[attraction.category] || 0) + peakVisitors;
      
      detailsList.push({
        name: attraction.name,
        id: attraction.id,
        city: attraction.city,
        visitors: peakVisitors,
        occupancy: avgOcc
      });
    });
    
    const avgOccupancy = occupancySum / activeLocations;
    
    // Update layout DOM cards
    document.getElementById("dash-total-visitors").textContent = totalVisitors.toLocaleString();
    document.getElementById("dash-active-locations").textContent = activeLocations;
    document.getElementById("dash-avg-occupancy").textContent = Math.round(avgOccupancy) + "%";
    
    // Custom labels for Card 4
    const topDestCardLabel = document.querySelector(".metric-card:nth-child(4) h4");
    if (topDestCardLabel) topDestCardLabel.textContent = "Global Peak Hour";
    document.getElementById("dash-top-destination").textContent = `${globalPeakHour % 12 || 12}:00 ${globalPeakHour >= 12 ? "PM" : "AM"}`;
    const topDestSubtext = document.querySelector(".metric-card:nth-child(4) .sub-val");
    if (topDestSubtext) topDestSubtext.textContent = "Forecasted peak load window";
    
    // Customize label for Card 1 & 3
    const totalVisitorsLabel = document.querySelector(".metric-card:nth-child(1) h4");
    if (totalVisitorsLabel) totalVisitorsLabel.textContent = "Forecasted Max Visitors";
    const avgOccLabel = document.querySelector(".metric-card:nth-child(3) h4");
    if (avgOccLabel) avgOccLabel.textContent = "Avg. Occupancy (Tomorrow)";

  } else {
    // 2. Live Telemetry Mode Calculations (Today)
    attractionsData.forEach(attraction => {
      const occ = (attraction.currentVisitors / attraction.capacity) * 100;
      totalVisitors += attraction.currentVisitors;
      occupancySum += occ;

      if (occ > highestOccupancy) {
        highestOccupancy = occ;
        topDestinationName = attraction.name;
      }

      cityLoads[attraction.city] = (cityLoads[attraction.city] || 0) + attraction.currentVisitors;
      categoryCounts[attraction.category] = (categoryCounts[attraction.category] || 0) + 1;

      detailsList.push({
        name: attraction.name,
        id: attraction.id,
        city: attraction.city,
        visitors: attraction.currentVisitors,
        occupancy: occ
      });
    });

    const avgOccupancy = occupancySum / activeLocations;

    document.getElementById("dash-total-visitors").textContent = totalVisitors.toLocaleString();
    document.getElementById("dash-active-locations").textContent = activeLocations;
    document.getElementById("dash-avg-occupancy").textContent = Math.round(avgOccupancy) + "%";
    
    // Reset labels to Live
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

  // Populate Lists: Busy vs Peaceful Tables
  const busyList = [...detailsList].sort((a,b) => b.occupancy - a.occupancy).slice(0, 5);
  const peacefulList = [...detailsList].sort((a,b) => a.occupancy - b.occupancy).slice(0, 5);

  const getOccupancyClass = (occ) => {
    if (occ > 85) return "high";
    if (occ > 60) return "medium";
    return "low";
  };

  const getOccupancyLabel = (occ) => {
    if (occ > 85) return "Overcrowded";
    if (occ > 60) return "Busy";
    return "Normal";
  };

  const renderTableRows = (list, containerId) => {
    const tbody = document.getElementById(containerId);
    if (!tbody) return;
    tbody.innerHTML = list.map(item => {
      const occClass = getOccupancyClass(item.occupancy);
      const label = getOccupancyLabel(item.occupancy);
      return `
        <tr style="cursor: pointer;" onclick="navigateToAttraction('${item.id}')">
          <td style="font-weight:600; color:#fff;">${item.name}</td>
          <td>${item.city}</td>
          <td>${item.visitors.toLocaleString()}</td>
          <td><span class="occupancy-badge ${occClass}">${Math.round(item.occupancy)}% (${label})</span></td>
        </tr>
      `;
    }).join("");
  };

  renderTableRows(busyList, "dash-busy-table-body");
  renderTableRows(peacefulList, "dash-peaceful-table-body");

  // Update Charts Data structures
  // 1. Regional loads (Cities)
  const cityLabels = Object.keys(cityLoads);
  const cityData = Object.values(cityLoads);
  
  regionalChartInstance.data.labels = cityLabels;
  regionalChartInstance.data.datasets[0].data = cityData;
  regionalChartInstance.update();

  // 2. Category distribution
  const catLabels = Object.keys(categoryCounts);
  const catData = Object.values(categoryCounts);

  categoryChartInstance.data.labels = catLabels;
  categoryChartInstance.data.datasets[0].data = catData;
  categoryChartInstance.update();
}

// --- Live Telemetry Simulator (Adds "WOW" factor of responsive live values) ---
function simulateTelemetryTick() {
  attractionsData.forEach(attraction => {
    // Fluctuate visitors by a small random percentage (-8% to +8%)
    const pctChange = (Math.random() * 16 - 8) / 100;
    let change = Math.round(attraction.currentVisitors * pctChange);
    
    // Bounds check to stay positive and not exceed 115% capacity
    let newVisitors = attraction.currentVisitors + change;
    if (newVisitors < 50) newVisitors = 50;
    if (newVisitors > attraction.capacity * 1.15) {
      newVisitors = Math.round(attraction.capacity * 1.15);
    }
    attraction.currentVisitors = newVisitors;
  });

  // Re-generate map markers to update color status rings
  if (map) {
    // Keep tracks of whether details drawer is open
    const currentDrawerId = currentSelectedAttractionId;
    buildMapMarkers();

    // If details drawer is open, update its stats live
    if (currentDrawerId) {
      updateDrawerLiveValues(currentDrawerId);
    }
  }

  // Update active dashboard stats if on dashboard view
  const dashSection = document.getElementById("view-dashboard");
  if (dashSection && dashSection.classList.contains("active")) {
    if (activeDashboardMode === 'live') {
      updateDashboardData();
    }
  }
}

// ==========================================================================
// ML Predictions & Insights Integration Logic (API + Offline Fallback)
// ==========================================================================

const API_BASE_URL = "http://127.0.0.1:5000";

// Mapping from database location_id to frontend attraction ID (All 45 Locations)
const locationIdMap = {
  "egyptian-museum": "CAI_01",
  "nmec": "CAI_02",
  "citadel-saladin": "CAI_03",
  "khan-el-khalili": "CAI_04",
  "al-muizz-street": "CAI_05",
  "cairo-tower": "CAI_06",
  "al-azhar-park": "CAI_07",
  "giza-pyramids": "GIZ_01",
  "great-sphinx": "GIZ_02",
  "grand-egyptian-museum": "GIZ_03",
  "saqqara": "GIZ_04",
  "dahshur-pyramids": "GIZ_05",
  "bibliotheca-alexandrina": "ALX_01",
  "qaitbay-citadel": "ALX_02",
  "catacombs-kom-el-shoqafa": "ALX_03",
  "montaza-palace": "ALX_04",
  "stanley-bridge": "ALX_05",
  "karnak-temple": "LUX_01",
  "luxor-temple": "LUX_02",
  "valley-of-the-kings": "LUX_03",
  "hatshepsut-temple": "LUX_04",
  "valley-of-the-queens": "LUX_05",
  "luxor-museum": "LUX_06",
  "abu-simbel": "ASW_01",
  "philae-temple": "ASW_02",
  "nubian-village": "ASW_03",
  "nubian-museum": "ASW_04",
  "unfinished-obelisk": "ASW_05",
  "ras-mohammed": "SHM_01",
  "soho-square": "SHM_02",
  "naama-bay": "SHM_03",
  "sharks-bay": "SHM_04",
  "old-market-sharm": "SHM_05",
  "blue-hole": "DAH_01",
  "dahab-lagoon": "DAH_02",
  "lighthouse-reef": "DAH_03",
  "three-pools": "DAH_04",
  "giftun-island": "HRG_01",
  "hurghada-marina": "HRG_02",
  "mahmya-island": "HRG_03",
  "sand-city": "HRG_04",
  "wadi-el-hitan": "FYM_01",
  "tunis-village": "FYM_02",
  "lake-qarun": "FYM_03",
  "wadi-el-rayan": "FYM_04"
};

// Reverse mapping for database -> frontend
const dbToFrontendMap = {};
for (const [frontId, dbId] of Object.entries(locationIdMap)) {
  dbToFrontendMap[dbId] = frontId;
}

async function loadPredictionsAndInsights() {
  console.log("Spirit of Ankh: Loading ML predictions and insights...");
  try {
    const [predRes, insRes] = await Promise.all([
      fetch(`${API_BASE_URL}/api/predictions/tomorrow`),
      fetch(`${API_BASE_URL}/api/insights/tomorrow`)
    ]);
    
    if (predRes.ok && insRes.ok) {
      const livePredictions = await predRes.json();
      const liveInsights = await insRes.json();
      
      predictionsData = mapLivePredictions(livePredictions);
      insightsData = mapLiveInsights(liveInsights);
      console.log("Spirit of Ankh: Live ML predictions successfully fetched from Snowflake API.");
    } else {
      throw new Error("API responded with an error status.");
    }
  } catch (err) {
    console.warn("Spirit of Ankh: Live API is offline or failed. Falling back to pre-calculated offline predictions.", err);
    predictionsData = offlinePredictions;
    insightsData = offlineInsights;
  }
  
  // If predictions mode is already active (e.g. on reload), refresh the dashboard
  const dashSection = document.getElementById("view-dashboard");
  if (dashSection && dashSection.classList.contains("active") && activeDashboardMode === "predictions") {
    updateDashboardData();
  }
}

function mapLivePredictions(records) {
  const result = {};
  for (const frontId of Object.keys(locationIdMap)) {
    result[frontId] = [];
  }
  records.forEach(rec => {
    const dbId = rec.location_id;
    const frontId = dbToFrontendMap[dbId];
    if (frontId) {
      result[frontId].push({
        hour: rec.hour,
        predicted_occupancy: rec.predicted_occupancy
      });
    }
  });
  for (const frontId of Object.keys(result)) {
    result[frontId].sort((a, b) => a.hour - b.hour);
  }
  return result;
}

function mapLiveInsights(liveInsights) {
  const overcrowded = (liveInsights.overcrowded_afternoon || []).map(item => {
    const dbId = item.LOCATION_ID || item.LOCATION_NAME || item.location_id || item.location_name || "";
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

function initDrawerForecastChart(id) {
  const canvas = document.getElementById("drawer-forecast-chart");
  if (!canvas) return;

  const hourlyData = (predictionsData && predictionsData[id]) || [];
  if (hourlyData.length === 0) {
    canvas.parentElement.innerHTML = "<p style='font-size:0.8rem; color:var(--color-sandstone); text-align:center; padding: 20px;'>No forecast data available.</p>";
    return;
  }

  const filteredData = hourlyData.filter(d => d.hour >= 8 && d.hour <= 22);
  const labels = filteredData.map(d => `${d.hour}:00`);
  const occupancies = filteredData.map(d => Math.round(d.predicted_occupancy * 100));

  let peakHour = -1;
  let peakOccupancy = -1;
  let isOvercrowdedTomorrow = false;

  filteredData.forEach(d => {
    const occ = Math.round(d.predicted_occupancy * 100);
    if (occ > peakOccupancy) {
      peakOccupancy = occ;
      peakHour = d.hour;
    }
    if (occ > 85) {
      isOvercrowdedTomorrow = true;
    }
  });

  const alertContainer = document.getElementById("drawer-prediction-alert");
  if (alertContainer) {
    if (isOvercrowdedTomorrow) {
      alertContainer.style.display = "block";
      alertContainer.style.backgroundColor = "rgba(239, 68, 68, 0.15)";
      alertContainer.style.border = "1px solid var(--status-overcrowded)";
      alertContainer.style.color = "#ff8888";
      alertContainer.innerHTML = `⚠️ Overcrowding predicted at ${peakHour}:00 (${peakOccupancy}% occupancy). Consider visiting early morning or late evening.`;
    } else {
      alertContainer.style.display = "block";
      alertContainer.style.backgroundColor = "rgba(16, 185, 129, 0.15)";
      alertContainer.style.border = "1px solid var(--status-normal)";
      alertContainer.style.color = "#88ff88";
      
      let minOcc = 100;
      let bestHr = 8;
      filteredData.forEach(d => {
        const occ = Math.round(d.predicted_occupancy * 100);
        if (occ < minOcc) {
          minOcc = occ;
          bestHr = d.hour;
        }
      });
      alertContainer.innerHTML = `🟢 Recommended visit time: tomorrow at ${bestHr}:00 (${minOcc}% occupancy).`;
    }
  }

  if (drawerForecastChartInstance) {
    drawerForecastChartInstance.destroy();
  }

  const ctx = canvas.getContext("2d");
  drawerForecastChartInstance = new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [{
        label: "Occupancy %",
        data: occupancies,
        borderColor: "#D4AF37",
        borderWidth: 2,
        backgroundColor: "rgba(212, 175, 55, 0.15)",
        fill: true,
        tension: 0.4,
        pointBackgroundColor: occupancies.map(occ => occ > 85 ? "#EF4444" : "#D4AF37"),
        pointBorderColor: "#070B19",
        pointRadius: 4,
        pointHoverRadius: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: "#E0D0C0", font: { size: 9 } }
        },
        y: {
          grid: { color: "rgba(255,255,255,0.05)" },
          ticks: { color: "#E0D0C0", font: { size: 9 } },
          min: 0,
          max: 100
        }
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: function(context) {
              return `Occupancy: ${context.raw}%`;
            }
          }
        }
      }
    }
  });
}

window.switchDashboardMode = function(mode) {
  activeDashboardMode = mode;
  
  const liveTab = document.getElementById("tab-live-mode");
  const predTab = document.getElementById("tab-predictions-mode");
  const insightsPanel = document.getElementById("predictions-insights-panel");
  
  if (mode === "live") {
    if (liveTab) {
      liveTab.classList.add("active");
      liveTab.style.background = "var(--color-gold)";
      liveTab.style.color = "var(--color-sky-dark)";
      liveTab.style.fontWeight = "700";
    }
    if (predTab) {
      predTab.classList.remove("active");
      predTab.style.background = "transparent";
      predTab.style.color = "var(--color-sandstone)";
      predTab.style.fontWeight = "600";
    }
    if (insightsPanel) insightsPanel.style.display = "none";
  } else {
    if (predTab) {
      predTab.classList.add("active");
      predTab.style.background = "var(--color-gold)";
      predTab.style.color = "var(--color-sky-dark)";
      predTab.style.fontWeight = "700";
    }
    if (liveTab) {
      liveTab.classList.remove("active");
      liveTab.style.background = "transparent";
      liveTab.style.color = "var(--color-sandstone)";
      liveTab.style.fontWeight = "600";
    }
    if (insightsPanel) insightsPanel.style.display = "block";
    
    renderMLInsightsPanel();
  }
  
  updateDashboardData();
};

function renderMLInsightsPanel() {
  const overcrowdedContainer = document.getElementById("insight-overcrowded-list");
  const bestHoursContainer = document.getElementById("insight-best-hours-grid");
  
  if (!insightsData || !overcrowdedContainer || !bestHoursContainer) return;
  
  const overcrowded = insightsData.overcrowded_afternoon || [];
  if (overcrowded.length === 0) {
    overcrowdedContainer.innerHTML = `<p style="font-size: 0.85rem; color: var(--color-sandstone); padding: 10px;">🟢 No afternoon overcrowding predicted tomorrow!</p>`;
  } else {
    const grouped = {};
    overcrowded.forEach(item => {
      const name = attractionsData.find(a => a.id === item.id)?.name || item.id;
      if (!grouped[name]) grouped[name] = [];
      if (!grouped[name].includes(item.hour)) grouped[name].push(item.hour);
    });
    
    overcrowdedContainer.innerHTML = Object.entries(grouped).map(([name, hours]) => {
      const hoursStr = hours.map(h => `${h}:00`).join(", ");
      return `
        <div class="insight-item" style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.03); padding-bottom: 6px; font-size: 0.85rem;">
          <span style="color:#fff; font-weight:600;">${name}</span>
          <span style="color:var(--status-overcrowded); font-weight:600; font-size:0.75rem; background:rgba(239, 68, 68, 0.1); padding: 2px 6px; border-radius: 4px;">Overcrowded: ${hoursStr}</span>
        </div>
      `;
    }).join("");
  }
  
  const bestHours = insightsData.best_hour_by_city || {};
  if (Object.keys(bestHours).length === 0) {
    bestHoursContainer.innerHTML = `<p style="font-size: 0.85rem; color: var(--color-sandstone); padding: 10px;">No recommendations available.</p>`;
  } else {
    bestHoursContainer.innerHTML = Object.entries(bestHours).map(([city, hour]) => {
      const timeStr = `${hour % 12 || 12}:00 ${hour >= 12 ? "PM" : "AM"}`;
      return `
        <div class="best-hour-card" style="background: rgba(16, 185, 129, 0.05); border: 1px solid rgba(16, 185, 129, 0.15); border-radius: 6px; padding: 10px; text-align: center;">
          <div style="font-size: 0.75rem; color: var(--color-sandstone); text-transform: uppercase; font-weight:600; margin-bottom: 2px;">${city}</div>
          <div style="font-size: 0.9rem; color: var(--color-gold); font-weight:700;">${timeStr}</div>
        </div>
      `;
    }).join("");
  }
}


// Update specific fields in details drawer without rebuilding full HTML (prevents screen jumps and resets)
function updateDrawerLiveValues(id) {
  const attraction = attractionsData.find(a => a.id === id);
  if (!attraction) return;

  const visitorsEl = document.getElementById("drawer-live-visitors");
  const percentEl = document.getElementById("drawer-occupancy-percent");
  const barEl = document.getElementById("drawer-occupancy-bar");
  const tempEl = document.getElementById("drawer-weather-temp");
  const condEl = document.getElementById("drawer-weather-condition");
  const humEl = document.getElementById("drawer-weather-humidity");
  const windEl = document.getElementById("drawer-weather-wind");
  const statusPill = document.getElementById("drawer-crowd-status-pill");

  const occupancy = (attraction.currentVisitors / attraction.capacity) * 100;
  let crowdStatus = "Normal";
  let statusClass = "normal";
  if (occupancy > 85) {
    crowdStatus = "Overcrowded";
    statusClass = "overcrowded";
  } else if (occupancy > 60) {
    crowdStatus = "Busy";
    statusClass = "busy";
  }

  if (visitorsEl) visitorsEl.textContent = attraction.currentVisitors.toLocaleString();
  if (percentEl) percentEl.textContent = Math.round(occupancy) + "%";
  if (tempEl) tempEl.textContent = attraction.weather.temp + "°C";
  if (condEl) condEl.textContent = attraction.weather.condition;
  if (humEl) humEl.textContent = attraction.weather.humidity + "%";
  if (windEl) windEl.textContent = attraction.weather.windSpeed + " km/h";

  if (barEl) {
    barEl.style.width = occupancy + "%";
    barEl.style.backgroundColor = `var(--status-${statusClass})`;
  }

  if (statusPill) {
    statusPill.textContent = crowdStatus;
    statusPill.className = `info-tag crowd-status-pill ${statusClass}`;
  }
}

// --- Live Weather Forecast API Integration (Open-Meteo) ---

// Map WMO Weather Codes to descriptive conditions
function mapWeatherCode(code) {
  if (code === 0) return "Clear";
  if ([1, 2, 3].includes(code)) return "Partly Cloudy";
  if ([45, 48].includes(code)) return "Foggy";
  if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) return "Rainy";
  if ([71, 73, 75, 77, 85, 86].includes(code)) return "Snowy";
  if ([95, 96, 99].includes(code)) return "Thunderstorm";
  return "Sunny";
}

async function fetchRealWeatherForAttractions() {
  console.log("Fetching live weather from Open-Meteo API based on coordinates...");
  for (const attraction of attractionsData) {
    const [lat, lon] = attraction.coordinates;
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code`;
    try {
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        if (data.current) {
          attraction.weather.temp = Math.round(data.current.temperature_2m);
          attraction.weather.humidity = Math.round(data.current.relative_humidity_2m);
          attraction.weather.windSpeed = Math.round(data.current.wind_speed_10m);
          attraction.weather.condition = mapWeatherCode(data.current.weather_code);
        }
      }
    } catch (error) {
      console.error(`Failed to fetch weather for ${attraction.name}:`, error);
    }
  }
  
  // If the side drawer is open, update its stats live
  if (currentSelectedAttractionId) {
    updateDrawerLiveValues(currentSelectedAttractionId);
  }
}

// (Palestine label overlay removed - MapLibre handles country label filtering natively)

// --- Home page Gallery Lightbox Modal logic ---
window.openLightbox = function(imgSrc, title, desc) {
  const modal = document.getElementById("gallery-lightbox");
  const img = document.getElementById("lightbox-img");
  const titleEl = document.getElementById("lightbox-title");
  const descEl = document.getElementById("lightbox-desc");
  
  if (modal && img && titleEl && descEl) {
    img.src = imgSrc;
    titleEl.textContent = title;
    descEl.textContent = desc;
    modal.style.display = "flex";
    document.body.style.overflow = "hidden"; // disable background scrolling
  }
};

window.closeLightbox = function() {
  const modal = document.getElementById("gallery-lightbox");
  if (modal) {
    modal.style.display = "none";
    document.body.style.overflow = ""; // restore scrolling
  }
};
