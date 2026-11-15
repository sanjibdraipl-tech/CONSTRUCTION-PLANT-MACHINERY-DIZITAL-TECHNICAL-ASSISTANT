/**
 * PLANT AND MACHINERY - AI Voice Agent Audio Engine
 * Supports:
 * - 🎧 Headphone Mode (Studio Crisp Gents Voice - Near-mic high definition)
 * - 🔊 Normal Speaker Mode (No Headphone Required - Acoustic Field Loudspeaker Gents Voice)
 * - Gents Voice Models: Fenrir (Senior Chief Engineer), Puck (Field Manager), Charon (Technical Specialist)
 * - Real-time Voice-to-Voice Loop: User speaks -> AI diagnoses -> AI immediately answers aloud in Gents voice
 */

export type AudioOutputMode = 'headphone' | 'speaker';
export type GentsVoiceType = 'fenrir' | 'puck' | 'charon';

export interface VoiceState {
  isPlaying: boolean;
  isPaused: boolean;
  isLoading: boolean;
  isListening: boolean;
  currentSpeechText: string;
  voiceName: string; // 'Fenrir' | 'Puck' | 'Charon' | 'Kore'
  audioOutputMode: AudioOutputMode; // 'headphone' | 'speaker'
  source: 'gemini-tts' | 'web-speech' | 'none';
  speedRate: number;
}

export type VoiceStateListener = (state: VoiceState) => void;

class VoiceAgentEngine {
  private currentAudio: HTMLAudioElement | null = null;
  private listeners: Set<VoiceStateListener> = new Set();
  private recognition: any = null;
  private state: VoiceState = {
    isPlaying: false,
    isPaused: false,
    isLoading: false,
    isListening: false,
    currentSpeechText: '',
    voiceName: 'Fenrir', // Default: Senior Chief P&M Engineer (Gents Voice)
    audioOutputMode: 'speaker', // Default: Normal Speaking Mode (No Headphone Required)
    source: 'none',
    speedRate: 1.0,
  };

  constructor() {
    if (typeof window !== 'undefined') {
      const savedVoice = localStorage.getItem('pm_voice_name');
      if (savedVoice) this.state.voiceName = savedVoice;

      const savedMode = localStorage.getItem('pm_audio_mode') as AudioOutputMode;
      // Strictly default to Normal Speaking Mode ('speaker') unless user explicitly sets it
      if (savedMode === 'speaker') {
        this.state.audioOutputMode = 'speaker';
      } else {
        this.state.audioOutputMode = 'speaker';
        localStorage.setItem('pm_audio_mode', 'speaker');
      }

      const savedRate = localStorage.getItem('pm_voice_rate');
      if (savedRate) this.state.speedRate = parseFloat(savedRate) || 1.0;
    }
  }

  public subscribe(listener: VoiceStateListener): () => void {
    this.listeners.add(listener);
    listener(this.state);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    for (const listener of this.listeners) {
      listener({ ...this.state });
    }
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
    // Automatically match voice profile
    if (mode === 'speaker') {
      // For normal site speaker without headphones: Puck or Fenrir with robust acoustic delivery
      if (this.state.voiceName === 'Kore') this.state.voiceName = 'Puck';
    } else {
      // For headphone mode: Crisp studio Fenrir or Charon
      if (this.state.voiceName === 'Puck') this.state.voiceName = 'Fenrir';
    }
    this.notify();
  }

  public setSpeedRate(rate: number) {
    this.state.speedRate = rate;
    if (this.currentAudio) {
      this.currentAudio.playbackRate = rate;
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem('pm_voice_rate', rate.toString());
    }
    this.notify();
  }

  /**
   * Cleans technical markdown tables, headers, and bullet points into natural spoken engineering English
   * with Indian infrastructure project terminology.
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

    // Natural Indian Infrastructure & Construction Machinery Terminology
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
   * Speak technical text aloud using Gemini 3.8 Flash Lite TTS with Web Speech API fallback.
   * Adapts style and acoustics based on Headphone vs. Normal Speaker Mode.
   */
  public async speak(
    rawText: string,
    options?: {
      voiceName?: string;
      outputMode?: AudioOutputMode;
      onStart?: () => void;
      onEnd?: () => void;
      onError?: (err: any) => void;
    }
  ): Promise<void> {
    this.stop(); // Stop any currently playing audio

    const clean = this.cleanTextForSpeech(rawText);
    if (!clean) return;

    // Use summary portion for fast voice generation if text is extensive
    let speechPrompt = clean;
    if (speechPrompt.length > 750) {
      const sentenceEnd = speechPrompt.indexOf('.', 550);
      speechPrompt = sentenceEnd !== -1 ? speechPrompt.slice(0, sentenceEnd + 1) : speechPrompt.slice(0, 650) + '...';
    }

    const voice = options?.voiceName || this.state.voiceName || 'Fenrir';
    const mode = options?.outputMode || this.state.audioOutputMode || 'speaker';

    // Tailor engineering style prompt based on Headphone vs Loudspeaker mode
    const engineeringStyle =
      mode === 'headphone'
        ? 'Deep, crisp, close-mic authoritative Indian chief plant and machinery engineer speaking into a professional headset. High diction, balanced treble, clear calm delivery.'
        : 'Punchy, resonant, acoustic loudspeaker delivery for Indian construction site managers listening on phone speaker without headphones. Clear, energetic, high presence and projection.';

    this.state.isLoading = true;
    this.state.currentSpeechText = speechPrompt;
    this.notify();

    try {
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

      const data = await res.json();

      if (data.success && data.audioData) {
        const audio = new Audio(`data:${data.mimeType || 'audio/wav'};base64,${data.audioData}`);
        audio.playbackRate = this.state.speedRate;
        this.currentAudio = audio;

        audio.onplay = () => {
          this.state.isLoading = false;
          this.state.isPlaying = true;
          this.state.isPaused = false;
          this.state.source = 'gemini-tts';
          this.notify();
          options?.onStart?.();
        };

        audio.onended = () => {
          this.state.isPlaying = false;
          this.state.isPaused = false;
          this.state.isLoading = false;
          this.currentAudio = null;
          this.notify();
          options?.onEnd?.();
        };

        audio.onerror = (e) => {
          console.warn('Audio tag playback error, falling back to Web Speech Synthesis:', e);
          this.fallbackWebSpeech(speechPrompt, mode, options);
        };

        await audio.play();
        return;
      }

      this.fallbackWebSpeech(speechPrompt, mode, options);
    } catch (err) {
      console.warn('TTS request error, falling back to browser Web Speech API:', err);
      this.fallbackWebSpeech(speechPrompt, mode, options);
    }
  }

