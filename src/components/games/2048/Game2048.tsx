"use client";

import type { KeyboardEvent, TouchEvent } from "react";
import { useMemo, useRef } from "react";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, BrainCircuit, RotateCcw, Volume2, VolumeX } from "lucide-react";
import { GameWinCelebration } from "@/components/games/shared/GameWinCelebration";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useGame2048 } from "@/lib/games/2048/use-game-2048";
import type { Direction, GameMode, StrategyKey } from "@/lib/games/2048/types";
import styles from "./Game2048.module.css";

const STRATEGY_OPTIONS: Array<{ key: StrategyKey; label: string; hint: string }> = [
  { key: "ud", label: "UD", hint: "Up → Down" },
  { key: "lr", label: "LR", hint: "Left → Right" },
  { key: "udlr", label: "UDLR", hint: "Up → Down → Left → Right" },
  { key: "lrud", label: "LRUD", hint: "Left → Right → Up → Down" },
  { key: "cw", label: "CW", hint: "Clockwise" },
  { key: "ccw", label: "CCW", hint: "Counterclockwise" },
];

const MOVE_BUTTONS: Array<{ direction: Direction; label: string; icon: typeof ArrowUp }> = [
  { direction: 0, label: "Up", icon: ArrowUp },
  { direction: 3, label: "Left", icon: ArrowLeft },
  { direction: 2, label: "Down", icon: ArrowDown },
  { direction: 1, label: "Right", icon: ArrowRight },
];

