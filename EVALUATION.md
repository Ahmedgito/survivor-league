# EVALUATION.md — How This Project Gets Scored (and How We Win)

> **Read this before every work session. Re-check it before every commit.**
> Event: ACM MAJU Vibe Coding Competition. All projects are judged on the **same 100-point rubric**.
> Every feature, design choice and line of copy should earn points on that rubric. If something doesn't, cut it.

---

## 0. The one-line strategy

**One clear user → one clear task → a flow that works, looks clean, runs on a phone, can be used with a keyboard, and that we can explain.**

The rubric explicitly says: *"Do not score prompt length, brand, plan, or code sophistication."*
So flashy tech, 3D, heavy animation and clever architecture earn **zero direct points**. Clarity, a working flow, accessibility and a good explanation earn **all** the points.

---

## 1. Rubric at a glance

| # | Criterion | Pts | What judges actually check | How we get full marks |
|---|-----------|-----|----------------------------|------------------------|
| 1 | **Fit to brief & user need** | **20** | Is the audience obvious? Is the core task well handled? Does the content support the brief? | Name the user and task on the landing page itself. Cover every item the brief lists. Realistic, relevant sample content (no lorem ipsum). |
| 2 | **Usability & main flow** | **20** | Can a first-time visitor see the next step? Are labels and the main action clear? Does the core flow work end to end? | One dominant primary button per screen. Plain-language labels. Every action gives visible feedback (toast, state change, confirmation). No dead links or fake buttons. |
| 3 | **Visual design & consistency** | **15** | Hierarchy, type, spacing, color support the content | 1–2 fonts, a fixed type scale, an 8px spacing grid, max ~5 colors as CSS variables. The same component looks the same everywhere. |
| 4 | **Responsive & basic accessibility** | **15** | Narrow screens, readable text, labels, focus, contrast, image descriptions | Mobile-first. Contrast ≥ 4.5:1. Visible focus ring. Every input has a `<label>`. Every meaningful image has `alt`. Respect `prefers-reduced-motion`. |
| 5 | **Originality & purposeful iteration** | **10** | A distinctive, *useful* choice, plus evidence the team **checked and edited AI output** | One signature feature that solves a real user problem. Keep an **AI Iteration Log** (section 8) showing what the AI got wrong and what we changed. |
| 6 | **Explanation & demonstration** | **10** | Audience, design choice, limitation, next step. **Both partners contribute.** | Rehearse the 4-part demo script (section 10). Split speaking roles. |
| 7 | **Deployment & submission** | **10** | Repo + live link work; README has team, brief, credits, sample data | Deploy early (day 1), re-verify in an incognito window, README from the template (section 9). |

**Where the points are:** 40 of 100 (Fit + Usability) depend on *one user completing one task*. Another 15 depend on accessibility and mobile. Only 15 are for looks.

### Band thresholds (don't fall into the middle band)

| Criterion | High band means… | Typical reason teams drop to the middle |
|-----------|------------------|------------------------------------------|
| Fit (17–20) | user + need clear, core task well addressed | one content area of the brief missing or half-done |
| Usability (17–20) | next step obvious, core flow works | confusing labels, no feedback after clicking |
| Visual (13–15) | hierarchy/type/spacing/colors support content | inconsistent spacing, mixed button styles |
| A11y (13–15) | mobile + labels + focus + contrast + alt text all addressed | missing focus styles, low-contrast text on images, unlabeled inputs |
| Originality (9–10) | distinctive useful choice **and** meaningful AI check/edit explained | no record of what was checked or changed |
| Explanation (9–10) | audience, design choice, limitation, next step; both speak | one person does all the talking, no limitation mentioned |
| Deployment (9–10) | both links work, README complete | README missing credits or the sample-data note |

---

## 2. Non-negotiable minimum deliverables (pass/fail gate)

Tick every box before submitting. Missing any of these caps several criteria at once.

