// =============================================================================
// Spirit of Ankh — js/chatbot.js
// -----------------------------------------------------------------------------
// PURPOSE: Handles the dynamic AI crowd assistant alerts.
//          Queries the remote chatbot API to get real-time suggestions and
//          displays them in a slide-up toast notification at the bottom left.
// =============================================================================

// Active Ngrok URL provided by the user's friend (updates periodically)
const CHATBOT_API_URL = "https://verbose-decode-pull.ngrok-free.dev/check-location";

// Timer to automatically dismiss the toast popup after some time
let chatbotToastTimeout = null;

// ── Check Location Crowd Level ────────────────────────────────────────────────
// Triggers whenever a place is clicked on the map or panel.
// Sends a POST request with the attraction name to the chatbot API.
async function checkIfCrowded(locationName) {
  console.log(`Spirit of Ankh: Querying AI chatbot for ${locationName}...`);

  try {
    const response = await fetch(CHATBOT_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ location_name: locationName })
    });

    if (response.ok) {
      const data = await response.json();
      if (data && data.message) {
        showChatbotToast(data.message);
        return;
      }
    }
    throw new Error("API response error");
  } catch (error) {
    console.warn("Spirit of Ankh: Chatbot API is offline. Using local simulation fallback...", error);
    
    // Fallback: Generate simulation message based on actual live occupancy data
    const attraction = attractionsData.find(a => a.name === locationName);
    if (attraction) {
      const occupancy = (attraction.currentVisitors / attraction.capacity) * 100;
      if (occupancy > 60) {
        const alt = attraction.nearby && attraction.nearby.length > 0 ? attraction.nearby[0] : "a nearby peaceful area";
        showChatbotToast(`[Offline Sandbox] AI Guide: ${locationName} is feeling a bit crowded right now. If you want a more relaxed atmosphere, consider visiting ${alt}!`);
      } else {
        showChatbotToast(`[Offline Sandbox] AI Guide: Excellent timing! ${locationName} has normal crowd levels right now. Take your time to explore!`);
      }
    }
  }
}

// ── Show Chatbot Toast Notification ──────────────────────────────────────────
// Shows the custom slide-up popup alert container at the bottom left.
function showChatbotToast(message) {
  const toast = document.getElementById("chatbot-toast");
  const msgEl = document.getElementById("chatbot-toast-message");

  if (!toast || !msgEl) return;

  // Clear any existing dismiss timer
  if (chatbotToastTimeout) {
    clearTimeout(chatbotToastTimeout);
  }

  // Set message text and slide toast up
  msgEl.textContent = message;
  toast.classList.remove("hidden");

  // Automatically hide the notification after 10 seconds of inactivity
  chatbotToastTimeout = setTimeout(() => {
    closeChatbotToast();
  }, 10000);
}

// ── Close Chatbot Toast Notification ─────────────────────────────────────────
window.closeChatbotToast = function() {
  const toast = document.getElementById("chatbot-toast");
  if (toast) {
    toast.classList.add("hidden");
  }
  if (chatbotToastTimeout) {
    clearTimeout(chatbotToastTimeout);
    chatbotToastTimeout = null;
  }
};
