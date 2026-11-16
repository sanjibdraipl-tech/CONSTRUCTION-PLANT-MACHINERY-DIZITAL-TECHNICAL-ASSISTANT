import React, { useState, useEffect } from 'react';
import { Volume2, Square } from 'lucide-react';
import { voiceAgent, VoiceState } from '../utils/voiceAgent';

interface FloatingVoiceTriggerProps {
  onOpenVoiceAgent: () => void;
}

export const FloatingVoiceTrigger: React.FC<FloatingVoiceTriggerProps> = ({ onOpenVoiceAgent }) => {
  const [voiceState, setVoiceState] = useState<VoiceState>(voiceAgent.getState());

  useEffect(() => {
    const unsubscribe = voiceAgent.subscribe((state) => {
      setVoiceState(state);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="fixed bottom-5 right-5 z-40 flex items-center space-x-2">
      {/* Active Speech Bar if AI is speaking */}
      {voiceState.isPlaying && (
        <div className="hidden sm:flex items-center space-x-2.5 rounded-full border border-amber-500/50 bg-slate-900/95 px-4 py-2 text-xs shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-2">
          <div className="flex space-x-0.5 items-center">
            <span className="h-3 w-1 rounded-full bg-amber-400 animate-bounce" />
            <span className="h-4 w-1 rounded-full bg-amber-400 animate-bounce [animation-delay:0.15s]" />
            <span className="h-2 w-1 rounded-full bg-amber-400 animate-bounce [animation-delay:0.3s]" />
          </div>
          <span className="font-semibold text-slate-200 truncate max-w-[180px]">
            AI Speaking Answer...
          </span>
          <button
            type="button"
            onClick={() => voiceAgent.stop()}
            className="rounded-full bg-red-950 p-1 text-red-300 hover:bg-red-900 transition-colors cursor-pointer"
            title="Stop Audio"
          >
            <Square className="h-3 w-3" />
          </button>
        </div>
      )}

      {/* Main Trigger Orb */}
      <button
        type="button"
        onClick={() => {
          voiceAgent.unlockAudio();
          onOpenVoiceAgent();
        }}
        className={`group relative flex h-13 w-13 items-center justify-center rounded-full shadow-2xl transition-all duration-300 cursor-pointer ${
          voiceState.isPlaying
            ? 'bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-600 ring-4 ring-amber-500/30 text-slate-950'
            : 'bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-600 hover:scale-105 text-slate-950 shadow-amber-500/30'
        }`}
        title="Open AI Audio + Text Assistant Desk"
      >
        <Volume2 className={`h-6 w-6 stroke-[2.5] ${voiceState.isPlaying ? 'animate-pulse' : ''}`} />

        {/* Badge */}
        <span className="absolute -top-1 -right-1 flex h-4 w-4">
          <span className="relative inline-flex h-4 w-4 rounded-full bg-amber-500 text-[9px] font-black items-center justify-center text-slate-950 ring-2 ring-slate-950">
            AI
          </span>
        </span>
      </button>
    </div>
  );
};
