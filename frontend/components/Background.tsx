"use client";

import { useEffect, useState } from "react";

export function Background() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Generate particles only on client side to avoid hydration mismatch
  const particles = isMounted ? [...Array(20)].map((_, i) => ({
    left: Math.random() * 100,
    top: Math.random() * 100,
    delay: Math.random() * 5,
    opacity: Math.random() * 0.5 + 0.2,
  })) : [];

  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
      {/* Deep Space Base */}
      <div className="absolute inset-0 bg-[#02040A]" />

      {/* Animated Grid */}
      <div className="absolute inset-0 neon-grid opacity-20"
           style={{ transform: 'perspective(500px) rotateX(60deg) translateY(-100px) scale(2)' }} />

      {/* Interactive Orbs */}
      <div
        className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full blur-[100px] opacity-20 animate-pulse-glow"
        style={{
          background: 'radial-gradient(circle, var(--neon-cyan) 0%, transparent 70%)',
          transform: `translate(${mousePosition.x * 0.02}px, ${mousePosition.y * 0.02}px)`,
        }}
      />
      <div
        className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full blur-[100px] opacity-20 animate-pulse-glow"
        style={{
          background: 'radial-gradient(circle, var(--neon-magenta) 0%, transparent 70%)',
          transform: `translate(${-mousePosition.x * 0.02}px, ${-mousePosition.y * 0.02}px)`,
          animationDelay: '1s'
        }}
      />

      {/* Floating Particles - Only render on client to avoid hydration errors */}
      {isMounted && (
        <div className="absolute inset-0">
          {particles.map((particle, i) => (
            <div
              key={i}
              className="particle"
              style={{
                left: `${particle.left}%`,
                top: `${particle.top}%`,
                animationDelay: `${particle.delay}s`,
                opacity: particle.opacity,
              }}
            />
          ))}
        </div>
      )}

      {/* Scanline Overlay */}
      <div className="absolute inset-0 scanline opacity-10" />
    </div>
  );
}
