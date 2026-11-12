# PawPath 🐾: find a pet that fits your life

**Brief:** #2 Pet Adoption Platform · ACM MAJU Vibe Coding Competition
**Team:** _<Partner 1 name> (<role>)_, _<Partner 2 name> (<role>)_
**Live demo:** https://pawpath-one.vercel.app
**Repository:** https://github.com/Ahmedgito/survivor-league

> ⚠️ **Demo project.** Every pet, shelter, person, phone number and email in this site is **fictional sample data**. No inquiries are sent and no payments are processed.

## Audience and primary task
**Audience:** teens and young adults (16–24) adopting their **first** pet, often living in a flat or with family.
**Primary task:** find a pet that fits your life and **send an adoption inquiry**.

## Key features
- **Immersive scroll story:** Biscuit the shelter dog's journey home, told in low-poly 3D as you scroll (Lenis smooth scroll + GSAP ScrollTrigger + React Three Fiber). It ends in a clear "Find my match" call to action.
- **Lifestyle Match quiz:** 4 questions (home, time at home, energy, who you live with) → pets ranked with a match %, up to 3 "why it fits" reasons and an honest "heads-up".
- **Pet catalogue:** filter by species, age, size, energy and good-with-kids/dogs/cats. Filters live in the URL, and the results count is announced to screen readers.
- **Pet profiles:** a 3D turntable of the pet with Rotate/Pause controls, personality traits, and adoption details (fee, vaccinated, neutered, fictional shelter).
- **Adoption inquiry form:** inline validation, an error summary, a simulated sending state, and a confirmation with next steps.
- **Saved pets:** heart any pet; the count shows in the navbar and on `/saved`.

## Design choices
- A warm, light palette (cream, ink, CTA orange `#C2410C`, teal), with every text pair checked at **≥ 4.5:1** (table in `docs/plan/01-experience.md` §4.1).
- Bricolage Grotesque for headings and Figtree for body text.
- All story text is real HTML on solid cards, never drawn into the canvas. The 3D layer is decorative (`aria-hidden`).
- The inquiry form has its own page instead of a drawer, so the Back button works and there is no focus trap.

## Accessibility and responsive checks
- Mobile-first; tested at 360 / 390 / 768 / 1280 px.
- **Motion:** animations are always on, by team decision, so every visitor gets the scroll story. Some laptops, including ours, report reduced motion by default and would otherwise only show still pictures. All story text is still real HTML on solid cards, and devices without WebGL get a static, readable version of the story.
- Skip links ("Skip to content", "Skip the story"), visible focus rings, labelled form fields with `aria-describedby` errors, `aria-pressed` filter chips, an `aria-live` results count.
- Lighthouse Accessibility (mobile, 360px): **100** on `/pets`, `/pets/biscuit`, `/pets/bubbles`, `/match`, `/match/results`, `/adopt/biscuit` and `/saved`; Best Practices 100

## AI tools used and what we checked or changed
- **Tools:** Claude Code (Claude Opus) as a team of agents (experience director, 3D asset engineer, component scout, three feature engineers and a QA pass), plus the React Bits and 21st.dev component libraries.
- **What we checked and changed** (full log in [EVALUATION.md §8](EVALUATION.md)):
  - We rejected an AI-proposed coral CTA: its contrast was only 2.8:1. We darkened it to `#C2410C` (5.18:1).
  - Downloaded components animated even with reduced motion, and some used click-only, non-keyboard triggers. We added reduced-motion paths and made all triggers keyboard accessible.
  - Downloaded 3D models: the bird was lying sideways, and the Shiba and Husky had duplicated animations. We fixed both and compressed every pet to ≤ 302 KB.
  - We refused a dog model copied from another public repo because it belongs to Dogstudio, and used only CC0 models instead.
  - All 3D models rendered almost black (they export as fully metallic). We made the materials non-metallic and re-checked every chapter in screenshots.
  - Keyboard focus was invisible site-wide: Tailwind v4's `outline-none` cancelled our focus styles. We added a global fix and verified it on every control.
  - On our own laptop the story never animated, because Windows "Animation effects" was off. We now force animations on for every visitor. Reviewing that code also caught a bug: `"prefers-reduced-motion".includes("reduce")` is always true, so we match the query value instead.

## Limitations and next steps
- **Limitations:** inquiries aren't sent anywhere; pets and shelters are fictional; saved pets only persist in this browser; visitors who prefer reduced motion can't switch the animations off yet.
- **Next steps:** real shelter listings via an API, shelter-side inquiry management, comparing two pets side by side, and a motion on/off control.

## Run locally
```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build in dist/
```

## Credits
- **3D pets, furniture and scenery:** [Quaternius](https://quaternius.com) (CC0), via [Poly Pizza](https://poly.pizza)
- **Bone and bowl props:** Kay Lousberg / [KayKit](https://kaylousberg.com) (CC0), via Poly Pizza
- **UI components:** adapted from [React Bits](https://reactbits.dev) by David Haz (MIT + Commons Clause) and [21st.dev](https://21st.dev) (SegmentedControl by @ddoemonn, MIT)
- **Icons:** [Lucide](https://lucide.dev) (ISC)
- **Fonts:** Bricolage Grotesque and Figtree via Google Fonts (OFL)
- **Libraries:** React, Tailwind CSS, Lenis, GSAP, three.js, React Three Fiber, drei, Motion, React Router

## Sample data
All people, pets, shelters, prices and contact details are **fictional** and for demonstration only (`src/data/pets.ts`). Contact emails use the reserved `example.com` domain. No real personal, student or health information is used. No payments are processed.
