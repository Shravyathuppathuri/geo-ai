from fastapi import APIRouter, HTTPException, Query
from typing import Optional, List
from datetime import datetime

from backend.schemas.models import (
    RiskPredictionRequest,
    HazardReportRequest,
    SosRequest,
)
from backend.services.weather_service import fetch_live_weather
from backend.services.traffic_service import fetch_live_traffic
from backend.geoai.hotspot_detection import detect_nearby_hotspots
from backend.utils.validation import validate_driver_telemetry
from backend.ml.model import evaluate_multi_hazard_risk

router = APIRouter()

# In-memory storage for hazard reports
HAZARDS_STORE = [
    {
        "id": "haz-101",
        "type": "Pothole",
        "latitude": 12.9730,
        "longitude": 77.5960,
        "timestamp": datetime.utcnow().isoformat(),
        "description": "Deep trench across center lane following drainage work",
        "severity": "High",
        "verifiedCount": 8
    },
    {
        "id": "haz-102",
        "type": "Waterlogging",
        "latitude": 12.9285,
        "longitude": 77.6210,
        "timestamp": datetime.utcnow().isoformat(),
        "description": "Standing water 15cm deep under flyover approach",
        "severity": "Medium",
        "verifiedCount": 12
    }
]

@router.get("/health")
async def get_health():
    return {
        "status": "ok",
        "system": "GeoAI Road Hazard Prediction and Driver Alert System",
        "timestamp": datetime.utcnow().isoformat(),
        "services": {
            "geoai": "active",
            "validation": "active",
            "mlModel": "ready",
            "xai": "ready"
        }
    }

@router.get("/weather")
async def get_weather(lat: float = Query(12.9716), lon: float = Query(77.5946)):
    return await fetch_live_weather(lat, lon)

@router.get("/traffic")
async def get_traffic(lat: float = Query(12.9716), lon: float = Query(77.5946)):
    return await fetch_live_traffic(lat, lon)

@router.get("/hotspots/nearby")
async def get_hotspots(lat: float = Query(12.9716), lon: float = Query(77.5946), radius: float = Query(3500.0)):
    return detect_nearby_hotspots(lat, lon, radius)

@router.post("/predict-risk")
async def predict_risk(req: RiskPredictionRequest):
    weather = await fetch_live_weather(req.latitude, req.longitude)
    traffic = await fetch_live_traffic(req.latitude, req.longitude)
    
    quality = validate_driver_telemetry({
        "latitude": req.latitude,
        "longitude": req.longitude,
        "speed": req.speed,
        "weather": weather.model_dump(),
        "traffic": traffic.model_dump()
    })

    risk = evaluate_multi_hazard_risk(
        req.latitude,
        req.longitude,
        req.speed,
        weather.model_dump(),
        traffic.model_dump()
    )
    hotspots = detect_nearby_hotspots(req.latitude, req.longitude, 4000.0)

    return {
        "risk": risk,
        "quality": quality,
        "hotspots": hotspots,
        "weather": weather,
        "traffic": traffic
    }

@router.get("/safer-route")
async def get_safer_route(
    lat: float = Query(12.9716),
    lon: float = Query(77.5946),
    dest_lat: Optional[float] = None,
    dest_lon: Optional[float] = None
):
    d_lat = dest_lat or (lat + 0.025)
    d_lon = dest_lon or (lon + 0.022)

    current_route = {
        "id": "route-current",
        "name": "Direct Central Corridor (Current)",
        "polyline": [
            [lat, lon],
            [lat + 0.007, lon + 0.006],
            [12.9174, 77.6238],
            [lat + 0.018, lon + 0.016],
            [d_lat, d_lon]
        ],
        "distanceKm": 4.8,
        "durationMinutes": 19,
        "riskScore": 74,
        "safetyScore": 26,
        "hotspotsAvoided": 0,
        "trafficDelayMinutes": 8,
        "isRecommended": False,
        "summary": "Traverses high-density accident hotspot with acute intersection merge points."
    }

    safer_route = {
        "id": "route-safer",
        "name": "Perimeter Arterial Bypass (Safer Alternative)",
        "polyline": [
            [lat, lon],
            [lat + 0.004, lon + 0.012],
            [lat + 0.012, lon + 0.024],
            [lat + 0.022, lon + 0.026],
            [d_lat, d_lon]
        ],
        "distanceKm": 5.6,
        "durationMinutes": 14,
        "riskScore": 28,
        "safetyScore": 72,
        "hotspotsAvoided": 2,
        "trafficDelayMinutes": 1,
        "isRecommended": True,
        "summary": "Bypasses Silk Board hotspot bottleneck. 62% lower accident exposure, separated grade ramps."
    }

    return {
        "currentRoute": current_route,
        "saferRoute": safer_route,
        "reason": "Current route crosses 2 high-severity accident clusters. The safer arterial bypass provides separated lane management and free-flowing speed."
    }

@router.get("/hazards")
async def list_hazards():
    return HAZARDS_STORE

@router.post("/hazards/report")
async def report_hazard(req: HazardReportRequest):
    new_hazard = {
        "id": f"haz-{int(datetime.utcnow().timestamp())}",
        "type": req.type,
        "latitude": req.latitude,
        "longitude": req.longitude,
        "timestamp": datetime.utcnow().isoformat(),
        "description": req.description or "Driver reported hazard",
        "severity": req.severity or "Medium",
        "verifiedCount": 1
    }
    HAZARDS_STORE.insert(0, new_hazard)
    return new_hazard

@router.get("/emergency/nearby")
async def get_emergency_facilities(lat: float = Query(12.9716), lon: float = Query(77.5946)):
    facilities = [
        {
            "id": "hosp-1",
            "name": "St. John’s Medical College & Emergency Trauma Center",
            "type": "Hospital",
            "distanceKm": 1.2,
            "address": "Sarjapur Main Road, Koramangala",
            "phone": "+91 80 2206 5000",
            "latitude": lat + 0.008,
            "longitude": lon + 0.006
        },
        {
            "id": "pol-1",
            "name": "Madiwala Traffic Police Division",
            "type": "Police",
            "distanceKm": 0.9,
            "address": "Hosur Main Road, Near Police Station Junction",
            "phone": "+91 80 2294 3465",
            "latitude": lat - 0.005,
            "longitude": lon + 0.003
        }
    ]
    return {
        "location": {"latitude": lat, "longitude": lon, "timestamp": datetime.utcnow().timestamp(), "speed": 0.0},
        "facilities": facilities
    }

@router.post("/sos")
async def trigger_sos(req: SosRequest):
    ref_id = f"SOS-{int(datetime.utcnow().timestamp())}"
    return {
        "status": "DISPATCH_COORDINATION_LOGGED",
        "referenceId": ref_id,
        "timestamp": datetime.utcnow().isoformat(),
        "emergencyLocation": {"latitude": req.latitude, "longitude": req.longitude},
        "instructions": "Emergency beacon registered. Keep your device steady and confirm calling nearest facility if safe to do so."
    }
