"use client";

import { useCallback, useRef, useEffect } from "react";

// Sound URLs - using data URIs for small sounds, or you can host these
const SOUNDS = {
  hover: "data:audio/wav;base64,UklGRl9vT19teleWQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU", // placeholder
  swipeYes: "/sounds/swipe-yes.mp3",
  swipeNo: "/sounds/swipe-no.mp3",
  skip: "/sounds/skip.mp3",
  bet: "/sounds/bet.mp3",
  win: "/sounds/win.mp3",
  streak: "/sounds/streak.mp3",
};

// Web Audio context for generating sounds
let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioContext;
}

// Generate a beep sound
function playBeep(frequency: number, duration: number, type: OscillatorType = "sine", volume: number = 0.1) {
  try {
    const ctx = getAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = type;

    gainNode.gain.setValueAtTime(volume, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration);
  } catch (e) {
    console.log("Audio not supported");
  }
}

// Generate swoosh/whoosh effect
function playSwoosh(direction: "left" | "right" | "up") {
  try {
    const ctx = getAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    oscillator.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.type = "sawtooth";
    filter.type = "lowpass";
    filter.frequency.value = 2000;

    const startFreq = direction === "right" ? 200 : direction === "left" ? 400 : 300;
    const endFreq = direction === "right" ? 800 : direction === "left" ? 100 : 600;

    oscillator.frequency.setValueAtTime(startFreq, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(endFreq, ctx.currentTime + 0.15);

    gainNode.gain.setValueAtTime(0.08, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.2);
  } catch (e) {
    console.log("Audio not supported");
  }
}

// Cash register / coin sound
function playCashSound() {
  try {
    const ctx = getAudioContext();

    // Create multiple oscillators for richer sound
    const frequencies = [523.25, 659.25, 783.99]; // C5, E5, G5 chord

    frequencies.forEach((freq, i) => {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.type = "sine";
      oscillator.frequency.value = freq;

      const startTime = ctx.currentTime + i * 0.05;
      gainNode.gain.setValueAtTime(0.1, startTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3);

      oscillator.start(startTime);
      oscillator.stop(startTime + 0.3);
    });
  } catch (e) {
    console.log("Audio not supported");
  }
}

// Victory fanfare
function playWinSound() {
  try {
    const ctx = getAudioContext();
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6

    notes.forEach((freq, i) => {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.type = "square";
      oscillator.frequency.value = freq;

      const startTime = ctx.currentTime + i * 0.1;
      gainNode.gain.setValueAtTime(0.08, startTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.2);

      oscillator.start(startTime);
      oscillator.stop(startTime + 0.2);
    });
  } catch (e) {
    console.log("Audio not supported");
  }
}

// Streak fire sound
function playStreakSound(streakCount: number) {
  try {
    const ctx = getAudioContext();
    const baseFreq = 200 + (streakCount * 50);

    for (let i = 0; i < 3; i++) {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.type = "sawtooth";
      oscillator.frequency.setValueAtTime(baseFreq, ctx.currentTime + i * 0.08);
      oscillator.frequency.exponentialRampToValueAtTime(baseFreq * 2, ctx.currentTime + i * 0.08 + 0.1);

      gainNode.gain.setValueAtTime(0.06, ctx.currentTime + i * 0.08);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.08 + 0.15);

      oscillator.start(ctx.currentTime + i * 0.08);
      oscillator.stop(ctx.currentTime + i * 0.08 + 0.15);
    }
  } catch (e) {
    console.log("Audio not supported");
  }
}

export function useSoundEffects(enabled: boolean = true) {
  const enabledRef = useRef(enabled);

  useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);

  const playHover = useCallback(() => {
    if (!enabledRef.current) return;
    playBeep(800, 0.05, "sine", 0.03);
  }, []);

  const playSwipeYes = useCallback(() => {
    if (!enabledRef.current) return;
    playSwoosh("right");
    setTimeout(() => playBeep(600, 0.1, "sine", 0.08), 100);
  }, []);

  const playSwipeNo = useCallback(() => {
    if (!enabledRef.current) return;
    playSwoosh("left");
    setTimeout(() => playBeep(200, 0.15, "sawtooth", 0.06), 100);
  }, []);

  const playSkip = useCallback(() => {
    if (!enabledRef.current) return;
    playSwoosh("up");
  }, []);

  const playBet = useCallback(() => {
    if (!enabledRef.current) return;
    playCashSound();
  }, []);

  const playWin = useCallback(() => {
    if (!enabledRef.current) return;
    playWinSound();
  }, []);

  const playStreak = useCallback((count: number) => {
    if (!enabledRef.current) return;
    playStreakSound(count);
  }, []);

  const playError = useCallback(() => {
    if (!enabledRef.current) return;
    playBeep(150, 0.3, "square", 0.08);
  }, []);

  return {
    playHover,
    playSwipeYes,
    playSwipeNo,
    playSkip,
    playBet,
    playWin,
    playStreak,
    playError,
  };
}
