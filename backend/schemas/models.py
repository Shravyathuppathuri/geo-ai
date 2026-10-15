from pydantic import BaseModel, Field
from typing import List, Optional, Literal

class GPSLocationSchema(BaseModel):
    latitude: float = Field(..., ge=-90.0, le=90.0)
    longitude: float = Field(..., ge=-180.0, le=180.0)
    speed: float = Field(default=0.0, ge=0.0, le=250.0)
    accuracy: Optional[float] = None
    heading: Optional[float] = None
    timestamp: Optional[float] = None

class WeatherSchema(BaseModel):
    temperature: float
    condition: str
    precipitation: float
    visibility: float
    humidity: float
    windSpeed: float
    isLive: bool = True
    source: str
    lastUpdated: str

class TrafficSchema(BaseModel):
    congestionLevel: Literal['LOW', 'MODERATE', 'HEAVY', 'SEVERE']
    congestionPercent: float
    currentSpeedKmH: float
    freeFlowSpeedKmH: float
    delaySeconds: float
    isLive: bool = True
    source: str
    lastUpdated: str

class ValidationIssue(BaseModel):
    field: str
    message: str
    severity: Literal['warning', 'error']

class DataQualitySchema(BaseModel):
    qualityScore: int
    predictionConfidence: Literal['High', 'Medium', 'Low']
    checksPassed: int
    totalChecks: int
    issues: List[ValidationIssue] = []

class HotspotSchema(BaseModel):
    id: str
    name: str
    latitude: float
    longitude: float
    severity: Literal['Fatal', 'Serious', 'Minor']
    historicalAccidentCount: int
    radiusMeters: float
    primaryCause: str
    distanceToDriverMeters: float
    giZScore: float

class XaiFactorSchema(BaseModel):
    factor: str
    impactScore: float
    shapValue: float
    description: str
    direction: Literal['increases_risk', 'decreases_risk']
    category: Literal['Hotspot', 'Weather', 'Traffic', 'Road', 'Time']

class RiskAssessmentSchema(BaseModel):
    riskLevel: Literal['LOW', 'MEDIUM', 'HIGH']
    riskScore: float
    safetyScore: int
    confidence: Literal['High', 'Medium', 'Low']
    hotspotAhead: bool
    nearestHotspot: Optional[HotspotSchema] = None
    alertMessage: str
    speechAlert: Optional[str] = None
    saferRouteAvailable: bool
    xaiExplanation: dict

class RiskPredictionRequest(BaseModel):
    latitude: float
    longitude: float
    speed: float = 0.0

class HazardReportRequest(BaseModel):
    type: str
    latitude: float
    longitude: float
    description: Optional[str] = None
    severity: Optional[str] = "Medium"

class SosRequest(BaseModel):
    latitude: float
    longitude: float
    speed: float = 0.0
    triggerType: str = "MANUAL_SOS"
