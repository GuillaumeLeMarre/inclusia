"use client";

import { useCallback, useEffect, useState } from "react";
import {
  isReadingMode,
  READING_MODE_STORAGE_KEY,
  type ReadingMode,
} from "@/types/reading-mode";

const DEFAULT_MODE: ReadingMode = "standard";

function readStoredMode(): ReadingMode {
  if (typeof window === "undefined") return DEFAULT_MODE;
  const stored = localStorage.getItem(READING_MODE_STORAGE_KEY);
  return stored && isReadingMode(stored) ? stored : DEFAULT_MODE;
}

export function useReadingMode() {
  const [mode, setModeState] = useState<ReadingMode>(DEFAULT_MODE);

  useEffect(() => {
    setModeState(readStoredMode());
  }, []);

  const setMode = useCallback((next: ReadingMode) => {
    setModeState(next);
    localStorage.setItem(READING_MODE_STORAGE_KEY, next);
    window.dispatchEvent(new CustomEvent("inclusia:reading-mode", { detail: next }));
  }, []);

  useEffect(() => {
    const handler = (event: Event) => {
      const detail = (event as CustomEvent<ReadingMode>).detail;
      if (detail && isReadingMode(detail)) {
        setModeState(detail);
      }
    };
    window.addEventListener("inclusia:reading-mode", handler);
    return () => window.removeEventListener("inclusia:reading-mode", handler);
  }, []);

  return { mode, setMode };
}
