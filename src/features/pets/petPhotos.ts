/**
 * Real pet photos for the catalogue cards and profile hero. The pets themselves are FICTIONAL sample
 * data: each photo is a stand-in that matches the pet's species, breed and colour.
 * All photos are free to use under the Unsplash License (checked on each photo page; no Unsplash+).
 * Files live in /public/pets as pre-sized WebP: 800×600 (cards) and 1600×1200 (profile / HD).
 */

export interface PetPhotoCredit {
  name: string
  profileUrl: string
  photoUrl: string
  source: 'Unsplash' | 'Pexels'
}

export interface PetPhoto {
  src800: string
  src1600: string
  /** Describes what is actually in the photo. */
  alt: string
  credit: PetPhotoCredit
}

const base = import.meta.env.BASE_URL

function photo(id: string, alt: string, name: string, username: string, photoUrl: string): PetPhoto {
  return {
    src800: `${base}pets/${id}-800.webp`,
    src1600: `${base}pets/${id}-1600.webp`,
    alt,
    credit: { name, profileUrl: `https://unsplash.com/@${username}`, photoUrl, source: 'Unsplash' },
  }
}

export const PET_PHOTOS: Record<string, PetPhoto> = {
  biscuit: photo(
    'biscuit',
    'Tan mixed-breed dog with a curled tail, smiling with its mouth open, standing outdoors',
    'Priyansh Patidar',
    'priyanshh32',
    'https://unsplash.com/photos/a-dog-standing-on-a-road-qFfLfa1lk9c',
  ),
  mochi: photo(
    'mochi',
    'Red Shiba Inu in a harness standing on a stone wall, with hills and blue sky behind',
    'Joshua katt',
    'josh_katt',
    'https://unsplash.com/photos/a-shiba-inu-dog-stands-on-a-wall-outdoors-qdQo3Vpdk1I',
  ),
  storm: photo(
    'storm',
    'Grey and white Siberian Husky with one blue eye, sitting outdoors near pine trees',
    'Yaroslava Holiachenko',
    'yara_gr',
    'https://unsplash.com/photos/a-husky-dog-sits-on-a-rock-outdoors-O0qkeMEQqsk',
  ),
  peanut: photo(
    'peanut',
    'Mature tricolour Beagle with soft droopy ears, sitting and looking up at the camera',
    'Дарья Шкаруба',
    '223103d',
    'https://unsplash.com/photos/a-beagle-dog-sits-looking-directly-at-the-camera-X-CdDuLR4u8',
  ),
  luna: photo(
    'luna',
    'Grey shorthair cat with yellow-green eyes sitting on a light floor, looking up',
    'Milada Vigerova',
    'milada_vigerova',
    'https://unsplash.com/photos/russian-blue-cat-on-white-floor-0TPAlZ87mzk',
  ),
  pumpkin: photo(
    'pumpkin',
    'Orange tabby cat in warm sunlight, calmly gazing to the side against a dark background',
    'Fernando Vega',
    'fernandosarapita',
    'https://unsplash.com/photos/orange-tabby-cat-with-black-background-W6_PNq9EmN4',
  ),
  pixel: photo(
    'pixel',
    'Black-and-white tuxedo kitten with white paws sitting beside a food bowl',
    'Kristin Kenney',
    'kkinnyc',
    'https://unsplash.com/photos/black-and-white-kitten-sitting-JWueda_SUEQ',
  ),
  clover: photo(
    'clover',
    'Close-up of a white lop-eared rabbit with light brown patches around its eye and ears',
    'Chee Kee',
    'cheekee',
    'https://unsplash.com/photos/a-white-and-brown-rabbit-sitting-on-top-of-a-floor-jXMk_cdF-Vs',
  ),
  oreo: photo(
    'oreo',
    'Black-and-white Dutch rabbit with a white blaze and collar, sitting on a black background',
    'Nikolett Emmert',
    'niki_emmert',
    'https://unsplash.com/photos/a-black-and-white-rabbit-sitting-on-a-black-surface-AwbAG0YMxHg',
  ),
  kiwi: photo(
    'kiwi',
    'Blue jay with bright blue wings and tail perched on a mossy branch',
    'Dmytro Koplyk',
    'dkoplyk',
    'https://unsplash.com/photos/a-blue-jay-perched-on-a-tree-branch-sMlf45tUVpA',
  ),
  bubbles: photo(
    'bubbles',
    'Orange goldfish swimming in a planted aquarium above pebbles',
    'fishy fishy',
    'its12_06pm',
    'https://unsplash.com/photos/a-vibrant-goldfish-swims-in-a-clear-aquarium-zxdn0PGevRo',
  ),
  nova: photo(
    'nova',
    'Young cream-and-white Husky with blue eyes, smiling in front of sunflowers',
    'Reba Spike',
    'rebaspike',
    'https://unsplash.com/photos/white-and-brown-siberian-husky-puppy-on-green-grass-during-daytime-ISahwf9hCNg',
  ),
}

export const getPetPhoto = (id: string): PetPhoto | undefined => PET_PHOTOS[id]
