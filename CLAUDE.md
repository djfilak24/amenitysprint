# NELSON Amenity Sprint — Claude Code Project Context

## What This Is

A Next.js 15 marketing site for NELSON Asset Strategy's "Amenity Sprint" consulting service. Commercial real estate amenity repositioning — rapid concept design in 2–6 weeks. The site showcases 10 case study projects with a cinematic dark editorial aesthetic.

## Design System

This project uses a **custom variant** of the "Cinematic Landing Page Builder" design system (Preset B — Midnight Luxe, adapted). Invoke the `/cinematic-landing` skill when designing or iterating sections.

### NELSON Palette (always use these exact values)

| Token | Hex | Usage |
|-------|-----|-------|
| Base BG | `#1e2022` | Page background |
| Section BG | `#242628` | Section lift |
| Footer BG | `#191b1d` | Footer |
| Cyan | `#00BADC` | Primary accent, M-tier |
| Teal | `#18988B` | S-tier |
| Orange | `#FF7F40` | L-tier |
| Gold | `#FFD53D` | Highlight accent |
| Purple | `#4C0049` | XL-tier |
| Border | `rgba(255,255,255,0.07)` | Subtle dividers |
| Text dim | `rgba(255,255,255,0.38)` | Secondary text |

### Typography

- **Font:** Poppins only (weights 300, 400, 500, 600, 700, 800) — loaded via Google Fonts in `app/layout.jsx`
- No system fonts. No Inter. No Roboto.
- Drama headings: Poppins 700–800 with tight letter-spacing
- Data labels: Poppins 500, uppercase, `letter-spacing: 0.1em`

### Styling Rules

- **Inline React style objects only** — no CSS files, no CSS modules, no Tailwind custom values
- All containers: `borderRadius: '1.5rem'` to `'3rem'` — no `8px` corners
- Buttons: magnetic hover via CSS transition (`transform: scale(1.03)`)
- Cards: `translateY(-4px)` + shadow intensification on hover

### Animation Rules

- **IntersectionObserver** for scroll reveals — threshold `0.15`, fade-up `40px`
- **requestAnimationFrame** for count-up number animations
- **CSS transitions** for all micro-interactions — no GSAP, no Framer Motion
- Stagger delays: `0.08s` for text, `0.15s` for cards
- Noise overlay: SVG `<feTurbulence>` at `opacity: 0.04`, fixed, `z-index: 9999`

## Project Structure

```
app/
  layout.jsx          ← Root layout, Poppins font, global metadata
  page.jsx            ← Home — imports AmenitySprint.jsx
  projects/[slug]/
    page.jsx          ← Dynamic project route, static generation
  api/blob/
    upload/route.ts   ← POST: upload file to Vercel Blob
    list/route.ts     ← GET: list all Blob files

components/
  AmenitySprint.jsx   ← Landing page (~1400 lines): hero, process, tiers, gallery, testimonials
  ProjectPage.jsx     ← Project detail (~600 lines): stats, concept, journey, gallery
  ConceptPhase.jsx    ← Concept findings + deliverables section

lib/
  projects.js         ← Single source of truth for all project data (10 projects)

scripts/
  extract-pdf-images.py  ← PDF → PNG extraction (Python, uses pdf2image)
```

## Data Flow

All project content flows from `lib/projects.js`:
- `generateStaticParams` in `app/projects/[slug]/page.jsx` reads slugs
- `ProjectPage` component receives the full project object as a prop
- Adding a project = add an entry to `lib/projects.js` matching the existing schema

The fully-populated example is `55-west-monroe`. Use it as the template when adding new projects.

## Service Tiers

| Tier | Label | Color | Price | Duration |
|------|-------|-------|-------|----------|
| S | Targeted | `#18988B` | $2K–$6K | 2–3 weeks |
| M | Strategic | `#00BADC` | $5K–$10K | 2.5–4 weeks |
| L | Comprehensive | `#FF7F40` | $8K–$15K | 4–6 weeks |
| XL | Transformative | `#4C0049` | Custom | 6+ weeks |

## Vercel Blob Storage

Already configured. Use the existing API routes:
- Upload: `POST /api/blob/upload` with `file` + `folder` fields
- List: `GET /api/blob/list`
- Env var: `BLOB_READ_WRITE_TOKEN` (set in Vercel dashboard, available locally via `.env.local`)

## Git Workflow

- **Active branch:** `claude/build-product-pages-jKVHL`
- Always run `npm run build` before pushing — must pass with zero errors
- Push with: `git push -u origin claude/build-product-pages-jKVHL`
- Never push to `main` directly

## Anti-Patterns (Project-Specific)

These have caused Vercel deploy failures before:
- Adding `"use client"` to a file that uses Next.js server features
- Importing `@vercel/blob` in client components (server-only)
- Using `localStorage` or `window` without checking `typeof window !== 'undefined'`

Design anti-patterns (from the design system — enforce these):
- Generic gradient hero (purple-to-blue with centered text)
- Icon + heading + paragraph cards with no interaction
- `border-radius: 8px` anywhere
- Static sections with no animation or micro-interaction
- Centered everything (left-anchor content is the house style)

## When Building New Sections

1. Invoke `/cinematic-landing` skill for design system reference
2. Follow the existing inline-style pattern in `AmenitySprint.jsx` — no new styling approaches
3. Wire new sections to data from `lib/projects.js` where possible
4. Test with `npm run build` before committing
