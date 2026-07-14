// =============================================================================
// Spirit of Ankh — js/weather.js
// -----------------------------------------------------------------------------
// PURPOSE: Fetches real live weather data for every attraction from the
//          Open-Meteo free API (no API key required) using each attraction's
//          GPS coordinates.
//
//          Updates each attraction's .weather object in-place so that the
//          detail drawer and telemetry simulator always show current conditions.
//
//          Called once on page load, then every 5 minutes automatically.
//
// DEPENDS: data/attractions.data.js (reads/writes attractionsData[*].weather)
//          state.js (reads currentSelectedAttractionId)
//          drawer.js (calls updateDrawerLiveValues to refresh open drawer)
// =============================================================================

// ── WMO Weather Code → Human-Readable Label ───────────────────────────────────
// The Open-Meteo API returns numeric WMO codes. This maps them to plain English.
function mapWeatherCode(code) {
  if (code === 0)                              return "Clear";
  if ([1, 2, 3].includes(code))               return "Partly Cloudy";
  if ([45, 48].includes(code))                return "Foggy";
  if ([51, 53, 55, 61, 63, 65,
       80, 81, 82].includes(code))            return "Rainy";
  if ([71, 73, 75, 77, 85, 86].includes(code)) return "Snowy";
  if ([95, 96, 99].includes(code))             return "Thunderstorm";
  return "Sunny";
}

// ── Fetch Weather for All Attractions ────────────────────────────────────────
// Iterates through every attraction and fetches current temperature, humidity,
// wind speed, and weather condition from the Open-Meteo API.
// Sequential fetching avoids hammering the API with 45 concurrent requests.
async function fetchRealWeatherForAttractions() {
  console.log("Spirit of Ankh: Fetching live weather from Open-Meteo API...");

  for (const attraction of attractionsData) {
    const [lat, lon] = attraction.coordinates;
    const url = `https://api.open-meteo.com/v1/forecast`
      + `?latitude=${lat}&longitude=${lon}`
      + `&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code`;

    try {
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        if (data.current) {
          attraction.weather.temp       = Math.round(data.current.temperature_2m);
          attraction.weather.humidity   = Math.round(data.current.relative_humidity_2m);
          attraction.weather.windSpeed  = Math.round(data.current.wind_speed_10m);
          attraction.weather.condition  = mapWeatherCode(data.current.weather_code);
        }
      }
    } catch (error) {
      // Non-fatal: weather will retain its default/previously fetched values
      console.error(`Spirit of Ankh: Weather fetch failed for ${attraction.name}:`, error);
    }
  }

  // If the detail drawer is open, update its weather display immediately
  if (currentSelectedAttractionId) {
    updateDrawerLiveValues(currentSelectedAttractionId);
  }
}
