import React, { useState, useEffect } from 'react';
import { ModelMetrics } from '../types';
import { fetchModelMetrics } from '../services/api';
import { X, BarChart3, Database, Layers, CheckCircle, AlertCircle, FileText } from 'lucide-react';

interface AnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AnalyticsModal: React.FC<AnalyticsModalProps> = ({ isOpen, onClose }) => {
  const [metrics, setMetrics] = useState<ModelMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    fetchModelMetrics()
      .then((res) => setMetrics(res))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        id="analytics-modal-card"
        className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">System Analytics & Model Evaluation</h2>
              <p className="text-xs text-slate-400">Random Forest evaluation, GeoAI spatial clustering & research metrics</p>
            </div>
          </div>
          <button
            id="btn-close-analytics"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-5 text-slate-200">
          {loading || !metrics ? (
            <div className="p-8 text-center text-slate-400 text-sm">Loading statistical metrics...</div>
          ) : (
            <>
              {/* Metric Highlights Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                  <div className="text-[11px] text-slate-400 uppercase font-semibold">Model Accuracy</div>
                  <div className="text-2xl font-black text-emerald-400 mt-1">{(metrics.accuracy * 100).toFixed(1)}%</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Empirical test split</div>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                  <div className="text-[11px] text-slate-400 uppercase font-semibold">Macro Precision</div>
                  <div className="text-2xl font-black text-blue-400 mt-1">{(metrics.precision * 100).toFixed(1)}%</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Weighted avg across classes</div>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                  <div className="text-[11px] text-slate-400 uppercase font-semibold">Macro Recall</div>
                  <div className="text-2xl font-black text-purple-400 mt-1">{(metrics.recall * 100).toFixed(1)}%</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Hazard detection rate</div>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                  <div className="text-[11px] text-slate-400 uppercase font-semibold">Macro F1 Score</div>
                  <div className="text-2xl font-black text-amber-400 mt-1">{(metrics.f1Score * 100).toFixed(1)}%</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Harmonic mean balance</div>
                </div>
              </div>

              {/* Confusion Matrix */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">
                  Confusion Matrix (Test Evaluation n=964)
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs font-mono text-center">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400">
                        <th className="p-2 text-left font-sans">Ground Truth</th>
                        <th className="p-2 text-emerald-400 font-sans">Pred Low</th>
                        <th className="p-2 text-amber-400 font-sans">Pred Med</th>
                        <th className="p-2 text-rose-400 font-sans">Pred High</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-slate-800/60">
                        <td className="p-2 text-left font-sans text-slate-300 font-semibold">Actual Low</td>
                        <td className="p-2 bg-emerald-500/10 text-emerald-300 font-bold">{metrics.confusionMatrix[0][0]}</td>
                        <td className="p-2 text-slate-400">{metrics.confusionMatrix[0][1]}</td>
                        <td className="p-2 text-slate-500">{metrics.confusionMatrix[0][2]}</td>
                      </tr>
                      <tr className="border-b border-slate-800/60">
                        <td className="p-2 text-left font-sans text-slate-300 font-semibold">Actual Medium</td>
                        <td className="p-2 text-slate-400">{metrics.confusionMatrix[1][0]}</td>
                        <td className="p-2 bg-amber-500/10 text-amber-300 font-bold">{metrics.confusionMatrix[1][1]}</td>
                        <td className="p-2 text-slate-400">{metrics.confusionMatrix[1][2]}</td>
                      </tr>
                      <tr>
                        <td className="p-2 text-left font-sans text-slate-300 font-semibold">Actual High</td>
                        <td className="p-2 text-slate-500">{metrics.confusionMatrix[2][0]}</td>
                        <td className="p-2 text-slate-400">{metrics.confusionMatrix[2][1]}</td>
                        <td className="p-2 bg-rose-500/10 text-rose-300 font-bold">{metrics.confusionMatrix[2][2]}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Class-wise performance */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">
                  Class-Wise Performance Breakdown
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                    <div className="font-bold text-emerald-400 mb-1">Low Risk Class</div>
                    <div className="text-slate-400">Precision: {(metrics.classWise.Low.precision * 100).toFixed(1)}%</div>
                    <div className="text-slate-400">Recall: {(metrics.classWise.Low.recall * 100).toFixed(1)}%</div>
                    <div className="text-slate-300 font-semibold mt-1">F1: {(metrics.classWise.Low.f1 * 100).toFixed(1)}%</div>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                    <div className="font-bold text-amber-400 mb-1">Medium Risk Class</div>
                    <div className="text-slate-400">Precision: {(metrics.classWise.Medium.precision * 100).toFixed(1)}%</div>
                    <div className="text-slate-400">Recall: {(metrics.classWise.Medium.recall * 100).toFixed(1)}%</div>
                    <div className="text-slate-300 font-semibold mt-1">F1: {(metrics.classWise.Medium.f1 * 100).toFixed(1)}%</div>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                    <div className="font-bold text-rose-400 mb-1">High Risk Class</div>
                    <div className="text-slate-400">Precision: {(metrics.classWise.High.precision * 100).toFixed(1)}%</div>
                    <div className="text-slate-400">Recall: {(metrics.classWise.High.recall * 100).toFixed(1)}%</div>
                    <div className="text-slate-300 font-semibold mt-1">F1: {(metrics.classWise.High.f1 * 100).toFixed(1)}%</div>
                  </div>
                </div>
              </div>

              {/* Research Gap Mapping */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Literature Survey & Research Gap Mapping
                </div>
                <div className="space-y-1.5 text-xs text-slate-400 leading-relaxed">
                  <div className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">•</span>
                    <span><strong>Static Analysis Gap:</strong> Addressed via live GPS tracking paired with real-time atmospheric and traffic dynamics.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">•</span>
                    <span><strong>Isolated Hazards Gap:</strong> Solved through multi-hazard ensemble combining hotspot proximity, precipitation, and congestion.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">•</span>
                    <span><strong>Black-Box Predictions:</strong> Resolved via transparent SHAP feature attribution and natural driver summaries.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">•</span>
                    <span><strong>API Failure Dependency:</strong> Handled through automatic caching and clear fallback indicators.</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/70 flex justify-end">
          <button
            id="btn-close-analytics-bottom"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-sm transition-colors"
          >
            Close Analytics
          </button>
        </div>
      </div>
    </div>
  );
};
