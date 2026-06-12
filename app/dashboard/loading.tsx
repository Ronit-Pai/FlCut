const SKELETON_ROWS = 6;

function SkeletonCell({ className = "" }: { className?: string }) {
  return (
    <td className="border-b-2 border-r-2 border-black/20 px-4 py-3 last:border-r-0">
      <div className={`animate-pulse rounded-none bg-black/10 ${className}`} />
    </td>
  );
}

export default function DashboardLoading() {
  return (
    <div className="min-h-full bg-[#7dd3fc] p-6">
      <div className="mx-auto max-w-6xl space-y-8">
        
        <div className="neo-card p-8 sm:p-10">
          <div className="flex flex-col gap-4 border-b-4 border-black pb-6 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-3">
              <div className="h-3 w-32 animate-pulse bg-black/20" />
              <div className="h-10 w-56 animate-pulse bg-black/20" />
              <div className="h-4 w-24 animate-pulse bg-black/10" />
            </div>
            <div className="h-10 w-28 animate-pulse border-4 border-black bg-white/50 shadow-[4px_4px_0_0_#000]" />
          </div>
        </div>

        {/* Table skeleton */}
        <div className="overflow-x-auto border-4 border-black shadow-[6px_6px_0_0_#000]">
          <table className="w-full min-w-[720px] border-collapse bg-white">
            <thead className="bg-[#fde047]">
              <tr>
                {["Short URL", "Original URL", "Status", "Clicks", "Created"].map(
                  (col) => (
                    <th
                      key={col}
                      className="border-b-4 border-r-2 border-black px-4 py-3 text-left font-mono text-xs font-bold uppercase tracking-widest last:border-r-0"
                    >
                      {col}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: SKELETON_ROWS }).map((_, i) => (
                <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-[#fafafa]"}>
                  <SkeletonCell className="h-4 w-36" />
                  <SkeletonCell className="h-4 w-52" />
                  <SkeletonCell className="h-5 w-16" />
                  <SkeletonCell className="h-4 w-10" />
                  <SkeletonCell className="h-4 w-24" />
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
