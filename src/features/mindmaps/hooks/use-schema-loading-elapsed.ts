"use client";

import { useEffect, useState } from "react";

/** Compteur de secondes pendant une génération (sans messages rotatifs). */
export function useSchemaLoadingElapsed(loading: boolean): number {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    if (!loading) {
      setElapsedSeconds(0);
      return;
    }

    const startedAt = Date.now();
    const timer = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startedAt) / 1000));
    }, 1000);

    return () => clearInterval(timer);
  }, [loading]);

  return elapsedSeconds;
}
