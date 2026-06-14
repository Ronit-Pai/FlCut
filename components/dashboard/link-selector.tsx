"use client";

import { useRouter } from "next/navigation";

type LinkSelectorProps = {
  links: Array<{ slug: string }>;
  selectedSlug: string | null;
  currentFilter: string;
};

export function LinkSelector({
  links,
  selectedSlug,
  currentFilter,
}: LinkSelectorProps) {
  const router = useRouter();

  function handleChange(value: string) {
    const params = new URLSearchParams();
    if (currentFilter !== "all") params.set("filter", currentFilter);
    if (value) params.set("analytics", value);

    const qs = params.toString();
    router.push(`/dashboard${qs ? `?${qs}` : ""}`);
  }

  return (
    <select
      value={selectedSlug ?? ""}
      onChange={(e) => handleChange(e.target.value)}
      className="neo-input px-3 py-2 font-mono text-sm"
      aria-label="Select a link to view its analytics"
    >
      <option value="">Select a link</option>
      {links.map((link) => (
        <option key={link.slug} value={link.slug}>
          /{link.slug}
        </option>
      ))}
    </select>
  );
}
