"use client";

import { useState, useEffect, useCallback } from "react";

// PSG1 Screen: 1240x1080 pixels, 3.92" OLED
const PSG1_WIDTH = 1240;
const PSG1_HEIGHT = 1080;
const PSG1_ASPECT_RATIO = PSG1_WIDTH / PSG1_HEIGHT; // ~1.148

// Tolerance for detection (device might report slightly different)
const TOLERANCE = 50;

export interface PSG1Config {
  isPSG1: boolean;       // PSG1 features enabled (gamepad hints, banner, controls)
  isCompact: boolean;    // Actually on a small screen (apply compact sizing)
  isGamepadMode: boolean;
  screenWidth: number;
  screenHeight: number;
  cardMaxWidth: string;
  cardMaxHeight: string;
  buttonSize: string;
  showButtonHints: boolean;
}

export function usePSG1Mode(): PSG1Config {
  const [config, setConfig] = useState<PSG1Config>({
    isPSG1: false,
    isCompact: false,
    isGamepadMode: false,
    screenWidth: typeof window !== "undefined" ? window.innerWidth : 1920,
    screenHeight: typeof window !== "undefined" ? window.innerHeight : 1080,
    cardMaxWidth: "380px",
    cardMaxHeight: "500px",
    buttonSize: "64px",
    showButtonHints: false,
  });

  const detectPSG1 = useCallback(() => {
    if (typeof window === "undefined") return;

    const width = window.innerWidth;
    const height = window.innerHeight;
    const aspectRatio = width / height;

    // Check if dimensions match PSG1 (with tolerance)
    const widthMatch = Math.abs(width - PSG1_WIDTH) <= TOLERANCE;
    const heightMatch = Math.abs(height - PSG1_HEIGHT) <= TOLERANCE;

    // Also check for PSG1 in user agent (if they add it)
    const uaMatch = navigator.userAgent.toLowerCase().includes("psg1");

    // Check for Android (PSG1 runs EchOS which is Android-based)
    const isAndroid = /android/i.test(navigator.userAgent);

    // Check if gamepad is connected
    const gamepads = navigator.getGamepads?.() || [];
    const hasGamepad = Array.from(gamepads).some(gp => gp !== null);

    // Actual PSG1 device: screen dimensions, user agent, or Android+gamepad
    const isActualPSG1Device = (widthMatch && heightMatch) || uaMatch || (isAndroid && hasGamepad);

    // URL param only enables gamepad polling — no visual/layout changes
    const urlParam = new URLSearchParams(window.location.search).get("psg1") === "true";

    // isPSG1: true if actual device OR url param (for gamepad polling)
    const isPSG1 = isActualPSG1Device || urlParam;

    // Compact mode: ONLY on actual PSG1 device — never from URL param alone
    const isCompact = isActualPSG1Device;

    const isPortrait = height > width;

    let cardMaxWidth = "380px";
    let cardMaxHeight = "500px";
    let buttonSize = "64px";

    if (isCompact) {
      // Actual PSG1 device — optimized dimensions
      cardMaxWidth = isPortrait ? "90vw" : "45vh";
      cardMaxHeight = isPortrait ? "60vh" : "80vw";
      buttonSize = "72px";
    } else if (width <= 768) {
      // Mobile / phone
      cardMaxWidth = "92vw";
      cardMaxHeight = "65vh";
      buttonSize = "56px";
    }

    setConfig({
      isPSG1,
      isCompact,
      isGamepadMode: hasGamepad,
      screenWidth: width,
      screenHeight: height,
      cardMaxWidth,
      cardMaxHeight,
      buttonSize,
      // Only show visual hints when gamepad actually connected or actual PSG1 device
      showButtonHints: hasGamepad || isActualPSG1Device,
    });
  }, []);

  useEffect(() => {
    detectPSG1();

    // Re-detect on resize
    window.addEventListener("resize", detectPSG1);

    // Re-detect when gamepad connects/disconnects
    window.addEventListener("gamepadconnected", detectPSG1);
    window.addEventListener("gamepaddisconnected", detectPSG1);

    return () => {
      window.removeEventListener("resize", detectPSG1);
      window.removeEventListener("gamepadconnected", detectPSG1);
      window.removeEventListener("gamepaddisconnected", detectPSG1);
    };
  }, [detectPSG1]);

  return config;
}

// Button mapping display names for PSG1
export const PSG1_BUTTON_LABELS = {
  YES: { button: "A", dpad: "→", color: "#00FF88" },
  NO: { button: "B", dpad: "←", color: "#FF0044" },
  CONTROLS: { button: "X", dpad: "", color: "#00F3FF" },
  SKIP: { button: "Y", dpad: "↑", color: "#FFD700" },
  BET_UP: { button: "R1", dpad: "", color: "#00F3FF" },
  BET_DOWN: { button: "L1", dpad: "↓", color: "#00F3FF" },
  CONNECT: { button: "START", dpad: "", color: "#FF00FF" },
} as const;
