import React, { useState, useEffect, useCallback, useRef } from 'react';
import { generateQuestion } from '../services/geminiService';
import { QuestionData, GameStats } from '../types';
import { Button } from './Button';
import { GlitchText } from './GlitchText';

interface GameScreenProps {
  onEndGame: (stats: GameStats) => void;
  playerName: string;
}

export const GameScreen: React.FC<GameScreenProps> = ({ onEndGame, playerName }) => {
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [questionData, setQuestionData] = useState<QuestionData | null>(null);
  const [startTime] = useState(Date.now());
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  // Score popup state
  const [scorePopup, setScorePopup] = useState<{ show: boolean; value: number; id: number } | null>(null);

  // Cache/Prefetch store: level -> Promise
  const questionCache = useRef<Map<number, Promise<QuestionData>>>(new Map());

  // Function to ensure a level is being fetched
  const getOrFetchLevel = useCallback((lvl: number) => {
    if (!questionCache.current.has(lvl)) {
      console.log(`Pre-fetching level ${lvl}...`);
      questionCache.current.set(lvl, generateQuestion(lvl));
    }
    return questionCache.current.get(lvl)!;
  }, []);

  // Load question for current level
  const loadLevel = useCallback(async (currentLevel: number) => {
    setProcessing(false);
    setSelectedOption(null);
    setProgress(0);
    setLoading(true);

    try {
      // Fetch current level (might be cached)
      const data = await getOrFetchLevel(currentLevel);
      setQuestionData(data);

      // Immediately start fetching the NEXT level in the background
      getOrFetchLevel(currentLevel + 1);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [getOrFetchLevel]);

  useEffect(() => {
    loadLevel(level);
  }, [level, loadLevel]);

  const handleOptionClick = (index: number) => {
    if (processing || loading || !questionData) return;

    setSelectedOption(index);
    setProcessing(true);

    const isCorrect = index === questionData.correctIndex;

    if (isCorrect) {
      // Calculate Points: Base 100 + (Level * 50)
      const points = 100 + (level * 50);
      setScore(prev => prev + points);

      // Trigger Popup
      setScorePopup({ show: true, value: points, id: Date.now() });

      // Animate progress bar to full
      setProgress(100);

      // Auto-hide popup after 1s (though component might unmount/reload by then)
      setTimeout(() => {
        setScorePopup(prev => prev ? { ...prev, show: false } : null);
      }, 1000);
    }

    // Delay to allow animation or visual feedback
    setTimeout(() => {
      if (isCorrect) {
        // Correct - Advance Level
        setLevel(prev => prev + 1);
      } else {
        // Incorrect - Game Over
        finishGame(false);
      }
    }, 600); // Increased slightly to 600ms to let the user see the score popup start
  };

  const handleSurrender = () => {
    finishGame(true);
  };

  const finishGame = (surrendered: boolean) => {
    const timeElapsed = Math.floor((Date.now() - startTime) / 1000);
    onEndGame({
      level: level,
      score: score,
      questionsAnswered: surrendered ? level - 1 : level - 1,
      timeElapsed,
      surrendered
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 font-mono text-terminal-green">
        <div className="w-12 h-12 border-4 border-terminal-green border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="animate-pulse tracking-widest">&gt; DECRYPTING...</p>
      </div>
    );
  }

  if (!questionData) return null;

  return (
    <div className="min-h-screen p-4 md:p-8 pt-16 md:pt-20 flex flex-col max-w-4xl mx-auto font-mono relative">

      {/* Score Popup Animation */}
      {scorePopup && scorePopup.show && (
        <div
          key={scorePopup.id}
          className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none animate-fade-in"
          style={{ animationDuration: '300ms' }}
        >
          <div className="text-4xl md:text-6xl font-bold text-terminal-green drop-shadow-[0_0_15px_rgba(0,255,65,0.8)] flex flex-col items-center">
            <span>+{scorePopup.value}</span>
            <span className="text-sm tracking-widest uppercase text-white mt-1">System Updated</span>
          </div>
        </div>
      )}

      {/* Header Stats */}
      <header className="flex justify-between items-start mb-8 border-b border-gray-800 pb-4">
        <div>
          <h2 className="text-xl text-gray-400">LEVEL</h2>
          <div className="flex flex-col w-24">
            <p className="text-3xl text-terminal-green font-bold">{level.toString().padStart(3, '0')}</p>
            {/* Progress Bar */}
            <div className="w-full h-1 bg-gray-900 mt-1 overflow-hidden">
              <div
                className="h-full bg-terminal-green ease-linear"
                style={{
                  width: `${progress}%`,
                  transition: progress === 100 ? 'width 400ms linear' : 'none'
                }}
              />
            </div>
          </div>
        </div>

        {/* Score Display (Center) */}
        <div className="text-center hidden md:block">
          <h2 className="text-xl text-gray-400">SCORE</h2>
          <p className="text-3xl text-white font-bold tracking-widest">{score.toLocaleString()}</p>
        </div>

        <div className="text-right">
          <h2 className="text-xl text-gray-400">DIFFICULTY</h2>
          <GlitchText text={questionData.difficulty.toUpperCase()} className={`text-xl font-bold ${questionData.difficulty === 'Extreme' ? 'text-neon-red' : 'text-terminal-green'}`} />
          {/* Mobile Score fallback */}
          <div className="md:hidden text-sm text-gray-500 mt-1">
            PTS: {score}
          </div>
        </div>
      </header>

      {/* Category Tag */}
      <div className="mb-4">
        <span className="bg-gray-900 text-gray-300 px-3 py-1 text-sm border border-gray-700 rounded">
          {questionData.category}
        </span>
      </div>

      {/* Question */}
      <main className="flex-grow flex flex-col justify-center mb-8">
        <h3
          key={`q-${level}`}
          className="text-2xl md:text-3xl mb-8 leading-relaxed text-white animate-fade-in"
        >
          {questionData.question}
        </h3>

        <div
          key={`opt-${level}`}
          className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in"
          style={{ animationDelay: '100ms', opacity: 0, animationFillMode: 'forwards' }}
        >
          {questionData.options.map((opt, idx) => {
            const isSelected = selectedOption === idx;
            let btnClass = "text-left h-auto min-h-[80px] whitespace-normal ";

            if (!processing) {
              // Add subtle hover effects: dark bg, green glow, slight lift
              btnClass += "hover:bg-gray-900 hover:shadow-[0_0_15px_rgba(0,255,65,0.2)] hover:-translate-y-1 ";
            }

            if (processing && isSelected) {
              btnClass += "animate-pulse bg-gray-700 border-white text-white";
            }

            return (
              <Button
                key={idx}
                variant="outline"
                className={btnClass}
                onClick={() => handleOptionClick(idx)}
                disabled={processing}
              >
                <span className="mr-4 font-bold text-gray-500">[{String.fromCharCode(65 + idx)}]</span>
                {opt}
              </Button>
            );
          })}
        </div>
      </main>

      {/* Footer / Controls */}
      <footer className="flex justify-between items-end border-t border-gray-800 pt-6">
        <div className="text-xs text-gray-600">
          OPERATOR: {playerName}
        </div>
        <Button variant="danger" onClick={handleSurrender} className="text-sm px-4 py-2">
          SURRENDER_SESSION()
        </Button>
      </footer>
    </div>
  );
};