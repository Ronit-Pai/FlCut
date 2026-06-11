"use client";

import { FormEvent, useState } from "react";

import type { CreateLinkResponse } from "@/src/types/api";

export default function Home() {
  const [url, setUrl] = useState("");
  const [shortUrl, setShortUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setShortUrl(null);
    setCopied(false);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      const data = (await response.json()) as CreateLinkResponse;

      if (!response.ok || !data.success) {
        setError(data.success ? "Something went wrong." : data.error);
        return;
      }

      setShortUrl(data.shortUrl);
      setUrl("");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleCopy() {
    if (!shortUrl) return;

    try {
      await navigator.clipboard.writeText(shortUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Could not copy to clipboard.");
    }
  }

  return (
    <div className="flex min-h-full flex-1 items-center justify-center bg-[#7dd3fc] p-6">
      <main className="neo-card w-full max-w-2xl space-y-8 p-8 sm:p-10">
        <header className="space-y-3 border-b-4 border-black pb-6">
          <p className="font-mono text-sm font-bold uppercase tracking-[0.2em]">
            Finite Loop Club
          </p>
          <h1 className="text-4xl font-black uppercase leading-none tracking-tight sm:text-5xl">
            FLCut
          </h1>
          <p className="max-w-lg text-base font-semibold text-black/80">
            Paste a long URL. Get a brutal short link. Share it everywhere.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label htmlFor="url" className="block space-y-2">
            <span className="font-mono text-sm font-bold uppercase tracking-wider">
              Long URL
            </span>
            <input
              id="url"
              name="url"
              type="url"
              required
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              placeholder="https://example.com/your-very-long-path"
              className="neo-input w-full px-4 py-3 font-mono text-base"
              disabled={isSubmitting}
            />
          </label>

          <button
            type="submit"
            disabled={isSubmitting}
            className="neo-button w-full px-6 py-3 text-base disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Shortening..." : "Shorten URL"}
          </button>
        </form>

        {error ? (
          <div
            role="alert"
            className="border-4 border-black bg-[#fda4af] px-4 py-3 font-semibold shadow-[4px_4px_0_0_#000]"
          >
            {error}
          </div>
        ) : null}

        {shortUrl ? (
          <section
            aria-live="polite"
            className="space-y-4 border-4 border-black bg-[#bef264] p-5 shadow-[6px_6px_0_0_#000]"
          >
            <p className="font-mono text-sm font-bold uppercase tracking-wider">
              Your short URL
            </p>
            <a
              href={shortUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block break-all font-mono text-lg font-bold underline decoration-4 underline-offset-4"
            >
              {shortUrl}
            </a>
            <button
              type="button"
              onClick={handleCopy}
              className="neo-button px-5 py-2 text-sm"
            >
              {copied ? "Copied!" : "Copy link"}
            </button>
          </section>
        ) : null}
      </main>
    </div>
  );
}
