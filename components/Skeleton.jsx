// Reusable skeleton loader block — mirrors the shape of content while it loads
// Usage: <Skeleton className="h-8 w-48" />  or  <Skeleton className="h-32 w-full" />
export default function Skeleton({ className = '' }) {
  return <div className={`skeleton ${className}`} aria-hidden="true" />
}

// Pre-built skeleton layouts for common sections
export function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-4">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-10 w-48" />
      <Skeleton className="h-3 w-24" />
    </div>
  )
}

export function SkeletonRow() {
  return (
    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
      <div className="flex items-center gap-3">
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-4 w-32" />
      </div>
      <Skeleton className="h-4 w-20" />
    </div>
  )
}
