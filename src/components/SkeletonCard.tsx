export default function SkeletonCard() {
  return (
    <div className="card overflow-hidden">
      <div className="aspect-[3/2] sm:aspect-[5/4] skeleton" />
      <div className="p-4 space-y-3">
        <div className="h-5 skeleton w-3/4" />
        <div className="h-4 skeleton w-full" />
        <div className="h-8 skeleton w-1/3" />
      </div>
    </div>
  )
}
