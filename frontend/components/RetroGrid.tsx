"use client";

import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import { useMemo, useState, useEffect } from "react";

interface RetroGridProps {
  streak?: number;
}

// Seeded random number generator for consistent values
function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

export function RetroGrid({ streak = 0 }: RetroGridProps) {
  const [mounted, setMounted] = useState(false);

  // Only render random elements after client mount to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Determine mode based on streak
  const isFireMode = streak >= 5;
  const isWarpMode = streak >= 10;

  // Colors based on streak
  const primaryColor = isFireMode ? "#FFD700" : "#00F3FF";
  const secondaryColor = isFireMode ? "#FF8C00" : "#FF00FF";
  const glowColor = isFireMode ? "rgba(255, 140, 0, 0.15)" : "rgba(255, 0, 255, 0.15)";
  const accentGlow = isFireMode ? "rgba(255, 215, 0, 0.08)" : "rgba(0, 243, 255, 0.08)";

  // Animation speed based on streak
  const gridSpeed = isWarpMode ? 0.5 : isFireMode ? 1 : 1.5;
  const scanSpeed = isWarpMode ? 1.5 : 4;

  // Generate deterministic positions for particles using seeded random
  const particles = useMemo(() =>
    [...Array(20)].map((_, i) => ({
      left: `${seededRandom(i * 1000 + 1) * 100}%`,
      top: `${seededRandom(i * 1000 + 2) * 100}%`,
      isPrimary: i % 2 === 0,
      delay: seededRandom(i * 1000 + 3) * 2,
      duration: 3 + seededRandom(i * 1000 + 4) * 2,
    })),
    []
  );

  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      {/* Deep space void */}
      <div className="absolute inset-0 bg-[#050505]" />

      {/* Warp speed radial blur effect */}
      {isWarpMode && (
        <motion.div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(ellipse at center, transparent 0%, transparent 30%, rgba(0,0,0,0.5) 100%)`,
          }}
          animate={{
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{
            duration: 0.3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      )}

      {/* Warp speed lines */}
      {isWarpMode && mounted && (
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(30)].map((_, i) => (
            <motion.div
              key={`warp-${i}`}
              className="absolute"
              style={{
                left: `${seededRandom(i * 100 + 10) * 100}%`,
                top: `${seededRandom(i * 100 + 20) * 100}%`,
                width: "2px",
                height: "0px",
                background: `linear-gradient(to bottom, transparent, ${i % 2 === 0 ? "#FFD700" : "#FF8C00"}, transparent)`,
                transformOrigin: "center center",
                transform: `rotate(${seededRandom(i * 100 + 30) * 360}deg)`,
              }}
              animate={{
                height: ["0px", "100px", "200px", "0px"],
                opacity: [0, 1, 1, 0],
              }}
              transition={{
                duration: 0.5 + seededRandom(i * 100 + 40) * 0.5,
                repeat: Infinity,
                delay: seededRandom(i * 100 + 50) * 0.5,
                ease: "easeOut",
              }}
            />
          ))}
        </div>
      )}

      {/* Horizon glow - changes color based on streak */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-[40vh]"
        animate={{
          background: isFireMode
            ? `radial-gradient(ellipse 100% 50% at 50% 100%, rgba(255, 140, 0, 0.2) 0%, rgba(255, 215, 0, 0.1) 40%, transparent 70%)`
            : `radial-gradient(ellipse 100% 50% at 50% 100%, ${glowColor} 0%, ${accentGlow} 40%, transparent 70%)`,
        }}
        transition={{ duration: 0.5 }}
      />

      {/* Moving grid floor with perspective - color and speed changes */}
      <div
        className="absolute inset-0"
        style={{
          perspective: "400px",
          perspectiveOrigin: "50% 50%"
        }}
      >
        <motion.div
          className="absolute w-[200%] h-[200%] left-[-50%]"
          style={{
            transformStyle: "preserve-3d",
            transform: "rotateX(75deg) translateY(-50%)",
            backgroundSize: "60px 60px",
            maskImage: "linear-gradient(to bottom, transparent 0%, black 20%, black 80%, transparent 100%)"
          }}
          animate={{
            backgroundPosition: ["0px 0px", "0px 60px"],
            background: isFireMode
              ? `linear-gradient(90deg, rgba(255, 215, 0, 0.4) 1px, transparent 1px),
                 linear-gradient(0deg, rgba(255, 140, 0, 0.3) 1px, transparent 1px)`
              : `linear-gradient(90deg, rgba(0, 243, 255, 0.3) 1px, transparent 1px),
                 linear-gradient(0deg, rgba(255, 0, 255, 0.2) 1px, transparent 1px)`,
          }}
          transition={{
            backgroundPosition: {
              duration: gridSpeed,
              repeat: Infinity,
              ease: "linear"
            },
            background: {
              duration: 0.5,
            }
          }}
        />
      </div>

      {/* Vertical scan lines */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: "repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(255,255,255,0.5) 2px, rgba(255,255,255,0.5) 4px)",
        }}
      />

      {/* Horizontal CRT scan line - faster on warp */}
      <motion.div
        className="absolute left-0 right-0 h-[2px] opacity-10"
        style={{
          background: isFireMode
            ? "linear-gradient(90deg, transparent, rgba(255,215,0,0.8), transparent)"
            : "linear-gradient(90deg, transparent, rgba(0,243,255,0.8), transparent)"
        }}
        animate={{
          top: ["-2px", "100vh"]
        }}
        transition={{
          duration: scanSpeed,
          repeat: Infinity,
          ease: "linear"
        }}
      />

      {/* Additional scan lines for warp mode */}
      {isWarpMode && (
        <>
          <motion.div
            className="absolute left-0 right-0 h-[2px] opacity-20"
            style={{
              background: "linear-gradient(90deg, transparent, rgba(255,140,0,0.8), transparent)"
            }}
            animate={{
              top: ["-2px", "100vh"]
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: "linear",
              delay: 0.3
            }}
          />
          <motion.div
            className="absolute left-0 right-0 h-[2px] opacity-15"
            style={{
              background: "linear-gradient(90deg, transparent, rgba(255,215,0,0.8), transparent)"
            }}
            animate={{
              top: ["-2px", "100vh"]
            }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              ease: "linear",
              delay: 0.6
            }}
          />
        </>
      )}

      {/* Corner vignette */}
      <div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse at center, transparent 0%, transparent 40%, rgba(0,0,0,0.8) 100%)"
        }}
      />

      {/* Floating particles - color changes */}
      {particles.map((particle, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full"
          style={{
            left: particle.left,
            top: particle.top,
            background: particle.isPrimary ? primaryColor : secondaryColor,
            boxShadow: particle.isPrimary
              ? `0 0 10px ${primaryColor}, 0 0 20px ${primaryColor}`
              : `0 0 10px ${secondaryColor}, 0 0 20px ${secondaryColor}`
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.2, 0.8, 0.2],
            scale: isWarpMode ? [1, 2, 1] : [1, 1.5, 1]
          }}
          transition={{
            duration: isWarpMode ? particle.duration * 0.5 : particle.duration,
            repeat: Infinity,
            delay: particle.delay
          }}
        />
      ))}

      {/* Neon sun/moon at horizon - changes with streak */}
      <motion.div
        className="absolute bottom-[15vh] left-1/2 -translate-x-1/2 w-[300px] h-[150px]"
        style={{
          borderRadius: "150px 150px 0 0",
          filter: "blur(20px)",
          maskImage: "linear-gradient(to top, black 0%, transparent 100%)"
        }}
        animate={{
          background: isFireMode
            ? "linear-gradient(to bottom, #FFD700 0%, #FF8C00 50%, #FF4400 100%)"
            : "linear-gradient(to bottom, #FF00FF 0%, #00F3FF 100%)",
          opacity: isFireMode ? 0.5 : 0.3,
        }}
        transition={{ duration: 0.5 }}
      />

      {/* Fire mode: floating embers */}
      {isFireMode && mounted && (
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={`ember-${i}`}
              className="absolute w-2 h-2 rounded-full"
              style={{
                left: `${10 + seededRandom(i * 200 + 1) * 80}%`,
                bottom: "0%",
                background: i % 3 === 0 ? "#FFD700" : i % 3 === 1 ? "#FF8C00" : "#FF4400",
                boxShadow: `0 0 10px ${i % 3 === 0 ? "#FFD700" : "#FF8C00"}`,
              }}
              animate={{
                y: [0, -500 * (0.5 + seededRandom(i * 200 + 2) * 0.5)],
                x: [0, (seededRandom(i * 200 + 3) - 0.5) * 200],
                opacity: [1, 0.8, 0],
                scale: [1, 0.5, 0],
              }}
              transition={{
                duration: 3 + seededRandom(i * 200 + 4) * 2,
                repeat: Infinity,
                delay: seededRandom(i * 200 + 5) * 3,
                ease: "easeOut",
              }}
            />
          ))}
        </div>
      )}

      {/* Streak indicator pulse */}
      {streak > 0 && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: isWarpMode
              ? "radial-gradient(circle at center, rgba(255,215,0,0.1) 0%, transparent 50%)"
              : isFireMode
              ? "radial-gradient(circle at center, rgba(255,140,0,0.08) 0%, transparent 50%)"
              : "transparent",
          }}
          animate={{
            opacity: [0, 0.5, 0],
            scale: [0.8, 1.2, 0.8],
          }}
          transition={{
            duration: isWarpMode ? 0.5 : 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      )}
    </div>
  );
}
