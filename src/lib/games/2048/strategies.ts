import type { Direction, StrategyKey } from "@/lib/games/2048/types";

export const PRESET_STRATEGIES: Record<StrategyKey, Direction[]> = {
  ud: [0, 2],
  lr: [3, 1],
  udlr: [0, 2, 3, 1],
  lrud: [3, 1, 0, 2],
  cw: [0, 1, 2, 3],
  ccw: [0, 3, 2, 1],
};

const DIRECTION_MAP: Record<string, Direction> = {
  U: 0,
  R: 1,
  D: 2,
  L: 3,
};

export function parseStrategyPattern(input: string): Direction[] {
  const normalized = input.trim().toUpperCase().replace(/[,;]+/g, " ");
  if (!normalized) {
    return [];
  }

  const output: Direction[] = [];

  for (const token of normalized.split(/\s+/)) {
    const match = /^([URDL])(\d+)?$/.exec(token);
    if (!match) {
      continue;
    }
    const direction = DIRECTION_MAP[match[1]];
    const repeat = Math.max(1, Number.parseInt(match[2] ?? "1", 10));
    for (let count = 0; count < repeat; count += 1) {
      output.push(direction);
    }
  }

  return output;
}

export function getDirectionLabel(direction: Direction): string {
  switch (direction) {
    case 0:
      return "↑";
    case 1:
      return "→";
    case 2:
      return "↓";
    case 3:
      return "←";
    default:
      return "";
  }
}
