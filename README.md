# Nikhil Sai Nethi Portfolio

A single-page portfolio built with Next.js App Router, Tailwind CSS, Framer Motion, and React Icons.

## Highlights

- Editorial, text-forward layout for cloud infrastructure and AI/LLM work
- Sticky anchor navigation for `About`, `Experience`, `Tech Stack`, `Updates`, and `Contact`
- Vertical experience timeline focused on Moody's, Verisk, and Nokia
- Structured engineering log feed backed by [`data/updates.js`](./data/updates.js)
- Resume download asset served from [`public/nikhil-sai-nethi-resume.pdf`](./public/nikhil-sai-nethi-resume.pdf)
- Component tests with Vitest and Testing Library

## Local Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Verification

```bash
npm run lint
npm test
npm run build
```

## Stack

- Next.js 16 App Router
- React 19
- Tailwind CSS 4
- Framer Motion
- React Icons
- Vitest + Testing Library

## Content Sources

- Resume content was adapted from the supplied DOCX source.
- The downloadable PDF was generated locally from the same resume source for the portfolio CTA.
