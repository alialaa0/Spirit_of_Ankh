// =============================================================================
// Spirit of Ankh — js/attractions.js
// -----------------------------------------------------------------------------
// PURPOSE: Attractions side-panel (slide-out tab on the Map view).
//          - Populates the city filter dropdown.
//          - Handles the slide-in/out panel toggle.
//          - Renders filterable attraction cards with live crowd status dots.
// DEPENDS: data/attractions.data.js (reads attractionsData)
//          state.js (reads attractionsListCategory)
//          drawer.js (calls openDetails on card click)
// =============================================================================

// ── Category icon map ─────────────────────────────────────────────────────────
const CATEGORY_ICONS = {
  "Historical":    "🏛️",
  "Museum":        "🎨",
  "Beach":         "🏖️",
  "Desert":        "🏜️",
  "National Park": "🌳",
  "Religious":     "🕌",
  "Nature":        "🌿",
  "Adventure":     "🧗",
};

// Tracks the currently active category filter in the attractions panel
let attractionsListCategory = "all";

// ── City Dropdown ─────────────────────────────────────────────────────────────
// Fills the "Filter by City" <select> with unique city names from the data.
function initCitiesDropdown() {
  const select = document.getElementById("filter-city");
  if (!select) return;

  const cities = [...new Set(attractionsData.map(a => a.city))].sort();
  cities.forEach(city => {
    const opt = document.createElement("option");
    opt.value = city;
    opt.textContent = city;
    select.appendChild(opt);
  });
}

// ── Map Panel Toggle ──────────────────────────────────────────────────────────
// Toggles the Search or Filter side panels on the Map view.
// Closes any currently open panel before opening the requested one.
window.toggleMapPanel = function(panelId) {
  const panel = document.getElementById(panelId);
  if (!panel) return;

  const isOpen = panel.classList.contains("open");

  // Close all side panels first
  document.querySelectorAll(".map-side-panel").forEach(p => p.classList.remove("open"));
  document.querySelectorAll(".map-toggle-btn").forEach(b => b.classList.remove("active"));

  // Open the requested panel (if it wasn't already open)
  if (!isOpen) {
    panel.classList.add("open");
    const btnMap = { "search-panel": "toggle-search-btn", "filter-panel": "toggle-filter-btn" };
    const btn = document.getElementById(btnMap[panelId]);
    if (btn) btn.classList.add("active");
  }
};

// ── Attractions Tab Panel ─────────────────────────────────────────────────────
// Opens/closes the slide-in attractions list panel on the left of the map.
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

// ── Category Filter ───────────────────────────────────────────────────────────
// Filters the attractions list by category when a tab button is clicked.
window.filterAttractionsList = function(cat) {
  attractionsListCategory = cat;

  document.querySelectorAll(".att-cat-btn").forEach(b => {
    b.classList.toggle("active", b.getAttribute("data-cat") === cat);
  });

  renderAttractionCards();
};

// ── Attractions List Build & Render ──────────────────────────────────────────
// Called once on map initialization to build the full list.
function buildAttractionsList() {
  renderAttractionCards();
  const countEl = document.getElementById("attractions-count");
  if (countEl) countEl.textContent = attractionsData.length;
}

// Re-renders the visible attraction cards based on the active category filter.
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
    // Colour-coded crowd dot: green = normal, amber = busy, red = overcrowded
    let crowd = "normal";
    if (occupancy > 85) crowd = "overcrowded";
    else if (occupancy > 60) crowd = "busy";

    const icon = CATEGORY_ICONS[a.category] || "📍";

    return `
      <div class="attraction-card" onclick="openDetails('${a.id}')">
        <div class="attraction-card-icon"
             style="background-image: url('${a.image}');
                    background-size: cover; background-position: center; color: transparent;">
        </div>
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
