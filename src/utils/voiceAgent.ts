/**
 * PLANT AND MACHINERY - AI Text-Input + Audio-Response Engine
 * Zero microphone recording or speech-to-text code.
 * Supports:
 * - Dual Response Mode: "Audio + Text Reply" (default) vs "Text Only"
 * - Audio Output Tuning: Normal Speaker Mode (default, no headphones) vs Headphone Mode
 * - Gents Voice Models: Fenrir (Senior Chief Engineer), Puck (Field Manager), Charon (Technical Specialist)
 * - Autoplay-safe unlocking on user Send/Click gesture (AudioContext + shared HTMLAudioElement + speechSynthesis)
 * - Per-message Play / Pause / Stop / Replay Audio controls with instant WAV caching
 */

export type AudioOutputMode = 'headphone' | 'speaker';
export type ResponseMode = 'audio-text' | 'text-only';
export type GentsVoiceType = 'fenrir' | 'puck' | 'charon';

export interface VoiceState {
  isPlaying: boolean;
  isPaused: boolean;
  isLoading: boolean;
  currentMessageId: string | null;
  currentSpeechText: string;
  voiceName: string; // 'Fenrir' | 'Puck' | 'Charon' | 'Zephyr' | 'Kore'
  audioOutputMode: AudioOutputMode; // 'speaker' | 'headphone'
  responseMode: ResponseMode; // 'audio-text' | 'text-only'
  source: 'gemini-tts' | 'web-speech' | 'none';
  speedRate: number;
}

export type VoiceStateListener = (state: VoiceState) => void;

const SILENT_WAV_DATA_URI =
  'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA';

class VoiceAgentEngine {
  private sharedAudio: HTMLAudioElement | null = null;
  private audioContext: AudioContext | null = null;
  private activeBufferSource: AudioBufferSourceNode | null = null;
  private activeBackend: 'html-audio' | 'audio-context' | 'web-speech' | null = null;
  private playToken = 0;
  private audioCache: Map<string, { audioData: string; mimeType: string }> = new Map();
  private listeners: Set<VoiceStateListener> = new Set();

  private state: VoiceState = {
    isPlaying: false,
    isPaused: false,
    isLoading: false,
    currentMessageId: null,
    currentSpeechText: '',
    voiceName: 'Fenrir', // Default: Senior Chief P&M Engineer (Gents Voice)
    audioOutputMode: 'speaker', // Default: Normal Speaking Mode (No Headphone Required)
    responseMode: 'audio-text', // Default: Audio + Text Reply
    source: 'none',
    speedRate: 1.0,
  };

  constructor() {
    if (typeof window !== 'undefined') {
      const savedVoice = localStorage.getItem('pm_voice_name');
      if (savedVoice) this.state.voiceName = savedVoice;

      const savedOutputMode = localStorage.getItem('pm_audio_mode') as AudioOutputMode;
      this.state.audioOutputMode = savedOutputMode === 'headphone' ? 'headphone' : 'speaker';

      const savedResponseMode = localStorage.getItem('pm_response_mode') as ResponseMode;
      this.state.responseMode = savedResponseMode === 'text-only' ? 'text-only' : 'audio-text';

      const savedRate = localStorage.getItem('pm_voice_rate');
      if (savedRate) this.state.speedRate = parseFloat(savedRate) || 1.0;

      // Pre-load speechSynthesis voice list if available
      if ('speechSynthesis' in window) {
        try {
          window.speechSynthesis.getVoices();
        } catch (_) {}
      }
    }
  }

  public subscribe(listener: VoiceStateListener): () => void {
    this.listeners.add(listener);
    listener({ ...this.state });
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    const snapshot = { ...this.state };
    for (const listener of this.listeners) {
      listener(snapshot);
    }
  }

