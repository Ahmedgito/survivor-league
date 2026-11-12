# 01 — Experience Plan: PawPath

> Owner: Experience Director. Status: **blueprint, build from this**. Date: 2026-11-12.
> Read with [EVALUATION.md](../../EVALUATION.md), [PET-MODELS.md](../../PET-MODELS.md) and [RESEARCH-3D.md](../../RESEARCH-3D.md).
> Rule for every line below: if it doesn't earn points on the rubric, it isn't in the plan. The 3D earns **0 points directly**. Its job is to make the brief's "emotionally engaging" true and to lead the user into the task. It must never block the task.

---

## 0. Decisions at a glance

| # | Decision | Rubric line it earns |
|---|---|---|
| 1 | Audience: first-time adopters aged 16–24. Task: find a pet that fits your life, then send an adoption inquiry. | Fit (20) |
| 2 | Signature feature: a **Lifestyle Match** quiz with 4 questions. Results are ranked, and each pet shows **why it fits** plus one honest **heads-up**. | Originality (10), Fit |
| 3 | One dominant CTA per screen: `/` → **Find my match**, profile → **Ask to adopt {name}**, form → **Send my inquiry**. | Usability (20) |
| 4 | The scroll story has 5 chapters plus a landing end panel, which links to the quiz, browse-by-type and how adoption works. Copy is always real HTML on a **solid card**, so contrast never depends on the 3D. | Fit, A11y, Visual |
| 5 | One fixed R3F canvas only on `/`. Each chapter's progress comes from ScrollTrigger, is written into a mutable store, and is damped in `useFrame`. **Text never scrubs.** | A11y, Usability |
| 6 | Catalogue cards use **pre-rendered WebP thumbnails** with real `alt` text on a species-tinted card. Zero WebGL on `/pets`. Live 3D appears only as the profile turntable. | A11y, Perf, Visual |
| 7 | The inquiry is a **dedicated route** (`/adopt/:petId`), not a drawer. That means no focus trap, deep links work, and Back works. The success state is shown in place, with focus moved to it. | Usability, A11y |
| 8 | Light theme only. No dark mode (it is a stretch item and doubles the contrast checks). The story's night chapters already give the dark mood. | Visual, A11y |
| 9 | Reduced motion means no Lenis, no flights, no split text, and the story becomes a static, readable sequence. No WebGL means pre-rendered posters. | A11y (15) |
| 10 | Build order: the flow without any 3D ships first (M1). The 3D is layered on last (M3). | Usability, Deployment |

---

## 1. R&D: what we take from award-quality scroll stories

Techniques only. Nothing is copied.

| Source | What we take |
|---|---|
| **haplollc/3d-scroll-story** (MIT; SKILL.md read in full) | A sticky stage with one pose per step, keyed on whole numbers. Each step "holds, then flies" to the next. A separate **wide and tall** pose set with `setViewOffset` framing. The first frame snaps to the target pose, so loading mid-page doesn't fly in. Render only while the stage is near the viewport. Under reduced motion, snap between poses and draw once per scroll. **We adopt this model almost wholesale.** |
| **Codrops, "How to Build Cinematic 3D Scroll Experiences with GSAP"** (Nov 2025; read from the search abstract, the page returned 403) | One scroll value drives the camera, while **typography beats** are separate tweens with SplitText. We keep camera and text decoupled, but our text reveals play **once** and are never scrubbed. |
| **Codrops, "Reactive Depth: scroll-driven 3D with React Three Fiber"** (Feb 2026) | Shared motion state is read inside `useFrame`, not through React state, so scroll causes **no React re-renders**. This becomes our `storyState` singleton. |
| **Apple product pages** (AirPods / MacBook scrollers, via third-party breakdowns and the GSAP forum) | A tall scroll container with a sticky stage and a 0–1 progress value **per scene**. Copy appears at fixed points. Weak devices get a **single still image** instead of the sequence. This becomes our per-chapter progress and our poster fallback. |
| **"Moves (You)"** (Awwwards element: a 3D character driven by scroll) | The character's movement is tied directly to scroll, so the user feels they are moving it. In Chapter 4 the ground "treadmill" is scroll-bound, so **the user walks Biscuit home**. |
| **Bruno Simon's portfolio** (well-known case study; the page fetch was blocked) | Low-poly worlds look rich with **fake lighting and blob shadows** instead of real-time shadows. We use no shadow maps: a radial-gradient blob sits under each pet (0 KB, cheap on phones). |
| **svilenkovic, "How to make scroll-driven 3D"** | **Detect the device tier before the first scene loads**, serve a lighter scene on weak hardware, and provide a static fallback when WebGL is missing. This becomes our `useDeviceTier` (high / mid / low / none). |

---

## 2. Audience, task, CTA, signature feature (EVALUATION.md §5 format)

```
Brief chosen:        #2  Pet Adoption Platform
Intended audience:   Teens and young adults (16–24) adopting their FIRST pet, often living in a
                     flat or with family, who scroll fast and decide emotionally but need an honest fit.
Primary task:        Find a pet that fits your life and send an adoption inquiry.
Primary action/CTA:  "Find my match" (landing). Then "Ask to adopt {name}" (profile) → "Send my inquiry" (form).
Signature feature:   Lifestyle Match. 4 questions (home, time away, your pace, who lives with you) →
                     pets ranked with a % score, up to 3 "Why it fits" reasons and at most 1 honest
                     "Heads-up" per pet. It helps first-timers avoid the #1 reason pets are returned:
                     a lifestyle mismatch.
Known limitation:    Inquiries are not sent anywhere. Shelters and pets are fictional, and data stays
                     in this browser (localStorage).
Next step:           Connect to real shelter listings via an API, add shelter-side inquiry management,
                     and compare two pets side by side.
```

**Where the audience and task appear in the UI** (EVALUATION.md §2, first checkbox):
- Hero eyebrow: "Pet adoption for first-time adopters".
- Hero H1: "Find a pet that fits your life."
- How-it-works intro: "New to this? Most people here are adopting their first pet…"
- Footer: "PawPath helps teens and young adults find and adopt their first pet. Demo data — all pets and shelters are fictional."

**Why "Lifestyle Match" is the right signature.** It is useful rather than decorative. It reuses data we already need (energy, home fit, hours alone, good-with). The story itself teaches it (Chapter 3), and the honest "Heads-up" line is a distinctive, responsible choice that judges can see in five seconds.

---

## 3. Brand concept

**Name:** PawPath. Keep it. It is short, it reads as "the path to your pet", and it matches the story (the walk home).
**Wordmark:** "PawPath" set in Bricolage Grotesque 800, with a small paw glyph (lucide `PawPrint`) before it. No logo image is needed.

**Voice:** like a friend who volunteers at a shelter. Warm, direct, a little funny, and honest about responsibility.
- Second person, short sentences, contractions.
- At most one pet pun per screen. Banned words: "furbaby", "pawsome", "fur-ever", "pupper". They read as childish.
- Always state the commitment honestly. We tell teens what a pet needs and never guilt-trip them.
- Labels are plain verbs: "Ask to adopt", "Save", "Clear filters". No clever labels on buttons.

**Microcopy, ready to use:**
1. Quiz intro: **"4 questions. About 2 minutes. No wrong answers — just honest ones."**
2. Save toast: **"Saved Mochi. You've got 3 pets on your shortlist."** (action: "View saved")
3. Empty filter state: **"No one matches all of that — yet. Remove 'Good with cats' to see 3 more pets."**
4. Match heads-up: **"Heads-up: Storm needs about 2 hours of running a day."**
5. Form helper: **"Tell the shelter a little about you. Be real — they're matching for life, not for likes."**
6. Success: **"Inquiry sent! Second Chance Paws usually replies within 2 days."** followed by **"Demo: nothing actually left your browser."**
7. 404: **"This page wandered off. Let's get you back to the pets."**

---

## 4. Design system tokens

Light theme only (see §0, decision 8). All tokens live as CSS variables in `src/index.css` under Tailwind v4 `@theme` (the Lead owns this). **Nothing is hard-coded twice.**

### 4.1 Colour

Five brand hues: cream, ink, orange, teal and night. Species tints are pale tints used only for backgrounds.

| Token | Hex | Use |
|---|---|---|
| `--color-bg` | `#FFF8F0` | Page background (cream) |
| `--color-surface` | `#FFFFFF` | Cards, inputs, light story cards |
| `--color-ink` | `#221B2E` | Body text and headings |
| `--color-muted` | `#5C5470` | Secondary text, meta |
| `--color-line` | `#E7DCCF` | **Decorative** dividers only. Never the only boundary of a control. |
| `--color-field-border` | `#7A7189` | Borders of inputs, checkboxes, radio cards and chips |
| `--color-primary` | `#C2410C` | Primary button fill, links on cream or white |
| `--color-primary-strong` | `#9A3412` | Primary hover/pressed state; **any orange text on a tint** |
| `--color-primary-soft` | `#FFEDD5` | Selected chip and radio-card background |
| `--color-accent` | `#0F766E` | Match % badge, "why it fits" ticks, secondary highlights |
| `--color-accent-strong` | `#115E59` | Text on `accent-soft` |
| `--color-accent-soft` | `#CCFBF1` | Match badge background |
| `--color-success` | `#15803D` | Success text and icons |
| `--color-error` | `#B91C1C` | Error text, invalid field border |
| `--color-night` | `#1C1830` | Dark story cards (chapters 1–2), story night background |
| `--color-night-2` | `#2A2342` | Dusk background |
| `--color-on-night` | `#FFF8F0` | Text on night |
| `--color-on-night-muted` | `#C9C2DB` | Secondary text on night |
| `--color-sun` | `#FFD27A` | Highlight on night; **focus ring on night surfaces** |
| `--color-focus` | `#2563EB` | Focus ring on light surfaces |
| `--tint-dog` | `#FFE6CF` | Card and thumbnail background, per species |
| `--tint-cat` | `#ECE6FF` | |
| `--tint-rabbit` | `#FDE4EE` | |
| `--tint-fish` | `#D9F1F4` | |
| `--tint-bird` | `#E5F4D9` | |

**Verified contrast** (WCAG relative luminance, computed with a script on 2026-11-12):

