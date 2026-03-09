"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  continueAfterWin,
  createEmptyBoard,
  createInitialSnapshot,
  isGameTerminated,
  moveSnapshot,
} from "@/lib/games/2048/core";
import { getDirectionLabel, parseStrategyPattern, PRESET_STRATEGIES } from "@/lib/games/2048/strategies";
import {
  clearSnapshot,
  getDefaultPrefs,
  loadBestScore,
  loadPrefs,
  loadSnapshot,
  saveBestScore,
  savePrefs,
  saveSnapshot,
} from "@/lib/games/2048/storage";
import type { Direction, GameMode, GameSnapshot, StrategyKey } from "@/lib/games/2048/types";

type MoveSource = "manual" | "auto";

function createBootSnapshot(): GameSnapshot {
  return {
    board: createEmptyBoard(4),
    size: 4,
    mode: "balanced",
    score: 0,
    target: 2048,
    won: false,
    over: false,
    keepPlaying: false,
    steps: 0,
    winSteps: null,
    startTimeMs: Date.now(),
  };
}

export function useGame2048() {
  const defaultPrefs = getDefaultPrefs();
  const [size, setSize] = useState(defaultPrefs.size);
  const [mode, setMode] = useState<GameMode>(defaultPrefs.mode);
  const [strategyKey, setStrategyKey] = useState<StrategyKey>(defaultPrefs.strategyKey);
  const [customPattern, setCustomPattern] = useState(defaultPrefs.customPattern);
  const [autoPlayDelayMs, setAutoPlayDelayMs] = useState(defaultPrefs.autoPlayDelayMs);
  const [soundEnabled, setSoundEnabled] = useState(defaultPrefs.soundEnabled);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [bestScore, setBestScore] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [snapshot, setSnapshot] = useState<GameSnapshot>(createBootSnapshot);
  const [isHydrated, setIsHydrated] = useState(false);
  const sequenceIndexRef = useRef(0);
  const snapshotRef = useRef(snapshot);

  const customSequence = useMemo(() => parseStrategyPattern(customPattern), [customPattern]);
  const activeSequence = customSequence.length > 0 ? customSequence : PRESET_STRATEGIES[strategyKey];
  const isTerminated = isGameTerminated(snapshot);

  useEffect(() => {
    const prefs = loadPrefs();
    const persisted = loadSnapshot();
    const nextSnapshot =
      persisted && persisted.size === prefs.size && persisted.mode === prefs.mode
        ? persisted
        : createInitialSnapshot(prefs.size, prefs.mode);

    setSize(prefs.size);
    setMode(prefs.mode);
    setStrategyKey(prefs.strategyKey);
    setCustomPattern(prefs.customPattern);
    setAutoPlayDelayMs(prefs.autoPlayDelayMs);
    setSoundEnabled(prefs.soundEnabled);
    setSnapshot(nextSnapshot);
    snapshotRef.current = nextSnapshot;
    setBestScore(loadBestScore(nextSnapshot.size, nextSnapshot.mode));
    setElapsedSeconds(Math.max(0, Math.floor((Date.now() - nextSnapshot.startTimeMs) / 1000)));
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    savePrefs({
      size,
      mode,
      strategyKey,
      customPattern,
      autoPlayDelayMs,
      soundEnabled,
    });
  }, [autoPlayDelayMs, customPattern, isHydrated, mode, size, soundEnabled, strategyKey]);

  useEffect(() => {
    snapshotRef.current = snapshot;
  }, [snapshot]);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    if (snapshot.over) {
      clearSnapshot();
    } else {
      saveSnapshot(snapshot);
    }

    const nextBest = Math.max(loadBestScore(snapshot.size, snapshot.mode), snapshot.score);
    if (nextBest !== bestScore) {
      saveBestScore(snapshot.size, snapshot.mode, nextBest);
      setBestScore(nextBest);
    }
  }, [bestScore, isHydrated, snapshot]);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    const tick = () => {
      setElapsedSeconds(Math.max(0, Math.floor((Date.now() - snapshot.startTimeMs) / 1000)));
    };

    tick();

    if (isTerminated) {
      return;
    }

    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, [isHydrated, isTerminated, snapshot.startTimeMs]);

  useEffect(() => {
    sequenceIndexRef.current = 0;
  }, [activeSequence, strategyKey, customPattern]);

  useEffect(() => {
    if (!isAutoPlaying || !isHydrated) {
      return;
    }

    if (isTerminated || activeSequence.length === 0) {
      setIsAutoPlaying(false);
      return;
    }

    const timer = window.setTimeout(() => {
      const direction = activeSequence[sequenceIndexRef.current % activeSequence.length];
      sequenceIndexRef.current += 1;
      applyMove(direction, "auto");
    }, autoPlayDelayMs);

    return () => window.clearTimeout(timer);
  }, [activeSequence, autoPlayDelayMs, isAutoPlaying, isHydrated, isTerminated, snapshot]);

  function applyMove(direction: Direction, _source: MoveSource = "manual") {
    const result = moveSnapshot(snapshotRef.current, direction);
    if (!result.moved) {
      return false;
    }

    snapshotRef.current = result.snapshot;
    setSnapshot(result.snapshot);
    return true;
  }

  function restart(nextSize = size, nextMode = mode) {
    sequenceIndexRef.current = 0;
    setIsAutoPlaying(false);
    const fresh = createInitialSnapshot(nextSize, nextMode);
    snapshotRef.current = fresh;
    setSnapshot(fresh);
    setBestScore(loadBestScore(nextSize, nextMode));
    setElapsedSeconds(0);
  }

  function changeSize(nextSize: number) {
    setSize(nextSize);
    restart(nextSize, mode);
  }

  function changeMode(nextMode: GameMode) {
    setMode(nextMode);
    restart(size, nextMode);
  }

  function keepPlaying() {
    const nextSnapshot = continueAfterWin(snapshotRef.current);
    snapshotRef.current = nextSnapshot;
    setSnapshot(nextSnapshot);
  }

  function toggleAutoPlay(nextState?: boolean) {
    if ((nextState ?? !isAutoPlaying) && activeSequence.length === 0) {
      return;
    }
    setIsAutoPlaying(nextState ?? !isAutoPlaying);
  }

  return {
    activeSequenceLabels: activeSequence.map(getDirectionLabel).join(" "),
    autoPlayDelayMs,
    bestScore,
    board: snapshot.board,
    canKeepPlaying: snapshot.won && !snapshot.keepPlaying,
    changeMode,
    changeSize,
    customPattern,
    elapsedSeconds,
    isAutoPlaying,
    isHydrated,
    isTerminated,
    keepPlaying,
    mode,
    move: applyMove,
    over: snapshot.over,
    parsedCustomCount: customSequence.length,
    restart,
    score: snapshot.score,
    setAutoPlayDelayMs,
    setCustomPattern,
    setSoundEnabled,
    setStrategyKey,
    size,
    soundEnabled,
    steps: snapshot.steps,
    strategyKey,
    target: snapshot.target,
    toggleAutoPlay,
    winSteps: snapshot.winSteps,
    won: snapshot.won,
  };
}
