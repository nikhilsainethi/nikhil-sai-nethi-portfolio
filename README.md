# Nikhil Sai Nethi — Infrastructure Portfolio

A data-centre-inspired redesign built around the physical systems, hardware models, and platform tooling behind reliable infrastructure. The Google role is presented as **incoming**; the interactive lab is an independent personal demonstration using synthetic hardware.

## Explore

- **Interactive rack scene:** original SVG cabinets for accelerator, ARM, and x86 systems; animated assembly, connection drawing, keyboard selection, and an architecture inspector.
- **Machine-model lab:** inspect entities and relationships, switch platform/revision, introduce a missing reference or duplicate slot, validate, repair, compare revisions, and export or view the current JSON.
- **Lifecycle explorer:** Design → Validate → Serve → Repair, with changing diagrams and explanations.
- **Selected work:** four expandable case studies from Nokia, Moody’s, and Verisk, grounded in the original portfolio’s experience.
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

The existing GitHub Actions workflow publishes `out/` when changes reach `main`. This redesign has been prepared on a local feature branch; it has not been pushed or deployed.

## Implementation map

| Location | Responsibility |
| --- | --- |
| `components/infrastructure/InfrastructureShell.tsx` | Navigation, theme, motion preferences, static fallback, footer |
| `components/infrastructure/InfrastructurePortfolio.tsx` | Hero, lifecycle, work, profile, contact, and legacy page wrappers |
| `components/infrastructure/RackScene.tsx` | Original interactive isometric illustration |
| `components/infrastructure/ModelLab.tsx` | Interactive model inspection and validation UI |
| `lib/machine-model.ts` | Typed fixtures, deterministic validation, immutable fault injection, revision diffs |
| `components/infrastructure/infrastructure.css` | Shared design system and responsive layout |
| `lib/site.ts` | Public identity, metadata, and base-path-safe assets |
| `lib/social-image.tsx` | Code-generated 1200×630 sharing image |
| `app/social-preview.png/route.tsx` | Static PNG route with a file extension suitable for static hosting |

The previous `components/portfolio/` files are retained as source history but are no longer rendered by the redesigned pages. Existing `/projects/`, `/experience/`, `/tech-stack/`, and `/contact/` routes use the new design.

## Demo boundaries

The lab runs entirely in the browser. Its entities, relationships, revisions, and error scenarios are synthetic. It does not connect to Google infrastructure, represent an internal UHM-M schema, operate a real fleet, or claim production-scale serving performance. The lifecycle is a conceptual explanation. Experience summaries preserve the original portfolio’s claims without adding invented achievements or metrics.

JSON export creates a standard browser download. Some embedded browsers cancel file downloads; **View JSON** provides a selectable copy of the same current model, including any injected fault.

## Design references

[Transitions.dev](https://transitions.dev/) informed panel transitions, selection feedback, and disclosure timing. [MotionSites](https://motionsites.ai/) informed composition and visual hierarchy. The illustration, layout, and code are original; no premium template assets are included.

## Verification

Final checks: **25 tests passed**, ESLint passed, the static production build passed, and `npm audit` reported **0 vulnerabilities**. Production routes, résumé, portrait, and the PNG sharing image returned HTTP 200 at the repository base path.

Automated tests cover fixture integrity, missing references, duplicate IDs and slots, containment cycles, permitted connectivity cycles, immutable changes, real revision differences, inspection, repair focus, export contents, and React hydration with reduced motion.

Browser checks cover desktop, tablet, and narrow phone layouts; both themes; navigation and Escape focus; rack selection; fault → validation → repair; revision changes; case-study expansion; system reduced motion; no-JavaScript visibility; and production base-path assets. The synthetic model JSON is additionally available for inspection in the page.
