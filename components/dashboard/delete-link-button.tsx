"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

type DeleteLinkButtonProps = {
  linkId: string;
};

export function DeleteLinkButton({ linkId }: DeleteLinkButtonProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  async function handleDelete() {
    const ok = window.confirm("Delete this short link permanently?");
    if (!ok) return;

    try {
      const res = await fetch(`/api/links/${linkId}`, { method: "DELETE" });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        const msg = body?.error ?? "Unable to delete link.";
        window.alert(msg);
        return;
      }

      startTransition(() => {
        router.refresh();
      });
    } catch (error) {
      window.alert("Network error while deleting link.");
    }
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={isPending}
      className={[
        "border-2 border-black px-3 py-1 font-mono text-xs font-bold uppercase tracking-wider",
        "shadow-[2px_2px_0_0_#000] transition-all disabled:cursor-not-allowed disabled:opacity-50",
        "bg-[#f87171] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0_0_#000]",
      ].join(" ")}
    >
      {isPending ? "…" : "Delete"}
    </button>
  );
}