export function Game2048() {
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const {
    activeSequenceLabels,
    autoPlayDelayMs,
    bestScore,
    board,
    canKeepPlaying,
    changeMode,
    changeSize,
    customPattern,
    elapsedSeconds,
    isAutoPlaying,
    isHydrated,
    isTerminated,
    keepPlaying,
    mode,
    move,
    over,
    parsedCustomCount,
    restart,
    score,
    setAutoPlayDelayMs,
    setCustomPattern,
    setSoundEnabled,
    setStrategyKey,
    size,
    soundEnabled,
    steps,
    strategyKey,
    target,
    toggleAutoPlay,
    winSteps,
    won,
  } = useGame2048();

  const boardStyle = useMemo(
    () => ({
      gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))`,
    }),
    [size],
  );

  function playMoveSound() {
    if (typeof window === "undefined") {
      return;
    }

    const AudioContextCtor =
      window.AudioContext ??
      (window as Window & typeof globalThis & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextCtor) {
      return;
    }

    const context = audioContextRef.current ?? new AudioContextCtor();
    audioContextRef.current = context;

    if (context.state === "suspended") {
      void context.resume();
    }

    const now = context.currentTime;
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();
    const filter = context.createBiquadFilter();

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(880, now);
    oscillator.frequency.exponentialRampToValueAtTime(740, now + 0.06);

    filter.type = "lowpass";
    filter.frequency.setValueAtTime(1500, now);
    filter.Q.value = 0.8;

    gainNode.gain.setValueAtTime(0.0001, now);
    gainNode.gain.exponentialRampToValueAtTime(0.075, now + 0.008);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.075);

    oscillator.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(context.destination);
    oscillator.start(now);
    oscillator.stop(now + 0.075);
  }

  function moveWithFeedback(direction: Direction) {
    const moved = move(direction, "manual");
    if (moved && soundEnabled && !isAutoPlaying) {
      playMoveSound();
    }
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const mapping: Record<string, Direction | undefined> = {
      ArrowUp: 0,
      ArrowRight: 1,
      ArrowDown: 2,
      ArrowLeft: 3,
    };

    const direction = mapping[event.key];
    if (direction === undefined) {
      return;
    }

    event.preventDefault();
    moveWithFeedback(direction);
  }

  function onTouchStart(event: TouchEvent<HTMLDivElement>) {
    const touch = event.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  }

  function onTouchEnd(event: TouchEvent<HTMLDivElement>) {
    const start = touchStartRef.current;
    const touch = event.changedTouches[0];
    if (!start || !touch) {
      return;
    }

    const diffX = touch.clientX - start.x;
    const diffY = touch.clientY - start.y;
    const threshold = 24;

    if (Math.abs(diffX) < threshold && Math.abs(diffY) < threshold) {
      return;
    }

    if (Math.abs(diffX) > Math.abs(diffY)) {
      moveWithFeedback(diffX > 0 ? 1 : 3);
    } else {
      moveWithFeedback(diffY > 0 ? 2 : 0);
    }
  }

  const shellClass = cn(
    styles.shell,
    "relative overflow-hidden rounded-[2rem] border border-stone-200/70 p-5 font-sans shadow-[0_24px_80px_-40px_rgba(120,53,15,0.45)] dark:border-stone-700/70 dark:shadow-[0_24px_80px_-40px_rgba(245,158,11,0.32)]",
  );

  return (
    <div className={shellClass}>
      <GameWinCelebration active={isHydrated && won} />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.9fr)]">
        <div className="grid h-full gap-5 rounded-[1.5rem] bg-white/80 p-5 shadow-sm ring-1 ring-stone-200/70 dark:bg-stone-900/70 dark:ring-stone-700/70 lg:grid-cols-[minmax(0,1fr)_180px] lg:items-start">
          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-700 dark:text-amber-400">
              pairusuo games
            </p>
            <h1 className="text-5xl font-black tracking-tight text-stone-900 dark:text-stone-100 sm:text-6xl">
              Play 2048 Online
            </h1>
            <p className="max-w-2xl text-base leading-8 text-stone-600 dark:text-stone-300">
              Play 2048 online in your browser with board sizes from 4x4 to 9x9, standard or balanced goals, touch
              controls, keyboard support, and built-in auto-play strategies.
            </p>

            <div className="flex flex-wrap gap-3">
              <TopMeta label="Goal" value={formatTileValue(target)} />
              <TopMeta label="Mode" value={mode === "balanced" ? "Balanced" : "Standard"} />
              <TopMeta label="Board" value={`${size} × ${size}`} />
              <TopMeta label="Steps" value={String(steps)} />
            </div>
          </div>

          <div className="grid w-full grid-cols-1 gap-2 self-stretch text-center lg:w-[180px]">
            <StatCard label="Score" value={score} />
            <StatCard label="Best" value={bestScore} />
            <StatCard label="Time" value={`${elapsedSeconds}s`} />
          </div>
        </div>

        <div className="h-full rounded-[1.5rem] bg-white/80 p-4 shadow-sm ring-1 ring-stone-200/70 dark:bg-stone-900/70 dark:ring-stone-700/70">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-stone-900 dark:text-stone-100">Game Setup</p>
              <p className="mt-1 text-xs leading-5 text-stone-500 dark:text-stone-400">
                Changing board size or mode starts a fresh run.
              </p>
            </div>
            <Button variant="ghost" size="icon" onClick={() => restart()} title="Restart">
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>

          <div className="mt-4 grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_88px] items-end gap-2 sm:gap-3">
            <SelectCard
              label="Board Size"
              value={String(size)}
              onChange={(value) => changeSize(Number.parseInt(value, 10))}
              options={[4, 5, 6, 7, 8, 9].map((item) => ({ label: `${item} × ${item}`, value: String(item) }))}
            />
            <SelectCard
              label="Mode"
              value={mode}
              onChange={(value) => changeMode(value as GameMode)}
              options={[
                { label: "Balanced", value: "balanced" },
                { label: "Standard", value: "standard" },
              ]}
            />
            <div className="block">
              <span className="mb-2 block text-xs font-medium text-stone-700 dark:text-stone-200 sm:text-sm">Sound</span>
              <button
                type="button"
                className={cn(
                  "flex h-11 w-full items-center justify-center rounded-xl border px-1 transition-colors sm:px-2",
                  soundEnabled
                    ? "border-stone-300 bg-white text-stone-900 hover:border-stone-400 dark:border-stone-600 dark:bg-stone-900 dark:text-stone-100 dark:hover:border-stone-500"
                    : "border-stone-200 bg-stone-100 text-stone-500 hover:border-stone-300 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300 dark:hover:border-stone-600",
                )}
                onClick={() => setSoundEnabled(!soundEnabled)}
                aria-label={soundEnabled ? "Disable move sound" : "Enable move sound"}
                aria-pressed={soundEnabled}
                title={soundEnabled ? "Sound On" : "Sound Off"}
              >
                <span
                  className={cn(
                    "relative inline-flex h-7 w-11 items-center rounded-full transition-colors sm:w-12",
                    soundEnabled ? "bg-stone-900 dark:bg-stone-100" : "bg-stone-300 dark:bg-stone-700",
                  )}
                >
                  <span
                    className={cn(
                      "absolute left-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-sm transition-transform dark:bg-stone-900",
                      soundEnabled ? "translate-x-5 text-stone-900 dark:text-stone-100" : "translate-x-0 text-stone-500 dark:text-stone-300",
                    )}
                  >
                    {soundEnabled ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
                  </span>
                </span>
              </button>
            </div>
          </div>

          <div className="mt-8 rounded-2xl bg-stone-100/80 p-4 dark:bg-stone-800/70">
            <div className="flex items-center justify-between text-sm font-medium text-stone-700 dark:text-stone-200">
              <span>Goal</span>
              <span>{formatTileValue(target)}</span>
            </div>
            <p className="mt-2 text-xs leading-5 text-stone-500 dark:text-stone-400">
              Balanced scales the goal more aggressively as the board grows, so larger grids still feel challenging.
            </p>
          </div>

        </div>

        <div className="space-y-5">
          <div
            className="relative rounded-[1.75rem] bg-[#bbada0] p-3 sm:p-4"
            onKeyDown={onKeyDown}
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
            role="application"
            aria-label="2048 game board"
            tabIndex={0}
          >
            <div className="mb-3 flex items-center justify-between gap-3 px-1 text-sm font-medium text-stone-50/90">
              <span>Target {formatTileValue(target)}</span>
              <span>Steps {steps}</span>
              <span>{mode === "balanced" ? "Balanced" : "Standard"}</span>
            </div>

            <div className={styles.board} style={boardStyle}>
              {board.flatMap((row, rowIndex) =>
                row.map((value, columnIndex) => (
                  <div key={`${rowIndex}-${columnIndex}`} className={styles.cell}>
                    {value > 0 ? (
                      <div
                        className={styles.tile}
                        style={getTileStyle(value)}
                        aria-label={`Tile ${value}`}
                      >
                        <span style={{ fontSize: getTileFontSize(size, value) }}>{formatTileValue(value)}</span>
                      </div>
                    ) : null}
                  </div>
                )),
              )}
            </div>

            {isHydrated && isTerminated ? (
              <div className={cn(styles.overlay, "absolute inset-0 flex items-center justify-center rounded-[1.75rem] p-6")}>
                <div className="w-full max-w-sm rounded-[1.5rem] border border-stone-200/70 bg-white/90 p-6 text-center shadow-xl dark:border-stone-700/70 dark:bg-stone-900/90">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700 dark:text-amber-400">
                    {won ? "Victory" : "Game Over"}
                  </p>
                  <h2 className="mt-2 text-3xl font-black text-stone-900 dark:text-stone-100">
                    {won ? `Reached ${formatTileValue(target)}` : "No more moves"}
                  </h2>
                  <p className="mt-3 text-sm leading-6 text-stone-600 dark:text-stone-300">
                    {won && winSteps !== null ? `Target reached in ${winSteps} moves.` : "This run is over. Start a new game whenever you want."}
                  </p>
                  <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
                    {canKeepPlaying ? (
                      <Button variant="outline" onClick={keepPlaying}>
                        Keep Going
                      </Button>
                    ) : null}
                    <Button onClick={() => restart()}>
                      <RotateCcw className="mr-2 h-4 w-4" />
                      New Game
                    </Button>
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          <div className="grid grid-cols-4 gap-2 sm:gap-3">
            {MOVE_BUTTONS.map(({ direction, icon: Icon, label }) => (
              <Button
                key={label}
                variant="outline"
                className="h-14 min-w-0 flex-col gap-1 rounded-xl border-[#d8d4d0] bg-[#f7f3ed] px-1 text-[11px] font-semibold text-[#776e65] hover:border-[#bbada0] hover:bg-[#eee4da] hover:text-[#5f574f] dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200 dark:hover:bg-stone-700 sm:h-12 sm:flex-row sm:gap-2 sm:px-3 sm:text-sm"
                onClick={() => moveWithFeedback(direction)}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {label}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex h-full flex-col rounded-[1.5rem] bg-white/80 p-4 shadow-sm ring-1 ring-stone-200/70 dark:bg-stone-900/70 dark:ring-stone-700/70">
          <div className="flex items-center gap-2">
            <BrainCircuit className="h-4 w-4 text-amber-700 dark:text-amber-400" />
            <p className="text-sm font-semibold text-stone-900 dark:text-stone-100">Auto Play</p>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {STRATEGY_OPTIONS.map((option) => (
              <button
                key={option.key}
                type="button"
                className={cn(
                  "rounded-full border px-3 py-2 text-xs font-semibold transition-colors",
                  strategyKey === option.key && parsedCustomCount === 0
                    ? "border-[#8f7a66] bg-[#8f7a66] text-[#f9f6f2] shadow-sm dark:border-[#edc22e] dark:bg-[#edc22e] dark:text-[#2f2a25]"
                    : "border-[#d8d4d0] bg-[#f7f3ed] text-[#776e65] hover:border-[#bbada0] hover:bg-[#eee4da] dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200 dark:hover:bg-stone-700",
                )}
                onClick={() => setStrategyKey(option.key)}
                title={option.hint}
              >
                {option.label}
              </button>
            ))}
          </div>

          <label className="mt-4 block text-sm font-medium text-stone-700 dark:text-stone-200" htmlFor="strategy-pattern">
            Custom Pattern
          </label>
          <input
            id="strategy-pattern"
            className="mt-2 w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm outline-none ring-0 placeholder:text-stone-400 focus:border-stone-400 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-100"
            placeholder="U2,D2,L2,R2"
            value={customPattern}
            onChange={(event) => setCustomPattern(event.target.value)}
          />
          <p className="mt-2 text-xs leading-5 text-stone-500 dark:text-stone-400">
            Supports patterns like `U R D L` or `U2,D2,L2,R2`. A valid custom sequence overrides the preset buttons.
          </p>

          <div className="mt-4">
            <div className="mb-2 flex items-center justify-between text-sm font-medium text-stone-700 dark:text-stone-200">
              <span>Speed</span>
              <span>{autoPlayDelayMs}ms</span>
            </div>
            <input
              type="range"
              min={100}
              max={2000}
              step={50}
              value={autoPlayDelayMs}
              onChange={(event) => setAutoPlayDelayMs(Number.parseInt(event.target.value, 10))}
              className="w-full accent-stone-900 dark:accent-stone-100"
            />
          </div>

          <div className="mt-4 rounded-2xl bg-stone-100/80 p-4 dark:bg-stone-800/70">
            <div className="flex items-center justify-between text-sm font-medium text-stone-700 dark:text-stone-200">
              <span>Current Sequence</span>
              <span>{parsedCustomCount > 0 ? `Custom × ${parsedCustomCount}` : strategyKey.toUpperCase()}</span>
            </div>
            <p className="mt-2 text-xs leading-5 text-stone-500 dark:text-stone-400">{activeSequenceLabels || "No valid moves parsed yet."}</p>
          </div>

          <div className="mt-4 flex gap-3">
            <Button
              className="flex-1 bg-[#8f7a66] text-[#f9f6f2] hover:bg-[#7f6b58] dark:bg-[#edc22e] dark:text-[#2f2a25] dark:hover:bg-[#ddb01f]"
              onClick={() => toggleAutoPlay(true)}
              disabled={isAutoPlaying || parsedCustomCount === 0 && !strategyKey}
            >
              Start
            </Button>
            <Button
              variant="outline"
              className="flex-1 border-[#d8d4d0] bg-[#f7f3ed] text-[#776e65] hover:border-[#bbada0] hover:bg-[#eee4da] hover:text-[#5f574f] dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200 dark:hover:bg-stone-700"
              onClick={() => toggleAutoPlay(false)}
              disabled={!isAutoPlaying}
            >
              Stop
            </Button>
          </div>

          <div className="mt-6 rounded-2xl bg-stone-100/80 p-4 text-sm leading-6 text-stone-600 dark:bg-stone-800/70 dark:text-stone-300">
            <p>
              <span className="font-semibold text-stone-800 dark:text-stone-100">How to play:</span> Use your arrow keys
              or swipe gestures to move the tiles. When two tiles with the same number touch, they merge into one.
            </p>
            <p className="mt-3">
              <span className="font-semibold text-stone-800 dark:text-stone-100">Tip:</span> You can also use the
              strategy controls above to auto-play. Presets include <span className="font-semibold">UD</span>,{" "}
              <span className="font-semibold">LR</span>, <span className="font-semibold">UDLR</span>,{" "}
              <span className="font-semibold">LRUD</span>, <span className="font-semibold">CW</span>, and{" "}
              <span className="font-semibold">CCW</span>. Choose <span className="font-semibold">Custom</span> to enter
              sequences like <span className="font-mono text-[0.92em]">U2,D2,L2,R2</span>, adjust the speed, then start
              or stop at any time.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
        <section className="rounded-[1.5rem] bg-white/80 p-5 shadow-sm ring-1 ring-stone-200/70 dark:bg-stone-900/70 dark:ring-stone-700/70">
          <h2 className="text-2xl font-black tracking-tight text-stone-900 dark:text-stone-100">
            Free 2048 Game in Your Browser
          </h2>
          <p className="mt-3 text-sm leading-7 text-stone-600 dark:text-stone-300 sm:text-base">
            This 2048 game keeps the classic number-merging rules and adds more ways to play. You can start a quick
            standard 4x4 run, switch to larger boards for longer sessions, or use balanced mode to keep the target
            challenging as the grid grows. Everything runs directly in the browser, so you can play 2048 online on
            desktop or mobile without installing anything.
          </p>
          <p className="mt-3 text-sm leading-7 text-stone-600 dark:text-stone-300 sm:text-base">
            If you are comparing 2048 websites, the main difference here is flexibility. This page supports swipe and
            keyboard input, remembers your progress locally, and includes auto-play patterns so you can experiment with
            different 2048 strategies instead of only playing the default version.
          </p>
        </section>

        <section className="rounded-[1.5rem] bg-white/80 p-5 shadow-sm ring-1 ring-stone-200/70 dark:bg-stone-900/70 dark:ring-stone-700/70">
          <h2 className="text-2xl font-black tracking-tight text-stone-900 dark:text-stone-100">How to Play 2048</h2>
          <div className="mt-4 space-y-3 text-sm leading-7 text-stone-600 dark:text-stone-300 sm:text-base">
            <p>Use the arrow keys or swipe gestures to move every tile on the board in one direction.</p>
            <p>When two tiles with the same value touch, they merge into a larger tile.</p>
            <p>Keep combining numbers until you reach the target tile, such as 2048 on a standard 4x4 board.</p>
            <p>The game ends when the board is full and there are no valid moves left.</p>
          </div>
        </section>

        <section className="rounded-[1.5rem] bg-white/80 p-5 shadow-sm ring-1 ring-stone-200/70 dark:bg-stone-900/70 dark:ring-stone-700/70">
          <h2 className="text-2xl font-black tracking-tight text-stone-900 dark:text-stone-100">2048 Strategy Tips</h2>
          <div className="mt-4 space-y-3 text-sm leading-7 text-stone-600 dark:text-stone-300 sm:text-base">
            <p>Keep your highest-value tile in one corner so the rest of the board can feed into it.</p>
            <p>Avoid moving in all four directions randomly, because that breaks stable tile chains.</p>
            <p>Leave open spaces whenever possible so you can recover from bad spawns.</p>
            <p>On larger boards, plan ahead for long merge paths instead of chasing quick points.</p>
            <p>Use the built-in auto-play patterns to test ideas and learn which sequences stay stable the longest.</p>
          </div>
        </section>

        <section className="rounded-[1.5rem] bg-white/80 p-5 shadow-sm ring-1 ring-stone-200/70 dark:bg-stone-900/70 dark:ring-stone-700/70">
          <h2 className="text-2xl font-black tracking-tight text-stone-900 dark:text-stone-100">2048 FAQ</h2>
          <div className="mt-4 space-y-4 text-sm leading-7 text-stone-600 dark:text-stone-300 sm:text-base">
            <div>
              <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">What is 2048?</h3>
              <p className="mt-1">
                2048 is a puzzle game where you slide numbered tiles and merge matching values to create larger numbers.
              </p>
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">Can I play 2048 on mobile?</h3>
              <p className="mt-1">
                Yes. This page supports touch gestures, so you can play 2048 online on phones and tablets.
              </p>
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">What is balanced mode?</h3>
              <p className="mt-1">
                Balanced mode raises the target more aggressively on larger boards, which keeps bigger grids from
                feeling too easy.
              </p>
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">What board sizes are available?</h3>
              <p className="mt-1">You can play this 2048 game on board sizes from 4x4 up to 9x9.</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function SelectCard({
  label,
  onChange,
  options,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  options: Array<{ label: string; value: string }>;
  value: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-medium text-stone-700 dark:text-stone-200 sm:text-sm">{label}</span>
      <select
        className="h-11 w-full appearance-none rounded-xl border border-stone-200 bg-white px-2 text-xs outline-none focus:border-stone-400 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-100 sm:px-3 sm:text-sm"
        onChange={(event) => onChange(event.target.value)}
        value={value}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-[#a39486] bg-[#bbada0] px-3 py-3 text-[#f9f6f2] shadow-sm dark:border-[#8c7b6c] dark:bg-[#a08f80] dark:text-[#fffaf4]">
      <div className="text-left text-[10px] font-semibold uppercase tracking-[0.22em] text-[#eee4da] dark:text-[#f2e9df]">{label}</div>
      <div className="mt-1 overflow-hidden text-ellipsis whitespace-nowrap text-right text-lg font-black tabular-nums sm:text-xl">
        {formatStatValue(value)}
      </div>
    </div>
  );
}

function TopMeta({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 dark:border-stone-700 dark:bg-stone-800/70">
      <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-stone-500 dark:text-stone-400">{label}</div>
      <div className="mt-1 text-sm font-bold text-stone-900 dark:text-stone-100">{value}</div>
    </div>
  );
}

function formatStatValue(value: string | number): string {
  if (typeof value === "string") {
    return value;
  }

  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(value >= 10_000_000 ? 0 : 1)}M`;
  }

  if (value >= 10_000) {
    return `${(value / 1_000).toFixed(value >= 100_000 ? 0 : 1)}K`;
  }

  return String(value);
}

