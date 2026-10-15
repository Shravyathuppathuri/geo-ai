import {
  WeatherData,
  TrafficData,
  Hotspot,
  RiskAssessment,
  RouteOption,
  HazardReport,
  EmergencyFacility,
  ModelMetrics,
  DataQuality,
  GpsLocation,
} from '../types';

const BASE_URL = ''; // Relative path to current origin /api/*

export async function checkHealth(): Promise<{ status: string; timestamp: string }> {
  const res = await fetch(`${BASE_URL}/api/health`);
  if (!res.ok) throw new Error('Health check failed');
  return res.json();
}

export async function fetchLiveWeather(lat: number, lon: number): Promise<WeatherData> {
  const res = await fetch(`${BASE_URL}/api/weather?lat=${lat}&lon=${lon}`);
  if (!res.ok) throw new Error('Failed to fetch live weather');
  return res.json();
}

export async function fetchLiveTraffic(lat: number, lon: number): Promise<TrafficData> {
  const res = await fetch(`${BASE_URL}/api/traffic?lat=${lat}&lon=${lon}`);
  if (!res.ok) throw new Error('Failed to fetch live traffic');
  return res.json();
}

export async function fetchNearbyHotspots(lat: number, lon: number, radiusMeters = 3000): Promise<Hotspot[]> {
  const res = await fetch(`${BASE_URL}/api/hotspots/nearby?lat=${lat}&lon=${lon}&radius=${radiusMeters}`);
  if (!res.ok) throw new Error('Failed to fetch nearby hotspots');
  return res.json();
}

export interface RiskPredictionPayload {
  latitude: number;
  longitude: number;
  speed: number;
  weather?: Partial<WeatherData> | null;
  traffic?: Partial<TrafficData> | null;
}

export interface PredictionResponse {
  risk: RiskAssessment;
  quality: DataQuality;
  hotspots: Hotspot[];
  weather: WeatherData;
  traffic: TrafficData;
}

export async function evaluateRisk(payload: RiskPredictionPayload): Promise<PredictionResponse> {
  const res = await fetch(`${BASE_URL}/api/predict-risk`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to calculate risk');
  return res.json();
}

export async function fetchSaferRoutes(
  originLat: number,
  originLon: number,
  destLat?: number,
  destLon?: number,
  currentSafetyScore?: number
): Promise<{ currentRoute: RouteOption; saferRoute: RouteOption; reason: string }> {
  const safetyParam = typeof currentSafetyScore === 'number' ? `&current_safety=${currentSafetyScore}` : '';
  const url = `${BASE_URL}/api/safer-route?lat=${originLat}&lon=${originLon}${
    destLat && destLon ? `&dest_lat=${destLat}&dest_lon=${destLon}` : ''
  }${safetyParam}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to compute safer route');
  return res.json();
}

export async function submitHazardReport(payload: {
  type: string;
  latitude: number;
  longitude: number;
  description?: string;
  severity?: string;
}): Promise<HazardReport> {
  const res = await fetch(`${BASE_URL}/api/hazards/report`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to submit hazard report');
  return res.json();
}

export async function fetchHazards(lat: number, lon: number): Promise<HazardReport[]> {
  const res = await fetch(`${BASE_URL}/api/hazards?lat=${lat}&lon=${lon}`);
  if (!res.ok) throw new Error('Failed to fetch hazards');
  return res.json();
}

export async function fetchEmergencyServices(lat: number, lon: number): Promise<{
  facilities: EmergencyFacility[];
  location: GpsLocation;
}> {
  const res = await fetch(`${BASE_URL}/api/emergency/nearby?lat=${lat}&lon=${lon}`);
  if (!res.ok) throw new Error('Failed to fetch emergency services');
  return res.json();
}

export async function submitSosTrigger(payload: {
  latitude: number;
  longitude: number;
  speed: number;
  triggerType: 'MANUAL_SOS' | 'IMPACT_CONFIRMED';
}): Promise<{ status: string; referenceId: string; timestamp: string }> {
  const res = await fetch(`${BASE_URL}/api/sos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to transmit SOS');
  return res.json();
}

export async function fetchModelMetrics(): Promise<ModelMetrics> {
  const res = await fetch(`${BASE_URL}/api/analytics/model-metrics`);
  if (!res.ok) throw new Error('Failed to load model metrics');
  return res.json();
}
