export default function ErrorState({ message = 'Something went wrong. Please try again.', onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="text-5xl mb-4">⚠️</div>
      <p className="text-red-600 font-medium mb-3">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn-primary text-sm px-4 py-2">
          Try Again
        </button>
      )}
    </div>
  );
}
