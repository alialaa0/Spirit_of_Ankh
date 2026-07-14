// =============================================================================
// Spirit of Ankh — js/state.js
// -----------------------------------------------------------------------------
// PURPOSE: Global application state — all shared variables used across modules.
//          Every other module reads from or writes to these variables.
//          Loaded FIRST before any other module.
// =============================================================================

// ── Map instance (Leaflet) ────────────────────────────────────────────────────
let map;
let markerLayerGroup; // Layer group that holds all attraction markers
const markerMap = new Map(); // attraction.id → Leaflet marker instance
let currentSelectedAttractionId = null; // ID of currently open detail drawer

// ── Chart.js instances (kept globally to allow live updates) ──────────────────
let regionalChartInstance = null;
let categoryChartInstance = null;
let drawerForecastChartInstance = null;

// ── ML Predictions state ──────────────────────────────────────────────────────
let predictionsData = null;  // Hourly occupancy predictions keyed by attraction ID
let insightsData = null;     // Structured insight objects (overcrowded, best hours)
let activeDashboardMode = 'live'; // 'live' (real-time) | 'predictions' (ML forecast)

// ── Map theming state ─────────────────────────────────────────────────────────
let currentMapTheme = null;  // 'light' | 'dark' — tracks last applied theme
let mapTileLayer = null;     // Current CartoDB tile layer instance
let egyptLabelMarker = null; // Custom "EGYPT" text overlay marker
