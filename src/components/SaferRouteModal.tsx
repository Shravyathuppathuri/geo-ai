import React from 'react';
import { RouteOption } from '../types';
import { X, Navigation, ShieldCheck, AlertTriangle, Clock, ArrowRight, CheckCircle2 } from 'lucide-react';

interface SaferRouteModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentRoute: RouteOption | null;
  saferRoute: RouteOption | null;
  isSaferRouteApplied: boolean;
  onApplySaferRoute: (apply: boolean) => void;
}

export const SaferRouteModal: React.FC<SaferRouteModalProps> = ({
  isOpen,
  onClose,
  currentRoute,
  saferRoute,
  isSaferRouteApplied,
  onApplySaferRoute,
}) => {
  if (!isOpen || !currentRoute || !saferRoute) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        id="safer-route-modal-card"
        className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Safer Route Recommendation</h2>
              <p className="text-xs text-slate-400">Avoids known crash hotspots and bottleneck merge points</p>
            </div>
          </div>
          <button
            id="btn-close-safer-route"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Notice */}
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200 text-xs flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold">High-Risk Corridor Ahead:</span> The direct central route passes directly through high-severity accident clusters. The system recommends an arterial bypass.
            </div>
          </div>

          {/* Side by Side Comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {/* Current Route */}
            <div className={`p-4 rounded-xl border transition-all ${
              !isSaferRouteApplied
                ? 'bg-slate-800/80 border-slate-700 ring-1 ring-slate-600'
                : 'bg-slate-950/40 border-slate-800 opacity-70'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Current Route</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300">HIGH RISK</span>
              </div>
              <div className="text-base font-bold text-white mb-3">{currentRoute.name}</div>

              <div className="space-y-2 text-xs text-slate-300">
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Safety Score:</span>
                  <span className="font-bold text-rose-400">{currentRoute.safetyScore}/100</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Risk Score:</span>
                  <span className="font-bold text-rose-400">{currentRoute.riskScore}/100</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Distance & ETA:</span>
                  <span className="font-semibold text-white">{currentRoute.distanceKm} km • {currentRoute.durationMinutes} min</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Bottlenecks:</span>
                  <span className="text-rose-400 font-medium">Traverses Hotspots</span>
                </div>
              </div>
            </div>

            {/* Recommended Safer Route */}
            <div className={`p-4 rounded-xl border transition-all ${
              isSaferRouteApplied
                ? 'bg-emerald-950/30 border-emerald-500/50 ring-2 ring-emerald-500/40'
                : 'bg-emerald-950/15 border-emerald-500/30 hover:border-emerald-500/60'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Recommended
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300">SAFER</span>
              </div>
              <div className="text-base font-bold text-white mb-3">{saferRoute.name}</div>

              <div className="space-y-2 text-xs text-slate-300">
                <div className="flex justify-between py-1 border-b border-emerald-900/40">
                  <span className="text-slate-400">Safety Score:</span>
                  <span className="font-bold text-emerald-400">{saferRoute.safetyScore}/100</span>
                </div>
                <div className="flex justify-between py-1 border-b border-emerald-900/40">
                  <span className="text-slate-400">Risk Score:</span>
                  <span className="font-bold text-emerald-400">{saferRoute.riskScore}/100 (-62%)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-emerald-900/40">
                  <span className="text-slate-400">Distance & ETA:</span>
                  <span className="font-semibold text-white">{saferRoute.distanceKm} km • {saferRoute.durationMinutes} min</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Hotspots Avoided:</span>
                  <span className="text-emerald-400 font-bold">2 Fatal Clusters Bypassed</span>
                </div>
              </div>
            </div>
          </div>

          {/* Explanation */}
          <div className="p-3 bg-slate-950/40 rounded-xl border border-slate-800 text-xs text-slate-400 leading-relaxed">
            {saferRoute.summary}
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/70 flex items-center justify-between">
          <button
            id="btn-cancel-safer-route"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-slate-400 hover:text-white font-medium text-sm transition-colors"
          >
            Close
          </button>
          <button
            id="btn-confirm-safer-route"
            onClick={() => {
              onApplySaferRoute(!isSaferRouteApplied);
              onClose();
            }}
            className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-all flex items-center gap-2 ${
              isSaferRouteApplied
                ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/30'
            }`}
          >
            {isSaferRouteApplied ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Active on Live Map (Tap to Revert)
              </>
            ) : (
              <>
                <Navigation className="w-4 h-4" />
                Switch to Safer Detour
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
