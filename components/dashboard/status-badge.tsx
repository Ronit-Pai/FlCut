import type { ComputedStatus } from "@/src/lib/links/status";

type StatusConfig = {
  bg: string;
  label: string;
};

const STATUS_CONFIG: Record<ComputedStatus, StatusConfig> = {
  ACTIVE: { bg: "#bef264", label: "Active" },
  SCHEDULED: { bg: "#7dd3fc", label: "Scheduled" },
  EXPIRED: { bg: "#fda4af", label: "Expired" },
  DISABLED: { bg: "#e5e7eb", label: "Disabled" },
};

type StatusBadgeProps = {
  status: ComputedStatus;
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const { bg, label } = STATUS_CONFIG[status];

  return (
    <span
      style={{ backgroundColor: bg }}
      className="inline-block border-2 border-black px-2 py-0.5 font-mono text-xs font-bold uppercase tracking-wider shadow-[2px_2px_0_0_#000]"
    >
      {label}
    </span>
  );
}
