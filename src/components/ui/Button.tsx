/**
 * Button — the one button style per level (primary / secondary / ghost), used everywhere.
 * Original PawPath primitive. Colours come from CSS variables with fallbacks.
 *
 *   <Button onClick={...}>Find my match</Button>
 *   <Button variant="secondary" size="lg" leadingIcon={<Heart aria-hidden />}>Save</Button>
 *   <Link to="/pets" className={buttonClasses({ variant: 'primary' })}>Browse pets</Link>
 *
 * Accessibility: real <button>, min 44px tall, visible :focus-visible outline, `loading` sets
 * aria-busy and keeps the label readable. Icon-only buttons MUST pass `aria-label`.
 */
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/cn';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost';
export type ButtonSize = 'md' | 'lg' | 'icon';

const BASE =
  'inline-flex items-center justify-center gap-2 rounded-full font-semibold leading-none select-none ' +
  'transition-[background-color,color,box-shadow,transform] duration-150 ease-out motion-reduce:transition-none ' +
  'active:scale-[0.98] motion-reduce:active:scale-100 ' +
  'outline-none focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus,#1d4ed8)] ' +
  'disabled:cursor-not-allowed disabled:opacity-50 aria-disabled:cursor-not-allowed aria-disabled:opacity-50';

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    'bg-[var(--color-primary,#c2410c)] text-[var(--color-on-primary,#ffffff)] shadow-[0_6px_16px_-8px_rgba(0,0,0,0.45)] hover:brightness-110',
  secondary:
    'bg-[var(--color-surface,#ffffff)] text-[var(--color-text,#1c1917)] ring-2 ring-inset ring-[var(--color-primary,#c2410c)] hover:bg-[var(--color-surface-muted,#f5f5f4)]',
  ghost:
    'bg-transparent text-[var(--color-text,#1c1917)] hover:bg-[var(--color-surface-muted,#f5f5f4)] underline-offset-4 hover:underline',
};

const SIZES: Record<ButtonSize, string> = {
  md: 'min-h-11 px-5 text-base',
  lg: 'min-h-13 px-7 text-lg',
  icon: 'size-11 p-0',
};

export function buttonClasses({
  variant = 'primary',
  size = 'md',
  className,
}: { variant?: ButtonVariant; size?: ButtonSize; className?: string } = {}) {
  return cn(BASE, VARIANTS[variant], SIZES[size], className);
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', loading = false, leadingIcon, trailingIcon, className, children, disabled, type, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type ?? 'button'}
      className={buttonClasses({ variant, size, className })}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading ? <Loader2 className="size-5 animate-spin motion-reduce:animate-none" aria-hidden="true" /> : leadingIcon}
      {children}
      {!loading && trailingIcon}
    </button>
  );
});

export default Button;