| Foreground on background | Ratio | Needed | Result |
|---|---|---|---|
| ink `#221B2E` on bg `#FFF8F0` | **15.77** | 4.5 | Pass |
| ink on surface `#FFFFFF` | **16.61** | 4.5 | Pass |
| muted `#5C5470` on bg | **6.74** | 4.5 | Pass |
| muted on surface | **7.10** | 4.5 | Pass |
| white on primary `#C2410C` (button) | **5.18** | 4.5 | Pass |
| white on primary-strong `#9A3412` (hover) | **7.31** | 4.5 | Pass |
| primary `#C2410C` on bg (link) | **4.92** | 4.5 | Pass |
| primary on surface (link) | **5.18** | 4.5 | Pass |
| primary-strong on primary-soft (selected chip) | **6.38** | 4.5 | Pass |
| ink on primary-soft | **14.50** | 4.5 | Pass |
| white on accent `#0F766E` | **5.47** | 4.5 | Pass |
| accent on bg / surface | **5.20 / 5.47** | 4.5 | Pass |
| accent-strong `#115E59` on accent-soft `#CCFBF1` | **6.73** | 4.5 | Pass |
| success `#15803D` on surface / bg | **5.02 / 4.76** | 4.5 | Pass |
| error `#B91C1C` on surface / bg | **6.47 / 6.14** | 4.5 | Pass |
| on-night `#FFF8F0` on night `#1C1830` | **16.31** | 4.5 | Pass |
| on-night-muted `#C9C2DB` on night | **10.00** | 4.5 | Pass |
| on-night on night-2 `#2A2342` | **14.06** | 4.5 | Pass |
| sun `#FFD27A` on night | **12.06** | 4.5 | Pass |
| ink on sun (highlight pill) | **11.67** | 4.5 | Pass |
| ink on the dog/cat/rabbit/fish/bird tints | **13.82 / 13.71 / 13.85 / 14.11 / 14.45** | 4.5 | Pass |
| muted on the dog/cat/rabbit/fish/bird tints | **5.91 / 5.86 / 5.92 / 6.03 / 6.18** | 4.5 | Pass |
| primary-strong on the dog tint | **6.08** | 4.5 | Pass |
| field-border `#7A7189` on surface / bg (non-text, 1.4.11) | **4.61 / 4.38** | 3.0 | Pass |
| focus `#2563EB` on surface / bg / dog tint (non-text) | **5.17 / 4.91 / 4.30** | 3.0 | Pass |
| sun focus ring on night (non-text) | **12.06** | 3.0 | Pass |

**Combinations that are banned** (they were checked and failed):
- primary `#C2410C` as **text** on a species tint: 4.27–4.31, fails. Use `primary-strong`.
- primary as **text** on night: 3.32, fails. On night, use `sun` for highlights.
- `line` `#E7DCCF` as an input border: 1.35:1 against white, fails 1.4.11. Use `field-border`.
- A bright coral CTA with white text, e.g. `#F97316` (2.80) or `#FF7A59` (2.57), fails. This was the first idea and was rejected (logged in §14).
- Blue focus ring `#2563EB` on night: 3.32. That technically passes 3:1, but it is weak, so night surfaces use the sun ring.

### 4.2 Typography (2 Google Fonts)

- **Display: Bricolage Grotesque.** Warm and quirky without being childish. Weights 600 and 800, variable `opsz` 12–96. Use it for headings, the wordmark, big numbers and the CTA label.
- **Body: Figtree.** Friendly, very readable at 16px. Weights 400, 500 and 700.
- Load with `<link rel="preconnect">` and the Google Fonts CSS2 URL: `family=Bricolage+Grotesque:opsz,wght@12..96,600..800&family=Figtree:wght@400;500;700&display=swap`. Fallback stack: `system-ui, -apple-system, "Segoe UI", sans-serif`.

Fluid type scale. Values are interpolated between 360px and 1280px viewports.

| Token | Mobile (360) | Desktop (1280) | CSS value | Line-height | Font / weight | Use |
|---|---|---|---|---|---|---|
| `--text-xs` | 14 | 14 | `0.875rem` | 1.43 (20px) | Figtree 500 | Chips, captions, badges (never body) |
| `--text-base` | 16 | 16 | `1rem` | 1.5 | Figtree 400 | Body, inputs, buttons |
| `--text-lg` | 18 | 18 | `1.125rem` | 1.55 | Figtree 400 | Story copy, lead paragraphs |
| `--text-xl` | 20 | 22 | `clamp(1.25rem, 1.2rem + 0.22vw, 1.375rem)` | 1.35 | Bricolage 600 | H3, card names |
| `--text-2xl` | 24 | 28 | `clamp(1.5rem, 1.4rem + 0.43vw, 1.75rem)` | 1.25 | Bricolage 700 | H2 in pages, quiz legends |
| `--text-3xl` | 30 | 40 | `clamp(1.875rem, 1.63rem + 1.09vw, 2.5rem)` | 1.15 | Bricolage 800 | Page H1, story H2 |
| `--text-4xl` | 36 | 56 | `clamp(2.25rem, 1.76rem + 2.17vw, 3.5rem)` | 1.05 | Bricolage 800 | End-panel headline |
| `--text-display` | 40 | 72 | `clamp(2.5rem, 1.72rem + 3.48vw, 4.5rem)` | 1.0 | Bricolage 800, letter-spacing −0.02em | Hero H1 only |

Rules: one `<h1>` per page, headings in order, body max width `65ch`, and no text under 14px anywhere.

### 4.3 Spacing (4px base, 8px rhythm)

| Token | px | Typical use |
|---|---|---|
| `--space-1` | 4 | Icon-to-text gap |
| `--space-2` | 8 | Chip padding, tight stacks |
| `--space-3` | 12 | Input padding (y) |
| `--space-4` | 16 | **Mobile gutter**, card padding (mobile) |
| `--space-5` | 24 | Card padding (desktop), tablet gutter |
| `--space-6` | 32 | Desktop gutter, block gap |
| `--space-7` | 48 | Section padding (mobile) |
| `--space-8` | 64 | Section padding (desktop) |
| `--space-9` | 96 | Large section breaks |
| `--space-10` | 128 | Hero breathing room (desktop) |

Breakpoints (mobile-first): `sm 640`, `md 768`, `lg 1024`, `xl 1280`. Container `max-width: 1200px`. Tap targets are at least **44×44px**; buttons are 48px tall.

### 4.4 Radii and shadows

| Token | Value | Use |
|---|---|---|
| `--radius-sm` | 8px | Inputs, small buttons |
| `--radius-md` | 16px | Pet cards, radio cards, toasts |
| `--radius-lg` | 24px | Story copy cards, panels, turntable frame |
| `--radius-pill` | 9999px | Chips, badges, primary CTA |
| `--shadow-1` | `0 1px 2px rgb(34 27 46 / .06), 0 2px 8px rgb(34 27 46 / .06)` | Cards at rest |
| `--shadow-2` | `0 4px 12px rgb(34 27 46 / .08), 0 12px 32px rgb(34 27 46 / .10)` | Card hover, story cards |
| `--shadow-3` | `0 -4px 24px rgb(34 27 46 / .12)` | Mobile sticky CTA bar |
| `--shadow-cta` | `0 6px 16px rgb(194 65 12 / .30)` | Primary CTA only |

**Focus ring** (global, `:focus-visible`): `outline: 3px solid var(--focus-ring); outline-offset: 2px;` where `--focus-ring` is `--color-focus` by default and is set to `--color-sun` inside `.surface-night`. `outline: none` without a replacement is banned.

**Buttons** (one style per level, the same everywhere):
- Primary: pill, primary fill, white text, `--shadow-cta`, 48px tall, Bricolage 700 at 16px.
- Secondary: pill, surface fill, 2px `--color-ink` border, ink text.
- Ghost/text: underlined primary link.
- Icon button: 44×44, with an `aria-label`.

### 4.5 Motion tokens

| Token | Value | Use |
|---|---|---|
| `--dur-instant` | 80ms | Press feedback (scale 0.97) |
| `--dur-fast` | 150ms | Hover and colour changes |
| `--dur-base` | 220ms | Disclosure open, toast in, chip select |
| `--dur-slow` | 280ms | Route fade, canvas fade-in, story word reveal |
| `--ease-out` | `cubic-bezier(0.22, 1, 0.36, 1)` | Entrances |
| `--ease-in-out` | `cubic-bezier(0.65, 0, 0.35, 1)` | Position changes |
| Spring (motion) | `{ type: 'spring', stiffness: 520, damping: 28 }` | Heart pop, saved-count bump |
| Story word stagger | 30ms per word, total ≤ 450ms | Split-text headline reveal |
| 3D damping λ | chapter progress **5**, camera **4**, pose values **6** (`THREE.MathUtils.damp`) | Story scene |
| Clip crossfade | 0.35s | Animation clip changes |

**Every individual UI transition is ≤ 300ms** (EVALUATION.md rule 8). 3D motion is scroll-bound, not time-bound.

**Reduced-motion policy (`prefers-reduced-motion: reduce`):**
1. CSS transitions and animations are declared only inside `@media (prefers-reduced-motion: no-preference)`.
2. The app root wraps everything in `<MotionConfig reducedMotion="user">`.
3. **Lenis is not created.** Native scroll is used, and anchor jumps are instant.
4. No split text, tilt, spotlight, sparkles or count-up. The final values are rendered straight away.
5. The story becomes a static sequence (see §6.4). Each chapter is `min-height: 100svh`, the canvas uses `frameloop="demand"` and snaps to each chapter's pose, and clips are paused on their first frame.
6. The turntable has no autorotate. The rotate buttons step 45° instantly.
7. The heart changes colour only (no pop) and the toast appears without a slide.
8. **Content is never hidden behind an animation.** Initial `opacity: 0` states are applied by JS only when motion is allowed, so text is visible if JS fails.

---

## 5. Information architecture and routes

| Route | Page | Owner | Dominant CTA | `<h1>` |
|---|---|---|---|---|
| `/` | Scroll story → end panel → How adoption works | Story/3D | **Find my match** | "Find a pet that fits your life." |
| `/pets` | Catalogue with filters and sort (state in URL params) | Catalogue | none (cards are the action); the empty state has "Clear all filters" | "Pets waiting for a home" |
| `/pets/:id` | Pet profile with turntable | Catalogue | **Ask to adopt {name}** | "{name}" |
| `/saved` | Saved pets (hearts) | Catalogue | Ask to adopt (on each card) or "Browse pets" when empty | "Your shortlist" |
| `/match` | Lifestyle Match quiz (4 steps) | Adoption | **Next** / **See my matches** | "Find your match" |
| `/match/results?…` | Ranked results with reasons | Adoption | **Meet {top pet}** | "Your top matches" |
| `/adopt/:petId` | Inquiry form, then success state in place | Adoption | **Send my inquiry** | "Ask to adopt {name}" |
| `*` | 404 | Lead | **Browse pets** | "This page wandered off." |

**Why these decisions:**
- **The inquiry is a route, not a drawer.** On a 360px screen a drawer is a full-screen modal anyway, but with focus-trap, Escape and scroll-lock risks. A route gives Back-button safety, a deep link for the demo ("open `/adopt/biscuit`") and a clean focus target. The rubric pays for a working flow, not a sheet animation.
- **Saved pets get their own page** so the visible heart count in the nav is never a dead link (rule: no fake buttons). The count badge plus a toast gives instant feedback on every heart click.
- **Filters and quiz answers live in the URL** (`/pets?species=cat&energy=calm`, `/match/results?home=apartment&away=half&pace=chill&with=cats`). That makes refresh, Back, sharing and the demo reliable without a backend. Quiz answers are also mirrored to localStorage so `/pets` can offer "Sort: best match".
- **How adoption works** is a section on `/` (`#how-it-works`), not a route. It is one of the landing's three useful items and needs no navigation.

**Navigation (header, sticky, height 64px):**
- Desktop: wordmark (→ `/`), **Find a pet** (`/pets`), **Match quiz** (`/match`), **Saved** with a count badge (`/saved`). There is **no CTA-styled button in the nav**, so each page keeps exactly one dominant CTA.
- Mobile (< 768): wordmark, a heart icon link with the count (`aria-label="Saved pets, 3"`) and a **Menu** button (`aria-expanded`, `aria-controls`). The menu opens a **disclosure panel** below the header (not a modal). Escape closes it and returns focus to the button, and it closes on route change.
- The active link gets `aria-current="page"` plus an underline (never colour alone).