- [ ] **One intended audience** and **one primary task**, written down (section 5) and visible in the UI copy
- [ ] **Landing view** with **≥ 3 useful items or steps** and **one clear primary action** (a single, visually dominant CTA)
- [ ] **At least one working interaction** related to the idea, with **visible feedback**
- [ ] **Mobile layout checked** (360px wide), **readable text and contrast**, **keyboard focus**, **clear labels**, **image descriptions**
- [ ] **Fictional sample data, clearly labeled** as fictional (e.g. a "Demo data — all pets/people are fictional" badge in the footer and a note in the README)
- [ ] **No** real personal, student or health information. **No** real payment processing.
- [ ] **README** with project name, team, chosen brief, **AI tools used and what we checked or changed**, asset credits, sample-data note
- [ ] **GitHub repo** and **hosted link**, both verified in a **fresh/incognito browser** (or a documented platform issue for fallback review)

---

## 3. Idea analysis and ranking

### How each idea was scored

Each brief was rated on what a 2-person team can **realistically achieve in hackathon time** for each criterion, plus these risk factors:

- **Task clarity:** does the brief naturally give *one user + one task + one CTA*?
- **Scope risk:** how many features must exist before the brief counts as "covered"?
- **A11y/mobile risk:** do the brief's expected features (heavy animation, dense tables, custom media controls, calendars) make accessibility hard?
- **Crowding risk:** how many other teams will build the same generic thing? This hurts originality.
- **Judge resonance:** will ACM MAJU judges connect with the problem personally?

Deployment (10) is the same for every idea (all are static front-end sites), so it doesn't change the ranking.

### Estimated achievable score (well-executed, realistic scope)

| Rank | Idea | Fit /20 | Usability /20 | Visual /15 | Resp & A11y /15 | Originality /10 | Explain /10 | Deploy /10 | **Total** |
|:----:|------|:-------:|:-------------:|:----------:|:---------------:|:---------------:|:-----------:|:----------:|:---------:|
| 🥇 1 | **2. Pet Adoption Platform** | 19 | 19 | 14 | 14 | 9 | 9 | 10 | **94** |
| 🥈 2 | **6. MAJU Portal Redesign** | 19 | 17 | 13 | 12 | 9 | 10 | 10 | **90** |
| 🥉 3 | **7. ACM Society Website** | 17 | 17 | 14 | 13 | 8 | 9 | 10 | **88** |
| 4 | 4. Real Estate Platform | 18 | 18 | 13 | 13 | 7 | 8 | 10 | **87** |
| 5 | 3. Music Streaming Interface | 16 | 17 | 14 | 11 | 8 | 8 | 10 | **84** |
| 6 | 1. E-commerce Store | 17 | 18 | 13 | 13 | 5 | 7 | 10 | **83** |
| 7 | 10. Business & Job Hiring | 17 | 17 | 12 | 12 | 6 | 8 | 10 | **82** |
| 8 | 9. Journaling & Planner App | 16 | 15 | 13 | 11 | 7 | 8 | 10 | **80** |
| 9 | 8. Coffee Brand Website | 13 | 15 | 15 | 11 | 7 | 8 | 10 | **79** |
| 10 | 5. Futuristic Car Website | 12 | 13 | 15 | 9 | 7 | 8 | 10 | **74** |

> These are estimates of the *ceiling under realistic constraints*, not guarantees. Execution matters more than the pick.

### Why each idea landed where it did

**🥇 1. Pet Adoption Platform (94)**
- ✅ The brief *names the audience* (teens and young adults), so Fit starts high.
- ✅ The primary task is natural and single: **find a compatible pet → send an adoption inquiry**. That's a perfect "one clear primary action".
- ✅ The flow is short and testable: browse → filter → profile → inquiry form → confirmation. Easy to show feedback.
- ✅ Image-heavy content makes **alt text** natural, and simple forms make **labels** easy, so A11y points come cheap.
- ✅ "Emotionally engaging" gives room for originality that is also *useful* (e.g. a lifestyle-match quiz), which is what the rubric asks for.
- ⚠️ Risk: generic "cute pet grid" looks. Mitigate with one signature feature and warm, consistent visual identity.

