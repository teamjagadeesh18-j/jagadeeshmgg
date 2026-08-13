"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Sparkles, Trophy, Users, ShieldCheck, ArrowRight, Zap, Target } from "lucide-react";
import { TextShimmer } from "@/components/core/text-shimmer";
import { TextShimmerWave } from "@/components/core/text-shimmer-wave";
import { AnimatedNumber } from "@/components/core/animated-number";
import ShinyButton from "@/components/ui/shiny-button";

interface AboutSectionProps {
  onOpenContact: () => void;
}

const stats = [
  { numericValue: 100, suffix: "+", label: "Websites Built", icon: Target },
  { numericValue: 1000, suffix: "+", label: "Students Trained", icon: Users },
  { numericValue: 2, suffix: "", label: "Companies Founded", icon: Trophy },
  { isInfinity: true, display: "∞", label: "Moves Already Calculated", icon: Zap },
];

export default function AboutSection({ onOpenContact }: AboutSectionProps) {
  return (
    <section className="relative z-30 w-full bg-[#0A0A0A] py-20 sm:py-32 px-5 sm:px-6 md:px-12 border-t border-white/10 overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-amber-500/[0.03] rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-white/[0.02] rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto">
        
        {/* Section Header Badge */}
        <div className="inline-flex items-center space-x-2.5 px-3.5 py-1 rounded-full bg-white/5 border border-white/10 mb-6 sm:mb-8 backdrop-blur-md">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <TextShimmer className="text-[10px] sm:text-[11px] font-mono uppercase tracking-widest text-white/80 font-semibold" duration={2}>
            The Player Behind the Pieces
          </TextShimmer>
        </div>

        {/* 2-Column Main About Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 lg:gap-16 items-center mb-16 sm:mb-24">
          
          {/* Left Column: Photo Frame tailored to #0A0A0A luxury dark theme */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-5 relative max-w-md lg:max-w-none mx-auto w-full"
          >
            <div className="relative rounded-3xl overflow-hidden glass-panel border border-white/15 p-2.5 sm:p-3 group shadow-[0_20px_60px_rgba(0,0,0,0.9)]">
              
              {/* Dark Gradient Overlay to blend seamlessly with #0A0A0A */}
              <div className="relative w-full aspect-[4/5] rounded-2xl overflow-hidden bg-[#0A0A0A]">
                <Image
                  src="/aboutme.jpeg"
                  alt="Jagadeesh - Solo Engineer & Designer"
                  fill
                  className="object-cover object-center filter grayscale brightness-90 contrast-110 group-hover:grayscale-0 group-hover:brightness-100 transition-all duration-700 ease-out"
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  priority
                />

                {/* Edge Vignette overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-[#0A0A0A]/40 opacity-80 pointer-events-none" />
                <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-2xl pointer-events-none" />
              </div>

              {/* Floating Badge on Photo */}
              <div className="absolute bottom-2.5 left-2.5 right-2.5 sm:bottom-6 sm:left-6 sm:right-6 p-2.5 sm:p-4 rounded-xl glass-panel border border-white/15 backdrop-blur-xl flex items-center justify-between">
                <div>
                  <div className="text-[11px] sm:text-xs font-mono font-bold tracking-wider text-white">JAGADEESH</div>
                  <div className="text-[9px] sm:text-[10px] font-mono text-white/50">Founder & Principal Systems Architect</div>
                </div>
                <div className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              </div>
            </div>
          </motion.div>

          {/* Right Column: Headline & Body Copy */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
            className="lg:col-span-7 flex flex-col justify-center max-w-2xl"
          >
            <h2 className="text-fluid-h2 font-bold tracking-tighter leading-[1.08] mb-6 sm:mb-8">
              <TextShimmer duration={2.5}>
                I don&apos;t build things to try. I build things to win.
              </TextShimmer>
            </h2>

            <div className="space-y-4 sm:space-y-5 text-fluid-body leading-relaxed font-normal">
              <p className="font-semibold text-white/90">
                <TextShimmerWave duration={1.2} spread={1} scaleDistance={1.05} rotateYDistance={12} className="font-semibold text-white/90">
                  I&apos;ve shipped 100+ websites. Trained over 1,000 students. Built two companies from zero.
                </TextShimmerWave>
              </p>

              <p className="text-white/75">
                <TextShimmerWave duration={1.5} spread={1.2} scaleDistance={1.04} rotateYDistance={10} className="text-white/75">
                  None of that happened by accident — it happened because I stopped treating business like guesswork and started treating it like a chessboard. Every move calculated before it&apos;s made. Every project built to end one way: in my favor, and in yours.
                </TextShimmerWave>
              </p>

              <p className="text-white/75">
                <TextShimmerWave duration={1.8} spread={1.2} scaleDistance={1.04} rotateYDistance={10} className="text-white/75">
                  I&apos;m not a &quot;passionate developer&quot; who loves clean code for its own sake. I&apos;m someone who got tired of watching people burn time and money on tools that don&apos;t work, teams that don&apos;t execute, and websites that just sit there instead of converting — so I built the systems myself. Websites. AI agents. CRMs. The pieces that actually move the game forward.
                </TextShimmerWave>
              </p>

              <p className="text-white/75">
                <TextShimmerWave duration={1.5} spread={1.2} scaleDistance={1.04} rotateYDistance={10} className="text-white/75">
                  Two companies. A thousand people trained to build real skills instead of collecting theory. A hundred-plus sites shipped for people who needed results, not excuses.
                </TextShimmerWave>
              </p>

              <p className="text-white/90 font-medium pt-1 sm:pt-2">
                <TextShimmerWave duration={1.4} spread={1} scaleDistance={1.06} rotateYDistance={12} className="text-white/90 font-medium">
                  I&apos;m not here to impress you with effort. I&apos;m here to show you the position I&apos;ve already calculated — and how fast we can get you there.
                </TextShimmerWave>
              </p>
            </div>

            {/* Quick Consultation Trigger */}
            <div className="mt-8 sm:mt-10">
              <ShinyButton onClick={onOpenContact}>
                <span>Initiate Strategic Alignment</span>
                <ArrowRight className="w-4 h-4" />
              </ShinyButton>
            </div>
          </motion.div>

        </div>

        {/* Stats Block with Animated Numbers */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="p-4 sm:p-6 md:p-8 rounded-2xl glass-panel border border-white/10 hover:border-white/20 transition-all duration-300 group"
              >
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <span className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tighter text-gradient group-hover:text-amber-400 transition-colors inline-flex items-center">
                    {stat.numericValue !== undefined ? (
                      <>
                        <AnimatedNumber
                          value={stat.numericValue}
                          springOptions={{ bounce: 0, duration: 2000 }}
                        />
                        <span>{stat.suffix}</span>
                      </>
                    ) : (
                      <span>{stat.display}</span>
                    )}
                  </span>
                  <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-white/5 flex items-center justify-center text-white/50 group-hover:text-white group-hover:bg-white/10 transition-colors shrink-0">
                    <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </div>
                </div>

                <div className="text-[11px] sm:text-xs md:text-sm font-mono text-white/60 group-hover:text-white/90 transition-colors">
                  {stat.label}
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
