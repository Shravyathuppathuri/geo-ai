export interface GpsLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
  speed: number; // in km/h
  heading?: number;
  timestamp: number;
  isMock?: boolean;
}

export interface WeatherData {
  temperature: number; // Celsius
  condition: string;
  precipitation: number; // mm
  visibility: number; // km
  humidity: number; // %
  windSpeed: number; // km/h
  isLive: boolean;
  source: string;
  lastUpdated: string;
}

export interface TrafficData {
  congestionLevel: 'LOW' | 'MODERATE' | 'HEAVY' | 'SEVERE';
  congestionPercent: number; // 0 - 100%
  currentSpeedKmH: number;
  freeFlowSpeedKmH: number;
  delaySeconds: number;
  isLive: boolean;
  source: string;
  lastUpdated: string;
}

export interface ValidationIssue {
  field: string;
  message: string;
  severity: 'warning' | 'error';
}

export interface DataQuality {
  qualityScore: number; // 0 - 100%
  predictionConfidence: 'High' | 'Medium' | 'Low';
  checksPassed: number;
  totalChecks: number;
  issues: ValidationIssue[];
}

export interface Hotspot {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  severity: 'Fatal' | 'Serious' | 'Minor';
  historicalAccidentCount: number;
  radiusMeters: number;
  primaryCause: string;
  distanceToDriverMeters: number;
  giZScore: number; // Getis-Ord Gi* spatial significance
}

export interface XaiFactor {
  factor: string;
  impactScore: number; // e.g. +24 or -10
  shapValue: number;
  description: string;
  direction: 'increases_risk' | 'decreases_risk';
  category: 'Hotspot' | 'Weather' | 'Traffic' | 'Road' | 'Time';
}

export interface RiskAssessment {
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  riskScore: number; // 0 - 100 (Higher = dangerous)
  riskProbability: number; // 0 - 100%
  safetyScore: number; // 0 - 100 (Higher = safer)
  safetyClassification: 'Highly Risky' | 'Risky' | 'Moderate' | 'Safe' | 'Very Safe';
  detectedHazards: Array<{ name: string; severity: 'High' | 'Medium' | 'Low'; description: string }>;
  mainRiskFactors: string[];
  warningMessage: string;
  confidence: 'High' | 'Medium' | 'Low';
  hotspotAhead: boolean;
  nearestHotspot: Hotspot | null;
  alertMessage: string;
  speechAlert: string | null;
  saferRouteAvailable: boolean;
  xaiExplanation: {
    summary: string;
    factors: XaiFactor[];
    baseValue: number;
    predictedValue: number;
  };
}

export interface RoadSafetyInputs {
  latitude: number;
  longitude: number;
  weatherCondition: 'Clear' | 'Rain' | 'Heavy Rain' | 'Fog / Mist' | 'Thunderstorm';
  trafficCondition: 'Low' | 'Moderate' | 'Heavy' | 'Severe';
  roadCondition: 'Good' | 'Wet' | 'Poor' | 'Severe Damage';
  visibility: 'Normal' | 'Moderate' | 'Low';
  speed: number;
  timeOfDay: 'Day' | 'Night' | 'Peak Hours';
  roadType: 'Urban' | 'Highway' | 'Rural';
  junctionType: 'Midblock' | '4-Way Intersection' | 'T-Junction' | 'Roundabout';
}

export interface RouteOption {
  id: string;
  name: string;
  polyline: [number, number][];
  distanceKm: number;
  durationMinutes: number;
  riskScore: number;
  safetyScore: number;
  hotspotsAvoided: number;
  trafficDelayMinutes: number;
  isRecommended: boolean;
  reason?: string;
  summary: string;
}

export type HazardType = 
  | 'Pothole'
  | 'Accident'
  | 'Waterlogging'
  | 'Roadblock'
  | 'Poor visibility'
  | 'Road damage'
  | 'Other';

export interface HazardReport {
  id: string;
  type: HazardType;
  latitude: number;
  longitude: number;
  timestamp: string;
  description?: string;
  severity: 'Low' | 'Medium' | 'High';
  verifiedCount?: number;
}

export interface EmergencyFacility {
  id: string;
  name: string;
  type: 'Hospital' | 'Police' | 'Ambulance' | 'Fire';
  distanceKm: number;
  address: string;
  phone: string;
  latitude: number;
  longitude: number;
}

export interface EmergencyContact {
  id: string;
  name: string;
  role: string;
  phone: string;
}

export interface ModelMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  confusionMatrix: number[][];
  classWise: {
    Low: { precision: number; recall: number; f1: number };
    Medium: { precision: number; recall: number; f1: number };
    High: { precision: number; recall: number; f1: number };
  };
  totalHistoricalRecords: number;
  hotspotsDetected: number;
}
