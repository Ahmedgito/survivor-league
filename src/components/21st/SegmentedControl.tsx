/**
 * SegmentedControl — single-choice radio group with an animated sliding thumb.
 *
 * Source: 21st.dev — @ddoemonn/segmented-control
 *   https://21st.dev/@ddoemonn/components/segmented-control (MIT, via the 21st.dev registry)
 *
 * PawPath adaptations (see docs/plan/03-components.md):
 *  - Colours moved to CSS variables (--color-primary, --color-on-primary, --color-text, --color-muted,
 *    --color-surface-muted, --color-border, --color-focus) with light fallbacks; dark: variants removed.
 *  - Inactive label colour raised from stone-500 (≈4.2:1 on stone-100, fails AA) to a token defaulting
 *    to stone-600 (#57534e, ≈6.9:1).
 *  - Segment height 32px -> 44px tap target, 13px -> 15px text.
 *  - Focus ring was a 1px inset tint; now a 2px outline with offset (visible on the dark thumb too).
 *  - Thumb animation already honoured useReducedMotion; kept.
 */
import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { animate, motion, useMotionValue, useReducedMotion, useTransform } from 'motion/react';
import { cn } from '@/lib/cn';

const CELL = { type: 'spring', stiffness: 520, damping: 34, mass: 0.45 } as const;

const SEG =
  'px-4 py-[11px] text-center text-[15px] font-semibold leading-[22px] tracking-[-0.01em] whitespace-nowrap';

export type SegmentedOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

export type SegmentedControlProps = {
  options: SegmentedOption[];
  /** Accessible name of the group, e.g. "Pet type". Required. */
  label: string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  className?: string;
};

export function SegmentedControl({
  options,
  label,
  value,
  defaultValue,
  onValueChange,
  className = '',
}: SegmentedControlProps) {
  const count = Math.max(1, options.length);
  const template = `repeat(${count}, minmax(0, 1fr))`;

  const [internal, setInternal] = useState(() => defaultValue ?? options[0]?.value ?? '');
  const [hovered, setHovered] = useState(-1);

  const controlled = value !== undefined;
  const current = controlled ? value : internal;
  const found = options.findIndex((o) => o.value === current);
  const index = found < 0 ? 0 : found;

  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const emit = useRef(onValueChange);
  emit.current = onValueChange;

  const reduced = useReducedMotion();
  const pos = useMotionValue(index);
  const thumbX = useTransform(pos, (v) => `${v * 100}%`);
  const maskX = useTransform(pos, (v) => `${v * -100}%`);

  useEffect(() => {
    if (reduced) {
      pos.set(index);
      return;
    }
    const controls = animate(pos, index, CELL);
    return () => controls.stop();
  }, [index, reduced, pos]);

  const select = useCallback(
    (next: string) => {
      if (!controlled) setInternal(next);
      if (next !== current) emit.current?.(next);
    },
    [controlled, current],
  );

  const seek = useCallback(
    (from: number, dir: number) => {
      let i = from;
      for (let k = 0; k < count; k++) {
        i = (i + dir + count) % count;
        if (!options[i]?.disabled) return i;
      }
      return from;
    },
    [count, options],
  );

  const go = useCallback(
    (i: number) => {
      const option = options[i];
      if (!option || option.disabled) return;
      buttons.current[i]?.focus();
      select(option.value);
    },
    [options, select],
  );

  const onKeyDown = (e: KeyboardEvent, i: number) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      go(seek(i, 1));
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      go(seek(i, -1));
    } else if (e.key === 'Home') {
      e.preventDefault();
      go(seek(count - 1, 1));
    } else if (e.key === 'End') {
      e.preventDefault();
      go(seek(0, -1));
    }
  };

  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cn(
        'relative inline-block max-w-full select-none rounded-[14px] border p-[3px]',
        'border-[var(--color-border,#e7e5e4)] bg-[var(--color-surface-muted,#f5f5f4)]',
        className,
      )}
    >
      <div className="relative grid" style={{ gridTemplateColumns: template, touchAction: 'manipulation' }}>
        {options.map((option, i) => (
          <span
            key={option.value}
            aria-hidden
            className={cn(
              SEG,
              'pointer-events-none',
              option.disabled
                ? 'text-[var(--color-muted,#57534e)] opacity-50'
                : hovered === i && i !== index
                  ? 'text-[var(--color-text,#292524)]'
                  : 'text-[var(--color-muted,#57534e)]',
            )}
          >
            {option.label}
          </span>
        ))}

        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 overflow-hidden rounded-[11px] bg-[var(--color-primary,#292524)] shadow-[0_1px_2px_rgba(28,25,23,0.28)]"
          style={{ width: `${100 / count}%`, x: thumbX }}
          initial={false}
        >
          <motion.div className="absolute inset-0" style={{ x: maskX }} initial={false}>
            <div
              className="absolute inset-y-0 left-0 grid"
              style={{ width: `${count * 100}%`, gridTemplateColumns: template }}
            >
              {options.map((option) => (
                <span key={option.value} className={cn(SEG, 'text-[var(--color-on-primary,#fafaf9)]')}>
                  {option.label}
                </span>
              ))}
            </div>
          </motion.div>
        </motion.div>

        <div
          className="absolute inset-0 grid"
          style={{ gridTemplateColumns: template }}
          onPointerLeave={() => setHovered(-1)}
        >
          {options.map((option, i) => (
            <button
              key={option.value}
              ref={(node) => {
                buttons.current[i] = node;
              }}
              type="button"
              role="radio"
              aria-checked={i === index}
              aria-disabled={option.disabled || undefined}
              tabIndex={i === index ? 0 : -1}
              onClick={() => !option.disabled && select(option.value)}
              onKeyDown={(e) => onKeyDown(e, i)}
              onPointerEnter={() => !option.disabled && setHovered(i)}
              className="cursor-pointer rounded-[11px] outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus,#1d4ed8)] aria-disabled:cursor-not-allowed"
            >
              <span className="sr-only">{option.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default SegmentedControl;
