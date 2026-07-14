# Spirit of Ankh — Crowd Alert Chatbot

A lightweight AI-powered feature that checks real-time crowd data for Egyptian tourist attractions and recommends a quieter alternative, phrased naturally using an LLM.

## How It Works

1. The frontend sends the name of a selected/viewed attraction to this API.
2. The backend queries live crowd data from Snowflake (`VW_CURRENT_STATUS`, Gold layer).
3. If the location is crowded (MEDIUM/HIGH), the backend finds the least-crowded alternative — same city first, any city if none is found there.
4. Groq (Llama 3.3 70B) is used **only** to phrase the result into a natural, friendly sentence — it does not decide the recommendation itself. All crowd logic and alternative selection is deterministic Python/SQL.

This is a RAG-style architecture (Retrieval-Augmented Generation): retrieval is real data from Snowflake, generation is natural-language phrasing only. The LLM's role is strictly limited to presentation, not decision-making.

## Tech Stack

- **FastAPI** — API framework
- **Snowflake** — live crowd data source (Gold layer views), same warehouse used by the project's Power BI dashboards
- **Groq (Llama 3.3 70B)** — natural language phrasing
- **ngrok** — public tunnel used for local testing and live demos

## Folder Structure

```
chatbot/
├── main.py            # Full backend: Snowflake queries + Groq call + API endpoint
├── requirements.txt   # Python dependencies
├── .env.example        # Template for required environment variables (no real secrets)
├── .gitignore
└── README.md
```

## Setup

1. Create a virtual environment and activate it:
   ```
   python -m venv venv
   venv\Scripts\activate      # Windows
   ```

2. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

3. Copy `.env.example` to `.env` and fill in real credentials:
   ```
   SNOWFLAKE_ACCOUNT=...
   SNOWFLAKE_USER=...
   SNOWFLAKE_PASSWORD=...
   SNOWFLAKE_WAREHOUSE=...
   SNOWFLAKE_DATABASE=...
   SNOWFLAKE_SCHEMA=...
   GROQ_API_KEY=...
   ```

4. Run the server:
   ```
   uvicorn main:app --reload
   ```

5. Test locally at `http://127.0.0.1:8000/docs`

## API Reference

### `POST /check-location`

**Request body:**
```json
{ "location_name": "Naama Bay" }
```

**Response — crowded:**
```json
{
  "crowded": true,
  "overcrowded_place": "Naama Bay",
  "suggested_alternative": "Sharks Bay",
  "message": "If you're looking for some peace and quiet, head over to Sharks Bay, it's basically empty right now!"
}
```

**Response — not crowded:**
```json
{
  "crowded": false,
  "message": "You've really lucked out with the timing, it's peaceful here — take your time and soak it all in!"
}
```

**Response — location not found:**
```json
{ "crowded": false, "message": "Location not found." }
```

## Frontend Integration

```javascript
async function checkIfCrowded(locationName) {
  const response = await fetch("YOUR_API_URL_HERE/check-location", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ location_name: locationName })
  });
  const data = await response.json();
  showPopup(data.message); // display however the UI shows notifications
}
```

Call `checkIfCrowded("exact place name")` whenever a tourist selects or views a location on the site.

## Public Access (Demo / Local Testing)

For frontend integration and live demos without deploying to a server, this API is tunneled publicly using [ngrok](https://ngrok.com):
```
ngrok http 8000
```
This generates a temporary public HTTPS URL that forwards to the local server. The URL changes on every restart of ngrok (free tier), so it must be refreshed and shared before each demo session.

## Design Notes

- Crowd status and alternative selection are read from the same Gold-layer Snowflake views used by the project's Power BI dashboards — no separate or duplicated data source.
- The LLM prompt explicitly restricts the model to only the facts provided in the prompt, preventing invented crowd data or fabricated alternatives.
- Alternative selection currently uses lowest live occupancy percentage within the same city (falling back to any city) rather than precise GPS distance — a scoping decision made for a one-day build; real-distance ranking (via the existing latitude/longitude columns) is a natural next enhancement.
