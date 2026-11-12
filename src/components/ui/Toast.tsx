/**
 * Toast — visible feedback after an action ("Saved Biscuit to your list", "Inquiry sent").
 * Original PawPath primitive (motion/react).
 *
 * Setup (once, near the root):
 *   <ToastProvider><App /></ToastProvider>
 * Usage:
 *   const { toast } = useToast();
 *   toast({ title: 'Saved Biscuit', description: 'You have 3 saved pets.', tone: 'success',
 *           action: { label: 'Undo', onClick: unsave } });
 *
 * Accessibility:
 *  - A single live region (role="status", aria-live="polite") is always mounted, so screen readers
 *    announce each toast. Error toasts use role="alert".
 *  - Auto-dismiss after `duration` ms (default 6000), paused while hovered or focused (WCAG 2.2.1).
 *    Toasts with an action stay until dismissed.
 *  - Close button is a real <button> with aria-label; Esc closes the focused toast.
 *  - Reduced motion: fades only, no slide.
 *  - Sits above a mobile bottom nav: set --toast-offset (default 88px on small screens).
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { CheckCircle2, Info, TriangleAlert, X } from 'lucide-react';
import { cn } from '@/lib/cn';

export type ToastTone = 'success' | 'info' | 'error';

export interface ToastOptions {
  title: string;
  description?: string;
  tone?: ToastTone;
  /** ms before auto-dismiss. Ignored when `action` is set. */
  duration?: number;
  action?: { label: string; onClick: () => void };
}

interface ToastItem extends ToastOptions {
  id: number;
}

interface ToastContextValue {
  toast: (options: ToastOptions) => number;
  dismiss: (id: number) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
}

const ICONS = { success: CheckCircle2, info: Info, error: TriangleAlert } as const;
const ACCENT: Record<ToastTone, string> = {
  success: 'text-[var(--color-success,#15803d)]',
  info: 'text-[var(--color-primary,#c2410c)]',
  error: 'text-[var(--color-error,#b91c1c)]',
};

export function ToastProvider({ children, max = 3 }: { children: ReactNode; max?: number }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const nextId = useRef(1);

  const dismiss = useCallback((id: number) => {
    setItems((list) => list.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (options: ToastOptions) => {
      const id = nextId.current++;
      setItems((list) => [...list, { ...options, id }].slice(-max));
      return id;
    },
    [max],
  );

  const value = useMemo(() => ({ toast, dismiss }), [toast, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        role="region"
        aria-label="Notifications"
        className="pointer-events-none fixed inset-x-0 z-50 flex flex-col items-center gap-2 px-4 bottom-[var(--toast-offset,88px)] md:bottom-6 md:items-end md:px-6"
      >
        <ol role="status" aria-live="polite" className="flex w-full max-w-sm flex-col gap-2">
          <AnimatePresence initial={false}>
            {items.map((item) => (
              <ToastCard key={item.id} item={item} onDismiss={() => dismiss(item.id)} />
            ))}
          </AnimatePresence>
        </ol>
      </div>
    </ToastContext.Provider>
  );
}

function ToastCard({ item, onDismiss }: { item: ToastItem; onDismiss: () => void }) {
  const reduce = useReducedMotion();
  const [paused, setPaused] = useState(false);
  const tone = item.tone ?? 'info';
  const Icon = ICONS[tone];
  const duration = item.action ? 0 : (item.duration ?? 6000);
  // Keep the latest callback without restarting the timer when the provider re-renders.
  const dismissRef = useRef(onDismiss);
  dismissRef.current = onDismiss;

  useEffect(() => {
    if (!duration || paused) return;
    const timer = window.setTimeout(() => dismissRef.current(), duration);
    return () => window.clearTimeout(timer);
  }, [duration, paused]);

  return (
    <motion.li
      layout={!reduce}
      role={tone === 'error' ? 'alert' : undefined}
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={reduce ? { opacity: 0 } : { opacity: 0, y: 8, scale: 0.98 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onKeyDown={(e) => {
        if (e.key === 'Escape') onDismiss();
      }}
      className={cn(
        'pointer-events-auto flex w-full items-start gap-3 rounded-2xl border p-4 shadow-[0_12px_32px_-12px_rgba(0,0,0,0.35)]',
        'border-[var(--color-border,#e7e5e4)] bg-[var(--color-surface,#ffffff)] text-[var(--color-text,#1c1917)]',
      )}
    >
      <Icon className={cn('mt-0.5 size-5 shrink-0', ACCENT[tone])} aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <p className="text-base font-semibold leading-snug">{item.title}</p>
        {item.description && (
          <p className="mt-0.5 text-[15px] leading-snug text-[var(--color-muted,#57534e)]">{item.description}</p>
        )}
        {item.action && (
          <button
            type="button"
            onClick={() => {
              item.action?.onClick();
              onDismiss();
            }}
            className="mt-2 inline-flex min-h-11 items-center rounded-full px-3 -ml-3 font-semibold text-[var(--color-primary,#c2410c)] underline underline-offset-4 outline-none focus-visible:outline-3 focus-visible:outline-[var(--color-focus,#1d4ed8)]"
          >
            {item.action.label}
          </button>
        )}
      </div>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss notification"
        className="-m-2 inline-flex size-11 shrink-0 items-center justify-center rounded-full text-[var(--color-muted,#57534e)] hover:bg-[var(--color-surface-muted,#f5f5f4)] outline-none focus-visible:outline-3 focus-visible:outline-[var(--color-focus,#1d4ed8)]"
      >
        <X className="size-5" aria-hidden="true" />
      </button>
    </motion.li>
  );
}

export default ToastProvider;
