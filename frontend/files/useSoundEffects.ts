"use client";

import { useCallback, useRef, useEffect, useState } from "react";

// Sound effect URLs - using free sounds (you can replace with your own)
const SOUNDS = {
  click: "/sounds/click.mp3",
  success: "/sounds/success.mp3",
  error: "/sounds/error.mp3",
  win: "/sounds/win.mp3",
  lose: "/sounds/lose.mp3",
  bet: "/sounds/bet.mp3",
  notification: "/sounds/notification.mp3",
  levelUp: "/sounds/level-up.mp3",
  streak: "/sounds/streak.mp3",
};

type SoundType = keyof typeof SOUNDS;

export function useSoundEffects() {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement }>({});

  // Initialize audio elements
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Check localStorage for sound preference
    const savedPref = localStorage.getItem("soundEnabled");
    if (savedPref !== null) {
      setSoundEnabled(savedPref === "true");
    }

    // Pre-load sounds
    Object.entries(SOUNDS).forEach(([key, url]) => {
      const audio = new Audio(url);
      audio.preload = "auto";
      audio.volume = 0.5;
      audioRefs.current[key] = audio;
    });

    return () => {
      // Cleanup
      Object.values(audioRefs.current).forEach((audio) => {
        audio.pause();
        audio.src = "";
      });
    };
  }, []);

  // Toggle sound
  const toggleSound = useCallback(() => {
    setSoundEnabled((prev) => {
      const newValue = !prev;
      localStorage.setItem("soundEnabled", String(newValue));
      return newValue;
    });
  }, []);

  // Play sound
  const playSound = useCallback(
    (sound: SoundType) => {
      if (!soundEnabled) return;
      
      const audio = audioRefs.current[sound];
      if (audio) {
        // Reset and play
        audio.currentTime = 0;
        audio.play().catch(() => {
          // Ignore autoplay errors
        });
      }
    },
    [soundEnabled]
  );

  // Convenience methods
  const playClick = useCallback(() => playSound("click"), [playSound]);
  const playSuccess = useCallback(() => playSound("success"), [playSound]);
  const playError = useCallback(() => playSound("error"), [playSound]);
  const playWin = useCallback(() => playSound("win"), [playSound]);
  const playLose = useCallback(() => playSound("lose"), [playSound]);
  const playBet = useCallback(() => playSound("bet"), [playSound]);
  const playNotification = useCallback(() => playSound("notification"), [playSound]);
  const playLevelUp = useCallback(() => playSound("levelUp"), [playSound]);
  const playStreak = useCallback(() => playSound("streak"), [playSound]);

  return {
    soundEnabled,
    toggleSound,
    playSound,
    playClick,
    playSuccess,
    playError,
    playWin,
    playLose,
    playBet,
    playNotification,
    playLevelUp,
    playStreak,
  };
}

// Hook for confetti effect
export function useConfetti() {
  const [isActive, setIsActive] = useState(false);

  const triggerConfetti = useCallback(() => {
    setIsActive(true);
    setTimeout(() => setIsActive(false), 3000);
  }, []);

  return { isActive, triggerConfetti };
}
