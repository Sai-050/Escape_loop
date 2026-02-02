export enum Difficulty {
  Easy = "Easy",
  Medium = "Medium",
  Hard = "Hard",
  Extreme = "Extreme"
}

export interface QuestionData {
  question: string;
  options: string[];
  correctIndex: number;
  category: string;
  difficulty: Difficulty;
}

export type GameStatus = 'menu' | 'playing' | 'gameover';

export interface GameStats {
  level: number;
  score: number;
  timeElapsed: number; // in seconds
  questionsAnswered: number;
  surrendered: boolean;
}