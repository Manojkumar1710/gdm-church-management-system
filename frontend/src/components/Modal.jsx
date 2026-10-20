import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { useLanguage } from '../context/LanguageContext';

/**
 * Modal
 *
 * Positioning strategy
 * ─────────────────────────────────────────────────────────────────
 * The admin layout has a sticky 64 px (h-16) topbar.  A `fixed`
 * overlay that starts at `top:0` will position the panel behind that
 * header unless we explicitly push it below.
 *
 * Fix: the outer scroll-container starts at `top: 4rem` (= 64 px),
 * so the panel is always fully below the topbar.  On pages without
 * an admin header (e.g. the public site) the extra padding is
 * harmless — it just adds a small top gap.
 *
 * Scrolling strategy
 * ─────────────────────────────────────────────────────────────────
 * overflow-y-auto lives on the BODY div only, not on the panel
 * wrapper.  This keeps the modal header (title + close button)
 * pinned and visible at all times while the form content scrolls.
 */
export default function Modal({ open, onClose, title, children, size = 'md' }) {
  const reduced = useReducedMotion();
  const { t }   = useLanguage();

  const sizeClass = {
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  }[size] ?? 'max-w-lg';

  // Lock body scroll while open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        /*
         * Outer wrapper
         *
         * fixed inset-0          — covers the whole viewport
         * z-[60]                 — above the sticky topbar (z-10) and
         *                          mobile drawer (z-50)
         * overflow-y-auto        — allows the wrapper itself to scroll on
         *                          very small screens if the panel is taller
         *                          than the available space
         * pt-16                  — 64 px top padding = exact height of the
         *                          admin topbar → panel never starts behind it
         * p-4 pb-8               — comfortable gutter on all other sides
         * flex justify-center    — centres horizontally
         * items-start            — panel anchors at the top of the padded area
         *                          (never centred vertically, which would
         *                          push half the panel above the header)
         */
        <div
          className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto p-4 pt-16 pb-8"
          role="dialog"
          aria-modal="true"
          aria-label={title}
        >
          {/* Backdrop — sits behind the panel, fills the whole viewport */}
          <motion.div
            className="fixed inset-0 bg-black/40 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            onClick={onClose}
            aria-hidden="true"
          />

          {/*
           * Panel
           *
           * relative            — stacks above the fixed backdrop
           * w-full + sizeClass  — respects the max-width for sm/md/lg/xl
           * flex flex-col       — allows header + scrollable body layout
           * max-h-[calc(...)]   — limits height to viewport minus topbar
           *                       (64 px) and vertical gutters (32 px × 2)
           *                       so the panel never overflows the screen
           */}
          <motion.div
            className={`relative flex flex-col bg-white rounded-2xl border border-church-border shadow-2xl w-full ${sizeClass}`}
            style={{ maxHeight: 'calc(100vh - 64px - 2rem)' }}
            initial={{ opacity: 0, scale: reduced ? 1 : 0.96, y: reduced ? 0 : 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{    opacity: 0, scale: reduced ? 1 : 0.96, y: reduced ? 0 : 8 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            {/*
             * Modal header — sticky inside the panel so it never scrolls away.
             * Uses sticky + top-0 relative to the panel's own scroll container.
             */}
            <div className="flex shrink-0 items-center justify-between gap-4 rounded-t-2xl border-b border-church-border bg-white px-6 py-4">
              <h2 className="dialog-title truncate">{title}</h2>
              <button
                type="button"
                onClick={onClose}
                className="inline-grid h-8 w-8 shrink-0 place-items-center rounded-lg text-gray-500 transition-colors
                           hover:bg-church-light hover:text-church-blue
                           focus:outline-none focus-visible:ring-2 focus-visible:ring-church-gold"
                aria-label={t('common.close')}
              >
                <XMarkIcon className="h-[18px] w-[18px]" aria-hidden="true" />
              </button>
            </div>

            {/*
             * Modal body — the ONLY element that scrolls.
             * overflow-y-auto here keeps the title pinned above.
             */}
            <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
