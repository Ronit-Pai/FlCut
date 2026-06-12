"use client";

import { useEffect, useState } from "react";

type CountdownProps = {
  targetDate: string;
  mode: "starts" | "expires";
};

function buildLabel(targetDate: string): string | null {
  const diff = new Date(targetDate).getTime() - Date.now();
  if (diff <= 0) return null;

  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (days > 0) return `${days}d ${hours}h ${minutes}m ${seconds}s`;
  if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
}

export function Countdown({ targetDate, mode }: CountdownProps) {
  const [label, setLabel] = useState<string | null>(null);

  useEffect(() => {
    function tick() {
      setLabel(buildLabel(targetDate));
    }
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetDate]);

  if (!label) return null;

  return (
    <div className="border-4 border-black bg-[#fde047] p-4 shadow-[4px_4px_0_0_#000]">
      <p className="font-mono text-xs font-bold uppercase tracking-widest text-black/60">
        {mode === "starts" ? "Starts in" : "Expires in"}
      </p>
      <p
        className="mt-1 font-mono text-2xl font-black tabular-nums"
        aria-live="polite"
        aria-atomic="true"
      >
        {label}
      </p>
    </div>
  );
}
