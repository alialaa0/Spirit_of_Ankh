# -*- coding: utf-8 -*-
"""
weather_engine.py
Spirit of Ankh - Weather Engine

FIX: Handles all API errors gracefully
FIX: Never crashes even with wrong/missing key
"""

import requests

from config import (
    OPENWEATHER_API_KEY,
    DEFAULT_TEMPERATURE,
    DEFAULT_HUMIDITY,
    DEFAULT_CONDITION,
    TEMPERATURE_FACTORS,
    WEATHER_CONDITION_FACTORS
)

DEFAULT_WEATHER = {
    "temperature_c":     DEFAULT_TEMPERATURE,
    "humidity":          DEFAULT_HUMIDITY,
    "weather_condition": DEFAULT_CONDITION
}


# ==========================================
# NORMALIZE WEATHER CONDITION
# ==========================================

def normalize_weather_condition(condition):

    mapping = {
        "Clear":       "Clear",
        "Clouds":      "Cloudy",
        "Mist":        "Cloudy",
        "Fog":         "Cloudy",
        "Haze":        "Cloudy",
        "Smoke":       "Cloudy",
        "Dust":        "Cloudy",
        "Sand":        "Cloudy",
        "Drizzle":     "Rain",
        "Rain":        "Rain",
        "Thunderstorm":"Storm",
        "Squall":      "Windy",
        "Tornado":     "Storm"
    }

    return mapping.get(condition, "Clear")


# ==========================================
# TEMPERATURE FACTOR
# ==========================================

def get_temperature_factor(temp):

    if 20 <= temp <= 30:
        return TEMPERATURE_FACTORS["ideal"]
    elif 30 < temp <= 35:
        return TEMPERATURE_FACTORS["warm"]
    elif 35 < temp <= 40:
        return TEMPERATURE_FACTORS["hot"]

    return TEMPERATURE_FACTORS["extreme"]


# ==========================================
# WEATHER FACTOR
# ==========================================

def get_weather_factor(weather):

    temp_factor = get_temperature_factor(
        weather["temperature_c"]
    )

    condition_factor = WEATHER_CONDITION_FACTORS.get(
        weather["weather_condition"], 1.0
    )

    return round(temp_factor * condition_factor, 2)


# ==========================================
# GET WEATHER FOR ONE CITY
# FIX: All error cases handled
# ==========================================

def get_city_weather(lat, lon):

    # FIX 1: No API key → return defaults immediately
    if not OPENWEATHER_API_KEY:
        return DEFAULT_WEATHER.copy()

    url = (
        "https://api.openweathermap.org/data/2.5/weather"
        f"?lat={lat}&lon={lon}"
        f"&appid={OPENWEATHER_API_KEY}"
        f"&units=metric"
    )

    try:
        response = requests.get(url, timeout=10)

        # FIX 2: Wrong API key
        if response.status_code == 401:
            print(
                f"[Weather] Invalid API key → using defaults"
            )
            return DEFAULT_WEATHER.copy()

        # FIX 3: Rate limit
        if response.status_code == 429:
            print(
                f"[Weather] Rate limit → using defaults"
            )
            return DEFAULT_WEATHER.copy()

        response.raise_for_status()

        data = response.json()

        return {
            "temperature_c":
                round(data["main"]["temp"], 2),
            "humidity":
                data["main"]["humidity"],
            "weather_condition":
                normalize_weather_condition(
                    data["weather"][0]["main"]
                )
        }

    except requests.exceptions.ConnectionError:
        print(f"[Weather] No internet → using defaults")
        return DEFAULT_WEATHER.copy()

    except requests.exceptions.Timeout:
        print(f"[Weather] Timeout → using defaults")
        return DEFAULT_WEATHER.copy()

    except Exception as e:
        print(f"[Weather] Error: {e} → using defaults")
        return DEFAULT_WEATHER.copy()


# ==========================================
# GET WEATHER FOR ALL CITIES
# ==========================================

def get_all_cities_weather(city_reference):

    weather_data = {}

    for city, coords in city_reference.items():

        lat, lon = coords

        weather_data[city] = get_city_weather(lat, lon)

        print(
            f"  [{city}] "
            f"Temp: {weather_data[city]['temperature_c']}°C | "
            f"Condition: {weather_data[city]['weather_condition']}"
        )

    return weather_data