**🥈 2. MAJU Portal Redesign (90)**
- ✅ **Strongest judge resonance**: the judges *are* MAJU people who know the real portal's pain points, so the Explanation and Originality story writes itself ("here's what was broken, here's our fix").
- ✅ The user is crystal clear (a MAJU student). The task can be sharpened, e.g. *"check if I'm at risk on attendance and what I owe"*.
- ⚠️ Dense data (attendance tables, results, fee vouchers) is **hard to make responsive and accessible**. Tables on 360px screens are a classic point-loser.
- ⚠️ Dashboards lack a single obvious "next step", so the Usability criterion needs deliberate design.
- ⚠️ **High crowding risk**: many teams will pick this, so originality must come from real insight, not just "made it prettier".
- ⚠️ Must use *fictional* student records. Never use real names or IDs.

**🥉 3. ACM Society Website (88)**
- ✅ Home-turf judges, clear task (*join the chapter / register for an event*).
- ⚠️ The brief has a long content list (events, past events, team, projects, achievements, membership). Easy to leave one thin, which drops Fit.
- ⚠️ Can't use real member data. Fictional team members only.
- ⚠️ Judges have a mental model of their own society, so any mismatch is noticed.

**4. Real Estate Platform (87)**
- ✅ Very clear flow (filter → property page → inquiry) and strong usability potential.
- ⚠️ Generic. Hard to stand out on Originality. Galleries and filters take time to make accessible.

**5. Music Streaming Interface (84)**
- ✅ Theme freedom (Y2K / Cyberpunk) means high visual potential, and play/pause gives obvious feedback.
- ⚠️ Custom audio controls are an **accessibility trap** (keyboard, ARIA, focus). Audio assets need licensing credits. The primary task is fuzzy ("discover and play").

**6. E-commerce Store (83)**
- ✅ Familiar, well-understood flow (catalog → cart → checkout).
- ⚠️ The **most crowded** brief, so Originality suffers. Recreating a real brand's identity earns nothing ("do not score brand") and adds IP risk. A simulated checkout must clearly *not* take payments.

**7. Business & Job Hiring (82)**
- ✅ Clear flows (search → job → apply / save).
- ⚠️ Two audiences (employers *and* seekers) work against "one audience, one task". Lots of content to fake convincingly. Low visual excitement.

**8. Journaling & Planner App (80)**
- ✅ Lots of genuine interactivity.
- ⚠️ **Biggest scope-creep risk** (dashboard + calendar + planner + todos + notes + habits). Calendar grids and drag-and-drop are hard to make keyboard-accessible and mobile-friendly. A half-built feature drops Fit and Usability together.

**9. Coffee Brand Website (79)**
- ✅ Visual design can hit 15/15.
- ⚠️ A brand showcase has a **weak "primary task"**, and parallax and animation hurt reduced-motion, mobile and contrast scores. Visual design is only worth 15 points.

**10. Futuristic Car Website (74)**
- ⚠️ The brief pushes cinematic transitions, scroll animations and dark themes, all of which **cost** A11y points (contrast, motion, mobile performance) and earn nothing under "code sophistication".
- ⚠️ The audience and task are the weakest of all ten ("who is this for, and what do they *do*?"). A color configurator helps, but only partly.

### Recommendation

**Pick #1, Pet Adoption**, if you are free to choose. It has the highest ceiling with the lowest risk, and its natural shape matches the rubric almost one to one.

**Pick #2, MAJU Portal**, if your team has a sharp, specific insight about the real portal's problems *and* is confident building responsive data views. It has the highest "wow" with these judges, but it's riskier.

If the brief is **assigned by draw**, everything below still applies. Just rewrite section 5 for your brief.

---

## 4. Golden rules while developing

