/**
 * Voice Alert Service for GeoAI Driver Safety Assistant
 * Implements Web Speech API with strict cooldowns, risk change detection,
 * and distance-based triggers to prevent repetitive audio annoyance.
 */

class VoiceAlertManager {
  private isMuted: boolean = false;
  private lastSpokenTime: number = 0;
  private lastSpokenRisk: string = 'LOW';
  private lastSpokenHotspotId: string | null = null;
  private minCooldownMs: number = 28000; // 28 seconds minimum cooldown between similar alerts

  constructor() {
    // Load mute preference if available in localStorage
    try {
      const storedMute = localStorage.getItem('geoai_voice_muted');
      if (storedMute !== null) {
        this.isMuted = storedMute === 'true';
      }
    } catch {
      // Ignore in strict environments
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    try {
      localStorage.setItem('geoai_voice_muted', String(muted));
    } catch {
      // safe ignore
    }
    if (muted && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public triggerAlert(
    currentRisk: 'LOW' | 'MEDIUM' | 'HIGH',
    customMessage?: string | null,
    hotspotId?: string | null
  ) {
    if (this.isMuted) return;
    if (!('speechSynthesis' in window)) return;

    const now = Date.now();
    const isRiskEscalation = (this.lastSpokenRisk !== 'HIGH' && currentRisk === 'HIGH');
    const isNewHotspot = (hotspotId && hotspotId !== this.lastSpokenHotspotId);
    const cooldownElapsed = (now - this.lastSpokenTime) > this.minCooldownMs;

    // Speak on elevated risk conditions (HIGH or MEDIUM caution)
    if (currentRisk === 'HIGH') {
      if (isRiskEscalation || isNewHotspot || cooldownElapsed || this.lastSpokenRisk !== 'HIGH') {
        const textToSpeak = customMessage || "Warning. High accident risk ahead. Please slow down.";
        this.speak(textToSpeak);
        this.lastSpokenTime = now;
        this.lastSpokenRisk = currentRisk;
        if (hotspotId) {
          this.lastSpokenHotspotId = hotspotId;
        }
      }
    } else if (currentRisk === 'MEDIUM') {
      const isModerateEscalation = this.lastSpokenRisk === 'LOW' || this.lastSpokenRisk === 'HIGH' || cooldownElapsed;
      if (isModerateEscalation && customMessage) {
        this.speak(customMessage);
        this.lastSpokenTime = now;
        this.lastSpokenRisk = currentRisk;
      } else {
        this.lastSpokenRisk = currentRisk;
      }
    } else {
      this.lastSpokenRisk = currentRisk;
    }
  }

  public speak(text: string) {
    if (this.isMuted) return;
    if (!('speechSynthesis' in window)) return;

    try {
      window.speechSynthesis.cancel(); // Cancel any lingering utterance
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      // Select natural English voice if available
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(v => 
        (v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha')))
      );
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn("Speech synthesis error:", err);
    }
  }
}

export const voiceManager = new VoiceAlertManager();
