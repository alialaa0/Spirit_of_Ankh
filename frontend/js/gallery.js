// =============================================================================
// Spirit of Ankh — js/gallery.js
// -----------------------------------------------------------------------------
// PURPOSE: Home page featured attractions grid and lightbox image modal.
//          - Renders 3 hand-picked highlight cards on the hero section.
//          - Controls the full-screen photo lightbox (open / close).
// DEPENDS: data/attractions.data.js (reads attractionsData)
//          router.js (calls switchView via navigateToAttraction)
//          drawer.js (calls openDetails)
// =============================================================================

// ── Featured Attractions Grid (Home Page) ─────────────────────────────────────
// Populates the 3 feature cards shown on the Home hero section.
function initFeaturedGrid() {
  const grid = document.getElementById("featured-attractions-grid");
  if (!grid) return;

  // Pick 3 iconic top-rated destinations to spotlight on the homepage
  const featured = attractionsData
    .filter(a => ["giza-pyramids", "grand-egyptian-museum", "valley-of-the-kings"].includes(a.id))
    .slice(0, 3);

  grid.innerHTML = featured.map(attraction => `
    <div class="featured-card glass-panel"
         onclick="navigateToAttraction('${attraction.id}')"
         style="background-image: linear-gradient(to bottom, rgba(7, 11, 25, 0.4), rgba(7, 11, 25, 0.95)), url('${attraction.image}');
                background-size: cover; background-position: center;
                border: 1px solid rgba(212, 175, 55, 0.35);">
      <div>
        <span class="featured-card-tag" style="background: var(--color-gold); color: var(--color-sky-dark);">
          ${attraction.category}
        </span>
        <h3 style="margin-top: 10px; text-shadow: 0 2px 4px rgba(0,0,0,0.8);">${attraction.name}</h3>
        <p style="font-size: 0.85rem; color: var(--color-sandstone); margin-top: 5px; text-shadow: 0 1px 2px rgba(0,0,0,0.8);">
          ${attraction.city}, ${attraction.governorate}
        </p>
        <p style="font-size: 0.9rem; color: #fff; margin-top: 12px; line-height: 1.5;
                  display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical;
                  overflow: hidden; text-shadow: 0 1px 2px rgba(0,0,0,0.8);">
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
  `).join("");
}

// ── Navigation Helper ─────────────────────────────────────────────────────────
// Switches to the Map view and opens the detail drawer for the given attraction.
window.navigateToAttraction = function(id) {
  switchView("map");
  setTimeout(() => { openDetails(id); }, 200);
};

// ── Lightbox Modal ────────────────────────────────────────────────────────────
// Opens a full-screen photo lightbox with title and description overlay.
window.openLightbox = function(imgSrc, title, desc) {
  const modal   = document.getElementById("gallery-lightbox");
  const img     = document.getElementById("lightbox-img");
  const titleEl = document.getElementById("lightbox-title");
  const descEl  = document.getElementById("lightbox-desc");

  if (modal && img && titleEl && descEl) {
    img.src = imgSrc;
    titleEl.textContent = title;
    descEl.textContent  = desc;
    modal.style.display = "flex";
    document.body.style.overflow = "hidden"; // prevent background scrolling
  }
};

// Closes the lightbox and restores page scrolling.
window.closeLightbox = function() {
  const modal = document.getElementById("gallery-lightbox");
  if (modal) {
    modal.style.display = "none";
    document.body.style.overflow = "";
  }
};
