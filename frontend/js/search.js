// =============================================================================
// Spirit of Ankh — js/search.js
// -----------------------------------------------------------------------------
// PURPOSE: Search bar logic and multi-criteria map filter system.
//
//          Search:   Real-time autocomplete suggestions as you type.
//                    Clicking a suggestion zooms the map and opens the drawer.
//
//          Filters:  City, Category, Crowd status, Ticket price, and
//                    four amenity checkboxes (wheelchair, parking, etc.).
//                    All filters combine with AND logic.
//                    Unmatched markers are hidden; matched markers are shown.
//
// DEPENDS: state.js (reads map, markerLayerGroup, markerMap)
//          data/attractions.data.js (reads attractionsData)
//          drawer.js (calls openDetails on suggestion click)
// =============================================================================

// ── Multi-criteria Map Filter ─────────────────────────────────────────────────
// Reads all filter controls and shows/hides markers accordingly.
// Called after any filter change, search input, or telemetry tick.
window.applyFilters = function() {
  const searchQuery    = document.getElementById("map-search-input").value.toLowerCase();
  const cityFilter     = document.getElementById("filter-city").value;
  const categoryFilter = document.getElementById("filter-category").value;
  const crowdFilter    = document.getElementById("filter-crowd").value;
  const priceFilter    = document.getElementById("filter-price").value;

  const isWheelchair  = document.getElementById("filter-wheelchair").checked;
  const isParking     = document.getElementById("filter-parking").checked;
  const isRestaurants = document.getElementById("filter-restaurants").checked;
  const isGiftshop    = document.getElementById("filter-giftshop").checked;

  attractionsData.forEach(attraction => {
    const marker = markerMap.get(attraction.id);
    if (!marker) return;

    let matches = true;

    // ── Text search (name, description, city) ─────────────────────────────
    if (searchQuery) {
      const nameMatch = attraction.name.toLowerCase().includes(searchQuery);
      const descMatch = attraction.description.toLowerCase().includes(searchQuery);
      const cityMatch = attraction.city.toLowerCase().includes(searchQuery);
      if (!nameMatch && !descMatch && !cityMatch) matches = false;
    }

    // ── City filter ───────────────────────────────────────────────────────
    if (cityFilter !== "all" && attraction.city !== cityFilter) matches = false;

    // ── Category filter ───────────────────────────────────────────────────
    if (categoryFilter !== "all" && attraction.category !== categoryFilter) matches = false;

    // ── Crowd status filter ───────────────────────────────────────────────
    if (crowdFilter !== "all") {
      const occupancy = (attraction.currentVisitors / attraction.capacity) * 100;
      let crowdStatus = "normal";
      if (occupancy > 85) crowdStatus = "overcrowded";
      else if (occupancy > 60) crowdStatus = "busy";
      if (crowdStatus !== crowdFilter) matches = false;
    }

    // ── Ticket price filter ───────────────────────────────────────────────
    if (priceFilter !== "all") {
      const priceLimit = parseInt(priceFilter);
      if (priceLimit === 0) {
        if (attraction.ticketPrice > 0) matches = false;
      } else {
        if (attraction.ticketPrice > priceLimit || attraction.ticketPrice === 0) matches = false;
      }
    }

    // ── Amenity checkboxes ────────────────────────────────────────────────
    if (isWheelchair  && !attraction.facilities.wheelchair)  matches = false;
    if (isParking     && !attraction.facilities.parking)     matches = false;
    if (isRestaurants && !attraction.facilities.restaurants) matches = false;
    if (isGiftshop    && !attraction.facilities.giftShop)    matches = false;

    // Show or hide the marker based on combined filter result
    if (matches) {
      if (!map.hasLayer(marker)) markerLayerGroup.addLayer(marker);
    } else {
      if (map.hasLayer(marker)) markerLayerGroup.removeLayer(marker);
    }
  });
};

// ── Search Autocomplete ───────────────────────────────────────────────────────
// Shows a dropdown of up to 5 suggestions matching the current query.
window.handleSearch = function(query) {
  applyFilters(); // Keep markers in sync while typing

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

// ── Suggestion Selection ──────────────────────────────────────────────────────
// Fills the search box, hides suggestions, and opens the attraction drawer.
window.selectSuggestion = function(id) {
  const attraction = attractionsData.find(a => a.id === id);
  if (!attraction) return;

  const searchInput = document.getElementById("map-search-input");
  if (searchInput) searchInput.value = attraction.name;

  const suggestionsContainer = document.getElementById("search-suggestions");
  if (suggestionsContainer) {
    suggestionsContainer.style.display = "none";
    suggestionsContainer.innerHTML = "";
  }

  applyFilters();
  openDetails(id);
};

// ── Reset All Filters ─────────────────────────────────────────────────────────
// Resets every filter control to its default state and shows all markers.
window.resetFilters = function() {
  document.getElementById("map-search-input").value = "";
  document.getElementById("filter-city").value      = "all";
  document.getElementById("filter-category").value  = "all";
  document.getElementById("filter-crowd").value     = "all";
  document.getElementById("filter-price").value     = "all";

  document.getElementById("filter-wheelchair").checked  = false;
  document.getElementById("filter-parking").checked     = false;
  document.getElementById("filter-restaurants").checked = false;
  document.getElementById("filter-giftshop").checked    = false;

  applyFilters();
};
