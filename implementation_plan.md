# Implementation Plan - Ultra-Luxury Scrollytelling Portfolio Landing Page

Build an Awwwards-level scrollytelling portfolio landing page for a solo engineer/designer building websites, AI agents, and CRMs. The core mechanic is a smooth scroll-linked HTML5 canvas animation rendering a 120-frame image sequence of a deconstructing metallic Chess King floating in a `#0A0A0A` void, perfectly synchronized with 4 key narrative beats.

## User Review Required

> [!IMPORTANT]
> - **Image Sequence Source**: 240 high-resolution JPG frames found in `webtest/` will be processed, downsampled, and optimized into 120 WEBP frames (`frame_0.webp` to `frame_119.webp`) under `public/sequence/` for 60fps performance and instant preloading.
> - **Seamless Void Blending**: Background `#0A0A0A` matches the rendered image background exactly. Radial edge vignette logic will be applied on canvas drawing to guarantee zero visual seam across all screen aspect ratios.

## Proposed Changes

### Project & Dependencies Setup

#### [NEW] [package.json](file:///c:/Users/jagad/Desktop/website/package.json)
Initialize Next.js 14 project with dependencies: `framer-motion`, `lucide-react`, `clsx`, `tailwind-merge`, `tailwindcss`, `sharp` (build dependency for image optimization).

#### [NEW] [tailwind.config.js](file:///c:/Users/jagad/Desktop/website/tailwind.config.js)
Configure custom colors (`#0A0A0A`, accent metallics, glowing borders), fonts, and keyframes.

---

### Image Sequence Preprocessing

#### [NEW] [scripts/process-sequence.js](file:///c:/Users/jagad/Desktop/website/scripts/process-sequence.js)
Node.js script using `sharp` to sample every 2nd frame from `webtest/ezgif-frame-*.jpg` (240 frames -> 120 frames), resize to optimal viewport resolution (e.g. 1920x1080), compress to lightweight `.webp`, and write to `public/sequence/frame_0.webp` ... `frame_119.webp`.

---

### Components & Scrollytelling Engine

#### [NEW] [components/ChessExplosionCanvas.tsx](file:///c:/Users/jagad/Desktop/website/components/ChessExplosionCanvas.tsx)
The primary scrollytelling component:
- **Outer Wrapper**: `height: 400vh` scroll track.
- **Sticky Viewport**: `sticky top-0 h-screen w-full` background container.
- **HTML5 Canvas**: Responsive canvas scaled with high-DPI support and `contain` fitting logic.
- **Scroll Tracking**: Framer Motion `useScroll` + `useSpring` (`stiffness: 100`, `damping: 30`) mapping scroll position to frame index `Math.floor(smoothProgress * 119)`.
- **Preloading & Loader UI**: Displays an elegant glassmorphism loading overlay with circular/linear progress bar and status text until all 120 frames are loaded.
- **"Scroll to Explore" Indicator**: Fixed floating scroll indicator visible at 0%, fading out by 10% scroll.
- **Narrative Overlay Beats** powered by `useTransform`:
  - **Beat A (0-20%)**: Hero Positioning - *"The board was already won."* (Centered, massive luxury typography + value prop subtitle).
  - **Beat B (25-45%)**: Services / The Pieces - *"The Pieces"* (Left-aligned, highlighting Websites, AI Agents, CRMs with glass cards).
  - **Beat C (50-70%)**: Process / How the Game Is Played - *"Three Moves Ahead"* (Right-aligned, showcasing 4 tactical stages: Position, Calculation, Execution, Checkmate).
  - **Beat D (75-95%)**: CTA / Contact - *"Ready to make your move?"* (Centered, with interactive contact trigger button).

#### [NEW] [components/Navbar.tsx](file:///c:/Users/jagad/Desktop/website/components/Navbar.tsx)
Minimal luxury navigation bar with brand mark, availability badge ("Available for Q3/Q4"), and quick action CTA button.

#### [NEW] [components/RecentMoves.tsx](file:///c:/Users/jagad/Desktop/website/components/RecentMoves.tsx)
A showcase section below the scroll canvas detailing flagship project case studies (Websites, Autonomous AI Agents, Custom CRMs) with metrics, interactive previews, and tech stacks.

#### [NEW] [components/ContactModal.tsx](file:///c:/Users/jagad/Desktop/website/components/ContactModal.tsx)
Interactive luxury consultation modal opened from Beat D or top CTA, allowing visitors to choose their focus (Website / AI Agent / CRM) and initiate contact.

---

### Styling & Application Page

#### [NEW] [app/globals.css](file:///c:/Users/jagad/Desktop/website/app/globals.css)
Tailwind base imports, `#0A0A0A` page background, custom dark scrollbar styles with subtle hover glow, typography tracking rules, and noise texture utilities.

#### [NEW] [app/page.tsx](file:///c:/Users/jagad/Desktop/website/app/page.tsx)
Main entry point integrating the sticky canvas scrollytelling engine, hero content, case studies grid, system philosophy, and interactive consultation modal.

---

## Verification Plan

### Automated Tests & Builds
- Run `npm run build` to verify TypeScript compilation, zero lint errors, and valid server/client component boundaries.

### Manual Verification
- Test scroll smoothness (60fps) and frame synchronization across desktop and mobile viewports.
- Check preloader accuracy and transition into the active scene.
- Verify text overlay enter/exit timing rules (`useTransform` opacity `[start, start+0.1, end-0.1, end]` and `y` translate `20px -> 0px -> -20px`).
- Confirm seamless blending of canvas image edges with background `#0A0A0A`.