1. **The flow beats features.** A complete, polished browse → act → confirm flow is worth more than five half-built sections.
2. **Every click must answer back.** Buttons give visible feedback (state change, toast, confirmation screen, count badge).
3. **No fake buttons.** If it looks clickable, it works. If it can't work, remove it or mark it "coming soon" with no link styling.
4. **Mobile-first, every time.** Check 360px after every major change, not at the end.
5. **Keyboard-test every interactive thing.** Tab through it: can you see the focus? Can you activate it with Enter/Space? Can you escape modals?
6. **Semantic HTML first.** Use `<button>`, `<a>`, `<label>`, `<nav>`, `<main>`, `<h1>`→`<h2>` in order. Use ARIA only when HTML can't do it.
7. **Design tokens, not ad-hoc values.** Colors, spacing, radii and fonts live in CSS variables. Nothing is hard-coded twice.
8. **Animation is seasoning.** Keep transitions under 300ms, wrap them in `@media (prefers-reduced-motion: no-preference)`, and never hide content behind them.
9. **Label fictional data.** Use a visible "Demo / fictional data" note, fictional names, and fictional phone numbers and emails (e.g. `hello@example.com`).
10. **Log every AI correction** in section 8 as it happens. This *is* the Originality score.
11. **Deploy on day 1** and redeploy often. Never leave deployment to the last hour.
12. **When in doubt, cut scope.** Ask "which rubric line does this earn points on?" If the answer is none, skip it.

---

## 5. Our project definition (fill in and keep current)

```
Brief chosen:        #2  Pet Adoption Platform  →  "PawPath"
Intended audience:   Teens and young adults (16–24) adopting their FIRST pet, often living in a flat or
                     with family, who decide emotionally but need an honest fit.
Primary task:        Find a pet that fits your life and send an adoption inquiry.
Primary action/CTA:  "Find my match" (landing) → "Ask to adopt {name}" (profile) → "Send my inquiry" (form)
Signature feature:   1) An immersive scroll story: Biscuit the shelter dog's journey home, in low-poly 3D,
                     which teaches the matching idea. 2) Lifestyle Match: 4 questions → ranked pets with
                     a % score, "why it fits" reasons and one honest "heads-up". This targets the most
                     common reason adoptions fail: a lifestyle mismatch.
Known limitation:    Inquiries are not sent anywhere. Pets and shelters are fictional, and saved pets live
                     only in this browser (localStorage).
Next step:           Real shelter listings via an API, shelter-side inquiry management, compare two pets.
```

Full blueprint: [docs/plan/01-experience.md](docs/plan/01-experience.md) · Assets: [docs/plan/02-assets.md](docs/plan/02-assets.md) · Components: [docs/plan/03-components.md](docs/plan/03-components.md)

### Example: Pet Adoption (if chosen)

- **Audience:** teens and young adults (16–24) considering adopting their first pet
- **Primary task:** find a pet that fits their lifestyle and send an adoption inquiry
- **Primary CTA:** "Find my match"
- **Landing view (≥ 3 useful items):** 1) Take a 3-question match quiz, 2) Browse pets by type, 3) Learn the adoption steps
- **Signature feature:** a *Lifestyle Match* quiz (home size, time at home, energy level) that filters pets and shows **why** each pet matches ("Great for apartments · Low energy"). It's useful, not decorative.
- **Must-have scope (MVP):** landing, filterable pet grid (type/age/size/energy), pet profile page, inquiry form with validation and a confirmation state, "saved pets" (heart) with a visible count
- **Stretch (only if MVP is fully polished):** adoption-readiness checklist, compare two pets, dark mode
- **Limitation to mention:** inquiries aren't sent anywhere (front-end demo with fictional shelters)
- **Next step:** connect to real shelter listings via an API, add shelter-side management

---

## 6. Accessibility and responsive checklist (15 points live here)

**Responsive**
- [ ] No horizontal scroll at 360px, 768px or 1280px
- [ ] Tap targets at least 44×44px
- [ ] Navigation collapses to an accessible menu (a button with `aria-expanded`)
- [ ] Data tables become stacked cards on mobile (if any)
- [ ] Images use `max-width: 100%` and don't distort (use `object-fit`)

**Readable text and contrast**
- [ ] Body text ≥ 16px, line-height ~1.5
- [ ] Text contrast ≥ 4.5:1 (large text ≥ 3:1). Check with the DevTools contrast picker or Lighthouse.
- [ ] No text placed directly on busy images without an overlay

**Keyboard and focus**
- [ ] Everything interactive is reachable with Tab, in a logical order
- [ ] A visible focus style (`:focus-visible` outline). **Never** `outline: none` without a replacement.
- [ ] Modals trap focus, close on Esc, and return focus to the trigger
- [ ] A "Skip to content" link

