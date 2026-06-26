# -*- coding: utf-8 -*-
"""
historical_weather.py
Spirit of Ankh - Historical Weather Engine

FIXES:
1. Temperature ranges corrected for Egypt
   Cairo Jan avg 18C, Jul avg 36C
   Luxor Jan avg 22C, Jul avg 43C
2. Hourly curve adjusted — Egypt nights are warm not cold
3. Added missing cities to climate profiles
"""

import random


# ==========================================================
# CITY CLIMATE PROFILES — corrected for Egypt
# Seasonal Average Temperatures (°C)
# ==========================================================

CITY_CLIMATE = {

    "Cairo": {
        "winter": 18,   # Dec-Feb avg
        "spring": 27,   # Mar-May avg
        "summer": 36,   # Jun-Aug avg
        "autumn": 28    # Sep-Nov avg
    },

    "Giza": {
        "winter": 18,
        "spring": 28,
        "summer": 37,
        "autumn": 29
    },

    "Alexandria": {
        "winter": 16,
        "spring": 23,
        "summer": 30,
        "autumn": 24
    },

    "Luxor": {
        "winter": 22,
        "spring": 34,
        "summer": 43,
        "autumn": 35
    },

    "Aswan": {
        "winter": 24,
        "spring": 36,
        "summer": 45,
        "autumn": 37
    },

    "Sharm El Sheikh": {
        "winter": 22,
        "spring": 30,
        "summer": 38,
        "autumn": 31
    },

    "Hurghada": {
        "winter": 21,
        "spring": 31,
        "summer": 37,
        "autumn": 30
    },

    "Dahab": {
        "winter": 20,
        "spring": 29,
        "summer": 35,
        "autumn": 29
    },

    "Fayoum": {
        "winter": 17,
        "spring": 28,
        "summer": 39,
        "autumn": 29
    }
}


# ==========================================================
# CITY HUMIDITY PROFILES
# ==========================================================

CITY_HUMIDITY = {
    "Cairo":          {"winter": 60, "spring": 40, "summer": 50, "autumn": 55},
    "Giza":           {"winter": 58, "spring": 38, "summer": 48, "autumn": 53},
    "Alexandria":     {"winter": 75, "spring": 65, "summer": 70, "autumn": 70},
    "Luxor":          {"winter": 35, "spring": 20, "summer": 25, "autumn": 28},
    "Aswan":          {"winter": 30, "spring": 18, "summer": 22, "autumn": 25},
    "Sharm El Sheikh":{"winter": 55, "spring": 45, "summer": 60, "autumn": 58},
    "Hurghada":       {"winter": 52, "spring": 42, "summer": 58, "autumn": 55},
    "Dahab":          {"winter": 50, "spring": 40, "summer": 55, "autumn": 52},
    "Fayoum":         {"winter": 55, "spring": 38, "summer": 45, "autumn": 50}
}


COASTAL_CITIES = ["Alexandria", "Hurghada", "Sharm El Sheikh", "Dahab"]
DESERT_CITIES  = ["Luxor", "Aswan", "Fayoum"]


# ==========================================================
# SEASON DETECTION
# ==========================================================

def get_season(month: int) -> str:

    if month in [12, 1, 2]:
        return "winter"
    elif month in [3, 4, 5]:
        return "spring"
    elif month in [6, 7, 8]:
        return "summer"
    return "autumn"


# ==========================================================
# BASE TEMPERATURE
# ==========================================================

def get_base_temperature(city: str, month: int) -> float:

    season = get_season(month)
    profile = CITY_CLIMATE.get(city, CITY_CLIMATE["Cairo"])
    return profile[season]


# ==========================================================
# BASE HUMIDITY
# ==========================================================

def get_base_humidity(city: str, month: int) -> int:

    season = get_season(month)
    profile = CITY_HUMIDITY.get(city, CITY_HUMIDITY["Cairo"])
    base = profile[season]
    noise = random.randint(-5, 5)
    return max(10, min(95, base + noise))


