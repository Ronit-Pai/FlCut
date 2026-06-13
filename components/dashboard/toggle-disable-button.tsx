"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

type ToggleDisableButtonProps = {
  linkId:     string;
  isDisabled: boolean;
};

export function ToggleDisableButton({
  linkId,
  isDisabled: serverState,
}: ToggleDisableButtonProps) {
  const [isDisabled, setIsDisabled] = useState(serverState);
  const [isPending,  startTransition] = useTransition();
  const router = useRouter();

  async function handleToggle() {
    const next = !isDisabled;
    setIsDisabled(next); 

    try {
      const res = await fetch(`/api/links/${linkId}/toggle`, { method: "PATCH" });

      if (!res.ok) {
        setIsDisabled(!next); 
        return;
      }

      startTransition(() => {
        router.refresh(); 
      });
    } catch {
      setIsDisabled(!next); 
    }
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={isPending}
      className={[
        "border-2 border-black px-3 py-1 font-mono text-xs font-bold uppercase tracking-wider",
        "shadow-[2px_2px_0_0_#000] transition-all disabled:cursor-not-allowed disabled:opacity-50",
        isDisabled
          ? "bg-[#bef264] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0_0_#000]"
          : "bg-[#fda4af] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0_0_#000]",
      ].join(" ")}
    >
      {isPending ? "…" : isDisabled ? "Enable" : "Disable"}
    </button>
  );
}
