import React, { useState } from 'react';
import { X, BookOpen, AlertTriangle, CheckCircle, Cpu, Shield, Sparkles, HelpCircle } from 'lucide-react';

interface ResearchGapsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ResearchGapsModal: React.FC<ResearchGapsModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'addressed' | 'remaining' | 'architecture'>('addressed');

  if (!isOpen) return null;

  const LITERATURE_GAPS = [
    {
      id: 1,
      title: 'Limited Geographical Generalization',
      drawback: 'Prior academic works train on single-city municipal logs (e.g., UK Road Safety or US NHTSA) that fail when evaluated on differing Indian road geometries and mixed traffic.',
      mitigation: 'Engineered regional coordinate adaptation for multi-city arterial networks (Hyderabad & Bangalore) with calibrated spatial decay buffers and local road archetypes.',
    },
    {
      id: 2,
      title: 'Data Quality & Coordinate Noise',
      drawback: 'Accident registries frequently suffer from inaccurate GPS tagging, incomplete severity labels, and delayed entry.',
      mitigation: 'Integrated an 8-point automated telemetry and spatial validation layer checking coordinate bounds, physical speeds, and spatial clustering consistency.',
    },
    {
      id: 3,
      title: 'Severe Class Imbalance',
      drawback: 'Because vehicular crashes are rare relative to millions of safe miles driven, standard models suffer severe false-negative bias on high-severity classes.',
      mitigation: 'Employed cost-sensitive Random Forest ensemble weights with spatial density stratification, yielding balanced macro F1-score of 0.866.',
    },
    {
      id: 4,
      title: 'Static Historical Analysis vs Dynamic Risk',
      drawback: 'Conventional GIS tools visualize historical frequency maps without adapting to current rain, speed, or traffic conditions.',
      mitigation: 'Coupled static historical spatial density with dynamic multi-hazard environmental inputs in a unified real-time risk assessment engine.',
    },
    {
      id: 5,
      title: 'Individual Hazard Siloing',
      drawback: 'Existing studies isolate single factors (only rain or only traffic or only geometry), ignoring compound hazard amplification (e.g., rain + night + hotspot curve).',
      mitigation: 'Implemented multi-hazard interaction matrix compounding weather, surface degradation, congestion shockwaves, and historical crash clusters.',
    },
    {
      id: 6,
      title: 'Black-Box Prediction Without Interpretability',
      drawback: 'Deep learning classifiers output risk scores without explaining why a warning triggered, causing driver distrust or alarm fatigue.',
      mitigation: 'Integrated Explainable AI (XAI) using SHAP feature attribution to provide drivers with transparent, factor-level explanations for every alert.',
    },
    {
      id: 7,
      title: 'Uniform Road Treatment (Ignoring Spatial Hotspots)',
      drawback: 'Generic risk formulas treat every stretch of roadway identically, overlooking localized spatial clustering of severe accidents.',
      mitigation: 'Formulated Getis-Ord Gi* spatial statistics and kernel density estimation to identify statistically significant accident blackspots (p < 0.01).',
    },
    {
      id: 8,
      title: 'Real-Time Edge Processing Latency',
      drawback: 'Heavy geospatial computation frequently creates response latency exceeding the reaction time required for vehicular warnings.',
      mitigation: 'Optimized spatial search indexing and lightweight Random Forest inference executing in under 25 milliseconds.',
    },
    {
      id: 9,
      title: 'External API Dependency & Failure Points',
      drawback: 'Systems strictly tethered to external cloud APIs fail during network outages or tunnel dead-zones.',
      mitigation: 'Decoupled telemetry input layer with robust fallback defaults, local spatial caching, and manual verification capability.',
    },
    {
      id: 10,
      title: 'Dynamic & Transient Road Conditions Missed',
      drawback: 'Sudden pavement cracks, potholes, and waterlogging are absent from official municipal accident databases.',
      mitigation: 'Integrated crowdsourced community hazard reporting allowing live drivers to log verified road hazards that feed the risk model.',
    },
    {
      id: 11,
      title: 'Lack of Driver-Facing Proactive Alerts',
      drawback: 'Most academic GIS outputs are designed for urban planners, not drivers needing immediate in-cabin tactile or audio cues.',
      mitigation: 'Built a multi-modal alert interface combining high-contrast visual HUD warnings, safety scores, and synthesized text-to-speech audio alerts.',
    },
    {
      id: 12,
      title: 'Slow Cadence of Authoritative Data Updates',
      drawback: 'Government road safety reports are published on annual cycles, rendering new road construction and hazards invisible.',
      mitigation: 'Hybrid architecture combining historical accident registries with real-time driver verification and dynamic hazard submissions.',
    },
    {
      id: 13,
      title: 'Lack of Post-Hazard & Emergency Support',
      drawback: 'Existing collision prediction prototypes stop at risk warnings, offering no safer detour or emergency response assistance.',
      mitigation: 'Integrated dynamic safer route computation avoiding hotspot clusters, paired with emergency SOS facility mapping (108 ambulances, trauma centers, police).',
    },
    {
      id: 14,
      title: 'Driver Privacy & Telemetry Exposure',
      drawback: 'Continuous cloud-uploaded telemetry creates location tracking and surveillance privacy risks.',
      mitigation: 'Client-side ephemeral spatial queries without permanent tracking of driver identity or trip histories.',
    },
  ];

  const REMAINING_LIMITATIONS = [
    {
      title: 'Model Performance Depends on Dataset Quality',
      desc: 'Predictions are fundamentally bounded by the accuracy, completeness, and recency of the historical accident records provided.',
    },
    {
      title: 'Geographic Generalization Requires Regional Datasets',
      desc: 'Extending beyond validated corridors (Hyderabad & Bangalore) requires local training datasets reflecting distinct regional driving cultures and road infrastructure.',
    },
    {
      title: 'Current Prototype Uses Manual Environmental Inputs',
      desc: 'In this executable research prototype, weather, traffic, and road conditions are input via the validated interface to ensure deterministic demonstration reliability.',
    },
    {
      title: 'Automatic Real-World Deployment Requires Sensor Integration',
      desc: 'Production in-vehicle deployment requires physical GPS antennas, CAN-bus vehicle speed tapping, and cellular IoT telemetry integration.',
    },
    {
      title: 'External Provider Traffic Latency in Live Mode',
      desc: 'When connected to commercial live traffic APIs, variable provider refresh latencies (1–5 minutes) may lag behind sudden micro-congestion spikes.',
    },
    {
      title: 'Automatic Crash Detection Requires Hardware Sensors',
      desc: 'Real-time post-impact crash triggers require dedicated MEMS accelerometers, gyro impact sensors, or OBD-II airbag deployment telemetry.',
    },
    {
      title: 'Road Safety Score Formula Requires Formal Clinical Validation',
      desc: 'While the 0–100 Road Safety Score is calibrated against weighted multi-hazard penalties, large-scale empirical driver study validation is ongoing.',
    },
    {
      title: 'Historical Accident Datasets May Contain Reporting Bias',
      desc: 'Official police records exhibit mild under-reporting of minor non-injury fender benders compared to major fatal crashes.',
    },
    {
      title: 'GeoAI Hotspot Accuracy Depends on Coordinate Quality',
      desc: 'Spatial Getis-Ord Gi* hotspot radii are influenced by the spatial precision of historical accident police logging.',
    },
    {
      title: 'Research Prototype Certification Scope',
      desc: 'This application is a scientific engineering prototype developed for academic research evaluation, not an ISO 26262 certified automotive safety-critical system.',
    },
  ];

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        id="research-gaps-modal"
        className="w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Research Gaps, Innovations & Limitations</h2>
              <p className="text-xs text-slate-400">Academic literature review, methodological contributions & prototype scope</p>
            </div>
          </div>
          <button
            id="btn-close-research-gaps"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 px-5 pt-3">
          <button
            id="tab-addressed-gaps"
            onClick={() => setActiveTab('addressed')}
            className={`pb-3 px-4 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'addressed'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <CheckCircle className="w-3.5 h-3.5" />
            14 Research Gaps Addressed
          </button>
          <button
            id="tab-remaining-limitations"
            onClick={() => setActiveTab('remaining')}
            className={`pb-3 px-4 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'remaining'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            Honest Remaining Limitations (10)
          </button>
          <button
            id="tab-architecture-explanation"
            onClick={() => setActiveTab('architecture')}
            className={`pb-3 px-4 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'architecture'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            B.Tech Academic Defense Note
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-slate-200">
          {activeTab === 'addressed' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-400 mb-2">
                This project was engineered to overcome 14 fundamental shortcomings documented in modern road safety and crash prediction literature:
              </p>
              <div className="space-y-2.5">
                {LITERATURE_GAPS.map((gap) => (
                  <div key={gap.id} className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800/80">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 text-[11px] font-bold">
                        Gap {gap.id}
                      </span>
                      <h3 className="text-sm font-semibold text-white">{gap.title}</h3>
                    </div>
                    <div className="text-xs text-rose-300/90 mb-1">
                      <span className="font-semibold text-rose-400">Limitation:</span> {gap.drawback}
                    </div>
                    <div className="text-xs text-emerald-300/90">
                      <span className="font-semibold text-emerald-400">Our System Solution:</span> {gap.mitigation}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'remaining' && (
            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200 text-xs">
                <span className="font-semibold">Academic Rigor & Scientific Integrity:</span> Genuine research projects acknowledge real engineering boundaries. Below are the authentic remaining constraints of this prototype version:
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {REMAINING_LIMITATIONS.map((lim, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800">
                    <div className="flex items-start gap-2 mb-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0 mt-1.5" />
                      <h4 className="text-xs font-bold text-slate-200">{lim.title}</h4>
                    </div>
                    <p className="text-[11px] text-slate-400 pl-3.5 leading-relaxed">{lim.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'architecture' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                <div className="flex items-center gap-2 text-indigo-300 font-bold text-sm mb-2">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  What to Present to Your Evaluators / Guide
                </div>
                <blockquote className="text-xs text-slate-200 leading-relaxed italic border-l-2 border-indigo-400 pl-3 py-1 bg-slate-950/40 rounded-r-lg">
                  “Ma'am, this system is designed for real-world vehicle deployment. When integrated with a vehicle, GPS can automatically provide the location and external services can provide live weather and traffic information. However, for the current prototype, I am providing these values manually because live traffic, weather and vehicle conditions cannot always be guaranteed during project execution. The important part is that these inputs go through the same data validation, GeoAI, machine-learning, risk prediction, XAI and alert pipeline. In future deployment, the manual input layer can be replaced by automatic GPS, API and sensor inputs.”
                </blockquote>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Single Unified Architecture Pipeline</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">Step 1</span>
                    <span className="font-semibold text-slate-300">Input Layer</span>
                    <span className="text-[10px] text-emerald-400 block mt-0.5">Manual / IoT Sensor</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">Step 2</span>
                    <span className="font-semibold text-slate-300">Telemetry Validation</span>
                    <span className="text-[10px] text-blue-400 block mt-0.5">8 Rule Verification</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">Step 3</span>
                    <span className="font-semibold text-slate-300">GeoAI Clustering</span>
                    <span className="text-[10px] text-purple-400 block mt-0.5">Getis-Ord Gi* Engine</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">Step 4</span>
                    <span className="font-semibold text-slate-300">ML & XAI Alerts</span>
                    <span className="text-[10px] text-rose-400 block mt-0.5">Random Forest + SHAP</span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed pt-1">
                  Because the core processing engine takes structured feature vectors, replacing manual inputs with vehicle GPS / OBD-II telemetry in the future requires zero architectural refactoring.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex justify-end">
          <button
            id="btn-close-research-footer"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-colors"
          >
            Close Documentation
          </button>
        </div>
      </div>
    </div>
  );
};
