"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { ArrowRight, Bot, MessageSquare, GraduationCap, Building2, Sparkles, CheckCircle2, Zap } from "lucide-react";
import GradientShimmer from "@/components/ui/gradient-shimmer";
import ShinyButton from "@/components/ui/shiny-button";

interface RecentMovesProps {
  onOpenContact: () => void;
}

const beatsData = [
  {
    id: "01",
    tag: "01 — NEXUS",
    title: "AI Agents & Autonomous Automation",
    subtitle: "Think. Act. Execute.",
    useFor: [
      "AI sales agents",
      "support agents",
      "HR agents",
      "research agents",
      "voice agents",
      "workflow automation",
    ],
    icon: Bot,
    gradient: "from-amber-400/20 to-amber-500/0",
  },
  {
    id: "02",
    tag: "02 — PULSE",
    title: "WhatsApp Business Intelligence",
    subtitle: "Every conversation becomes an opportunity.",
    useFor: [
      "WhatsApp CRM",
      "lead management",
      "customer support",
      "follow-ups",
      "appointments",
      "sales automation",
    ],
    icon: MessageSquare,
    gradient: "from-emerald-400/20 to-emerald-500/0",
  },
  {
    id: "03",
    tag: "03 — CAMPUS",
    title: "Intelligent Education OS",
    subtitle: "One system for the entire institution.",
    useFor: [
      "School ERP",
      "college ERP",
      "student management",
      "teacher management",
      "fees",
      "exams",
      "parents & admin",
    ],
    icon: GraduationCap,
    gradient: "from-blue-400/20 to-blue-500/0",
  },
  {
    id: "04",
    tag: "04 — VERTEX",
    title: "Industry-Specific Business Systems",
    subtitle: "Software engineered around how your business works.",
    useFor: [
      "Healthcare",
      "real estate",
      "recruitment",
      "manufacturing",
      "retail",
      "legal & enterprise",
    ],
    icon: Building2,
    gradient: "from-purple-400/20 to-purple-500/0",
  },
];

