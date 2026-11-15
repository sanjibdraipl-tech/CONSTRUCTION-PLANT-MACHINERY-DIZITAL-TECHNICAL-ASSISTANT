import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  User,
  Wrench,
  HelpCircle,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Square,
  Headphones,
  Speaker,
} from 'lucide-react';
import { Equipment } from '../types';
import { voiceAgent, VoiceState, AudioOutputMode } from '../utils/voiceAgent';

interface AiChatViewProps {
  equipmentList: Equipment[];
  selectedEquipmentId?: string;
  onOpenVoiceAgent?: () => void;
}

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  source?: string;
}

export const AiChatView: React.FC<AiChatViewProps> = ({
  equipmentList,
  selectedEquipmentId,
  onOpenVoiceAgent,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'msg-1',
      sender: 'assistant',
      text: `Hello! I am **PLANT AND MACHINERY AI** – your Digital Technical Assistant for Indian Construction Plant & Machinery.

I specialize in **equipment diagnostics, PM schedules, breakdown workflows, fuel variance audits, and owned vs. hired costing** for highway, metro, and plant operations.

How can I assist your P&M team today? You can click any prompt below or type your machinery problem.`,
      timestamp: 'Just now',
      source: 'plant-and-machinery-engine',
    },
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [voiceState, setVoiceState] = useState<VoiceState>(voiceAgent.getState());
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsub = voiceAgent.subscribe((state) => {
      setVoiceState(state);
    });
    return () => unsub();
  }, []);

  const [selectedVertical, setSelectedVertical] = useState<'all' | 'nhai' | 'metro' | 'bridge' | 'pipeline'>('all');

  const verticalPrompts: Record<string, string[]> = {
    all: [
      'Why is Excavator EX210 consuming high diesel?',
      'Why is hydraulic pressure low on EX-01?',
      'Prepare PM schedule for this month.',
      'Show top breakdown machines and downtime.',
      'Calculate equipment cost per hour for 20T excavator.',
      'Compare owned versus hired excavator.',
      'Prepare monthly P&M executive report.',
      'Analyze fuel variance and abnormal consumption.',
      'Prepare RCA for repeated hydraulic failure.',
    ],
    nhai: [
      'Vögele Super 1800-3 sensor paver screed temperature imbalance (112°C vs 165°C)',
      'Apollo HMP 160 TPH burner flame failure and baghouse differential pressure >145 mm WC',
      'Hamm 311 compactor vibration amplitude dropping during DBM compaction',
      'Wirtgen W100H cold milling machine drum cutter stalling at 80mm milling depth',
      'Compare owned vs hired motor grader hourly cost for NHAI expressway package',
    ],
    metro: [
      'Herrenknecht EPB TBM cutterhead torque exceeding 1200 kNm in mixed quartzite',
      'Segment Launching Girder SLG-50 twin 75T hoist winch brake differential slip',
      'TBM tail skin grease pressure drop and bi-component annular grout leakage',
      'Elevated metro pier segment erection gantry crane wind cutoff safety limit',
      'U-girder launch cycle time analysis and mechanical availability benchmark',
    ],
    bridge: [
      'Is the machine available, productive, fuel-efficient, economically justified, and costing within the approved budget?',
      'Calculate bridge piling machinery budget from BOQ (300 piles × 35m = 10,500m)',
      'Bauer BG28 rotary piling rig Kelly bar stalling during 38m rock socketing',
      'Kobelco CKE2500 250T crawler crane LMI anti-two-block trip on marine barge',
      'Freyssinet multi-strand prestressing jack elongation variance exceeding ±5%',
      'Bridge cantilever form traveler hydraulic jack sync and anchor tie-rod torque',
    ],
    pipeline: [
      'CAT 572R side boom winch hydraulic brake slip under 24T pipe lowering',
      'Vermeer D220x300 HDD rig pullback pressure spike to 1800 psi & mud loss',
      'GAIL 36-inch cross-country pipeline 24-hr hydrostatic test pressure drop audit',
      'CRC Evans pipe bending machine internal mandrel hydraulic seal leakage',
      'Cross-country pipeline trenching equipment fuel consumption variance',
    ],
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleVoiceInput = () => {
    if (voiceState.isListening) {
      voiceAgent.stopListening();
      return;
    }

    // Hands-free Voice-In -> Voice-Out: ensure autoSpeak is active
    setAutoSpeak(true);

    voiceAgent.startListening(
      (text, isFinal) => {
        setInputQuery(text);
        if (isFinal) {
          handleSend(text);
        }
      },
      () => {},
      (err) => {
        console.warn('Chat mic error:', err);
      }
    );
  };

  const handleSend = async (queryText?: string) => {
    const q = queryText || inputQuery;
    if (!q.trim()) return;

    voiceAgent.stop(); // Stop any currently playing audio

    const userMsg: Message = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsTyping(true);

    try {
      const activeEq = equipmentList.find((e) => e.equipmentId === selectedEquipmentId) || equipmentList[0];

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: q,
          conversationHistory: messages.map((m) => ({
            role: m.sender === 'user' ? 'user' : 'model',
            text: m.text,
          })),
          contextEquipment: activeEq,
        }),
      });

      const data = await res.json();
      const replyText = data.reply || 'Analysis completed with Plant & Machinery technical rules.';

      const aiMsg: Message = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: data.source || 'gemini-3.8-flash',
      };

      setMessages((prev) => [...prev, aiMsg]);

      // Automatically speak the answer aloud with voice
      if (autoSpeak) {
        voiceAgent.speak(replyText);
      }
    } catch (err) {
      console.error('Chat error:', err);
      const errorMsg: Message = {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        text: `### Technical Guidance
Under Indian site operating conditions, we cross-reference your query with the 20 registered equipment units.
Please ensure equipment model, HMR, error codes, and field symptoms are noted before executing physical interventions. Always apply Lockout/Tagout (LOTO).`,
        timestamp: 'Now',
        source: 'plant-and-machinery-fallback',
      };
      setMessages((prev) => [...prev, errorMsg]);
      if (autoSpeak) {
        voiceAgent.speak(errorMsg.text);
      }
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] space-y-4">
      {/* Title & Voice Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-3 gap-3 shrink-0">
        <div className="flex items-center space-x-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-black text-white">PLANT AND MACHINERY – AI Technical Assistant</h1>
              <span className="rounded bg-amber-500 text-slate-950 px-1.5 py-0.2 text-[9px] font-black uppercase">
                Interactive Advisor
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Grounded in OEM manuals, hydraulic schematics, and structured Indian infrastructure fleet data
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-end sm:self-center">
          {/* Audio Output Mode Switcher: Normal Speaker vs Headphone (Gents Voice) */}
          <div className="flex items-center rounded-xl bg-slate-950 p-0.5 border border-slate-800 text-xs">
            <button
              onClick={() => voiceAgent.setAudioOutputMode('speaker')}
              className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                voiceState.audioOutputMode === 'speaker'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Normal Speaking Mode (No Headphone Required) - Loudspeaker Gents Voice for noisy field sites"
            >
              <Speaker className="h-3.5 w-3.5" />
              <span className="hidden md:inline">Normal Speaking Mode</span>
            </button>
            <button
              onClick={() => voiceAgent.setAudioOutputMode('headphone')}
              className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                voiceState.audioOutputMode === 'headphone'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Headphone Mode - Studio Crisp Gents Voice for headphones and headsets"
            >
              <Headphones className="h-3.5 w-3.5" />
              <span className="hidden md:inline">Headphone Voice</span>
            </button>
          </div>

          {/* Auto-Speak Toggle */}
          <button
            onClick={() => setAutoSpeak(!autoSpeak)}
            className={`flex items-center space-x-1.5 rounded-lg border px-2.5 py-1 text-xs font-semibold transition-colors ${
              autoSpeak
                ? 'border-amber-500/60 bg-amber-500/15 text-amber-300'
                : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-slate-300'
            }`}
            title="Auto-speak answers with voice output"
          >
            {autoSpeak ? <Volume2 className="h-3.5 w-3.5 text-amber-400" /> : <VolumeX className="h-3.5 w-3.5" />}
            <span className="hidden sm:inline">Voice Answers: {autoSpeak ? 'ON' : 'OFF'}</span>
          </button>

          {/* Dedicated Voice Agent Launcher */}
          {onOpenVoiceAgent && (
            <button
              onClick={onOpenVoiceAgent}
              className="flex items-center space-x-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 px-3 py-1 text-xs font-bold text-slate-950 shadow-sm hover:from-amber-400 hover:to-amber-500 transition-all cursor-pointer"
              title="Launch full AI Voice Agent modal"
            >
              <Headphones className="h-3.5 w-3.5 stroke-[2.5]" />
              <span>Voice Agent Mode</span>
            </button>
          )}

          <button
            onClick={() => {
              voiceAgent.stop();
              setMessages([
                {
                  id: 'msg-reset',
                  sender: 'assistant',
                  text: 'Conversation reset. How can I assist with your P&M operations?',
                  timestamp: 'Just now',
                },
              ]);
            }}
            className="flex items-center space-x-1 rounded-lg bg-slate-900 border border-slate-800 px-2.5 py-1 text-xs text-slate-400 hover:text-white"
          >
            <RotateCcw className="h-3 w-3" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Messages Thread Container */}
      <div className="flex-1 overflow-y-auto rounded-2xl border border-slate-800 bg-slate-900/60 p-4 space-y-4 shadow-inner">
        {messages.map((m) => {
          const isThisSpeaking = voiceState.isPlaying && voiceState.currentSpeechText.includes(m.text.slice(0, 30));

          return (
            <div
              key={m.id}
              className={`flex items-start space-x-3 ${
                m.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
              }`}
            >
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                  m.sender === 'user'
                    ? 'bg-amber-500 text-slate-950 font-bold text-xs'
                    : 'bg-slate-800 text-amber-400 border border-amber-500/30'
                }`}
              >
                {m.sender === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
              </div>

              <div
                className={`max-w-[85%] rounded-2xl p-4 text-xs shadow-md ${
                  m.sender === 'user'
                    ? 'bg-amber-500 text-slate-950 font-medium'
                    : 'bg-slate-950 border border-slate-800 text-slate-200'
                }`}
              >
                <div className="whitespace-pre-wrap leading-relaxed space-y-2">
                  {m.text.split('\n\n').map((para, i) => (
                    <p key={i}>{para}</p>
                  ))}
                </div>

                <div
                  className={`mt-2 flex items-center justify-between text-[10px] pt-2 border-t ${
                    m.sender === 'user' ? 'border-amber-600 text-slate-900' : 'border-slate-800 text-slate-400'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <span>{m.timestamp}</span>
                    {m.source && <span className="font-mono text-slate-500">[{m.source}]</span>}
                  </div>

                  {/* Audio Speech Controls for Assistant Messages */}
                  {m.sender === 'assistant' && (
                    <div className="flex items-center space-x-1.5">
                      {isThisSpeaking ? (
                        <button
                          onClick={() => voiceAgent.stop()}
                          className="flex items-center space-x-1 rounded-md bg-red-950 border border-red-800 px-2 py-0.5 text-[10px] font-bold text-red-300 hover:bg-red-900 transition-colors"
                        >
                          <Square className="h-2.5 w-2.5 fill-current" />
                          <span>Stop Voice</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => voiceAgent.speak(m.text)}
                          className="flex items-center space-x-1 rounded-md bg-slate-900 border border-slate-700 px-2 py-0.5 text-[10px] font-bold text-amber-400 hover:bg-amber-500 hover:text-slate-950 transition-colors cursor-pointer"
                          title="Speak this answer aloud"
                        >
                          <Volume2 className="h-2.5 w-2.5" />
                          <span>Speak Answer</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {isTyping && (
          <div className="flex items-center space-x-2 text-xs text-slate-400 p-2">
            <div className="flex space-x-1">
              <span className="h-2 w-2 rounded-full bg-amber-400 animate-bounce" />
              <span className="h-2 w-2 rounded-full bg-amber-400 animate-bounce [animation-delay:0.2s]" />
              <span className="h-2 w-2 rounded-full bg-amber-400 animate-bounce [animation-delay:0.4s]" />
            </div>
            <span>Plant & Machinery AI is formulating technical recommendations...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Infrastructure Project Vertical Tabs and Prompt Chips */}
      <div className="space-y-1.5 shrink-0">
        <div className="flex items-center space-x-1.5 overflow-x-auto text-[11px] no-scrollbar">
          {(
            [
              { id: 'all', label: 'All Operations' },
              { id: 'nhai', label: '🛣️ NHAI Roads' },
              { id: 'metro', label: '🚇 Metro & TBM' },
              { id: 'bridge', label: '🌉 River Bridges' },
              { id: 'pipeline', label: '🛢️ Pipelines' },
            ] as const
          ).map((v) => (
            <button
              key={v.id}
              onClick={() => setSelectedVertical(v.id)}
              className={`shrink-0 px-2.5 py-0.5 rounded-full font-bold transition-all cursor-pointer ${
                selectedVertical === v.id
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {v.label}
            </button>
          ))}
        </div>

        <div className="flex items-center space-x-1.5 overflow-x-auto py-0.5 text-xs no-scrollbar">
          <span className="text-[10px] font-bold uppercase text-slate-500 shrink-0">Tap to Ask:</span>
          {verticalPrompts[selectedVertical]?.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(prompt)}
              className="shrink-0 rounded-lg bg-slate-900 border border-slate-800 px-2.5 py-1 text-[11px] text-slate-300 hover:border-amber-500/50 hover:text-amber-300 transition-colors cursor-pointer"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Input Form with Microphone Voice Input */}
      <div className="shrink-0 flex items-center space-x-2">
        <div className="relative flex-1 flex items-center">
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={
              voiceState.isListening
                ? 'Listening to microphone... Speak now...'
                : 'Ask Plant & Machinery AI anything, or click microphone to speak...'
            }
            className={`w-full rounded-xl border bg-slate-900 px-4 py-3 pr-12 text-xs text-white placeholder-slate-500 focus:outline-none transition-all ${
              voiceState.isListening
                ? 'border-red-500 ring-2 ring-red-500/20'
                : 'border-slate-700 focus:border-amber-500 focus:ring-1 focus:ring-amber-500'
            }`}
          />

          {/* Microphone Speech Recognition Button */}
          <button
            type="button"
            onClick={handleVoiceInput}
            className={`absolute right-2 p-1.5 rounded-lg transition-colors cursor-pointer ${
              voiceState.isListening
                ? 'bg-red-600 text-white animate-pulse'
                : 'text-slate-400 hover:bg-slate-800 hover:text-amber-400'
            }`}
            title={voiceState.isListening ? 'Stop listening' : 'Speak with microphone'}
          >
            {voiceState.isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          </button>
        </div>

        <button
          onClick={() => handleSend()}
          disabled={!inputQuery.trim() || isTyping}
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500 text-slate-950 hover:bg-amber-400 disabled:opacity-40 transition-colors shadow-md shadow-amber-500/20 cursor-pointer shrink-0"
        >
          <Send className="h-4 w-4 stroke-[2.5]" />
        </button>
      </div>
    </div>
  );
};
