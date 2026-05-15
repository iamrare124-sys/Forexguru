// src/components/Skeleton.js
// Loading skeletons — server se data aane tak dikhenge

export function SkeletonCard() {
  return (
    <div className="rounded-xl overflow-hidden border border-gray-100 animate-pulse">
      {/* Image placeholder */}
      <div className="aspect-video bg-gray-200" />
      <div className="p-4 space-y-3">
        {/* Category tag */}
        <div className="h-5 w-20 bg-gray-200 rounded-full" />
        {/* Title */}
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-full" />
          <div className="h-4 bg-gray-200 rounded w-4/5" />
        </div>
        {/* Excerpt */}
        <div className="space-y-1">
          <div className="h-3 bg-gray-100 rounded w-full" />
          <div className="h-3 bg-gray-100 rounded w-3/4" />
        </div>
        {/* Meta */}
        <div className="flex gap-3 pt-1">
          <div className="h-3 w-16 bg-gray-100 rounded" />
          <div className="h-3 w-12 bg-gray-100 rounded" />
        </div>
      </div>
    </div>
  )
}

export function SkeletonFeatured() {
  return (
    <div className="rounded-2xl overflow-hidden border border-gray-100 animate-pulse">
      <div className="grid grid-cols-1 md:grid-cols-2">
        <div className="aspect-video md:aspect-auto bg-gray-200 min-h-48" />
        <div className="p-6 space-y-4">
          <div className="h-5 w-24 bg-gray-200 rounded-full" />
          <div className="space-y-2">
            <div className="h-6 bg-gray-200 rounded w-full" />
            <div className="h-6 bg-gray-200 rounded w-5/6" />
            <div className="h-6 bg-gray-200 rounded w-4/6" />
          </div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-100 rounded w-full" />
            <div className="h-4 bg-gray-100 rounded w-full" />
            <div className="h-4 bg-gray-100 rounded w-2/3" />
          </div>
          <div className="flex gap-3 pt-2">
            <div className="h-4 w-20 bg-gray-100 rounded" />
            <div className="h-4 w-16 bg-gray-100 rounded" />
          </div>
        </div>
      </div>
    </div>
  )
}

export function SkeletonPostPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8 animate-pulse">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-4">
          {/* Breadcrumb */}
          <div className="flex gap-2">
            <div className="h-4 w-12 bg-gray-200 rounded" />
            <div className="h-4 w-4 bg-gray-200 rounded" />
            <div className="h-4 w-24 bg-gray-200 rounded" />
          </div>
          {/* Category tag */}
          <div className="h-6 w-28 bg-gray-200 rounded-full" />
          {/* Title */}
          <div className="space-y-3">
            <div className="h-8 bg-gray-200 rounded w-full" />
            <div className="h-8 bg-gray-200 rounded w-5/6" />
          </div>
          {/* Author meta */}
          <div className="flex gap-4 items-center py-4 border-y border-gray-100">
            <div className="w-10 h-10 rounded-full bg-gray-200" />
            <div className="space-y-1">
              <div className="h-3 w-24 bg-gray-200 rounded" />
              <div className="h-3 w-32 bg-gray-100 rounded" />
            </div>
            <div className="h-3 w-20 bg-gray-100 rounded ml-4" />
            <div className="h-3 w-16 bg-gray-100 rounded" />
          </div>
          {/* Cover image */}
          <div className="aspect-video bg-gray-200 rounded-xl" />
          {/* Content lines */}
          <div className="space-y-3 pt-2">
            {[...Array(8)].map((_, i) => (
              <div key={i} className={`h-4 bg-gray-100 rounded ${i % 4 === 3 ? 'w-2/3' : 'w-full'}`} />
            ))}
          </div>
          {/* H2 */}
          <div className="h-6 w-48 bg-gray-200 rounded mt-6" />
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className={`h-4 bg-gray-100 rounded ${i % 3 === 2 ? 'w-3/4' : 'w-full'}`} />
            ))}
          </div>
        </div>

        {/* Sidebar skeleton */}
        <div className="lg:col-span-1 space-y-4">
          <div className="h-64 bg-gray-200 rounded-xl" />
          <div className="bg-gray-50 rounded-xl p-4 space-y-3">
            <div className="h-4 w-24 bg-gray-200 rounded" />
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex gap-3">
                <div className="h-4 w-8 bg-gray-200 rounded" />
                <div className="h-4 flex-1 bg-gray-100 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export function SkeletonLiveWidget() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 animate-pulse">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-2 h-2 rounded-full bg-gray-200" />
        <div className="h-3 w-20 bg-gray-200 rounded" />
        <div className="h-3 w-32 bg-gray-100 rounded" />
      </div>
      <div className="flex flex-wrap gap-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-gray-100 rounded-lg px-3 py-2 space-y-1">
            <div className="h-3 w-16 bg-gray-200 rounded" />
            <div className="h-4 w-20 bg-gray-300 rounded" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function SkeletonSidebar() {
  return (
    <div className="space-y-6">
      <div className="h-64 bg-gray-200 rounded-xl animate-pulse" />
      <div className="bg-gray-50 rounded-xl p-4 animate-pulse space-y-3">
        <div className="h-4 w-24 bg-gray-200 rounded" />
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex gap-3 items-start">
            <div className="h-6 w-6 bg-gray-200 rounded" />
            <div className="h-4 flex-1 bg-gray-100 rounded" />
          </div>
        ))}
      </div>
    </div>
  )
}
