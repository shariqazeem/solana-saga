export function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="glass-card rounded-3xl p-6 h-52 animate-pulse">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="h-6 bg-white/10 rounded-xl w-1/3 mb-3 shimmer"></div>
              <div className="flex items-center space-x-4">
                <div className="h-4 bg-white/10 rounded-lg w-16 shimmer"></div>
                <div className="h-4 bg-white/10 rounded-lg w-20 shimmer"></div>
                <div className="h-4 bg-white/10 rounded-lg w-16 shimmer"></div>
              </div>
            </div>
            <div className="w-5 h-5 bg-white/10 rounded shimmer"></div>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="bg-black/20 rounded-lg p-3 border border-white/5">
              <div className="h-3 bg-white/10 rounded w-16 mb-2 shimmer"></div>
              <div className="h-5 bg-white/10 rounded w-20 shimmer"></div>
            </div>
            <div className="bg-black/20 rounded-lg p-3 border border-white/5">
              <div className="h-3 bg-white/10 rounded w-16 mb-2 shimmer"></div>
              <div className="h-5 bg-white/10 rounded w-20 shimmer"></div>
            </div>
            <div className="bg-black/20 rounded-lg p-3 border border-white/5">
              <div className="h-3 bg-white/10 rounded w-16 mb-2 shimmer"></div>
              <div className="h-5 bg-white/10 rounded w-20 shimmer"></div>
            </div>
          </div>

          <div className="mt-4">
            <div className="flex justify-between mb-2">
              <div className="h-3 bg-white/10 rounded w-24 shimmer"></div>
              <div className="h-3 bg-white/10 rounded w-10 shimmer"></div>
            </div>
            <div className="h-2 bg-white/10 rounded-full shimmer"></div>
          </div>
        </div>
      ))}
    </div>
  );
}