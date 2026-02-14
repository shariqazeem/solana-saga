"use client";

import { useState, useCallback, useEffect } from "react";
import {
  getMissions,
  updateMissionProgress,
  setMissionProgress,
  type Mission,
} from "@/lib/missions";

interface UseMissionsReturn {
  missions: Mission[];
  completedCount: number;
  allComplete: boolean;
  updateProgress: (
    missionId: string,
    increment?: number
  ) => { justCompleted: boolean; xpEarned: number; allJustCompleted: boolean };
  setProgress: (
    missionId: string,
    value: number
  ) => { justCompleted: boolean; xpEarned: number; allJustCompleted: boolean };
  refresh: () => void;
}

export function useMissions(walletAddress: string | null): UseMissionsReturn {
  const [missions, setMissions] = useState<Mission[]>([]);

  const refresh = useCallback(() => {
    if (!walletAddress) {
      setMissions([]);
      return;
    }
    const data = getMissions(walletAddress);
    setMissions(data.missions);
  }, [walletAddress]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const updateProgress = useCallback(
    (missionId: string, increment: number = 1) => {
      if (!walletAddress)
        return { justCompleted: false, xpEarned: 0, allJustCompleted: false };
      const result = updateMissionProgress(walletAddress, missionId, increment);
      refresh();
      return result;
    },
    [walletAddress, refresh]
  );

  const setProgress = useCallback(
    (missionId: string, value: number) => {
      if (!walletAddress)
        return { justCompleted: false, xpEarned: 0, allJustCompleted: false };
      const result = setMissionProgress(walletAddress, missionId, value);
      refresh();
      return result;
    },
    [walletAddress, refresh]
  );

  const completedCount = missions.filter((m) => m.completed).length;
  const allComplete = missions.length > 0 && completedCount === missions.length;

  return {
    missions,
    completedCount,
    allComplete,
    updateProgress,
    setProgress,
    refresh,
  };
}