  /**
   * Browser SpeechSynthesis fallback with Gents Indian English preference
   */
  private fallbackWebSpeech(
    text: string,
    mode: AudioOutputMode,
    options?: { onStart?: () => void; onEnd?: () => void; onError?: (err: any) => void }
  ) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      this.state.isLoading = false;
      this.state.isPlaying = false;
      this.notify();
      options?.onError?.(new Error('Speech synthesis is not supported on this browser'));
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    // Adjust rate and pitch based on mode
    utterance.rate = mode === 'speaker' ? Math.max(0.9, this.state.speedRate * 0.95) : this.state.speedRate;
    utterance.pitch = 0.95; // Slightly deeper gents voice tone

    const voices = window.speechSynthesis.getVoices();
    // Prioritize male/gents voices (Google UK English Male, Microsoft Ravi/David, Indian English Male)
    const maleGentsVoice =
      voices.find((v) => v.lang === 'en-IN' && (v.name.toLowerCase().includes('male') || v.name.toLowerCase().includes('ravi'))) ||
      voices.find((v) => v.name.toLowerCase().includes('male') && v.lang.startsWith('en')) ||
      voices.find((v) => v.name.toLowerCase().includes('david') || v.name.toLowerCase().includes('george')) ||
      voices.find((v) => v.lang === 'en-IN') ||
      voices[0];

    if (maleGentsVoice) {
      utterance.voice = maleGentsVoice;
    }

    utterance.onstart = () => {
      this.state.isLoading = false;
      this.state.isPlaying = true;
      this.state.isPaused = false;
      this.state.source = 'web-speech';
      this.notify();
      options?.onStart?.();
    };

    utterance.onend = () => {
      this.state.isPlaying = false;
      this.state.isPaused = false;
      this.state.isLoading = false;
      this.notify();
      options?.onEnd?.();
    };

    utterance.onerror = (e) => {
      this.state.isPlaying = false;
      this.state.isPaused = false;
      this.state.isLoading = false;
      this.notify();
      options?.onError?.(e);
    };

    window.speechSynthesis.speak(utterance);
  }

  public pause() {
    if (this.currentAudio && !this.currentAudio.paused) {
      this.currentAudio.pause();
      this.state.isPlaying = false;
      this.state.isPaused = true;
      this.notify();
    } else if (typeof window !== 'undefined' && 'speechSynthesis' in window && window.speechSynthesis.speaking) {
      window.speechSynthesis.pause();
      this.state.isPlaying = false;
      this.state.isPaused = true;
      this.notify();
    }
  }

  public resume() {
    if (this.currentAudio && this.currentAudio.paused) {
      this.currentAudio.play();
      this.state.isPlaying = true;
      this.state.isPaused = false;
      this.notify();
    } else if (typeof window !== 'undefined' && 'speechSynthesis' in window && window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      this.state.isPlaying = true;
      this.state.isPaused = false;
      this.notify();
    }
  }

  public stop() {
    if (this.currentAudio) {
      try {
        this.currentAudio.pause();
        this.currentAudio.currentTime = 0;
      } catch (e) {}
      this.currentAudio = null;
    }

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    this.state.isPlaying = false;
    this.state.isPaused = false;
    this.state.isLoading = false;
    this.notify();
  }

  public startListening(
    onResult: (transcript: string, isFinal: boolean) => void,
    onEnd?: () => void,
    onError?: (err: any) => void
  ): boolean {
    if (typeof window === 'undefined') return false;

    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) {
      onError?.(new Error('Speech recognition is not supported in this browser. Please use Chrome or Edge.'));
      return false;
    }

    this.stopListening();
    this.stop();

    try {
      const recognition = new SpeechRec();
      this.recognition = recognition;
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-IN'; // Indian English recognition

      recognition.onstart = () => {
        this.state.isListening = true;
        this.notify();
      };

      recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        const text = finalTranscript || interimTranscript;
        if (text) {
          onResult(text, Boolean(finalTranscript));
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        this.state.isListening = false;
        this.notify();
        onError?.(event.error);
      };

      recognition.onend = () => {
        this.state.isListening = false;
        this.notify();
        onEnd?.();
      };

      recognition.start();
      return true;
    } catch (e) {
      console.error('Failed to start speech recognition:', e);
      this.state.isListening = false;
      this.notify();
      onError?.(e);
      return false;
    }
  }

  public stopListening() {
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (e) {}
      this.recognition = null;
    }
    this.state.isListening = false;
    this.notify();
  }

  public getState(): VoiceState {
    return { ...this.state };
  }
}

export const voiceAgent = new VoiceAgentEngine();
