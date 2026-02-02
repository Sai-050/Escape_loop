import React, { useEffect, useState } from 'react';
import { GameStats } from '../types';
import { Button } from './Button';
import { GlitchText } from './GlitchText';

interface ResultScreenProps {
  stats: GameStats;
  onRetry: () => void;
  playerName: string;
}

// Simple counter component for number animation
const Counter: React.FC<{ value: number; duration?: number; className?: string }> = ({ value, duration = 1500, className = '' }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // easeOutExpo
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setCount(Math.floor(ease * value));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }, [value, duration]);

  return <span className={className}>{count.toLocaleString()}</span>;
};

export const ResultScreen: React.FC<ResultScreenProps> = ({ stats, onRetry, playerName }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center font-mono">
      <div className="max-w-lg w-full bg-gray-900/50 border border-gray-800 p-8 relative overflow-hidden animate-fade-in">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-terminal-green to-transparent opacity-50"></div>
        
        <div className="animate-fade-in" style={{ animationDelay: '0.2s', opacity: 0, animationFillMode: 'forwards' }}>
          <h2 className="text-4xl md:text-6xl mb-2 font-black">
            {stats.surrendered ? (
              <span className="text-yellow-400">SESSION ABORTED</span>
            ) : (
              <span className="text-neon-red animate-pulse">CONNECTION LOST</span>
            )}
          </h2>
          
          <p className="text-gray-400 mb-8 uppercase tracking-widest text-sm">
            {stats.surrendered ? "User disconnected voluntarily." : "Fatal Exception Error at runtime."}
          </p>
        </div>

        <div className="mb-6 animate-fade-in flex items-center justify-center space-x-2" style={{ animationDelay: '0.3s', opacity: 0, animationFillMode: 'forwards' }}>
            <span className="text-gray-500 text-xs uppercase tracking-widest">OPERATOR ID:</span>
            <span className="text-terminal-green font-bold text-lg">{playerName}</span>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-10 text-left">
          {/* Total Score */}
          <div 
            className="bg-black/40 p-4 border border-gray-800 col-span-2 text-center animate-fade-in"
            style={{ animationDelay: '0.4s', opacity: 0, animationFillMode: 'forwards' }}
          >
            <p className="text-gray-500 text-xs uppercase mb-1">Total Score</p>
            <div className="text-5xl text-white font-bold tracking-widest drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
              <Counter value={stats.score} duration={2000} />
            </div>
          </div>

          {/* Levels Cleared */}
          <div 
            className="bg-black/40 p-4 border border-gray-800 animate-fade-in"
            style={{ animationDelay: '0.6s', opacity: 0, animationFillMode: 'forwards' }}
          >
            <p className="text-gray-500 text-xs uppercase">Levels Cleared</p>
            <div className="text-3xl text-terminal-green">
              <Counter value={stats.questionsAnswered} duration={1000} />
            </div>
          </div>

          {/* Time Elapsed */}
          <div 
            className="bg-black/40 p-4 border border-gray-800 animate-fade-in"
            style={{ animationDelay: '0.8s', opacity: 0, animationFillMode: 'forwards' }}
          >
            <p className="text-gray-500 text-xs uppercase">Time Elapsed</p>
            <p className="text-3xl text-terminal-green">
              {Math.floor(stats.timeElapsed / 60)}m {stats.timeElapsed % 60}s
            </p>
          </div>

          {/* Status */}
          <div 
            className="bg-black/40 p-4 border border-gray-800 col-span-2 animate-fade-in"
            style={{ animationDelay: '1.0s', opacity: 0, animationFillMode: 'forwards' }}
          >
             <p className="text-gray-500 text-xs uppercase">Status</p>
             <GlitchText 
               text={stats.surrendered ? "SURVIVOR" : "TERMINATED"} 
               className={`text-xl ${stats.surrendered ? 'text-yellow-400' : 'text-neon-red'}`}
             />
          </div>
        </div>

        <div 
          className="animate-fade-in"
          style={{ animationDelay: '1.2s', opacity: 0, animationFillMode: 'forwards' }}
        >
          <Button onClick={onRetry} className="w-full">
            REBOOT_SYSTEM()
          </Button>
        </div>
      </div>
    </div>
  );
};