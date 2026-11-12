# 3D scroll-storytelling research: Pet Adoption vs ACM Society

Researched 2026-11-12. Star counts and licenses come from GitHub. Live demos were **not** opened. Items marked *unverified* came only from search results.
Read this together with [EVALUATION.md](EVALUATION.md). The rubric gives **0 points for 3D or code sophistication** and **15 points for mobile and accessibility**. So the 3D story must lead into the main task and must fall back to a normal page.

---

## Verdict

| Factor | 🐾 Pet Adoption | 💻 ACM Society |
|---|---|---|
| Quality of the 3D assets | **9/10**: CC0 **animated** pets (walk/idle) by Quaternius and Kenney. Characters carry a story. | 7/10: plenty of CC0 tech props (sci-fi, space, laptops), but no characters, so the story becomes "camera flies through a world". |
| Best starter code | **9/10**: `haplollc/3d-scroll-story` (MIT) already handles reduced motion, separate phone layouts, a no-WebGL fallback and HTML text. | 7/10: `awwwards-3d` (MIT) has a good camera path but no accessibility. The best-looking repos (adrianhajdin) have **no license**. |
| Does the story fit the brief? | **9/10**: the brief asks for "emotionally engaging". Shelter → meet → home is a natural story arc. | 8/10: the brief invites "animations, interactive sections", and its required sections (events, team, projects…) map neatly onto story stops. |
| Does the story end in the main task? | **10/10**: the story ends at "Find my match" → inquiry form. | 7/10: "Join the chapter" is a weaker emotional payoff. |
| Accessibility and mobile risk | Low: a small scene with one character model (< 1 MB). | Medium: several props plus a long camera path. Heavy models (e.g. a 6 MB PC) need compressing. |
| Judge resonance | Good | **Very high** (this is their own society) |
| **Estimated rubric score with 3D story** | **≈ 93** | **≈ 87** |

**→ Build Pet Adoption.** Pick ACM only if judge resonance matters more to you than asset quality and accessibility risk.

---

## 🐾 Pet Adoption: ranked resources

