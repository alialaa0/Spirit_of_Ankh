// =============================================================================
// Spirit of Ankh — js/map.js
// -----------------------------------------------------------------------------
// PURPOSE: Leaflet map initialization, custom marker generation, and
//          automatic day/night tile theme switching.
//
//          Day theme  (06:00–19:59) → CartoDB Voyager (light, warm)
//          Night theme (20:00–05:59) → CartoDB Dark (dark, gold accents)
//
//          The map is bounded to Egypt's geographic extents so users
//          cannot pan outside the country.
//
// DEPENDS: state.js (writes map, markerLayerGroup, markerMap, mapTileLayer,
//                    currentMapTheme, egyptLabelMarker)
//          data/attractions.data.js (reads attractionsData)
//          attractions.js (calls buildAttractionsList)
//          search.js (calls applyFilters)
//          drawer.js (calls openDetails on marker click)
// =============================================================================

// ── Time-based Theme Detection ────────────────────────────────────────────────
// Returns 'light' between 06:00 and 19:59, 'dark' otherwise.
function getMapTheme() {
  const hour = new Date().getHours();
  return (hour >= 6 && hour < 20) ? "light" : "dark";
}

// Swaps the CartoDB tile layer and the Egypt country label to match the theme.
function applyMapTheme(theme) {
  if (theme === currentMapTheme) return; // Nothing to do if theme hasn't changed
  currentMapTheme = theme;

  const isDark = theme === "dark";

  const tileUrl = isDark
    ? "https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png"
    : "https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png";

  const labelColor  = isDark ? "rgba(212, 175, 55, 0.55)" : "rgba(120, 80, 0, 0.45)";
  const labelShadow = isDark
    ? "0 0 12px rgba(212, 175, 55, 0.25)"
    : "0 1px 3px rgba(255,255,255,0.6), 0 0 8px rgba(120,80,0,0.15)";

  // Replace the tile layer
  if (mapTileLayer) map.removeLayer(mapTileLayer);
  mapTileLayer = L.tileLayer(tileUrl, {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 20
  });
  mapTileLayer.addTo(map);
  mapTileLayer.bringToBack(); // Markers must stay on top

  // Replace the "EGYPT" country label overlay
  if (egyptLabelMarker) map.removeLayer(egyptLabelMarker);
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

// ── Map Initialization ────────────────────────────────────────────────────────
// Creates the Leaflet map, sets Egypt bounds, adds zoom control, applies
// the current time-based theme, and builds all attraction markers.
function initMap() {
  const mapElement = document.getElementById("map");
  if (!mapElement) return;

  // Hard bounding box — prevents panning outside Egypt
  const egyptBounds = L.latLngBounds(
    [20.5, 23.5],  // South-West corner (below Aswan, left of Libya border)
    [32.5, 37.5]   // North-East corner (Mediterranean coast, right of Sinai)
  );

  map = L.map("map", {
    zoomControl: false,
    minZoom: 6,
    maxBounds: egyptBounds,
    maxBoundsViscosity: 1.0 // Map snaps back instantly when dragged to boundary
  }).setView([26.8, 30.8], 6);

  // Custom zoom control placed bottom-right for a cleaner layout
  L.control.zoom({ position: "bottomright" }).addTo(map);

  // Apply correct light/dark theme for the current time
  applyMapTheme(getMapTheme());

  markerLayerGroup = L.layerGroup().addTo(map);

  // Auto-switch theme every 60 seconds (catches dawn at 06:00, dusk at 20:00)
  setInterval(() => { applyMapTheme(getMapTheme()); }, 60 * 1000);

  buildMapMarkers();
}

// ── Marker Generation ─────────────────────────────────────────────────────────
// Clears and rebuilds all attraction markers on the map.
// Each marker has:
//   - A coloured ring indicating crowd status (green / amber / red)
//   - A tooltip on hover showing name, city, and current occupancy %
//   - A click handler that opens the detail drawer
function buildMapMarkers() {
  markerLayerGroup.clearLayers();
  markerMap.clear();

  attractionsData.forEach(attraction => {
    const occupancy = (attraction.currentVisitors / attraction.capacity) * 100;
    let crowdStatus = "normal";
    if (occupancy > 85) crowdStatus = "overcrowded";
    else if (occupancy > 60) crowdStatus = "busy";

    // Custom circular marker with a status-coloured centre glow
    const customIcon = L.divIcon({
      html: `<div class="custom-map-marker" id="marker-${attraction.id}">
               <div class="marker-inner ${crowdStatus}"></div>
             </div>`,
      className: "",
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });

    const marker = L.marker(attraction.coordinates, { icon: customIcon });

    // Hover tooltip
    marker.bindTooltip(`
      <div style="font-family: 'Montserrat', sans-serif; padding: 2px;">
        <h4 style="font-family: 'Cinzel', serif; color: var(--color-gold); font-size: 0.85rem; margin-bottom: 2px;">${attraction.name}</h4>
        <span style="font-size: 0.75rem; color: #aaa;">${attraction.city} • Occupancy: ${Math.round(occupancy)}%</span>
      </div>
    `, { direction: "top", offset: [0, -10], opacity: 0.95 });

    // Click opens detail drawer
    marker.on("click", () => { openDetails(attraction.id); });

    markerLayerGroup.addLayer(marker);
    markerMap.set(attraction.id, marker);
  });

  // Sync visible markers with active filter state
  applyFilters();
  // Rebuild the attractions list panel cards
  buildAttractionsList();
}
