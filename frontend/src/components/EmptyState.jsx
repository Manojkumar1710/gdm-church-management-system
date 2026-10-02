export default function EmptyState({ title = 'Nothing here yet', message, icon: Icon }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      {Icon && <Icon className="h-16 w-16 text-gray-300 mb-4" />}
      <h3 className="text-lg font-semibold text-gray-500 mb-1">{title}</h3>
      {message && <p className="text-gray-400 text-sm max-w-sm">{message}</p>}
    </div>
  );
}
