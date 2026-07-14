// =============================================================================
// Spirit of Ankh — js/telemetry.js
// -----------------------------------------------------------------------------
// PURPOSE: Live telemetry simulation loop.
//
//          Every 4 seconds, each attraction's currentVisitors count is nudged
//          by a random ±8% change, kept within [50, 115% of capacity].
//          This drives the "live" feel of the dashboard and map markers
//          without requiring a real IoT back-end.
//
//          After updating counts the function:
//            1. Rebuilds map markers (updates crowd-status ring colours)
//            2. Updates the open detail drawer's live stats (if any)
//            3. Refreshes the dashboard KPI cards (if dashboard is visible)
//
// DEPENDS: state.js (reads attractionsData, currentSelectedAttractionId, map,
//                    activeDashboardMode)
//          map.js (calls buildMapMarkers)
//          drawer.js (calls updateDrawerLiveValues)
//          dashboard.js (calls updateDashboardData)
// =============================================================================

function simulateTelemetryTick() {
  // ── 1. Update visitor counts ───────────────────────────────────────────────
  attractionsData.forEach(attraction => {
    const pctChange  = (Math.random() * 16 - 8) / 100; // –8% to +8%
    let newVisitors  = attraction.currentVisitors + Math.round(attraction.currentVisitors * pctChange);

    // Hard floor: at least 50 visitors at any attraction
    if (newVisitors < 50) newVisitors = 50;
    // Hard ceiling: no more than 115% of rated capacity
    if (newVisitors > attraction.capacity * 1.15) {
      newVisitors = Math.round(attraction.capacity * 1.15);
    }

    attraction.currentVisitors = newVisitors;
  });

  // ── 2. Refresh map markers ─────────────────────────────────────────────────
  if (map) {
    const currentDrawerId = currentSelectedAttractionId;
    buildMapMarkers(); // Rebuilds all markers with updated crowd-status rings

    // ── 3. Update open drawer stats in-place ────────────────────────────────
    if (currentDrawerId) {
      updateDrawerLiveValues(currentDrawerId);
    }
  }

  // ── 4. Refresh dashboard if it's the active view ──────────────────────────
  const dashSection = document.getElementById("view-dashboard");
  if (dashSection && dashSection.classList.contains("active")) {
    if (activeDashboardMode === "live") {
      updateDashboardData();
    }
  }
}
