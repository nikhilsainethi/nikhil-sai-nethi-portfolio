# Nikhil Sai Nethi — Infrastructure Portfolio

A data-centre-inspired portfolio focused on **observability and monitoring**. Scroll through infrastructure becoming telemetry, explore production reliability experience, and investigate a synthetic incident. The Google UHM-M role is presented as **incoming**; the demos are independent personal illustrations.

## Explore

- **Cinematic infrastructure hero:** a full-screen original data-centre aisle rendered in real-time 3D (Three.js) from a Blender-built model with baked lighting. Cabinets power on row by row, LEDs show activity, and signal routes draw through the room. Pointer movement and scrolling walk the camera and reveal telemetry, an investigated cabinet and its recovery; an accessible slider provides direct control. Without WebGL (or with data saver on) the SVG aisle is shown instead. Blur-to-clear text, a typed signal line, and pill actions adapt the supplied motion reference to the portfolio.
- **Follow the signals:** a bounded sticky desktop scene evolves from physical racks to telemetry, a slow dependency, and recovery. The racks are a 3D diorama of the same Blender cabinets, drawn under the SVG overlay and kept registered to it; signal beams rise into the metric, log and trace cards, and request packets slow down at the slow dependency. It follows the light and dark themes. Stage buttons provide direct control; small screens and reduced motion use a compact layout.
- **Signal Lab:** investigate a slow model lookup through calculated sample metrics, traces, and correlated logs, adjust the example alert threshold, and recover the synthetic service.
- **Hardware-model foundation:** an optional disclosure retains entity inspection, validation, revision comparison, and JSON export.
- **Experience first:** a primary experience CTA, three visible experience highlights, and a featured Moody’s observability case study that opens by default. Nokia diagnostics, developer tooling, and Verisk migration work remain available.
- **Engineer profile:** career timeline, education, certifications, résumé, and contact links.
- Responsive layouts, dark/light themes, native anchor navigation, system reduced-motion support, a manual motion toggle, and a readable no-JavaScript fallback.

## Run locally

Use Node.js 20.19+ or a supported newer LTS release.

```bash
npm ci
npm run dev
```

