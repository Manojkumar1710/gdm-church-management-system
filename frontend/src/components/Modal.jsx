import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { useLanguage } from '../context/LanguageContext';

/**
 * Modal
 * Keeps the same API as before (open, onClose, title, children, size).
 * Added: smooth fade + scale entrance via framer-motion.
 * Exit is instant (no exit animation) per the design brief.
 */
export default function Modal({ open, onClose, title, children, size = 'md' }) {
  const reduced  = useReducedMotion();
  const { t }    = useLanguage();
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

  // Close on Escape key
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label={title}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            className={`
              relative bg-white rounded-2xl border border-church-border shadow-2xl w-full ${sizeClass}
              max-h-[92vh] overflow-y-auto
            `}
            initial={{ opacity: 0, scale: reduced ? 1 : 0.96, y: reduced ? 0 : 8 }}
            animate={{ opacity: 1, scale: 1,               y: 0 }}
            exit={{    opacity: 0, scale: reduced ? 1 : 0.96, y: reduced ? 0 : 8 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Header */}
            <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-church-border">
              <h2 className="dialog-title truncate">
                {title}
              </h2>
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

            {/* Body */}
            <div className="px-6 py-5">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
