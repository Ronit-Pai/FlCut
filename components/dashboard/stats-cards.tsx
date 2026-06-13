type CardProps = {
  label: string;
  value: number;
  bg: string;
};

function StatCard({ label, value, bg }: CardProps) {
  return (
    <div
      style={{ backgroundColor: bg }}
      className="border-4 border-black p-5 shadow-[4px_4px_0_0_#000]"
    >
      <p className="font-mono text-xs font-bold uppercase tracking-widest text-black/60">
        {label}
      </p>
      <p className="mt-2 font-mono text-3xl font-black tabular-nums">
        {value.toLocaleString()}
      </p>
    </div>
  );
}

type StatsCardsProps = {
  totalLinks:     number;
  totalClicks:    number;
  uniqueVisitors: number;
  activeLinks:    number;
};

export function StatsCards({
  totalLinks,
  totalClicks,
  uniqueVisitors,
  activeLinks,
}: StatsCardsProps) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      <StatCard label="Total Links"     value={totalLinks}     bg="#fde047" />
      <StatCard label="Total Clicks"    value={totalClicks}    bg="#bef264" />
      <StatCard label="Unique Visitors" value={uniqueVisitors} bg="#7dd3fc" />
      <StatCard label="Active Links"    value={activeLinks}    bg="#fda4af" />
    </div>
  );
}
