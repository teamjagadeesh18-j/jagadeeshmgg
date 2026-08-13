"use client";

import { motion } from "framer-motion";
import { ArrowRight, Command } from "lucide-react";
import ShinyButton from "@/components/ui/shiny-button";

interface NavbarProps {
  onOpenContact: () => void;
}

export default function Navbar({ onOpenContact }: NavbarProps) {
  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-0 left-0 right-0 z-40 px-5 sm:px-6 md:px-12 py-4 sm:py-5 flex items-center justify-between pointer-events-none"
    >
      {/* Brand Identity */}
      <div className="flex items-center space-x-2.5 sm:space-x-3 pointer-events-auto">
        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/5 border border-white/20 backdrop-blur-md flex items-center justify-center text-white/90 shadow-xl group hover:border-amber-400/50 transition-all shrink-0 overflow-hidden p-0.5">
          <img
            src="/logo.jpeg"
            alt="Jagadeesh Logo"
            className="w-full h-full object-cover rounded-full group-hover:scale-110 transition-transform duration-300"
          />
        </div>
        <div>
          <div className="text-[11px] sm:text-xs font-mono tracking-widest text-white/90 uppercase font-semibold">
            JAGADEESH
          </div>
          <div className="text-[9px] sm:text-[10px] text-white/40 tracking-wider font-mono">
            Solo Engineer & Designer
          </div>
        </div>
      </div>

      {/* Center Availability Indicator (Desktop) */}
      <div className="hidden md:flex items-center space-x-2.5 px-3.5 py-1.5 rounded-full bg-white/[0.03] border border-white/10 backdrop-blur-md text-[11px] font-mono tracking-wide text-white/70 pointer-events-auto">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <span>Accepting 2 High-Stakes Projects</span>
      </div>

      {/* Quick Action Shiny Button */}
      <div className="pointer-events-auto shrink-0">
        <ShinyButton onClick={onOpenContact} className="!py-2 !px-4 !text-xs">
          <span className="hidden xs:inline sm:inline">Start a Conversation</span>
          <span className="inline xs:hidden sm:hidden">Contact</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </ShinyButton>
      </div>
    </motion.header>
  );
}
