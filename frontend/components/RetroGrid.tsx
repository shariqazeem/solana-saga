"use client";

import { motion } from "framer-motion";

export function RetroGrid() {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      {/* Deep space void */}
      <div className="absolute inset-0 bg-[#050505]" />

      {/* Horizon glow */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[40vh]"
        style={{
          background: "radial-gradient(ellipse 100% 50% at 50% 100%, rgba(255, 0, 255, 0.15) 0%, rgba(0, 243, 255, 0.08) 40%, transparent 70%)"
        }}
      />

      {/* Moving grid floor with perspective */}
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
            background: `
              linear-gradient(90deg, rgba(0, 243, 255, 0.3) 1px, transparent 1px),
              linear-gradient(0deg, rgba(255, 0, 255, 0.2) 1px, transparent 1px)
            `,
            backgroundSize: "60px 60px",
            maskImage: "linear-gradient(to bottom, transparent 0%, black 20%, black 80%, transparent 100%)"
          }}
          animate={{
            backgroundPosition: ["0px 0px", "0px 60px"]
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "linear"
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

      {/* Horizontal CRT scan line */}
      <motion.div
        className="absolute left-0 right-0 h-[2px] opacity-10"
        style={{
          background: "linear-gradient(90deg, transparent, rgba(0,243,255,0.8), transparent)"
        }}
        animate={{
          top: ["-2px", "100vh"]
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "linear"
        }}
      />

      {/* Corner vignette */}
      <div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse at center, transparent 0%, transparent 40%, rgba(0,0,0,0.8) 100%)"
        }}
      />

      {/* Floating particles */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            background: i % 2 === 0 ? "#00F3FF" : "#FF00FF",
            boxShadow: i % 2 === 0
              ? "0 0 10px #00F3FF, 0 0 20px #00F3FF"
              : "0 0 10px #FF00FF, 0 0 20px #FF00FF"
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.2, 0.8, 0.2],
            scale: [1, 1.5, 1]
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 2
          }}
        />
      ))}

      {/* Neon sun/moon at horizon */}
      <div
        className="absolute bottom-[15vh] left-1/2 -translate-x-1/2 w-[300px] h-[150px]"
        style={{
          background: "linear-gradient(to bottom, #FF00FF 0%, #00F3FF 100%)",
          borderRadius: "150px 150px 0 0",
          opacity: 0.3,
          filter: "blur(20px)",
          maskImage: "linear-gradient(to top, black 0%, transparent 100%)"
        }}
      />
    </div>
  );
}
