# Data centre infrastructure portfolio design

The user approved the portfolio redesign / interactive showcase direction and subsequently requested a more explicit data-centre identity, richer transitions, and improved UI/UX using transitions.dev and motionsites.ai as references. This revision implements that request as a local preview.

## Direction

An architectural control surface with an editorial introduction, an original isometric rack illustration, and interactive machine-model tooling. Deep charcoal, off-white text, teal connections, and lime selected states. Keep the portrait in an engineer-profile section. Content identifies the Google role as incoming and synthetic demo data as synthetic. No internal Google details or unsupported achievements.

## Page

1. Header: name/identity, model lab, work, about, contact, resume. Compact mobile menu with Escape handling. Theme and motion controls.
2. Hero: expressive typography and a clickable isometric data-centre scene. Hardware selector changes the active rack, architecture label, and explanation. Native anchor to lab.
3. Model lab: x86/ARM/accelerator fixtures, revision selection, selectable components, real deterministic local validation, fault injection, repair/reset, structured revision diff, JSON export.
4. Lifecycle: Design / Validate / Serve / Repair stepper with a changing diagram and concise explanation of the model's role. These are public conceptual examples, not claims about Google systems.
5. Work: expandable case studies using existing Nokia, Moody's, and Verisk experience, with clear challenge/contribution/tradeoff text. Do not invent metrics.
6. About: portrait, readable work timeline, evidence-based capabilities, original credentials/education, contact and resume.

## Motion

Intro assembly 500–700ms, panels 320ms, selections 220–260ms, feedback 150ms. Sliding active indicators, staggered rack/component entry, optional gentle pointer tilt, animated connection drawing, state feedback, expand/collapse, mobile menu. Prefer transform/opacity; no forced pinned scrolling. OS reduced motion and explicit motion setting stop decorative movement while preserving functionality. Content visible without JS.

## Architecture

Retain Next.js static export, React, TypeScript and existing Framer Motion. New components in components/infrastructure. Pure model functions and fixtures in lib/machine-model.ts with meaningful tests. No new backend or live fleet claims. Original SVG/CSS illustration rather than external video. Base-path-safe URLs for GitHub Pages.

## Validation

Unit tests for valid fixture revisions, missing references, duplicate IDs/slots, containment cycles, legal connectivity cycles, immutable fault injection, and meaningful revision diffs. UI flow tests for invalid → error → repair → valid. Build, lint, static export checks. Browser QA at desktop/mobile/tablet, both themes, reduced motion, nav and real demo interaction. Keep deployment separate from local preview.

## References

- https://transitions.dev/ — transition timing/panel/state concepts; original implementation.
- https://motionsites.ai/ — visual scale and composition; no copied premium assets.
