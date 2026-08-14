"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { ArrowRight, ChevronDown, Layers, Bot, Database, Globe, CheckCircle2, ShieldCheck, Zap } from "lucide-react";
import GradientShimmer from "@/components/ui/gradient-shimmer";
import ShinyButton from "@/components/ui/shiny-button";

interface ChessExplosionCanvasProps {
  onOpenContact: () => void;
}

export default function ChessExplosionCanvas({ onOpenContact }: ChessExplosionCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // High-performance image storage & dirty-checking refs
  const imagesRef = useRef<(HTMLImageElement | null)[]>([]);
  const lastRenderedIndexRef = useRef<number | null>(null);
  const lastCanvasSizeRef = useRef<{ w: number; h: number }>({ w: 0, h: 0 });

  // State for preloading
  const [loadProgress, setLoadProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const INITIAL_BATCH = 20;

  // Scroll Progress logic
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.0001,
  });

  // Detect mobile & screen parameters on mount & resize
  useEffect(() => {
    const checkDevice = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkDevice();
    window.addEventListener("resize", checkDevice);
    return () => window.removeEventListener("resize", checkDevice);
  }, []);

  // Staged Preload sequence: Rapid initial batch for fast LCP, then idle-stream remaining frames without re-render thrashing
  useEffect(() => {
    let mounted = true;
    const framesCount = 240;
    const folder = "/sequence";
    const loadedImages: (HTMLImageElement | null)[] = new Array(framesCount).fill(null);
    imagesRef.current = loadedImages;

    let loadedCount = 0;

    const loadFrame = (i: number) => {
      if (i >= framesCount || !mounted) return;
      const img = new Image();
      img.srcset = `${folder}/frame_${i}-mobile.webp 640w, ${folder}/frame_${i}-tablet.webp 1024w, ${folder}/frame_${i}.webp 1920w`;
      img.sizes = "(max-width: 640px) 640px, (max-width: 1024px) 1024px, 100vw";
      img.src = `${folder}/frame_${i}.webp`;

      img.onload = () => {
        if (!mounted) return;
        loadedImages[i] = img;
        loadedCount++;
        setLoadProgress(Math.floor((loadedCount / framesCount) * 100));

        if (loadedCount >= INITIAL_BATCH && !isLoaded) {
          setIsLoaded(true);
        }
      };

      img.onerror = () => {
        if (!mounted) return;
        loadedCount++;
        setLoadProgress(Math.floor((loadedCount / framesCount) * 100));
        if (loadedCount >= INITIAL_BATCH && !isLoaded) {
          setIsLoaded(true);
        }
      };
    };

    // 1. Rapid load initial batch for instant page interactive
    for (let i = 0; i < INITIAL_BATCH; i++) {
      loadFrame(i);
    }

    // 2. Stream remaining frames asynchronously in non-blocking batches
    let currentBatch = INITIAL_BATCH;
    const BATCH_SIZE = 12;

    const streamRemaining = () => {
      if (!mounted || currentBatch >= framesCount) return;
      const end = Math.min(currentBatch + BATCH_SIZE, framesCount);
      for (let i = currentBatch; i < end; i++) {
        loadFrame(i);
      }
      currentBatch = end;
      if (currentBatch < framesCount) {
        if (typeof window.requestIdleCallback === "function") {
          window.requestIdleCallback(streamRemaining, { timeout: 100 });
        } else {
          setTimeout(streamRemaining, 25);
        }
      }
    };

    if (typeof window.requestIdleCallback === "function") {
      window.requestIdleCallback(streamRemaining, { timeout: 100 });
    } else {
      setTimeout(streamRemaining, 40);
    }

    return () => {
      mounted = false;
    };
  }, []);

  // Fluid ResizeObserver to continuously update Canvas Resolution & Fit Bounds on window/foldable resize
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const updateCanvasSize = () => {
      const dpr = window.devicePixelRatio || 1;
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;

      if (width > 0 && height > 0 && (canvas.width !== width * dpr || canvas.height !== height * dpr)) {
        canvas.width = width * dpr;
        canvas.height = height * dpr;
      }
    };

    updateCanvasSize();

    const resizeObserver = new ResizeObserver(() => {
      updateCanvasSize();
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  // Optimized Canvas render loop with dirty checking & gradient caching
  useEffect(() => {
    if (!isLoaded) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    let animationFrameId: number;
    const totalFramesCount = 240;
    let cachedRadialGradient: CanvasGradient | null = null;
    let cachedGradW = 0;
    let cachedGradH = 0;

    const render = () => {
      const currentProgress = smoothProgress.get();
      const targetIndex = Math.min(
        totalFramesCount - 1,
        Math.max(0, Math.floor(currentProgress * totalFramesCount))
      );

      const dpr = window.devicePixelRatio || 1;
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;

      const sizeChanged =
        lastCanvasSizeRef.current.w !== width ||
        lastCanvasSizeRef.current.h !== height;

      // DIRTY CHECKING: Skip redraw if frame index and canvas dimensions haven't changed!
      if (!sizeChanged && lastRenderedIndexRef.current === targetIndex) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      const images = imagesRef.current;
      let img = images[targetIndex];
      if (!img) {
        for (let offset = 1; offset < totalFramesCount; offset++) {
          if (targetIndex - offset >= 0 && images[targetIndex - offset]) {
            img = images[targetIndex - offset];
            break;
          }
          if (targetIndex + offset < totalFramesCount && images[targetIndex + offset]) {
            img = images[targetIndex + offset];
            break;
          }
        }
      }

      if (img && img.complete && img.naturalWidth > 0 && width > 0 && height > 0) {
        if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
          canvas.width = width * dpr;
          canvas.height = height * dpr;
        }

        ctx.save();
        ctx.scale(dpr, dpr);
        ctx.fillStyle = "#0A0A0A";
        ctx.fillRect(0, 0, width, height);

        const imgRatio = img.naturalWidth / img.naturalHeight;
        const canvasRatio = width / height;

        let drawWidth: number;
        let drawHeight: number;
        let drawX: number;
        let drawY: number;

        if (isMobile) {
          // Mobile (< 768px): Cover mode with center 30% vertical offset
          if (canvasRatio > imgRatio) {
            drawWidth = width;
            drawHeight = width / imgRatio;
            drawX = 0;
            drawY = (height - drawHeight) * 0.30;
          } else {
            drawHeight = height;
            drawWidth = height * imgRatio;
            drawX = (width - drawWidth) * 0.50;
            drawY = (height - drawHeight) * 0.30;
          }

          ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
        } else {
          // Desktop/Tablet (>= 768px): Boxed contain scaling
          if (canvasRatio > imgRatio) {
            drawHeight = height;
            drawWidth = height * imgRatio;
          } else {
            drawWidth = width;
            drawHeight = width / imgRatio;
          }

          drawX = (width - drawWidth) / 2;
          drawY = (height - drawHeight) / 2;

          ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);

          // Cache radial gradient to prevent GC pauses
          if (!cachedRadialGradient || cachedGradW !== width || cachedGradH !== height) {
            cachedRadialGradient = ctx.createRadialGradient(
              width / 2,
              height / 2,
              Math.min(drawWidth, drawHeight) * 0.35,
              width / 2,
              height / 2,
              Math.max(width, height) * 0.55
            );
            cachedRadialGradient.addColorStop(0, "rgba(10, 10, 10, 0)");
            cachedRadialGradient.addColorStop(1, "#0A0A0A");
            cachedGradW = width;
            cachedGradH = height;
          }

          ctx.fillStyle = cachedRadialGradient;
          ctx.fillRect(0, 0, width, height);
        }

        ctx.restore();

        // Save last rendered state
        lastRenderedIndexRef.current = targetIndex;
        lastCanvasSizeRef.current = { w: width, h: height };
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isLoaded, smoothProgress, isMobile]);

  // Framer Motion transforms for narrative text overlays
  // BEAT A: Visible on load (0.0), stays until 0.17, fades out at 0.22
  const opacityA = useTransform(smoothProgress, [0.0, 0.17, 0.22], [1, 1, 0]);
  const yA = useTransform(smoothProgress, [0.0, 0.17, 0.22], [0, 0, -20]);
  const pointerEventsA = useTransform(smoothProgress, (v) => (v < 0.22 ? "auto" : "none"));
  const visibilityA = useTransform(smoothProgress, (v) => (v <= 0.23 ? "visible" : "hidden"));

  // Beat B: 0.25 -> 0.45
  const opacityB = useTransform(smoothProgress, [0.25, 0.28, 0.42, 0.46], [0, 1, 1, 0]);
  const yB = useTransform(smoothProgress, [0.25, 0.28, 0.42, 0.46], [20, 0, 0, -20]);
  const pointerEventsB = useTransform(smoothProgress, (v) => (v >= 0.24 && v <= 0.46 ? "auto" : "none"));
  const visibilityB = useTransform(smoothProgress, (v) => (v >= 0.23 && v <= 0.47 ? "visible" : "hidden"));

  // Beat C: 0.50 -> 0.70
  const opacityC = useTransform(smoothProgress, [0.50, 0.53, 0.67, 0.71], [0, 1, 1, 0]);
  const yC = useTransform(smoothProgress, [0.50, 0.53, 0.67, 0.71], [20, 0, 0, -20]);
  const pointerEventsC = useTransform(smoothProgress, (v) => (v >= 0.49 && v <= 0.71 ? "auto" : "none"));
  const visibilityC = useTransform(smoothProgress, (v) => (v >= 0.48 && v <= 0.73 ? "visible" : "hidden"));

  // Beat D: 0.75 -> 0.95
  const opacityD = useTransform(smoothProgress, [0.75, 0.78, 0.92, 0.96], [0, 1, 1, 0]);
  const yD = useTransform(smoothProgress, [0.75, 0.78, 0.92, 0.96], [20, 0, 0, -20]);
  const pointerEventsD = useTransform(smoothProgress, (v) => (v >= 0.74 ? "auto" : "none"));
  const visibilityD = useTransform(smoothProgress, (v) => (v >= 0.73 ? "visible" : "hidden"));

  // Scroll indicator opacity: 0% -> 10%
  const scrollIndicatorOpacity = useTransform(smoothProgress, [0, 0.08], [1, 0]);

  return (
    <div ref={containerRef} className="relative w-full h-[400vh] bg-[#0A0A0A]">
      {/* Preloader Minimal Indicator */}
      {!isLoaded && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0A0A0A] text-white">
          <div className="relative flex flex-col items-center max-w-sm px-6 text-center">
            <div className="relative w-14 h-14 mb-6 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border border-white/10" />
              <div className="absolute inset-0 rounded-full border-t border-amber-400 animate-spin" />
              <span className="text-[11px] font-mono text-white/80">{loadProgress}%</span>
            </div>
            <p className="text-xs text-white/50 font-mono mb-4">
              Initializing Engine (240 Frames)...
            </p>
            <div className="w-48 h-1 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-400 transition-all duration-150 ease-out"
                style={{ width: `${loadProgress}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Sticky Viewport Container */}
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-[#0A0A0A]">
        {/* Mobile Scale Animation Background Layer */}
        <div className="absolute inset-0 w-full h-full max-md:animate-hero-cinematic-zoom overflow-hidden pointer-events-none z-10">
          {/* HTML5 Canvas */}
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full max-md:object-cover max-md:object-[center_30%] md:object-contain pointer-events-none"
          />
        </div>

        {/* Gradient Scrim behind text region on mobile (< 768px) */}
        <div
          className="md:hidden absolute inset-0 pointer-events-none z-15"
          style={{
            background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 40%, transparent 70%)"
          }}
        />

        {/* Narrative Overlays Container (Grid Stack to ensure beats occupy identical coordinate bounds) */}
        <div className="relative z-20 w-full h-full max-w-7xl mx-auto px-4 sm:px-6 md:px-12 grid grid-cols-1 grid-rows-1 items-center max-md:items-end max-md:pb-16 max-md:pt-0 max-md:px-5 pointer-events-none">
          
          {/* BEAT A — 0-20% Scroll (Hero / Positioning) */}
          <motion.div
            style={{ opacity: opacityA, y: yA, pointerEvents: pointerEventsA, visibility: visibilityA }}
            className="col-start-1 row-start-1 w-full max-w-[640px] text-left flex flex-col items-start justify-center max-md:p-0 max-md:bg-transparent max-md:backdrop-blur-none max-md:border-none max-md:shadow-none p-4 sm:p-6 md:p-6 lg:p-0 rounded-2xl sm:rounded-3xl bg-[#0A0A0A]/75 md:bg-[#0A0A0A]/75 lg:bg-transparent backdrop-blur-xl md:backdrop-blur-xl lg:backdrop-blur-none border border-white/10 md:border-white/10 lg:border-none shadow-2xl lg:shadow-none"
          >
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-2 sm:mb-4 backdrop-blur-md">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              <GradientShimmer gradient="sunrise" className="text-[10px] sm:text-[11px] font-mono uppercase tracking-widest text-white/70">
                Strategic System Architecture
              </GradientShimmer>
            </div>

            <h1 className="text-xl sm:text-3xl lg:text-fluid-hero font-bold tracking-tighter leading-[1.02] mb-2 sm:mb-4 max-w-xl flex flex-col items-start">
              <GradientShimmer gradient="sunrise" className="text-xl sm:text-3xl lg:text-fluid-hero font-bold tracking-tighter">
                The Board Is Set.
              </GradientShimmer>
              <GradientShimmer gradient="sunrise" className="text-xl sm:text-3xl lg:text-fluid-hero font-bold tracking-tighter">
                Your Move.
              </GradientShimmer>
            </h1>

            <p className="text-xs sm:text-base text-white/70 font-normal max-w-lg leading-relaxed mb-4 sm:mb-6">
              <GradientShimmer gradient="bubble" duration={2} className="text-xs sm:text-base text-white/70 font-normal leading-relaxed">
                I build websites, AI agents, and CRMs for people who don&apos;t have time to lose. I don&apos;t sell effort. I sell the outcome that was already calculated before we spoke.
              </GradientShimmer>
            </p>

            <div className="flex flex-wrap items-center gap-4 pointer-events-auto">
              <button
                onClick={onOpenContact}
                className="group relative inline-flex items-center space-x-2.5 px-5 py-2.5 sm:px-7 sm:py-3.5 rounded-full bg-white text-[#0A0A0A] font-semibold text-xs sm:text-sm tracking-tight hover:bg-white/90 transition-all duration-300 shadow-[0_0_30px_rgba(255,255,255,0.2)] active:scale-95"
              >
                <span>Start a Conversation</span>
                <ArrowRight className="w-4 h-4 text-[#0A0A0A] group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </motion.div>

          {/* BEAT B — 25-45% Scroll (Services / The Pieces) */}
          <motion.div
            style={{ opacity: opacityB, y: yB, pointerEvents: pointerEventsB, visibility: visibilityB }}
            className="col-start-1 row-start-1 w-full text-left flex flex-col max-w-[620px] max-md:p-0 max-md:bg-transparent max-md:backdrop-blur-none max-md:border-none max-md:shadow-none p-4 sm:p-6 md:p-6 lg:p-0 rounded-2xl sm:rounded-3xl bg-[#0A0A0A]/75 md:bg-[#0A0A0A]/75 lg:bg-transparent backdrop-blur-xl md:backdrop-blur-xl lg:backdrop-blur-none border border-white/10 md:border-white/10 lg:border-none shadow-2xl lg:shadow-none"
          >
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-2 sm:mb-3 backdrop-blur-md self-start">
              <GradientShimmer gradient="sunrise" className="text-[10px] sm:text-[11px] font-mono uppercase tracking-widest text-white/70">
                01 / Capabilities
              </GradientShimmer>
            </div>

            <h2 className="text-lg sm:text-2xl lg:text-fluid-h2 font-bold tracking-tighter mb-2 sm:mb-3">
              <GradientShimmer gradient="sunrise" className="text-lg sm:text-2xl lg:text-fluid-h2 font-bold tracking-tighter">
                The Pieces.
              </GradientShimmer>
            </h2>

            <p className="text-xs sm:text-base text-white/70 mb-3 sm:mb-5 leading-relaxed max-w-lg">
              <GradientShimmer gradient="bubble" duration={2} className="text-xs sm:text-base text-white/70 leading-relaxed">
                Websites built to convert and move. Autonomous AI agents for lead recovery and ops. Custom-structured CRMs built around how you actually work.
              </GradientShimmer>
            </p>

            {/* Interactive Feature Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 w-full">
              <div className="p-2.5 sm:p-4 rounded-xl glass-panel hover:border-white/20 transition-all group">
                <Globe className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-white/80 mb-1 sm:mb-2 group-hover:scale-110 transition-transform" />
                <h3 className="text-xs sm:text-sm font-semibold text-white/90 mb-0.5">Websites</h3>
                <p className="text-[10px] sm:text-xs text-white/50 leading-snug">
                  High-converting Next.js engines with motion mechanics.
                </p>
              </div>

              <div className="p-2.5 sm:p-4 rounded-xl glass-panel hover:border-white/20 transition-all group">
                <Bot className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-white/80 mb-1 sm:mb-2 group-hover:scale-110 transition-transform" />
                <h3 className="text-xs sm:text-sm font-semibold text-white/90 mb-0.5">AI Agents</h3>
                <p className="text-[10px] sm:text-xs text-white/50 leading-snug">
                  Autonomous workflow automation & 24/7 lead execution.
                </p>
              </div>

              <div className="p-2.5 sm:p-4 rounded-xl glass-panel hover:border-white/20 transition-all group">
                <Database className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-white/80 mb-1 sm:mb-2 group-hover:scale-110 transition-transform" />
                <h3 className="text-xs sm:text-sm font-semibold text-white/90 mb-0.5">Custom CRMs</h3>
                <p className="text-[10px] sm:text-xs text-white/50 leading-snug">
                  Tailored pipeline infrastructure designed for rapid close.
                </p>
              </div>
            </div>
          </motion.div>

          {/* BEAT C — 50-70% Scroll (Process / How the Game Is Played) */}
          <motion.div
            style={{ opacity: opacityC, y: yC, pointerEvents: pointerEventsC, visibility: visibilityC }}
            className="col-start-1 row-start-1 w-full text-left lg:text-right lg:justify-self-end flex flex-col items-start lg:items-end max-w-[620px] max-md:p-0 max-md:bg-transparent max-md:backdrop-blur-none max-md:border-none max-md:shadow-none p-4 sm:p-6 md:p-6 lg:p-0 rounded-2xl sm:rounded-3xl bg-[#0A0A0A]/75 md:bg-[#0A0A0A]/75 lg:bg-transparent backdrop-blur-xl md:backdrop-blur-xl lg:backdrop-blur-none border border-white/10 md:border-white/10 lg:border-none shadow-2xl lg:shadow-none"
          >
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-2 sm:mb-3 backdrop-blur-md">
              <GradientShimmer gradient="sunrise" className="text-[10px] sm:text-[11px] font-mono uppercase tracking-widest text-white/70">
                02 / Delivery Method
              </GradientShimmer>
            </div>

            <h2 className="text-lg sm:text-2xl lg:text-fluid-h2 font-bold tracking-tighter mb-2 sm:mb-3">
              <GradientShimmer gradient="sunrise" className="text-lg sm:text-2xl lg:text-fluid-h2 font-bold tracking-tighter">
                Three Moves Ahead.
              </GradientShimmer>
            </h2>

            <p className="text-xs sm:text-base text-white/70 mb-3 sm:mb-5 leading-relaxed max-w-lg">
              <GradientShimmer gradient="bubble" duration={2} className="text-xs sm:text-base text-white/70 leading-relaxed">
                The Position, The Calculation, The Execution, The Checkmate. Fast development because the thinking already happened.
              </GradientShimmer>
            </p>

            {/* 4-Stage Tactical Timeline */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 w-full text-left">
              <div className="p-2.5 sm:p-4 rounded-xl glass-panel border border-white/10">
                <div className="text-[9px] sm:text-xs font-mono text-white/40 mb-0.5">01. POSITION</div>
                <div className="text-xs sm:text-sm font-semibold text-white/90">Audit & Scope</div>
                <div className="text-[10px] sm:text-[11px] text-white/50 mt-0.5">Extract core leverage points</div>
              </div>

              <div className="p-2.5 sm:p-4 rounded-xl glass-panel border border-white/10">
                <div className="text-[9px] sm:text-xs font-mono text-white/40 mb-0.5">02. CALCULATION</div>
                <div className="text-xs sm:text-sm font-semibold text-white/90">System Specs</div>
                <div className="text-[10px] sm:text-[11px] text-white/50 mt-0.5">Zero-fluff architecture</div>
              </div>

              <div className="p-2.5 sm:p-4 rounded-xl glass-panel border border-white/10">
                <div className="text-[9px] sm:text-xs font-mono text-white/40 mb-0.5">03. EXECUTION</div>
                <div className="text-xs sm:text-sm font-semibold text-white/90">Rapid Sprint</div>
                <div className="text-[10px] sm:text-[11px] text-white/50 mt-0.5">Full code + AI deployment</div>
              </div>

              <div className="p-2.5 sm:p-4 rounded-xl glass-panel border border-white/10">
                <div className="text-[9px] sm:text-xs font-mono text-white/40 mb-0.5">04. CHECKMATE</div>
                <div className="text-xs sm:text-sm font-semibold text-white/90">Turnkey Hand-off</div>
                <div className="text-[10px] sm:text-[11px] text-white/50 mt-0.5">Immediate market impact</div>
              </div>
            </div>
          </motion.div>

          {/* BEAT D — 75-95% Scroll (CTA / Contact) */}
          <motion.div
            style={{ opacity: opacityD, y: yD, pointerEvents: pointerEventsD, visibility: visibilityD }}
            className="col-start-1 row-start-1 w-full text-center lg:justify-self-center flex flex-col items-center justify-center max-w-[640px] mx-auto max-md:p-0 max-md:bg-transparent max-md:backdrop-blur-none max-md:border-none max-md:shadow-none p-4 sm:p-6 md:p-6 lg:p-0 rounded-2xl sm:rounded-3xl bg-[#0A0A0A]/75 md:bg-[#0A0A0A]/75 lg:bg-transparent backdrop-blur-xl md:backdrop-blur-xl lg:backdrop-blur-none border border-white/10 md:border-white/10 lg:border-none shadow-2xl lg:shadow-none"
          >
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 mb-4 sm:mb-6 backdrop-blur-md">
              <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 shrink-0" />
              <GradientShimmer gradient="sunrise" className="text-[10px] sm:text-[11px] font-mono uppercase tracking-widest text-white/80">
                Turnkey Execution Available
              </GradientShimmer>
            </div>

            <h2 className="text-fluid-hero font-bold tracking-tighter mb-4 sm:mb-6 flex flex-col items-center">
              <GradientShimmer gradient="sunrise" className="text-fluid-hero font-bold tracking-tighter">
                Ready to make
              </GradientShimmer>
              <GradientShimmer gradient="sunrise" className="text-fluid-hero font-bold tracking-tighter">
                your move?
              </GradientShimmer>
            </h2>

            <p className="text-fluid-body text-white/70 mb-6 sm:mb-8 max-w-lg leading-relaxed">
              <GradientShimmer gradient="bubble" duration={2} className="text-fluid-body text-white/70 leading-relaxed">
                Tell me where you&apos;re stuck. I&apos;ll tell you how it ends.
              </GradientShimmer>
            </p>

            <div className="pointer-events-auto">
              <ShinyButton onClick={onOpenContact}>
                <span>Start a Conversation</span>
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </ShinyButton>
            </div>
          </motion.div>

        </div>

        {/* Floating Scroll Indicator (0% to 10%) */}
        <motion.div
          style={{ opacity: scrollIndicatorOpacity }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center pointer-events-none"
        >
          <span className="text-[10px] font-mono uppercase tracking-widest text-white/40 mb-2">
            Scroll to Explore
          </span>
          <div className="w-5 h-9 rounded-full border border-white/20 flex items-start justify-center p-1">
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
              className="w-1 h-2 rounded-full bg-white/60"
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
