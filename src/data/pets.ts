import type { Pet, Shelter } from './types'

/**
 * ⚠️ FICTIONAL SAMPLE DATA — every pet, shelter, phone number and email below is made up
 * for the ACM MAJU Vibe Coding Competition demo. No real animals, people or organisations.
 */

export const SHELTERS: Shelter[] = [
  { id: 'sunny-paws', name: 'Sunny Paws Rescue (fictional)', area: 'Gulshan Block 7, Karachi', phone: '+92 300 0000101', email: 'hello@sunnypaws.example.com' },
  { id: 'second-chance', name: 'Second Chance Shelter (fictional)', area: 'DHA Phase 5, Karachi', phone: '+92 300 0000202', email: 'adopt@secondchance.example.com' },
  { id: 'whisker-way', name: 'Whisker Way Home (fictional)', area: 'Clifton Block 2, Karachi', phone: '+92 300 0000303', email: 'meet@whiskerway.example.com' },
]

export const PETS: Pet[] = [
  {
    id: 'biscuit', name: 'Biscuit', species: 'dog', breed: 'Mixed breed', ageLabel: '2 years', ageGroup: 'young', sex: 'male',
    size: 'medium', energy: 'balanced', traits: ['Loyal', 'Goofy', 'Cuddly'], goodWith: { kids: true, dogs: true, cats: false },
    bestHome: ['house', 'house-with-yard'], needsCompany: 'some',
    story: 'Biscuit spent 214 nights at the shelter watching the door. He knows sit, paw and the exact sound of a treat bag. He is the hero of our story — and he is still waiting.',
    fee: 4000, vaccinated: true, neutered: true, shelterId: 'sunny-paws', model: 'dog', tint: '#c98a4b', cardColor: '#ffedd5', emoji: '🐶',
  },
  {
    id: 'mochi', name: 'Mochi', species: 'dog', breed: 'Shiba Inu mix', ageLabel: '1 year', ageGroup: 'young', sex: 'female',
    size: 'medium', energy: 'zoomies', traits: ['Bold', 'Clever', 'Independent'], goodWith: { kids: true, dogs: true, cats: true },
    bestHome: ['house-with-yard'], needsCompany: 'mostly',
    story: 'Mochi treats every walk like an expedition. She learns tricks in a day and gets bored in two, so she needs a person who likes puzzles as much as she does.',
    fee: 5500, vaccinated: true, neutered: false, shelterId: 'second-chance', model: 'shiba', tint: '#d9772b', cardColor: '#fde7d4', emoji: '🦊',
  },
  {
    id: 'storm', name: 'Storm', species: 'dog', breed: 'Husky', ageLabel: '3 years', ageGroup: 'adult', sex: 'male',
    size: 'large', energy: 'zoomies', traits: ['Talkative', 'Adventurous', 'Gentle'], goodWith: { kids: true, dogs: true, cats: false },
    bestHome: ['house-with-yard'], needsCompany: 'mostly',
    story: 'Storm sings when he is happy — which is always. He wants a running buddy for early mornings and a sofa to sprawl across afterwards.',
    fee: 6000, vaccinated: true, neutered: true, shelterId: 'sunny-paws', model: 'husky', tint: '#8a94a6', cardColor: '#e0e7ff', emoji: '🐺',
  },
  {
    id: 'peanut', name: 'Peanut', species: 'dog', breed: 'Beagle mix', ageLabel: '8 years', ageGroup: 'senior', sex: 'female',
    size: 'small', energy: 'chill', traits: ['Calm', 'Sweet', 'Nap expert'], goodWith: { kids: true, dogs: true, cats: true },
    bestHome: ['apartment', 'house', 'house-with-yard'], needsCompany: 'some',
    story: 'Peanut has done the zoomies already, thank you. Now she wants a warm blanket, slow walks and someone to snore next to while they study.',
    fee: 2000, vaccinated: true, neutered: true, shelterId: 'second-chance', model: 'dog', tint: '#a0673a', cardColor: '#fef3c7', emoji: '🐕',
  },
  {
    id: 'luna', name: 'Luna', species: 'cat', breed: 'Domestic shorthair', ageLabel: '1 year', ageGroup: 'young', sex: 'female',
    size: 'small', energy: 'balanced', traits: ['Curious', 'Chatty', 'Playful'], goodWith: { kids: true, dogs: false, cats: true },
    bestHome: ['apartment', 'house'], needsCompany: 'some',
    story: 'Luna will supervise your homework from the top of the bookshelf. She loves feather toys, sunny windows and slow blinks.',
    fee: 3000, vaccinated: true, neutered: true, shelterId: 'whisker-way', model: 'cat', tint: '#5b5b66', cardColor: '#ede9fe', emoji: '🐱',
  },
  {
    id: 'pumpkin', name: 'Pumpkin', species: 'cat', breed: 'Orange tabby', ageLabel: '4 years', ageGroup: 'adult', sex: 'male',
    size: 'medium', energy: 'chill', traits: ['Laid-back', 'Affectionate', 'Foodie'], goodWith: { kids: true, dogs: true, cats: true },
    bestHome: ['apartment', 'house', 'house-with-yard'], needsCompany: 'rarely',
    story: 'Pumpkin is a professional loaf. Out all day? He will keep the sofa warm and greet you with a dramatic stretch when you get home.',
    fee: 2500, vaccinated: true, neutered: true, shelterId: 'whisker-way', model: 'cat', tint: '#e08a3c', cardColor: '#ffedd5', emoji: '🐈',
  },
  {
    id: 'pixel', name: 'Pixel', species: 'cat', breed: 'Tuxedo', ageLabel: '4 months', ageGroup: 'baby', sex: 'male',
    size: 'small', energy: 'zoomies', traits: ['Mischievous', 'Brave', 'Snuggly'], goodWith: { kids: true, dogs: true, cats: true },
    bestHome: ['apartment', 'house'], needsCompany: 'mostly',
    story: 'Pixel is 90% energy and 10% whiskers. He needs a playmate (or two) and someone home enough to keep up with kitten chaos.',
    fee: 3500, vaccinated: false, neutered: false, shelterId: 'sunny-paws', model: 'cat', tint: '#2b2b33', cardColor: '#e0f2fe', emoji: '🐈‍⬛',
  },
  {
    id: 'clover', name: 'Clover', species: 'rabbit', breed: 'Holland Lop', ageLabel: '2 years', ageGroup: 'young', sex: 'female',
    size: 'small', energy: 'balanced', traits: ['Gentle', 'Curious', 'Shy at first'], goodWith: { kids: true, dogs: false, cats: false },
    bestHome: ['apartment', 'house'], needsCompany: 'some',
    story: 'Clover does happy little jumps called binkies when she feels safe. Give her quiet time, fresh greens and a hidey-house and she will warm right up.',
    fee: 1500, vaccinated: true, neutered: true, shelterId: 'whisker-way', model: 'rabbit', tint: '#f2e3d0', cardColor: '#ccfbf1', emoji: '🐰',
  },
  {
    id: 'oreo', name: 'Oreo', species: 'rabbit', breed: 'Dutch rabbit', ageLabel: '5 years', ageGroup: 'adult', sex: 'male',
    size: 'small', energy: 'chill', traits: ['Relaxed', 'Social', 'Snack-motivated'], goodWith: { kids: true, dogs: false, cats: true },
    bestHome: ['apartment', 'house', 'house-with-yard'], needsCompany: 'rarely',
    story: 'Oreo is the calmest bun in the building. He likes head rubs, crunchy carrots and watching the world from his favourite cushion.',
    fee: 1200, vaccinated: true, neutered: true, shelterId: 'second-chance', model: 'rabbit', tint: '#3a3a3a', cardColor: '#f1f5f9', emoji: '🐇',
  },
  {
    id: 'kiwi', name: 'Kiwi', species: 'bird', breed: 'Blue jay (rescued)', ageLabel: '1 year', ageGroup: 'young', sex: 'female',
    size: 'small', energy: 'balanced', traits: ['Musical', 'Alert', 'Bright'], goodWith: { kids: true, dogs: false, cats: false },
    bestHome: ['apartment', 'house'], needsCompany: 'some',
    story: 'Kiwi whistles a greeting every morning and has a favourite song (it is the microwave beep). She needs a calm room and a person who talks back.',
    fee: 1000, vaccinated: false, neutered: false, shelterId: 'sunny-paws', model: 'bird', tint: '#3b82f6', cardColor: '#dbeafe', emoji: '🐦',
  },
  {
    id: 'bubbles', name: 'Bubbles', species: 'fish', breed: 'Goldfish', ageLabel: '6 months', ageGroup: 'baby', sex: 'male',
    size: 'small', energy: 'chill', traits: ['Peaceful', 'Shiny', 'Low-maintenance'], goodWith: { kids: true, dogs: true, cats: false },
    bestHome: ['apartment', 'house', 'house-with-yard'], needsCompany: 'rarely',
    story: 'Bubbles is the perfect first pet for a busy student: a filtered tank, a pinch of food and some plants to explore. Five-second memory, endless charm.',
    fee: 300, vaccinated: false, neutered: false, shelterId: 'whisker-way', model: 'goldfish', tint: '#f97316', cardColor: '#ffedd5', emoji: '🐠',
  },
  {
    id: 'nova', name: 'Nova', species: 'dog', breed: 'Husky mix', ageLabel: '5 months', ageGroup: 'baby', sex: 'female',
    size: 'medium', energy: 'zoomies', traits: ['Fearless', 'Clumsy', 'Loving'], goodWith: { kids: true, dogs: true, cats: true },
    bestHome: ['house', 'house-with-yard'], needsCompany: 'mostly',
    story: 'Nova trips over her own paws and gets right back up. She is learning everything for the first time — want to be the one who teaches her?',
    fee: 5000, vaccinated: true, neutered: false, shelterId: 'second-chance', model: 'husky', tint: '#c9b8a3', cardColor: '#fae8ff', emoji: '🐾',
  },
]

export const getPet = (id: string | undefined) => PETS.find((p) => p.id === id)
export const getShelter = (id: string) => SHELTERS.find((s) => s.id === id)!

export const SPECIES_LABEL: Record<Pet['species'], string> = {
  dog: 'Dogs', cat: 'Cats', rabbit: 'Rabbits', bird: 'Birds', fish: 'Fish',
}
