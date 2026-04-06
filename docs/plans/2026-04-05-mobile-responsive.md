# Mobile Responsive Redesign Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make the current portfolio feel polished and intentional on mobile while preserving the existing desktop site and GitHub Pages deployment path.

**Architecture:** First realign the stale test suite with the current approved runtime behavior so the worktree has a trustworthy baseline. Then add a mobile-specific header shell, tighten the hero layout on small screens, and rebalance dense section cards so the responsive experience feels designed rather than compressed.

**Tech Stack:** Next.js App Router, TypeScript, Tailwind CSS, Vitest, React Icons

---

### Task 1: Restore a trustworthy baseline test suite

**Files:**
- Modify: `lib/site.test.ts`
- Modify: `app/page.test.tsx`
- Reference: `lib/site.ts`
- Reference: `app/page.tsx`

**Step 1: Keep the failing tests as the reproduction**

Run: `npm test -- lib/site.test.ts app/page.test.tsx`

Expected: FAIL because the tests still expect older hero labels and production-only resume path behavior.

**Step 2: Write minimal test updates**

Update `lib/site.test.ts` so it asserts the contract that actually exists:

- `resumePath` equals `withBasePath("/nikhil-sai-nethi-resume.pdf")`
- it does not hardcode the production-expanded path inside the test environment

Update `app/page.test.tsx` so it matches the current hero:

- role/copy checks reflect the current text
- CTA assertions reflect the current route-level button label
- portrait assertions use the real image alt text and current layout hooks

**Step 3: Re-run targeted tests**

Run: `npm test -- lib/site.test.ts app/page.test.tsx`

Expected: PASS

**Step 4: Commit**

```bash
git add lib/site.test.ts app/page.test.tsx
git commit -m "test: realign stale hero and site metadata tests"
```

### Task 2: Add mobile header behavior without disturbing desktop

**Files:**
- Modify: `components/portfolio/Header.tsx`
- Modify: `components/portfolio/Header.test.tsx`

**Step 1: Write the failing test**

Add header tests that prove:

- GitHub Pages path normalization still marks active routes correctly
- the mobile menu can be opened and exposes the primary nav plus resume CTA

**Step 2: Run targeted test**

Run: `npm test -- components/portfolio/Header.test.tsx`

Expected: FAIL because the current header has no explicit mobile menu behavior.

**Step 3: Write minimal implementation**

Update `Header.tsx` so that:

- desktop keeps the existing three-zone layout
- small screens show a compact brand plus menu toggle shell
- the mobile menu reveals nav links and the resume CTA cleanly
- active route highlighting works for normalized GitHub Pages paths with trailing slashes

**Step 4: Re-run targeted test**

Run: `npm test -- components/portfolio/Header.test.tsx`

Expected: PASS

**Step 5: Commit**

```bash
git add components/portfolio/Header.tsx components/portfolio/Header.test.tsx
git commit -m "feat: add mobile navigation shell"
```

### Task 3: Tighten the home hero for phones

**Files:**
- Modify: `app/page.tsx`
- Modify: `app/page.test.tsx`

**Step 1: Extend the failing test**

Add assertions that the home page:

- stacks the hero content in a mobile-first order
- keeps CTA controls in a wrapping row
- keeps the portrait card constrained and metadata cards in a grid

**Step 2: Run targeted test**

Run: `npm test -- app/page.test.tsx`

Expected: FAIL until the mobile hero classes and structure are updated.

**Step 3: Write minimal implementation**

Update `app/page.tsx` so that:

- the hero uses tighter small-screen spacing
- the portrait card remains contained and does not dominate the viewport
- CTAs wrap cleanly
- background and card padding feel lighter on phones without changing desktop hierarchy

**Step 4: Re-run targeted test**

Run: `npm test -- app/page.test.tsx`

Expected: PASS

**Step 5: Commit**

```bash
git add app/page.tsx app/page.test.tsx
git commit -m "feat: refine mobile home hero layout"
```

### Task 4: Rebalance dense cards and mobile atmosphere

**Files:**
- Modify: `components/portfolio/Skills.tsx`
- Modify: `app/globals.css`

**Step 1: Define the failing behavior**

Treat this as responsive UI behavior verified through existing render tests plus the production build. The failure signal is cramped content and overflow-prone density on small screens.

**Step 2: Write minimal implementation**

Update the tech-stack cards and shared CSS so that:

- mobile cards are more rectangular and evenly stacked
- chip content wraps neatly
- decorative glows and spacing are slightly reduced on phones
- desktop appearance remains substantially unchanged

**Step 3: Verify locally**

Run: `npm test -- app/page.test.tsx components/portfolio/Header.test.tsx`

Expected: PASS

**Step 4: Commit**

```bash
git add components/portfolio/Skills.tsx app/globals.css
git commit -m "style: polish mobile card layout and atmosphere"
```

### Task 5: Final verification and publish

**Files:**
- Review: `components/portfolio/Header.tsx`
- Review: `app/page.tsx`
- Review: `components/portfolio/Skills.tsx`
- Review: `app/globals.css`
- Review: updated tests

**Step 1: Run full verification**

Run:

```bash
npm run lint
npm test
npm run build
```

Expected: all commands pass.

**Step 2: Integrate**

If verification passes, merge or cherry-pick the worktree branch back to `main`.

**Step 3: Push**

Run:

```bash
git push origin main
```

Expected: push succeeds and GitHub Pages deploy starts.

**Step 4: Verify deployment**

Check the GitHub Pages action run and confirm the live site renders the updated responsive behavior.

**Step 5: Clean up**

Remove the worktree and delete the temporary branch after the live deploy is confirmed.
