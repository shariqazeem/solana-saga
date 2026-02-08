"use client";

import { useCallback } from "react";

function vibrate(pattern: number | number[]) {
  if (typeof navigator !== "undefined" && navigator.vibrate) {
    navigator.vibrate(pattern);
  }
}

export function useHaptics() {
  const vibrateSwipeYes = useCallback(() => vibrate(50), []);
  const vibrateSwipeNo = useCallback(() => vibrate([30, 20, 30]), []);
  const vibrateSkip = useCallback(() => vibrate(20), []);
  const vibrateBetConfirmed = useCallback(() => vibrate([50, 30, 80]), []);
  const vibrateStreakMilestone = useCallback(() => vibrate([100, 50, 100, 50, 200]), []);
  const vibrateError = useCallback(() => vibrate([100, 50, 100]), []);

  return {
    vibrateSwipeYes,
    vibrateSwipeNo,
    vibrateSkip,
    vibrateBetConfirmed,
    vibrateStreakMilestone,
    vibrateError,
  };
}
