"use client";

import { useState, useEffect, useCallback } from "react";

// PSG1 Screen: 1240x1080 physical pixels, 3.92" OLED, ~419 PPI
// At DPR 3: CSS viewport ≈ 360x413 (portrait: 360w x 413h)
// At DPR 2.5: CSS viewport ≈ 432x496
// At DPR 2: CSS viewport ≈ 540x620
const PSG1_CSS_WIDTH_MAX = 540;  // Upper bound (DPR 2)
const PSG1_CSS_WIDTH_MIN = 320;  // Lower bound
const PSG1_CSS_HEIGHT_MAX = 620;
const PSG1_CSS_HEIGHT_MIN = 360;

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

    // PSG1 WebView reports CSS pixels (not physical).
    // At ~419 PPI with DPR 2.5-3, CSS viewport is ~360x413 to ~432x496.
    const cssViewportMatch =
      width >= PSG1_CSS_WIDTH_MIN && width <= PSG1_CSS_WIDTH_MAX &&
      height >= PSG1_CSS_HEIGHT_MIN && height <= PSG1_CSS_HEIGHT_MAX;

    // Also check for PSG1 in user agent (if they add it)
    const uaMatch = navigator.userAgent.toLowerCase().includes("psg1");

    // Check for Android (PSG1 runs EchOS which is Android-based)
    const isAndroid = /android/i.test(navigator.userAgent);

    // Check if gamepad is connected
    const gamepads = navigator.getGamepads?.() || [];
    const hasGamepad = Array.from(gamepads).some(gp => gp !== null);

    // URL param — TWA wrapper sends ?psg1=true
    const urlParam = new URLSearchParams(window.location.search).get("psg1") === "true";

    // Actual PSG1 device: URL param on Android, CSS viewport match, UA match, or Android+gamepad
    const isActualPSG1Device = (urlParam && isAndroid) || (cssViewportMatch && isAndroid) || uaMatch || (isAndroid && hasGamepad);

    // isPSG1: true if actual device OR url param (for gamepad polling + PSG1 features)
    const isPSG1 = isActualPSG1Device || urlParam;

    // Compact mode: actual PSG1 device OR url param (TWA always sends this)
    // The whole point of ?psg1=true from TWA is to activate PSG1-optimized layout
    const isCompact = isActualPSG1Device || urlParam;

    const isPortrait = height > width;

    let cardMaxWidth = "380px";
    let cardMaxHeight = "500px";
    let buttonSize = "64px";

    if (isCompact) {
      // PSG1 device — CSS viewport is ~360x413 at DPR 3
      // Every pixel counts on this tiny screen
      cardMaxWidth = "96vw";
      cardMaxHeight = isPortrait ? "55vh" : "70vw";
      buttonSize = width <= 400 ? "48px" : "56px";
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
