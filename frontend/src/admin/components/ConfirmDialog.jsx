import { useEffect, useRef } from 'react';
import { useLanguage } from '../../context/LanguageContext';

export default function ConfirmDialog({ open, title, message, onConfirm, onCancel, loading }) {
  const { t } = useLanguage();
  const cancelRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    cancelRef.current?.focus();
    const onKey = e => { if (e.key === 'Escape') onCancel?.(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onCancel]);

  if (!open) return null;

  const titleId = 'confirm-dialog-title';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/45 backdrop-blur-sm" onClick={onCancel} />
      <div className="dialog-panel relative max-w-sm" role="dialog" aria-modal="true" aria-labelledby={titleId}>
        <h3 id={titleId} className="dialog-title mb-2">{title || `${t('common.delete')}?`}</h3>
        <p className="mb-6 text-sm text-gray-500">{message}</p>
        <div className="flex justify-end gap-3">
          <button
            ref={cancelRef}
            type="button"
            onClick={onCancel}
            className="btn-ghost"
          >
            {t('common.cancel')}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="btn-danger btn-sm"
          >
            {loading && (
              <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" aria-hidden="true" />
            )}
            {loading ? t('common.loading') : t('common.delete')}
          </button>
        </div>
      </div>
    </div>
  );
}