Open [localhost:3000](http://localhost:3000). Development runs at the root path.

```bash
npm test
npm run lint
npm run build
npm audit
```

The production build generates `out/` for GitHub Pages and uses `/nikhil-sai-nethi-portfolio/` as its base path. Serve that directory at the matching URL prefix when testing the production export locally. `next start` is not used with static export.

### Rebuilding the 3D model

`public/models/datacentre.glb` is generated, not hand-edited. With [Blender](https://www.blender.org/) 4.2 or newer installed:

```bash
npm run model
```

This runs `tools/blender/build_datacentre.py` headless (geometry, Cycles light bake into vertex colours, glTF export) and compresses the result with meshopt (`@gltf-transform/cli`, fetched by `npx` at a pinned version when the script runs, so it is not part of `npm ci`). Set `BLENDER` to the Blender binary if it is not at the default macOS path, `SAMPLES` to change bake quality, and `PREVIEW=/path/to.png` to also save a Cycles render of the scene.

The existing GitHub Actions workflow publishes `out/` when changes reach `main`. The production URL is [nikhilsainethi.github.io/nikhil-sai-nethi-portfolio](https://nikhilsainethi.github.io/nikhil-sai-nethi-portfolio/).

## Implementation map

| Location | Responsibility |
| --- | --- |
| `components/infrastructure/InfrastructureShell.tsx` | Navigation, theme, motion preferences, static fallback, footer |
| `components/infrastructure/InfrastructurePortfolio.tsx` | Observability hero, featured experience, profile, optional model lab, and legacy pages |
| `components/infrastructure/CinematicHero.tsx` | Full-screen introduction, pointer/scroll interaction, accessible scene slider, experience highlights |
| `components/infrastructure/CinematicInfrastructure.tsx` | SVG server aisle: first paint and the fallback when WebGL is unavailable |
| `components/infrastructure/SceneCanvas.tsx` | Lazy-loads a WebGL scene, feeds it progress/pointer/visibility/theme, falls back safely (`DatacentreCanvas.tsx` names the two scenes) |
| `components/infrastructure/three/createDatacentreScene.ts` | Three.js scene: instanced cabinets, LED and signal shaders, floor reflections, bloom, render loop |
| `components/infrastructure/three/createStoryScene.ts` | Three.js diorama for the story: orthographic camera registered to the SVG, signal beams, request flow |
| `components/infrastructure/three/shared.ts` | Model loading and the LED / alert shaders used by both scenes |
| `tools/blender/build_datacentre.py` | Generates and light-bakes the data-centre model in Blender |
| `lib/cinematic-scene.ts` | Bounded scene timeline and perspective projection |
| `lib/datacentre-scene.ts` | Camera walk, cabinet slot parsing, and render-resolution rules for the WebGL aisle |
| `components/infrastructure/ObservabilityStory.tsx` | Scroll-driven infrastructure and telemetry narrative |
| `components/infrastructure/ObservabilityLab.tsx` | Interactive synthetic monitoring and diagnosis UI |
| `lib/observability-story.ts` | Story timeline and the SVG-to-3D registration maths |
| `lib/observability.ts` | Deterministic request fixtures and calculated monitoring metrics |
| `components/infrastructure/RackScene.tsx` | Retained standalone interactive isometric illustration |
| `components/infrastructure/ModelLab.tsx` | Interactive model inspection and validation UI |
| `lib/machine-model.ts` | Typed fixtures, deterministic validation, immutable fault injection, revision diffs |
| `components/infrastructure/infrastructure.css` | Shared design system and responsive layout |
| `lib/site.ts` | Public identity, metadata, and base-path-safe assets |
| `lib/social-image.tsx` | Code-generated 1200×630 sharing image |
| `app/social-preview.png/route.tsx` | Static PNG route with a file extension suitable for static hosting |

The previous `components/portfolio/` files are retained as source history but are no longer rendered by the redesigned pages. Existing `/projects/`, `/experience/`, `/tech-stack/`, and `/contact/` routes use the new design.

## Demo boundaries

Both labs run entirely in the browser. Requests, telemetry, models, and error scenarios are synthetic. The examples do not connect to Google infrastructure, represent an internal UHM-M architecture or telemetry stack, operate a real fleet, or report production performance. Monitoring thresholds are illustrative scenario settings, not claimed Google SLOs. Experience summaries preserve the original portfolio’s claims without inventing achievements.

JSON export creates a standard browser download. Some embedded browsers cancel file downloads; **View JSON** provides a selectable copy of the same current model, including any injected fault.

## Design references

[Transitions.dev](https://transitions.dev/) informed panel transitions, selection feedback, and disclosure timing. [MotionSites](https://motionsites.ai/) informed composition and visual hierarchy. The illustration, layout, and code are original; no premium template assets are included.

The supplied Mainframe reference informed pointer-scrub interaction, staged text, and pill actions. Its agency content, remote video, and fonts are not used. The hero uses local code-generated SVG geometry and existing fonts, with no additional runtime dependencies or media downloads.

## Verification

Final verification: **62 tests passed**, ESLint passed, the production static export built successfully, and `npm audit` reported **0 vulnerabilities**.

Automated tests cover pointer scrubbing and clamping, touch/control exclusion, paused and manual scene controls, perspective projection, monitoring calculations and invalid samples, incident diagnosis and recovery, trace/log correlation, story controls and reduced motion, initial deep links after hydration, fixture integrity, missing references, duplicate IDs and slots, containment cycles, permitted connectivity cycles, immutable changes, real revision differences, inspection, repair focus, export contents, and React hydration with reduced motion.

Browser checks cover native scroll progression, direct story-stage selection, synthetic incident investigation/recovery, desktop, tablet, and narrow phone layouts; both themes; navigation and Escape focus; rack selection; fault → validation → repair; revision changes; case-study expansion; system reduced motion; no-JavaScript visibility; and production base-path assets. The synthetic model JSON is additionally available for inspection in the page.

The scroll story also works in the 736px-wide app preview. Pausing mid-story preserves its position; initial experience links land correctly after desktop hydration. The final production preview loaded without browser warnings or errors.

The cinematic hero was visually checked at 1440px, 1280px, 390px, and 320px widths. Pointer input updates the actual scene; pause freezes it; the keyboard slider still selects a pose. Reduced-motion and no-JavaScript views retain readable text and complete geometry.
