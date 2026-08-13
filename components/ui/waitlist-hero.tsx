"use client";

import React, { useState, useRef } from "react";
import { ArrowRight, Check, Loader2, Sparkles } from "lucide-react";

interface WaitlistHeroProps {
  title?: string;
  subtitle?: string;
  buttonText?: string;
  onOpenContact?: () => void;
}

export const WaitlistHero: React.FC<WaitlistHeroProps> = ({
  title = "Your Move. The Board Is Set.",
  subtitle = "Deploy AI agents that run the opening, midgame, and endgame — while you focus on the next big decision. Let's build the system that plays your business forward, one calculated move at a time.",
  buttonText = "Book a Call →",
  onOpenContact,
}) => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (onOpenContact) {
      onOpenContact();
      return;
    }

    if (!email) return;

    setStatus("loading");

    // Simulate API delay
    setTimeout(() => {
      setStatus("success");
      setEmail("");
      fireConfetti();
    }, 1200);
  };

  // --- Confetti Logic ---
  const fireConfetti = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      life: number;
      color: string;
      size: number;
    }

    const particles: Particle[] = [];
    const colors = ["#D4AF37", "#10b981", "#fbbf24", "#f472b6", "#ffffff"];

    // Resize canvas to cover the button area mostly
    canvas.width = canvas.offsetWidth || 600;
    canvas.height = canvas.offsetHeight || 600;

    const createParticle = (): Particle => {
      return {
        x: canvas.width / 2,
        y: canvas.height / 2,
        vx: (Math.random() - 0.5) * 14, // Random spread X
        vy: (Math.random() - 2) * 12, // Upward velocity
        life: 100,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 4 + 2,
      };
    };

    // Create batch of particles
    for (let i = 0; i < 60; i++) {
      particles.push(createParticle());
    }

    const animate = () => {
      if (particles.length === 0) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.5; // Gravity
        p.life -= 2;

        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, p.life / 100);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        if (p.life <= 0) {
          particles.splice(i, 1);
          i--;
        }
      }

      requestAnimationFrame(animate);
    };

    animate();
  };

  // Color tokens
  const colors = {
    textMain: "#ffffff",
    textSecondary: "rgba(255, 255, 255, 0.7)",
    bluePrimary: "#ffffff",
    success: "#10b981", // emerald-500
    inputBg: "rgba(255, 255, 255, 0.05)",
    baseBg: "#0A0A0A",
    inputShadow: "rgba(255, 255, 255, 0.1)",
  };

  return (
    <section className="relative z-30 w-full min-h-[90vh] bg-[#0A0A0A] border-t border-white/10 flex items-center justify-center py-20 overflow-hidden">
      {/* Animation Styles */}
      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 60s linear infinite;
        }
        @keyframes spin-slow-reverse {
          from { transform: rotate(0deg); }
          to { transform: rotate(-360deg); }
        }
        .animate-spin-slow-reverse {
          animation: spin-slow-reverse 60s linear infinite;
        }
        @keyframes bounce-in {
          0% { transform: scale(0.8); opacity: 0; }
          50% { transform: scale(1.05); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-bounce-in {
          animation: bounce-in 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }
        @keyframes success-pulse {
          0% { transform: scale(0.5); opacity: 0; }
          50% { transform: scale(1.1); }
          70% { transform: scale(0.95); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes success-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(16, 185, 129, 0.4); }
          50% { box-shadow: 0 0 60px rgba(16, 185, 129, 0.8), 0 0 100px rgba(16, 185, 129, 0.4); }
        }
        @keyframes checkmark-draw {
          0% { stroke-dashoffset: 24; }
          100% { stroke-dashoffset: 0; }
        }
        @keyframes celebration-ring {
          0% { transform: translate(-50%, -50%) scale(0.8); opacity: 1; }
          100% { transform: translate(-50%, -50%) scale(2); opacity: 0; }
        }
        .animate-success-pulse {
          animation: success-pulse 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }
        .animate-success-glow {
          animation: success-glow 2s ease-in-out infinite;
        }
        .animate-checkmark {
          stroke-dasharray: 24;
          stroke-dashoffset: 24;
          animation: checkmark-draw 0.4s ease-out 0.3s forwards;
        }
        .animate-ring {
          animation: celebration-ring 0.8s ease-out forwards;
        }
      `}</style>

      {/* Main Container */}
      <div
        className="relative w-full max-w-7xl mx-auto px-5 sm:px-6 md:px-12 py-16 rounded-3xl overflow-hidden glass-panel border border-white/10 shadow-2xl flex flex-col items-center justify-center"
        style={{
          backgroundColor: colors.baseBg,
        }}
      >
        {/* Background Decorative Layer */}
        <div
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{
            perspective: "1200px",
            transform: "perspective(1200px) rotateX(15deg)",
            transformOrigin: "center bottom",
            opacity: 0.85,
          }}
        >
          {/* Image 3 (Back) - spins clockwise */}
          <div className="absolute inset-0 animate-spin-slow">
            <div
              className="absolute top-1/2 left-1/2"
              style={{
                width: "1600px",
                height: "1600px",
                transform: "translate(-50%, -50%) rotate(279.05deg)",
                zIndex: 0,
              }}
            >
              <img
                src="https://framerusercontent.com/images/oqZEqzDEgSLygmUDuZAYNh2XQ9U.png?scale-down-to=2048"
                alt=""
                className="w-full h-full object-cover opacity-40 filter grayscale"
              />
            </div>
          </div>

          {/* Image 2 (Middle) - spins counter-clockwise */}
          <div className="absolute inset-0 animate-spin-slow-reverse">
            <div
              className="absolute top-1/2 left-1/2"
              style={{
                width: "900px",
                height: "900px",
                transform: "translate(-50%, -50%) rotate(304.42deg)",
                zIndex: 1,
              }}
            >
              <img
                src="https://framerusercontent.com/images/UbucGYsHDAUHfaGZNjwyCzViw8.png?scale-down-to=1024"
                alt=""
                className="w-full h-full object-cover opacity-50 filter grayscale"
              />
            </div>
          </div>

          {/* Image 1 (Front) - spins clockwise */}
          <div className="absolute inset-0 animate-spin-slow">
            <div
              className="absolute top-1/2 left-1/2"
              style={{
                width: "700px",
                height: "700px",
                transform: "translate(-50%, -50%) rotate(48.33deg)",
                zIndex: 2,
              }}
            >
              <img
                src="https://framerusercontent.com/images/Ans5PAxtJfg3CwxlrPMSshx2Pqc.png"
                alt="App Icon"
                className="w-full h-full object-cover opacity-60 filter brightness-120"
              />
            </div>
          </div>
        </div>

        {/* Gradient Overlay */}
        <div
          className="absolute inset-0 z-10 pointer-events-none"
          style={{
            background: `radial-gradient(circle at 50% 50%, rgba(10, 10, 10, 0.4) 0%, rgba(10, 10, 10, 0.95) 75%)`,
          }}
        />

        {/* Content Container */}
        <div className="relative z-20 w-full max-w-3xl flex flex-col items-center justify-center text-center gap-6 py-8">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[11px] font-mono uppercase tracking-widest text-white/80 font-semibold">
              Strategic System Deployment
            </span>
          </div>

          <h2 className="text-fluid-hero font-bold tracking-tighter text-gradient leading-[1.05]">
            {title}
          </h2>

          <p className="text-fluid-body text-white/70 max-w-2xl leading-relaxed font-normal">
            {subtitle}
          </p>

          {/* Form / Direct Action Container */}
          <div className="w-full max-w-md px-2 mt-4 h-[60px] relative perspective-1000">
            {/* Confetti Canvas */}
            <canvas
              ref={canvasRef}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] pointer-events-none z-50"
            />

            {/* SUCCESS STATE */}
            <div
              className={`absolute inset-0 flex items-center justify-center rounded-full transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] ${
                status === "success"
                  ? "opacity-100 scale-100 rotate-x-0 animate-success-pulse animate-success-glow"
                  : "opacity-0 scale-95 -rotate-x-90 pointer-events-none"
              }`}
              style={{ backgroundColor: colors.success }}
            >
              {status === "success" && (
                <>
                  <div
                    className="absolute top-1/2 left-1/2 w-full h-full rounded-full border-2 border-emerald-400 animate-ring"
                    style={{ animationDelay: "0s" }}
                  />
                  <div
                    className="absolute top-1/2 left-1/2 w-full h-full rounded-full border-2 border-emerald-300 animate-ring"
                    style={{ animationDelay: "0.15s" }}
                  />
                  <div
                    className="absolute top-1/2 left-1/2 w-full h-full rounded-full border-2 border-emerald-200 animate-ring"
                    style={{ animationDelay: "0.3s" }}
                  />
                </>
              )}
              <div
                className={`flex items-center gap-2 text-white font-semibold text-base sm:text-lg ${status === "success" ? "animate-bounce-in" : ""}`}
              >
                <div className="bg-white/20 p-1 rounded-full">
                  <Check className="w-5 h-5 text-white stroke-[3]" />
                </div>
                <span>You&apos;re on the list! Opening consultation...</span>
              </div>
            </div>

            {/* FORM STATE */}
            <form
              onSubmit={handleSubmit}
              className={`relative w-full h-full group transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] ${
                status === "success"
                  ? "opacity-0 scale-95 rotate-x-90 pointer-events-none"
                  : "opacity-100 scale-100 rotate-x-0"
              }`}
            >
              <input
                type="email"
                placeholder="Enter your work email..."
                value={email}
                disabled={status === "loading"}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-[60px] pl-6 pr-[170px] sm:pr-[180px] rounded-full outline-none transition-all duration-200 placeholder-white/30 text-white text-xs sm:text-sm border border-white/10 focus:border-white/30"
                style={{
                  backgroundColor: colors.inputBg,
                }}
              />

              <div className="absolute top-[6px] right-[6px] bottom-[6px]">
                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="h-full px-5 sm:px-6 rounded-full font-semibold text-xs sm:text-sm text-[#0A0A0A] bg-white hover:bg-white/90 transition-all active:scale-95 shadow-lg disabled:opacity-50 flex items-center justify-center space-x-1.5 min-w-[140px] sm:min-w-[160px]"
                >
                  {status === "loading" ? (
                    <Loader2 className="w-4 h-4 animate-spin text-[#0A0A0A]" />
                  ) : (
                    <>
                      <span>{buttonText}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WaitlistHero;
