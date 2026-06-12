"use client";

import { useEffect } from "react";
import Link from "next/link";

type DashboardErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function DashboardError({ error, reset }: DashboardErrorProps) {
  useEffect(() => {
    console.error("[Dashboard] Unhandled error:", error);
  }, [error]);

  return (
    <div className="flex min-h-full flex-1 items-center justify-center bg-[#7dd3fc] p-6">
      <div className="neo-card w-full max-w-lg space-y-6 p-8 sm:p-10">
        <header className="space-y-2 border-b-4 border-black pb-6">
          <p className="font-mono text-sm font-bold uppercase tracking-[0.2em]">
            Error
          </p>
          <h1 className="text-3xl font-black uppercase leading-none tracking-tight sm:text-4xl">
            Something went wrong
          </h1>
        </header>

        <div
          role="alert"
          className="border-4 border-black bg-[#fda4af] px-4 py-3 font-mono text-sm font-semibold shadow-[4px_4px_0_0_#000]"
        >
          {error.message || "Failed to load the dashboard. Please try again."}
          {error.digest ? (
            <span className="mt-1 block text-xs text-black/60">
              Error ID: {error.digest}
            </span>
          ) : null}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={reset}
            className="neo-button flex-1 px-5 py-2.5 text-sm"
          >
            Try again
          </button>
          <Link href="/" className="neo-button flex-1 px-5 py-2.5 text-center text-sm">
            Back home
          </Link>
        </div>
      </div>
    </div>
  );
}
