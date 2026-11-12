/**
 * Chip — a toggle filter chip (multi-select). Original PawPath primitive.
 *
 *   <div role="group" aria-label="Energy level" className="flex flex-wrap gap-2">
 *     <Chip pressed={energy.has('low')} onPressedChange={(on) => toggle('low', on)}>Low energy</Chip>
 *   </div>
 *
 * Accessibility: a real <button> with aria-pressed; the selected state is shown with a check icon
 * and a fill change, not colour alone (WCAG 1.4.1). Min 44px tall. Wrap a set of chips in an
 * element with role="group" + aria-label. For single-choice filters use 21st/SegmentedControl.
 */
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/cn';

export interface ChipProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> {
  pressed: boolean;
  onPressedChange: (pressed: boolean) => void;
  /** Optional count shown after the label, e.g. number of matching pets. */
  count?: number;
  icon?: ReactNode;
}

export const Chip = forwardRef<HTMLButtonElement, ChipProps>(function Chip(
  { pressed, onPressedChange, count, icon, className, children, onClick, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type="button"
      aria-pressed={pressed}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) onPressedChange(!pressed);
      }}
      className={cn(
        'inline-flex min-h-11 items-center gap-1.5 rounded-full border-2 px-4 text-[15px] font-semibold',
        'transition-colors duration-150 motion-reduce:transition-none',
        'outline-none focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus,#1d4ed8)]',
        pressed
          ? 'border-[var(--color-primary,#c2410c)] bg-[var(--color-primary,#c2410c)] text-[var(--color-on-primary,#ffffff)]'
          : 'border-[var(--color-border,#d6d3d1)] bg-[var(--color-surface,#ffffff)] text-[var(--color-text,#1c1917)] hover:border-[var(--color-primary,#c2410c)]',
        className,
      )}
      {...rest}
    >
      {pressed ? <Check className="size-4" strokeWidth={3} aria-hidden="true" /> : icon}
      <span>{children}</span>
      {typeof count === 'number' && (
        <span
          className={cn(
            'ml-0.5 rounded-full px-2 py-0.5 text-[13px] tabular-nums',
            pressed ? 'bg-black/20' : 'bg-[var(--color-surface-muted,#f5f5f4)]',
          )}
        >
          {count}
        </span>
      )}
    </button>
  );
});

export default Chip;
