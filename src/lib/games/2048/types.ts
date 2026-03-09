export type GameMode = "balanced" | "standard";

export type Direction = 0 | 1 | 2 | 3;

export type StrategyKey = "ud" | "lr" | "udlr" | "lrud" | "cw" | "ccw";

export type Board = number[][];

export interface GameSnapshot {
  board: Board;
  size: number;
  mode: GameMode;
  score: number;
  target: number;
  won: boolean;
  over: boolean;
  keepPlaying: boolean;
  steps: number;
  winSteps: number | null;
  startTimeMs: number;
}

export interface MoveResult {
  snapshot: GameSnapshot;
  moved: boolean;
  scoreGained: number;
}

export interface GamePrefs {
  size: number;
  mode: GameMode;
  strategyKey: StrategyKey;
  customPattern: string;
  autoPlayDelayMs: number;
  soundEnabled: boolean;
}
