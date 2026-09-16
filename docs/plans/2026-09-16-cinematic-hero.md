# Cinematic Infrastructure Hero Implementation Plan

**Goal:** Adapt the supplied Mainframe motion reference to Nikhil's observability portfolio, then push the verified redesign and confirm its GitHub Pages deployment.

**Architecture:** Keep Next static export and all existing experience and observability content. Replace the boxed hero illustration with an original full-bleed data-centre scene. A single bounded timeline responds to horizontal pointer movement, an accessible scrub slider, and scrolling. Layered introduction, terminal-like signal text, and pill actions borrow the reference's pacing. Text remains available to assistive technology; motion can be paused or disabled at the system level.

**Tech stack:** Existing React, TypeScript, Framer Motion, SVG/CSS; no new runtime dependencies.

## Design

The reference is motion direction, not an instruction to copy Mainframe branding, fonts, wording, or video. Original rendered infrastructure gives sharper responsive visuals, direct controls, and a lightweight static fallback. A full-screen hero is followed immediately by employer evidence, the scroll story, and featured observability experience. Incoming Google status remains explicit.

## Work

1. Create `CinematicInfrastructure.tsx` and a CSS module: perspective server aisle, composited camera movement, and progressive signal paths. Accept one normalized MotionValue and the shared motion flag. Draw a complete static initial scene. Verify any projection math with focused tests.
2. Create `CinematicHero.tsx` and a CSS module: full-screen composition, pointer/scroll timeline, keyboard-accessible manual scrub, staged blur-to-clear entrance, brief typed status line, direct experience/story/contact links, and responsive controls. Test manual selection and motion-disabled behavior before implementing.
3. Replace the old hero in `InfrastructurePortfolio.tsx`; preserve company highlights and all experience/lab content. Reconcile global CSS/no-JavaScript behavior. Update README.
4. Browser QA: desktop and narrow phones, scene pointer/scroll response, manual timeline, pause, system reduced motion, native anchor navigation, and readable light/dark/no-JS states. Run all tests, lint, static build, dependency audit, and independent code review.
5. Commit, fetch remote changes, integrate without force push, push feature and main as a fast-forward when possible, monitor the existing Pages workflow, and verify the public URL serves the new hero. Refresh the source archive and preview.

User authorization: explicit instruction to implement the supplied transition direction, then push and update the codebase. No additional approval needed for those actions.
