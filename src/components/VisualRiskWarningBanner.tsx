import React, { useState } from 'react';
import { RiskAssessment } from '../types';
import {
  AlertTriangle,
  Volume2,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Gauge,
  Navigation,
  Sparkles,
  X,
  Radio,
  Eye,
  Route,
} from 'lucide-react';

interface VisualRiskWarningBannerProps {
  risk: RiskAssessment | null;
  currentSpeed: number;
  onPlayVoiceAlert: () => void;
  onOpenSaferRoute: () => void;
  onOpenXai: () => void;
  onToggleSaferRoute?: () => void;
  isSaferRouteApplied?: boolean;
}

export const VisualRiskWarningBanner: React.FC<VisualRiskWarningBannerProps> = ({
  risk,
  currentSpeed,
  onPlayVoiceAlert,
  onOpenSaferRoute,
  onOpenXai,
  onToggleSaferRoute,
  isSaferRouteApplied = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isDismissed, setIsDismissed] = useState(false);

  if (!risk || isDismissed) {
    if (isDismissed && risk && (risk.riskLevel === 'HIGH' || risk.riskLevel === 'MEDIUM')) {
      return (
        <button
          id="btn-reopen-visual-warning"
          onClick={() => setIsDismissed(false)}
          className="fixed top-20 right-6 z-[500] px-3.5 py-2 rounded-xl bg-rose-600/90 text-white font-bold text-xs shadow-2xl flex items-center gap-2 border border-rose-400/50 backdrop-blur-md animate-pulse hover:bg-rose-500 transition-all"
        >
          <AlertTriangle className="w-4 h-4 text-white" />
          <span>Show Active Visual Risk Warning ({risk.riskLevel})</span>
        </button>
      );
    }
    return null;
  }

  const isHigh = risk.riskLevel === 'HIGH';
  const isMedium = risk.riskLevel === 'MEDIUM';

  // Safe advisory speed recommendation
  const recommendedSafeSpeed = isHigh
    ? Math.min(35, Math.max(20, Math.round(currentSpeed * 0.55)))
    : isMedium
    ? Math.min(45, Math.max(30, Math.round(currentSpeed * 0.75)))
    : currentSpeed;

  const speedExceeded = currentSpeed > recommendedSafeSpeed;

  return (
    <div
      id="visual-risk-warning-hud"
      role="alert"
      aria-live="assertive"
      className={`w-full transition-all duration-300 rounded-2xl border backdrop-blur-xl shadow-2xl overflow-hidden ${
        isHigh
          ? 'bg-rose-950/95 border-rose-500/70 text-rose-50 shadow-rose-950/50 ring-2 ring-rose-500/30'
          : isMedium
          ? 'bg-amber-950/95 border-amber-500/70 text-amber-50 shadow-amber-950/50 ring-2 ring-amber-500/30'
          : 'bg-emerald-950/80 border-emerald-500/40 text-emerald-50 shadow-emerald-950/30'
      }`}
    >
      {/* Top Warning Banner Ribbon with Strobe Indicator */}
      <div
        className={`px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 border-b ${
          isHigh
            ? 'bg-rose-900/60 border-rose-500/30'
            : isMedium
            ? 'bg-amber-900/60 border-amber-500/30'
            : 'bg-emerald-900/60 border-emerald-500/30'
        }`}
      >
        <div className="flex items-center gap-3">
          {/* Animated Hazard Strobe Badge */}
          <div className="relative flex items-center justify-center">
            {isHigh && (
              <span className="absolute -inset-1 rounded-full bg-rose-500/60 animate-ping" />
            )}
            <div
              className={`p-2 rounded-xl relative ${
                isHigh
                  ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/50'
                  : isMedium
                  ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/50'
                  : 'bg-emerald-600 text-white shadow-md shadow-emerald-900/40'
              }`}
            >
              {isHigh || isMedium ? (
                <AlertTriangle className="w-5 h-5 animate-pulse" />
              ) : (
                <ShieldCheck className="w-5 h-5 text-white" />
              )}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black tracking-wider uppercase px-2 py-0.5 rounded bg-black/40 border border-white/15">
                {isHigh ? 'VISUAL DRIVER WARNING' : isMedium ? 'DRIVER CAUTION ADVISORY' : 'NORMAL ROAD STATUS'}
              </span>
              <span
                className={`text-xs font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                  isHigh
                    ? 'bg-rose-500 text-white animate-pulse'
                    : isMedium
                    ? 'bg-amber-400 text-slate-950 font-black'
                    : 'bg-emerald-400 text-slate-950 font-bold'
                }`}
              >
                {isHigh ? 'HIGH ACCIDENT RISK' : isMedium ? 'MODERATE ACCIDENT RISK' : 'NORMAL (LOW RISK)'}
              </span>
              <span className="text-xs opacity-80 hidden sm:inline">
                • Probability: <strong className="font-mono">{risk.riskProbability}%</strong>
              </span>
              <span className="text-xs opacity-80 hidden sm:inline">
                • Safety Score: <strong className="font-mono">{risk.safetyScore}/100</strong>
              </span>
            </div>
            <p className="text-xs sm:text-sm font-bold text-white mt-0.5 tracking-tight">
              {risk.warningMessage}
            </p>
          </div>
        </div>

        {/* Action Controls & Minimize */}
        <div className="flex items-center gap-1.5 ml-auto">
          {/* Audio Voice Alert Replay (Available when alert message present or elevated risk) */}
          {risk.speechAlert && (
            <button
              id="btn-hud-voice-alert"
              onClick={onPlayVoiceAlert}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all active:scale-95 shadow-md ${
                isHigh
                  ? 'bg-rose-600 hover:bg-rose-500 text-white'
                  : isMedium
                  ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                  : 'bg-slate-800 hover:bg-slate-700 text-white'
              }`}
              title="Replay Voice Warning Alert"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Voice Alert</span>
            </button>
          )}

          {/* Safer Route Detour */}
          <button
            id="btn-hud-safer-route"
            onClick={onToggleSaferRoute || onOpenSaferRoute}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all active:scale-95 shadow-md ${
              isSaferRouteApplied
                ? 'bg-emerald-600 text-white ring-2 ring-emerald-400'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white'
            }`}
            title="Activate Safer Bypass Detour"
          >
            <Route className="w-3.5 h-3.5" />
            <span>{isSaferRouteApplied ? 'Bypass Active' : 'Safer Detour'}</span>
          </button>

          {/* Toggle Expand / Collapse */}
          <button
            id="btn-hud-toggle-expand"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition-colors"
            title={isExpanded ? 'Collapse Warning' : 'Expand Details'}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {/* Dismiss button */}
          <button
            id="btn-hud-dismiss"
            onClick={() => setIsDismissed(true)}
            className="p-1.5 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors"
            title="Dismiss from view (can reopen)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Expanded Multi-Hazard Details & Speed Reduction Guidance */}
      {isExpanded && (
        <div className="p-3 sm:p-4 space-y-3 text-xs bg-slate-950/40">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Speed vs Safe Advisory Limit */}
            <div
              className={`p-3 rounded-xl border flex items-center justify-between ${
                speedExceeded
                  ? 'bg-rose-900/30 border-rose-500/40'
                  : 'bg-slate-900/60 border-slate-800'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Gauge
                  className={`w-5 h-5 ${speedExceeded ? 'text-rose-400 animate-pulse' : 'text-emerald-400'}`}
                />
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400">
                    Speed Advisory
                  </div>
                  <div className="text-xs text-slate-200">
                    Current: <strong className="font-mono text-white">{currentSpeed} km/h</strong>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block">Recommended</span>
                <span
                  className={`text-sm font-black font-mono px-2 py-0.5 rounded ${
                    speedExceeded
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      : 'bg-emerald-500/20 text-emerald-300'
                  }`}
                >
                  &le; {recommendedSafeSpeed} km/h
                </span>
              </div>
            </div>

            {/* Nearest Hazard Zone */}
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between md:col-span-2">
              <div className="flex items-center gap-2.5">
                <Radio className="w-5 h-5 text-rose-400 shrink-0" />
                <div className="min-w-0">
                  <div className="text-[10px] uppercase font-bold text-slate-400">
                    Nearest High-Risk Hazard
                  </div>
                  <div className="text-xs font-bold text-white truncate">
                    {risk.nearestHotspot ? risk.nearestHotspot.name : 'Clear road segment ahead'}
                  </div>
                  {risk.nearestHotspot && (
                    <div className="text-[11px] text-slate-400">
                      {risk.nearestHotspot.distanceToDriverMeters}m ahead •{' '}
                      {risk.nearestHotspot.historicalAccidentCount} past crashes reported •{' '}
                      Primary cause: {risk.nearestHotspot.primaryCause}
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={onOpenXai}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold flex items-center gap-1 border border-slate-700 shrink-0 ml-2"
              >
                <Sparkles className="w-3 h-3 text-cyan-400" />
                <span>Why this risk?</span>
              </button>
            </div>
          </div>

          {/* Active Hazard Indicators Chips */}
          <div>
            <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
              <span>Detected Simultaneous Hazards:</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {risk.detectedHazards.map((haz, idx) => (
                <span
                  key={idx}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold border ${
                    haz.severity === 'High'
                      ? 'bg-rose-500/20 text-rose-200 border-rose-500/40'
                      : haz.severity === 'Medium'
                      ? 'bg-amber-500/20 text-amber-200 border-amber-500/40'
                      : 'bg-slate-800 text-slate-300 border-slate-700'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      haz.severity === 'High' ? 'bg-rose-400 animate-ping' : 'bg-amber-400'
                    }`}
                  />
                  <span>{haz.name}</span>
                  <span className="opacity-60 text-[10px]">({haz.severity})</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
