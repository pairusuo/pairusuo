import type { MinesweeperPrefs } from "@/lib/games/minesweeper/types";

const PREFS_KEY = "pairusuo:game:minesweeper:prefs";

export const DEFAULT_MINESWEEPER_PREFS: MinesweeperPrefs = {
  bestTimes: {},
  bombTheme: "default",
  customBombs: [],
  difficultyId: "classic",
  flagMode: false,
};

export function loadPrefs(): MinesweeperPrefs | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(PREFS_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as Partial<MinesweeperPrefs>;
    return sanitizePrefs(parsed);
  } catch {
    return null;
  }
}

export function savePrefs(prefs: MinesweeperPrefs) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  } catch {
    return;
  }
}

function sanitizePrefs(parsed: Partial<MinesweeperPrefs>): MinesweeperPrefs {
  const bestTimes = Object.fromEntries(
    Object.entries(parsed.bestTimes ?? {}).filter((entry): entry is [string, number] => typeof entry[1] === "number"),
  ) as MinesweeperPrefs["bestTimes"];

  const customBombs = Array.isArray(parsed.customBombs)
    ? parsed.customBombs.filter(
        (item): item is MinesweeperPrefs["customBombs"][number] =>
          typeof item?.id === "string" &&
          typeof item?.name === "string" &&
          (typeof item?.src === "string" || typeof item?.emoji === "string"),
      )
    : [];

  return {
    bestTimes,
    bombTheme:
      parsed.bombTheme === "custom" && customBombs.length > 0 ? "custom" : DEFAULT_MINESWEEPER_PREFS.bombTheme,
    customBombs,
    difficultyId:
      parsed.difficultyId === "quick" || parsed.difficultyId === "classic" || parsed.difficultyId === "hard"
        ? parsed.difficultyId
        : DEFAULT_MINESWEEPER_PREFS.difficultyId,
    flagMode: Boolean(parsed.flagMode),
  };
}
