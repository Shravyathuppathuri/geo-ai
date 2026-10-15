import React, { useState, useEffect, useCallback } from 'react';
import {
  GpsLocation,
  WeatherData,
  TrafficData,
  DataQuality,
  Hotspot,
  RiskAssessment,
  RouteOption,
  HazardReport,
  HazardType,
  RoadSafetyInputs,
} from './types';
import { evaluateRisk, fetchSaferRoutes, submitHazardReport, fetchHazards } from './services/api';
import { voiceManager } from './services/voice';
import { RoadInputForm } from './components/RoadInputForm';
import { RoadSafetyAnalysisCard } from './components/RoadSafetyAnalysisCard';
import { VisualRiskWarningBanner } from './components/VisualRiskWarningBanner';
import { LiveMap } from './components/LiveMap';
import { XaiModal } from './components/XaiModal';
import { SaferRouteModal } from './components/SaferRouteModal';
import { HazardReportModal } from './components/HazardReportModal';
import { SosModal } from './components/SosModal';
import {
  Compass,
  Volume2,
  VolumeX,
  PhoneCall,
  AlertTriangle,
  Route,
  MapPin,
  Sparkles,
  SlidersHorizontal,
  Map as MapIcon,
} from 'lucide-react';

const DEFAULT_NORMAL_INPUTS: RoadSafetyInputs = {
  latitude: 17.4100,
  longitude: 78.4900,
  weatherCondition: 'Clear',
  trafficCondition: 'Low',
  roadCondition: 'Good',
  visibility: 'Normal',
  speed: 38,
  timeOfDay: 'Day',
  roadType: 'Urban',
  junctionType: 'Midblock',
};

