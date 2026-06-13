import type {
  ReferrerStat,
  DeviceStat,
  TimeSeriesPoint,
} from "@/src/lib/analytics/queries";

function SectionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border-4 border-black bg-white shadow-[4px_4px_0_0_#000]">
      <div className="border-b-4 border-black bg-[#fde047] px-4 py-2">
        <p className="font-mono text-xs font-bold uppercase tracking-widest">
          {title}
        </p>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

function BarRow({
  label,
  count,
  max,
}: {
  label: string;
  count: number;
  max: number;
}) {
  const pct = max > 0 ? Math.round((count / max) * 100) : 0;
  return (
    <div className="space-y-0.5">
      <div className="flex items-center justify-between font-mono text-xs">
        <span className="truncate pr-2 font-semibold">{label}</span>
        <span className="shrink-0 tabular-nums text-black/60">
          {count.toLocaleString()}
        </span>
      </div>
      <div className="h-2 w-full bg-black/10">
        <div className="h-2 bg-black" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

type AnalyticsSectionProps = {
  topReferrers: ReferrerStat[];
  deviceBreakdown: DeviceStat[];
  timeSeries: TimeSeriesPoint[];
};

export function AnalyticsSection({
  topReferrers,
  deviceBreakdown,
  timeSeries,
}: AnalyticsSectionProps) {
  const maxReferrer = topReferrers[0]?.count ?? 1;
  const maxDay = Math.max(...timeSeries.map((p) => p.clicks), 1);

  return (
    <section aria-label="Analytics" className="space-y-4">
      <h2 className="font-mono text-sm font-bold uppercase tracking-widest text-black/60">
        Analytics
      </h2>

      <div className="grid gap-4 sm:grid-cols-2">
        <SectionCard title="Top Sources">
          {topReferrers.length === 0 ? (
            <p className="font-mono text-xs text-black/40">No data yet.</p>
          ) : (
            <div className="space-y-3">
              {topReferrers.map((r) => (
                <BarRow
                  key={r.source}
                  label={r.source}
                  count={r.count}
                  max={maxReferrer}
                />
              ))}
            </div>
          )}
        </SectionCard>
        <SectionCard title="Device Breakdown">
          {deviceBreakdown.length === 0 ? (
            <p className="font-mono text-xs text-black/40">No data yet.</p>
          ) : (
            <div className="space-y-3">
              {deviceBreakdown.map((d) => (
                <div key={d.type} className="space-y-0.5">
                  <div className="flex items-center justify-between font-mono text-xs">
                    <span className="font-semibold">{d.type}</span>
                    <span className="tabular-nums text-black/60">
                      {d.count.toLocaleString()} ({d.percentage}%)
                    </span>
                  </div>
                  <div className="h-2 w-full bg-black/10">
                    <div
                      className="h-2 bg-black"
                      style={{ width: `${d.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </div>
      <SectionCard title="Click Trend — Last 7 Days">
        {timeSeries.length === 0 ? (
          <p className="font-mono text-xs text-black/40">
            No clicks in the last 7 days.
          </p>
        ) : (
          <div className="space-y-2">
            {timeSeries.map((p) => (
              <div key={p.date} className="flex items-center gap-3">
                <span className="w-16 shrink-0 font-mono text-xs text-black/60">
                  {p.date}
                </span>
                <div className="flex-1">
                  <div className="h-4 bg-black/10">
                    <div
                      className="h-4 bg-black"
                      style={{
                        width: `${Math.round((p.clicks / maxDay) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
                <span className="w-10 shrink-0 text-right font-mono text-xs font-bold tabular-nums">
                  {p.clicks}
                </span>
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </section>
  );
}
