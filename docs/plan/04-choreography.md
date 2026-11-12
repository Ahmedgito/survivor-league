# 04: Scroll choreography (this overrides §6 of 01-experience.md where they conflict)

**Product owner's definition of "immersive":** the **scroll physically drives the characters**. Real walk and run cycles play while you scroll, animals enter and act, and HTML sections **appear because something happened in the scene**.

## Core mechanics
1. **Scroll-velocity locomotion**
   - The dog's Walk/Run `timeScale` follows scroll velocity (Lenis), damped.
   - Slow scroll → Walk, fast scroll → Run.
   - Stop → Idle within about 0.4s, with the dog turning toward the camera.
   - **Scroll up → the dog turns around and walks back.**
2. **Scene-triggered sections:** each card enters when its beat happens (a door opens, the dog reaches a signpost, a pet lands on its spot). The cards and the scene share one progress timeline.

## Set-pieces
| # | Chapter | What the scene does | What the HTML layer does |
|---|---|---|---|
| 1 | Waiting (night) | Dog idle behind a fence by the shelter cabin; fireflies; the camera dollies in; the dog sniffs (Idle_Eating) | "Biscuit has waited 214 nights." |
| 2 | Noticed | The door swings open on scroll, warm light floods in, and the dog **jumps** and **runs** to the door | A card appears once the door is open: "Then someone noticed." |
| 3 | The right fit | Cat, rabbit, Shiba and Husky **walk in one by one** onto spots; the bird flies across in an arc | A trait tag pops beside each pet as it lands, then the matching-idea card |
| 4 | The walk home ⭐ | **Scroll = walking.** The dog walks or runs along a path while trees and fences stream past; the bird follows | Milestone signpost cards appear as the dog passes them |
| 5 | Home | The house and sofa slide in, the dog walks to its bowl and eats, the bone drops in with a bounce, and the camera pulls back in warm light | "Home." |
| 6 | Your turn | All the pets stand in a row (Idle) | End panel: the "Find my match" CTA + 3 useful items |

**Accessibility is unchanged:**
- The canvas is `aria-hidden` and all copy is real HTML.
- There is a "Skip the story" link.
- Reduced motion or no WebGL gives a static, readable sequence.

**Demo talking point:** "The scroll *is* the walk home. Scroll faster and Biscuit runs, stop and he waits for you, scroll back and he turns around."
