import React, { useState } from 'react';
import { LandingPage } from './components/LandingPage';
import { GameScreen } from './components/GameScreen';
import { ResultScreen } from './components/ResultScreen';
import { Button } from './components/Button';
import { GameStatus, GameStats } from './types';


import { saveGameResult } from './services/firebaseService';

const App: React.FC = () => {
  const [gameStatus, setGameStatus] = useState<GameStatus>('menu');
  const [stats, setStats] = useState<GameStats | null>(null);
  const [playerName, setPlayerName] = useState<string>('');

  const startGame = (name?: string) => {
    if (name) setPlayerName(name);
    setGameStatus('playing');
    setStats(null);
  };

  const endGame = (finalStats: GameStats) => {
    setStats(finalStats);
    setGameStatus('gameover');
    if (playerName) {
      saveGameResult(playerName, finalStats);
    }
  };

  const returnToMenu = () => {
    setGameStatus('menu');
    setPlayerName(''); // Reset name when going back to menu
  };

  return (
    <div className="min-h-screen bg-dark-bg text-terminal-green font-mono selection:bg-terminal-green selection:text-black relative">
      {/* Global Navigation - Only visible when not in menu */}
      {gameStatus !== 'menu' && (
        <div className="absolute top-0 left-0 w-full flex justify-start pt-4 pl-4 z-50 pointer-events-none">
          <Button
            variant="outline"
            onClick={returnToMenu}
            className="pointer-events-auto !px-3 !py-1 text-xs !border-gray-800 !text-gray-500 hover:!text-terminal-green hover:!border-terminal-green hover:bg-black/90 backdrop-blur-sm transition-all"
          >
            &lt; HOME
          </Button>
        </div>
      )}

      {gameStatus === 'menu' && <LandingPage onStart={startGame} />}
      {gameStatus === 'playing' && <GameScreen onEndGame={endGame} playerName={playerName} />}
      {gameStatus === 'gameover' && stats && (
        <ResultScreen
          stats={stats}
          onRetry={() => startGame(playerName)}
          playerName={playerName}
        />
      )}
    </div>
  );
};

export default App;