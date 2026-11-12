# PawPath: 3-minute demo script (both partners speak)

**Live:** https://pawpath-one.vercel.app · **Repo:** https://github.com/Ahmedgito/survivor-league
**Backup:** keep a screen recording plus screenshots on the laptop in case the Wi-Fi or hosting fails.

## Before you start
- Open the live site in a fresh browser window at the top of `/`. Clear "saved" hearts so the count starts at 0.
- Have a phone, or DevTools at 390px, ready for the mobile moment.

## 1. Audience and problem (Partner A, ~30s)
> "PawPath is for **teens and young adults adopting their first pet**. First-timers decide emotionally, and the most common reason adoptions fail is a **lifestyle mismatch**: a husky in a small flat, a kitten alone all day. So we designed for one task: **find a pet that fits your life, and send an adoption inquiry.**"

## 2. Live flow (Partner B, ~75s)
1. **Scroll the story:**
   > "Meet Biscuit; he's waited 214 nights. The scroll *is* the walk home: scroll faster and he runs, stop and he waits for you, scroll back and he turns around. Each section appears when something happens in the scene."
2. At the end panel, click **"Find my match"** → answer the 4 questions *using only the keyboard* (say so).
3. On the results page:
   > "Every pet gets a match score, up to 3 reasons **why it fits**, and one honest **heads-up**."
4. Click **"Ask to adopt …"** → submit the form **empty** → the error summary appears and focus goes to the first field → fill it in → submit → the success screen with next steps.
5. Quick tour:
   - `/pets` filters (show the URL updating)
   - heart a pet (the count in the nav updates, with a toast and Undo)
   - a profile with the **3D turntable** and its Pause button
6. Show the phone width for 5 seconds.

## 3. Design choice and AI iteration (Partner A, ~45s)
- **Design choice:**
  > "Story text is always real HTML on solid cards, and the 3D canvas is decorative. With reduced motion turned on, the story becomes a static, readable page. Immersive, but nobody is locked out."
- **AI checks** (pick 1–2 from the log, EVALUATION.md §8):
  - "The AI suggested a coral button. We measured the contrast at **2.8:1**, a fail, so we darkened it to **5.18:1**."
  - "In code review we found keyboard focus was **invisible site-wide**: Tailwind v4's `outline-none` cancelled our focus styles. We added a global fix and checked it in the browser."
  - "A downloaded bird model was lying on its side and the dogs had duplicated animations. We fixed both and compressed every pet to 300 KB or less."

## 4. Limitation and next step (Partner B, ~30s)
- **Limitation:**
  > "Inquiries aren't sent anywhere. The pets and shelters are fictional, and saved pets live only in this browser."
- **Next step:**
  > "Connect real shelter listings through an API, give shelters an inbox for inquiries, and add 'compare two pets'."

## Likely judge questions
- **"Why 3D?"** It carries the emotional story the brief asks for, and it teaches the matching idea. It's lazy-loaded, capped for phones, and switched off for reduced motion.
- **"Is the data real?"** No. Everything is fictional and labelled as such in the footer, the README and the form.
- **"What did you check yourselves?"** See the 14-entry AI Iteration Log in EVALUATION.md §8, plus Lighthouse accessibility scores and keyboard-only runs.