**Labels and semantics**
- [ ] Every form field has a visible `<label>`. Placeholders are not labels.
- [ ] Error messages are specific ("Enter a valid email"), shown next to the field, and announced (`aria-live` or `aria-describedby`)
- [ ] Icon-only buttons have an `aria-label`
- [ ] One `<h1>` per page, with headings in order

**Images and media**
- [ ] Meaningful images have descriptive `alt` ("Golden retriever puppy lying on grass", not "image1")
- [ ] Decorative images use `alt=""`
- [ ] Animations respect `prefers-reduced-motion`

**Tooling:** run a **Lighthouse** audit (target Accessibility ≥ 95) and fix every flagged item. Screenshot the score for the demo.

---

## 7. Visual consistency checklist

- [ ] At most 2 font families. A defined type scale (e.g. 14 / 16 / 20 / 28 / 40).
- [ ] Spacing in multiples of 4 or 8px only
- [ ] A palette defined as CSS variables: primary, accent, background, surface, text, muted, plus success and error
- [ ] One button style per level (primary / secondary / ghost), used the same everywhere
- [ ] Cards, inputs and radii look the same across pages
- [ ] Clear hierarchy: in each section it's obvious what to read first
- [ ] Empty, loading and error states designed (e.g. "No pets match these filters — clear filters")

---

## 8. AI Iteration Log (this is the Originality score)

The rubric rewards teams who **"explain a meaningful check or edit to AI output."** Log entries as they happen; don't reconstruct them at the end.

