export function LoadingSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
  )
}

export function CardLoadingSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <LoadingSkeleton className="h-6 w-1/3 mb-4" />
      <LoadingSkeleton className="h-4 w-full mb-2" />
      <LoadingSkeleton className="h-4 w-2/3 mb-4" />
      <div className="flex space-x-4">
        <LoadingSkeleton className="h-8 w-24" />
        <LoadingSkeleton className="h-8 w-24" />
      </div>
    </div>
  )
}

export function TableLoadingSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <LoadingSkeleton className="h-6 w-1/4" />
      </div>
      <div className="divide-y divide-gray-200">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="p-4 flex items-center space-x-4">
            <LoadingSkeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1">
              <LoadingSkeleton className="h-4 w-1/3 mb-2" />
              <LoadingSkeleton className="h-3 w-1/2" />
            </div>
            <LoadingSkeleton className="h-8 w-20" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function DashboardLoadingSkeleton() {
  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <LoadingSkeleton className="h-4 w-24" />
              <LoadingSkeleton className="h-8 w-8 rounded" />
            </div>
            <LoadingSkeleton className="h-8 w-20 mb-1" />
            <LoadingSkeleton className="h-3 w-32" />
          </div>
        ))}
      </div>
      
      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CardLoadingSkeleton />
        <CardLoadingSkeleton />
      </div>
      
      {/* Table */}
      <TableLoadingSkeleton />
    </div>
  )
}