function formatTileValue(value: number): string {
  if (value >= 1024 * 1024) {
    return `${Math.round(value / (1024 * 1024))}M`;
  }
  if (value >= 4096) {
    return `${Math.round(value / 1024)}K`;
  }
  return String(value);
}

function getTileFontSize(size: number, value: number): string {
  const digits = formatTileValue(value).length;
  const base = size >= 7 ? 0.98 : size >= 6 ? 1.14 : 1.32;
  const reduced = base - Math.max(0, digits - 2) * 0.15;
  return `${Math.max(0.65, reduced)}rem`;
}

function getTileStyle(value: number) {
  const mapping: Record<number, { background: string; color: string }> = {
    2: { background: "#eee4da", color: "#776e65" },
    4: { background: "#ede0c8", color: "#776e65" },
    8: { background: "#f2b179", color: "#f9f6f2" },
    16: { background: "#f59563", color: "#f9f6f2" },
    32: { background: "#f67c5f", color: "#f9f6f2" },
    64: { background: "#f65e3b", color: "#f9f6f2" },
    128: { background: "#edcf72", color: "#f9f6f2" },
    256: { background: "#edcc61", color: "#f9f6f2" },
    512: { background: "#edc850", color: "#f9f6f2" },
    1024: { background: "#edc53f", color: "#f9f6f2" },
    2048: { background: "#edc22e", color: "#f9f6f2" },
  };

  return mapping[value] ?? {
    background: "linear-gradient(135deg, #111827, #44403c)",
    color: "#f9f6f2",
  };
}
