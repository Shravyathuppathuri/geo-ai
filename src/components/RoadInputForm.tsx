import React, { useState, useEffect } from 'react';
import { RoadSafetyInputs } from '../types';
import { 
  Navigation, 
  CloudRain, 
  Car, 
  Gauge, 
  Sun, 
  MapPin, 
  Sliders, 
  Eye, 
  Sparkles, 
  CornerDownRight, 
  ShieldAlert,
  Loader2
} from 'lucide-react';

interface RoadInputFormProps {
  initialValues: RoadSafetyInputs;
  onSubmit: (values: RoadSafetyInputs) => Promise<void>;
  isLoading: boolean;
}

interface ScenarioPreset {
  id: string;
  name: string;
  badge: string;
  badgeColor: string;
  values: RoadSafetyInputs;
}

const PRESETS: ScenarioPreset[] = [
  {
    id: 'preset-clear-safe',
    name: 'Daylight Clear Arterial Free-Flow',
    badge: '🟢 LOW RISK (Safe)',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    values: {
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
    },
  },
  {
    id: 'preset-moderate-flow',
    name: 'Steady Traffic Flow & Damp Surface',
    badge: '🟡 MODERATE RISK (Caution)',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    values: {
      latitude: 17.3850,
      longitude: 78.4867,
      weatherCondition: 'Clear',
      trafficCondition: 'Moderate',
      roadCondition: 'Wet',
      visibility: 'Moderate',
      speed: 48,
      timeOfDay: 'Peak Hours',
      roadType: 'Urban',
      junctionType: 'T-Junction',
    },
  },
  {
    id: 'preset-hyd-rain',
    name: 'Hyderabad Urban Rain & Heavy Traffic',
    badge: '🔴 HIGH RISK (Warning)',
    badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    values: {
      latitude: 17.3850,
      longitude: 78.4867,
      weatherCondition: 'Rain',
      trafficCondition: 'Heavy',
      roadCondition: 'Poor',
      visibility: 'Low',
      speed: 62,
      timeOfDay: 'Night',
      roadType: 'Urban',
      junctionType: '4-Way Intersection',
    },
  },
  {
    id: 'preset-night-fog',
    name: 'Expressway Night Fog & High Speed',
    badge: '🔴 HIGH RISK (Severe Fog)',
    badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    values: {
      latitude: 17.4435,
      longitude: 78.4682,
      weatherCondition: 'Fog / Mist',
      trafficCondition: 'Low',
      roadCondition: 'Wet',
      visibility: 'Low',
      speed: 80,
      timeOfDay: 'Night',
      roadType: 'Highway',
      junctionType: 'Midblock',
    },
  },
];

