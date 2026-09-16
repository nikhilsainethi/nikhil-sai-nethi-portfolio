# Observability and Scroll-driven Infrastructure Plan

**Goal:** Make the infrastructure move as the visitor scrolls while centering Nikhil's actual observability experience and incoming monitoring work with UHM-M.

**Architecture:** Keep the current Next static export and original design. Add an isolated sticky scroll story and a synthetic observability sandbox. Root owns integration, truthful content, hero parallax, and experience emphasis. Independent components own their CSS modules and behavioral tests. Existing motion preference controls gate all decorative movement; native scroll stays available. Mobile and reduced-motion visitors get a compact, directly selectable story.

**Tech stack:** Next.js, React, TypeScript, Framer Motion, original SVG/CSS, Vitest/Testing Library.

## Design decisions

The user explicitly requested scroll-driven same-screen animation and an observability/monitoring refocus; proceed with implementation in the existing local feature worktree. The preferred approach is one bounded sticky narrative with layered rack/telemetry motion. Full-page scroll hijacking would make experience harder to read; global moving wallpaper would add motion without explaining the work. Use the bounded story plus subtle hero parallax and visible experience highlights.

Page order: observability hero and experience preview → four-stage infrastructure story → selected experience (Moody's observability first and expanded) → interactive observability lab → career/about → optional model-foundation lab → contact. Primary hero CTA and first nav link lead to experience. Keep the Google role incoming. Public descriptions do not claim any particular internal Google telemetry stack.

## Tasks

1. Create `ObservabilityStory.tsx` and CSS module. A sticky viewport scene evolves from physical racks → emitted signals → correlated latency → recovery. Scroll updates active stage, topology, transforms, paths, and evidence text. Stage buttons work without dragging. On mobile/short screens/reduced motion use compact selectable stages. No-JS content stays visible. Test stage selection/reduced-motion where meaningful.
2. Create typed synthetic observability scenarios and `ObservabilityLab.tsx`/CSS/tests. Healthy, slow model lookup, and recovery states; calculated metrics, deterministic sample charts, trace inspection, and clear diagnostic evidence. Explicit synthetic/no live claims. Test calculations and incident→inspect→recover.
3. Update `InfrastructurePortfolio.tsx` hero/experience/about content, reorder Moody's first and default expanded, integrate new components, retain original model lab as optional foundation. Add hero parallax and reduced-motion control near the hero. Update shell nav, metadata, social image, and README for observability focus.
4. Run tests, lint, build and independent review. Exercise scroll story in browser, stage selection, monitoring scenario, mobile/light/dark/reduced motion and production export. Refresh source ZIP and local preview without pushing/deploying.
