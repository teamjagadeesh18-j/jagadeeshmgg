"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, CheckCircle2, Globe, Bot, Database, Sparkles, AlertCircle } from "lucide-react";
import ShinyButton from "@/components/ui/shiny-button";

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ContactModal({ isOpen, onClose }: ContactModalProps) {
  const [selectedFocus, setSelectedFocus] = useState<string>("Website");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [message, setMessage] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Generate static random liquid blob parameters once per mount
  const blobsData = useMemo(() => {
    return Array.from({ length: 6 }).map(() => ({
      size: Math.random() * 180 + 120,
      left: Math.random() * 80 + 10,
      top: Math.random() * 80 + 10,
      animationDelay: Math.random() * -20,
      animationDuration: Math.random() * 15 + 15,
    }));
  }, []);

  const blobRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (!isOpen) return;
    const handleMouseMove = (e: MouseEvent) => {
      const x = e.clientX / window.innerWidth;
      const y = e.clientY / window.innerHeight;

      blobRefs.current.forEach((blob, index) => {
        if (blob) {
          const speed = (index + 1) * 15;
          blob.style.marginLeft = `${x * speed}px`;
          blob.style.marginTop = `${y * speed}px`;
        }
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [isOpen]);

  // Auto-close in 3 seconds after successful submission
  useEffect(() => {
    if (isSubmitted) {
      const timer = setTimeout(() => {
        handleReset();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isSubmitted]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!name.trim()) {
      setErrorMessage("Please provide your name or company entity.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email.trim())) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    const phoneRegex = /^\+?[0-9\s\-()]{8,20}$/;
    if (!mobile || !phoneRegex.test(mobile.trim())) {
      setErrorMessage("Please enter a valid mobile number with country code (e.g. +91 98765 43210).");
      return;
    }

    if (!message.trim()) {
      setErrorMessage("Please describe your project context or bottlenecks.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          mobile: mobile.trim(),
          message: message.trim(),
          objective: selectedFocus,
        }),
      });

      const json = await res.json();

      if (res.ok && json.success) {
        try {
          const existing = JSON.parse(localStorage.getItem("jil_local_enquiries") || "[]");
          const newEntry = {
            id: json.data?.id || `enq_${Date.now()}`,
            name: name.trim(),
            email: email.trim(),
            mobile: mobile.trim(),
            message: message.trim(),
            objective: selectedFocus,
            status: "new",
            created_at: new Date().toISOString(),
          };
          localStorage.setItem("jil_local_enquiries", JSON.stringify([newEntry, ...existing]));
        } catch (e) {
          console.warn("LocalStorage save error:", e);
        }

        setIsSubmitted(true);
      } else {
        setErrorMessage(json.error || "Failed to submit enquiry. Please try again.");
      }
    } catch (err: any) {
      console.error("Submission fetch error:", err);
      setErrorMessage("Network error during submission. Please verify your connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setIsSubmitted(false);
    setErrorMessage(null);
    setName("");
    setEmail("");
    setMobile("");
    setMessage("");
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto font-sans">
          {/* SVG Gooey Filter definition */}
          <svg className="absolute width-0 height-0 pointer-events-none opacity-0">
            <defs>
              <filter id="gooey-contact">
                <feGaussianBlur in="SourceGraphic" stdDeviation="12" result="blur" />
                <feColorMatrix
                  in="blur"
                  mode="matrix"
                  values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9"
                  result="goo"
                />
                <feComposite in="SourceGraphic" in2="goo" operator="atop" />
              </filter>
            </defs>
          </svg>

          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#050505]/90 backdrop-blur-2xl"
          />

          {/* Liquid Goo Physics Stage (Background Blobs) */}
          <div
            className="fixed inset-0 pointer-events-none z-0 opacity-50"
            style={{ filter: "url('#gooey-contact')" }}
          >
            {blobsData.map((data, index) => (
              <div
                key={index}
                ref={(el) => {
                  blobRefs.current[index] = el;
                }}
                className="absolute rounded-full pointer-events-none transition-all duration-300 ease-out"
                style={{
                  width: `${data.size}px`,
                  height: `${data.size}px`,
                  left: `${data.left}%`,
                  top: `${data.top}%`,
                  background: "linear-gradient(135deg, #e0e0e0 0%, #888888 50%, #d97706 100%)",
                  filter: "blur(25px)",
                  boxShadow: "inset -10px -10px 20px rgba(0,0,0,0.6), 10px 10px 30px rgba(255,255,255,0.2)",
                  animation: `mercuryFloat 18s infinite alternate ease-in-out`,
                  animationDelay: `${data.animationDelay}s`,
                  animationDuration: `${data.animationDuration}s`,
                }}
              />
            ))}
          </div>

          <style>{`
            @keyframes mercuryFloat {
              0% { transform: translate(0, 0) scale(1); }
              33% { transform: translate(6vw, 12vh) scale(1.2); }
              66% { transform: translate(-4vw, 8vh) scale(0.85); }
              100% { transform: translate(4vw, -6vh) scale(1.1); }
            }
            .mercury-input-group {
              position: relative;
              transition: transform 0.3s ease;
            }
            .mercury-input-group:focus-within {
              transform: translateX(6px);
            }
            .mercury-glow-line {
              position: absolute;
              bottom: 0;
              left: 0;
              width: 0%;
              height: 2px;
              background: linear-gradient(90deg, #fbbf24, #ffffff);
              transition: width 0.4s cubic-bezier(0.2, 1, 0.3, 1);
              box-shadow: 0 0 12px rgba(251, 191, 36, 0.8);
            }
            .mercury-input:focus ~ .mercury-glow-line,
            .mercury-textarea:focus ~ .mercury-glow-line {
              width: 100%;
            }
          `}</style>

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-xl bg-[#090909]/90 rounded-3xl p-6 sm:p-9 z-10 border border-white/20 shadow-[0_25px_80px_rgba(0,0,0,0.9)] my-8 backdrop-blur-xl overflow-hidden"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-6 right-6 p-2.5 rounded-full bg-white/5 hover:bg-white/15 text-white/60 hover:text-white transition-colors z-20"
            >
              <X className="w-5 h-5" />
            </button>

            {!isSubmitted ? (
              <div className="relative z-10">
                {/* Header Node Identifier */}
                <div className="mb-6">
                  <span className="font-mono text-[10px] uppercase tracking-[4px] text-amber-400/80 block mb-1">
                    System Node: 0x992 • Neural Access
                  </span>
                  <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white uppercase font-mono">
                    INITIATE ALIGNMENT
                  </h2>
                  <p className="text-xs sm:text-sm text-white/50 font-mono mt-1">
                    Direct channel with Principal Architect. Response guaranteed within 12 hours.
                  </p>
                </div>

                {errorMessage && (
                  <div className="mb-5 p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-start space-x-2.5">
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Field 1: Primary Objective Selector */}
                  <div>
                    <label className="block text-[11px] font-mono text-white/60 uppercase tracking-widest mb-2">
                      Primary Objective <span className="text-amber-400">*</span>
                    </label>
                    <div className="grid grid-cols-3 gap-1.5 sm:gap-2.5">
                      {[
                        { id: "Website", label: "Website", icon: Globe },
                        { id: "AI Agent", label: "AI Agent", icon: Bot },
                        { id: "Custom CRM", label: "Custom CRM", icon: Database },
                      ].map((item) => {
                        const Icon = item.icon;
                        const active = selectedFocus === item.id;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => setSelectedFocus(item.id)}
                            className={`flex flex-col items-center justify-center p-2 sm:p-3 rounded-xl border text-[10px] sm:text-xs font-mono transition-all ${
                              active
                                ? "bg-white text-black font-bold border-amber-400 shadow-[0_0_20px_rgba(255,255,255,0.4)] scale-[1.02]"
                                : "bg-white/[0.03] border-white/10 text-white/60 hover:bg-white/10 hover:text-white"
                            }`}
                          >
                            <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 mb-1 sm:mb-1.5" />
                            <span>{item.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Field 2: Name Input */}
                  <div className="mercury-input-group">
                    <label className="block text-[11px] font-mono text-white/60 uppercase tracking-widest mb-1">
                      User Identity / Entity <span className="text-amber-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="ID-492-ALEXANDER"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="mercury-input w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/15 focus:border-white/40 text-white text-xs sm:text-sm focus:outline-none transition-colors placeholder:text-white/20 font-mono"
                    />
                    <div className="mercury-glow-line" />
                  </div>

                  {/* Field 3: Email Input */}
                  <div className="mercury-input-group">
                    <label className="block text-[11px] font-mono text-white/60 uppercase tracking-widest mb-1">
                      Direct Email Address <span className="text-amber-400">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="alexander@vanguard.io"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="mercury-input w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/15 focus:border-white/40 text-white text-xs sm:text-sm focus:outline-none transition-colors placeholder:text-white/20 font-mono"
                    />
                    <div className="mercury-glow-line" />
                  </div>

                  {/* Field 4: Mobile Number Input */}
                  <div className="mercury-input-group">
                    <label className="block text-[11px] font-mono text-white/60 uppercase tracking-widest mb-1">
                      Mobile Number <span className="text-amber-400">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 98765 43210"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      className="mercury-input w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/15 focus:border-white/40 text-white text-xs sm:text-sm focus:outline-none transition-colors placeholder:text-white/20 font-mono"
                    />
                    <div className="mercury-glow-line" />
                  </div>

                  {/* Field 5: Message Input */}
                  <div className="mercury-input-group">
                    <label className="block text-[11px] font-mono text-white/60 uppercase tracking-widest mb-1">
                      Project Context & Bottlenecks <span className="text-amber-400">*</span>
                    </label>
                    <textarea
                      rows={3}
                      required
                      placeholder="Describe system requirements, current bottlenecks, or goals..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="mercury-textarea w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/15 focus:border-white/40 text-white text-xs sm:text-sm focus:outline-none transition-colors placeholder:text-white/20 resize-none font-mono"
                    />
                    <div className="mercury-glow-line" />
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <ShinyButton
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-4 uppercase font-extrabold tracking-widest font-mono text-xs sm:text-sm"
                    >
                      {isSubmitting ? (
                        <div className="w-5 h-5 border-2 border-amber-400/20 border-t-amber-400 rounded-full animate-spin" />
                      ) : (
                        <>
                          <span>INITIALIZE STREAM</span>
                          <Send className="w-4 h-4" />
                        </>
                      )}
                    </ShinyButton>
                  </div>
                </form>
              </div>
            ) : (
              <div className="relative z-10 text-center py-6 sm:py-8 font-mono">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                  className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-400/30 to-amber-500/10 border border-amber-400/50 text-amber-400 flex items-center justify-center mx-auto mb-6 shadow-[0_0_40px_rgba(251,191,36,0.4)]"
                >
                  <CheckCircle2 className="w-10 h-10 text-amber-400" />
                </motion.div>

                <h3 className="text-2xl sm:text-3xl font-extrabold text-white mb-2 tracking-tight uppercase">
                  NEURAL STREAM INITIALIZED.
                </h3>
                <p className="text-xs sm:text-sm text-white/70 max-w-sm mx-auto mb-6 leading-relaxed">
                  Thank you, <span className="text-amber-400 font-bold">{name}</span>. Request logged for{" "}
                  <span className="text-amber-300 font-semibold">{selectedFocus}</span>. Confirmation sent to{" "}
                  <span className="text-amber-300 underline">{email}</span>.
                </p>

                <div className="max-w-xs mx-auto mb-6">
                  <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden mb-2">
                    <motion.div
                      initial={{ width: "100%" }}
                      animate={{ width: "0%" }}
                      transition={{ duration: 3, ease: "linear" }}
                      className="bg-amber-400 h-full rounded-full"
                    />
                  </div>
                  <div className="text-[11px] text-amber-400/90 font-medium tracking-wide">
                    Closing session in 3 seconds...
                  </div>
                </div>

                <ShinyButton onClick={handleReset}>
                  <span>CLOSE SESSION</span>
                </ShinyButton>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
