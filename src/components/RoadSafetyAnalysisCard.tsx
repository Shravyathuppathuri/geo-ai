import React from 'react';
import { RiskAssessment, Hotspot, RouteOption, RoadSafetyInputs } from '../types';
import { 
  AlertOctagon, 
  AlertTriangle, 
  CheckCircle, 
  Volume2, 
  ShieldCheck, 
  Route,
  MapPin,
  HelpCircle,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Gauge
} from 'lucide-react';

interface RoadSafetyAnalysisCardProps {
  risk: RiskAssessment | null;
  inputs: RoadSafetyInputs;
  nearestHotspot: Hotspot | null;
  saferRoute: RouteOption | null;
  currentRoute?: RouteOption | null;
  isSaferRouteApplied: boolean;
  onToggleSaferRoute: () => void;
  onPlayVoiceAlert: () => void;
  onOpenXai?: () => void;
}

export const RoadSafetyAnalysisCard: React.FC<RoadSafetyAnalysisCardProps> = ({
  risk,
  inputs,
  nearestHotspot,
  saferRoute,
  currentRoute,
  isSaferRouteApplied,
  onToggleSaferRoute,
  onPlayVoiceAlert,
  onOpenXai,
}) => {
  if (!risk) {
    return (
      <div id="road-safety-analysis-placeholder" className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center text-slate-400 shadow-xl">
        <ShieldAlert className="w-8 h-8 text-blue-400 mx-auto mb-2 opacity-60 animate-pulse" />
        <h3 className="text-sm font-bold text-white mb-1">System Awaiting Execution</h3>
        <p className="text-xs text-slate-400 max-w-sm mx-auto">
          Click <strong className="text-blue-400">“🔍 Analyze Road Risk”</strong> to generate the real-time Risk Level, Safety Score, GeoAI Map projection, and XAI explanation.
        </p>
      </div>
    );
  }

  const {
    riskLevel,
    safetyScore,
    safetyClassification,
    detectedHazards,
    mainRiskFactors,
    warningMessage,
    speechAlert,
    saferRouteAvailable,
  } = risk;

  const isHigh = riskLevel === 'HIGH';
  const isMed = riskLevel === 'MEDIUM';

  const displayRiskLevel = isHigh ? 'HIGH' : isMed ? 'MODERATE' : 'LOW (NORMAL)';

  const riskBadgeColor = isHigh
    ? 'bg-rose-600 text-white shadow-rose-900/30'
    : isMed
    ? 'bg-amber-500 text-slate-950 shadow-amber-900/30 font-extrabold'
    : 'bg-emerald-600 text-white shadow-emerald-900/30';

  const riskDotColor = isHigh ? '🔴' : isMed ? '🟡' : '🟢';

  // Format hazard list as clean string (e.g. "Rain • Heavy Traffic • Poor Road • Low Visibility • High Speed")
  const hazardString = detectedHazards && detectedHazards.length > 0
    ? detectedHazards.map((h) => h.name).join(' • ')
    : 'No critical hazards detected';

  return (
    <div id="road-safety-analysis-card" className="space-y-3.5 animate-in fade-in duration-300">
      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          SECTION 3: MAIN RESULT CARDS
         ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-sm font-black text-white tracking-wider uppercase">
              ROAD SAFETY RESULTS
            </span>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            Computed by GeoAI & ML
          </span>
        </div>

        {/* 4-Box Key Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {/* 1. Risk Level */}
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
              <span>🚦</span> Risk Level
            </span>
            <div className="mt-2">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-black tracking-wider uppercase shadow-sm ${riskBadgeColor}`}>
                <span>{riskDotColor}</span>
                <span>{displayRiskLevel}</span>
              </span>
            </div>
          </div>

          {/* 2. Safety Score */}
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
              <span>🛡️</span> Safety Score
            </span>
            <div className="mt-2 flex items-baseline gap-1">
              <span className={`text-xl font-black font-mono ${
                safetyScore < 40 ? 'text-rose-400' : safetyScore < 70 ? 'text-amber-400' : 'text-emerald-400'
              }`}>
                {safetyScore}
              </span>
              <span className="text-xs text-slate-400 font-semibold">/ 100</span>
            </div>
            <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden mt-1.5">
              <div 
                className={`h-full ${isHigh ? 'bg-rose-500' : isMed ? 'bg-amber-500' : 'bg-emerald-500'}`}
                style={{ width: `${safetyScore}%` }}
              />
            </div>
          </div>

          {/* 3. Location Coordinates */}
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
              <span>📍</span> Location
            </span>
            <div className="mt-2 font-mono text-xs font-bold text-white truncate" title={`${inputs.latitude.toFixed(4)}, ${inputs.longitude.toFixed(4)}`}>
              {inputs.latitude.toFixed(4)}, {inputs.longitude.toFixed(4)}
            </div>
            <span className="text-[10px] text-slate-400 mt-1">{inputs.roadType} Corridor</span>
          </div>

          {/* 4. Speed & Proximity */}
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
              <span>⚡</span> Speed
            </span>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-lg font-black font-mono text-white">{inputs.speed}</span>
              <span className="text-[11px] text-slate-400">km/h</span>
            </div>
            <span className="text-[10px] text-slate-400 mt-1">
              {nearestHotspot ? `${nearestHotspot.distanceToDriverMeters}m to cluster` : 'Cluster clear'}
            </span>
          </div>
        </div>

        {/* Detected Hazards Strip */}
        <div className="mt-3 p-3 rounded-xl bg-slate-950/80 border border-slate-800">
          <div className="text-[10px] font-bold uppercase tracking-wider text-amber-400 mb-1.5 flex items-center gap-1.5">
            <span>⚠️</span>
            <span>DETECTED HAZARDS:</span>
          </div>
          <div className="text-xs font-semibold text-slate-200 leading-relaxed">
            {hazardString}
          </div>
        </div>
      </div>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          SECTION 6: ALERT SECTION 🔊
         ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div className={`p-4 rounded-2xl border shadow-xl transition-all ${
        isHigh
          ? 'bg-rose-950/40 border-rose-500/50 text-rose-200'
          : isMed
          ? 'bg-amber-950/30 border-amber-500/40 text-amber-200'
          : 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
      }`}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <span className="p-2 rounded-xl bg-slate-950/80 border border-slate-800 shrink-0 mt-0.5 text-base">
              {isHigh ? '⚠️' : isMed ? '⚡' : '✅'}
            </span>
            <div>
              <div className="text-xs font-black uppercase tracking-wider">
                {isHigh ? '⚠️ HIGH RISK DETECTED' : isMed ? 'CAUTIONARY ROAD ADVISORY' : 'SAFE ROAD CONFIRMATION'}
              </div>
              <p className="text-xs font-semibold text-white mt-1 leading-snug">
                {isHigh
                  ? 'Please slow down and follow the recommended safer route.'
                  : warningMessage}
              </p>
              <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Voice alert active via Web Speech (No irritating beeps)</span>
              </div>
            </div>
          </div>

          {speechAlert && (
            <button
              id="btn-replay-voice"
              type="button"
              onClick={onPlayVoiceAlert}
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-blue-400 hover:text-white border border-slate-700 font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shrink-0 active:scale-95"
              title="Replay Voice Alert"
            >
              <Volume2 className="w-4 h-4 text-blue-400" />
              <span>Voice Alert</span>
            </button>
          )}
        </div>
      </div>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          SECTION 5: XAI EXPLANATION 🧠
         ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2">
            <span className="text-base">🧠</span>
            <h3 className="text-xs font-black uppercase tracking-wider text-white">
              WHY THIS RISK? (EXPLAINABLE AI)
            </h3>
          </div>
          {onOpenXai && (
            <button
              id="btn-open-xai-modal"
              onClick={onOpenXai}
              className="text-[11px] text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1 transition-colors"
            >
              <span>SHAP Waterfall</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>

        <p className="text-[11px] text-slate-400 mb-2.5">
          The Random Forest model identified these top contributing factors driving the {riskLevel.toLowerCase()} risk evaluation:
        </p>

        {/* Explainable AI Factors Bullet Points */}
        <div className="space-y-1.5 bg-slate-950 p-3 rounded-xl border border-slate-800">
          {mainRiskFactors && mainRiskFactors.length > 0 ? (
            mainRiskFactors.map((factor, idx) => (
              <div key={idx} className="flex items-start gap-2 text-xs text-slate-200">
                <span className="text-rose-400 font-bold">•</span>
                <span className="font-medium">{factor}</span>
              </div>
            ))
          ) : (
            <div className="text-xs text-slate-400">• Standard road clearance parameters.</div>
          )}
          {nearestHotspot && (
            <div className="flex items-start gap-2 text-xs text-rose-300 font-medium">
              <span className="text-rose-400 font-bold">•</span>
              <span>
                Nearby accident hotspot ({nearestHotspot.name} - {nearestHotspot.distanceToDriverMeters}m ahead)
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          SECTION 7: SAFER ROUTE 🛣️
         ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {saferRoute && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-base">🛣️</span>
              <h3 className="text-xs font-black uppercase tracking-wider text-emerald-400">
                RECOMMENDED SAFER ROUTE
              </h3>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              GeoAI Detour
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
            <div>
              <span className="text-slate-400 font-medium">Recommended Route: </span>
              <strong className="text-white">
                {saferRoute.name.includes('Arterial') ? 'Safer Alternative Bypass' : (saferRoute.name || 'Safer Alternative Bypass')}
              </strong>
            </div>
            <div>
              <span className="text-slate-400 font-medium">Reason: </span>
              <strong className="text-emerald-400">
                {saferRoute.reason || (nearestHotspot ? `Avoids identified high-risk accident hotspot at ${nearestHotspot.name}` : 'Avoids identified high-risk accident hotspot at Koti Women’s College')}
              </strong>
            </div>
            <div>
              <span className="text-slate-400 font-medium">Safety Score: </span>
              <strong className="text-emerald-400">{saferRoute.safetyScore || 74} / 100</strong>{' '}
              <span className="text-slate-400">
                (compared to {currentRoute?.safetyScore ?? 32} / 100 on direct route
                {(saferRoute.safetyScore || 74) > (currentRoute?.safetyScore ?? 32) && (
                  <>
                    {' '}—{' '}
                    <span className="text-emerald-400 font-semibold">
                      +{(saferRoute.safetyScore || 74) - (currentRoute?.safetyScore ?? 32)} points safer
                    </span>
                  </>
                )}
                )
              </span>
            </div>
          </div>

          <div className="mt-3">
            <button
              id="btn-toggle-safer-route-card"
              onClick={onToggleSaferRoute}
              className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md active:scale-98 ${
                isSaferRouteApplied
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white ring-2 ring-emerald-400/50'
                  : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white'
              }`}
            >
              <Route className="w-4 h-4" />
              <span>{isSaferRouteApplied ? '✓ Safer Bypass Active on Live Map' : 'Display Safer Route on Map'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
