"use client";

import { useEffect, useRef, useState } from "react";
import { createSnapshot, getDifficultyPreset, revealCell, toggleFlag } from "@/lib/games/minesweeper/core";
import { DEFAULT_BOMB_VISUALS } from "@/lib/games/minesweeper/default-bombs";
import { DEFAULT_MINESWEEPER_PREFS, loadPrefs, savePrefs } from "@/lib/games/minesweeper/storage";
import type { BombTheme, BombVisual, MinesweeperDifficultyId, MinesweeperSnapshot } from "@/lib/games/minesweeper/types";

const MAX_CUSTOM_BOMBS = 8;
const CUSTOM_IMAGE_SIZE = 240;

export function useMinesweeper() {
  const [prefs, setPrefs] = useState(DEFAULT_MINESWEEPER_PREFS);
  const [snapshot, setSnapshot] = useState<MinesweeperSnapshot>(() =>
    createSnapshot(getDifficultyPreset(DEFAULT_MINESWEEPER_PREFS.difficultyId)),
  );
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const startedAtRef = useRef<number | null>(null);

  const difficulty = getDifficultyPreset(prefs.difficultyId);
  const canUseCustomTheme = prefs.customBombs.length > 0;
  const activeBombs = prefs.bombTheme === "custom" && canUseCustomTheme ? prefs.customBombs : DEFAULT_BOMB_VISUALS;
  const activeBombMap = new Map(activeBombs.map((item) => [item.id, item]));
  const bestTime = prefs.bestTimes[prefs.difficultyId] ?? null;
  const safeCellsRemaining = snapshot.safeCellCount - snapshot.revealedSafeCount;
  const remainingBombs = snapshot.mineCount - snapshot.flagsUsed;

  useEffect(() => {
    const storedPrefs = loadPrefs();
    if (storedPrefs) {
      setPrefs(storedPrefs);
      setSnapshot(createSnapshot(getDifficultyPreset(storedPrefs.difficultyId)));
    }
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }
    savePrefs(prefs);
  }, [isHydrated, prefs]);

  useEffect(() => {
    if (snapshot.status !== "playing" || startedAtRef.current === null) {
      return;
    }

    const syncElapsed = () => {
      if (startedAtRef.current === null) {
        return;
      }
      setElapsedSeconds(Math.max(0, Math.floor((Date.now() - startedAtRef.current) / 1000)));
    };

    syncElapsed();
    const intervalId = window.setInterval(syncElapsed, 1000);
    return () => window.clearInterval(intervalId);
  }, [snapshot.status]);

  function restart(nextDifficultyId = prefs.difficultyId) {
    startedAtRef.current = null;
    setElapsedSeconds(0);
    setUploadError(null);
    setSnapshot(createSnapshot(getDifficultyPreset(nextDifficultyId)));
  }

  function setDifficulty(nextDifficultyId: MinesweeperDifficultyId) {
    setPrefs((current) => ({ ...current, difficultyId: nextDifficultyId }));
    restart(nextDifficultyId);
  }

  function setBombTheme(nextTheme: BombTheme) {
    if (nextTheme === "custom" && prefs.customBombs.length === 0) {
      return;
    }

    setPrefs((current) => ({ ...current, bombTheme: nextTheme }));
    restart();
  }

  function toggleFlagMode() {
    setPrefs((current) => ({ ...current, flagMode: !current.flagMode }));
  }

  function reveal(index: number) {
    const nextSnapshot = revealCell(
      snapshot,
      index,
      (prefs.bombTheme === "custom" && prefs.customBombs.length > 0 ? prefs.customBombs : DEFAULT_BOMB_VISUALS).map(
        (item) => item.id,
      ),
    );

    if (nextSnapshot === snapshot) {
      return;
    }

    const startedThisTurn = snapshot.status === "ready" && nextSnapshot.status !== "ready";
    if (startedThisTurn) {
      startedAtRef.current = Date.now();
      setElapsedSeconds(0);
    }

    setSnapshot(nextSnapshot);

    if (nextSnapshot.status === "won") {
      const finalElapsed = getElapsedFromStart(startedAtRef.current);
      setElapsedSeconds(finalElapsed);
      setPrefs((current) => {
        const currentBest = current.bestTimes[current.difficultyId];
        if (currentBest !== undefined && currentBest <= finalElapsed) {
          return current;
        }
        return {
          ...current,
          bestTimes: {
            ...current.bestTimes,
            [current.difficultyId]: finalElapsed,
          },
        };
      });
      return;
    }

    if (nextSnapshot.status === "lost") {
      setElapsedSeconds(getElapsedFromStart(startedAtRef.current));
    }
  }

  function toggleFlagAt(index: number) {
    const nextSnapshot = toggleFlag(snapshot, index);
    if (nextSnapshot !== snapshot) {
      setSnapshot(nextSnapshot);
    }
  }

  async function addCustomBombs(input: FileList | File[]) {
    const remainingSlots = Math.max(0, MAX_CUSTOM_BOMBS - prefs.customBombs.length);
    if (remainingSlots === 0) {
      setUploadError("The custom bomb pack is full. Remove one before adding more.");
      return;
    }

    const files = Array.from(input)
      .filter((file) => file.type.startsWith("image/"))
      .slice(0, remainingSlots);

    if (files.length === 0) {
      setUploadError("Select at least one image file.");
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      const processed = await Promise.all(files.map((file, index) => processCustomBomb(file, index)));
      setPrefs((current) => ({
        ...current,
        customBombs: [...current.customBombs, ...processed].slice(0, MAX_CUSTOM_BOMBS),
        bombTheme: "custom",
      }));
      restart();
    } catch {
      setUploadError("At least one image could not be processed. Try a different file.");
    } finally {
      setIsUploading(false);
    }
  }

  function removeCustomBomb(id: string) {
    const exists = prefs.customBombs.some((item) => item.id === id);
    if (!exists) {
      return;
    }

    setPrefs((current) => {
      const customBombs = current.customBombs.filter((item) => item.id !== id);
      return {
        ...current,
        customBombs,
        bombTheme: customBombs.length > 0 ? current.bombTheme : "default",
      };
    });
    restart();
  }

  function clearCustomBombs() {
    if (prefs.customBombs.length === 0) {
      return;
    }

    setPrefs((current) => ({
      ...current,
      customBombs: [],
      bombTheme: "default",
    }));
    restart();
  }

  return {
    activeBombMap,
    activeBombs,
    addCustomBombs,
    bestTime,
    canUseCustomTheme,
    clearCustomBombs,
    customBombs: prefs.customBombs,
    difficulty,
    elapsedSeconds,
    flagMode: prefs.flagMode,
    isHydrated,
    isUploading,
    remainingBombs,
    removeCustomBomb,
    restart,
    reveal,
    safeCellsRemaining,
    setBombTheme,
    setDifficulty,
    snapshot,
    theme: prefs.bombTheme,
    toggleFlag: toggleFlagAt,
    toggleFlagMode,
    uploadError,
  };
}

