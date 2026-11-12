import { cn } from '@/lib/cn'
import type { Pet } from '@/data/types'
import { SPECIES_ICON } from './petLabels'

/**
 * Photo-free pet visual: the pet's soft card colour, a blob in the pet's own tint, a big emoji and
 * the lucide species icon. Purely decorative (aria-hidden) — the pet's name and details are real text.
 */
export function PetVisual({ pet, className, size = 'md' }: { pet: Pet; className?: string; size?: 'md' | 'lg' }) {
  const Icon = SPECIES_ICON[pet.species]
  return (
    <div
      aria-hidden="true"
      className={cn('relative grid place-items-center overflow-hidden', className)}
      style={{ backgroundColor: pet.cardColor }}
    >
      <svg viewBox="0 0 200 200" className="absolute left-1/2 top-1/2 w-[78%] max-w-[420px] -translate-x-1/2 -translate-y-1/2">
        <path
          fill={pet.tint}
          fillOpacity={0.28}
          d="M44.7,-60.6C57.1,-52.3,66,-38.5,70.6,-23.4C75.2,-8.3,75.5,8.1,69.7,21.6C63.9,35.1,52,45.8,38.6,54.3C25.2,62.8,10.3,69.2,-4.4,75.2C-19.1,81.3,-33.6,87,-45.2,81.1C-56.8,75.2,-65.4,57.7,-70.6,40.6C-75.8,23.5,-77.6,6.8,-73.6,-7.9C-69.6,-22.7,-59.9,-35.6,-47.8,-44C-35.7,-52.4,-21.3,-56.4,-6.3,-57.8C8.7,-59.3,32.3,-68.9,44.7,-60.6Z"
          transform="translate(100 100)"
        />
      </svg>
      <svg viewBox="0 0 200 200" className="absolute -right-6 -top-8 w-[34%] opacity-60">
        <circle cx="100" cy="100" r="90" fill="#ffffff" fillOpacity={0.55} />
      </svg>
      <span
        className={cn(
          'relative select-none leading-none drop-shadow-[0_8px_10px_rgba(34,27,46,0.18)]',
          size === 'lg' ? 'text-[7rem] sm:text-[9rem]' : 'text-[5.5rem]',
        )}
      >
        {pet.emoji}
      </span>
      <Icon
        className={cn(
          'absolute bottom-3 right-3 rounded-full bg-white/70 p-1.5 text-ink',
          size === 'lg' ? 'size-10' : 'size-8',
        )}
        strokeWidth={2}
      />
    </div>
  )
}
