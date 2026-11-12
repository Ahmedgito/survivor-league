/**
 * Large accessible choice cards: native <input type="radio|checkbox"> (visually hidden but
 * focusable) inside a styled <label>. Arrow keys work natively for radios, Space for checkboxes.
 * Selected state = soft background + 2px strong border + check icon (never colour alone).
 */
import type { ReactNode } from 'react'
import { Check } from 'lucide-react'
import { cn } from '@/lib/cn'

export interface ChoiceOption {
  value: string
  label: string
  hint?: string
  icon?: string
}

interface ChoiceCardsProps {
  type: 'radio' | 'checkbox'
  name: string
  options: ChoiceOption[]
  /** Checked values. */
  selected: string[]
  onToggle: (value: string) => void
  onBlur?: () => void
  invalid?: boolean
  describedBy?: string
  /** Optional id for the first input (error summary links jump here). */
  firstInputId?: string
  columns?: 1 | 2 | 3
  size?: 'lg' | 'md'
  children?: ReactNode
}

export function ChoiceCards({
  type,
  name,
  options,
  selected,
  onToggle,
  onBlur,
  invalid,
  describedBy,
  firstInputId,
  columns = 1,
  size = 'lg',
}: ChoiceCardsProps) {
  return (
    <div
      className={cn(
        'grid gap-3',
        columns === 2 && 'sm:grid-cols-2',
        columns === 3 && 'sm:grid-cols-3',
      )}
    >
      {options.map((opt, i) => {
        const checked = selected.includes(opt.value)
        const id = i === 0 && firstInputId ? firstInputId : `${name}-${opt.value}`
        return (
          <label
            key={opt.value}
            htmlFor={id}
            className={cn(
              'relative flex cursor-pointer items-center gap-3 rounded-2xl border-2 bg-surface text-ink',
              'transition-colors duration-150 motion-reduce:transition-none',
              size === 'lg' ? 'min-h-16 px-4 py-3' : 'min-h-12 px-3 py-2',
              checked
                ? 'border-primary-strong bg-primary-soft'
                : invalid
                  ? 'border-error hover:bg-sand'
                  : 'border-field-border hover:bg-sand',
              'has-[input:focus-visible]:outline-3 has-[input:focus-visible]:outline-offset-2 has-[input:focus-visible]:outline-focus',
            )}
          >
            <input
              id={id}
              type={type}
              name={name}
              value={opt.value}
              checked={checked}
              onChange={() => onToggle(opt.value)}
              onBlur={onBlur}
              aria-invalid={invalid || undefined}
              aria-describedby={describedBy}
              className="sr-only"
            />
            {opt.icon && (
              <span aria-hidden="true" className={cn('shrink-0', size === 'lg' ? 'text-2xl' : 'text-xl')}>
                {opt.icon}
              </span>
            )}
            <span className="min-w-0 flex-1">
              <span className={cn('block font-semibold leading-snug', size === 'lg' ? 'text-lg' : 'text-base')}>
                {opt.label}
              </span>
              {opt.hint && <span className="block text-sm leading-snug text-muted">{opt.hint}</span>}
            </span>
            <span
              aria-hidden="true"
              className={cn(
                'flex size-7 shrink-0 items-center justify-center border-2',
                type === 'radio' ? 'rounded-full' : 'rounded-md',
                checked ? 'border-primary-strong bg-primary-strong text-white' : 'border-field-border bg-surface',
              )}
            >
              {checked && <Check className="size-4" strokeWidth={3} />}
            </span>
          </label>
        )
      })}
    </div>
  )
}
