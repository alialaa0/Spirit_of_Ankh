// =============================================================================
// Spirit of Ankh — js/init.js
// -----------------------------------------------------------------------------
// PURPOSE: Application entry point. Loaded LAST after all other modules.
//
//          On DOMContentLoaded:
//            1. Initialises the sticky navbar scroll effect
//            2. Registers the SPA router
//            3. Builds the home page featured grid
//            4. Populates the cities filter dropdown
//            5. Initialises the Leaflet map and all markers
//            6. Initialises the dashboard charts
//            7. Loads ML predictions (live API or offline fallback)
//            8. Wires up search keyboard shortcuts and outside-click dismiss
//            9. Starts the 4-second telemetry simulation loop
//           10. Fetches live weather and schedules 5-minute refresh
//
// DEPENDS: All other js/ modules must be loaded before this file.
// =============================================================================

document.addEventListener("DOMContentLoaded", () => {

  // ── Sticky Navbar ──────────────────────────────────────────────────────────
  // Adds a "scrolled" class to the header so it gains a solid background
  // after the user scrolls more than 50px down the page.
  const header = document.getElementById("header");
  window.addEventListener("scroll", () => {
    header.classList.toggle("scrolled", window.scrollY > 50);
  });

  // ── SPA Routing ────────────────────────────────────────────────────────────
  initRouting();

  // ── Home Page ──────────────────────────────────────────────────────────────
  initFeaturedGrid();

  // ── Map Setup ──────────────────────────────────────────────────────────────
  initCitiesDropdown();
  initMap();

  // ── Dashboard ──────────────────────────────────────────────────────────────
  initDashboard();

  // ── ML Predictions (async — live API with offline fallback) ───────────────
  loadPredictionsAndInsights();

  // ── Search Bar Keyboard & Outside-click Behaviour ─────────────────────────
  const searchInput = document.getElementById("map-search-input");
  if (searchInput) {
    // Press Enter → select first visible suggestion
    searchInput.addEventListener("keydown", e => {
      if (e.key === "Enter") {
        const firstSuggestion = document
          .getElementById("search-suggestions")
          ?.querySelector(".suggestion-item");
        if (firstSuggestion) firstSuggestion.click();
      }
    });

    // Click anywhere outside the search box → close suggestions dropdown
    document.addEventListener("click", e => {
      if (!e.target.closest(".search-box")) {
        const suggestionsContainer = document.getElementById("search-suggestions");
        if (suggestionsContainer) suggestionsContainer.style.display = "none";
      }
    });
  }

  // ── Live Telemetry Loop (every 4 seconds) ─────────────────────────────────
  setInterval(simulateTelemetryTick, 4000);

  // ── Real Weather Fetch (on load + every 5 minutes) ────────────────────────
  fetchRealWeatherForAttractions();
  setInterval(fetchRealWeatherForAttractions, 5 * 60 * 1000);
});
