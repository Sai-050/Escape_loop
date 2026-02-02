import React, { useState } from 'react';
import { GlitchText } from './GlitchText';
import { Button } from './Button';

interface LandingPageProps {
  onStart: (name: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  const [name, setName] = useState('');

  const handleStart = () => {
    if (name.trim()) {
      onStart(name.trim().toUpperCase());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && name.trim()) {
      handleStart();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
      <div className="mb-8 animate-pulse-fast">
        <GlitchText text="ESCAPE LOOP" as="h1" className="text-6xl md:text-8xl font-black tracking-tighter text-terminal-green" />
      </div>

      <p className="text-xl md:text-2xl mb-12 text-gray-400 font-mono max-w-md">
        &gt; SYSTEM_STATUS: INFINITE<br />
        &gt; OBJECTIVE: SURVIVE<br />
        <span className="text-sm mt-2 block opacity-70">"How long can you escape?"</span>
      </p>

      <div className="w-full max-w-xs mb-8 group">
        <label className="block text-left text-xs text-gray-500 mb-2 tracking-widest pl-1">&gt; IDENTIFY YOURSELF</label>
        <div className="relative">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="ENTER_CODENAME"
            maxLength={12}
            className="w-full bg-black/50 border-2 border-gray-800 text-terminal-green p-3 font-mono text-center text-xl uppercase tracking-widest focus:border-terminal-green focus:outline-none focus:shadow-[0_0_15px_rgba(0,255,65,0.3)] transition-all placeholder-gray-800"
            autoFocus
          />
          <div className="absolute top-0 right-0 h-full flex items-center pr-3 pointer-events-none">
            <div className={`w-2 h-2 rounded-full ${name.trim() ? 'bg-terminal-green animate-pulse' : 'bg-red-900'}`} />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <Button
          onClick={handleStart}
          className={`text-xl w-64 ${!name.trim() ? 'opacity-50 cursor-not-allowed hover:bg-transparent hover:text-terminal-green hover:shadow-none' : ''}`}
          disabled={!name.trim()}
        >
          INITIALIZE_RUN()
        </Button>
      </div>
    </div>
  );
};