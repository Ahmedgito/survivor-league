/**
 * BottomNav — mobile bottom tab bar with a saved-pets badge.
 *
 * Original PawPath component. Pattern inspired by 21st.dev "Bottom Nav Bar" (@arunachalam,
 * https://21st.dev/@arunachalam/components/bottom-nav-bar), but NOT copied: that component lists no
 * licence, removes the focus ring (`focus:outline-none focus-visible:ring-0`), hides inactive labels,
 * uses <button> + local state instead of links, and hard-codes its items.
 *
 *   const items = [
 *     { to: '/', label: 'Story', icon: Home, end: true },
 *     { to: '/pets', label: 'Pets', icon: PawPrint },
 *     { to: '/match', label: 'Match', icon: Sparkles },
 *     { to: '/saved', label: 'Saved', icon: Heart, badge: savedCount },
 *   ];
 *   <BottomNav items={items} />   // hidden from md: up by default
 *
 * Accessibility: <nav aria-label>, real router links with aria-current="page" (from NavLink),
 * always-visible text labels, 56px-tall targets, visible focus outline, badge count announced as
 * "(3 saved)". Reduced motion: the active pill does not slide. Respects the iOS safe area.
 * Must be rendered inside a react-router <BrowserRouter>/<RouterProvider>.
 */
import { NavLink } from 'react-router-dom';
import { motion, useReducedMotion } from 'motion/react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/cn';

export interface BottomNavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  /** Shows a count bubble (e.g. saved pets). Hidden when 0/undefined. */
  badge?: number;
  /** Accessible wording for the badge, default "saved". */
  badgeLabel?: string;
  /** Match the route exactly (use for "/"). */
  end?: boolean;
}

export interface BottomNavProps {
  items: BottomNavItem[];
  label?: string;
  className?: string;
}

export function BottomNav({ items, label = 'Main', className }: BottomNavProps) {
  const reduce = useReducedMotion();

  return (
    <nav
      aria-label={label}
      className={cn(
        'fixed inset-x-0 bottom-0 z-40 border-t md:hidden',
        'border-[var(--color-border,#e7e5e4)] bg-[var(--color-surface,#ffffff)]/95 backdrop-blur',
        'pb-[env(safe-area-inset-bottom)]',
        className,
      )}
    >
      <ul className="mx-auto flex max-w-md items-stretch justify-around px-2">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <li key={item.to} className="flex-1">
              <NavLink
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    'relative flex min-h-14 flex-col items-center justify-center gap-0.5 rounded-2xl px-1 py-1.5',
                    'text-[13px] font-semibold leading-tight',
                    'outline-none focus-visible:outline-3 focus-visible:-outline-offset-3 focus-visible:outline-[var(--color-focus,#1d4ed8)]',
                    isActive ? 'text-[var(--color-primary,#c2410c)]' : 'text-[var(--color-muted,#57534e)]',
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <motion.span
                        layoutId={reduce ? undefined : 'bottom-nav-pill'}
                        transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                        className="absolute inset-x-1 inset-y-1 -z-10 rounded-2xl bg-[var(--color-primary-soft,#ffedd5)]"
                        aria-hidden="true"
                      />
                    )}
                    <span className="relative">
                      <Icon size={22} strokeWidth={isActive ? 2.5 : 2} aria-hidden="true" />
                      {!!item.badge && item.badge > 0 && (
                        <span
                          aria-hidden="true"
                          className="absolute -right-2.5 -top-1.5 min-w-5 rounded-full bg-[var(--color-primary,#c2410c)] px-1 text-center text-[11px] leading-5 font-bold text-[var(--color-on-primary,#ffffff)] tabular-nums"
                        >
                          {item.badge > 99 ? '99+' : item.badge}
                        </span>
                      )}
                    </span>
                    <span>
                      {item.label}
                      {!!item.badge && item.badge > 0 && (
                        <span className="sr-only">
                          {` (${item.badge} ${item.badgeLabel ?? 'saved'})`}
                        </span>
                      )}
                    </span>
                  </>
                )}
              </NavLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export default BottomNav;
