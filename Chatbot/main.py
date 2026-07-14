import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import snowflake.connector
from groq import Groq
from dotenv import load_dotenv

load_dotenv()
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))


class LocationCheck(BaseModel):
    location_name: str  # e.g. "Naama Bay"


def get_snowflake_connection():
    return snowflake.connector.connect(
        account=os.getenv("SNOWFLAKE_ACCOUNT"),
        user=os.getenv("SNOWFLAKE_USER"),
        password=os.getenv("SNOWFLAKE_PASSWORD"),
        warehouse=os.getenv("SNOWFLAKE_WAREHOUSE"),
        database=os.getenv("SNOWFLAKE_DATABASE"),
        schema=os.getenv("SNOWFLAKE_SCHEMA"),
    )


def get_place(location_name: str):
    """Look up live crowd status for the selected location."""
    conn = get_snowflake_connection()
    cursor = conn.cursor()
    cursor.execute(
        """
        SELECT LOCATION_NAME, CITY, CROWD_STATUS, OCCUPANCY_PCT
        FROM VW_CURRENT_STATUS
        WHERE LOCATION_NAME = %s
        """,
        (location_name,),
    )
    columns = [col[0] for col in cursor.description]
    row = cursor.fetchone()
    cursor.close()
    conn.close()
    return dict(zip(columns, row)) if row else None


def find_alternative(city: str, exclude_name: str):
    """Find the least-crowded alternative, same city first, then any city."""
    conn = get_snowflake_connection()
    cursor = conn.cursor()

    cursor.execute(
        """
        SELECT LOCATION_NAME, CITY, OCCUPANCY_PCT
        FROM VW_CURRENT_STATUS
        WHERE CITY = %s AND LOCATION_NAME != %s AND CROWD_STATUS = 'LOW'
        ORDER BY OCCUPANCY_PCT ASC
        LIMIT 1
        """,
        (city, exclude_name),
    )
    columns = [col[0] for col in cursor.description]
    row = cursor.fetchone()

    if not row:
        cursor.execute(
            """
            SELECT LOCATION_NAME, CITY, OCCUPANCY_PCT
            FROM VW_CURRENT_STATUS
            WHERE LOCATION_NAME != %s AND CROWD_STATUS = 'LOW'
            ORDER BY OCCUPANCY_PCT ASC
            LIMIT 1
            """,
            (exclude_name,),
        )
        columns = [col[0] for col in cursor.description]
        row = cursor.fetchone()

    cursor.close()
    conn.close()
    return dict(zip(columns, row)) if row else None


def ask_groq(prompt: str):
    """The LLM's only job: phrase an already-decided fact into a natural sentence."""
    response = groq_client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
        max_tokens=150,
    )
    return response.choices[0].message.content


def write_suggestion(crowded_place: dict, alternative: dict):
    same_city = crowded_place["CITY"] == alternative["CITY"]
    location_note = f"in {alternative['CITY']}" if not same_city else "nearby"

    prompt = f"""You're a friendly local Egyptian tour guide talking casually to a tourist.

Right now: {crowded_place['LOCATION_NAME']} is pretty packed ({crowded_place['OCCUPANCY_PCT']}% full).

A quieter option {location_note}: {alternative['LOCATION_NAME']}
(only {alternative['OCCUPANCY_PCT']}% full)

Write ONE short, warm, casual sentence recommending the alternative, like a friend giving quick advice.
Don't invent facts beyond what's given above. Respond in English."""
    return ask_groq(prompt)


def write_all_good_message(location_name: str):
    prompt = f"""You're a friendly local Egyptian tour guide talking casually to a tourist.
The tourist is checking out {location_name}, and it's not crowded right now — it's a good time to visit.
Write ONE short, warm, casual sentence encouraging them. No data or percentages. Respond in English."""
    return ask_groq(prompt)


@app.post("/check-location")
def check_location(request: LocationCheck):
    """
    Main endpoint: the frontend calls this whenever a tourist selects/views a place.
    Returns a ready-to-display natural language message either way.
    """
    place = get_place(request.location_name)

    if not place:
        return {"crowded": False, "message": "Location not found."}

    if place["CROWD_STATUS"] not in ("HIGH", "MEDIUM"):
        message = write_all_good_message(place["LOCATION_NAME"])
        return {"crowded": False, "message": message}

    alternative = find_alternative(place["CITY"], place["LOCATION_NAME"])

    if not alternative:
        return {
            "crowded": True,
            "message": "This spot is busy right now, but no quieter alternative was found.",
        }

    suggestion = write_suggestion(place, alternative)
    return {
        "crowded": True,
        "overcrowded_place": place["LOCATION_NAME"],
        "suggested_alternative": alternative["LOCATION_NAME"],
        "message": suggestion,
    }
