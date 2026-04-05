# GitHub Pages and Social Preview Design

## Summary

This change will make the portfolio publish cleanly at the repository-scoped GitHub Pages URL:

`https://nikhilsainethi.github.io/nikhil-sai-nethi-portfolio/`

It will also add a polished social preview card so links shared on LinkedIn, X, Slack, and GitHub render with strong metadata and a branded visual.

## Goals

- Publish the existing Next.js portfolio through GitHub Pages using GitHub Actions.
- Preserve the current single-page editorial design and content.
- Keep the deployment path compatible with a repository subpath.
- Add Open Graph and Twitter metadata that points to the GitHub Pages site URL.
- Generate a social card that matches the portfolio’s slate-and-accent visual system.

## Approach

### Deployment

The portfolio will use a static export build. The app will be configured with:

- `output: "export"` so the site builds into a static `out/` directory
- a production `basePath` of `/nikhil-sai-nethi-portfolio`
- GitHub Actions deployment using the official Pages workflow pattern

This matches the repository-scoped Pages URL and avoids introducing runtime requirements that GitHub Pages cannot host.

### Social Preview

The site will use App Router metadata and metadata image file conventions. A generated Open Graph image and Twitter image will be added so the preview stays aligned with the site copy and visual identity without depending on a manually maintained asset.

The social card will include:

- Nikhil Sai Nethi
- Software Engineer positioning
- Cloud, observability, and AI/LLM focus
- Charlotte, NC
- Monochrome structure with a muted orange accent

## Files Expected to Change

- `next.config.ts`
- `app/layout.tsx`
- `app/opengraph-image.tsx`
- `app/twitter-image.tsx`
- `.github/workflows/deploy-pages.yml`
- supporting metadata or constants files if useful for testing

## Testing Strategy

- Add a regression test around any extracted site URL and base path metadata constants.
- Run `npm run lint`.
- Run `npm test`.
- Run `npm run build` and confirm the static export succeeds.

## Risks and Mitigations

- Base path regressions:
  centralize the site URL and repository path so links and metadata stay consistent.
- GitHub Pages workflow drift:
  use the official workflow structure with `configure-pages`, artifact upload, and `deploy-pages`.
- Social card inconsistencies:
  generate the image from code instead of relying on a separate manually edited asset.

## Deferred Work

- Custom domain support is intentionally deferred.
- Vercel deployment is intentionally deferred.
