// =============================================================================
// Spirit of Ankh — js/router.js
// -----------------------------------------------------------------------------
// PURPOSE: Single-Page Application (SPA) routing.
//          Manages switching between views (Home, Map, Dashboard, About)
//          by toggling CSS classes on view sections and nav items.
// DEPENDS: state.js (uses `map` global for Leaflet invalidation)
//          dashboard.js (calls updateDashboardData on view switch)
// =============================================================================

function initRouting() {
  window.switchView = function(viewId) {
    // ── 1. Highlight the correct nav link ─────────────────────────────────────
    document.querySelectorAll(".nav-menu .nav-item").forEach(item => {
      item.classList.remove("active");
    });
    const activeNavItem = document.getElementById(`nav-${viewId}`);
    if (activeNavItem) activeNavItem.classList.add("active");

    // ── 2. Show the correct view section ──────────────────────────────────────
    document.querySelectorAll(".view-section").forEach(section => {
      section.classList.remove("active");
    });
    const activeSection = document.getElementById(`view-${viewId}`);
    if (activeSection) {
      activeSection.classList.add("active");

      // Fix Leaflet map rendering when switching to the Map view
      if (viewId === "map" && map) {
        setTimeout(() => { map.invalidateSize(); }, 150);
      }

      // Refresh dashboard charts when switching to Dashboard view
      if (viewId === "dashboard") {
        updateDashboardData();
      }
    }

    // Scroll to top smoothly on every view change
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
}