**Shell:**
- A "Skip to main content" link is the first focusable element (visible on focus).
- `<main id="main" tabIndex={-1}>` is the landmark.
- On route change: scroll to top (Lenis `immediate`), move focus to the page `<h1>` (`tabIndex={-1}`), set `document.title` to "{Page} · PawPath", and announce "Navigated to {Page}" via a polite live region.
- The footer contains:
  - "Demo data — all pets, shelters and people are fictional. Nothing you type leaves your browser."
  - A **"Clear my demo data"** button that clears saved pets, quiz answers and inquiries, then shows a toast confirming.
  - Credits: "3D models: Quaternius & KayKit (CC0) via Poly Pizza. Fonts: Google Fonts (OFL). Icons: Lucide (ISC)."
  - "Built for the ACM MAJU Vibe Coding Competition."

**Deployment note (Lead):** add the SPA fallback (`public/_redirects` with `/* /index.html 200` for Netlify, or a `vercel.json` rewrite) so refreshing `/pets/biscuit` works on the live link.

---

## 6. The scroll story (`/`)

### 6.1 Story arc

Biscuit, the story hero, is **a real adoptable pet in the dataset** (fictional). The story shows the day he is waiting for, and then reveals that he, and 11 others, are still waiting. That ties the emotion directly to the task.

`Waiting (night) → Noticed (hope) → The right fit (match) → The walk home (journey) → Home (warmth) → Your turn (task)`

Story total height is about **700vh**: chapter heights `[130, 130, 170, 140, 130]` in vh (svh on mobile), plus the end panel in normal flow. Keep these in one constant, `CHAPTER_VH`, so they can be tuned.

### 6.2 Chapters

Units: the pet is normalised so its body length is **1.0** and it stands on `y = 0`. Camera FOV is 35. "Hold" means the pose is held for the first 50% of the chapter's scroll, and "fly" means it interpolates to the next pose over the last 50% (smoothstep).

---

#### Chapter 1: "Waiting" (hero), 130vh

- **Beat:** a pup alone in a kennel at night. The quiet first frame.
- **HTML (dark card, `.surface-night`):**
  - Eyebrow: "Pet adoption for first-time adopters"
  - **H1:** "Find a pet that fits your life."
  - Body: "Meet Biscuit. He's waited **112 nights** for someone who's a good fit. Scroll to see the day he's hoping for, or jump straight to your match."
  - Actions: **[Find my match]** (primary, → `/match`) · **Browse all 12 pets** (secondary, → `/pets`)
  - Below: "Skip the story ↓" (text link → `#start`) and a scroll cue "Scroll for Biscuit's story" (animated paw, decorative, `aria-hidden`, hidden under reduced motion).
  - This first viewport already shows the audience, the task, the primary CTA and two useful paths, so it satisfies the landing checkbox on its own.
- **3D:**
  - Model: **Dog** (Biscuit, tint `#C8935A`). Clip alias `rest` (head-low idle; fall back to `idle`).
  - Pose: `pos (0,0,0)`, `rotY −0.6`.
  - Kennel: a back wall, a floor, 7 vertical bars (cylinders, `#3A3350`) in front of the dog, a flattened-cylinder bed and the KayKit **bowl** (empty).
  - Camera: `pos (1.2, 0.9, 3.4)` → target `(0, 0.25, 0)`, slow push-in to `pos (1.0, 0.8, 3.0)` across the hold.
  - Light: background and fog `#1C1830`; hemisphere sky `#3B3A6B`, ground `#1C1830`, intensity 0.35; key directional moonlight `#8EA2FF`, intensity 0.8, from `(−3, 4, 2)`.
- **UI layer:** a **split-text reveal** (words, not letters) on the H1, on load only. The copy card is sticky.
- **Mobile:** tall pose (§6.3). Biscuit sits in the upper 54%, and the card is sticky at the bottom (max 46svh). The bars are reduced to 5. **Find my match** is above the fold at 360×640.

#### Chapter 2: "Noticed", 130vh

- **Beat:** hope. A door opens and someone actually looks.
- **HTML (dark card):** **H2** "Then, one afternoon, the door opens." Body: "Someone walks past every kennel slowly, like they're actually reading the cards. Biscuit sits up, just in case."
- **3D:**
  - Clip `alert` (fall back to `idle`). Biscuit turns to `rotY +0.9`, toward a door at the right.
  - Door: an emissive plane `#FFC48A` at `(3, 1, −0.5)`. A spotlight `#FFC48A` ramps its intensity from 0 to 3 as the chapter progresses.
  - Camera: orbit to `pos (2.2, 1.1, 3.0)`, target `(0.3, 0.35, 0)`.
  - Background lerps `#1C1830` → `#2A2342`.
  - Dust motes in the light beam: drei `<Sparkles count={40}>`, **high tier only**.
- **UI layer:** **blur-text reveal** on the H2, once.
- **Mobile:** no sparkles. The camera pulls back ×1.5 so both the door glow and Biscuit stay in frame.

#### Chapter 3: "The right fit", 170vh (longest: it teaches the signature feature)

- **Beat:** finding someone. It isn't about the cutest face; it's about fit.
- **HTML (light card, from here on):**
  - **H2** "Not the cutest. The right fit."
  - Body: "She lives in a small flat, studies from home, and loves slow evening walks. Biscuit is calm, loves naps, and is fine alone for a few hours."
  - **Fit chips** appear in a stagger: `✓ Apartment-ready` · `✓ Calm energy` · `✓ OK alone for 5 hours` (accent-soft background, accent-strong text).
  - Footnote: "That's exactly what our **match quiz** checks." The link goes to `/match`.
- **3D:**
  - The kennel bars sink (`y 0 → −1.6`) and fade. Biscuit **walks toward the camera** (clip `walk`), moving `z 0 → 1.2` with `rotY 0`, then switches to `idle` once the next hold begins.
  - Camera: front-on and lower, `pos (0, 0.7, 3.2)`, target `(0, 0.35, 1.2)`.
  - Background lerps to dawn `#FBD9BF`. The key light warms to `#FFC9A0` at intensity 1.2.
- **UI layer:** an **animated list** stagger for the chips (each 220ms, 60ms apart, triggered once at `top 60%`).
- **Mobile:** the chips wrap to 2 lines and the card height is capped. Biscuit walks a shorter distance (`z → 0.8`) so he stays in the upper frame.

#### Chapter 4: "The walk home", 140vh

- **Beat:** the journey. The process is short and real.
- **HTML (light card):**
  - **H2** "One inquiry. One visit. One very long walk home."
  - A 3-step **horizontal stepper strip**: `1 Send an inquiry` → `2 Meet at the shelter` → `3 Bring them home`. It is a static ordered list; a decorative progress line under it fills with scroll (`aria-hidden`).
- **3D:**
  - Side view. Biscuit `rotY +π/2`, clip `walk` (high tier: `run` for the last third). His position is fixed.
  - A **treadmill** of primitive props (cone-and-cylinder trees, lamp posts, a paw-print decal trail; 12 props on high/mid tier, 6 on low) moves along `x` by `−(chapterProgress × 8)` units, so the **scroll drives the walk** and scrolling back walks him backwards.
  - Camera: `pos (0, 0.8, 3.6)`, target `(0, 0.4, 0)`, a slight dolly in `x` from −0.4 to +0.4.
  - Background `#FFE6CF` (afternoon). Key light golden `#FFB867`, intensity 1.4, from `(4, 3, 2)`.
- **UI layer:** a **scroll-scrubbed decorative line** is the only scrubbed element in the story. The text itself is static.
- **Mobile:** 6 props, and the camera distance is ×1.6 so the side view fits a tall screen. The stepper strip stacks vertically.

#### Chapter 5: "Home", 130vh

- **Beat:** warmth and belonging. The emotional peak.
- **HTML (light card):** **H2** "Night 113: home." Body: "A bowl with his name on it. A rug that's his. Someone who chose him on purpose." The "113" is a **count-up** from 112 to 113, once (static under reduced motion).
- **3D:**
  - The home set fades in: a round rug (flattened cylinder `#E9A27C`), the KayKit **bowl** (now full), the **bone**, a window frame (4 boxes) with an emissive warm pane `#FFE2B0`, and a stacked-cone plant.
  - Biscuit does a small **happy bounce** (clip `happy`/`jump` if present; otherwise a procedural `y` hop of 0.15 units, played once), then settles into `rest` on the rug (`rotY −0.4`).
  - Camera: pulls back and up to a cosy wide shot, `pos (2.4, 1.8, 3.8)`, target `(0, 0.2, 0)`.
  - Background `#FFF8F0` (it matches the page, so the end panel joins seamlessly). Key light `#FFD9A8`, intensity 1.2.
- **UI layer:** **count-up** and a fade-up for the copy.
- **Mobile:** the plant and window are dropped on the low tier.

#### Chapter 6: "Your turn" (the landing end panel, `id="start"`, normal flow, not pinned)

- **Beat:** this was the day Biscuit is hoping for. Now it's yours to make.
- **3D (first 40vh only, then the canvas fades out):**
  - High tier: **Cat** (Kulfi tint) and **Rabbit** (Clover tint) scale in from 0 to 1 beside Biscuit at `(−1.1, 0, 0.2)` and `(1.1, 0, 0.2)`, all on `idle`. Camera `pos (0, 1.0, 4.4)`.
  - Mid/low tier: Biscuit only.
  - The canvas then fades to opacity 0 as the solid end panel scrolls over it, and **rendering stops** (§6.4).
- **HTML (solid `--color-bg` panel, `<h2 id="start" tabIndex={-1}>`):**
  - **H2** "Your turn. 12 pets are still waiting." (The count comes from `pets.length`, never hard-coded.)
  - Lead: "Answer 4 quick questions and we'll show who fits your life — and why."
  - **[Find my match]** is the only primary-styled button on the panel: large, with `--shadow-cta` and a **click-spark** effect on press.
  - **Three useful items** (a 3-column grid on ≥ 1024, stacked on mobile):
    1. **Take the match quiz.** "4 questions · about 2 minutes · see why each pet fits." This card holds the dominant CTA; it uses a **spotlight card** effect (fine pointers only).
    2. **Browse by type.** Five species tiles (lucide `Dog`, `Cat`, `Rabbit`, `Fish`, `Bird` on their tints, with counts: "Dogs · 5"), each a link to `/pets?species=dog`.
    3. **How adoption works.** Four steps in short, with "Read the full steps" linking to `#how-it-works`.
  - Under the grid: "Or **meet Biscuit** →" (text link to `/pets/biscuit`).
- **After the panel: `<section id="how-it-works">`.**
  - An `<ol>` styled as a vertical **stepper**:
    1. Take the match quiz.
    2. Save the pets you like.
    3. Send an inquiry. It's free and needs no account.
    4. Meet at the shelter. Any adoption fee is paid there, never online.
  - Then 3 native `<details>` FAQs: "Can I adopt if I'm under 18?", "What does the adoption fee cover?", "What if it doesn't work out?" (every fictional shelter takes pets back).

### 6.3 Wide vs tall framing

