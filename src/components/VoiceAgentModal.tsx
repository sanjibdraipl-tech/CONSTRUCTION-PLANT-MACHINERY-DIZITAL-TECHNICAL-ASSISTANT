import React, { useState, useEffect, useRef } from 'react';
import {
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  Square,
  Radio,
  Settings2,
  X,
  Headphones,
  Speaker,
  Compass,
  Send,
  FileText,
  User,
  Loader2,
} from 'lucide-react';
import { voiceAgent, VoiceState, AudioOutputMode } from '../utils/voiceAgent';
import { Equipment } from '../types';

interface VoiceAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  equipmentList: Equipment[];
  selectedEquipmentId: string;
  onNavigate?: (view: string) => void;
}

interface VoiceTurn {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  audioGenerated?: boolean;
  projectVertical?: string;
}

type ProjectCategory = 'nhai-road' | 'metro-tunnel' | 'bridge-making' | 'pipeline';

export const VoiceAgentModal: React.FC<VoiceAgentModalProps> = ({
  isOpen,
  onClose,
  equipmentList,
  selectedEquipmentId,
}) => {
  const [voiceState, setVoiceState] = useState<VoiceState>(voiceAgent.getState());
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState(voiceState.voiceName || 'Fenrir');
  const [outputMode, setOutputMode] = useState<AudioOutputMode>(voiceState.audioOutputMode || 'speaker');
  const [speedRate, setSpeedRate] = useState(voiceState.speedRate || 1.0);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedProjectCategory, setSelectedProjectCategory] = useState<ProjectCategory>('nhai-road');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [conversation, setConversation] = useState<VoiceTurn[]>([
    {
      id: 'turn-welcome',
      sender: 'assistant',
      text: 'Namaste! I am your Senior Chief P&M AI Assistant. I specialize in NHAI Highways, Metro Rail Viaducts, TBM Tunneling, Bridge Heavy Piling, and Cross-Country Pipelines. Type your question below or pick a prompt to receive both written guidance and spoken audio answers.',
      timestamp: 'Just now',
      audioGenerated: false,
    },
  ]);

  useEffect(() => {
    const unsubscribe = voiceAgent.subscribe((state) => {
      setVoiceState(state);
      setOutputMode(state.audioOutputMode);
      setSelectedVoice(state.voiceName);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation, voiceState.isPlaying]);

  if (!isOpen) return null;

  const currentEquipment = equipmentList.find((e) => e.equipmentId === selectedEquipmentId) || equipmentList[0];

  const handleUserTextQuery = async (queryText?: string) => {
    const q = (queryText ?? inputText).trim();
    if (!q || isProcessing) return;

    // Synchronously unlock AudioContext, HTMLAudioElement, and speechSynthesis on user Send/Click gesture
    voiceAgent.stop();
    if (voiceState.responseMode === 'audio-text') {
      voiceAgent.unlockAudio();
    }

    const userTurn: VoiceTurn = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setConversation((prev) => [...prev, userTurn]);
    if (!queryText) setInputText('');
    setIsProcessing(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: q,
          conversationHistory: conversation.map((c) => ({
            role: c.sender === 'user' ? 'user' : 'model',
            text: c.text,
          })),
          contextEquipment: currentEquipment,
        }),
      });

      const data = await res.json();
      const replyText = data.reply || 'Analysis completed with Plant and Machinery technical rules.';

      const aiTurnId = `ai-${Date.now()}`;
      const aiTurn: VoiceTurn = {
        id: aiTurnId,
        sender: 'assistant',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        audioGenerated: voiceAgent.getState().responseMode === 'audio-text',
      };

      setConversation((prev) => [...prev, aiTurn]);
      setIsProcessing(false);

      if (voiceAgent.getState().responseMode === 'audio-text') {
        await voiceAgent.speak(replyText, {
          messageId: aiTurnId,
          voiceName: selectedVoice,
          outputMode,
        });
      }
    } catch (err) {
      console.error('Assistant query error:', err);
      setIsProcessing(false);
      const fallbackId = `ai-err-${Date.now()}`;
      const fallbackText =
        'Engineering observation: Hydraulic pressure or mechanical stall detected. Isolate battery master switch and apply Lockout Tagout before opening access doors.';
      setConversation((prev) => [
        ...prev,
        {
          id: fallbackId,
          sender: 'assistant',
          text: fallbackText,
          timestamp: 'Now',
        },
      ]);
      if (voiceAgent.getState().responseMode === 'audio-text') {
        voiceAgent.speak(fallbackText, {
          messageId: fallbackId,
          voiceName: selectedVoice,
          outputMode,
        });
      }
    }
  };

  const handleOutputModeChange = (mode: AudioOutputMode) => {
    setOutputMode(mode);
    voiceAgent.setAudioOutputMode(mode);
  };

  const projectPrompts: Record<ProjectCategory, { title: string; prompts: { text: string; sub: string }[] }> = {
    'nhai-road': {
      title: '🛣️ NHAI Road & Expressways',
      prompts: [
        {
          text: 'Vögele Super 1800-3 sensor paver electric screed heating fault and cold spots during bituminous laydown',
          sub: 'Electric screed plate temp (165°C), Niveltronic 3D ski sensor calibration',
        },
        {
          text: 'Apollo HMP 160 TPH burner flame sensor trip and baghouse differential pressure exceeding 150 mm WC',
          sub: 'Heavy oil preheating (105°C), pulse jet purge valve, aggregate moisture audit',
        },
        {
          text: 'Hamm 311 compactor vibration frequency drop and hydraulic travel drive chattering at high amplitude',
          sub: 'Exciter shaft bearing lubrication, 30/40 Hz hydraulic motor relief pressure',
        },
        {
          text: 'Wirtgen W100H cold milling machine drum cutter stalling and excessive carbide pick wear on wearing course',
          sub: 'Milling drum water spray pressure (3.5 bar), pick rotation check, conveyor speed',
        },
      ],
    },
    'metro-tunnel': {
      title: '🚇 Metro Viaduct & TBM Tunneling',
      prompts: [
        {
          text: 'Herrenknecht EPB TBM cutterhead torque overload (>1200 kNm) in mixed quartzite and hard rock strata',
          sub: 'Foam Expansion Ratio (FER 11), cutter ring wear inspection, chamber pressure (2.2 bar)',
        },
        {
          text: 'Segment Launching Girder SLG-50 twin 75T hoist winch brake differential slip while lifting precast U-girder',
          sub: 'Winch disc brake holding test, load cell sync (<5%), safety pawl engagement',
        },
        {
          text: 'TBM tail skin grease sealing pressure drop and bi-component annular grout leakage into tunnel invert',
          sub: 'Grease pump delivery pressure (4 bar), wire brush seal inspection, grout gel time (12s)',
        },
        {
          text: 'Elevated metro pier segment handling gantry crane trolley rail deflection and limit switch malfunction',
          sub: 'Rail alignment tolerance, storm brake anchor engagement, hoist overload limit',
        },
      ],
    },
    'bridge-making': {
      title: '🌉 River Bridge & Heavy Piling',
      prompts: [
        {
          text: 'Is the machine available, productive, fuel-efficient, economically justified, and costing within the approved budget?',
          sub: 'The 5 Core Executive Questions & Master P&M Economic Model conversion chain',
        },
        {
          text: 'Calculate bridge piling machinery budget from BOQ (300 piles × 35m = 10,500m total drilling)',
          sub: 'BOQ quantity-first fleet requirement (1.2 rigs), 6-part budget structure, and ₹/m cost',
        },
        {
          text: 'Bauer BG28 rotary piling rig Kelly bar stalling at 38m depth during hard rock socketing in riverbed',
          sub: 'Rotary head stall torque (280 kNm), mast cylinder relief, polymer mud sand content (<1.5%)',
        },
        {
          text: 'Kobelco CKE2500 250T crawler crane Load Moment Indicator anti-two-block sensor trip on marine barge',
          sub: 'Pontoon heel angle (<1.5 deg), boom angle transducer calibration, safe working load limit',
        },
        {
          text: 'Freyssinet multi-strand hydraulic post-tensioning jack elongation variance exceeding ±5% design limit',
          sub: 'Jack calibration deadweight test, duct friction loss calculation, strand slip check',
        },
      ],
    },
    pipeline: {
      title: '🛢️ Cross-Country Pipelines',
      prompts: [
        {
          text: 'Caterpillar 572R side boom winch hydraulic brake slip under 24-ton 36-inch pipe section stringing load',
          sub: 'Winch wet disc brake holding test, counterweight hydraulic extension, cradle sync (200mm)',
        },
        {
          text: 'Vermeer D220x300 HDD rig pullback pressure spike and 1200 LPM bentonite mud flow loss under riverbed',
          sub: 'Downhole drill pipe mud circulation, annular velocity, reamer torque limit (40,000 Nm)',
        },
        {
          text: 'CRC Evans 48-inch hydraulic pipe bending machine internal mandrel hydraulic expansion seal leakage',
          sub: 'Mandrel wedge expansion pressure (210 bar), cold bend ovality check (<2.5% dia)',
        },
        {
          text: 'GAIL 36-inch cross-country pipeline 24-hour hydrostatic test pressure drop and leak detection sequence',
          sub: '1.5x MAOP holding test (145 bar), temperature-pressure differential log, pigging run',
        },
      ],
    },
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative flex flex-col w-full max-w-5xl max-h-[92vh] rounded-3xl border border-amber-500/40 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 shadow-2xl shadow-amber-500/10 overflow-hidden">
        {/* Top Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between border-b border-slate-800 px-6 py-4 bg-slate-900/90 gap-3">
          <div className="flex items-center space-x-3">
            <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 text-slate-950 shadow-lg shadow-amber-500/30">
              {voiceState.responseMode === 'text-only' ? (
                <FileText className="h-6 w-6 stroke-[2.5]" />
              ) : outputMode === 'headphone' ? (
                <Headphones className="h-6 w-6 stroke-[2.5]" />
              ) : (
                <Speaker className="h-6 w-6 stroke-[2.5]" />
              )}
              {voiceState.isPlaying && (
                <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-emerald-500 ring-2 ring-slate-950 animate-pulse" />
              )}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-black tracking-wide text-white">
                  PLANT AND MACHINERY – AI Audio & Text Desk
                </h2>
                <span className="rounded-full bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                  Text Input • Audio + Text Reply
                </span>
              </div>
              <p className="text-xs text-slate-400">
                NHAI Highways • Metro Viaduct & TBM Tunnels • River Bridges • Cross-Country Pipelines
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Dual Response Mode Toggle Switch */}
            <div className="flex items-center rounded-xl bg-slate-950 p-1 border border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => {
                  voiceAgent.unlockAudio();
                  voiceAgent.setResponseMode('audio-text');
                }}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  voiceState.responseMode === 'audio-text'
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/25'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Speak every answer aloud and show text on screen"
              >
                <Volume2 className="h-3.5 w-3.5 stroke-[2.5]" />
                <span>Audio + Text Reply</span>
              </button>
              <button
                type="button"
                onClick={() => voiceAgent.setResponseMode('text-only')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  voiceState.responseMode === 'text-only'
                    ? 'bg-slate-200 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Silent text-only chat when quiet reading is needed"
              >
                <FileText className="h-3.5 w-3.5 stroke-[2.5]" />
                <span>Text Only</span>
              </button>
            </div>

            {/* Audio Output Tuning Switcher (Normal Speaker vs Headphone) */}
            <div className="flex items-center rounded-xl bg-slate-950 p-1 border border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => handleOutputModeChange('speaker')}
                className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  outputMode === 'speaker'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Normal Speaking Mode (No Headphone Required) - Loudspeaker Gents Voice"
              >
                <Speaker className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Normal Speaker</span>
              </button>

              <button
                type="button"
                onClick={() => handleOutputModeChange('headphone')}
                className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  outputMode === 'headphone'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Headphone Mode - Studio Crisp Gents Voice"
              >
                <Headphones className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Headphone</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => setShowSettings(!showSettings)}
              className={`rounded-xl border p-2 text-xs font-semibold flex items-center transition-colors cursor-pointer ${
                showSettings
                  ? 'border-amber-500 bg-amber-500/10 text-amber-400'
                  : 'border-slate-800 bg-slate-900 text-slate-300 hover:border-slate-700'
              }`}
              title="Audio Engine Settings"
            >
              <Settings2 className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={() => {
                voiceAgent.stop();
                onClose();
              }}
              className="rounded-xl border border-slate-800 bg-slate-900 p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Audio Engine Settings Panel */}
        {showSettings && (
          <div className="border-b border-slate-800 bg-slate-900/95 px-6 py-4 text-xs grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in slide-in-from-top duration-200">
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                Gents Voice Persona (Gemini 3.8 Studio)
              </label>
              <select
                value={selectedVoice}
                onChange={(e) => {
                  setSelectedVoice(e.target.value);
                  voiceAgent.setVoiceName(e.target.value);
                }}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-slate-200 focus:outline-none focus:border-amber-500 font-medium"
              >
                <option value="Fenrir">👨‍💼 Fenrir (Senior Chief P&M Engineer - Recommended Gents Voice)</option>
                <option value="Puck">👷 Puck (Dynamic Field Site Manager - Loud & Clear Gents Voice)</option>
                <option value="Charon">🔬 Charon (Deep Technical Specialist - Analytical Gents Voice)</option>
                <option value="Zephyr">⚡ Zephyr (Smooth Field Advisor - Balanced Gents Voice)</option>
                <option value="Kore">👩‍💼 Kore (Senior Technical Advisor - Studio Female Voice)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                Playback Speed ({speedRate}x)
              </label>
              <input
                type="range"
                min="0.8"
                max="1.4"
                step="0.05"
                value={speedRate}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setSpeedRate(val);
                  voiceAgent.setSpeedRate(val);
                }}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-0.5">
                <span>0.8x (Deliberate Site Walkthrough)</span>
                <span>1.0x (Normal)</span>
                <span>1.4x (Fast Briefing)</span>
              </div>
            </div>
          </div>
        )}

        {/* Central Visualizer & Conversation Log */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Animated Central Audio Status Orb */}
          <div className="flex flex-col items-center justify-center p-5 rounded-3xl border border-slate-800 bg-slate-900/40 relative overflow-hidden">
            <div
              className={`absolute h-52 w-52 rounded-full blur-3xl transition-all duration-700 pointer-events-none ${
                voiceState.isPlaying ? 'bg-amber-500/25 scale-125' : 'bg-slate-800/20 scale-100'
              }`}
            />

            <div className="relative mb-3 flex items-center justify-center">
              <div
                className={`flex h-20 w-20 items-center justify-center rounded-full transition-all duration-300 shadow-2xl ${
                  voiceState.isPlaying
                    ? 'bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-600 shadow-amber-500/50 ring-4 ring-amber-500/40'
                    : 'bg-slate-800 border-2 border-slate-700'
                }`}
              >
                {voiceState.isLoading ? (
                  <Loader2 className="h-9 w-9 text-amber-400 animate-spin" />
                ) : voiceState.isPlaying ? (
                  outputMode === 'headphone' ? (
                    <Headphones className="h-9 w-9 text-slate-950 animate-pulse" />
                  ) : (
                    <Volume2 className="h-9 w-9 text-slate-950 animate-pulse" />
                  )
                ) : voiceState.responseMode === 'text-only' ? (
                  <VolumeX className="h-9 w-9 text-slate-400" />
                ) : (
                  <Radio className="h-9 w-9 text-slate-400" />
                )}
              </div>

              {voiceState.isPlaying && (
                <div className="absolute flex space-x-1.5 items-center justify-center -bottom-3">
                  {[4, 10, 16, 22, 16, 10, 4].map((h, i) => (
                    <span
                      key={i}
                      style={{ height: `${h * 1.4}px` }}
                      className="w-1.5 rounded-full animate-bounce bg-amber-400"
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="text-center z-10 mt-2">
              <div className="inline-flex items-center space-x-1.5 rounded-full bg-slate-950/80 px-3 py-1 text-xs font-bold border border-slate-800 mb-2">
                <span
                  className={`h-2 w-2 rounded-full ${
                    voiceState.responseMode === 'text-only' ? 'bg-slate-400' : 'bg-emerald-400 animate-ping'
                  }`}
                />
                <span className="text-amber-400">
                  {voiceState.responseMode === 'text-only'
                    ? 'Text Only Mode Active (Silent Reading)'
                    : outputMode === 'speaker'
                    ? '🔊 Audio + Text Reply Active (Normal Speaker - No Headphone Required)'
                    : '🎧 Audio + Text Reply Active (Headphone Crisp Mode)'}
                </span>
              </div>

              <h3 className="text-sm font-black text-white uppercase tracking-wider">
                {isProcessing
                  ? 'Formulating Indian infrastructure engineering diagnosis...'
                  : voiceState.isLoading
                  ? 'Generating spoken audio response...'
                  : voiceState.isPlaying
                  ? `Speaking answer in ${selectedVoice} Gents Voice...`
                  : voiceState.isPaused
                  ? 'Audio playback paused'
                  : 'Ready • Type Your Question Below or Select Infrastructure Diagnostic'}
              </h3>
              <p className="text-xs text-slate-400 mt-1 max-w-xl mx-auto">
                Active Machinery Context: {currentEquipment.equipmentId} – {currentEquipment.make}{' '}
                {currentEquipment.model} ({currentEquipment.capacity})
              </p>
            </div>

            {voiceState.isPlaying && (
              <div className="mt-3 flex items-center space-x-2 z-10">
                <button
                  type="button"
                  onClick={() => voiceAgent.pause()}
                  className="rounded-xl bg-slate-800 border border-slate-700 px-3.5 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 flex items-center space-x-1.5 cursor-pointer"
                >
                  <Pause className="h-3.5 w-3.5" />
                  <span>Pause Audio</span>
                </button>
                <button
                  type="button"
                  onClick={() => voiceAgent.stop()}
                  className="rounded-xl bg-red-950 border border-red-800 px-3.5 py-1.5 text-xs font-semibold text-red-300 hover:bg-red-900 flex items-center space-x-1.5 cursor-pointer"
                >
                  <Square className="h-3.5 w-3.5" />
                  <span>Stop</span>
                </button>
              </div>
            )}

            {voiceState.isPaused && (
              <div className="mt-3 flex items-center space-x-2 z-10">
                <button
                  type="button"
                  onClick={() => {
                    voiceAgent.unlockAudio();
                    voiceAgent.resume();
                  }}
                  className="rounded-xl bg-amber-500 px-4 py-1.5 text-xs font-bold text-slate-950 hover:bg-amber-400 flex items-center space-x-1.5 cursor-pointer shadow-md shadow-amber-500/20"
                >
                  <Play className="h-3.5 w-3.5 fill-current" />
                  <span>Resume Audio</span>
                </button>
                <button
                  type="button"
                  onClick={() => voiceAgent.stop()}
                  className="rounded-xl bg-slate-800 px-3.5 py-1.5 text-xs font-semibold text-slate-300 hover:bg-slate-700 cursor-pointer"
                >
                  Stop
                </button>
              </div>
            )}
          </div>

          {/* PROJECT VERTICALS TAB SELECTOR */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center space-x-2 text-xs font-bold uppercase text-slate-300">
                <Compass className="h-4 w-4 text-amber-400" />
                <span>Deep Indian Infrastructure Diagnostic Prompts (Click to Ask):</span>
              </div>
              <span className="text-[11px] text-slate-500 font-mono">IRC / MORTH / RDSO Standards</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(
                [
                  { id: 'nhai-road', label: '🛣️ NHAI Roads & Expressways' },
                  { id: 'metro-tunnel', label: '🚇 Metro Viaduct & TBM Tunnels' },
                  { id: 'bridge-making', label: '🌉 River Bridge & Piling' },
                  { id: 'pipeline', label: '🛢️ Cross-Country Pipelines' },
                ] as const
              ).map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedProjectCategory(cat.id)}
                  className={`rounded-xl px-3 py-2 text-xs font-bold text-left transition-all cursor-pointer ${
                    selectedProjectCategory === cat.id
                      ? 'bg-amber-500/20 border border-amber-500 text-amber-300 shadow-md shadow-amber-500/10'
                      : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {projectPrompts[selectedProjectCategory].prompts.map((q, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleUserTextQuery(q.text)}
                  className="flex flex-col text-left p-3 rounded-2xl border border-slate-800 bg-slate-900/60 hover:bg-amber-500/10 hover:border-amber-500/50 transition-all cursor-pointer group"
                >
                  <div className="flex items-start space-x-2">
                    <Volume2 className="h-4 w-4 text-amber-400 shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-semibold text-slate-200 group-hover:text-amber-300 leading-snug">
                      {q.text}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 pl-6 mt-1 font-mono">{q.sub}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Conversation Log */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800 pb-1.5 flex items-center justify-between">
              <span>Dialogue Transcript</span>
              <span className="text-[10px] text-slate-500 font-normal">
                Audio Engine: {voiceState.source === 'gemini-tts' ? 'Gemini 3.8 Flash Lite TTS' : 'Web Speech Synthesis'}
              </span>
            </h4>

            {conversation.map((turn) => {
              const isCurrent = voiceState.currentMessageId === turn.id;
              const isTurnLoading = isCurrent && voiceState.isLoading;
              const isTurnPlaying = isCurrent && voiceState.isPlaying;
              const isTurnPaused = isCurrent && voiceState.isPaused;

              return (
                <div
                  key={turn.id}
                  className={`p-4 rounded-2xl text-xs space-y-2 ${
                    turn.sender === 'user'
                      ? 'ml-auto max-w-[85%] bg-amber-500/15 border border-amber-500/40 text-amber-100 shadow-md'
                      : 'mr-auto max-w-[95%] bg-slate-900 border border-slate-800 text-slate-200 shadow-md'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span className="font-bold uppercase tracking-wider flex items-center space-x-1.5">
                      {turn.sender === 'user' ? (
                        <>
                          <User className="h-3 w-3 text-amber-400" />
                          <span>You (Typed Question)</span>
                        </>
                      ) : (
                        <>
                          {outputMode === 'headphone' ? (
                            <Headphones className="h-3 w-3 text-amber-400" />
                          ) : (
                            <Speaker className="h-3 w-3 text-amber-400" />
                          )}
                          <span>P&M Chief Engineer ({selectedVoice} Gents Voice)</span>
                        </>
                      )}
                    </span>
                    <span>{turn.timestamp}</span>
                  </div>

                  <div className="text-xs leading-relaxed whitespace-pre-wrap font-sans">{turn.text}</div>

                  {turn.sender === 'assistant' && (
                    <div className="pt-2 flex flex-wrap items-center gap-2 border-t border-slate-800/80">
                      {isTurnLoading ? (
                        <>
                          <span className="inline-flex items-center space-x-1.5 rounded-lg bg-amber-500/15 border border-amber-500/30 px-2.5 py-1 text-[11px] font-bold text-amber-300">
                            <Loader2 className="h-3 w-3 animate-spin" />
                            <span>Generating Audio...</span>
                          </span>
                          <button
                            type="button"
                            onClick={() => voiceAgent.stop()}
                            className="flex items-center space-x-1 rounded-lg bg-red-950 border border-red-800 px-2.5 py-1 text-[11px] font-bold text-red-300 hover:bg-red-900 cursor-pointer"
                          >
                            <Square className="h-2.5 w-2.5 fill-current" />
                            <span>Stop</span>
                          </button>
                        </>
                      ) : isTurnPlaying ? (
                        <>
                          <button
                            type="button"
                            onClick={() => voiceAgent.pause()}
                            className="flex items-center space-x-1 rounded-lg bg-amber-500 px-3 py-1 text-[11px] font-bold text-slate-950 hover:bg-amber-400 cursor-pointer"
                          >
                            <Pause className="h-3 w-3 fill-current" />
                            <span>Pause</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => voiceAgent.stop()}
                            className="flex items-center space-x-1 rounded-lg bg-red-950 border border-red-800 px-2.5 py-1 text-[11px] font-bold text-red-300 hover:bg-red-900 cursor-pointer"
                          >
                            <Square className="h-2.5 w-2.5 fill-current" />
                            <span>Stop</span>
                          </button>
                        </>
                      ) : isTurnPaused ? (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              voiceAgent.unlockAudio();
                              voiceAgent.resume();
                            }}
                            className="flex items-center space-x-1 rounded-lg bg-amber-500 px-3 py-1 text-[11px] font-bold text-slate-950 hover:bg-amber-400 cursor-pointer"
                          >
                            <Play className="h-3 w-3 fill-current" />
                            <span>Play</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => voiceAgent.stop()}
                            className="flex items-center space-x-1 rounded-lg bg-red-950 border border-red-800 px-2.5 py-1 text-[11px] font-bold text-red-300 hover:bg-red-900 cursor-pointer"
                          >
                            <Square className="h-2.5 w-2.5 fill-current" />
                            <span>Stop</span>
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            voiceAgent.unlockAudio();
                            voiceAgent.speak(turn.text, {
                              messageId: turn.id,
                              voiceName: selectedVoice,
                              outputMode,
                            });
                          }}
                          className="flex items-center space-x-1.5 rounded-lg bg-amber-500/20 border border-amber-500/40 px-3 py-1 text-[11px] font-bold text-amber-400 hover:bg-amber-500 hover:text-slate-950 transition-colors cursor-pointer"
                        >
                          <Play className="h-3 w-3 fill-current" />
                          <span>Play</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          voiceAgent.unlockAudio();
                          voiceAgent.speak(turn.text, {
                            messageId: turn.id,
                            voiceName: selectedVoice,
                            outputMode,
                          });
                        }}
                        className="flex items-center space-x-1.5 rounded-lg bg-slate-800 border border-slate-700 px-3 py-1 text-[11px] font-semibold text-slate-300 hover:border-amber-500/60 hover:text-amber-300 transition-colors cursor-pointer"
                        title="Replay this answer aloud"
                      >
                        <RotateCcw className="h-3 w-3" />
                        <span>Replay Audio</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Bottom Text Chat Input & Send Control Bar */}
        <div className="border-t border-slate-800 bg-slate-900/95 p-4 space-y-2.5">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleUserTextQuery();
            }}
            className="flex items-center space-x-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type your construction equipment question or fault description here..."
              className="flex-1 rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-xs text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isProcessing}
              className="flex items-center justify-center space-x-2 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 px-5 py-3 text-xs font-black uppercase tracking-wider text-slate-950 shadow-lg shadow-amber-500/20 hover:from-amber-400 hover:to-amber-500 disabled:opacity-40 transition-all cursor-pointer shrink-0"
            >
              <Send className="h-4 w-4 stroke-[2.5]" />
              <span>Send</span>
            </button>
          </form>

          <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
            <div className="flex items-center space-x-3">
              <span className="flex items-center space-x-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                <span>
                  Voice: <strong className="text-white">{selectedVoice} (Gents)</strong>
                </span>
              </span>
              <span className="text-slate-600">•</span>
              <span>
                Reply Mode:{' '}
                <strong className="text-amber-400">
                  {voiceState.responseMode === 'audio-text' ? 'Audio + Text Reply' : 'Text Only'}
                </strong>
              </span>
            </div>
            <span>
              Output: <strong className="text-slate-200">{outputMode === 'speaker' ? 'Normal Speaker' : 'Headphone'}</strong>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
