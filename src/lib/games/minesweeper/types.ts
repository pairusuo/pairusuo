export type MinesweeperStatus = "ready" | "playing" | "won" | "lost";

export type MinesweeperDifficultyId = "quick" | "classic" | "hard";

export type BombTheme = "default" | "custom";

export interface BombVisual {
  id: string;
  name: string;
  src?: string;
  emoji?: string;
}

export interface MinesweeperDifficultyPreset {
  id: MinesweeperDifficultyId;
  label: string;
  columns: number;
  rows: number;
  mines: number;
  hint: string;
}

export interface MinesweeperCell {
  index: number;
  row: number;
  column: number;
  adjacentBombs: number;
  bombVisualId: string | null;
  isBomb: boolean;
  isFlagged: boolean;
  isRevealed: boolean;
}

export interface MinesweeperSnapshot {
  columns: number;
  rows: number;
  mineCount: number;
  revealedSafeCount: number;
  flagsUsed: number;
  safeCellCount: number;
  status: MinesweeperStatus;
  cells: MinesweeperCell[];
}

export interface MinesweeperPrefs {
  bestTimes: Partial<Record<MinesweeperDifficultyId, number>>;
  bombTheme: BombTheme;
  customBombs: BombVisual[];
  difficultyId: MinesweeperDifficultyId;
  flagMode: boolean;
}
