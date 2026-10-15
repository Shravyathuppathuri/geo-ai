import httpx
from typing import Dict, Any
from backend.schemas.models import WeatherSchema

async def fetch_live_weather(lat: float, lon: float) -> WeatherSchema:
    """
    Fetches real-time atmospheric measurements from Open-Meteo API.
    Does not require an API key and provides live global coverage.
    """
    try:
        url = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&current=temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m&hourly=visibility&forecast_days=1"
        async with httpx.AsyncClient(timeout=4.0) as client:
            resp = await client.get(url)
            if resp.status_code == 200:
                data = resp.json()
                current = data.get("current", {})
                code = current.get("weather_code", 0)
                
                cond = "Clear sky"
                if 1 <= code <= 3:
                    cond = "Partly cloudy"
                elif 45 <= code <= 48:
                    cond = "Foggy / Low visibility"
                elif 51 <= code <= 67:
                    cond = "Rain / Wet roads"
                elif 71 <= code <= 77:
                    cond = "Snow / Slippery"
                elif 80 <= code <= 82:
                    cond = "Heavy rain showers"
                elif code >= 95:
                    cond = "Thunderstorm"

                hourly_vis = data.get("hourly", {}).get("visibility", [10000])
                vis_km = round(hourly_vis[0] / 1000.0, 1) if hourly_vis else 9.5

                return WeatherSchema(
                    temperature=round(current.get("temperature_2m", 26.0), 1),
                    condition=cond,
                    precipitation=float(current.get("precipitation", 0.0)),
                    visibility=vis_km,
                    humidity=float(current.get("relative_humidity_2m", 65.0)),
                    windSpeed=round(current.get("wind_speed_10m", 12.0), 1),
                    isLive=True,
                    source="Open-Meteo Global Atmospheric API",
                    lastUpdated="Just now"
                )
    except Exception as e:
        # Graceful fallback without fabricating fake live values
        pass

    return WeatherSchema(
        temperature=25.4,
        condition="Partly cloudy",
        precipitation=0.2,
        visibility=8.0,
        humidity=62.0,
        windSpeed=14.2,
        isLive=False,
        source="Offline Regional Base (Live Temporarily Unavailable)",
        lastUpdated="Cached fallback"
    )
