/**
 * Skeleton components
 * Match the visual weight of the content they replace so the page
 * doesn't jump when data arrives.
 */

/** Base animated shimmer bar */
export function Skeleton({ className = '' }) {
  return (
    <div
      className={`animate-pulse rounded-xl bg-gray-200/80 ${className}`}
      aria-hidden="true"
    />
  );
}

/** Matches an event / gallery / sermon card */
export function CardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-church-border overflow-hidden shadow-card">
      <Skeleton className="h-48 w-full rounded-none" />
      <div className="p-4 space-y-2.5">
        <Skeleton className="h-3 w-20 rounded-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  );
}

/** Matches a pastor card */
export function PastorCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-church-border p-6 text-center shadow-card space-y-3">
      <Skeleton className="w-24 h-24 rounded-full mx-auto" />
      <Skeleton className="h-4 w-32 mx-auto" />
      <Skeleton className="h-3 w-20 mx-auto" />
    </div>
  );
}

/** Matches a photo grid cell */
export function PhotoSkeleton() {
  return <Skeleton className="aspect-square w-full rounded-xl" />;
}

/** Matches an admin table row */
export function TableRowSkeleton({ cols = 4 }) {
  return (
    <tr aria-hidden="true">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <Skeleton className="h-4 w-full" />
        </td>
      ))}
    </tr>
  );
}
