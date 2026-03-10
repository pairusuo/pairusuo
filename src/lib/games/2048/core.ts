import type { Board, Direction, GameMode, GameSnapshot, MoveResult } from "@/lib/games/2048/types";

const VALID_SIZES = new Set([4, 5, 6, 7, 8, 9]);

export function isValidSize(size: number): boolean {
  return VALID_SIZES.has(size);
}

export function getTargetForSize(size: number, mode: GameMode): number {
  const extra = Math.max(0, size - 4);
  const exponent = mode === "standard" ? 11 + extra : 11 + extra * 2;
  return 2 ** exponent;
}

export function createEmptyBoard(size: number): Board {
  return Array.from({ length: size }, () => Array.from({ length: size }, () => 0));
}

export function createInitialSnapshot(
  size: number,
  mode: GameMode,
  random = Math.random,
): GameSnapshot {
  let board = createEmptyBoard(size);
  board = addRandomTile(board, random);
  board = addRandomTile(board, random);

  return {
    board,
    size,
    mode,
    score: 0,
    target: getTargetForSize(size, mode),
    won: false,
    over: false,
    keepPlaying: false,
    steps: 0,
    winSteps: null,
    startTimeMs: 0,
  };
}

export function moveSnapshot(
  snapshot: GameSnapshot,
  direction: Direction,
  random = Math.random,
): MoveResult {
  if (isGameTerminated(snapshot)) {
    return { snapshot, moved: false, scoreGained: 0 };
  }

  const { board, scoreGained, moved, maxCreated } = moveBoard(snapshot.board, direction);

  if (!moved) {
    return { snapshot, moved: false, scoreGained: 0 };
  }

  const boardWithSpawn = addRandomTile(board, random);
  const won = snapshot.won || maxCreated >= snapshot.target;
  const steps = snapshot.steps + 1;
  const nextSnapshot: GameSnapshot = {
    ...snapshot,
    board: boardWithSpawn,
    score: snapshot.score + scoreGained,
    won,
    over: !hasMovesAvailable(boardWithSpawn),
    steps,
    winSteps: won && snapshot.winSteps === null ? steps : snapshot.winSteps,
    startTimeMs: snapshot.startTimeMs || Date.now(),
  };

  return {
    snapshot: nextSnapshot,
    moved: true,
    scoreGained,
  };
}

export function continueAfterWin(snapshot: GameSnapshot): GameSnapshot {
  return {
    ...snapshot,
    keepPlaying: true,
  };
}

export function isGameTerminated(snapshot: GameSnapshot): boolean {
  return snapshot.over || (snapshot.won && !snapshot.keepPlaying);
}

export function hasMovesAvailable(board: Board): boolean {
  const size = board.length;

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const value = board[y][x];
      if (value === 0) {
        return true;
      }
      if (x + 1 < size && board[y][x + 1] === value) {
        return true;
      }
      if (y + 1 < size && board[y + 1][x] === value) {
        return true;
      }
    }
  }

  return false;
}

function addRandomTile(board: Board, random: () => number): Board {
  const available = getAvailableCells(board);
  if (available.length === 0) {
    return board;
  }

  const { x, y } = available[Math.floor(random() * available.length)];
  const value = random() < 0.9 ? 2 : 4;
  const nextBoard = cloneBoard(board);
  nextBoard[y][x] = value;
  return nextBoard;
}

function getAvailableCells(board: Board): Array<{ x: number; y: number }> {
  const cells: Array<{ x: number; y: number }> = [];

  for (let y = 0; y < board.length; y += 1) {
    for (let x = 0; x < board.length; x += 1) {
      if (board[y][x] === 0) {
        cells.push({ x, y });
      }
    }
  }

  return cells;
}

function moveBoard(board: Board, direction: Direction) {
  const size = board.length;
  const nextBoard = createEmptyBoard(size);
  let moved = false;
  let scoreGained = 0;
  let maxCreated = 0;

  for (let index = 0; index < size; index += 1) {
    const line = readLine(board, direction, index);
    const processed = collapseLine(line);
    scoreGained += processed.scoreGained;
    maxCreated = Math.max(maxCreated, processed.maxCreated);
    if (!moved && !linesEqual(line, processed.line)) {
      moved = true;
    }
    writeLine(nextBoard, direction, index, processed.line);
  }

  return { board: nextBoard, moved, scoreGained, maxCreated };
}

function collapseLine(line: number[]) {
  const tiles = line.filter((value) => value !== 0);
  const next: number[] = [];
  let scoreGained = 0;
  let maxCreated = 0;

  for (let index = 0; index < tiles.length; index += 1) {
    const current = tiles[index];
    const nextValue = tiles[index + 1];
    if (nextValue !== undefined && current === nextValue) {
      const merged = current * 2;
      next.push(merged);
      scoreGained += merged;
      maxCreated = Math.max(maxCreated, merged);
      index += 1;
    } else {
      next.push(current);
      maxCreated = Math.max(maxCreated, current);
    }
  }

  while (next.length < line.length) {
    next.push(0);
  }

  return { line: next, scoreGained, maxCreated };
}

function readLine(board: Board, direction: Direction, index: number): number[] {
  const size = board.length;

  switch (direction) {
    case 0:
      return Array.from({ length: size }, (_, y) => board[y][index]);
    case 1:
      return Array.from({ length: size }, (_, offset) => board[index][size - 1 - offset]);
    case 2:
      return Array.from({ length: size }, (_, offset) => board[size - 1 - offset][index]);
    case 3:
      return [...board[index]];
    default:
      return [];
  }
}

function writeLine(board: Board, direction: Direction, index: number, line: number[]) {
  const size = board.length;

  switch (direction) {
    case 0:
      for (let y = 0; y < size; y += 1) {
        board[y][index] = line[y];
      }
      return;
    case 1:
      for (let offset = 0; offset < size; offset += 1) {
        board[index][size - 1 - offset] = line[offset];
      }
      return;
    case 2:
      for (let offset = 0; offset < size; offset += 1) {
        board[size - 1 - offset][index] = line[offset];
      }
      return;
    case 3:
      for (let x = 0; x < size; x += 1) {
        board[index][x] = line[x];
      }
      return;
  }
}

function cloneBoard(board: Board): Board {
  return board.map((row) => [...row]);
}

function linesEqual(left: number[], right: number[]): boolean {
  if (left.length !== right.length) {
    return false;
  }

  for (let index = 0; index < left.length; index += 1) {
    if (left[index] !== right[index]) {
      return false;
    }
  }

  return true;
}
