export type ComputedStatus = "ACTIVE" | "SCHEDULED" | "EXPIRED" | "DISABLED";

export type StatusInput = {
  isDisabled: boolean;
  goLiveAt: Date | null;
  expiresAt: Date | null;
};

export function isScheduled(
  goLiveAt: Date | null,
  now: Date = new Date(),
): boolean {
  return goLiveAt !== null && now < goLiveAt;
}

export function isExpired(
  expiresAt: Date | null,
  now: Date = new Date(),
): boolean {
  return expiresAt !== null && now > expiresAt;
}

export function isActive(link: StatusInput, now: Date = new Date()): boolean {
  return getLinkStatus(link, now) === "ACTIVE";
}

export function getLinkStatus(
  link: StatusInput,
  now: Date = new Date(),
): ComputedStatus {
  if (link.isDisabled) return "DISABLED";
  if (isExpired(link.expiresAt, now)) return "EXPIRED";
  if (isScheduled(link.goLiveAt, now)) return "SCHEDULED";
  return "ACTIVE";
}

export function getCountdownLabel(
  link: StatusInput,
  now: Date = new Date(),
): string | null {
  const status = getLinkStatus(link, now);

  if (status === "SCHEDULED" && link.goLiveAt) {
    return `Starts in ${formatDuration(link.goLiveAt.getTime() - now.getTime())}`;
  }
  if (status === "ACTIVE" && link.expiresAt) {
    return `Expires in ${formatDuration(link.expiresAt.getTime() - now.getTime())}`;
  }
  if (status === "EXPIRED" && link.expiresAt) {
    return `Expired ${formatDuration(now.getTime() - link.expiresAt.getTime())} ago`;
  }
  return null;
}

function formatDuration(ms: number): string {
  const totalMinutes = Math.floor(Math.abs(ms) / 60_000);
  if (totalMinutes < 1) return "< 1m";

  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const minutes = totalMinutes % 60;

  if (days > 0 && hours > 0) return `${days}d ${hours}h`;
  if (days > 0) return `${days}d`;
  if (hours > 0 && minutes > 0) return `${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h`;
  return `${minutes}m`;
}
