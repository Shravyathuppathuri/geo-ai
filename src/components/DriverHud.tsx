import React from 'react';
import { GpsLocation, WeatherData, TrafficData, DataQuality, RiskAssessment } from '../types';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  CloudRain,
  Sun,
  Cloud,
  Navigation,
  Gauge,
  MapPin,
  Volume2,
  VolumeX,
  Radio,
  BarChart3,
  HelpCircle,
  AlertCircle,
  Compass,
} from 'lucide-react';

interface DriverHudProps {
  isDriving: boolean;
  onToggleDriving: () => void;
  location: GpsLocation | null;
  weather: WeatherData | null;
  traffic: TrafficData | null;
  quality: DataQuality | null;
  risk: RiskAssessment | null;
  isVoiceMuted: boolean;
  onToggleVoiceMute: () => void;
  onOpenXai: () => void;
  onOpenSaferRoute: () => void;
  onOpenReportHazard: () => void;
  onOpenSos: () => void;
  onOpenAnalytics: () => void;
}

export const DriverHud: React.FC<DriverHudProps> = ({
  isDriving,
  onToggleDriving,
  location,
  weather,
  traffic,
  quality,
  risk,
  isVoiceMuted,
  onToggleVoiceMute,
  onOpenXai,
  onOpenSaferRoute,
  onOpenReportHazard,
  onOpenSos,
  onOpenAnalytics,
}) => {
  const currentSpeed = location?.speed ? Math.round(location.speed) : 0;
  const riskLevel = risk?.riskLevel || 'LOW';
  const safetyScore = risk?.safetyScore ?? 92;
  const riskScore = risk?.riskScore ?? 8;

  // Weather icon selector
  const renderWeatherIcon = () => {
    const cond = weather?.condition?.toLowerCase() || '';
    if (cond.includes('rain') || cond.includes('shower')) return <CloudRain className="w-4 h-4 text-blue-400" />;
    if (cond.includes('cloud')) return <Cloud className="w-4 h-4 text-slate-400" />;
    return <Sun className="w-4 h-4 text-amber-400" />;
  };

  return (
    <header className="w-full bg-slate-900 border-b border-slate-800 shadow-xl">
      {/* Top Telemetry & Control Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
        {/* Brand & Status */}
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl border transition-colors ${
            riskLevel === 'HIGH'
              ? 'bg-rose-500/20 text-rose-400 border-rose-500/40 animate-pulse'
              : riskLevel === 'MEDIUM'
              ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
              : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
          }`}>
            <Compass className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-black tracking-tight text-white">
                GeoAI Driver Safety Assistant
              </h1>
              {isDriving && (
                <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full animate-pulse">
                  <Radio className="w-3 h-3" /> Auto Active
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Continuous Real-Time Road Hazard Prediction & GeoAI Safety Engine
            </p>
          </div>
        </div>

        {/* Action Controls (Voice, Analytics, Drive CTA) */}
        <div className="flex items-center gap-2">
          {/* Audio Mute/Unmute */}
          <button
            id="btn-toggle-voice"
            onClick={onToggleVoiceMute}
            className={`p-2 rounded-xl border transition-all ${
              isVoiceMuted
                ? 'bg-slate-800 text-slate-500 border-slate-700'
                : 'bg-slate-800 text-blue-400 hover:text-white border-blue-500/30 shadow-sm'
            }`}
            title={isVoiceMuted ? 'Unmute voice alerts' : 'Mute voice alerts'}
          >
            {isVoiceMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>

          {/* Analytics Modal Toggle */}
          <button
            id="btn-open-analytics"
            onClick={onOpenAnalytics}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
            title="View system metrics & evaluation"
          >
            <BarChart3 className="w-5 h-5" />
          </button>

          {/* Primary Automatic Workflow Trigger */}
          <button
            id="btn-toggle-driving"
            onClick={onToggleDriving}
            className={`px-4 sm:px-6 py-2.5 rounded-xl font-bold text-sm tracking-wide transition-all shadow-lg active:scale-95 flex items-center gap-2 ${
              isDriving
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black shadow-emerald-500/25 ring-2 ring-emerald-400/50 animate-bounce'
            }`}
          >
            {isDriving ? (
              <>
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                STOP DRIVING
              </>
            ) : (
              <>
                <span className="w-2.5 h-2.5 rounded-full bg-slate-950"></span>
                START DRIVING
              </>
            )}
          </button>
        </div>
      </div>

      {/* Real-time Telemetry Sensor Strip */}
      <div className="bg-slate-950/80 border-t border-slate-800/80 px-3 sm:px-6 py-2">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Location & Speed */}
          <div className="flex items-center gap-4 text-slate-300">
            <div className="flex items-center gap-1.5 font-mono">
              <MapPin className="w-4 h-4 text-blue-400" />
              <span>
                {location
                  ? `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`
                  : 'Acquiring GPS...'}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Gauge className="w-4 h-4 text-amber-400" />
              <span className="font-semibold text-white">{currentSpeed} km/h</span>
            </div>
          </div>

          {/* Dynamic Weather & Traffic Sensors */}
          <div className="flex items-center gap-3">
            {/* Weather Sensor */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
              {renderWeatherIcon()}
              <span>{weather ? `${weather.temperature}°C, ${weather.condition}` : 'Loading weather...'}</span>
              <span className={`text-[9px] px-1 py-0.2 rounded font-bold uppercase ${
                weather?.isLive ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'
              }`}>
                {weather?.isLive ? 'LIVE' : 'CACHED'}
              </span>
            </div>

            {/* Traffic Sensor */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
              <span className={`w-2 h-2 rounded-full ${
                traffic?.congestionLevel === 'SEVERE'
                  ? 'bg-rose-500'
                  : traffic?.congestionLevel === 'HEAVY'
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
              }`} />
              <span>
                {traffic
                  ? `${traffic.congestionLevel} (${traffic.congestionPercent}% Congested)`
                  : 'Loading traffic...'}
              </span>
              <span className={`text-[9px] px-1 py-0.2 rounded font-bold uppercase ${
                traffic?.isLive ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'
              }`}>
                {traffic?.isLive ? 'LIVE' : 'CACHED'}
              </span>
            </div>

            {/* Data Quality / Confidence */}
            {quality && (
              <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900/90 border border-slate-800 text-slate-400">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                <span>
                  Data Quality: <strong className="text-white">{quality.qualityScore}%</strong>
                </span>
                <span className="text-slate-600">•</span>
                <span>
                  Conf: <strong className="text-white">{quality.predictionConfidence}</strong>
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Alert Banner (When High Risk or Hotspot Ahead) */}
      {riskLevel === 'HIGH' && (
        <div className="bg-gradient-to-r from-rose-950 via-rose-900 to-rose-950 border-y border-rose-600/80 px-4 py-3 animate-in fade-in">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-rose-600 text-white shrink-0 shadow-lg shadow-rose-900/50 animate-pulse">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black tracking-wider uppercase px-2 py-0.5 rounded bg-rose-600 text-white">
                    HIGH ACCIDENT RISK DETECTED
                  </span>
                  {risk?.hotspotAhead && (
                    <span className="text-xs text-rose-200 font-semibold">
                      ⚠️ Accident Hotspot Ahead ({risk.nearestHotspot?.name})
                    </span>
                  )}
                </div>
                <div className="text-sm font-bold text-white mt-0.5">
                  &ldquo;{risk?.speechAlert || 'Warning. High accident risk ahead. Please slow down.'}&rdquo;
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center">
              <button
                id="btn-xai-quick"
                onClick={onOpenXai}
                className="px-3 py-1.5 rounded-lg bg-rose-800/80 hover:bg-rose-700 text-white text-xs font-semibold flex items-center gap-1 transition-colors"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                Why High?
              </button>
              {risk?.saferRouteAvailable && (
                <button
                  id="btn-banner-safer-route"
                  onClick={onOpenSaferRoute}
                  className="px-4 py-1.5 rounded-lg bg-white text-rose-950 hover:bg-rose-100 text-xs font-black shadow-lg transition-transform active:scale-95 flex items-center gap-1.5"
                >
                  <Navigation className="w-3.5 h-3.5 text-emerald-600" />
                  View Safer Route
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Driver Dashboard Ribbon: Score & Fast Action Controls */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Road Safety Score Widget */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center">
            {/* Circular Gauge Representation */}
            <div className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center border-2 font-black shadow-md ${
              riskLevel === 'HIGH'
                ? 'bg-rose-950/50 border-rose-500 text-rose-400'
                : riskLevel === 'MEDIUM'
                ? 'bg-amber-950/50 border-amber-500 text-amber-400'
                : 'bg-emerald-950/50 border-emerald-500 text-emerald-400'
            }`}>
              <span className="text-lg leading-none">{safetyScore}</span>
              <span className="text-[9px] text-slate-400 font-semibold uppercase">/100</span>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 uppercase font-semibold">Road Safety Score</span>
              <button
                onClick={onOpenXai}
                className="text-[10px] text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-0.5 underline"
              >
                Explain XAI
              </button>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`text-base font-black ${
                riskLevel === 'HIGH' ? 'text-rose-400' : riskLevel === 'MEDIUM' ? 'text-amber-400' : 'text-emerald-400'
              }`}>
                {riskLevel} RISK
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-xs text-slate-300 truncate max-w-xs sm:max-w-sm">
                {risk?.alertMessage || 'Optimal transit conditions along current sector.'}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Driver Action Buttons */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-end">
          {/* Safer Route Button */}
          <button
            id="btn-view-safer-route"
            onClick={onOpenSaferRoute}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              risk?.saferRouteAvailable
                ? 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 ring-1 ring-emerald-500/30'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
            }`}
          >
            <Navigation className="w-4 h-4 text-emerald-400" />
            <span>View Safer Route</span>
          </button>

          {/* Report Hazard Button */}
          <button
            id="btn-report-hazard"
            onClick={onOpenReportHazard}
            className="px-3.5 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/40 text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <AlertCircle className="w-4 h-4 text-amber-400" />
            <span>Report Hazard</span>
          </button>

          {/* SOS Emergency Button */}
          <button
            id="btn-sos-emergency"
            onClick={onOpenSos}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-black tracking-wide shadow-lg shadow-rose-900/40 transition-transform active:scale-95 flex items-center gap-1.5"
          >
            <ShieldAlert className="w-4 h-4" />
            <span>SOS</span>
          </button>
        </div>
      </div>
    </header>
  );
};
