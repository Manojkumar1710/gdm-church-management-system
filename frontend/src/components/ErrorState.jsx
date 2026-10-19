import { useLanguage } from '../context/LanguageContext';

/**
 * ErrorState
 * Shown when an API call fails.
 * Keeps existing props: message, onRetry.
 */
export default function ErrorState({
  message,
  onRetry,
}) {
  const { t } = useLanguage();
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center px-4">
      <div className="mb-5 p-4 rounded-2xl bg-red-50 border border-red-100">
        <svg
          className="h-10 w-10 text-red-400 mx-auto"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
          />
        </svg>
      </div>
      <p className="text-gray-700 font-medium mb-1.5">
        {message ?? t('common.errorGeneric')}
      </p>
      <p className="text-gray-400 text-sm mb-5">{t('common.errorHint')}</p>
      {onRetry && (
        <button type="button" onClick={onRetry} className="btn-primary btn-sm">
          {t('common.tryAgain')}
        </button>
      )}
    </div>
  );
}