### Code and templates
1. **[haplollc/3d-scroll-story](https://github.com/haplollc/3d-scroll-story)**
   - MIT, plain Three.js 0.170, no build step.
   - Sticky stage with one pose per scroll step.
   - Handles reduced motion, wide vs tall screens, a no-WebGL static image, and pauses rendering off screen.
   - Ships a strong SKILL.md.
   - Plan: swap `phone.js` for a GLTFLoader pet. **3–5 h.**
2. **[wass08/r3f-scrolling-animation-tutorial](https://github.com/wass08/r3f-scrolling-animation-tutorial)**
   - R3F + drei `ScrollControls` + GSAP. [Demo](https://r3f-scrolling-animation-tutorial-psi.vercel.app) · [Tutorial](https://dev.to/wawasensei/scroll-animations-with-react-three-fiber-and-gsap-273j)
   - No license, no accessibility handling, and its office model must be replaced.
   - The quickest React option. 3–4 h, plus about 2 h of accessibility work.
3. **[DrDavid31/dogui-3d](https://github.com/DrDavid31/dogui-3d)**: **copy its fallback pattern only** (no license).
   - All text in the DOM.
   - Reduced motion, no WebGL or no JavaScript shows a static page.
   - At 900px or narrower, or on touch screens, switches to a vertical flow.
4. **[Martin8O/Website](https://github.com/Martin8O/Website)**: use as an accessibility checklist reference (MIT).
   - Skip link, `aria-hidden` canvas, visible focus, static frames under reduced motion.
5. ⚠️ **[Abu-Fazal/first-3d-project](https://github.com/Abu-Fazal/first-3d-project)**: a dog scroll story, but **the dog model belongs to Dogstudio. Do not ship it.**

### Pet 3D models
1. **Quaternius on Poly Pizza (CC0, animated, glTF)**
   - [Dog](https://poly.pizza/m/2kUk0QqpCg) · [Shiba Inu](https://poly.pizza/m/y4wdQpg767) · [Cat](https://poly.pizza/m/2f54vbV0In) · [Wolf](https://poly.pizza/m/P1gU3Qkr9r)
   - ⚠️ Check each model's license. Some bundle items (e.g. Post-Apocalypse German Shepherd and Pug) are CC-BY and need credit.
2. **[Quaternius Ultimate Animated Animal Pack](https://quaternius.com/packs/ultimateanimatedanimals.html)**: CC0, 12 animals, 12+ animations. Quaternius house and furniture packs can fill a home scene (licenses *unverified*).
3. **[Kenney Cube Pets](https://kenney.nl/assets/cube-pets)**: CC0, animated dog and cat, ~1.1 MB zip. The cutest and lightest option.
4. **[Sketchfab Low-poly Black Dog](https://sketchfab.com/3d-models/low-poly-black-dog-ccb46d74399f442aad3f70341fd823ac)**: CC-BY 4.0 (credit required), 876 triangles, walk/idle/head-tilt.
5. **[Khronos glTF Fox](https://github.com/KhronosGroup/glTF-Sample-Assets/tree/main/Models/Fox)**: fallback only. The rig and animation are CC-BY.

Story suggestion (5 steps):
1. A lonely pup in the shelter
2. Meets someone
3. Plays (the walk animation)
4. Arrives at its new home
5. "Your turn: find your match" → the pet grid and inquiry flow, all in normal HTML

---

## 💻 ACM Society: ranked resources

### Code and templates
1. **[tsogjavklann/awwwards-3d](https://github.com/tsogjavklann/awwwards-3d)**
   - MIT, 36★. Three.js + GSAP ScrollTrigger + Lenis, no build step.
   - Its `room-walkthrough` template moves the camera along a spline. Also a Claude skill.
   - No accessibility handling. **6–10 h.**
2. **[adrianhajdin/project_3D_developer_portfolio](https://github.com/adrianhajdin/project_3D_developer_portfolio)**
   - 7.1k★. Sections map to the brief: hero PC, timeline → events, projects, contact → join.
   - ⚠️ **No license** (learn from it, don't copy it).
   - The PC model is about 6 MB (CC-BY, Yolala1232).
3. **[adrianhajdin/threejs-portfolio](https://github.com/adrianhajdin/threejs-portfolio)**
   - The most tech GLBs in one repo: hacker room, desk, computer.
   - ⚠️ No license. [Demo](https://threejscc-portfolio.vercel.app/)
4. **[wass08/r3f-scrolling-animation-tutorial](https://github.com/wass08/r3f-scrolling-animation-tutorial)**: the cleanest pattern of scroll driving a GSAP timeline.
5. **[AndrewPrifer/CodropsCameraFlyThroughTutorial](https://github.com/AndrewPrifer/CodropsCameraFlyThroughTutorial)**: MIT. Theatre.js camera fly-through.
6. **[14islands/r3f-scroll-rig](https://github.com/14islands/r3f-scroll-rig)**: MIT, 992★. A library that keeps the page as normal HTML and layers 3D on top. Not a template.
7. **[sanidhyy/space-portfolio](https://github.com/sanidhyy/space-portfolio)**: MIT, 547★, polished space backdrop. No models. [Demo](https://spaceportfolio.netlify.app/)

### Tech 3D models
1. **Poly Pizza**: [Laptop by Kenney](https://poly.pizza/m/GnbwSUiVty) (CC0) and [Server rack](https://poly.pizza/m/6ijQclm8jxw) (CC-BY 3.0). PCs and desks are also available (licenses *unverified*).
2. **[Quaternius Sci-Fi Essentials Kit](https://quaternius.com/packs/scifiessentialskit.html)**: CC0, 65 models, including animated robots and screens.
3. **[Kenney Space Kit](https://kenney.nl/assets/space-kit)**: CC0, 150 files.
4. **Sketchfab**: Gaming Desktop PC (CC-BY, about 6 MB, compress it first).
5. Tip: build circuit boards, network graphs and particle logos in code. They add 0 KB.

---

## Skills

| Skill | Verdict |
|---|---|
| `3d-web-experience` (claudiodearaujo/izacenter) | ❌ **Low.** The repo is now an unrelated therapist platform holding an old copy of this skill. Its code snippets don't run, and it says **nothing on accessibility or reduced motion**. If you want it anyway, the upstream copy is newer: `sickn33/antigravity-awesome-skills` |
| SKILL.md in `haplollc/3d-scroll-story` | ✅ **High.** Concrete numbers, reduced motion, mobile poses, iOS `svh` fix |
| `doodledood/claude-code-plugins` → `scrollytelling` | ✅ **High for the rubric.** Reduced motion is mandatory; covers WCAG, keyboard, screen readers. No 3D, so pair it with one of the 3D skills |
| `tsogjavklann/awwwards-3d` | 🟡 Medium. Good performance budgets and templates, no accessibility |
| `CloudAI-X/threejs-skills` | 🟡 Three.js API reference (4.1k★, MIT). Contents not opened |

Suggested pair: **`haplollc` SKILL.md + `scrollytelling`**.