  /**
   * Synchronously unlock AudioContext, HTMLAudioElement, and window.speechSynthesis
   * inside a user interaction (e.g. Send button click / Enter key / Play click)
   * so async audio playback after API responses is never blocked by browser autoplay policies.
   */
  public unlockAudio() {
    if (typeof window === 'undefined') return;

    // 1. Unlock Web Audio API AudioContext
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        if (!this.audioContext) {
          this.audioContext = new AudioCtx();
        }
        if (this.audioContext.state === 'suspended') {
          this.audioContext.resume().catch(() => {});
        }
        const buffer = this.audioContext.createBuffer(1, 1, 22050);
        const source = this.audioContext.createBufferSource();
        source.buffer = buffer;
        source.connect(this.audioContext.destination);
        source.start(0);
      }
    } catch (_) {}

    // 2. Unlock persistent HTMLAudioElement
    try {
      if (!this.sharedAudio) {
        this.sharedAudio = new Audio();
        this.sharedAudio.preload = 'auto';
      }
      if (!this.state.isPlaying && !this.state.isPaused && !this.state.isLoading) {
        this.sharedAudio.src = SILENT_WAV_DATA_URI;
        const p = this.sharedAudio.play();
        if (p && typeof p.then === 'function') {
          p.then(() => {
            if (!this.state.isPlaying && !this.state.isLoading && this.sharedAudio) {
              this.sharedAudio.pause();
            }
          }).catch(() => {});
        }
      }
    } catch (_) {}

    // 3. Unlock browser SpeechSynthesis
    try {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.getVoices();
        if (!window.speechSynthesis.speaking) {
          const primer = new SpeechSynthesisUtterance('');
          primer.volume = 0;
          window.speechSynthesis.speak(primer);
        }
      }
    } catch (_) {}
  }

  public setVoiceName(voiceName: string) {
    this.state.voiceName = voiceName;
    if (typeof window !== 'undefined') {
      localStorage.setItem('pm_voice_name', voiceName);
    }
    this.notify();
  }

  public setAudioOutputMode(mode: AudioOutputMode) {
    this.state.audioOutputMode = mode;
    if (typeof window !== 'undefined') {
      localStorage.setItem('pm_audio_mode', mode);
    }
    if (mode === 'speaker') {
      if (this.state.voiceName === 'Kore') this.state.voiceName = 'Fenrir';
    } else {
      if (this.state.voiceName === 'Puck') this.state.voiceName = 'Fenrir';
    }
    this.notify();
  }

  public setResponseMode(mode: ResponseMode) {
    this.state.responseMode = mode;
    if (typeof window !== 'undefined') {
      localStorage.setItem('pm_response_mode', mode);
    }
    if (mode === 'text-only') {
      this.stop();
    } else {
      this.notify();
    }
  }

  public setSpeedRate(rate: number) {
    this.state.speedRate = rate;
    if (this.sharedAudio) {
      this.sharedAudio.playbackRate = rate;
    }
    if (this.activeBufferSource) {
      try {
        this.activeBufferSource.playbackRate.value = rate;
      } catch (_) {}
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem('pm_voice_rate', rate.toString());
    }
    this.notify();
  }

  /**
   * Cleans technical markdown tables, headers, and bullet points into natural spoken engineering English.
   */
  public cleanTextForSpeech(text: string): string {
    if (!text) return '';

    let clean = text
      .replace(/```[\s\S]*?```/g, '')
      .replace(/^#+\s+/gm, '')
      .replace(/[*_~`]/g, '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/\|[^\n]+\|/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    clean = clean
      .replace(/\bP&M\b/g, 'Plant and Machinery')
      .replace(/\bNHAI\b/g, 'N-H-A-I Highway')
      .replace(/\bHMR\b/g, 'Hour Meter Reading')
      .replace(/\bLOTO\b/g, 'Lockout Tagout')
      .replace(/\bTBM\b/g, 'Tunnel Boring Machine')
      .replace(/\bEPB\b/g, 'Earth Pressure Balance')
      .replace(/\bSLG\b/g, 'Segment Launching Girder')
      .replace(/\bHDD\b/g, 'Horizontal Directional Drilling')
      .replace(/\bTPH\b/g, 'Tons per Hour')
      .replace(/\bRMC\b/g, 'Ready Mix Concrete')
      .replace(/\bHMP\b/g, 'Hot Mix Plant')
      .replace(/\bWMM\b/g, 'Wet Mix Macadam')
      .replace(/\bDG\b/g, 'Diesel Generator')
      .replace(/\bLMI\b/g, 'Load Moment Indicator')
      .replace(/\bMTTR\b/g, 'Mean Time to Repair')
      .replace(/\bMTBF\b/g, 'Mean Time Between Failures')
      .replace(/\bRCA\b/g, 'Root Cause Analysis')
      .replace(/\bOEM\b/g, 'Original Equipment Manufacturer')
      .replace(/₹/g, 'Rupees ');

    return clean;
  }

  /**
   * Speak technical text aloud using Gemini TTS API with unlocked AudioContext/HTMLAudio playback
   * and automatic Web Speech Synthesis fallback.
   */
  public async speak(
    rawText: string,
    options?: {
      messageId?: string;
      voiceName?: string;
      outputMode?: AudioOutputMode;
      forceRefresh?: boolean;
      onStart?: () => void;
      onEnd?: () => void;
      onError?: (err: unknown) => void;
    }
  ): Promise<void> {
    this.stop();
    const token = ++this.playToken;

    const clean = this.cleanTextForSpeech(rawText);
    if (!clean) return;

    let speechPrompt = clean;
    if (speechPrompt.length > 750) {
      const sentenceEnd = speechPrompt.indexOf('.', 550);
      speechPrompt =
        sentenceEnd !== -1 ? speechPrompt.slice(0, sentenceEnd + 1) : speechPrompt.slice(0, 650) + '...';
    }

    const voice = options?.voiceName || this.state.voiceName || 'Fenrir';
    const mode = options?.outputMode || this.state.audioOutputMode || 'speaker';
    const messageId = options?.messageId || null;

    const engineeringStyle =
      mode === 'headphone'
        ? 'Deep, crisp, close-mic authoritative Indian chief plant and machinery engineer speaking into a professional headset. High diction, balanced treble, clear calm delivery.'
        : 'Normal Speaking Mode: Resonant, loud, clear Indian male Chief Plant and Machinery Engineer speaking naturally through a phone, tablet, or laptop loudspeaker without headphones on an Indian construction site. High acoustic presence and clear diction.';

    this.state.isLoading = true;
    this.state.currentMessageId = messageId;
    this.state.currentSpeechText = speechPrompt;
    this.notify();

    const cacheKey = `${voice}:${mode}:${speechPrompt}`;

    try {
      let cached = !options?.forceRefresh ? this.audioCache.get(cacheKey) : undefined;

      if (!cached) {
        const res = await fetch('/api/voice/speak', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: speechPrompt,
            voiceName: voice,
            audioOutputMode: mode,
            style: engineeringStyle,
          }),
        });

        if (token !== this.playToken) return;

        const data = await res.json();
        if (data.success && data.audioData) {
          cached = {
            audioData: data.audioData,
            mimeType: data.mimeType || 'audio/wav',
          };
          if (this.audioCache.size >= 30) {
            const oldestKey = this.audioCache.keys().next().value;
            if (oldestKey) this.audioCache.delete(oldestKey);
          }
          this.audioCache.set(cacheKey, cached);
        }
      }

      if (token !== this.playToken) return;

      if (cached?.audioData) {
        const played = await this.playWavBase64(cached.audioData, cached.mimeType, token, options);
        if (played) return;
      }

      if (token !== this.playToken) return;
      this.fallbackWebSpeech(speechPrompt, mode, token, options);
    } catch (err) {
      if (token !== this.playToken) return;
      console.warn('TTS request error, falling back to browser Web Speech API:', err);
      this.fallbackWebSpeech(speechPrompt, mode, token, options);
    }
  }

  private async playWavBase64(
    base64Audio: string,
    mimeType: string,
    token: number,
    options?: {
      onStart?: () => void;
      onEnd?: () => void;
      onError?: (err: unknown) => void;
    }
  ): Promise<boolean> {
    // Attempt 1: Unlocked persistent HTMLAudioElement
    try {
      if (!this.sharedAudio) {
        this.sharedAudio = new Audio();
      }
      const audio = this.sharedAudio;
      audio.src = `data:${mimeType};base64,${base64Audio}`;
      audio.playbackRate = this.state.speedRate;

      audio.onplay = () => {
        if (token !== this.playToken) return;
        this.activeBackend = 'html-audio';
        this.state.isLoading = false;
        this.state.isPlaying = true;
        this.state.isPaused = false;
        this.state.source = 'gemini-tts';
        this.notify();
        options?.onStart?.();
      };

      audio.onended = () => {
        if (token !== this.playToken) return;
        this.activeBackend = null;
        this.state.isPlaying = false;
        this.state.isPaused = false;
        this.state.isLoading = false;
        this.state.currentMessageId = null;
        this.notify();
        options?.onEnd?.();
      };

      audio.onerror = () => {
        if (token !== this.playToken) return;
        this.activeBackend = null;
      };

      await audio.play();
      return true;
    } catch (htmlAudioErr) {
      console.warn('HTMLAudioElement playback blocked or failed, trying unlocked AudioContext:', htmlAudioErr);
    }

    // Attempt 2: Unlocked Web Audio API AudioContext
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return false;

      if (!this.audioContext) {
        this.audioContext = new AudioCtx();
      }
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      const binaryStr = atob(base64Audio);
      const len = binaryStr.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryStr.charCodeAt(i);
      }

      const decoded = await this.audioContext.decodeAudioData(bytes.buffer.slice(0));
      if (token !== this.playToken) return true;

      const source = this.audioContext.createBufferSource();
      source.buffer = decoded;
      source.playbackRate.value = this.state.speedRate;
      source.connect(this.audioContext.destination);

      this.activeBufferSource = source;
      this.activeBackend = 'audio-context';

      source.onended = () => {
        if (token !== this.playToken) return;
        this.activeBufferSource = null;
        this.activeBackend = null;
        this.state.isPlaying = false;
        this.state.isPaused = false;
        this.state.isLoading = false;
        this.state.currentMessageId = null;
        this.notify();
        options?.onEnd?.();
      };

      this.state.isLoading = false;
      this.state.isPlaying = true;
      this.state.isPaused = false;
      this.state.source = 'gemini-tts';
      this.notify();
      options?.onStart?.();

      source.start(0);
      return true;
    } catch (ctxErr) {
      console.warn('AudioContext playback failed, falling back to Web Speech Synthesis:', ctxErr);
      return false;
    }
  }

  /**
   * Browser SpeechSynthesis fallback with Gents Indian English preference
   */
  private fallbackWebSpeech(
    text: string,
    mode: AudioOutputMode,
    token: number,
    options?: { onStart?: () => void; onEnd?: () => void; onError?: (err: unknown) => void }
  ) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      this.state.isLoading = false;
      this.state.isPlaying = false;
      this.state.currentMessageId = null;
      this.notify();
      options?.onError?.(new Error('Speech synthesis is not supported on this browser'));
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = mode === 'speaker' ? Math.max(0.9, this.state.speedRate * 0.95) : this.state.speedRate;
    utterance.pitch = 0.95;

    const voices = window.speechSynthesis.getVoices();
    const maleGentsVoice =
      voices.find(
        (v) => v.lang === 'en-IN' && (v.name.toLowerCase().includes('male') || v.name.toLowerCase().includes('ravi'))
      ) ||
      voices.find((v) => v.name.toLowerCase().includes('male') && v.lang.startsWith('en')) ||
      voices.find((v) => v.name.toLowerCase().includes('david') || v.name.toLowerCase().includes('george')) ||
      voices.find((v) => v.lang === 'en-IN') ||
      voices[0];

    if (maleGentsVoice) {
      utterance.voice = maleGentsVoice;
    }

    utterance.onstart = () => {
      if (token !== this.playToken) return;
      this.activeBackend = 'web-speech';
      this.state.isLoading = false;
      this.state.isPlaying = true;
      this.state.isPaused = false;
      this.state.source = 'web-speech';
      this.notify();
      options?.onStart?.();
    };

    utterance.onend = () => {
      if (token !== this.playToken) return;
      this.activeBackend = null;
      this.state.isPlaying = false;
      this.state.isPaused = false;
      this.state.isLoading = false;
      this.state.currentMessageId = null;
      this.notify();
      options?.onEnd?.();
    };

    utterance.onerror = (e) => {
      if (token !== this.playToken) return;
      this.activeBackend = null;
      this.state.isPlaying = false;
      this.state.isPaused = false;
      this.state.isLoading = false;
      this.state.currentMessageId = null;
      this.notify();
      options?.onError?.(e);
    };

    window.speechSynthesis.speak(utterance);
  }

  public pause() {
    if (this.activeBackend === 'html-audio' && this.sharedAudio && !this.sharedAudio.paused) {
      this.sharedAudio.pause();
      this.state.isPlaying = false;
      this.state.isPaused = true;
      this.notify();
    } else if (this.activeBackend === 'audio-context' && this.audioContext && this.audioContext.state === 'running') {
      this.audioContext.suspend().catch(() => {});
      this.state.isPlaying = false;
      this.state.isPaused = true;
      this.notify();
    } else if (
      this.activeBackend === 'web-speech' &&
      typeof window !== 'undefined' &&
      'speechSynthesis' in window &&
      window.speechSynthesis.speaking
    ) {
      window.speechSynthesis.pause();
      this.state.isPlaying = false;
      this.state.isPaused = true;
      this.notify();
    }
  }

  public resume() {
    if (this.activeBackend === 'html-audio' && this.sharedAudio && this.sharedAudio.paused) {
      this.sharedAudio.play().catch(() => {});
      this.state.isPlaying = true;
      this.state.isPaused = false;
      this.notify();
    } else if (this.activeBackend === 'audio-context' && this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume().catch(() => {});
      this.state.isPlaying = true;
      this.state.isPaused = false;
      this.notify();
    } else if (
      this.activeBackend === 'web-speech' &&
      typeof window !== 'undefined' &&
      'speechSynthesis' in window &&
      window.speechSynthesis.paused
    ) {
      window.speechSynthesis.resume();
      this.state.isPlaying = true;
      this.state.isPaused = false;
      this.notify();
    }
  }

  public stop() {
    this.playToken++;

    if (this.sharedAudio) {
      try {
        this.sharedAudio.onplay = null;
        this.sharedAudio.onended = null;
        this.sharedAudio.onerror = null;
        this.sharedAudio.pause();
        this.sharedAudio.currentTime = 0;
      } catch (_) {}
    }

    if (this.activeBufferSource) {
      try {
        this.activeBufferSource.onended = null;
        this.activeBufferSource.stop();
        this.activeBufferSource.disconnect();
      } catch (_) {}
      this.activeBufferSource = null;
    }

    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume().catch(() => {});
    }

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch (_) {}
    }

    this.activeBackend = null;
    this.state.isPlaying = false;
    this.state.isPaused = false;
    this.state.isLoading = false;
    this.state.currentMessageId = null;
    this.notify();
  }

  public getState(): VoiceState {
    return { ...this.state };
  }
}

export const voiceAgent = new VoiceAgentEngine();