export default function RecentMoves({ onOpenContact }: RecentMovesProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // High-performance refs for zero re-renders and dirty-checked rendering
  const imagesRef = useRef<(HTMLImageElement | null)[]>([]);
  const lastRenderedIndexRef = useRef<number | null>(null);
  const lastCanvasSizeRef = useRef<{ w: number; h: number }>({ w: 0, h: 0 });

  const [isLoaded, setIsLoaded] = useState(false);
  const [isInProximity, setIsInProximity] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const INITIAL_BATCH = 15;

  // Detect Mobile device & viewport
  useEffect(() => {
    const checkDevice = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkDevice();
    window.addEventListener("resize", checkDevice);
    return () => window.removeEventListener("resize", checkDevice);
  }, []);

  // Proximity Lazy Loading: Zero frames fetched until user scrolls within 400px of section
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsInProximity(true);
          observer.disconnect();
        }
      },
      { rootMargin: "400px 0px" }
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  // Scroll Progress logic for JIL sequence track
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.0001,
  });

  // Preload JIL sequence frames smoothly without blocking main thread
  useEffect(() => {
    if (!isInProximity) return;

    let mounted = true;
    const framesCount = isMobile ? 120 : 240;
    const folder = isMobile ? "/sequence-jil-mobile" : "/sequence-jil";
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
        if (loadedCount >= INITIAL_BATCH && !isLoaded) {
          setIsLoaded(true);
        }
      };

      img.onerror = () => {
        if (!mounted) return;
        loadedCount++;
        if (loadedCount >= INITIAL_BATCH && !isLoaded) {
          setIsLoaded(true);
        }
      };
    };

    // 1. Rapid load initial batch for instant section start
    for (let i = 0; i < INITIAL_BATCH; i++) {
      loadFrame(i);
    }

    // 2. Stream remaining frames in idle time
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
  }, [isInProximity, isMobile]);

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

  // Optimized Canvas render loop with dirty checking & cached radial gradient
  useEffect(() => {
    if (!isLoaded) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    let animationFrameId: number;
    const totalFramesCount = isMobile ? 120 : 240;
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

        if (canvasRatio > imgRatio) {
          drawHeight = height;
          drawWidth = height * imgRatio;
        } else {
          drawWidth = width;
          drawHeight = width / imgRatio;
        }

        const drawX = (width - drawWidth) / 2;
        const drawY = (height - drawHeight) / 2;

        ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);

        // Cache radial gradient to prevent GC pauses
        if (!cachedRadialGradient || cachedGradW !== width || cachedGradH !== height) {
          cachedRadialGradient = ctx.createRadialGradient(
            width / 2,
            height / 2,
            Math.min(drawWidth, drawHeight) * 0.4,
            width / 2,
            height / 2,
            Math.max(width, height) * 0.6
          );
          cachedRadialGradient.addColorStop(0, "rgba(10, 10, 10, 0)");
          cachedRadialGradient.addColorStop(1, "#0A0A0A");
          cachedGradW = width;
          cachedGradH = height;
        }

        ctx.fillStyle = cachedRadialGradient;
        ctx.fillRect(0, 0, width, height);

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

  // Framer Motion transforms for the 4 narrative beats in Recent Moves
  // Beat 1: 0.00 -> 0.25 (NEXUS)
  const opacity1 = useTransform(smoothProgress, [0.0, 0.04, 0.21, 0.25], [0, 1, 1, 0]);
  const y1 = useTransform(smoothProgress, [0.0, 0.04, 0.21, 0.25], [20, 0, 0, -20]);
  const pointerEvents1 = useTransform(smoothProgress, (v) => (v <= 0.25 ? "auto" : "none"));
  const visibility1 = useTransform(smoothProgress, (v) => (v <= 0.26 ? "visible" : "hidden"));

  // Beat 2: 0.25 -> 0.50 (PULSE)
  const opacity2 = useTransform(smoothProgress, [0.25, 0.29, 0.46, 0.50], [0, 1, 1, 0]);
  const y2 = useTransform(smoothProgress, [0.25, 0.29, 0.46, 0.50], [20, 0, 0, -20]);
  const pointerEvents2 = useTransform(smoothProgress, (v) => (v >= 0.24 && v <= 0.50 ? "auto" : "none"));
  const visibility2 = useTransform(smoothProgress, (v) => (v >= 0.24 && v <= 0.51 ? "visible" : "hidden"));

  // Beat 3: 0.50 -> 0.75 (CAMPUS)
  const opacity3 = useTransform(smoothProgress, [0.50, 0.54, 0.71, 0.75], [0, 1, 1, 0]);
  const y3 = useTransform(smoothProgress, [0.50, 0.54, 0.71, 0.75], [20, 0, 0, -20]);
  const pointerEvents3 = useTransform(smoothProgress, (v) => (v >= 0.49 && v <= 0.75 ? "auto" : "none"));
  const visibility3 = useTransform(smoothProgress, (v) => (v >= 0.49 && v <= 0.76 ? "visible" : "hidden"));

  // Beat 4: 0.75 -> 1.00 (VERTEX)
  const opacity4 = useTransform(smoothProgress, [0.75, 0.79, 0.96, 1.00], [0, 1, 1, 0]);
  const y4 = useTransform(smoothProgress, [0.75, 0.79, 0.96, 1.00], [20, 0, 0, -20]);
  const pointerEvents4 = useTransform(smoothProgress, (v) => (v >= 0.74 ? "auto" : "none"));
  const visibility4 = useTransform(smoothProgress, (v) => (v >= 0.74 ? "visible" : "hidden"));

  const opacityTransforms = [
    { opacity: opacity1, y: y1, pointerEvents: pointerEvents1, visibility: visibility1 },
    { opacity: opacity2, y: y2, pointerEvents: pointerEvents2, visibility: visibility2 },
    { opacity: opacity3, y: y3, pointerEvents: pointerEvents3, visibility: visibility3 },
    { opacity: opacity4, y: y4, pointerEvents: pointerEvents4, visibility: visibility4 },
  ];

  return (
    <section ref={containerRef} className="relative w-full h-[400vh] bg-[#0A0A0A]">
      {/* Sticky Viewport Container */}
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-[#0A0A0A] border-t border-white/10 flex items-center">
        
        {/* Section Header Floating Pill & Main Section Heading */}
        <div className="absolute top-4 sm:top-8 left-5 sm:left-6 md:left-12 z-30 flex flex-col items-start gap-1 pointer-events-none">
          <div className="flex items-center space-x-3">
            <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-md flex items-center space-x-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-widest text-white/80">
                Flagship Case Studies
              </span>
            </div>
            <span className="text-xs font-mono text-white/40 hidden sm:inline-block">
              Scroll to Navigate Moves
            </span>
          </div>
          <h2 className="text-xl sm:text-3xl lg:text-4xl font-extrabold tracking-tighter text-white mt-1">
            <GradientShimmer gradient="sunrise" className="text-xl sm:text-3xl lg:text-4xl font-extrabold tracking-tighter">
              Recent Moves
            </GradientShimmer>
          </h2>
        </div>

        {/* 2-Column Responsive Layout */}
        <div className="relative z-20 w-full h-full max-w-7xl mx-auto px-4 sm:px-6 md:px-12 flex flex-col lg:flex-row items-center justify-between gap-3 sm:gap-4 lg:gap-12 pt-16 sm:pt-20 pb-6 sm:pb-8 lg:py-20">
          
          {/* Left Column: Text Overlays */}
          <div className="relative w-full lg:w-1/2 h-[340px] sm:h-[380px] lg:h-[450px] flex items-center">
            {beatsData.map((beat, idx) => {
              const transform = opacityTransforms[idx];
              const Icon = beat.icon;

              return (
                <motion.div
                  key={beat.id}
                  style={{
                    opacity: transform.opacity,
                    y: transform.y,
                    pointerEvents: transform.pointerEvents as any,
                    visibility: transform.visibility as any,
                  }}
                  className="absolute inset-0 flex flex-col justify-center max-w-[580px]"
                >
                  {/* Tag */}
                  <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 sm:px-3.5 sm:py-1.5 rounded-full bg-white/5 border border-white/10 self-start mb-1.5 sm:mb-4 backdrop-blur-md">
                    <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
                    <span className="text-[10px] sm:text-xs font-mono font-bold tracking-widest text-white uppercase">
                      {beat.tag}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-base sm:text-2xl lg:text-3xl font-bold tracking-tighter text-gradient leading-tight mb-1.5 sm:mb-3">
                    {beat.title}
                  </h3>

                  {/* Subtitle */}
                  <p className="text-xs sm:text-base font-medium text-white/90 mb-2 sm:mb-5 leading-relaxed">
                    {beat.subtitle}
                  </p>

                  {/* Use For Card */}
                  <div className="p-2.5 sm:p-5 rounded-xl sm:rounded-2xl glass-panel border border-white/10 bg-gradient-to-b from-white/[0.04] to-transparent">
                    <div className="text-[9px] sm:text-xs font-mono uppercase tracking-wider text-white/40 mb-1.5 sm:mb-2 flex items-center space-x-1.5">
                      <Zap className="w-3 h-3 text-amber-400" />
                      <span>Use for</span>
                    </div>

                    <div className="flex flex-wrap gap-1 sm:gap-2">
                      {beat.useFor.map((item) => (
                        <span
                          key={item}
                          className="px-2 py-0.5 sm:px-3 sm:py-1 rounded-md sm:rounded-lg bg-white/5 border border-white/10 text-[9px] sm:text-xs font-mono text-white/80 flex items-center space-x-1"
                        >
                          <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-amber-400/80" />
                          <span>{item}</span>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* CTA Action */}
                  <div className="mt-2.5 sm:mt-6">
                    <ShinyButton onClick={onOpenContact}>
                      <span className="text-xs sm:text-sm">Deploy {beat.tag.split(" — ")[1]} Architecture</span>
                      <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </ShinyButton>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Right Column: HTML5 Canvas for JIL Sequence */}
          <div className="relative w-full lg:w-1/2 flex-1 lg:flex-none h-[180px] sm:h-[350px] lg:h-[500px] flex items-center justify-center">
            <canvas
              ref={canvasRef}
              className="w-full h-full object-contain rounded-2xl pointer-events-none"
            />
          </div>

        </div>

      </div>
    </section>
  );
}
