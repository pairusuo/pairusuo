import type {
  MinesweeperCell,
  MinesweeperDifficultyId,
  MinesweeperDifficultyPreset,
  MinesweeperSnapshot,
} from "@/lib/games/minesweeper/types";

export const DIFFICULTY_PRESETS: MinesweeperDifficultyPreset[] = [
  {
    id: "quick",
    label: "Quick",
    columns: 9,
    rows: 9,
    mines: 10,
    hint: "Short rounds with the familiar beginner feel.",
  },
  {
    id: "classic",
    label: "Classic",
    columns: 10,
    rows: 10,
    mines: 16,
    hint: "A balanced board with the familiar classic feel.",
  },
  {
    id: "hard",
    label: "Hard",
    columns: 16,
    rows: 16,
    mines: 40,
    hint: "A denser board for longer sessions and riskier guesses.",
  },
];

export function getDifficultyPreset(id: MinesweeperDifficultyId): MinesweeperDifficultyPreset {
  return DIFFICULTY_PRESETS.find((preset) => preset.id === id) ?? DIFFICULTY_PRESETS[1];
}

export function createSnapshot(preset: MinesweeperDifficultyPreset): MinesweeperSnapshot {
  const totalCells = preset.columns * preset.rows;
  return {
    columns: preset.columns,
    rows: preset.rows,
    mineCount: preset.mines,
    revealedSafeCount: 0,
    flagsUsed: 0,
    safeCellCount: totalCells - preset.mines,
    status: "ready",
    cells: Array.from({ length: totalCells }, (_, index) => createCell(index, preset.columns)),
  };
}

export function revealCell(
  snapshot: MinesweeperSnapshot,
  index: number,
  bombVisualIds: string[],
): MinesweeperSnapshot {
  const target = snapshot.cells[index];
  if (!target || target.isFlagged || target.isRevealed || snapshot.status === "won" || snapshot.status === "lost") {
    return snapshot;
  }

  const nextSnapshot =
    snapshot.status === "ready" ? armSnapshot(snapshot, index, bombVisualIds) : cloneSnapshot(snapshot);
  const nextTarget = nextSnapshot.cells[index];

  if (nextTarget.isBomb) {
    nextTarget.isRevealed = true;
    revealBombs(nextSnapshot.cells);
    nextSnapshot.status = "lost";
    return nextSnapshot;
  }

  floodReveal(nextSnapshot, index);

  if (nextSnapshot.revealedSafeCount >= nextSnapshot.safeCellCount) {
    nextSnapshot.status = "won";
    revealBombs(nextSnapshot.cells);
    return nextSnapshot;
  }

  nextSnapshot.status = "playing";
  return nextSnapshot;
}

export function toggleFlag(snapshot: MinesweeperSnapshot, index: number): MinesweeperSnapshot {
  if (snapshot.status === "won" || snapshot.status === "lost") {
    return snapshot;
  }

  const target = snapshot.cells[index];
  if (!target || target.isRevealed) {
    return snapshot;
  }

  const nextSnapshot = cloneSnapshot(snapshot);
  const nextTarget = nextSnapshot.cells[index];
  nextTarget.isFlagged = !nextTarget.isFlagged;
  nextSnapshot.flagsUsed += nextTarget.isFlagged ? 1 : -1;
  return nextSnapshot;
}

function createCell(index: number, columns: number): MinesweeperCell {
  return {
    index,
    row: Math.floor(index / columns),
    column: index % columns,
    adjacentBombs: 0,
    bombVisualId: null,
    isBomb: false,
    isFlagged: false,
    isRevealed: false,
  };
}

function cloneSnapshot(snapshot: MinesweeperSnapshot): MinesweeperSnapshot {
  return {
    ...snapshot,
    cells: snapshot.cells.map((cell) => ({ ...cell })),
  };
}