# ==========================================================
# FIX: HOURLY TEMPERATURE CURVE
# Egypt nights are NOT cold — even at 3AM Cairo is ~14-16°C in Jan
# Summer nights in Aswan are still 30°C+
# ==========================================================

def get_hourly_adjustment(hour: int) -> float:

    if 0 <= hour <= 5:
        return -3.0     # night — slightly cooler

    elif 6 <= hour <= 9:
        return -1.0     # morning warming up

    elif 10 <= hour <= 15:
        return 4.0      # peak heat midday

    elif 16 <= hour <= 18:
        return 2.0      # still warm afternoon

    return 0.0          # evening — near average


# ==========================================================
# TEMPERATURE GENERATOR
# ==========================================================

def generate_temperature(
    city: str,
    month: int,
    hour: int
) -> float:

    base_temp  = get_base_temperature(city, month)
    hourly_adj = get_hourly_adjustment(hour)
    noise      = random.uniform(-1.5, 1.5)

    temperature = base_temp + hourly_adj + noise

    # Egypt realistic bounds: never below 5°C, never above 50°C
    temperature = max(5.0, min(50.0, temperature))

    return round(temperature, 1)


# ==========================================================
# WEATHER CONDITION GENERATOR
# ==========================================================

def generate_weather_condition(
    city: str,
    month: int,
    temperature: float
) -> str:

    # Extreme heat
    if temperature >= 44:
        return "Hot"

    # Cold (very rare in Egypt)
    if temperature <= 10:
        return "Cold"

    # Spring sandstorms in desert cities
    if month in [3, 4, 5] and city in DESERT_CITIES:
        if random.random() < 0.08:
            return "Sandstorm"

    # Alexandria: more cloudy and rainy in winter
    if city == "Alexandria":
        if month in [11, 12, 1, 2, 3]:
            if random.random() < 0.15:
                return "Rainy"
        choices = ["Sunny", "Partly Cloudy", "Cloudy", "Windy"]
        weights = [35, 25, 30, 10]
        return random.choices(choices, weights=weights, k=1)[0]

    # Coastal cities
    if city in COASTAL_CITIES:
        choices = ["Sunny", "Clear", "Partly Cloudy", "Windy"]
        weights = [50, 20, 20, 10]
        return random.choices(choices, weights=weights, k=1)[0]

    # Desert and inland cities — mostly sunny
    choices = ["Sunny", "Clear", "Partly Cloudy", "Windy"]
    weights = [65, 20, 12, 3]
    return random.choices(choices, weights=weights, k=1)[0]


# ==========================================================
# WEATHER FACTOR
# ==========================================================

def get_weather_factor(
    temperature: float,
    weather_condition: str
) -> float:

    # Temperature factor
    if temperature > 44:
        temp_factor = 0.60
    elif temperature > 40:
        temp_factor = 0.80
    elif temperature > 35:
        temp_factor = 0.92
    elif temperature < 10:
        temp_factor = 0.75
    else:
        temp_factor = 1.00

    # Condition factor
    condition_factors = {
        "Sunny":         1.00,
        "Clear":         1.00,
        "Partly Cloudy": 0.97,
        "Cloudy":        0.93,
        "Windy":         0.90,
        "Hot":           0.70,
        "Cold":          0.80,
        "Rainy":         0.65,
        "Sandstorm":     0.40
    }

    condition_factor = condition_factors.get(
        weather_condition, 1.0
    )

    return round(temp_factor * condition_factor, 3)


# ==========================================================
# MASTER WEATHER ENGINE
# ==========================================================

def generate_weather(
    city: str,
    month: int,
    hour: int
) -> dict:

    temperature = generate_temperature(city, month, hour)

    weather_condition = generate_weather_condition(
        city, month, temperature
    )

    humidity = get_base_humidity(city, month)

    weather_factor = get_weather_factor(
        temperature, weather_condition
    )

    return {
        "temperature_c":     temperature,
        "weather_condition": weather_condition,
        "humidity":          humidity,
        "weather_factor":    weather_factor,
        "is_real_weather":   False
    }
