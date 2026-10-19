import { useLanguage } from '../../context/LanguageContext';

export default function Pagination({ page, totalPages, onPageChange }) {
  const { t } = useLanguage();
  if (totalPages <= 1) return null;

  return (
    <nav className="mt-4 flex flex-wrap items-center justify-between gap-3" aria-label={t('common.page')}>
      <span className="text-xs font-semibold text-gray-500">
        {t('common.page')} {page + 1} {t('common.of')} {totalPages}
      </span>
      <div className="flex gap-2">
        <button
          type="button"
          disabled={page === 0}
          onClick={() => onPageChange(page - 1)}
          className="admin-btn"
        >
          {t('common.prev')}
        </button>
        <button
          type="button"
          disabled={page >= totalPages - 1}
          onClick={() => onPageChange(page + 1)}
          className="admin-btn"
        >
          {t('common.next')}
        </button>
      </div>
    </nav>
  );
}
