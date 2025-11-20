"use client";

import { Hero } from "@/components/home/Hero";
import { Stats } from "@/components/home/Stats";
import { Features } from "@/components/home/Features";
import { HowItWorks } from "@/components/home/HowItWorks";
import { HotMarkets } from "@/components/home/HotMarkets";
import { LeaderboardPreview } from "@/components/home/LeaderboardPreview";
import { CTA } from "@/components/home/CTA";

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <Hero />
      <Stats />
      <Features />
      <HowItWorks />
      <HotMarkets />
      <LeaderboardPreview />
      <CTA />
    </div>
  );
}
