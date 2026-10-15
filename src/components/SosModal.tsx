import React, { useState, useEffect } from 'react';
import { GpsLocation, EmergencyFacility, RiskAssessment } from '../types';
import { fetchEmergencyServices, submitSosTrigger } from '../services/api';
import { X, PhoneCall, Navigation, MapPin, ShieldAlert, Check } from 'lucide-react';

interface SosModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLocation: GpsLocation | null;
  risk?: RiskAssessment | null;
}

export const SosModal: React.FC<SosModalProps> = ({ isOpen, onClose, currentLocation, risk }) => {
  const [facilities, setFacilities] = useState<EmergencyFacility[]>([]);
  const [loading, setLoading] = useState(true);
  const [beaconRegistered, setBeaconRegistered] = useState(false);
  const [refId, setRefId] = useState<string | null>(null);
  const [confirmCallTarget, setConfirmCallTarget] = useState<{ name: string; phone: string } | null>(null);
  const [testEmail, setTestEmail] = useState<string>('friend@example.com');
  const [alertTime, setAlertTime] = useState<string>(() => new Date().toLocaleString());
  const [copiedEmergency, setCopiedEmergency] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen) return;

    setAlertTime(new Date().toLocaleString());
    setCopiedEmergency(false);

    const lat = currentLocation?.latitude || 12.9716;
    const lon = currentLocation?.longitude || 77.5946;

    setLoading(true);
    fetchEmergencyServices(lat, lon)
      .then((data) => {
        setFacilities(data.facilities || []);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));

    // Register emergency telemetry beacon with backend
    submitSosTrigger({
      latitude: lat,
      longitude: lon,
      speed: currentLocation?.speed || 0,
      triggerType: 'MANUAL_SOS',
    })
      .then((res) => {
        setBeaconRegistered(true);
        setRefId(res.referenceId);
      })
      .catch(() => {});
  }, [isOpen, currentLocation]);

  if (!isOpen) return null;

  const lat = currentLocation ? currentLocation.latitude.toFixed(5) : '12.97160';
  const lon = currentLocation ? currentLocation.longitude.toFixed(5) : '77.59460';
  const googleMapsLink = `https://www.google.com/maps?q=${lat},${lon}`;
  const currentRiskScore = risk ? `${risk.riskScore}` : '8';
  const currentRiskLevel = risk ? risk.riskLevel : 'LOW';

  const emergencySubject = '🚨 Emergency Alert – GeoAI Road Safety System';

  const emergencyMessage = `Emergency Alert

A possible road emergency has been detected.

Current Location:
Latitude: ${lat}
Longitude: ${lon}

Google Maps Location:
${googleMapsLink}

Risk Score:
${currentRiskScore}

Risk Level:
${currentRiskLevel}

Time:
${alertTime}

Emergency Services:
🚨 Police: 100
🚑 Ambulance: 108
📞 Unified Emergency: 112

Please provide immediate assistance.`;

  const recipientEmail = testEmail.trim() || 'friend@example.com';
  const mailtoHref = `mailto:${recipientEmail}?subject=${encodeURIComponent(emergencySubject)}&body=${encodeURIComponent(emergencyMessage)}`;
  const gmailComposeHref = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(recipientEmail)}&su=${encodeURIComponent(emergencySubject)}&body=${encodeURIComponent(emergencyMessage)}`;

  const handleCopyEmergencyDetails = async () => {
    try {
      await navigator.clipboard.writeText(emergencyMessage);
      setCopiedEmergency(true);
      setTimeout(() => setCopiedEmergency(false), 2500);
    } catch (err) {
      console.error('Failed to copy emergency details:', err);
    }
  };

  const handleInitiateCall = (target: { name: string; phone: string }) => {
    // Prompt confirmation explicitly
    setConfirmCallTarget(target);
  };

  const executeConfirmedCall = () => {
    if (confirmCallTarget) {
      window.location.href = `tel:${confirmCallTarget.phone.replace(/\s+/g, '')}`;
      setConfirmCallTarget(null);
    }
  };

  const handleNavigate = (facility: EmergencyFacility) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${facility.latitude},${facility.longitude}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-rose-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        id="sos-modal-card"
        className="w-full max-w-xl bg-slate-900 border-2 border-rose-600/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-5 border-b border-rose-900/50 flex items-center justify-between bg-rose-950/40">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-rose-600 text-white shadow-lg shadow-rose-600/40 animate-pulse">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white tracking-wide">EMERGENCY ASSISTANCE (SOS)</h2>
              <p className="text-xs text-rose-300">Nearest medical trauma and police response coordination</p>
            </div>
          </div>
          <button
            id="btn-close-sos"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/*Current Verified Location Beacon */}
          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <MapPin className="w-4 h-4 text-rose-400 shrink-0" />
              <div className="text-xs text-slate-300">
                Current Location:{' '}
                <span className="font-mono font-bold text-white">
                  {currentLocation ? `${currentLocation.latitude.toFixed(5)}, ${currentLocation.longitude.toFixed(5)}` : '12.9716, 77.5946'}
                </span>
              </div>
            </div>
            {refId && (
              <span className="text-[10px] font-mono bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded border border-rose-500/30">
                {refId}
              </span>
            )}
          </div>

          {/* Emergency Email Alert (Prototype/Demo Feature) */}
          <div className="p-4 rounded-xl bg-slate-950/90 border border-rose-500/40 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <span>📧</span>
                <span>Emergency Email Alert</span>
              </div>
              <span className="text-[11px] font-medium bg-amber-500/15 text-amber-300 border border-amber-500/30 px-2.5 py-0.5 rounded-md">
                Demo Mode – Emergency alert is sent to a test contact.
              </span>
            </div>

            <div>
              <label htmlFor="sos-test-email" className="block text-xs text-slate-300 font-medium mb-1">
                Test Recipient Email Address
              </label>
              <input
                id="sos-test-email"
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="friend@example.com"
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 font-mono"
              />
            </div>

            <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 space-y-1.5">
              <div className="text-[11px] text-slate-400">
                <span className="font-semibold text-slate-300">Subject:</span> {emergencySubject}
              </div>
              <pre className="text-[11px] text-slate-300 font-mono whitespace-pre-wrap leading-relaxed max-h-40 overflow-y-auto pt-1 border-t border-slate-800">
                {emergencyMessage}
              </pre>
            </div>

            <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2 pt-1">
              <a
                id="btn-send-emergency-gmail"
                href={gmailComposeHref}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-lg shadow-rose-900/30 text-center"
                title="Opens Gmail directly inside your current Chrome tab with the recipient, subject, and location pre-filled"
              >
                <span>📧 Send Emergency Alert (Gmail / Chrome)</span>
              </a>

              <a
                id="btn-send-emergency-email"
                href={mailtoHref}
                className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors text-center"
                title="Opens your system default Mail app via mailto link"
              >
                <span>✉️ Mail App</span>
              </a>

              <button
                type="button"
                id="btn-copy-emergency-details"
                onClick={handleCopyEmergencyDetails}
                className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                {copiedEmergency ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-300">Copied!</span>
                  </>
                ) : (
                  <span>📋 Copy Emergency Details</span>
                )}
              </button>
            </div>
          </div>

          {/* Quick Helpline Numbers */}
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              National Emergency Helplines
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <button
                type="button"
                id="btn-call-112"
                onClick={() => handleInitiateCall({ name: 'Emergency Control Center (112)', phone: '112' })}
                className="p-3 rounded-xl bg-rose-600/15 border border-rose-500/30 hover:bg-rose-600/25 transition-all text-left flex items-center justify-between"
              >
                <div>
                  <div className="text-xs text-rose-300 font-medium">Unified SOS</div>
                  <div className="text-lg font-black text-white font-mono">112</div>
                </div>
                <PhoneCall className="w-4 h-4 text-rose-400" />
              </button>

              <button
                type="button"
                id="btn-call-108"
                onClick={() => handleInitiateCall({ name: 'Ambulance & Paramedic (108)', phone: '108' })}
                className="p-3 rounded-xl bg-emerald-600/15 border border-emerald-500/30 hover:bg-emerald-600/25 transition-all text-left flex items-center justify-between"
              >
                <div>
                  <div className="text-xs text-emerald-300 font-medium">Ambulance</div>
                  <div className="text-lg font-black text-white font-mono">108</div>
                </div>
                <PhoneCall className="w-4 h-4 text-emerald-400" />
              </button>

              <button
                type="button"
                id="btn-call-100"
                onClick={() => handleInitiateCall({ name: 'Highway Patrol / Police (100)', phone: '100' })}
                className="p-3 rounded-xl bg-blue-600/15 border border-blue-500/30 hover:bg-blue-600/25 transition-all text-left flex items-center justify-between"
              >
                <div>
                  <div className="text-xs text-blue-300 font-medium">Police Patrol</div>
                  <div className="text-lg font-black text-white font-mono">100</div>
                </div>
                <PhoneCall className="w-4 h-4 text-blue-400" />
              </button>
            </div>
          </div>

          {/* Nearest Facilities List */}
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Nearest Emergency Facilities (GPS Computed)
            </div>
            <div className="space-y-2.5">
              {loading ? (
                <div className="p-6 text-center text-slate-400 text-xs">Triangulating nearest hospital and police stations...</div>
              ) : (
                facilities.map((fac) => (
                  <div
                    key={fac.id}
                    className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                          fac.type === 'Hospital' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-blue-500/20 text-blue-300'
                        }`}>
                          {fac.type}
                        </span>
                        <span className="text-sm font-bold text-white">{fac.name}</span>
                      </div>
                      <div className="text-xs text-slate-400 mt-1">{fac.address}</div>
                      <div className="text-xs font-medium text-amber-400 mt-0.5">
                        Distance: {fac.distanceKm} km away
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        id={`btn-nav-${fac.id}`}
                        onClick={() => handleNavigate(fac)}
                        className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                      >
                        <Navigation className="w-3.5 h-3.5 text-blue-400" />
                        Navigate
                      </button>
                      <button
                        type="button"
                        id={`btn-call-${fac.id}`}
                        onClick={() => handleInitiateCall({ name: fac.name, phone: fac.phone })}
                        className="px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
                      >
                        <PhoneCall className="w-3.5 h-3.5" />
                        Call
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Safety & Protocol Notice */}
          <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800/80 text-[11px] text-slate-400 leading-relaxed">
            <strong>Driver Protection Protocol:</strong> Calls are only initiated upon explicit user confirmation below. Emergency beacon telemetry is active for tracking.
          </div>
        </div>

        {/* Explicit Confirmation Dialog (Ensures no accidental calling) */}
        {confirmCallTarget && (
          <div className="p-4 bg-rose-950/90 border-t border-rose-800 flex flex-col sm:flex-row items-center justify-between gap-3 animate-in slide-in-from-bottom duration-150">
            <div className="text-xs text-rose-100">
              Confirm outgoing call to <strong>{confirmCallTarget.name}</strong> ({confirmCallTarget.phone})?
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                id="btn-cancel-call"
                onClick={() => setConfirmCallTarget(null)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                id="btn-confirm-call"
                onClick={executeConfirmedCall}
                className="px-4 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-rose-900/40"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                Yes, Place Call
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