| | Wide (aspect ≥ 0.8) | Tall (aspect < 0.8; phones, portrait tablets) |
|---|---|---|
| Copy card | Left column, `width: min(28rem, 40vw)`, `position: sticky; top: 50%; transform: translateY(-50%)` | Bottom, `position: sticky; bottom: calc(16px + env(safe-area-inset-bottom))`, full width minus 32px, `max-height: 46svh` |
| Model placement | Right of centre: `camera.setViewOffset(w, h, -w * 0.18, 0, w, h)` | Upper part of the screen: `camera.setViewOffset(w, h, 0, h * 0.18, w, h)` |
| Camera distance | As listed per chapter | Each chapter's `(camera − target)` vector **× 1.5** (Chapter 4: × 1.6) |
| Effects | Per tier (§11) | Never sparkles. Fewer props. Cat and rabbit lineup only if the tier is high. |

Call `fit()` on resize and orientation change. Use `ScrollTrigger.config({ ignoreMobileResize: true })` and `svh` heights (declare a `vh` line first as a fallback) so the mobile address bar doesn't cause jumps.

### 6.4 Technical architecture

```
<StoryPage>                                  src/experience/StoryPage.tsx  (route "/")
 ├─ <StoryCanvasLayer/>    position:fixed; inset:0; z-index:0; aria-hidden="true"; pointer-events:none
 │    └─ React.lazy(<StoryScene/>)  → one <Canvas flat dpr={tier.dpr} gl={{antialias: tier.aa}} camera={{fov:35}}>
 ├─ <ProgressBar/>          3px top bar, scaleX = overall story progress, aria-hidden
 ├─ <article id="story" z-index:1>
 │    ├─ <section data-chapter="0" style="min-height:130svh"> <CopyCard sticky/> </section>
 │    ├─ … chapters 1–4
 ├─ <EndPanel id="start"/>  solid background; covers the canvas
 └─ <HowItWorks id="how-it-works"/>
```