function getElapsedFromStart(startedAt: number | null) {
  if (startedAt === null) {
    return 0;
  }
  return Math.max(0, Math.floor((Date.now() - startedAt) / 1000));
}

async function processCustomBomb(file: File, index: number): Promise<BombVisual> {
  const image = await loadFileAsImage(file);
  const canvas = document.createElement("canvas");
  canvas.width = CUSTOM_IMAGE_SIZE;
  canvas.height = CUSTOM_IMAGE_SIZE;

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Canvas unavailable");
  }

  context.fillStyle = "#fff8f0";
  context.fillRect(0, 0, CUSTOM_IMAGE_SIZE, CUSTOM_IMAGE_SIZE);

  const scale = Math.max(CUSTOM_IMAGE_SIZE / image.width, CUSTOM_IMAGE_SIZE / image.height);
  const drawWidth = image.width * scale;
  const drawHeight = image.height * scale;
  const drawX = (CUSTOM_IMAGE_SIZE - drawWidth) / 2;
  const drawY = (CUSTOM_IMAGE_SIZE - drawHeight) / 2;

  context.drawImage(image, drawX, drawY, drawWidth, drawHeight);

  return {
    id: `custom-${Date.now()}-${index}-${Math.random().toString(36).slice(2, 8)}`,
    name: stripExtension(file.name) || `custom-${index + 1}`,
    src: canvas.toDataURL("image/webp", 0.86),
  };
}

function loadFileAsImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Failed to load image"));
    };
    image.src = objectUrl;
  });
}

function stripExtension(fileName: string) {
  return fileName.replace(/\.[^.]+$/, "");
}