function armSnapshot(snapshot: MinesweeperSnapshot, firstRevealIndex: number, bombVisualIds: string[]) {
  const nextSnapshot = cloneSnapshot(snapshot);
  const blockedIndices = collectSafeZone(firstRevealIndex, snapshot.columns, snapshot.rows);
  const candidateIndices = collectCandidateIndices(snapshot.cells.length, blockedIndices, firstRevealIndex);
  const mineIndices = shuffle(candidateIndices).slice(0, snapshot.mineCount);
  const visualPool = buildVisualPool(bombVisualIds, snapshot.mineCount);

  mineIndices.forEach((mineIndex, visualIndex) => {
    const cell = nextSnapshot.cells[mineIndex];
    cell.isBomb = true;
    cell.bombVisualId = visualPool[visualIndex] ?? null;
  });

  nextSnapshot.cells.forEach((cell) => {
    if (cell.isBomb) {
      return;
    }
    cell.adjacentBombs = getNeighborIndices(cell.index, snapshot.columns, snapshot.rows).reduce((count, neighborIndex) => {
      return count + (nextSnapshot.cells[neighborIndex].isBomb ? 1 : 0);
    }, 0);
  });

  return nextSnapshot;
}

function collectSafeZone(index: number, columns: number, rows: number) {
  const blocked = new Set<number>([index]);
  getNeighborIndices(index, columns, rows).forEach((neighborIndex) => blocked.add(neighborIndex));
  return blocked;
}

function collectCandidateIndices(totalCells: number, blockedIndices: Set<number>, firstRevealIndex: number) {
  let candidates = Array.from({ length: totalCells }, (_, index) => index).filter((index) => !blockedIndices.has(index));
  if (candidates.length > 0) {
    return candidates;
  }
  candidates = Array.from({ length: totalCells }, (_, index) => index).filter((index) => index !== firstRevealIndex);
  return candidates;
}

function buildVisualPool(bombVisualIds: string[], mineCount: number) {
  if (bombVisualIds.length === 0) {
    return [];
  }

  const repeated = Array.from({ length: mineCount }, (_, index) => bombVisualIds[index % bombVisualIds.length]);
  return shuffle(repeated);
}

function floodReveal(snapshot: MinesweeperSnapshot, startIndex: number) {
  const queue = [startIndex];

  while (queue.length > 0) {
    const index = queue.shift();
    if (index === undefined) {
      continue;
    }

    const cell = snapshot.cells[index];
    if (cell.isRevealed || cell.isFlagged || cell.isBomb) {
      continue;
    }

    cell.isRevealed = true;
    snapshot.revealedSafeCount += 1;

    if (cell.adjacentBombs > 0) {
      continue;
    }

    getNeighborIndices(index, snapshot.columns, snapshot.rows).forEach((neighborIndex) => {
      const neighbor = snapshot.cells[neighborIndex];
      if (!neighbor.isRevealed && !neighbor.isFlagged && !neighbor.isBomb) {
        queue.push(neighborIndex);
      }
    });
  }
}

function revealBombs(cells: MinesweeperCell[]) {
  cells.forEach((cell) => {
    if (cell.isBomb) {
      cell.isRevealed = true;
      cell.isFlagged = false;
    }
  });
}

function getNeighborIndices(index: number, columns: number, rows: number) {
  const row = Math.floor(index / columns);
  const column = index % columns;
  const neighbors: number[] = [];

  for (let rowOffset = -1; rowOffset <= 1; rowOffset += 1) {
    for (let columnOffset = -1; columnOffset <= 1; columnOffset += 1) {
      if (rowOffset === 0 && columnOffset === 0) {
        continue;
      }

      const nextRow = row + rowOffset;
      const nextColumn = column + columnOffset;

      if (nextRow < 0 || nextRow >= rows || nextColumn < 0 || nextColumn >= columns) {
        continue;
      }

      neighbors.push(nextRow * columns + nextColumn);
    }
  }

  return neighbors;
}

function shuffle<T>(items: T[]) {
  const next = [...items];
  for (let index = next.length - 1; index > 0; index -= 1) {
    const targetIndex = Math.floor(Math.random() * (index + 1));
    [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
  }
  return next;
}