**Scroll wiring (Lead's `src/app/scroll/LenisProvider.tsx`; the story uses it):**
- `const lenis = new Lenis({ lerp: 0.1, smoothWheel: true, syncTouch: false, autoRaf: false })`. Touch keeps native momentum on phones.
- `lenis.on('scroll', ScrollTrigger.update)`, then `gsap.ticker.add(t => lenis.raf(t * 1000))` and `gsap.ticker.lagSmoothing(0)`.
- Not created when reduced motion is on. Expose it through `useLenis()` and `scrollToTarget(el)`, which scrolls (immediately if reduced motion is on) and then focuses the element.
- Add `data-lenis-prevent` to any inner scroll region.

**Chapter progress → scene state (no React re-renders):**
- `src/experience/storyState.ts` exports a plain mutable object: `storyState = { chapter: 0, lineup: 0, inView: true }`.
- `useGSAP` creates one ScrollTrigger per chapter section: `start: 'top 60%'`, `end: 'bottom 60%'`, `onUpdate: self => { storyState.chapter = i + self.progress }`. The end panel's trigger drives `storyState.lineup` (0 to 1) and the canvas opacity.
- An IntersectionObserver on `#story` plus the first 40vh of the end panel sets `storyState.inView`. The canvas switches `frameloop` between `'always'` (in view) and `'never'` (out of view). **Nothing renders once the user is reading the landing panel.**
- `POSES: Pose[]` has 6 entries (chapters 0–5, where 5 is the lineup) × 2 sets (`wide`, `tall`). A `Pose` holds the dog position, `rotY`, clip alias, camera position, camera target, background colour, hemisphere and key light colour/intensity, door-light intensity, `kennel` (0–1), `home` (0–1) and `treadmill` (on/off).
- In `useFrame((_, dt) => …)`:
  1. `cur = damp(cur, storyState.chapter, 5, dt)`
  2. `k = floor(cur)`, `f = cur − k`, `w = f < 0.5 ? 0 : smoothstep((f − 0.5) / 0.5)`
  3. `target = lerpPose(POSES[k], POSES[k + 1], w)`
  4. Damp each camera and object value toward `target` (λ = 4 for the camera, 6 for the pose).
  5. The active clip is `POSES[round(cur)].clip`; on change, `action.crossFadeTo(next, 0.35)`.
  6. On the first frame, snap to the target with no damping, so loading mid-page doesn't fly in.
- **GSAP never tweens three.js objects directly.** GSAP produces numbers; `useFrame` applies them. This avoids two systems fighting over the camera.
- Text reveals are separate `gsap.from()` calls with `scrollTrigger: { trigger, start: 'top 70%', once: true }`. Text plays once and stays visible when the user scrolls back.

**Split text accessibility:** split into **words**, never letters. Render the full sentence once in a visually hidden span, and mark the animated word spans `aria-hidden="true"`. If a reactbits component splits letters or drops the accessible name, wrap it this way or replace it.

**Skip story:**
- "Skip the story ↓" in the hero is the first link inside `<main>`.
- It calls `scrollToTarget('#start')`, which is an instant jump plus focus on the end-panel H2.
- The story sections contain **no interactive elements** except the Chapter 3 quiz link, so Tab moves quickly from the hero to the end panel.

**Reduced motion (the story becomes a static sequence):**
- Chapter heights become `min-height: 100svh`. Each copy card sits **in flow** (not sticky), centred in its section.
- The canvas uses `frameloop="demand"`. When the most-visible chapter changes (IntersectionObserver), the scene **snaps** to that chapter's pose and calls `invalidate()`.
- No damping, flights, sparkles, treadmill movement or clip playback (clips are frozen on their first frame).

**No WebGL** (`useDeviceTier().tier === 'none'`):
- The canvas layer is not mounted.
- Each chapter renders its **poster** `<img src="/posters/ch{n}.webp" alt="…">` above the copy card, in normal flow, at `height: auto`. The story reads like an illustrated article.
- Poster alt texts:
  1. "Low-poly illustration: Biscuit, a tan dog, lying alone in a kennel at night."
  2. "A warm light spills through an open door as Biscuit sits up."
  3. "The kennel bars are gone and Biscuit walks forward."
  4. "Biscuit walks home along a tree-lined path."
  5. "Biscuit curled up on a rug next to a full bowl and a bone."

---

## 7. Catalogue (`/pets`)

### 7.1 How a pet appears without photos: decision

| Option | Mobile performance | Accessibility | Effort | Verdict |
|---|---|---|---|---|
| A. drei `<View>` per visible card on one shared canvas | Risky: one WebGL context rendering 6–14 skinned meshes while scrolling a grid. Layout and scroll sync jank on iOS. | The canvas has no alt text; each view needs extra ARIA work | High | ✗ |
| B. **Pre-rendered static thumbnails** (WebP) of the real tinted models | Best: about 20 KB per image, lazy-loaded, **zero WebGL on the page** | A real `<img>` with descriptive `alt`, the most robust semantics | Medium (one dev route renders and downloads them) | **✓ Chosen** |
| C. Illustrated colour card with a species icon | Best | Good (icon is decorative, the name is text) | Low | ✓ **Automatic fallback** for B |

**Decision: B with C as the fallback.**
- Every card shows a 1:1 pre-rendered WebP of that pet's tinted model (3/4 view, idle pose, transparent background) on its species tint.
- If the thumbnail fails to load (`onError`), the card swaps to the lucide species icon at 48px in `--color-muted` on the same tint.
- The live 3D model appears only on the profile (turntable).
- Why: the catalogue is the core of the primary flow, so it must be the fastest and most accessible page. One `<img alt>` is the gold standard for "image descriptions" (A11y checkbox), and the visual still matches the 3D story.

**Thumbnail pipeline (Story/3D engineer):**
- A dev-only route `/__thumbs` (registered only when `import.meta.env.DEV`) renders each pet with `PetModel` on a fixed camera, using `gl={{ preserveDrawingBuffer: true, alpha: true }}`. A "Download all" button exports `/thumbs/{id}.webp` at 480×480, quality 0.82, target **≤ 25 KB** each.
- The same route exports the 5 story posters, `/posters/ch{1-5}.webp` at 960×960, **≤ 60 KB** each.
- The outputs are committed to `public/`.

**Alt text formula** (`pet.thumbAlt`, written in the data): "Low-poly 3D illustration of {name}, a {colour} {breed}." Example: "Low-poly 3D illustration of Biscuit, a tan mixed-breed dog."

### 7.2 Pet card (`PetCard`, used on `/pets`, `/saved` and match results)

```
┌───────────────────────────────┐
│ [tint bg + thumbnail 1:1] [♡]│  ← heart: 44×44 icon button, top-right, aria-pressed
│  92% match  (badge, if quiz)  │  ← accent-soft / accent-strong
├───────────────────────────────┤
│ Biscuit                        │  ← h3 contains the <a>; ::after stretches the link over the card
│ Mixed breed · 2 yrs · Male     │  ← muted
│ (Medium) (Calm) (Good with kids)│ ← 3 chips max; icon + text, never colour alone
│ Waiting 112 days               │  ← xs, muted
└───────────────────────────────┘
```

- **Nested-interactive rule:** the card is **not** wrapped in an `<a>`. The name link's `::after` covers the card, and the heart button sits above it (`position: relative; z-index: 1`).
- Tab order per card: name link, then the heart.
- Hover (fine pointers only): `--shadow-2` and a **spotlight-card** radial highlight. No tilt, because tilt moves the text and hurts readability.
- **Heart behaviour:**
  - Toggle `saved.toggle(id)`. `aria-pressed` flips, and the `aria-label` changes from "Save Biscuit" to "Remove Biscuit from saved".
  - A spring pop (scale 1 → 1.25 → 1) plus a **click-spark**.
  - The nav badge bumps.
  - Toast: "Saved Biscuit. You've got 3 pets on your shortlist." with a **View saved** action, or "Removed Biscuit from your shortlist." with an **Undo** action. Toasts last 5s and pause on hover or focus.

### 7.3 Filters

| Filter | Control | URL param | Values |
|---|---|---|---|
| Species | Chip toggle group (always visible above the grid) | `species` | `dog,cat,rabbit,fish,bird`; empty means all |
| Age group | Checkbox group | `age` | `baby` (< 1 yr), `young` (1–2), `adult` (3–7), `senior` (8+) |
| Size | Checkbox group | `size` | `small,medium,large` |
| Energy | Checkbox group | `energy` | `calm,balanced,lively` |
| Good with | Checkboxes (all must be true) | `with` | `kids,dogs,cats` |
| Fits a flat | Single checkbox | `flat=1` | `homeFit` includes `apartment` |

- **Semantics:**
  - Each group is a `<fieldset><legend>`.
  - Species chips are `<button aria-pressed>` inside a `role="group"` with `aria-label="Species"`, plus an "All" chip.
  - Filters **apply instantly**; there is no Apply button.
- **Layout:**
  - **≥ 1024:** a 280px sticky left sidebar holds all filters, and the grid has 3 columns.
  - **< 1024:** the species chips wrap above the grid, followed by a **"More filters (n)"** disclosure button (`aria-expanded`) that expands the other groups inline. It is not a modal.
  - Grid: 1 column under 520px, 2 columns from 520px.
  - Active filters show as removable pills ("Calm ✕", each a button with `aria-label="Remove filter: Calm"`) plus a **Clear all** button.
- **Sort** (a `<select>` with a visible label "Sort by"):
  - **Longest waiting** (default; it matches the story's message)
  - Best match (enabled only when quiz answers exist; otherwise the option is shown disabled with the hint "Take the quiz to unlock")
  - Youngest first
  - Oldest first
  - Name A–Z
  - When quiz answers exist and the user arrives from results (`?sort=match`), Best match is preselected.
- **Results count:** "**6 pets** match" sits above the grid inside `<p role="status" aria-live="polite">`. Debounce it by 300ms so rapid clicks announce only once.
- **Empty state:**
  - A large lucide `SearchX` (decorative).
  - **"No one matches all of that — yet."**
  - A **smart suggestion**: compute which single active filter, if removed, gives the most results, and render "Remove '{label}' to see {n} pets" as a button.
  - A secondary **Clear all filters** button.
- **Grid change animation:** motion `layout` plus a fade (≤ 220ms). None under reduced motion.

---

## 8. Pet profile (`/pets/:id`)

**Layout:**
- Mobile: turntable on top, content below, and a **sticky bottom CTA bar**.
- ≥ 1024: two columns. The turntable sits on the left (sticky, 1:1, max 560px); the content is on the right.

**Content order (all real HTML):**
1. Breadcrumb link "← All pets" (back to `/pets`, keeping the previous query string).
2. **H1** "Biscuit". Meta line: "Mixed breed (desi dog) · 2 yrs 6 mos · Male · Medium".
3. **Match box:**
   - If quiz answers exist: "**92% match for you**", up to 3 ✓ reasons, at most 1 ⚠ heads-up, and "Edit answers" (→ `/match`).
   - Otherwise: "How well does Biscuit fit your life? **Take the 2-minute quiz →**"
4. **Personality:** 3 trait chips, then the story paragraph under an H2 "Biscuit's story".
5. **Good with:** a list with icon plus text, e.g. "✓ Kids", "✓ Dogs", "✗ Cats — not yet". Text carries the meaning, not colour alone.
6. **Daily life:** energy ("Calm"), "Fine alone for up to 5 hours", homes ("Flat · House · House with yard"), and the care-needs line.
7. **Adoption details:** a `<dl>` containing:
   - Adoption fee: Rs 5,000. Note: "Paid at the shelter during your visit — PawPath never takes payments."
   - Vaccinated: Yes
   - Neutered/Spayed: Yes
   - Microchipped: Yes
   - Waiting: 112 days
   - Shelter: Second Chance Paws, Gulshan-e-Iqbal, Karachi, Tue–Sun 11:00–18:00
   - Health note, if any
   - Values of `'n/a'` render as "Not needed for fish/birds".
8. **CTA row:**
   - **[Ask to adopt Biscuit]** (primary, → `/adopt/biscuit`) plus a **heart** icon button.
   - Mobile: the same pair sits in a sticky bottom bar (`--shadow-3`, 72px plus the safe area). The page gets matching bottom padding so the footer is never covered.
   - If an inquiry already exists for this pet, show a success banner above the CTA: "You asked about Biscuit on 12 Nov (ref PP-2417)." The CTA label becomes **"Send another inquiry"**.
9. **"Also waiting":** 3 `PetCard`s of the same species (or the best matches), so the page never dead-ends.

**Turntable (`<PetTurntable pet={pet} />`, built by Story/3D, placed by Catalogue):**
- A lazily loaded `Canvas` (DPR per tier) with `PetModel` on a soft round pedestal and a blob shadow.
- `OrbitControls` with `enableZoom={false}`, `enablePan={false}`, polar angle locked to 60°–80°, `autoRotate` at speed 0.6, and clip `idle` playing.
- **Controls (HTML buttons below the canvas, 44×44, labelled):**
  - "Turn left" and "Turn right" rotate by 45° (animated for 280ms, or instantly under reduced motion).
  - **"Pause turning" / "Resume turning"** (`aria-pressed`). WCAG 2.2.2 requires a pause control for motion that lasts more than 5s.
- **Semantics:**
  - Wrapped in `<figure>`. The canvas wrapper is `aria-hidden`.
  - `<figcaption>`: "3D model of Biscuit. Drag or use the buttons to turn him." (Reuses `thumbAlt`.)
- **Reduced motion:** no autorotate, the clip is frozen on its first frame, and the "Pause" button is hidden (nothing moves).
- **No WebGL, or still loading:** show the thumbnail `<img alt={thumbAlt}>` at the same size, so the layout doesn't shift. While loading, this is the poster; the canvas fades in over 280ms on its first frame.
- **Missing pet:** for `/pets/unknown`, show H1 "We couldn't find that pet" plus "Browse pets".

---

## 9. Lifestyle Match quiz (`/match`, `/match/results`)

**Shell:**
- The H1 "Find your match" is followed by the intro microcopy, then a **stepper** reading "Question 2 of 4" as text, with a visual progress bar (`aria-hidden`; the text is the accessible version).
- One question per step, each a `<fieldset>` with its `<legend>` styled at `--text-2xl`.
- **Back** (secondary) and **Next** (primary). On the last step, Next becomes **See my matches**.
- When the step changes, focus moves to the new legend's wrapper (`tabIndex={-1}`).
- Answers are kept in component state and written to the URL on submit.

| # | Legend | Input | Options (label → value) |
|---|---|---|---|
| 1 | "Where do you live?" | Radio cards | "Flat or apartment" → `apartment` · "House, no yard" → `house` · "House with a yard" → `house-yard` |
| 2 | "On a normal day, how long is no one home?" | Radio cards | "Most of the day (8+ hours)" → `most` · "About half the day (4–6 hours)" → `half` · "Someone's usually home" → `home` |
| 3 | "What's your pace?" | Radio cards | "Couch & chill" → `chill` · "Daily walks" → `walks` · "Always on the move" → `active` |
| 4 | "Who else lives with you?" | Checkbox cards | "Kids under 12" → `kids` · "A dog" → `dogs` · "A cat" → `cats` · "None of these" (exclusive; unticks the others) |

- **Radio cards** are native `<input type="radio">` elements, visually hidden but focusable, inside a styled `<label>` (48px+ tall, with an icon and text). Arrow keys work natively. The selected state uses a `primary-soft` background, a 2px `primary-strong` border and a check icon, so it never relies on colour alone.
- **Validation:** if Next is pressed with nothing selected, show the inline error "Pick one option to continue." (`role="alert"`, linked via `aria-describedby`) and keep focus on the fieldset. Next is **never disabled**, because disabled buttons don't explain themselves.
- On submit, navigate to `/match/results?home=apartment&away=half&pace=chill&with=cats` and save the answers to localStorage (`pawpath:match`).

**Scoring** (`scorePet(pet, answers): MatchResult`, a pure function with unit-testable examples):

| Factor | Points | Rule | Reason text (full points) | Heads-up text (zero or partial) |
|---|---|---|---|---|
| Home | 30 | `pet.homeFit.includes(home)` gives 30, otherwise 0 | "Happy in a flat" / "Happy in a house" / "Has room to run in your yard" | "Happiest with a yard to run in" |
| Time alone | 25 | Hours away = `most 9`, `half 5`, `home 1`. If `pet.aloneHours ≥ hours`, 25. If it is short by ≤ 3, 12. Otherwise 0. | "Fine alone for up to {n} hours" | "Prefers company — fine alone for about {n} hours" |
| Pace | 30 | Map pet energy `calm 0, balanced 1, lively 2` and user pace `chill 0, walks 1, active 2`. A difference of 0 gives 30, 1 gives 15, 2 gives 0. | "{Energy} energy — matches your pace" | "Needs lots of daily play" (pet livelier) / "Prefers a quiet pace" (pet calmer) |
| Household | 15 | Every selected member must be in `goodWith`. All good gives 15; any not gives 0. "None of these" gives 15. | "Good with kids" / "Gets on with dogs" / "Gets on with cats" | "Not ready to live with {cats/dogs/young kids} yet" |

- Score = sum (0–100). Rank by score descending; ties go to `daysWaiting` descending, so the longest-waiting pet wins.
- Show at most 3 reasons (highest points first). Show the **single** heads-up with the largest point loss.
- If `pet.firstTimerFriendly`, add the reason "Great for first-time owners".
- Bands: **≥ 85 "Great fit"**, 60–84 "Good fit", < 60 "Worth a chat with the shelter".

**Results page:**
- H1 "Your top matches".
- A summary line: "Flat · away about half the day · couch & chill · lives with a cat", with an **Edit answers** link.
- The **top 3** appear as large result cards: thumbnail, name, "96% · Great fit", "Why it fits" ✓ list, "Heads-up" ⚠ line, a **[Meet {name}]** button (→ profile) and a heart.
- The first card's CTA is primary; the other two use the secondary style, so there is one dominant CTA.
- Then "**See all 12 pets ranked for you**" links to `/pets?sort=match`.
- If the URL is missing or has invalid params, redirect to `/match`.
- Under reduced motion there are no animations. Otherwise the cards fade up with a 60ms stagger.

---

## 10. Adoption inquiry (`/adopt/:petId`)

**Header:**
- H1 "Ask to adopt Biscuit".
- A mini pet summary row: thumbnail 64px, name, breed, shelter.
- Helper: "Tell the shelter a little about you. Be real — they're matching for life, not for likes."
- A notice box: "**Demo:** nothing you type is sent anywhere. Use made-up details like you@example.com."

**Fields** (each has a visible `<label>`; required fields say "(required)" in the label text, not just an asterisk):

| Field | Type | Required | Prefill | Validation message |
|---|---|---|---|---|
| First name | `text`, `autocomplete="given-name"` | Yes | none | Empty: "Enter your first name." Under 2 or over 40 characters: "Use 2 to 40 characters." |
| Email | `email`, `autocomplete="email"`, `inputmode="email"` | Yes | none | Empty: "Enter your email address." Invalid (`/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/`): "Enter an email like name@example.com." |
| Your age | Radio: "Under 18" / "18 or over" | Yes | none | "Choose your age range." If **Under 18**, show the inline info note: "You can still ask! A parent or guardian will need to come to the meet-and-greet and sign the adoption form." |
| Where you live | Radio (3 home options) | Yes | From quiz answers | "Choose where you live." |
| Who else lives with you | Checkboxes (kids / dog / cat / none) | No | From quiz answers | none |
| Best time to visit the shelter | `<select>`: Weekday evening / Saturday / Sunday | Yes | none | "Choose a time to visit." |
| Why do you think {name} fits your life? | `<textarea>`, 4 rows | No | none | Over 500 characters: "Keep it under 500 characters." Live counter "120 / 500", announced only at 450 and 500. |
| Commitment | Checkbox: "I understand adoption is a long-term commitment, and the shelter will contact me to arrange a visit." | Yes | none | "Tick this box to confirm you understand the commitment." |

There is deliberately **no phone number and no address field**, so we collect the minimum. No date of birth either; an age range is enough.

**Validation behaviour:**
- Validate each field **on blur** once it has been touched, and validate everything **on submit**.
- An invalid field gets `aria-invalid="true"`, a `--color-error` 2px border **and** an error icon plus text below the field, linked with `aria-describedby` (the error id plus the hint id).
- **On submit with errors:**
  - An **error summary** appears at the top: "There's 2 things to fix", followed by a list of links that jump to and focus each field.
  - The summary has `role="alert"` and `tabIndex={-1}`, and **focus moves to it**.
- Errors clear the moment the field becomes valid.

**Submit:**
- Primary button **"Send my inquiry"**.
- On click it changes to "Sending…" with a spinner and `aria-busy="true"` for **700ms** (simulated). It keeps `aria-disabled` and ignores double clicks, but stays focusable.
- Save `Inquiry` to localStorage (`pawpath:inquiries`) with a reference `PP-` plus 4 random digits.

**Success state** (same route; the form is replaced, not a modal):
- An `<h1 tabIndex={-1}>` receives focus: **"Inquiry sent! 🎉"**. The emoji is `aria-hidden`.
- Body: "Second Chance Paws usually replies within 2 days. Your reference is **PP-2417**."
- A "What happens next" `<ol>`:
  1. The shelter reviews your inquiry (1–2 days).
  2. You visit for a meet-and-greet, with a guardian if you're under 18.
  3. If it's a match, you sign the form, pay the fee at the shelter and take {name} home.
- A muted box: "**Demo:** nothing actually left your browser. PawPath is a prototype with fictional shelters."
- Buttons: **[Browse more pets]** (primary) and "Back to Biscuit" (secondary).
- A one-time decorative paw burst (high tier, no reduced motion).
- After this, the profile shows the "You asked about Biscuit…" banner (§8).

---

## 11. Accessibility and fallback plan

**Device tier** (`useDeviceTier()`, Lead, `src/app/device.ts`; computed once before any 3D chunk loads):

| Tier | Detection | DPR | Antialias | Story extras | Lineup (Ch6) | Turntable |
|---|---|---|---|---|---|---|
| `none` | No `webgl2` and no `webgl` context | none | none | Posters only | none | Thumbnail |
| `low` | `navigator.connection?.saveData`, or `deviceMemory ≤ 4`, or `hardwareConcurrency ≤ 4` | 1 | off | No sparkles, 6 props, no plant or window | Dog only | Yes |
| `mid` | Coarse pointer and width < 1024 (phones, tablets) | `[1, 1.5]` | on | No sparkles, 12 props | Dog only | Yes |
| `high` | Everything else | `[1, 1.75]` | on | Sparkles (40), 12 props | Dog, cat, rabbit | Yes |

drei `<PerformanceMonitor onDecline={() => setDpr(1)}>` drops DPR to 1 if the FPS falls. **No post-processing package** is installed (no bloom or depth-of-field).

**Rules:**
1. Every canvas wrapper is `aria-hidden="true"` with `tabIndex={-1}` children. All copy, labels and data are real HTML. The 3D adds no information that the text doesn't already carry.
2. **Skip links:** "Skip to main content" (global, first tab stop) and "Skip the story" (on `/`, first link in main).
3. **Focus order** follows the DOM: header, then main, then footer. A visible focus ring is on everything (§4.4). There is no positive `tabindex`.
4. **Route change:** focus the H1, set the title and announce it (§5).
5. **Keyboard:**
   - Quiz radios use arrow keys (native). Checkboxes use Space.
   - Enter on Next submits the step: each step is a `<form>`, so Enter works.
   - Filters: chips are buttons (Enter/Space); checkboxes are native.
   - Heart: a button with `aria-pressed`.
   - Turntable: buttons only. Dragging is a bonus, never the only way.
   - Mobile menu: a disclosure. Escape closes it and focus returns to the button.
6. **Live regions:**
   - Results count (polite, debounced).
   - Toasts (`role="status"`, polite).
   - Form error summary (`role="alert"`).
   - Route announcer (polite).
7. **Images:** every thumbnail and poster has a descriptive `alt`. Decorative icons get `aria-hidden="true"`. Icon-only buttons get an `aria-label`.
8. **Contrast:** story copy always sits on a solid card (night or white), never directly on the canvas (§4.1 ratios).
9. **Reduced motion:** see §4.5 and §6.4.
10. **No JS** (graceful): a `<noscript>` block in `index.html` says "PawPath needs JavaScript for the pet catalogue. All pets are fictional demo data." That is enough; this is an SPA.
11. **Pause control** for any motion over 5s: the turntable has one. The story's motion is user-driven (scroll), so it is exempt. Idle clips loop only while the canvas is in view.
12. **360px check** on every page: no horizontal scroll (`body { overflow-x: clip }`), the sticky CTA bar never covers content, the chips wrap, and every tap target is ≥ 44px.

---

## 12. Performance budget

| Item | Budget | How |
|---|---|---|
| Initial JS for non-story routes (gzip) | **≤ 180 KB** | Route-level `React.lazy`. three, r3f and drei never load on `/pets` or `/adopt`. |
| Story and 3D chunk (three + r3f + drei subset, gzip) | **≤ 320 KB** | `React.lazy(() => import('./StoryScene'))`, imported only by `/` and the turntable. Import drei members individually. |
| GSAP + ScrollTrigger + Lenis (gzip) | ≤ 50 KB | Loaded in the app shell, since Lenis is global |
| Each animated GLB | **≤ 300 KB** (hard max 450 KB) | `npx gltf-transform optimize raw/x.glb public/models/x.glb --compress meshopt --texture-compress webp`. Meshopt needs no external decoder (drei `useGLTF` supports it). If a skinned model deforms after optimisation, rerun with simplification off. |
| 3D on `/` before Ch1 can render | **≤ 600 KB**: dog, bowl and bone only | Cat and rabbit are preloaded (`useGLTF.preload`) when Ch4 becomes active, on the high tier only |
| Thumbnails | ≤ 25 KB each, about 350 KB total, `loading="lazy"`, `width`/`height` set | Pre-rendered WebP |
| Posters | ≤ 60 KB each; only fetched on the `none` tier, or as the loading poster for Ch1 | WebP |
| Fonts | ≤ 100 KB, `display=swap`, 2 families, latin subset | Google Fonts CSS2 |
| DPR cap | High 1.75, mid 1.5, low 1 | §11 |
| Lighthouse (mobile, `/pets`) | Performance ≥ 85, Accessibility ≥ 95 | Screenshot for the demo |
| Lighthouse (mobile, `/`) | Performance ≥ 70, Accessibility ≥ 95 | LCP is the hero **text**, not the canvas |

**Loading design (`/`): never a blocking full-screen loader.**
- The hero HTML renders immediately. The canvas area shows the Ch1 poster (`/posters/ch1.webp`) on night colour until the first rendered frame, then the canvas fades in over 280ms.
- A small pill at the bottom-left of the hero shows a paw icon and "Waking Biscuit up… 64%" (drei `useProgress`). The percentage is `aria-hidden`; a visually hidden `role="status"` says "Loading the 3D story" and then "3D story ready" (two announcements only).
- If loading fails, or takes longer than 10s, keep the posters (the no-WebGL path) and hide the pill. The story still reads perfectly.
- Only one `<Canvas>` exists at a time. The story canvas unmounts when you leave `/` (r3f disposes it), and the turntable mounts on the profile.

---

## 13. Sample data spec (FICTIONAL)

> **All pets, shelters, emails and stories below are fictional demo data, created for this prototype.** Emails use the reserved `example.com` domain. Fees are display-only; **no payments are processed**. File: `src/data/pets.ts` and `src/data/shelters.ts` (owned by the Lead). Each file starts with this banner comment.

### 13.1 Model inventory (`public/models/`)

| ModelKey | File | Source (CC0) | Used by |
|---|---|---|---|
| `dog` | `dog.glb` | Quaternius Dog (story hero) | Biscuit |
| `shiba` | `shiba.glb` | Quaternius Shiba Inu | Mochi, Chai |
| `husky` | `husky.glb` | Quaternius Husky | Luna, Storm |
| `cat` | `cat.glb` | Quaternius Cat | Kulfi, Pixel, Shadow |
| `rabbit` | `rabbit.glb` | Quaternius Rabbit | Clover, Pepper |
| `goldfish` | `goldfish.glb` | Quaternius Goldfish | Sunny |
| `bird` | `bird.glb` | Quaternius Bird (Jay), static | Kiwi |
| `bowl`, `bone`, `door`, `fence`, `house`, `plant`, `sofa`, `tree` | `{name}.glb` | KayKit / Quaternius (CC0) | Story props (supplied by the lead). **Use these instead of primitives where they exist:** `door` in Ch2, `tree`/`fence`/`house` as the Ch4 treadmill and its destination, `sofa`/`plant`/`bowl`/`bone` for the Ch5 home. Primitives are the fallback only. |

**Clip aliases:**
- The story asks for logical clips: `idle | rest | alert | walk | run | happy`.
- After downloading, the 3D engineer runs `npx gltf-transform inspect` on each model and fills `CLIP_MAP: Record<ModelKey, Partial<Record<ClipAlias, string>>>`.
- A missing alias falls back to `idle`, then to the first clip, then to no animation. The bird has no clips: it gets a procedural 2° sway (none under reduced motion).

**Tinting:** clone each instance with `SkeletonUtils.clone` **and clone its materials** before setting `color` on the body material. Otherwise tinting Kulfi also changes Pixel, because the materials are shared.

### 13.2 Dataset

```ts
// src/data/shelters.ts — FICTIONAL DEMO DATA. Not real organisations.
export const shelters: Shelter[] = [
  { id: 'second-chance', name: 'Second Chance Paws', area: 'Gulshan-e-Iqbal', city: 'Karachi',
    email: 'secondchance@example.com', hours: 'Tue–Sun, 11:00–18:00', replyDays: 2 },
  { id: 'whisker-haven', name: 'Whisker Haven Cat Rescue', area: 'PECHS', city: 'Karachi',
    email: 'whiskerhaven@example.com', hours: 'Daily, 12:00–19:00', replyDays: 2 },
  { id: 'little-burrow', name: 'Little Burrow Small-Pet Rescue', area: 'North Nazimabad', city: 'Karachi',
    email: 'littleburrow@example.com', hours: 'Fri–Sun, 10:00–17:00', replyDays: 3 },
  { id: 'feather-fin', name: 'Feather & Fin Rehoming Centre', area: 'Saddar', city: 'Karachi',
    email: 'featherfin@example.com', hours: 'Mon–Sat, 10:00–18:00', replyDays: 3 },
];
```

```ts
// src/data/pets.ts — FICTIONAL DEMO DATA. Every pet, story and shelter is made up.
export const pets: Pet[] = [
  { id: 'biscuit', name: 'Biscuit', species: 'dog', breed: 'Mixed breed (desi dog)', model: 'dog',
    tint: { body: '#C8935A' }, colour: 'tan', sex: 'male', ageMonths: 30, size: 'medium', energy: 'calm',
    traits: ['Gentle', 'Nap champion', 'Loves slow walks'],
    goodWith: { kids: true, dogs: true, cats: false }, homeFit: ['apartment', 'house', 'house-yard'],
    aloneHours: 5, firstTimerFriendly: true,
    story: 'Found napping under a parked rickshaw during the monsoon, Biscuit has been the calmest dog at the shelter for 112 nights. He greets every visitor with a slow tail wag and would love a quiet home with evening strolls.',
    needs: 'Two 20-minute walks a day; happy to nap the rest.',
    adoption: { fee: 5000, vaccinated: true, neutered: true, microchipped: true, shelterId: 'second-chance', daysWaiting: 112 } },

  { id: 'mochi', name: 'Mochi', species: 'dog', breed: 'Shiba Inu', model: 'shiba',
    tint: { body: '#D9823B' }, colour: 'red-orange', sex: 'female', ageMonths: 14, size: 'medium', energy: 'lively',
    traits: ['Clever', 'Independent', 'Escape artist'],
    goodWith: { kids: true, dogs: false, cats: false }, homeFit: ['house-yard'],
    aloneHours: 4, firstTimerFriendly: false,
    story: 'Mochi was surrendered when her family moved abroad. She is smart, stubborn and can open a badly latched gate in seconds, so she needs a secure yard and someone who enjoys training.',
    needs: 'A secure yard and daily training games.',
    adoption: { fee: 5000, vaccinated: true, neutered: true, microchipped: true, shelterId: 'second-chance', daysWaiting: 41 } },

  { id: 'luna', name: 'Luna', species: 'dog', breed: 'Siberian Husky', model: 'husky',
    tint: { body: '#9AA3AE' }, colour: 'grey and white', sex: 'female', ageMonths: 48, size: 'large', energy: 'lively',
    traits: ['Talkative', 'Adventurous', 'Loves other dogs'],
    goodWith: { kids: true, dogs: true, cats: false }, homeFit: ['house-yard'],
    aloneHours: 3, firstTimerFriendly: false,
    story: 'Luna was rescued from a hot rooftop where she had been kept alone. She "talks" when she is happy, adores other dogs and needs a cool room during Karachi summers.',
    needs: '1–2 hours of exercise daily and an air-conditioned room in summer.',
    adoption: { fee: 5000, vaccinated: true, neutered: true, microchipped: true, shelterId: 'second-chance', daysWaiting: 77 } },

  { id: 'storm', name: 'Storm', species: 'dog', breed: 'Siberian Husky', model: 'husky',
    tint: { body: '#3F3D48' }, colour: 'charcoal', sex: 'male', ageMonths: 20, size: 'large', energy: 'lively',
    traits: ['Fast', 'Curious', 'Needs a job'],
    goodWith: { kids: false, dogs: true, cats: false }, homeFit: ['house-yard'],
    aloneHours: 2, firstTimerFriendly: false,
    story: 'Storm is a teenage husky with endless energy. He is sweet but too bouncy for small children, and he would thrive with a runner or a cyclist.',
    needs: 'About 2 hours of running a day.',
    adoption: { fee: 5000, vaccinated: true, neutered: true, microchipped: true, shelterId: 'second-chance', daysWaiting: 33 } },

  { id: 'chai', name: 'Chai', species: 'dog', breed: 'Shiba Inu (cream, senior)', model: 'shiba',
    tint: { body: '#EADBC8' }, colour: 'cream', sex: 'female', ageMonths: 108, size: 'medium', energy: 'calm',
    traits: ['Dignified', 'Gentle', 'Loves routine'],
    goodWith: { kids: true, dogs: true, cats: true }, homeFit: ['apartment', 'house', 'house-yard'],
    aloneHours: 6, firstTimerFriendly: true,
    story: 'Chai lived with one owner for nine years until he passed away. She is house-trained, calm and happiest with a steady routine and a sunny spot to nap.',
    needs: 'Short walks, a soft bed and a yearly senior check-up.',
    adoption: { fee: 2500, vaccinated: true, neutered: true, microchipped: true, shelterId: 'second-chance', daysWaiting: 160 } },

  { id: 'kulfi', name: 'Kulfi', species: 'cat', breed: 'Domestic shorthair', model: 'cat',
    tint: { body: '#F2EEE8' }, colour: 'white', sex: 'female', ageMonths: 24, size: 'small', energy: 'calm',
    traits: ['Cuddly', 'Quiet', 'Window-watcher'],
    goodWith: { kids: true, dogs: false, cats: true }, homeFit: ['apartment', 'house', 'house-yard'],
    aloneHours: 8, firstTimerFriendly: true,
    story: 'Kulfi was found in the stairwell of an apartment block and has refused to leave a sofa ever since. She is quiet, cuddly and perfect for a small flat.',
    needs: 'An indoor home with a window to watch.',
    adoption: { fee: 3500, vaccinated: true, neutered: true, microchipped: true, shelterId: 'whisker-haven', daysWaiting: 56 } },

  { id: 'pixel', name: 'Pixel', species: 'cat', breed: 'Tabby', model: 'cat',
    tint: { body: '#D08A4E' }, colour: 'orange tabby', sex: 'male', ageMonths: 5, size: 'small', energy: 'lively',
    traits: ['Playful', 'Chatty', 'Climbs everything'],
    goodWith: { kids: true, dogs: true, cats: true }, homeFit: ['apartment', 'house', 'house-yard'],
    aloneHours: 5, firstTimerFriendly: true,
    story: 'Pixel climbs curtains, chases bottle caps and purrs like a motorbike. He gets along with everyone, dogs included.',
    needs: 'Two play sessions a day and a scratching post.',
    healthNote: 'Neutering at 6 months is included in the fee.',
    adoption: { fee: 3500, vaccinated: true, neutered: false, microchipped: true, shelterId: 'whisker-haven', daysWaiting: 9 } },

  { id: 'shadow', name: 'Shadow', species: 'cat', breed: 'Domestic shorthair (black)', model: 'cat',
    tint: { body: '#2E2A33' }, colour: 'black', sex: 'male', ageMonths: 84, size: 'small', energy: 'balanced',
    traits: ['Loyal', 'Shy at first', 'Lap cat'],
    goodWith: { kids: false, dogs: false, cats: true }, homeFit: ['apartment', 'house'],
    aloneHours: 8, firstTimerFriendly: true,
    story: 'Black cats are often overlooked, and Shadow has waited 134 nights. He is shy for the first week, then becomes a loyal lap cat who follows you from room to room.',
    needs: 'A calm, adults-only home and a little patience.',
    adoption: { fee: 3500, vaccinated: true, neutered: true, microchipped: true, shelterId: 'whisker-haven', daysWaiting: 134 } },

  { id: 'clover', name: 'Clover', species: 'rabbit', breed: 'Holland Lop', model: 'rabbit',
    tint: { body: '#BFA58A' }, colour: 'fawn', sex: 'female', ageMonths: 12, size: 'small', energy: 'balanced',
    traits: ['Curious', 'Gentle', 'Loves leafy greens'],
    goodWith: { kids: true, dogs: false, cats: true }, homeFit: ['apartment', 'house', 'house-yard'],
    aloneHours: 8, firstTimerFriendly: true,
    story: 'Clover came from a family who did not realise rabbits can live for 10 years. She is curious and gentle, and she does happy jumps when she gets fresh coriander.',
    needs: 'A large pen, daily free-roam time and fresh greens.',
    adoption: { fee: 2000, vaccinated: true, neutered: true, microchipped: false, shelterId: 'little-burrow', daysWaiting: 27 } },

  { id: 'pepper', name: 'Pepper', species: 'rabbit', breed: 'Mini Rex', model: 'rabbit',
    tint: { body: '#5A5560' }, colour: 'dark grey', sex: 'male', ageMonths: 36, size: 'small', energy: 'lively',
    traits: ['Zoomies expert', 'Bold', 'Sociable'],
    goodWith: { kids: true, dogs: false, cats: false }, homeFit: ['house', 'house-yard'],
    aloneHours: 6, firstTimerFriendly: false,
    story: 'Pepper is a bold little rabbit who does zoomies every evening. He would love space to run and an owner who has kept rabbits before.',
    needs: 'A rabbit-proofed room to run in.',
    adoption: { fee: 2000, vaccinated: true, neutered: true, microchipped: false, shelterId: 'little-burrow', daysWaiting: 64 } },

  { id: 'sunny', name: 'Sunny', species: 'fish', breed: 'Common goldfish', model: 'goldfish',
    tint: { body: '#F28C28' }, colour: 'orange', sex: 'unknown', ageMonths: 18, size: 'small', energy: 'calm',
    traits: ['Peaceful', 'Shimmery', 'Low-key'],
    goodWith: { kids: true, dogs: true, cats: false }, homeFit: ['apartment', 'house', 'house-yard'],
    aloneHours: 24, firstTimerFriendly: true,
    story: 'Sunny was rehomed when a café closed its aquarium. Sunny is peaceful and easy to care for, as long as the tank is big enough.',
    needs: 'A 75-litre filtered tank — no small bowls, please.',
    adoption: { fee: 500, vaccinated: 'n/a', neutered: 'n/a', microchipped: 'n/a', shelterId: 'feather-fin', daysWaiting: 12 } },

  { id: 'kiwi', name: 'Kiwi', species: 'bird', breed: 'Budgerigar (green)', model: 'bird',
    tint: { body: '#6CC24A' }, colour: 'green', sex: 'female', ageMonths: 24, size: 'small', energy: 'balanced',
    traits: ['Whistler', 'Social', 'Morning person'],
    goodWith: { kids: true, dogs: false, cats: false }, homeFit: ['apartment', 'house', 'house-yard'],
    aloneHours: 6, firstTimerFriendly: true,
    story: 'Kiwi was handed in after her owner developed allergies. She whistles along to music and is happiest when someone chats to her every morning.',
    needs: 'A roomy cage and daily time out of it.',
    adoption: { fee: 1500, vaccinated: 'n/a', neutered: 'n/a', microchipped: 'n/a', shelterId: 'feather-fin', daysWaiting: 48 } },

];
```

`thumbAlt` is **derived**, not stored: `Low-poly 3D illustration of ${name}, a ${colour} ${breed.toLowerCase()}.` The species counts are dogs 5, cats 3, rabbits 2, fish 1 and birds 1, giving **12** (the cap set by the lead).

**Sanity checks (Lead adds a dev-only assertion):**
- Ids are unique.
- Every `shelterId` exists.
- The story copy's "112 nights" equals `biscuit.adoption.daysWaiting`. The story imports that value; it is **not** typed into the copy.

**Worked scoring example** (answers: apartment, half, chill, none):
- Chai, Biscuit and Kulfi each score 100. Ties go to longest waiting, so the order is Chai (160 days), Biscuit (112), Kulfi (56).
- Storm scores 0 + 0 + 0 + 15 = 15 and shows the heads-up "Happiest with a yard to run in".

---

## 14. Shared interfaces and build split (3 engineers + Lead)

### 14.1 Types (`src/data/types.ts`, owned by the Lead; everyone imports from `@/data/types`)

```ts
export type Species = 'dog' | 'cat' | 'rabbit' | 'fish' | 'bird';
export type ModelKey = 'dog' | 'shiba' | 'husky' | 'cat' | 'rabbit' | 'goldfish' | 'bird';
export type AgeGroup = 'baby' | 'young' | 'adult' | 'senior';   // derived: <12, 12–35, 36–95, ≥96 months
export type Size = 'small' | 'medium' | 'large';
export type Energy = 'calm' | 'balanced' | 'lively';
export type HomeType = 'apartment' | 'house' | 'house-yard';
export type Household = 'kids' | 'dogs' | 'cats';
export type YesNoNA = boolean | 'n/a';

export interface Shelter {
  id: string; name: string; area: string; city: string;
  email: string;            // always @example.com
  hours: string; replyDays: number;
}

export interface Pet {
  id: string;               // URL slug
  name: string;
  species: Species;
  breed: string;
  model: ModelKey;
  tint: { body: string; accent?: string };
  colour: string;           // human words for alt text, e.g. 'tan'
  sex: 'male' | 'female' | 'unknown';
  ageMonths: number;
  size: Size;
  energy: Energy;
  traits: [string, string, string];
  goodWith: Record<Household, boolean>;
  homeFit: HomeType[];
  aloneHours: number;
  firstTimerFriendly: boolean;
  story: string;
  needs: string;
  healthNote?: string;
  adoption: {
    fee: number;            // PKR, display only — never charged
    vaccinated: YesNoNA; neutered: YesNoNA; microchipped: YesNoNA;
    shelterId: Shelter['id'];
    daysWaiting: number;
  };
}

export interface MatchAnswers {
  home: HomeType;
  away: 'most' | 'half' | 'home';
  pace: 'chill' | 'walks' | 'active';
  with: Household[];        // [] = "None of these"
}

export interface MatchResult {
  petId: string;
  score: number;            // 0–100
  band: 'great' | 'good' | 'chat';
  reasons: string[];        // ≤ 3
  headsUp?: string;         // ≤ 1
}

export interface Inquiry {
  id: string; reference: string;          // 'PP-2417'
  petId: string; createdAt: string;       // ISO
  firstName: string; email: string;
  ageRange: 'under-18' | '18-plus';
  home: HomeType; household: Household[];
  visitSlot: 'weekday-evening' | 'saturday' | 'sunday';
  message?: string;
}

export type DeviceTier = 'none' | 'low' | 'mid' | 'high';
```

**Selectors and helpers** (`src/data/selectors.ts`, Lead):
- `getPet(id)`, `getShelter(id)`
- `getAgeGroup(months): AgeGroup`
- `formatAge(months): string` ("2 yrs 6 mos")
- `formatFee(n): string` ("Rs 5,000")
- `thumbAlt(pet)`, `thumbSrc(pet)` (`/thumbs/${id}.webp`)
- `SPECIES_META: Record<Species, { label: string; plural: string; icon: LucideIcon; tintVar: string }>`
- `speciesCounts()`

### 14.2 Stores and APIs

All persistence uses a single `safeStorage` helper that wraps localStorage in try/catch. Keys are prefixed `pawpath:`. The footer's "Clear my demo data" calls each store's `clear()`.

```ts
// src/app/saved/SavedPetsProvider.tsx — Lead
export interface SavedPetsApi {
  ids: readonly string[];            // insertion order (newest last)
  count: number;
  isSaved(id: string): boolean;
  toggle(id: string): 'saved' | 'removed';   // caller shows the toast
  remove(id: string): void;
  clear(): void;
}
export function useSavedPets(): SavedPetsApi;      // key 'pawpath:saved'

// src/app/toast/ToastProvider.tsx — Lead
export function useToast(): (t: { message: string; action?: { label: string; to?: string; onClick?: () => void } }) => void;

// src/app/device.ts — Lead
export function useDeviceTier(): { tier: DeviceTier; dpr: number | [number, number]; aa: boolean };
export function usePrefersReducedMotion(): boolean;

// src/app/scroll/LenisProvider.tsx — Lead
export function useLenis(): Lenis | null;                    // null when reduced motion
export function scrollToTarget(target: string | HTMLElement): void; // scrolls + focuses

// src/features/match/index.ts — Adoption engineer
export function scorePet(pet: Pet, a: MatchAnswers): MatchResult;
export function rankPets(pets: Pet[], a: MatchAnswers): MatchResult[];
export function useMatchAnswers(): { answers: MatchAnswers | null; set(a: MatchAnswers): void; clear(): void }; // 'pawpath:match'
export function answersToSearch(a: MatchAnswers): string; export function searchToAnswers(s: URLSearchParams): MatchAnswers | null;

// src/features/adopt/index.ts — Adoption engineer
export function useInquiries(): { list: Inquiry[]; add(i: Omit<Inquiry,'id'|'reference'|'createdAt'>): Inquiry; latestFor(petId: string): Inquiry | undefined; clear(): void }; // 'pawpath:inquiries'

// src/experience/index.ts — Story/3D engineer
export { default as StoryPage } from './StoryPage';
export const PetTurntable: React.LazyExoticComponent<(p: { pet: Pet; className?: string }) => JSX.Element>;
export type ClipAlias = 'idle' | 'rest' | 'alert' | 'walk' | 'run' | 'happy';
```

**Import rule:** features import each other **only through their `index.ts`**. Never deep-import another engineer's internals.

### 14.3 File ownership

| Engineer | Owns | Delivers |
|---|---|---|
| **Lead (shared)** | `src/app/**`, `src/index.css`, `src/data/**`, `src/components/ui/**`, `index.html`, `public/_redirects`, `public/favicon.svg`, README, EVALUATION.md log | Router (lazy routes), Shell (Header/Nav with saved count, mobile disclosure menu, Footer with fictional-data note, credits and clear-data, SkipLink, RouteFocus/announcer), tokens (`@theme`), fonts, `LenisProvider`, `useDeviceTier`, `SavedPetsProvider`, `ToastProvider`, UI primitives (`Button`, `IconButton`, `Chip`, `Badge`, `Field` (label + hint + error wiring), `RadioCard`, `VisuallyHidden`, `Spinner`), dataset, selectors, 404, deployment |
| **Story/3D** | `src/experience/**`, `public/models/**`, `public/thumbs/**`, `public/posters/**` | `StoryPage` (all `/` HTML: chapters, end panel, how-it-works, FAQ), `StoryCanvasLayer`, scene, `POSES`, `storyState`, `PetModel` (normalise, tint, clone, `CLIP_MAP`), `PetTurntable`, the dev route `/__thumbs`, the optimised GLBs |
| **Catalogue** | `src/features/pets/**` | `PetsPage` (filters ↔ URL, sort, aria-live count, smart empty state), `PetCard`, `PetProfilePage` (places `PetTurntable`, match box, inquiry banner), `SavedPage` |
| **Adoption** | `src/features/adopt/**`, `src/features/match/**` | `MatchPage` (4-step quiz), `MatchResultsPage`, scoring and its stores, `AdoptPage` (form, validation, error summary, simulated send, success state), `useInquiries` |

**Route registry (Lead, `src/app/routes.tsx`)** lazy-imports these named default exports:
- `@/experience/StoryPage`
- `@/features/pets/PetsPage`
- `@/features/pets/PetProfilePage`
- `@/features/pets/SavedPage`
- `@/features/match/MatchPage`
- `@/features/match/MatchResultsPage`
- `@/features/adopt/AdoptPage`

Until the real pages land, stub pages with the correct `<h1>` keep the flow navigable.

### 14.4 Component sourcing (for the reactbits.dev / 21st.dev agent)

**Rules for every sourced component:**
- It must respect `prefers-reduced-motion`.
- It must keep text selectable and readable by screen readers.
- It must not use letter-splitting without the hidden full-text pattern (§6.4).
- Hover and tilt effects run on `(pointer: fine)` only.
- It must accept our tokens (no hard-coded colours).
- **Check and adapt each one.** Every fix is an AI Iteration Log candidate.

| Where | Kind of component | Candidate source |
|---|---|---|
| Hero H1, chapter H2s | **Split-text reveal** (by word), **blur-text reveal** | reactbits SplitText, BlurText |
| Ch3 fit chips, results cards | **Animated list / stagger reveal** | reactbits AnimatedList / AnimatedContent |
| Ch4 steps, how-it-works, quiz progress | **Stepper** (presentational; quiz semantics stay in our fieldsets) | reactbits Stepper, 21st.dev stepper |
| Ch5 "Night 113", saved badge | **Count-up**, **rolling counter** | reactbits CountUp, Counter |
| End panel quiz card, pet card hover | **Spotlight card** | reactbits SpotlightCard |
| Primary CTA press, heart | **Click spark** | reactbits ClickSpark |
| Header | **Responsive navbar with a disclosure menu** | 21st.dev navbar |
| Quiz options | **Radio card group**, **checkbox cards** | 21st.dev radio-group cards |
| Filters | **Toggle chip group**, **filter pills**, **select** | 21st.dev toggle-group, badge |
| Form | **Input with label and error**, **textarea with counter**, **error summary**, **success panel** | 21st.dev form/input |
| Toasts | **Toast/notification region** | 21st.dev toast |
| Profile (mobile) | **Sticky bottom action bar** | 21st.dev bottom bar |
| Empty states | **Empty state with icon and action** | 21st.dev empty-state |

**Deliberately not used** (they earn no points and carry a11y or performance risk):
- Infinite marquees (auto-moving content)
- Magnet or cursor-follow buttons
- Tilted cards on content
- Post-processing
- The Ultimate House Interior pack (it needs a Blender export; primitives cover the home scene)
- Dark mode
- Compare-two-pets
- Accounts

### 14.5 Build order (protect the primary flow)

| Milestone | Must be true | Owner(s) |
|---|---|---|
| **M0** (first 1–2 h) | Tokens, fonts, types, dataset and selectors, shell (nav, footer, skip link), router with stubs, saved store, toast, **deployed live with the SPA fallback** | Lead |
| **M1**: primary flow with no 3D | `/pets` with filters and placeholder icon cards → profile (thumbnail fallback) → `/adopt/:id` with validation and success. Hearts and count work. Tested at 360px and with the keyboard. | Catalogue, Adoption |
| **M2**: signature and landing | Quiz → results → sort by match. `/` story in **HTML only** (cards, end panel, how-it-works) with the reduced-motion layout. | Adoption, Story |
| **M3**: 3D layer | Optimised GLBs, story canvas, poses and clips, thumbnails and posters exported, turntable on the profile | Story/3D |
| **M4**: polish and proof | Lighthouse (a11y ≥ 95) on `/`, `/pets`, a profile and `/adopt`; incognito check; README; AI log; demo rehearsal | All |

If M3 slips, **ship M2**. The story still reads as an illustrated, accessible landing with posters or icons, and no rubric points are lost.

---

## 15. AI Iteration Log candidates (to be copied into EVALUATION.md §8 by the Lead)

| What the AI produced | What we checked | What was wrong | What we changed |
|---|---|---|---|
| A first palette idea: a bright coral CTA (`#F97316` / `#FF7A59`) with white text | Computed WCAG contrast with a script | 2.80:1 and 2.57:1, both failing 4.5:1 | Darkened to `#C2410C` (5.18:1); hover `#9A3412` (7.31:1) |
| A soft beige input border `#E7DCCF` | Non-text contrast (WCAG 1.4.11) | 1.35:1 against white, so the inputs were nearly invisible | Added a `field-border` token `#7A7189` (4.61:1); beige kept for decorative dividers only |
| Orange text on species-tinted cards | Contrast on each of the 5 tints | 4.27–4.31:1, failing | Orange text on tints uses `primary-strong` `#9A3412` (6.08:1) |
| A suggestion to render a live 3D `<View>` for every catalogue card | Mobile performance and screen-reader semantics | Heavy WebGL on the core-flow page, and no alt text | Pre-rendered WebP thumbnails with descriptive alt; live 3D only on the profile |
| A suggestion to put the inquiry in a slide-over drawer | Keyboard, focus trap, and Back-button behaviour at 360px | Modal risks with no rubric gain | A dedicated `/adopt/:id` route with focus moved to the success heading |
