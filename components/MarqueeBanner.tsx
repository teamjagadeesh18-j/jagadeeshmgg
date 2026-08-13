"use client";

import React from "react";

const marqueeItems = [
  "DASHBOARDS",
  "AI GROWTH",
  "MENTORSHIP",
  "AUTOMATION",
  "AI PRODUCTS",
  "WORKFLOWS",
  "WEBSITES",
  "CUSTOM CRMS",
];

export default function MarqueeBanner() {
  return (
    <div className="relative z-30 w-full overflow-hidden bg-[#0A0A0A] border-y border-white/10 py-5 select-none shadow-[0_0_30px_rgba(0,0,0,0.8)]">
      {/* Subtle edge fade gradient */}
      <div className="absolute top-0 bottom-0 left-0 w-24 bg-gradient-to-r from-[#0A0A0A] to-transparent z-10 pointer-events-none" />
      <div className="absolute top-0 bottom-0 right-0 w-24 bg-gradient-to-l from-[#0A0A0A] to-transparent z-10 pointer-events-none" />

      {/* Infinite scrolling track */}
      <div className="flex w-max animate-footer-scroll-marquee">
        {/* Render 3 duplicate sets to ensure seamless 100% infinite loop without gaps */}
        {[...Array(3)].map((_, setIdx) => (
          <div key={setIdx} className="flex items-center space-x-12 px-6">
            {marqueeItems.map((item, idx) => (
              <React.Fragment key={`${setIdx}-${idx}`}>
                <span className="text-sm sm:text-base font-extrabold tracking-[0.25em] text-white/80 hover:text-white transition-colors uppercase font-mono">
                  {item}
                </span>
                <span className="text-amber-400/70 text-xs sm:text-sm">✦</span>
              </React.Fragment>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
