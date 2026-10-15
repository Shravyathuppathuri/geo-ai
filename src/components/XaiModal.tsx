import React from 'react';
import { RiskAssessment } from '../types';
import { X, ShieldAlert, TrendingUp, TrendingDown, HelpCircle, Activity } from 'lucide-react';

interface XaiModalProps {
  isOpen: boolean;
  onClose: () => void;
  risk: RiskAssessment | null;
}

export const XaiModal: React.FC<XaiModalProps> = ({ isOpen, onClose, risk }) => {
  if (!isOpen || !risk) return null;

  const { riskLevel, riskScore, safetyScore, xaiExplanation } = risk;
  const factors = xaiExplanation?.factors || [];

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        id="xai-modal-card"
        className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">XAI Multi-Hazard Explanation</h2>
              <p className="text-xs text-slate-400">SHAP feature attribution & factor impact breakdown</p>
            </div>
          </div>
          <button
            id="btn-close-xai"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-5">
          {/* Summary Score Banner */}
          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Calculated Decision</div>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-xl font-black ${
                  riskLevel === 'HIGH' ? 'text-rose-400' : riskLevel === 'MEDIUM' ? 'text-amber-400' : 'text-emerald-400'
                }`}>
                  {riskLevel} RISK
                </span>
                <span className="text-slate-500">•</span>
                <span className="text-slate-200 text-sm font-medium">Risk Score: {riskScore}/100</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Road Safety Score</div>
              <div className="text-2xl font-black text-amber-400">{safetyScore}<span className="text-xs text-slate-400 font-normal">/100</span></div>
            </div>
          </div>

          {/* Plain English Summary */}
          <div>
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-blue-400" />
              Executive Driver Summary
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed bg-slate-950/40 p-3.5 rounded-xl border border-slate-800">
              {xaiExplanation?.summary || "Analyzing continuous telemetry along your forward transit corridor."}
            </p>
          </div>

          {/* Factor Waterfall Attribution List */}
          <div>
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">
              Contributing Factors (SHAP Attribution)
            </h3>
            <div className="space-y-2.5">
              {factors.map((item, idx) => {
                const isRiskAdd = item.direction === 'increases_risk';
                return (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-950/50 border border-slate-800/80 flex items-start justify-between gap-3"
                  >
                    <div className="flex items-start gap-2.5">
                      <div className={`mt-0.5 p-1 rounded-lg ${
                        isRiskAdd ? 'bg-rose-500/10 text-rose-400' : 'bg-emerald-500/10 text-emerald-400'
                      }`}>
                        {isRiskAdd ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-white flex items-center gap-2">
                          {item.factor}
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-medium">
                            {item.category}
                          </span>
                        </div>
                        <div className="text-xs text-slate-400 mt-1 leading-snug">
                          {item.description}
                        </div>
                      </div>
                    </div>

                    <div className={`text-sm font-mono font-bold whitespace-nowrap px-2 py-1 rounded-lg ${
                      isRiskAdd ? 'bg-rose-500/10 text-rose-400' : 'bg-emerald-500/10 text-emerald-400'
                    }`}>
                      {item.impactScore > 0 ? `+${item.impactScore}` : item.impactScore} pts
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/70 flex justify-end">
          <button
            id="btn-xai-dismiss"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-sm transition-colors"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};
