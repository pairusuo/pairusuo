"use client";

import type { ChangeEvent, PointerEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRef } from "react";
import { Bomb, Clock3, Eye, Flag, ImagePlus, RotateCcw, Sparkles, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DIFFICULTY_PRESETS } from "@/lib/games/minesweeper/core";
import { DEFAULT_BOMB_VISUALS } from "@/lib/games/minesweeper/default-bombs";
import { useMinesweeper } from "@/lib/games/minesweeper/use-minesweeper";
import { cn } from "@/lib/utils";
import styles from "./GameMinesweeper.module.css";

const NUMBER_COLORS = ["#2563eb", "#0f766e", "#dc2626", "#7c3aed", "#ca8a04", "#0f766e", "#334155", "#be123c"];

export function GameMinesweeper() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const longPressTimerRef = useRef<number | null>(null);
  const preventClickRef = useRef<number | null>(null);
  const {
    activeBombMap,
    activeBombs,
    addCustomBombs,
    bestTime,
    canUseCustomTheme,
    clearCustomBombs,
    customBombs,
    difficulty,
    elapsedSeconds,
    flagMode,
    isHydrated,
    isUploading,
    remainingBombs,
    restart,
    reveal,
    safeCellsRemaining,
    setBombTheme,
    setDifficulty,
    snapshot,
    theme,
    toggleFlag,
    toggleFlagMode,
    uploadError,
  } = useMinesweeper();

  const boardCellSize = difficulty.columns >= 16 ? 38 : difficulty.columns >= 10 ? 48 : 52;
  const themeShowcaseVisuals =
    theme === "custom" && customBombs.length > 0 ? customBombs.slice(0, Math.min(4, customBombs.length)) : DEFAULT_BOMB_VISUALS;
  const activeThemeLabel = theme === "custom" && customBombs.length > 0 ? "Custom uploads" : "Default bomb";
  const themeBadgeLabel = theme === "custom" && customBombs.length > 0 ? `${customBombs.length} uploads` : "Classic";
  const statusTitle =
    snapshot.status === "won" ? "Board cleared" : snapshot.status === "lost" ? "Boom" : snapshot.status === "playing" ? "In play" : "Ready";

  function openFilePicker() {
    fileInputRef.current?.click();
  }

  function onFilesSelected(event: ChangeEvent<HTMLInputElement>) {
    const files = event.target.files;
    if (!files || files.length === 0) {
      return;
    }

    void addCustomBombs(files);
    event.target.value = "";
  }

  function clearLongPress() {
    if (longPressTimerRef.current !== null) {
      window.clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  }

  function onCellPointerDown(index: number, event: PointerEvent<HTMLButtonElement>) {
    if (event.pointerType !== "touch" && event.pointerType !== "pen") {
      return;
    }

    clearLongPress();
    longPressTimerRef.current = window.setTimeout(() => {
      preventClickRef.current = index;
      toggleFlag(index);
    }, 320);
  }

  function onCellClick(index: number) {
    if (preventClickRef.current === index) {
      preventClickRef.current = null;
      return;
    }

    if (flagMode) {
      toggleFlag(index);
      return;
    }

    reveal(index);
  }

  const shellClass = cn(
    styles.shell,
    "relative overflow-hidden rounded-[2rem] border border-stone-200/70 p-5 shadow-[0_24px_90px_-45px_rgba(120,53,15,0.45)] dark:border-stone-700/70 dark:shadow-[0_24px_90px_-45px_rgba(217,119,6,0.28)]",
  );

  return (
    <div className={shellClass}>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_340px] xl:items-stretch">
        <div className="flex flex-col gap-6">
          <section className="rounded-[1.5rem] bg-white/80 p-5 shadow-sm ring-1 ring-stone-200/70 dark:bg-stone-900/70 dark:ring-stone-700/70">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-700 dark:text-amber-400">
              pairusuo games
            </p>
            <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h1 className="text-4xl font-black tracking-tight text-stone-900 dark:text-stone-100 sm:text-5xl">
                  Play Minesweeper Online
                </h1>
              </div>
              <Link
                href="/games"
                className="text-sm font-semibold text-amber-700 transition-colors hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-300"
              >
                Browse all games →
              </Link>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <TopMeta label="Difficulty" value={difficulty.label} />
              <TopMeta label="Bomb Theme" value={activeThemeLabel} />
              <TopMeta label="Safe Tiles Left" value={String(safeCellsRemaining)} />
              <TopMeta label="First Click" value="Protected" />
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <StatCard icon={Clock3} label="Time" value={formatTime(elapsedSeconds)} />
              <StatCard icon={Bomb} label="Mines Left" value={String(remainingBombs)} />
              <StatCard icon={Sparkles} label="Best" value={bestTime === null ? "--:--" : formatTime(bestTime)} />
            </div>
          </section>

          <section className="rounded-[1.5rem] bg-white/80 p-5 shadow-sm ring-1 ring-stone-200/70 dark:bg-stone-900/70 dark:ring-stone-700/70">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-700 dark:text-amber-400">
                  current board
                </p>
                <h2 className="mt-2 text-2xl font-black tracking-tight text-stone-900 dark:text-stone-100">
                  {statusTitle}
                </h2>
              </div>
              <div className="flex flex-wrap gap-2 text-xs font-medium text-stone-600 dark:text-stone-300">
                <StatusChip label={`Mode ${flagMode ? "Flag" : "Reveal"}`} />
                <StatusChip label={`${difficulty.columns} × ${difficulty.rows}`} />
                <StatusChip label={`${snapshot.flagsUsed} flags`} />
              </div>
            </div>

            <div className="mt-5 rounded-[1.75rem] border border-amber-100/80 bg-amber-50/70 p-3 shadow-inner dark:border-stone-700/70 dark:bg-stone-950/60 sm:p-4">
              <div className={styles.boardShell}>
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3 px-1 text-sm font-medium text-stone-700 dark:text-stone-200">
                  <span>{difficulty.label}</span>
                  <span>{remainingBombs} mines left</span>
                  <span>{formatTime(elapsedSeconds)}</span>
                </div>

                <div className={styles.boardScroller}>
                  <div
                    className={styles.board}
                    role="application"
                    aria-label="Minesweeper board"
                    style={{ gridTemplateColumns: `repeat(${difficulty.columns}, ${boardCellSize}px)` }}
                  >
                    {snapshot.cells.map((cell) => {
                      const bombVisual =
                        (cell.bombVisualId ? activeBombMap.get(cell.bombVisualId) : undefined) ??
                        activeBombs[cell.index % activeBombs.length];
                      const showBomb = cell.isRevealed && cell.isBomb;
                      const showNumber = cell.isRevealed && !cell.isBomb && cell.adjacentBombs > 0;
                      const wrongFlag = snapshot.status === "lost" && cell.isFlagged && !cell.isBomb;

                      return (
                        <button
                          key={cell.index}
                          type="button"
                          className={cn(
                            styles.cell,
                            cell.isRevealed ? styles.cellRevealed : styles.cellHidden,
                            cell.isFlagged && !cell.isRevealed ? styles.cellFlagged : "",
                            showBomb ? styles.cellBomb : "",
                            wrongFlag ? styles.cellWrongFlag : "",
                          )}
                          onClick={() => onCellClick(cell.index)}
                          onContextMenu={(event) => {
                            event.preventDefault();
                            toggleFlag(cell.index);
                          }}
                          onPointerCancel={clearLongPress}
                          onPointerDown={(event) => onCellPointerDown(cell.index, event)}
                          onPointerLeave={clearLongPress}
                          onPointerUp={clearLongPress}
                          aria-label={getCellAriaLabel(cell.isRevealed, cell.isFlagged, cell.isBomb, cell.adjacentBombs)}
                        >
                          {cell.isFlagged && !cell.isRevealed ? <Flag className="h-4 w-4 text-amber-900" /> : null}
                          {!cell.isFlagged && !cell.isRevealed ? <span className={styles.cellDot} /> : null}
                          {showNumber ? (
                            <span className="text-lg font-black" style={{ color: NUMBER_COLORS[cell.adjacentBombs - 1] }}>
                              {cell.adjacentBombs}
                            </span>
                          ) : null}
                          {showBomb ? (
                            bombVisual?.src ? (
                              <Image
                                alt=""
                                className={styles.bombImage}
                                height={boardCellSize}
                                src={bombVisual.src}
                                unoptimized
                                width={boardCellSize}
                              />
                            ) : bombVisual?.emoji ? (
                              <span className={styles.bombEmoji} aria-hidden="true">
                                {bombVisual.emoji}
                              </span>
                            ) : (
                              <Bomb className="h-5 w-5 text-rose-700" />
                            )
                          ) : null}
                          {wrongFlag ? (
                            <span className="absolute text-[10px] font-bold uppercase text-rose-700">miss</span>
                          ) : null}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {isHydrated && (snapshot.status === "won" || snapshot.status === "lost") ? (
                  <div className={cn(styles.overlay, "pointer-events-none absolute inset-x-4 top-4 z-10 flex justify-center sm:inset-x-6 sm:top-6")}>
                    <div className="pointer-events-auto w-full max-w-md rounded-[1.5rem] border border-stone-200/80 bg-white/95 p-5 text-center shadow-xl dark:border-stone-700/70 dark:bg-stone-900/92">
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-700 dark:text-amber-400">
                        {snapshot.status === "won" ? "Victory" : "Game over"}
                      </p>
                      <h3 className="mt-2 text-3xl font-black tracking-tight text-stone-900 dark:text-stone-100">
                        {snapshot.status === "won" ? "Safe tiles cleared" : "Bomb pack triggered"}
                      </h3>
                      <p className="mt-3 text-sm leading-6 text-stone-600 dark:text-stone-300">
                        {snapshot.status === "won" ? `Finished in ${formatTime(elapsedSeconds)}.` : "Try again."}
                      </p>
                      <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
                        <Button onClick={() => restart()}>
                          <RotateCcw className="mr-2 h-4 w-4" />
                          New Game
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </section>
        </div>

        <div className="flex flex-col gap-6 xl:h-full">
          <aside className="rounded-[1.5rem] bg-white/80 p-5 shadow-sm ring-1 ring-stone-200/70 dark:bg-stone-900/70 dark:ring-stone-700/70">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-stone-900 dark:text-stone-100">Run Setup</p>
              <Button variant="ghost" size="icon" onClick={() => restart()} title="Restart board">
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>

            <div className="mt-5">
              <div className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-stone-500 dark:text-stone-400">
                Difficulty
              </div>
              <div className="grid gap-2">
                {DIFFICULTY_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    className={cn(
                      "rounded-2xl border px-4 py-3 text-left transition-colors",
                      difficulty.id === preset.id
                        ? "border-amber-300 bg-amber-50 text-stone-900 shadow-sm dark:border-amber-500/50 dark:bg-stone-800 dark:text-stone-100"
                        : "border-stone-200 bg-stone-50/80 text-stone-700 hover:border-stone-300 hover:bg-white dark:border-stone-700 dark:bg-stone-800/80 dark:text-stone-200 dark:hover:border-stone-600 dark:hover:bg-stone-800",
                    )}
                    onClick={() => setDifficulty(preset.id)}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-semibold">{preset.label}</span>
                      <span className="text-xs font-medium text-stone-500 dark:text-stone-400">
                        {preset.columns}x{preset.rows} / {preset.mines}
                      </span>
                    </div>
                    <p className="mt-2 text-xs leading-5 text-stone-500 dark:text-stone-400">{preset.hint}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-5 rounded-2xl bg-stone-100/80 p-4 dark:bg-stone-800/70">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-stone-900 dark:text-stone-100">Tap Mode</p>
                <button
                  type="button"
                  className={cn(
                    "rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
                    flagMode
                      ? "bg-amber-500 text-stone-950"
                      : "bg-stone-200 text-stone-700 dark:bg-stone-700 dark:text-stone-200",
                  )}
                  onClick={toggleFlagMode}
                  aria-pressed={flagMode}
                >
                  {flagMode ? "Flag" : "Reveal"}
                </button>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2">
                <ModeCard active={!flagMode} icon={Eye} label="Reveal" onClick={() => flagMode && toggleFlagMode()} />
                <ModeCard active={flagMode} icon={Flag} label="Flag" onClick={() => !flagMode && toggleFlagMode()} />
              </div>
            </div>
          </aside>

          <aside className="rounded-[1.5rem] bg-white/80 p-5 shadow-sm ring-1 ring-stone-200/70 dark:bg-stone-900/70 dark:ring-stone-700/70 xl:flex xl:flex-1 xl:flex-col">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-700 dark:text-amber-400" />
              <p className="text-sm font-semibold text-stone-900 dark:text-stone-100">Bomb Theme</p>
            </div>

            <div className="xl:flex xl:flex-1 xl:flex-col">
              <div className={styles.themeHero}>
                <div className={styles.themeHeroHeader}>
                  <div>
                    <div className={styles.themeHeroEyebrow}>Active Theme</div>
                    <div className={styles.themeHeroName}>{activeThemeLabel}</div>
                  </div>
                  <span className={styles.themeHeroBadge}>{themeBadgeLabel}</span>
                </div>

                {themeShowcaseVisuals.length > 1 ? (
                  <div className={styles.themeHeroGrid}>
                    {themeShowcaseVisuals.map((item) => (
                      <div key={item.id} className={styles.themeHeroGridItem}>
                        {item.src ? (
                          <Image
                            alt={item.name}
                            className={styles.themeHeroImage}
                            height={84}
                            src={item.src}
                            unoptimized
                            width={84}
                          />
                        ) : (
                          <span className={styles.themeHeroEmoji} aria-hidden="true">
                            {item.emoji ?? "💣"}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className={styles.themeHeroSingle}>
                    {themeShowcaseVisuals[0]?.src ? (
                      <Image
                        alt={themeShowcaseVisuals[0].name}
                        className={styles.themeHeroImage}
                        height={140}
                        src={themeShowcaseVisuals[0].src}
                        unoptimized
                        width={140}
                      />
                    ) : (
                      <span className={styles.themeHeroEmojiLarge} aria-hidden="true">
                        {themeShowcaseVisuals[0]?.emoji ?? "💣"}
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2">
                <ThemeButton active={theme === "default"} label="Default Bomb" onClick={() => setBombTheme("default")} />
                <ThemeButton
                  active={theme === "custom" && canUseCustomTheme}
                  disabled={!canUseCustomTheme}
                  label="Custom Uploads"
                  onClick={() => setBombTheme("custom")}
                />
              </div>

              <div className="mt-4 rounded-2xl bg-stone-100/80 p-4 dark:bg-stone-800/70 xl:mt-auto">
                <input
                  ref={fileInputRef}
                  hidden
                  accept="image/*"
                  multiple
                  type="file"
                  onChange={onFilesSelected}
                />
                <div className="grid grid-cols-2 gap-2">
                  <Button className="w-full" onClick={openFilePicker} type="button">
                    <ImagePlus className="mr-2 h-4 w-4" />
                    {isUploading ? "Processing..." : "Upload image"}
                  </Button>
                  <Button
                    className="w-full"
                    disabled={customBombs.length === 0}
                    onClick={clearCustomBombs}
                    type="button"
                    variant="outline"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Clear
                  </Button>
                </div>
                {uploadError ? <p className="mt-3 text-xs font-medium text-rose-600 dark:text-rose-400">{uploadError}</p> : null}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Clock3;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[1.25rem] border border-stone-200/80 bg-stone-50/80 px-4 py-4 dark:border-stone-700 dark:bg-stone-800/70">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-stone-500 dark:text-stone-400">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <div className="mt-3 text-2xl font-black tabular-nums text-stone-900 dark:text-stone-100">{value}</div>
    </div>
  );
}

function TopMeta({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-full border border-stone-200 bg-stone-50 px-4 py-2 text-sm dark:border-stone-700 dark:bg-stone-800/70">
      <span className="font-semibold text-stone-900 dark:text-stone-100">{label}:</span>{" "}
      <span className="text-stone-600 dark:text-stone-300">{value}</span>
    </div>
  );
}

function StatusChip({ label }: { label: string }) {
  return <span className="rounded-full bg-stone-100 px-3 py-1 dark:bg-stone-800/80">{label}</span>;
}

function ModeCard({
  active,
  icon: Icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: typeof Eye;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={cn(
        "flex items-center justify-center gap-2 rounded-2xl border px-3 py-3 text-sm font-semibold transition-colors",
        active
          ? "border-amber-300 bg-amber-100 text-stone-900 dark:border-amber-500/50 dark:bg-stone-900 dark:text-amber-200"
          : "border-stone-200 bg-white text-stone-600 hover:border-stone-300 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-300 dark:hover:border-stone-600",
      )}
      onClick={onClick}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}

function ThemeButton({
  active,
  disabled,
  label,
  onClick,
}: {
  active: boolean;
  disabled?: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={cn(
        "rounded-2xl border px-3 py-3 text-sm font-semibold transition-colors",
        active
          ? "border-amber-300 bg-amber-100 text-stone-900 dark:border-amber-500/50 dark:bg-stone-900 dark:text-amber-200"
          : "border-stone-200 bg-white text-stone-600 hover:border-stone-300 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-300 dark:hover:border-stone-600",
        disabled ? "cursor-not-allowed opacity-50" : "",
      )}
      disabled={disabled}
      onClick={onClick}
    >
      {label}
    </button>
  );
}

function formatTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function getCellAriaLabel(isRevealed: boolean, isFlagged: boolean, isBomb: boolean, adjacentBombs: number) {
  if (isFlagged) {
    return "Flagged tile";
  }
  if (!isRevealed) {
    return "Hidden tile";
  }
  if (isBomb) {
    return "Bomb tile";
  }
  if (adjacentBombs === 0) {
    return "Empty revealed tile";
  }
  return `Revealed tile with ${adjacentBombs} nearby bombs`;
}