| # | Date | What the AI produced | What we checked | What was wrong or weak | What we changed and why |
|---|------|----------------------|-----------------|------------------------|-------------------------|
| 1 | 2026-11-12 | A first palette with a bright coral CTA (`#F97316` / `#FF7A59`) and white text | WCAG contrast, computed with a script | 2.80:1 and 2.57:1, failing 4.5:1 | Darkened the CTA to `#C2410C` (5.18:1), hover `#9A3412` (7.31:1) |
| 2 | 2026-11-12 | A soft beige input border `#E7DCCF` | Non-text contrast (WCAG 1.4.11) | 1.35:1 against white, so the inputs were nearly invisible | Added a `field-border` token `#7A7189` (4.61:1); beige is kept for decorative dividers only |
| 3 | 2026-11-12 | An AI suggestion to render a live 3D view inside every catalogue card | Mobile performance and screen-reader semantics | Heavy WebGL on the core-flow page, and no alt text | Cards use tinted visuals; live 3D appears only on the profile turntable, with a text description |
| 4 | 2026-11-12 | An AI suggestion to put the inquiry form in a slide-over drawer | Keyboard focus trap and Back-button behaviour at 360px | Modal risks with no usability gain | A dedicated `/adopt/:petId` page; focus moves to the success heading |
| 5 | 2026-11-12 | React Bits components as downloaded (BlurText, RotatingText, ScrollReveal, SegmentedControl, ClickSpark…) | Reduced-motion behaviour, keyboard access, contrast | They animated even with reduced motion, were triggered by clicking non-buttons, inactive labels were 4.2:1, and ClickSpark's default colour was invisible white | Added reduced-motion paths, removed the click-only triggers, raised the contrast to 6.9:1, themed via CSS tokens |
| 6 | 2026-11-12 | A 21st.dev bottom-nav component | Licence, focus styles | No licence listed, and it stripped the focus ring (`focus-visible:ring-0`) | Rejected; wrote our own accessible nav |
| 7 | 2026-11-12 | Downloaded 3D models (Poly Pizza) | Inspected orientation, clips and size with gltf-transform | The bird lay on its side facing +X; Shiba and Husky had every animation duplicated (24 clips); the files were 441–477 KB | Baked the bird upright facing +Z, removed duplicate clips, meshopt-compressed to ≤ 302 KB per pet (1.31 MB total) |
| 8 | 2026-11-12 | Downloading a dog model from another public repo ("it's only for personal use") | Licence check | The model belongs to Dogstudio; a public repo and hosted link redistribute it | Used only CC0 Quaternius models; credits in the README |
| 9 | 2026-11-12 | First match-scoring rule: home points only if `bestHome` contained the exact home type | Ran the rule against the real dataset | A cat suited to "flat or house" lost all 30 home points for someone with a yard | Ranked the home types so more space never costs points |
| 10 | 2026-11-12 | Inquiry form submit handler | Rapid double-click test | A fast double-click saved 2 inquiries | Added a guard that updates instantly; re-tested with 3 rapid clicks, which saved 1 inquiry |
| 11 | 2026-11-12 | Quiz focus management | Keyboard walkthrough at 360px | Focus moved under the fixed navbar; the first invalid field had no visible focus ring | Scroll offset for the navbar; focus ring on every focused text field |
| 12 | 2026-11-12 | Shared Button/Chip/SegmentedControl styles (`outline-none focus-visible:outline-3`) | Inspected computed styles of keyboard-focused elements | In Tailwind v4, `outline-none` sets `outline-style: none`, so focus rings were **invisible** site-wide | Added a global unlayered `:focus-visible` rule (3px, `#2563EB`; sun yellow on night surfaces) |
| 13 | 2026-11-12 | AI-planned 6-segment species filter | Tested at 360px | "Fish" was clipped off-screen | Wrapping `aria-pressed` chips on phones; the segmented control from 640px up |
| 14 | 2026-11-12 | 3D pet tinting with the full `pet.tint` colour | Visual check of each pet in the turntable | The texture-atlas dog went almost black; the goldfish turned brown | Tint depends on the material: full colour for flat materials, a 50% blend for texture atlases |
| 15 | 2026-11-12 | Quiz "don't move focus on first load" logic (a `firstRender` ref) | Keyboard check: where is focus right after opening `/match`? | React StrictMode runs effects twice on mount, so the second run stole focus to Question 1 and skipped the skip link, navbar and intro | Track the last focused step instead of a boolean; focus now stays on the page on load and moves only when the step changes |
| 16 | 2026-11-12 | Save-heart button names and profile copy | Screen-reader names in the accessibility tree; read every pet profile | The saved heart was announced "Remove Luna from saved, pressed" (two states at once); the goldfish page said "see how well him fits", "slow walks" and "Neutered: Not yet" | Stable name "Save Luna" + `aria-pressed`; fixed the sentence; species-aware energy hint; vet rows hidden for fish and birds |
| 17 | 2026-11-12 | 3D story scene with the downloaded Quaternius/KayKit models | Screenshots of every chapter | All models rendered almost black: they export with metalness ≈ 1 and the scene has no environment map | Materials made non-metallic on load; re-checked in screenshots |
| 18 | 2026-11-12 | First scroll-story timeline | Compared the card timing with the 3D action while scrolling | The 3D ran about half a screen ahead of the cards, and overlapping scroll ranges made the Home scene play twice as fast | One shared timeline with non-overlapping ranges; each card is shown only when its scene beat happens (door open, pet landed, signpost passed) |
| 19 | 2026-11-12 | Walk-home progress bar using Tailwind `scale-x-0` | Watched the bar while scrolling | Tailwind v4's `scale-x-*` uses the CSS `scale` property, which cancelled the inline `transform: scaleX()`, so the bar stayed empty | Inline transform only |
| 20 | 2026-11-12 | The whole immersive story, tested on the team laptop | Checked why the deployed story showed still pictures; read the Windows setting | Windows "Animation effects" was off, so Chrome reported `prefers-reduced-motion: reduce` and the 3D story **never played**. Judges' laptops can have the same setting | First added an opt-in Animations toggle. The team then chose to **force animations on for every visitor**, so the story always plays. The trade-off (reduced-motion users can't switch them off yet) is listed under Limitations in the README |
| 21 | 2026-11-12 | An AI-generated shell edit to `vercel.json` (adding `robots.txt` to the rewrite) | Parsed the file with `JSON.parse` before pushing | It wrote `robots\.txt`, an invalid JSON escape that would have broken the Vercel deploy | Rewrote the pattern without the escape; validated before commit |
| 22 | 2026-11-12 | AI-written `matchMedia` override for reduced-motion queries | Re-read the code before shipping the forced-on version, then tested both queries in the browser | `query.includes('reduce')` is true for **every** reduced-motion query ("reduce" is inside "prefers-reduced-motion"), so `(prefers-reduced-motion: no-preference)` was answered wrong | Matched the query value with a regex; verified in the browser: reduce → false, no-preference → true, other queries unaffected |