export default function App() {
  // Manual Telemetry Inputs State (Defaults to normal baseline driving conditions)
  const [inputs, setInputs] = useState<RoadSafetyInputs>(DEFAULT_NORMAL_INPUTS);

  const [isLoading, setIsLoading] = useState(false);

  // System State
  const [location, setLocation] = useState<GpsLocation | null>({
    latitude: 17.4100,
    longitude: 78.4900,
    speed: 38,
    heading: 90,
    timestamp: Date.now(),
  });
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [traffic, setTraffic] = useState<TrafficData | null>(null);
  const [quality, setQuality] = useState<DataQuality | null>(null);
  const [hotspots, setHotspots] = useState<Hotspot[]>([]);
  const [hazards, setHazards] = useState<HazardReport[]>([]);
  const [risk, setRisk] = useState<RiskAssessment | null>(null);

  // Routing State
  const [currentRoute, setCurrentRoute] = useState<RouteOption | null>({
    id: 'route-current',
    name: 'Direct Central Corridor (Current)',
    polyline: [
      [17.4100, 78.4900],
      [17.4140, 78.4940],
      [17.4190, 78.5000],
      [17.4240, 78.5060],
      [17.4320, 78.5100],
    ],
    distanceKm: 4.2,
    durationMinutes: 9,
    riskScore: 8,
    safetyScore: 92,
    hotspotsAvoided: 0,
    trafficDelayMinutes: 0,
    isRecommended: true,
    summary: 'Standard arterial corridor under clear daylight conditions with smooth traffic flow.',
  });
  const [saferRoute, setSaferRoute] = useState<RouteOption | null>(null);
  const [isSaferRouteApplied, setIsSaferRouteApplied] = useState(false);

  // Audio Voice Alert State
  const [isVoiceMuted, setIsVoiceMuted] = useState<boolean>(voiceManager.getIsMuted());

  // Mobile View Switcher ('inputs' or 'map')
  const [mobileTab, setMobileTab] = useState<'inputs' | 'map'>('inputs');

  // Modal States
  const [isXaiOpen, setIsXaiOpen] = useState(false);
  const [isSaferRouteOpen, setIsSaferRouteOpen] = useState(false);
  const [isHazardModalOpen, setIsHazardModalOpen] = useState(false);
  const [isSosOpen, setIsSosOpen] = useState(false);

  // Main Unified Risk Analysis Execution Function
  const handleAnalyzeRoadRisk = useCallback(async (newInputs: RoadSafetyInputs, isUserTriggered: boolean = true) => {
    setIsLoading(true);
    setInputs(newInputs);

    try {
      const response = await evaluateRisk(newInputs);

      const updatedLoc: GpsLocation = {
        latitude: newInputs.latitude,
        longitude: newInputs.longitude,
        speed: newInputs.speed,
        heading: 140,
        timestamp: Date.now(),
      };

      setLocation(updatedLoc);
      setWeather(response.weather);
      setTraffic(response.traffic);
      setQuality(response.quality);
      setHotspots(response.hotspots);
      setRisk(response.risk);

      // Compute safer bypass route around identified spatial clusters
      fetchSaferRoutes(
        newInputs.latitude,
        newInputs.longitude,
        undefined,
        undefined,
        response.risk?.safetyScore
      )
        .then((res) => {
          setCurrentRoute(res.currentRoute);
          const enrichedSafer: RouteOption = {
            ...res.saferRoute,
            name: 'Safer Alternative Bypass',
            reason: res.reason || res.saferRoute.reason || 'Avoids identified high-risk accident hotspot',
          };
          setSaferRoute(enrichedSafer);
          // Automatically display the safer bypass route on the live map if elevated risk AND user triggered
          setIsSaferRouteApplied(isUserTriggered && (response.risk?.riskLevel === 'HIGH' || response.risk?.riskLevel === 'MEDIUM'));
        })
        .catch((err) => console.warn('Failed to compute safer routes:', err));

      // Trigger synthesized voice alert ONLY if user actively triggered analysis and elevated risk
      if (isUserTriggered && response.risk && response.risk.speechAlert) {
        voiceManager.triggerAlert(
          response.risk.riskLevel,
          response.risk.speechAlert,
          response.risk.nearestHotspot?.id || null
        );
      }
    } catch (err) {
      console.error('Error during road risk assessment:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial analysis on mount for normal baseline without startling alarms
  useEffect(() => {
    fetchHazards(DEFAULT_NORMAL_INPUTS.latitude, DEFAULT_NORMAL_INPUTS.longitude)
      .then((h) => {
        try {
          const cached = localStorage.getItem('geoai_user_hazard_reports');
          if (cached) {
            const userHazards = JSON.parse(cached);
            if (Array.isArray(userHazards)) {
              const combined = [
                ...userHazards,
                ...h.filter((srv) => !userHazards.some((usr) => usr.id === srv.id)),
              ];
              setHazards(combined);
              return;
            }
          }
        } catch (e) {
          console.warn('Could not read cached hazards:', e);
        }
        setHazards(h);
      })
      .catch((err) => console.warn('Failed to load initial hazards:', err));

    handleAnalyzeRoadRisk(DEFAULT_NORMAL_INPUTS, false);
  }, [handleAnalyzeRoadRisk]);

  // Voice Mute Toggle
  const handleToggleVoiceMute = () => {
    const nextMuted = !isVoiceMuted;
    setIsVoiceMuted(nextMuted);
    voiceManager.setMuted(nextMuted);
  };

  // Hazard Report Submission with persistent storage
  const handleReportHazard = async (reportData: {
    type: HazardType;
    description?: string;
    severity: 'Low' | 'Medium' | 'High';
  }) => {
    const lat = location?.latitude || 17.3850;
    const lon = location?.longitude || 78.4867;

    const newReport = await submitHazardReport({
      type: reportData.type,
      latitude: lat,
      longitude: lon,
      description: reportData.description,
      severity: reportData.severity,
    });

    setHazards((prev) => {
      const updated = [newReport, ...prev];
      try {
        localStorage.setItem('geoai_user_hazard_reports', JSON.stringify(updated.slice(0, 30)));
      } catch (e) {
        console.warn('Could not save hazard to local storage:', e);
      }
      return updated;
    });
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden font-sans select-none">
      {/* Top Clean Application Header */}
      <header className="w-full bg-slate-900 border-b border-slate-800 shadow-xl z-20 shrink-0">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3">
          {/* Brand & Identity */}
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/30">
              <Compass className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-2">
                <span>🚗</span>
                <span>GeoAI-Based Road Hazard Prediction and Alert System</span>
              </h1>
              <p className="text-xs text-slate-400 hidden sm:block">
                Real-time road safety assessment, hazard warning & safer bypass navigation
              </p>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center gap-2">
            {/* Mobile View Toggle (Inputs vs Map) */}
            <div className="flex lg:hidden bg-slate-800 p-0.5 rounded-xl border border-slate-700 text-xs">
              <button
                onClick={() => setMobileTab('inputs')}
                className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 transition-all ${
                  mobileTab === 'inputs'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Inputs</span>
              </button>
              <button
                onClick={() => setMobileTab('map')}
                className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 transition-all ${
                  mobileTab === 'map'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <MapIcon className="w-3.5 h-3.5" />
                <span>Live Map</span>
              </button>
            </div>

            {/* Report Hazard */}
            <button
              id="btn-report-hazard"
              onClick={() => setIsHazardModalOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
              title="Report road hazard to alert drivers"
            >
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Report Hazard</span>
            </button>

            {/* Emergency SOS */}
            <button
              id="btn-open-sos"
              onClick={() => setIsSosOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 text-xs font-bold flex items-center gap-1.5 transition-colors"
              title="Emergency SOS 108 Dispatch & Local Trauma Facilities"
            >
              <PhoneCall className="w-4 h-4 text-rose-400" />
              <span>SOS (108)</span>
            </button>

            {/* Audio Voice Alert Mute/Unmute */}
            <button
              id="btn-toggle-voice"
              onClick={handleToggleVoiceMute}
              className={`p-2 rounded-xl border transition-all ${
                isVoiceMuted
                  ? 'bg-slate-800 text-slate-500 border-slate-700'
                  : 'bg-slate-800 text-blue-400 hover:text-white border-blue-500/30 shadow-sm'
              }`}
              title={isVoiceMuted ? 'Unmute voice alerts' : 'Mute voice alerts'}
            >
              {isVoiceMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area: Split Dashboard (Inputs & Analysis | Visual Warning & Live Interactive Map) */}
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden relative min-h-0">
        {/* Left Column: Telemetry Form & Analysis Card */}
        <div
          className={`w-full lg:w-[480px] xl:w-[520px] h-full overflow-y-auto p-3 sm:p-4 space-y-4 border-r border-slate-800 bg-slate-950/70 shrink-0 ${
            mobileTab === 'inputs' ? 'block' : 'hidden lg:block'
          }`}
        >
          {/* Road Input Form */}
          <RoadInputForm
            initialValues={inputs}
            onSubmit={handleAnalyzeRoadRisk}
            isLoading={isLoading}
          />

          {/* Main Result Cards, XAI, Voice Alert & Safer Route */}
          <RoadSafetyAnalysisCard
            risk={risk}
            inputs={inputs}
            nearestHotspot={risk?.nearestHotspot || null}
            saferRoute={saferRoute}
            currentRoute={currentRoute}
            isSaferRouteApplied={isSaferRouteApplied}
            onToggleSaferRoute={() => setIsSaferRouteApplied(!isSaferRouteApplied)}
            onPlayVoiceAlert={() => {
              if (risk?.speechAlert) {
                voiceManager.speak(risk.speechAlert);
              }
            }}
            onOpenXai={() => setIsXaiOpen(true)}
          />
        </div>

        {/* Right Column: Visual Warning Banner + Live Map with Spatial Context */}
        <div
          className={`flex-1 flex flex-col h-full relative min-w-0 p-2 sm:p-3 bg-slate-950 overflow-hidden ${
            mobileTab === 'map' ? 'flex' : 'hidden lg:flex'
          }`}
        >
          {/* Visual Risk Warning on Screen (High-Priority Real-Time HUD Banner) */}
          <div className="mb-2 shrink-0">
            <VisualRiskWarningBanner
              risk={risk}
              currentSpeed={location?.speed || inputs.speed || 60}
              onPlayVoiceAlert={() => {
                if (risk?.speechAlert) {
                  voiceManager.speak(risk.speechAlert);
                }
              }}
              onOpenSaferRoute={() => setIsSaferRouteOpen(true)}
              onOpenXai={() => setIsXaiOpen(true)}
              onToggleSaferRoute={() => setIsSaferRouteApplied(!isSaferRouteApplied)}
              isSaferRouteApplied={isSaferRouteApplied}
            />
          </div>

          {/* Telemetry Status Strip */}
          <div className="mb-2 px-3 py-1.5 bg-slate-900/90 backdrop-blur border border-slate-800 rounded-xl flex flex-wrap items-center justify-between gap-2 text-xs shadow-md z-10 shrink-0">
            <div className="flex items-center gap-3 text-slate-300">
              <div className="flex items-center gap-1.5 font-mono">
                <MapPin className="w-3.5 h-3.5 text-blue-400" />
                <span>
                  {location
                    ? `${location.latitude.toFixed(4)}° N, ${location.longitude.toFixed(4)}° E`
                    : '17.3850° N, 78.4867° E'}
                </span>
              </div>
              <span className="text-slate-600">|</span>
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400">Current Speed:</span>
                <span className="font-mono font-bold text-white">
                  {location?.speed ? Math.round(location.speed) : 60} km/h
                </span>
              </div>
            </div>

            {/* Quick Map Action Triggers */}
            <div className="flex items-center gap-2">
              <button
                id="btn-quick-safer-route"
                onClick={() => setIsSaferRouteApplied(!isSaferRouteApplied)}
                className={`px-2.5 py-1 rounded-lg border font-semibold text-[11px] flex items-center gap-1 transition-all ${
                  isSaferRouteApplied
                    ? 'bg-emerald-600/30 border-emerald-500 text-emerald-300'
                    : 'bg-indigo-500/15 hover:bg-indigo-500/25 border-indigo-500/30 text-indigo-300'
                }`}
              >
                <Route className="w-3 h-3 text-indigo-400" />
                <span>{isSaferRouteApplied ? 'Bypass On Map' : 'Show Safer Detour'}</span>
              </button>

              <button
                id="btn-quick-xai"
                onClick={() => setIsXaiOpen(true)}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 font-semibold text-[11px] flex items-center gap-1 transition-colors"
              >
                <Sparkles className="w-3 h-3 text-cyan-400" />
                <span>Why this risk?</span>
              </button>
            </div>
          </div>

          {/* Interactive Leaflet Live Map Canvas */}
          <div className="flex-1 relative w-full h-full min-h-[320px] rounded-2xl overflow-hidden border border-slate-800 shadow-2xl">
            <LiveMap
              location={location}
              hotspots={hotspots}
              hazards={hazards}
              currentRoute={currentRoute}
              saferRoute={saferRoute}
              showSaferRoute={isSaferRouteApplied}
              risk={risk}
              onSelectHotspot={() => setIsXaiOpen(true)}
              onToggleSaferRoute={() => setIsSaferRouteApplied(!isSaferRouteApplied)}
              onPlayVoiceAlert={() => {
                if (risk?.speechAlert) {
                  voiceManager.speak(risk.speechAlert);
                }
              }}
            />
          </div>
        </div>
      </main>

      {/* Modals */}
      <XaiModal
        isOpen={isXaiOpen}
        onClose={() => setIsXaiOpen(false)}
        risk={risk}
      />

      <SaferRouteModal
        isOpen={isSaferRouteOpen}
        onClose={() => setIsSaferRouteOpen(false)}
        currentRoute={currentRoute}
        saferRoute={saferRoute}
        isSaferRouteApplied={isSaferRouteApplied}
        onApplySaferRoute={(applied) => setIsSaferRouteApplied(applied)}
      />

      <HazardReportModal
        isOpen={isHazardModalOpen}
        onClose={() => setIsHazardModalOpen(false)}
        currentLocation={location}
        onSubmit={handleReportHazard}
      />

      <SosModal
        isOpen={isSosOpen}
        onClose={() => setIsSosOpen(false)}
        currentLocation={location}
        risk={risk}
      />
    </div>
  );
}
