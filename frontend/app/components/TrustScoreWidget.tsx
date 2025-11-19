'use client';

import { useEffect, useState } from 'react';
import { TrendingUp, Shield } from 'lucide-react';

interface TrustScoreWidgetProps {
  committees: any[];
}

export function TrustScoreWidget({ committees }: TrustScoreWidgetProps) {
  const [score, setScore] = useState(0);
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    // Calculate trust score based on committee health
    if (committees.length === 0) {
      setScore(0);
      return;
    }

    let totalScore = 0;
    committees.forEach((committee) => {
      // Score factors:
      // 1. Member participation (40 points)
      const participationScore = (committee.currentMembers / committee.maxMembers) * 40;

      // 2. Deposit completion (40 points)
      const depositsThisRound = committee.depositsThisRound || 0;
      const depositScore = committee.currentMembers > 0
        ? (depositsThisRound / committee.currentMembers) * 40
        : 0;

      // 3. Active status (20 points)
      const isActive = committee.phase && Object.keys(committee.phase)[0] !== 'completed';
      const activeScore = isActive ? 20 : 10;

      totalScore += participationScore + depositScore + activeScore;
    });

    const avgScore = Math.min(100, Math.round(totalScore / committees.length));
    setScore(avgScore);
  }, [committees]);

  // Animate score counting up
  useEffect(() => {
    const duration = 1000; // 1 second
    const steps = 30;
    const increment = score / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= score) {
        setDisplayScore(score);
        clearInterval(timer);
      } else {
        setDisplayScore(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [score]);

  const getScoreColor = () => {
    if (displayScore >= 80) return 'text-emerald-400';
    if (displayScore >= 60) return 'text-yellow-400';
    return 'text-orange-400';
  };

  const getScoreLabel = () => {
    if (displayScore >= 80) return 'Excellent';
    if (displayScore >= 60) return 'Good';
    if (displayScore >= 40) return 'Fair';
    return 'Low';
  };

  if (committees.length === 0) return null;

  return (
    <div className="fixed top-24 right-4 z-40 hidden lg:block animate-fadeIn">
      <div className="bg-white/5 backdrop-blur-xl border border-emerald-500/30 rounded-2xl p-4 w-48 relative group"
           style={{boxShadow: '0 0 30px rgba(16,185,129,0.15), inset 0 0 20px rgba(255,255,255,0.03)'}}>
        {/* Ambient glow on hover */}
        <div className="absolute inset-0 bg-emerald-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm"></div>

        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-slate-400 font-medium">Trust Score</span>
            <Shield className="w-4 h-4 text-emerald-400" />
          </div>

          {/* Score Circle */}
          <div className="flex items-center justify-center mb-3">
            <div className="relative">
              <svg className="transform -rotate-90" width="80" height="80">
                {/* Background circle */}
                <circle
                  cx="40"
                  cy="40"
                  r="32"
                  stroke="rgba(255, 255, 255, 0.1)"
                  strokeWidth="6"
                  fill="none"
                />
                {/* Progress circle */}
                <circle
                  cx="40"
                  cy="40"
                  r="32"
                  stroke="url(#trustGradient)"
                  strokeWidth="6"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 32}`}
                  strokeDashoffset={`${2 * Math.PI * 32 * (1 - displayScore / 100)}`}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
                <defs>
                  <linearGradient id="trustGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#3b82f6" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className={`text-2xl font-bold ${getScoreColor()}`}>
                  {displayScore}
                </span>
              </div>
            </div>
          </div>

          {/* Label */}
          <div className="text-center">
            <span className={`text-sm font-semibold ${getScoreColor()}`}>
              {getScoreLabel()}
            </span>
            <p className="text-xs text-slate-400 mt-1">Committee Health</p>
          </div>

          {/* Stats */}
          <div className="mt-3 pt-3 border-t border-white/10">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Active</span>
              <div className="flex items-center gap-1">
                <span className="text-white font-semibold">{committees.length}</span>
                <TrendingUp className="w-3 h-3 text-emerald-400" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
