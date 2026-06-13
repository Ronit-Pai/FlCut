import { getLinkStatus, getCountdownLabel } from "@/src/lib/links/status";
import { StatusBadge } from "./status-badge";
import { ToggleDisableButton } from "./toggle-disable-button";
import type { LinkWithCounts } from "@/src/lib/analytics/queries";

type LinksTableProps = {
  links: LinkWithCounts[];
  uniqueClicksByLinkId: Record<string, number>;
  baseUrl: string;
  emptyMessage?: string;
};

function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "…";
}

function formatIstDate(date: Date): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  }).format(date);
}

const TH =
  "border-b-4 border-r-2 border-black px-4 py-3 text-left font-mono text-xs font-bold uppercase tracking-widest last:border-r-0";

const TD =
  "border-b-2 border-r-2 border-black/20 px-4 py-3 align-top last:border-r-0";

export function LinksTable({
  links,
  uniqueClicksByLinkId,
  baseUrl,
  emptyMessage = "No links found.",
}: LinksTableProps) {
  const now = new Date();

  if (links.length === 0) {
    return (
      <div className="border-4 border-black bg-white p-10 text-center shadow-[4px_4px_0_0_#000]">
        <p className="font-mono text-sm font-bold uppercase tracking-widest text-black/40">
          Empty
        </p>
        <p className="mt-2 text-xl font-black uppercase tracking-tight">
          {emptyMessage}
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto border-4 border-black shadow-[6px_6px_0_0_#000]">
      <table className="w-full min-w-[900px] border-collapse bg-white">
        <thead className="bg-[#fde047]">
          <tr>
            <th className={TH}>Short URL</th>
            <th className={TH}>Original URL</th>
            <th className={TH}>Status</th>
            <th className={`${TH} text-right`}>Clicks</th>
            <th className={`${TH} text-right`}>Unique</th>
            <th className={TH}>Created</th>
            <th className={TH}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {links.map((link, index) => {
            const shortUrl = `${baseUrl}/${link.slug}`;
            const isEven = index % 2 === 0;
            const computedStatus = getLinkStatus(link, now);
            const countdown = getCountdownLabel(link, now);
            const uniqueClicks = uniqueClicksByLinkId[link.id] ?? 0;
            const totalClicks = link._count.clickEvents;
            const repeatClicks = Math.max(0, totalClicks - uniqueClicks);

            return (
              <tr
                key={link.id}
                className={isEven ? "bg-white" : "bg-[#fafafa]"}
              >
                <td className={TD}>
                  <a
                    href={shortUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-sm font-bold underline decoration-2 underline-offset-2 hover:text-black/60"
                  >
                    {truncate(shortUrl, 38)}
                  </a>
                </td>

                <td className={TD}>
                  <a
                    href={link.targetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={link.targetUrl}
                    className="block max-w-[240px] truncate font-mono text-sm text-black/70 underline decoration-1 underline-offset-2 hover:text-black"
                  >
                    {truncate(link.targetUrl, 48)}
                  </a>
                </td>

                <td className={TD}>
                  <div className="space-y-1">
                    <StatusBadge status={computedStatus} />
                    {countdown && (
                      <p className="font-mono text-xs text-black/50">
                        {countdown}
                      </p>
                    )}
                  </div>
                </td>

                <td className={`${TD} text-right`}>
                  <span className="font-mono text-sm font-bold tabular-nums">
                    {totalClicks.toLocaleString()}
                  </span>
                  {repeatClicks > 0 && (
                    <p className="font-mono text-xs text-black/40 tabular-nums">
                      {repeatClicks} repeat
                    </p>
                  )}
                </td>

                <td className={`${TD} text-right`}>
                  <span className="font-mono text-sm font-bold tabular-nums">
                    {uniqueClicks.toLocaleString()}
                  </span>
                </td>

                <td className={TD}>
                  <span className="font-mono text-sm text-black/70">
                    {formatIstDate(link.createdAt)}
                  </span>
                </td>

                <td className={TD}>
                  <ToggleDisableButton
                    linkId={link.id}
                    isDisabled={link.isDisabled}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
