# NELSON Asset Strategy — Sprint Portfolio Site

Two-page Next.js site for the NELSON Asset Strategy Amenity Sprint product.

```
/ .......................... Landing page (AmenitySprint component)
/projects/[slug] ........... Project case study pages (ProjectPage component)
```

---

## Deploy to Vercel (5 minutes)

### Step 1 — Push to GitHub
1. Create a new **private** GitHub repository called `nelson-sprint-site`
2. Drag the contents of this folder (not the folder itself) into the GitHub web UI
3. Commit with message: `initial deploy`

### Step 2 — Connect to Vercel
1. Go to [vercel.com](https://vercel.com) → Add New Project
2. Import from GitHub → select `nelson-sprint-site`
3. Framework: **Next.js** (auto-detected)
4. Root directory: leave blank
5. Click **Deploy**

Vercel auto-deploys on every commit to `main`. No config needed.

---

## File Structure

```
nelson-sprint-site/
├── app/
│   ├── layout.jsx              ← Poppins font, global metadata
│   ├── page.jsx                ← Landing page route (/)
│   └── projects/
│       └── [slug]/
│           └── page.jsx        ← Dynamic project route (/projects/55-west-monroe)
├── components/
│   ├── AmenitySprint.jsx       ← Landing page component
│   ├── ProjectPage.jsx         ← Project case study component
│   └── ConceptPhase.jsx        ← Concept phase section (diagnosis-first)
├── lib/
│   └── projects.js             ← ⭐ ALL project data lives here
└── public/
    └── images/
        └── [slug]/             ← Drop project photography here
```

---

## Adding or Updating a Project

**All data lives in one file: `lib/projects.js`**

### 1. Add a new project entry

Copy this template into the `PROJECTS` object in `lib/projects.js`:

```js
"your-slug-here": {
  slug: "your-slug-here",
  name: "BUILDING NAME",
  tagline: "The Concept Name",         // e.g. "The Urban Eddy"
  location: "City, ST",
  tag: "Building Reposition",          // or "Amenity Study", "Campus & Master Plan"
  size: "M",                           // S | M | L | XL
  sprintDuration: "3 Weeks",
  investment: "$8K–$10K",
  sqft: "000,000",
  floors: 00,
  class: "Class A",
  year: "2024",
  cardImage: "/images/your-slug/card.jpg",
  heroImage: "/images/your-slug/hero.jpg",

  unlockHeadline: "One sentence. The thing the building couldn't do before.",
  unlockSub: "Two sentences max. What the sprint made possible.",

  stats: [
    { value: 00, suffix: "%", label: "Vacancy Reduction", context: "supporting detail" },
    { value: 00, suffix: "×", label: "Metric Name",       context: "supporting detail" },
    { value: 00, suffix: "%", label: "Rent Premium",      context: "supporting detail" },
    { value: 00, suffix: " mo", label: "Sprint to X",    context: "supporting detail" },
  ],

  concept: {
    // ⭐ These 4 findings should be SPECIFIC to this building — not generic sprint steps
    diagnosis: [
      { label: "The Problem",        finding: "What was broken. Be specific — vacancy %, tenant complaints, dead zones.", color: "#FF7F40" },
      { label: "The Asset",          finding: "What you found that nobody was using. Floor plate, views, connection, etc.", color: "#00BADC" },
      { label: "The Market Signal",  finding: "What the competitive landscape said about the opportunity.", color: "#18988B" },
      { label: "The Unlock Insight", finding: "The idea that changed everything. One sentence — the reframe.", color: "#FFD53D" },
    ],
    narrative: "One paragraph. Tell the sprint story in plain language. What did you do, what did you discover, what did you deliver.",
    deliverables: [
      "Deliverable name",
      "Deliverable name",
      // ...up to 8
    ],
    conceptPhotos: [
      { label: "Photo description", aspect: "16/9", src: "/images/your-slug/concept-analysis.jpg" },
      { label: "Photo description", aspect: "4/3",  src: "/images/your-slug/sketch-a.jpg" },
      { label: "Photo description", aspect: "4/3",  src: "/images/your-slug/sketch-b.jpg" },
      { label: "Photo description", aspect: "4/3",  src: "/images/your-slug/moodboard.jpg" },
      { label: "Photo description", aspect: "4/3",  src: "/images/your-slug/design-language.jpg" },
      { label: "Photo description", aspect: "16/9", src: "/images/your-slug/rendering.jpg" },
    ],
  },

  // Journey: phases are "Sprint" | "Design" | "Build" | "Outcome"
  journey: [
    { phase: "Sprint",  week: "Week 1", label: "Step name", desc: "What happened." },
    { phase: "Sprint",  week: "Week 2", label: "Step name", desc: "What happened." },
    { phase: "Sprint",  week: "Week 3", label: "Step name", desc: "What happened." },
    { phase: "Design",  week: "Month 2", label: "Step name", desc: "What happened." },
    { phase: "Build",   week: "Month 3–5", label: "Step name", desc: "What happened." },
    { phase: "Outcome", week: "Month 6+", label: "Step name", desc: "What happened." },
  ],

  // Gallery: size options are "hero" (full width), "large" (2/3), "medium" (1/3), "small" (1/3 short)
  gallery: [
    { label: "Description", size: "hero",   aspect: "21/9", src: "/images/your-slug/gallery-hero.jpg" },
    { label: "Description", size: "large",  aspect: "3/2",  src: "/images/your-slug/gallery-2.jpg" },
    { label: "Description", size: "small",  aspect: "3/4",  src: "/images/your-slug/gallery-3.jpg" },
    { label: "Description", size: "small",  aspect: "3/4",  src: "/images/your-slug/gallery-4.jpg" },
    { label: "Description", size: "medium", aspect: "4/3",  src: "/images/your-slug/gallery-5.jpg" },
    { label: "Description", size: "medium", aspect: "4/3",  src: "/images/your-slug/gallery-6.jpg" },
  ],

  // Testimonials: type is "owner" | "leasing" | "tenant"
  testimonials: [
    { quote: "Quote.", name: "First L.", role: "Title", org: "Company", type: "owner" },
    { quote: "Quote.", name: "First L.", role: "Title", org: "Company", type: "leasing" },
    { quote: "Quote.", name: "First L.", role: "Title", org: "Company", type: "tenant" },
  ],

  related: ["slug-1", "slug-2", "slug-3"],
},
```

### 2. Add it to the landing page grid

Open `lib/projects.js` and add your slug to `FEATURED_SLUGS`:

```js
export const FEATURED_SLUGS = [
  "55-west-monroe",
  "your-slug-here",   // ← add here
  // ...
];
```

### 3. Add photography

Drop images into `/public/images/[your-slug]/`. Filenames match the `src` fields in your project data.

**Recommended image specs:**
- Card image: 800×600px, 16:9 crop, JPG 80%
- Hero image: 1600×900px, JPG 80%
- Gallery hero: 1800×750px (21:9), JPG 80%
- Gallery large: 1200×800px (3:2), JPG 80%
- Gallery medium/small: 800×600px or 600×800px, JPG 80%
- Concept photos: 1200×675px (16:9) or 800×600px (4:3), JPG 80%

**If `src` is `null`**, the component shows a styled placeholder automatically — safe to deploy without images.

---

## Concept Phase — The Diagnosis Model

The concept phase section is built around **4 sprint findings** specific to each building:

| Field | What to write |
|-------|--------------|
| `The Problem` | Specific vacancy %, dead zones, or leasing pain — this building, not a generic problem |
| `The Asset` (or similar) | What you found that was underutilized — floor plate, views, connection point, etc. |
| `The Market Signal` | What the competitive audit showed — what the market was missing |
| `The Unlock Insight` | The one idea that changed everything — your reframe sentence |

These should feel like you're taking a prospect on the diagnostic walk-through. Avoid generic language like "we analyzed the space" — say what you actually found.

---

## Landing Page ↔ Project Page Connection

The landing page project cards automatically link to `/projects/[slug]` when you hover/click them. The slug used in the card must match a key in `PROJECTS` in `lib/projects.js`.

The landing page reads from `FEATURED_SLUGS` to determine which projects to show and in what order.

---

## Local Development

```bash
npm install
npm run dev
# Open http://localhost:3000
```
