# GitHub Pages and Social Preview Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Publish the portfolio at the GitHub Pages repository URL and add a polished share preview that reflects the site’s visual identity.

**Architecture:** Extract the repository path and site URL into a small shared metadata module, test that contract first, and then wire those values into the Next.js export config and the layout metadata. Add code-generated Open Graph and Twitter image routes that match the existing monochrome editorial design, and finish with an official GitHub Pages workflow that deploys the exported `out/` directory from `main`.

**Tech Stack:** Next.js App Router, TypeScript, Vitest, GitHub Actions, Next.js metadata image routes

---

### Task 1: Extract and test shared site metadata

**Files:**
- Create: `lib/site.ts`
- Create: `lib/site.test.ts`

**Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { basePath, repoName, siteUrl } from "./site";

describe("site metadata", () => {
  it("defines the GitHub Pages repository path and absolute site URL", () => {
    expect(repoName).toBe("nikhil-sai-nethi-portfolio");
    expect(basePath).toBe("/nikhil-sai-nethi-portfolio");
    expect(siteUrl).toBe(
      "https://nikhilsainethi.github.io/nikhil-sai-nethi-portfolio/",
    );
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- lib/site.test.ts`

Expected: FAIL because `./site` does not exist yet.

**Step 3: Write minimal implementation**

```ts
export const repoName = "nikhil-sai-nethi-portfolio";
export const basePath = `/${repoName}`;
export const siteUrl = `https://nikhilsainethi.github.io/${repoName}/`;
```

**Step 4: Run test to verify it passes**

Run: `npm test -- lib/site.test.ts`

Expected: PASS

**Step 5: Commit**

```bash
git add lib/site.ts lib/site.test.ts
git commit -m "test: add shared site metadata constants"
```

### Task 2: Wire the GitHub Pages export configuration

**Files:**
- Modify: `next.config.ts`
- Test: `lib/site.test.ts`

**Step 1: Extend the failing test**

Add assertions that make the production deployment assumptions explicit in the shared module contract, for example that `basePath` starts with `/` and the site URL ends with `/`.

```ts
expect(basePath.startsWith("/")).toBe(true);
expect(siteUrl.endsWith("/")).toBe(true);
```

**Step 2: Run test to verify it still passes**

Run: `npm test -- lib/site.test.ts`

Expected: PASS. This confirms the contract before wiring config.

**Step 3: Write minimal implementation**

Update `next.config.ts` to import `basePath` and configure:

```ts
const isProduction = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  basePath: isProduction ? basePath : undefined,
};
```

**Step 4: Run the build to verify export configuration**

Run: `npm run build`

Expected: PASS and generate an `out/` directory.

**Step 5: Commit**

```bash
git add next.config.ts lib/site.test.ts
git commit -m "build: configure Next.js for GitHub Pages export"
```

### Task 3: Add site metadata and canonical social tags

**Files:**
- Modify: `app/layout.tsx`
- Create: `app/layout.test.tsx`
- Reuse: `lib/site.ts`

**Step 1: Write the failing test**

```ts
import { metadata } from "./layout";
import { siteUrl } from "@/lib/site";

describe("layout metadata", () => {
  it("publishes canonical Open Graph and Twitter metadata for GitHub Pages", () => {
    expect(metadata.metadataBase?.toString()).toBe(siteUrl);
    expect(metadata.openGraph?.images?.[0]).toMatchObject({
      url: `${siteUrl}opengraph-image`,
      width: 1200,
      height: 630,
    });
    expect(metadata.twitter?.images).toContain(`${siteUrl}twitter-image`);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- app/layout.test.tsx`

Expected: FAIL because the richer metadata is not defined yet.

**Step 3: Write minimal implementation**

Update `app/layout.tsx` to:

- import `siteUrl`
- set `metadataBase`
- preserve the current title and description
- add `alternates.canonical`
- add `openGraph`
- add `twitter`

Use absolute URLs based on `siteUrl`.

**Step 4: Run test to verify it passes**

Run: `npm test -- app/layout.test.tsx`

Expected: PASS

**Step 5: Commit**

```bash
git add app/layout.tsx app/layout.test.tsx lib/site.ts
git commit -m "feat: add canonical metadata for social sharing"
```

### Task 4: Add generated Open Graph and Twitter images

**Files:**
- Create: `app/opengraph-image.tsx`
- Create: `app/twitter-image.tsx`
- Reuse: `lib/site.ts`

**Step 1: Define the failing behavior**

Because metadata image routes are framework-driven file conventions, treat this as a behavior verified by the production build rather than a unit test. The failure check is the build itself after the files are added.

**Step 2: Run baseline build**

Run: `npm run build`

Expected: PASS before the new image routes are added.

**Step 3: Write minimal implementation**

Create code-generated image routes that:

- export `alt`
- export `size = { width: 1200, height: 630 }`
- export `contentType = "image/png"`
- use `ImageResponse` from `next/og`
- render a slate background, subtle grid accents, a muted orange rule, and the portfolio copy

`twitter-image.tsx` can reuse the same composition.

**Step 4: Run build to verify it passes with the new routes**

Run: `npm run build`

Expected: PASS with the image routes statically generated.

**Step 5: Commit**

```bash
git add app/opengraph-image.tsx app/twitter-image.tsx
git commit -m "feat: add generated social preview images"
```

### Task 5: Add GitHub Pages deployment workflow

**Files:**
- Create: `.github/workflows/deploy-pages.yml`

**Step 1: Define the failing behavior**

Treat the workflow as configuration. The failure signal is missing deployment automation, so verification happens through a local build and the pushed workflow file.

**Step 2: Write minimal implementation**

Create the workflow using the official GitHub Pages actions pattern:

- trigger on pushes to `main`
- permissions for `pages` and `id-token`
- concurrency protection
- `actions/checkout`
- `actions/setup-node`
- `npm ci`
- `npm run build`
- `actions/configure-pages`
- `actions/upload-pages-artifact` with `out`
- `actions/deploy-pages`

**Step 3: Verify locally**

Run: `npm run build`

Expected: PASS, confirming the workflow’s build command matches the local build.

**Step 4: Commit**

```bash
git add .github/workflows/deploy-pages.yml
git commit -m "ci: add GitHub Pages deployment workflow"
```

### Task 6: Final verification and publish

**Files:**
- Review: `app/layout.tsx`
- Review: `app/opengraph-image.tsx`
- Review: `app/twitter-image.tsx`
- Review: `next.config.ts`
- Review: `.github/workflows/deploy-pages.yml`

**Step 1: Run full verification**

Run: `npm run lint`

Expected: PASS

**Step 2: Run full test suite**

Run: `npm test`

Expected: PASS

**Step 3: Run production build**

Run: `npm run build`

Expected: PASS

**Step 4: Publish**

```bash
git add app/layout.tsx app/layout.test.tsx app/opengraph-image.tsx app/twitter-image.tsx next.config.ts .github/workflows/deploy-pages.yml lib/site.ts lib/site.test.ts
git commit -m "feat: ship GitHub Pages deployment and social preview"
git push origin main
```
