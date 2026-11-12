# 05 — Real pet photos (Meet the pets)

**Rubric:** Visual design & polish (real, relevant HD photos instead of emoji placeholders), Accessibility
(hand-written alt text, credit links, no layout shift), Deployment (credits ready for the README).

The pets are **fictional sample data**. Each photo is a **stand-in** that matches the pet's species, breed
and colour. All 12 photos are **free to use under the Unsplash License**. We opened every photo page to check
the licence line ("Free to use under the Unsplash License"). No Unsplash+ (premium, `plus.unsplash.com`) images were used.

Files are pre-sized WebP from the Unsplash imgix CDN (`fit=crop`, 4:3). Each pet has two files in `public/pets/`:
`<id>-800.webp` (800×600, cards) and `<id>-1600.webp` (1600×1200, profile hero and HD screens).
Data and alt text: `src/features/pets/petPhotos.ts`.

| id | Files | Photographer | Profile | Photo page | Licence |
|---|---|---|---|---|---|
| biscuit | `biscuit-800.webp`, `biscuit-1600.webp` | Priyansh Patidar | https://unsplash.com/@priyanshh32 | https://unsplash.com/photos/a-dog-standing-on-a-road-qFfLfa1lk9c | Unsplash License |
| mochi | `mochi-800.webp`, `mochi-1600.webp` | Joshua katt | https://unsplash.com/@josh_katt | https://unsplash.com/photos/a-shiba-inu-dog-stands-on-a-wall-outdoors-qdQo3Vpdk1I | Unsplash License |
| storm | `storm-800.webp`, `storm-1600.webp` | Yaroslava Holiachenko | https://unsplash.com/@yara_gr | https://unsplash.com/photos/a-husky-dog-sits-on-a-rock-outdoors-O0qkeMEQqsk | Unsplash License |
| peanut | `peanut-800.webp`, `peanut-1600.webp` | Дарья Шкаруба | https://unsplash.com/@223103d | https://unsplash.com/photos/a-beagle-dog-sits-looking-directly-at-the-camera-X-CdDuLR4u8 | Unsplash License |
| luna | `luna-800.webp`, `luna-1600.webp` | Milada Vigerova | https://unsplash.com/@milada_vigerova | https://unsplash.com/photos/russian-blue-cat-on-white-floor-0TPAlZ87mzk | Unsplash License |
| pumpkin | `pumpkin-800.webp`, `pumpkin-1600.webp` | Fernando Vega | https://unsplash.com/@fernandosarapita | https://unsplash.com/photos/orange-tabby-cat-with-black-background-W6_PNq9EmN4 | Unsplash License |
| pixel | `pixel-800.webp`, `pixel-1600.webp` | Kristin Kenney | https://unsplash.com/@kkinnyc | https://unsplash.com/photos/black-and-white-kitten-sitting-JWueda_SUEQ | Unsplash License |
| clover | `clover-800.webp`, `clover-1600.webp` | Chee Kee | https://unsplash.com/@cheekee | https://unsplash.com/photos/a-white-and-brown-rabbit-sitting-on-top-of-a-floor-jXMk_cdF-Vs | Unsplash License |
| oreo | `oreo-800.webp`, `oreo-1600.webp` | Nikolett Emmert | https://unsplash.com/@niki_emmert | https://unsplash.com/photos/a-black-and-white-rabbit-sitting-on-a-black-surface-AwbAG0YMxHg | Unsplash License |
| kiwi | `kiwi-800.webp`, `kiwi-1600.webp` | Dmytro Koplyk | https://unsplash.com/@dkoplyk | https://unsplash.com/photos/a-blue-jay-perched-on-a-tree-branch-sMlf45tUVpA | Unsplash License |
| bubbles | `bubbles-800.webp`, `bubbles-1600.webp` | fishy fishy | https://unsplash.com/@its12_06pm | https://unsplash.com/photos/a-vibrant-goldfish-swims-in-a-clear-aquarium-zxdn0PGevRo | Unsplash License |
| nova | `nova-800.webp`, `nova-1600.webp` | Reba Spike | https://unsplash.com/@rebaspike | https://unsplash.com/photos/white-and-brown-siberian-husky-puppy-on-green-grass-during-daytime-ISahwf9hCNg | Unsplash License |

## How it is used
- **Catalogue / saved / match cards** (`PetCard` → `PetPhoto`): `<img>` with `srcset` 800w/1600w and `sizes`, `width`/`height` set and a fixed
  16:10 frame (no layout shift), `object-fit: cover`. The first 3 cards load eagerly with `fetchpriority="high"`; the rest are lazy.
  If there is no photo or it fails to load, the card falls back to the tinted illustration (`PetVisual`).
- **Profile** (`PetProfilePage` → `ProfileVisual`): the 1600w photo is the hero (4:3), with a credit caption linking to the photo page.
  A "Photo" / "3D model" toggle (buttons with `aria-pressed`) switches to the existing 3D turntable, which keeps its own controls.

## Selection notes (the AI agent viewed a preview of every candidate before choosing; a human should spot-check)
- Rejected candidates: a black/tan/white Husky for Storm (wrong colours); a Shiba crop where the head was cut off;
  a rabbit photo with a blurred human hand in frame (Oreo); a long-haired grey cat for Luna (she is a shorthair).
- Nova is a young cream-and-white Husky rather than a tiny puppy (the closest light-coloured match).
- Peanut's Beagle looks mature but has no strongly grey muzzle.