**Good things to check and log:**
- Contrast failures in AI-picked colors (fixed after a Lighthouse or contrast check)
- Missing labels, alt text or focus states in generated components
- Generic AI copy rewritten for the real audience
- Layouts that broke on mobile
- Real-looking personal data the AI invented, replaced with clearly fictional data
- Over-engineered features the AI suggested that we cut to keep the flow focused

Aim for **3–5 strong entries**, and pick the best 1–2 for the demo.

---

## 9. README template (10 points of deployment and submission depend on it)

```markdown
# <Project Name>

**Brief:** #<n> — <Brief title> · ACM MAJU Vibe Coding Competition
**Team:** <Name 1> (<role>), <Name 2> (<role>)
**Live demo:** <hosted URL>
**Repository:** <GitHub URL>

## Audience & primary task
<One sentence audience.> <One sentence primary task.>

## Key features
- ...

## Design choices
- ...

## Accessibility & responsive checks
- Tested at 360 / 768 / 1280 px · Lighthouse Accessibility: <score>
- Keyboard-navigable, visible focus, labeled forms, alt text on all images

## AI tools used & what we checked/changed
- Tools: <e.g. Claude Code, ...>
- <2–4 bullets from the AI Iteration Log>

## Limitations & next steps
- ...

## Credits
- Images: <source + license, e.g. Unsplash photographers / generated>
- Icons / fonts: <source + license>

## Sample data
All people, pets, records, prices and contact details are **fictional** and for demonstration only.
No real personal, student or health information is used. No payments are processed.
```

---

## 10. Demo script (both partners must speak)

Keep it to about 3 minutes, split across both partners:

| Part | Who | Content |
|------|-----|---------|
| 1. **Audience and problem** (30s) | Partner A | "Our user is ___. Their problem is ___. So the one task we designed for is ___." |
| 2. **Live main flow** (75s) | Partner B | Walk the primary task end to end on the **live link**. Point out the feedback states. Briefly show the mobile view. |
| 3. **Design choice and AI iteration** (45s) | Partner A | One key design decision and why. One concrete example of AI output we checked and fixed. |
| 4. **Limitation and next step** (30s) | Partner B | An honest limitation, then what we'd build next. |

**Backup:** keep a screen recording and screenshots in case the venue Wi-Fi or hosting fails.

---

## 11. Final pre-submission check (do it in an incognito window)

- [ ] Live URL opens in a **fresh/incognito browser** with no console errors
- [ ] GitHub repo is **public** (or access is granted) and the README renders correctly
- [ ] The full primary flow works on the live site, on desktop **and** on a real phone
- [ ] All images load (no broken paths, and filenames match case, since hosting is case-sensitive)
- [ ] Lighthouse Accessibility ≥ 95 on the main pages
- [ ] Fictional-data label visible in the UI
- [ ] No real personal data anywhere (search the code for real names, phone numbers, emails)
- [ ] README complete: team, brief, AI tools with checks and changes, credits, sample-data note
- [ ] Both links pasted into the submission form and clicked once more after submitting

---

## 12. Self-score sheet (re-score at every milestone)

| Criterion | Max | Milestone 1 | Milestone 2 | Final | Biggest gap to fix next |
|-----------|-----|-------------|-------------|-------|-------------------------|
| Fit to brief & user need | 20 | | | | |
| Usability & main flow | 20 | | | | |
| Visual design & consistency | 15 | | | | |
| Responsive & basic accessibility | 15 | | | | |
| Originality & purposeful iteration | 10 | | | | |
| Explanation & demonstration | 10 | | | | |
| Deployment & submission | 10 | | | | |
| **Total** | **100** | | | | |

> Fix the **lowest-scoring criterion relative to its band** first. A jump from the middle band to the high band on a 20-point criterion is worth more than polishing a 10-pointer.
