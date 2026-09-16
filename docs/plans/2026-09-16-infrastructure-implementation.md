# Infrastructure Portfolio Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. In this session use subagent-driven-development for the independent model module and review.

**Goal:** Deliver a polished local portfolio redesign with a data-centre identity, expressive interaction, and a functioning synthetic hardware-model lab.

**Architecture:** Keep Next.js static export and existing assets, replace the primary composition with isolated infrastructure components, and implement model logic as a pure tested module. Client components handle explicit user actions and motion; all factual content remains server-prerenderable.

**Tech Stack:** Next.js 16, React 19, TypeScript, Framer Motion, CSS, Vitest/Testing Library.

---

### Task 1: Model engine and fixtures

Create lib/machine-model.ts and lib/machine-model.test.ts. Write failing tests first for valid fixtures, fault validation, graph constraints, immutability and revision diffs; run npm test -- lib/machine-model.test.ts, implement, rerun. Contract: createModel(platform, revision), injectFault(model, fault), validateModel(model), diffModels(before, after). Platforms x86/arm/accelerator; revisions 1.0/1.1. Faults missing-reference/duplicate-slot. See assigned agent message for exact type shape. Commit independently.

### Task 2: Isometric rack scene

Create components/infrastructure/RackScene.tsx and RackScene.module.css. Self-contained original SVG or CSS scene, selected platform prop, onSelect callback, motion flag. Responsive and keyboard-operable controls; assembly and selection motion honor flag and OS preference. No fake metrics. Root visually checks after integration.

### Task 3: Portfolio composition and motion shell

Create InfrastructurePortfolio.tsx and infrastructure.css, replace app/page.tsx content and simplify app/layout.tsx global shell. Native anchors, mobile disclosure with Escape/focus return, light/dark and motion controls. Compose hero, model lab, lifecycle, case studies, timeline/profile, capabilities and contact. Update site metadata and legacy routes to reuse the new relevant sections. Correct next.config.ts turbopack root.

### Task 4: Lab interface

Create ModelLab.tsx and ModelLab.test.tsx. Test meaningful invalid→validate→repair flow before implementing the UI. Use engine contract; show persistent result and actionable error, entity inspection, revision comparison, JSON export. Scope changes clear stale results. No simulated waiting or service-performance numbers.

### Task 5: Integration and verification

Run npm test, npm run lint, npm run build. Inspect production export and base paths. Start local preview. Use the supported browser to exercise hero selection, lab faults/repair/diff/export, lifecycle controls, disclosures, mobile menu, themes and reduced motion. Fix observed issues. Have another agent review spec compliance then code quality. Document commands, known limitations and source references in README.md. Commit local work; do not publish unless requested.
