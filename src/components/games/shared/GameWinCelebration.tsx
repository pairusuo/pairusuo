"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import styles from "./GameWinCelebration.module.css";

type GameWinCelebrationProps = {
  active: boolean;
  className?: string;
  durationMs?: number;
};

const COLORS = ["#f7d046", "#ff7aa2", "#7dd3fc", "#a7f3d0", "#fde68a", "#c4b5fd", "#fca5a5", "#86efac"];
const WAVE_DELAYS = [0, 650, 1300, 1950, 2600, 3250];

function randomBetween(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function confettiBurst(container: HTMLDivElement, x: number, y: number, count = 18, spread = 1) {
  for (let index = 0; index < count; index += 1) {
    const piece = document.createElement("span");
    piece.className = styles.piece;

    const angle = Math.PI * 2 * (index / count) + Math.random() * 0.35;
    const dist = (72 + Math.random() * 116) * spread;
    const dx = Math.cos(angle) * dist;
    const dy = Math.sin(angle) * dist - 14;
    const rotation = Math.random() * 600 - 300;
    const duration = 900 + Math.floor(Math.random() * 500);

    piece.style.left = `${x}px`;
    piece.style.top = `${y}px`;
    piece.style.setProperty("--dx", `${dx}px`);
    piece.style.setProperty("--dy", `${dy}px`);
    piece.style.setProperty("--rot", `${rotation}deg`);
    piece.style.setProperty("--dur", `${duration}ms`);
    piece.style.setProperty("--color", COLORS[Math.floor(Math.random() * COLORS.length)]);
    container.appendChild(piece);

    window.setTimeout(() => {
      piece.remove();
    }, duration + 40);
  }
}

export function GameWinCelebration({ active, className, durationMs = 5000 }: GameWinCelebrationProps) {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const previousActiveRef = useRef(false);
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !("matchMedia" in window)) {
      return;
    }

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncPreference = () => setPrefersReducedMotion(mediaQuery.matches);
    syncPreference();

    if ("addEventListener" in mediaQuery) {
      mediaQuery.addEventListener("change", syncPreference);
      return () => mediaQuery.removeEventListener("change", syncPreference);
    }

    const legacyMediaQuery = mediaQuery as MediaQueryList & {
      addListener?: (listener: (event: MediaQueryListEvent) => void) => void;
      removeListener?: (listener: (event: MediaQueryListEvent) => void) => void;
    };
    legacyMediaQuery.addListener?.(syncPreference);
    return () => legacyMediaQuery.removeListener?.(syncPreference);
  }, []);

  useEffect(() => {
    const wasActive = previousActiveRef.current;
    previousActiveRef.current = active;

    if (!active || prefersReducedMotion || wasActive || typeof document === "undefined" || typeof window === "undefined") {
      return;
    }

    cleanupRef.current?.();

    const layer = document.createElement("div");
    layer.className = cn(styles.layer, className);
    document.body.appendChild(layer);

    const timers: number[] = [];
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const sideInset = Math.max(84, Math.min(132, viewportWidth * 0.1));
    const topInset = Math.max(112, Math.min(160, viewportHeight * 0.18));
    const centerY = Math.max(220, Math.min(viewportHeight * 0.42, viewportHeight - 180));

    WAVE_DELAYS.forEach((delay) => {
      timers.push(
        window.setTimeout(() => {
          confettiBurst(
            layer,
            viewportWidth * 0.5 + randomBetween(-56, 56),
            topInset + randomBetween(-18, 18),
            24,
            1.45,
          );
          confettiBurst(
            layer,
            sideInset + randomBetween(-18, 18),
            centerY + randomBetween(-46, 46),
            20,
            1.25,
          );
          confettiBurst(
            layer,
            viewportWidth - sideInset + randomBetween(-18, 18),
            centerY + randomBetween(-46, 46),
            20,
            1.25,
          );
        }, delay),
      );
    });

    timers.push(
      window.setTimeout(() => {
        layer.remove();
      }, durationMs),
    );

    cleanupRef.current = () => {
      timers.forEach((timer) => window.clearTimeout(timer));
      layer.remove();
      cleanupRef.current = null;
    };

    return () => {
      cleanupRef.current?.();
    };
  }, [active, className, durationMs, prefersReducedMotion]);

  useEffect(() => {
    return () => {
      cleanupRef.current?.();
    };
  }, []);

  return null;
}
