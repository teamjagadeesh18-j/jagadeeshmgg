"use client";

import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import ChessExplosionCanvas from "@/components/ChessExplosionCanvas";
import MarqueeBanner from "@/components/MarqueeBanner";
import RecentMoves from "@/components/RecentMoves";
import AboutSection from "@/components/AboutSection";
import { WaitlistHero } from "@/components/ui/waitlist-hero";
import ContactModal from "@/components/ContactModal";
import { CinematicFooter } from "@/components/ui/motion-footer";

export default function Home() {
  const [isContactOpen, setIsContactOpen] = useState(false);

  return (
    <main className="relative min-h-screen bg-[#0A0A0A] text-white/90 selection:bg-white/20 selection:text-white">
      {/* Navigation Header */}
      <Navbar onOpenContact={() => setIsContactOpen(true)} />

      {/* 400vh Sticky Canvas Scrollytelling Section (Hero & Beats A, B, C, D) */}
      <ChessExplosionCanvas onOpenContact={() => setIsContactOpen(true)} />

      {/* Marquee Animation Section (DASHBOARDS • AI GROWTH • MENTORSHIP • AUTOMATION • AI PRODUCTS • WORKFLOWS) */}
      <MarqueeBanner />

      {/* Selected Case Studies & JIL 2-Column Scrollytelling */}
      <RecentMoves onOpenContact={() => setIsContactOpen(true)} />

      {/* About Me Section (The Player Behind the Pieces) */}
      <AboutSection onOpenContact={() => setIsContactOpen(true)} />

      {/* Strategic Call to Action Section (Your Move. The Board Is Set.) */}
      <WaitlistHero
        title="Your Move. The Board Is Set."
        subtitle="Deploy AI agents that run the opening, midgame, and endgame — while you focus on the next big decision. Let's build the system that plays your business forward, one calculated move at a time."
        buttonText="Book a Call →"
        onOpenContact={() => setIsContactOpen(true)}
      />

      {/* Cinematic Reveal Footer (JAGADEESH) */}
      <CinematicFooter onOpenContact={() => setIsContactOpen(true)} />

      {/* Consultation Modal */}
      <ContactModal isOpen={isContactOpen} onClose={() => setIsContactOpen(false)} />
    </main>
  );
}
