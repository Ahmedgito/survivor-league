import { useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { Heart } from 'lucide-react'
import ClickSpark, { type ClickSparkHandle } from '@/components/reactbits/ClickSpark'
import { useToast } from '@/components/ui/Toast'
import { savedPets, useSavedPets } from '@/lib/savedPets'
import { useReducedMotion } from '@/lib/a11y'
import { cn } from '@/lib/cn'
import type { Pet } from '@/data/types'

/**
 * Save ("heart") toggle for a pet. A real <button aria-pressed> with a name that says what it does.
 * Feedback: spring pop + ClickSpark + toast (with Undo when removing).
 */
export function SaveHeart({
  pet,
  variant = 'icon',
  className,
}: {
  pet: Pet
  /** `icon`: 44px round icon button (cards). `labelled`: pill with visible text (profile). */
  variant?: 'icon' | 'labelled'
  className?: string
}) {
  const { has, toggle } = useSavedPets()
  const { toast } = useToast()
  const navigate = useNavigate()
  const reduced = useReducedMotion()
  const sparkRef = useRef<ClickSparkHandle>(null)
  const saved = has(pet.id)

  const onClick = () => {
    const nowSaved = toggle(pet.id)
    if (nowSaved) {
      const count = savedCount()
      toast({
        title: `Saved ${pet.name}`,
        description: `You have ${count} ${count === 1 ? 'pet' : 'pets'} on your shortlist.`,
        tone: 'success',
        duration: 5000,
        action: { label: 'View saved', onClick: () => navigate('/saved') },
      })
    } else {
      toast({
        title: `Removed ${pet.name} from your shortlist`,
        tone: 'info',
        duration: 5000,
        action: { label: 'Undo', onClick: () => toggle(pet.id) },
      })
    }
  }

  const icon = (
    <motion.span
      key={saved ? 'on' : 'off'}
      className="inline-flex"
      initial={reduced ? false : { scale: 1 }}
      animate={reduced ? undefined : { scale: saved ? [1, 1.3, 1] : [1, 0.85, 1] }}
      transition={{ duration: 0.32, ease: 'easeOut' }}
    >
      <Heart
        aria-hidden="true"
        className={cn('size-6', saved ? 'fill-[var(--color-primary)] text-[var(--color-primary)]' : 'text-ink')}
        strokeWidth={2.25}
      />
    </motion.span>
  )

  return (
    <ClickSpark
      ref={sparkRef}
      disabled={reduced}
      sparkColor={['#c2410c', '#f59e0b', '#0f766e']}
      sparkCount={10}
      sparkRadius={26}
      className={cn('!h-auto !w-auto inline-flex', className)}
    >
      <button
        type="button"
        aria-pressed={saved}
        aria-label={variant === 'icon' ? (saved ? `Remove ${pet.name} from saved` : `Save ${pet.name}`) : undefined}
        onClick={onClick}
        className={cn(
          'inline-flex items-center justify-center gap-2 rounded-full bg-white font-semibold text-ink',
          'shadow-[var(--shadow-card)] ring-2 ring-inset transition-colors duration-150',
          saved ? 'ring-[var(--color-primary)]' : 'ring-[var(--color-field-border)] hover:ring-[var(--color-primary)]',
          'focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]',
          variant === 'icon' ? 'size-11' : 'min-h-11 px-5',
        )}
      >
        {icon}
        {variant === 'labelled' && <span>{saved ? `Saved ${pet.name}` : `Save ${pet.name}`}</span>}
      </button>
    </ClickSpark>
  )
}

// Read the latest count right after toggling (the hook value is from the previous render).
const savedCount = () => savedPets.get().length
