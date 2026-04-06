# Mobile Responsive Redesign Design

## Summary

This change will make the existing portfolio feel intentionally designed on phones without splitting the site into a separate mobile build or disturbing the current desktop visual direction. The same GitHub Pages URL will serve both desktop and mobile users, with responsive layout, navigation, spacing, and motion adjustments tuned for smaller screens.

## Goals

- Keep the current live site structure and route map intact.
- Improve mobile usability and polish across the shared shell and key pages.
- Make the header and navigation feel deliberate on phones instead of compressed.
- Keep hero content, cards, and chips inside clear visual boundaries on narrow screens.
- Preserve GitHub Pages compatibility and the current desktop experience.

## Approach

### Shared shell

Mobile should use a compact sticky header with a menu toggle rather than wrapping all navigation links into a cramped pill row. The desktop header can remain close to the current version. The resume CTA should stay prominent, but on phones it should move into the expanded menu so the top bar stays balanced.

### Home page

The home hero should become a clean vertical stack on smaller screens:

- intro label
- name
- role and availability signal
- headline
- summary
- CTAs
- portrait card

The portrait card should stay visually rich, but it should be slightly simpler on mobile with tighter padding, less spill, and contained metadata cards.

### Section pages

Dense page content such as the tech stack cards should keep the current aesthetic but switch to more rectangular, evenly stacked cards on mobile. Chip clouds should wrap cleanly and the decorative background effects should be softened to keep readability high.

### Motion and atmosphere

The site should keep the luminous blue and lilac identity, but on mobile the background glow, oversized spacing, and ornamental movement should be reduced so the content feels crisp and controlled rather than floaty.

## Files Expected to Change

- `components/portfolio/Header.tsx`
- `app/page.tsx`
- `components/portfolio/Skills.tsx`
- `app/globals.css`
- route-level tests covering the header and home page

## Testing Strategy

- Update stale baseline tests to match the current approved runtime behavior.
- Add or extend header tests for active route handling under GitHub Pages paths and mobile navigation behavior.
- Add or extend home-page tests for mobile-friendly hero structure and CTA layout.
- Run `npm run lint`.
- Run `npm test`.
- Run `npm run build`.

## Risks and Mitigations

- Mobile-only changes accidentally affecting desktop:
  keep changes gated by responsive classes and verify key desktop layouts still build cleanly.
- Header complexity on phones:
  use a simple toggle-driven mobile menu instead of forcing the desktop nav into a small space.
- Regressions hidden by stale tests:
  fix the baseline tests first so the suite reflects the real current UI before adding new behavior.
