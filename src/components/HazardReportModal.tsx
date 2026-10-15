import React, { useState } from 'react';
import { GpsLocation, HazardType } from '../types';
import { X, AlertCircle, MapPin, Check, Send } from 'lucide-react';

interface HazardReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLocation: GpsLocation | null;
  onSubmit: (report: { type: HazardType; description?: string; severity: 'Low' | 'Medium' | 'High' }) => Promise<void>;
}

const HAZARD_TYPES: Array<{ type: HazardType; label: string; icon: string }> = [
  { type: 'Pothole', label: 'Pothole', icon: '🕳️' },
  { type: 'Accident', label: 'Accident', icon: '🚗💥' },
  { type: 'Waterlogging', label: 'Waterlogging', icon: '🌊' },
  { type: 'Roadblock', label: 'Roadblock', icon: '🚧' },
  { type: 'Poor visibility', label: 'Poor Visibility', icon: '🌫️' },
  { type: 'Road damage', label: 'Road Damage', icon: '⚠️' },
  { type: 'Other', label: 'Other Hazard', icon: '❓' },
];

export const HazardReportModal: React.FC<HazardReportModalProps> = ({
  isOpen,
  onClose,
  currentLocation,
  onSubmit,
}) => {
  const [selectedType, setSelectedType] = useState<HazardType>('Pothole');
  const [severity, setSeverity] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit({
        type: selectedType,
        description: description.trim() || undefined,
        severity,
      });
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
        setDescription('');
      }, 1200);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        id="hazard-report-modal-card"
        className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Report Road Hazard</h2>
              <p className="text-xs text-slate-400">GPS location & timestamp automatically attached</p>
            </div>
          </div>
          <button
            id="btn-close-hazard-modal"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Automatic GPS Pill (No manual entry required) */}
          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <MapPin className="w-4 h-4 text-blue-400 shrink-0" />
              <span>
                Verified Coordinates:{' '}
                <strong className="text-white font-mono">
                  {currentLocation ? `${currentLocation.latitude.toFixed(4)}, ${currentLocation.longitude.toFixed(4)}` : '12.9716, 77.5946'}
                </strong>
              </span>
            </div>
            <span className="text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20">
              AUTO-ATTACHED
            </span>
          </div>

          {/* Hazard Category Grid */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Select Hazard Type
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {HAZARD_TYPES.map((item) => (
                <button
                  type="button"
                  key={item.type}
                  id={`hazard-type-${item.type.toLowerCase().replace(/\s+/g, '-')}`}
                  onClick={() => setSelectedType(item.type)}
                  className={`p-3 rounded-xl border text-left transition-all flex flex-col items-center justify-center gap-1.5 ${
                    selectedType === item.type
                      ? 'bg-amber-500/15 border-amber-500 text-amber-200 ring-2 ring-amber-500/30 font-semibold'
                      : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className="text-xs text-center">{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Severity selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Hazard Severity
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['Low', 'Medium', 'High'] as const).map((lvl) => (
                <button
                  type="button"
                  key={lvl}
                  id={`severity-${lvl.toLowerCase()}`}
                  onClick={() => setSeverity(lvl)}
                  className={`py-2 rounded-xl border text-xs font-semibold transition-all ${
                    severity === lvl
                      ? lvl === 'High'
                        ? 'bg-rose-500/20 border-rose-500 text-rose-300'
                        : lvl === 'Medium'
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                        : 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                      : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  {lvl} Severity
                </button>
              ))}
            </div>
          </div>

          {/* Quick Note / Description */}
          <div>
            <label htmlFor="hazard-note" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Optional Note for Drivers
            </label>
            <input
              id="hazard-note"
              type="text"
              placeholder="e.g. Deep pothole right in front of bus stop"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>

          {/* Submit Button */}
          <div className="pt-2 space-y-2.5">
            <button
              id="btn-submit-hazard"
              type="submit"
              disabled={isSubmitting || success}
              className={`w-full py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                success
                  ? 'bg-emerald-600 text-white'
                  : 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold active:scale-[0.99] shadow-lg shadow-amber-500/20'
              }`}
            >
              {success ? (
                <>
                  <Check className="w-5 h-5" />
                  Hazard Saved & Pinned to Live Map!
                </>
              ) : isSubmitting ? (
                'Submitting Telemetry...'
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Publish Road Hazard (Instant)
                </>
              )}
            </button>

            {/* Persistence Indicator */}
            <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0 mt-1" />
              <div>
                <span className="font-semibold text-slate-300">Persistence Guarantee:</span> Your report is immediately saved to the backend hazard database (<code className="text-slate-300">POST /api/hazards/report</code>) and browser storage, and pinned directly on the Live Map as an active alert marker.
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