export const RoadInputForm: React.FC<RoadInputFormProps> = ({
  initialValues,
  onSubmit,
  isLoading,
}) => {
  const [formData, setFormData] = useState<RoadSafetyInputs>(initialValues);
  const [activePreset, setActivePreset] = useState<string>('preset-clear-safe');

  useEffect(() => {
    setFormData(initialValues);
  }, [initialValues]);

  const handlePresetSelect = (preset: ScenarioPreset) => {
    setActivePreset(preset.id);
    setFormData(preset.values);
    onSubmit(preset.values);
  };

  const handleChange = <K extends keyof RoadSafetyInputs>(key: K, value: RoadSafetyInputs[K]) => {
    setActivePreset('');
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div id="road-inputs-card" className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-black text-white uppercase tracking-wider">ROAD RISK ANALYSIS</h2>
            <p className="text-[11px] text-slate-400">Configure road, atmospheric, and telemetry parameters</p>
          </div>
        </div>
      </div>

      {/* Quick Scenario Presets */}
      <div className="p-4 border-b border-slate-800 bg-slate-950/30">
        <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-blue-400" />
          Test Scenario Presets (Quick-Pick for Demonstration):
        </div>
        <div className="grid grid-cols-2 gap-2">
          {PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              id={`btn-preset-${preset.id}`}
              onClick={() => handlePresetSelect(preset)}
              className={`p-2.5 rounded-xl border text-left transition-all ${
                activePreset === preset.id
                  ? 'bg-blue-600/15 border-blue-500/50 shadow-sm'
                  : 'bg-slate-800/40 border-slate-800 hover:border-slate-700 hover:bg-slate-800/70'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-white truncate">{preset.name}</span>
              </div>
              <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold border ${preset.badgeColor}`}>
                {preset.badge}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Input Form Fields */}
      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        {/* Coordinates Row */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-red-400" />
              Latitude (°N)
            </label>
            <input
              id="input-latitude"
              type="number"
              step="0.0001"
              value={formData.latitude}
              onChange={(e) => handleChange('latitude', parseFloat(e.target.value) || 0)}
              required
              className="w-full px-3 py-2 text-xs font-mono bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-colors"
              placeholder="17.3850"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-red-400" />
              Longitude (°E)
            </label>
            <input
              id="input-longitude"
              type="number"
              step="0.0001"
              value={formData.longitude}
              onChange={(e) => handleChange('longitude', parseFloat(e.target.value) || 0)}
              required
              className="w-full px-3 py-2 text-xs font-mono bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-colors"
              placeholder="78.4867"
            />
          </div>
        </div>

        {/* Weather & Traffic Row */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1 flex items-center gap-1">
              <CloudRain className="w-3 h-3 text-blue-400" />
              Weather Condition
            </label>
            <select
              id="select-weather"
              value={formData.weatherCondition}
              onChange={(e) => handleChange('weatherCondition', e.target.value as any)}
              className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-colors"
            >
              <option value="Clear">Clear / Fair</option>
              <option value="Rain">Rain (Light/Moderate)</option>
              <option value="Heavy Rain">Heavy Rain (Downpour)</option>
              <option value="Fog / Mist">Fog / Mist</option>
              <option value="Thunderstorm">Thunderstorm</option>
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1 flex items-center gap-1">
              <Car className="w-3 h-3 text-amber-400" />
              Traffic Condition
            </label>
            <select
              id="select-traffic"
              value={formData.trafficCondition}
              onChange={(e) => handleChange('trafficCondition', e.target.value as any)}
              className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-colors"
            >
              <option value="Low">Low (Free Flow)</option>
              <option value="Moderate">Moderate (Steady Flow)</option>
              <option value="Heavy">Heavy (Congested / Stop-Go)</option>
              <option value="Severe">Severe (Gridlock / Jam)</option>
            </select>
          </div>
        </div>

        {/* Road Condition & Visibility Row */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1 flex items-center gap-1">
              <Navigation className="w-3 h-3 text-emerald-400" />
              Road Surface Quality
            </label>
            <select
              id="select-road-condition"
              value={formData.roadCondition}
              onChange={(e) => handleChange('roadCondition', e.target.value as any)}
              className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-colors"
            >
              <option value="Good">Good / Intact Asphalt</option>
              <option value="Wet">Wet / Damp Surface</option>
              <option value="Poor">Poor / Potholes & Cracks</option>
              <option value="Severe Damage">Severe Structural Damage</option>
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1 flex items-center gap-1">
              <Eye className="w-3 h-3 text-cyan-400" />
              Optical Visibility
            </label>
            <select
              id="select-visibility"
              value={formData.visibility}
              onChange={(e) => handleChange('visibility', e.target.value as any)}
              className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-colors"
            >
              <option value="Normal">Normal / High (&gt; 8 km)</option>
              <option value="Moderate">Moderate (3 – 5 km)</option>
              <option value="Low">Low / Restricted (&lt; 2 km)</option>
            </select>
          </div>
        </div>

        {/* Speed, Time, Road Type Row */}
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1 flex items-center gap-1">
              <Gauge className="w-3 h-3 text-orange-400" />
              Speed (km/h)
            </label>
            <input
              id="input-speed"
              type="number"
              min="0"
              max="160"
              value={formData.speed}
              onChange={(e) => handleChange('speed', parseInt(e.target.value, 10) || 0)}
              required
              className="w-full px-3 py-2 text-xs font-mono bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-colors"
              placeholder="60"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1 flex items-center gap-1">
              <Sun className="w-3 h-3 text-yellow-400" />
              Time of Day
            </label>
            <select
              id="select-time-of-day"
              value={formData.timeOfDay}
              onChange={(e) => handleChange('timeOfDay', e.target.value as any)}
              className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-colors"
            >
              <option value="Day">Daylight</option>
              <option value="Peak Hours">Peak Rush Hours</option>
              <option value="Night">Night (Darkness)</option>
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1 flex items-center gap-1">
              <CornerDownRight className="w-3 h-3 text-purple-400" />
              Road Type
            </label>
            <select
              id="select-road-type"
              value={formData.roadType}
              onChange={(e) => handleChange('roadType', e.target.value as any)}
              className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-colors"
            >
              <option value="Urban">Urban Arterial</option>
              <option value="Highway">Highway / Expressway</option>
              <option value="Rural">Rural / Secondary</option>
            </select>
          </div>
        </div>

        {/* Junction Type */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-300 mb-1">
            Junction / Intersection Configuration
          </label>
          <select
            id="select-junction-type"
            value={formData.junctionType}
            onChange={(e) => handleChange('junctionType', e.target.value as any)}
            className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-colors"
          >
            <option value="Midblock">Midblock / Straight Corridor (No Immediate Junction)</option>
            <option value="4-Way Intersection">4-Way Traffic Signal Intersection</option>
            <option value="T-Junction">T-Junction / Turning Arterial</option>
            <option value="Roundabout">Rotary / Roundabout Merge</option>
          </select>
        </div>

        {/* Submit Button */}
        <button
          id="btn-analyze-road-risk"
          type="submit"
          disabled={isLoading}
          className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Analyzing Road Risk...</span>
            </>
          ) : (
            <>
              <span>🔍</span>
              <span className="tracking-wide">Analyze Road Risk</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};
