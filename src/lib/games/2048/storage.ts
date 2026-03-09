import { createInitialSnapshot, getTargetForSize, isValidSize } from "@/lib/games/2048/core";
import type { GameMode, GamePrefs, GameSnapshot, StrategyKey } from "@/lib/games/2048/types";

const STATE_KEY = "pairusuo:game:2048:state";
const PREFS_KEY = "pairusuo:game:2048:prefs";

const DEFAULT_PREFS: GamePrefs = {
  size: 4,
  mode: "balanced",
  strategyKey: "ud",
  customPattern: "",
  autoPlayDelayMs: 200,
  soundEnabled: true,
};

export function getDefaultPrefs(): GamePrefs {
  return { ...DEFAULT_PREFS };
}

export function loadPrefs(): GamePrefs {
  if (typeof window === "undefined") {
    return getDefaultPrefs();
  }

  try {
    const raw = window.localStorage.getItem(PREFS_KEY);
    if (!raw) {
      return getDefaultPrefs();
    }
    const parsed = JSON.parse(raw) as Partial<GamePrefs>;
    return {
      size: isValidSize(parsed.size ?? DEFAULT_PREFS.size) ? parsed.size! : DEFAULT_PREFS.size,
      mode: isValidMode(parsed.mode) ? parsed.mode : DEFAULT_PREFS.mode,
      strategyKey: isValidStrategyKey(parsed.strategyKey)
        ? parsed.strategyKey
        : DEFAULT_PREFS.strategyKey,
      customPattern: typeof parsed.customPattern === "string" ? parsed.customPattern : "",
      autoPlayDelayMs: clampDelay(parsed.autoPlayDelayMs),
      soundEnabled: typeof parsed.soundEnabled === "boolean" ? parsed.soundEnabled : DEFAULT_PREFS.soundEnabled,
    };
  } catch {
    return getDefaultPrefs();
  }
}

export function savePrefs(prefs: GamePrefs) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
}

export function loadSnapshot(): GameSnapshot | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(STATE_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw) as Partial<GameSnapshot>;
    const size = parsed.size ?? 0;

    if (!isValidSize(size) || !isValidMode(parsed.mode) || !Array.isArray(parsed.board)) {
      return null;
    }
    const board = parsed.board
      .filter(Array.isArray)
      .slice(0, size)
      .map((row): number[] => {
        if (!Array.isArray(row)) {
          return new Array(size).fill(0);
        }

        const normalized = row
          .slice(0, size)
          .map((value) => (typeof value === "number" && value >= 0 ? value : 0));

        while (normalized.length < size) {
          normalized.push(0);
        }

        return normalized;
      });

    if (board.length !== size || board.some((row) => row.length !== size)) {
      return null;
    }

    return {
      board,
      size,
      mode: parsed.mode,
      score: typeof parsed.score === "number" ? parsed.score : 0,
      target: typeof parsed.target === "number" ? parsed.target : getTargetForSize(size, parsed.mode),
      won: Boolean(parsed.won),
      over: Boolean(parsed.over),
      keepPlaying: Boolean(parsed.keepPlaying),
      steps: typeof parsed.steps === "number" ? parsed.steps : 0,
      winSteps: typeof parsed.winSteps === "number" ? parsed.winSteps : null,
      startTimeMs: typeof parsed.startTimeMs === "number" ? parsed.startTimeMs : Date.now(),
    };
  } catch {
    return null;
  }
}

export function saveSnapshot(snapshot: GameSnapshot) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STATE_KEY, JSON.stringify(snapshot));
}

export function clearSnapshot() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(STATE_KEY);
}

export function loadBestScore(size: number, mode: GameMode): number {
  if (typeof window === "undefined") {
    return 0;
  }

  const raw = window.localStorage.getItem(getBestScoreKey(size, mode));
  return raw ? Number.parseInt(raw, 10) || 0 : 0;
}

export function saveBestScore(size: number, mode: GameMode, score: number) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(getBestScoreKey(size, mode), String(score));
}

export function createSnapshotFromPrefs(prefs: GamePrefs): GameSnapshot {
  return createInitialSnapshot(prefs.size, prefs.mode);
}

function getBestScoreKey(size: number, mode: GameMode): string {
  return `pairusuo:game:2048:best:${mode}:${size}`;
}

function clampDelay(delay: number | undefined): number {
  if (typeof delay !== "number" || Number.isNaN(delay)) {
    return DEFAULT_PREFS.autoPlayDelayMs;
  }
  return Math.min(2000, Math.max(100, Math.round(delay)));
}

function isValidMode(mode: unknown): mode is GameMode {
  return mode === "balanced" || mode === "standard";
}

function isValidStrategyKey(key: unknown): key is StrategyKey {
  return key === "ud" || key === "lr" || key === "udlr" || key === "lrud" || key === "cw" || key === "ccw";
}
