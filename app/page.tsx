"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";

import { validateAlias } from "@/src/lib/validators/alias";
import { DateTimePicker } from "@/components/datetime-picker";
import type {
  CreateLinkRequestBody,
  CreateLinkResponse,
} from "@/src/types/api";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const BASE_URL = typeof window !== "undefined" ? window.location.origin : "";

/** Combines a YYYY-MM-DD date and HH:MM time into a UTC ISO string. */
function toUtcIso(date: string, time: string): string | null {
  if (!date) return null;
  // `new Date("YYYY-MM-DDTHH:MM")` — no Z suffix → interpreted as LOCAL time.
  // `.toISOString()` then converts to UTC. This is intentional.
  const d = new Date(`${date}T${time || "00:00"}`);
  return isNaN(d.getTime()) ? null : d.toISOString();
}

/** Returns today's date as YYYY-MM-DD in the browser's local timezone. */
function todayLocal(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function getAliasFieldError(value: string): string | null {
  if (value.length === 0) return null;
  const result = validateAlias(value);
  return result.valid ? null : result.error;
}

function getGoLiveError(date: string, time: string): string | null {
  if (!date) return null;
  const iso = toUtcIso(date, time);
  if (!iso) return "Invalid date or time.";
  if (new Date(iso) <= new Date()) return "Go live date must be in the future.";
  return null;
}

function getExpiresError(
  date: string,
  time: string,
  goLiveDate: string,
  goLiveTime: string,
): string | null {
  if (!date) return null;
  const iso = toUtcIso(date, time);
  if (!iso) return "Invalid date or time.";
  if (new Date(iso) <= new Date()) return "Expiry date must be in the future.";
  if (goLiveDate) {
    const goLiveIso = toUtcIso(goLiveDate, goLiveTime);
    if (goLiveIso && new Date(iso) <= new Date(goLiveIso)) {
      return "Expiry must be after go-live date.";
    }
  }
  return null;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function Home() {
  // Core fields
  const [url, setUrl] = useState("");
  const [alias, setAlias] = useState("");
  const [aliasFieldError, setAliasFieldError] = useState<string | null>(null);

  // Advanced — go-live
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [goLiveDate, setGoLiveDate] = useState("");
  const [goLiveTime, setGoLiveTime] = useState("09:00");
  const [goLiveError, setGoLiveError] = useState<string | null>(null);

  // Advanced — expiry
  const [expiresDate, setExpiresDate] = useState("");
  const [expiresTime, setExpiresTime] = useState("23:59");
  const [expiresError, setExpiresError] = useState<string | null>(null);

  // Submission
  const [shortUrl, setShortUrl] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);

  // ── Change handlers ─────────────────────────────────────────────────────────

  function handleAliasChange(value: string) {
    setAlias(value);
    setAliasFieldError(getAliasFieldError(value));
  }

  function handleGoLiveDateChange(value: string) {
    setGoLiveDate(value);
    setGoLiveError(getGoLiveError(value, goLiveTime));
    // Re-validate expiry cross-field constraint.
    if (expiresDate) {
      setExpiresError(
        getExpiresError(expiresDate, expiresTime, value, goLiveTime),
      );
    }
  }

  function handleGoLiveTimeChange(value: string) {
    setGoLiveTime(value);
    setGoLiveError(getGoLiveError(goLiveDate, value));
    if (expiresDate) {
      setExpiresError(
        getExpiresError(expiresDate, expiresTime, goLiveDate, value),
      );
    }
  }

  function handleExpiresDateChange(value: string) {
    setExpiresDate(value);
    setExpiresError(
      getExpiresError(value, expiresTime, goLiveDate, goLiveTime),
    );
  }

  function handleExpiresTimeChange(value: string) {
    setExpiresTime(value);
    setExpiresError(
      getExpiresError(expiresDate, value, goLiveDate, goLiveTime),
    );
  }

  // ── Submit ──────────────────────────────────────────────────────────────────

  const hasFieldError = !!aliasFieldError || !!goLiveError || !!expiresError;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (hasFieldError) return;

    setApiError(null);
    setShortUrl(null);
    setCopied(false);
    setIsSubmitting(true);

    try {
      const body: CreateLinkRequestBody = { url };

      const trimmedAlias = alias.trim();
      if (trimmedAlias) body.alias = trimmedAlias;

      if (goLiveDate) {
        const iso = toUtcIso(goLiveDate, goLiveTime);
        if (iso) body.goLiveAt = iso;
      }
      if (expiresDate) {
        const iso = toUtcIso(expiresDate, expiresTime);
        if (iso) body.expiresAt = iso;
      }

      const response = await fetch("/api/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = (await response.json()) as CreateLinkResponse;

      if (!response.ok || !data.success) {
        setApiError(data.success ? "Something went wrong." : data.error);
        return;
      }

      setShortUrl(data.shortUrl);
      // Clear all fields on success
      setUrl("");
      setAlias("");
      setAliasFieldError(null);
      setGoLiveDate("");
      setGoLiveTime("09:00");
      setGoLiveError(null);
      setExpiresDate("");
      setExpiresTime("23:59");
      setExpiresError(null);
    } catch {
      setApiError("Network error. Please try again.");
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
      setApiError("Could not copy to clipboard.");
    }
  }

  const aliasPreview =
    alias.trim() && !aliasFieldError ? `${BASE_URL}/${alias.trim()}` : null;

  const today = todayLocal();

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="flex min-h-full flex-1 items-center justify-center bg-[#7dd3fc] p-6">
      <main className="neo-card w-full max-w-2xl space-y-8 p-8 sm:p-10">
        {/* Header */}
        <header className="space-y-3 border-b-4 border-black pb-6">
          <div className="flex items-start justify-between gap-4">
            <p className="font-mono text-sm font-bold uppercase tracking-[0.2em]">
              Finite Loop Club
            </p>
            <Link
              href="/dashboard"
              className="neo-button shrink-0 px-3 py-1.5 text-xs"
            >
              Manage Links →
            </Link>
          </div>
          <h1 className="text-4xl font-black uppercase leading-none tracking-tight sm:text-5xl">
            FLCut
          </h1>
          <p className="max-w-lg text-base font-semibold text-black/80">
            Paste a long URL. Get a short link.
          </p>
        </header>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Long URL */}
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
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/your-very-long-path"
              className="neo-input w-full px-4 py-3 font-mono text-base"
              disabled={isSubmitting}
            />
          </label>

          {/* Custom Alias */}
          <div className="space-y-2">
            <label
              htmlFor="alias"
              className="flex items-center gap-2 font-mono text-sm font-bold uppercase tracking-wider"
            >
              Custom Alias
              <span className="border-2 border-black bg-white px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-widest shadow-[2px_2px_0_0_#000]">
                Optional
              </span>
            </label>

            <div className="relative">
              <input
                id="alias"
                name="alias"
                type="text"
                value={alias}
                onChange={(e) => handleAliasChange(e.target.value)}
                placeholder="my-custom-link"
                maxLength={30}
                autoComplete="off"
                spellCheck={false}
                className={[
                  "neo-input w-full px-4 py-3 font-mono text-base",
                  aliasFieldError ? "border-[#f43f5e]" : "",
                ].join(" ")}
                disabled={isSubmitting}
                aria-describedby={
                  aliasFieldError
                    ? "alias-error"
                    : aliasPreview
                      ? "alias-preview"
                      : "alias-hint"
                }
              />
              {alias.length > 0 && (
                <span
                  className={[
                    "pointer-events-none absolute right-3 top-1/2 -translate-y-1/2",
                    "font-mono text-xs font-bold tabular-nums",
                    alias.length >= 28 ? "text-[#f43f5e]" : "text-black/30",
                  ].join(" ")}
                >
                  {alias.length}/30
                </span>
              )}
            </div>

            {aliasFieldError ? (
              <p
                id="alias-error"
                role="alert"
                className="font-mono text-xs font-semibold text-[#be123c]"
              >
                ✕ {aliasFieldError}
              </p>
            ) : aliasPreview ? (
              <p
                id="alias-preview"
                className="font-mono text-xs font-semibold text-black/60"
              >
                ✓ Your link:{" "}
                <span className="font-bold text-black">{aliasPreview}</span>
              </p>
            ) : (
              <p id="alias-hint" className="font-mono text-xs text-black/40">
                Leave blank to auto-generate · 3–30 chars · a–z, 0–9, hyphens
              </p>
            )}
          </div>

          {/* ── Advanced: Schedule & Expiry ──────────────────────────────── */}
          <div className="border-4 border-black bg-white shadow-[4px_4px_0_0_#000]">
            <button
              type="button"
              onClick={() => setShowAdvanced((v) => !v)}
              className="flex w-full items-center justify-between px-4 py-3 font-mono text-sm font-bold uppercase tracking-wider"
              aria-expanded={showAdvanced}
            >
              <span>⚙ Schedule &amp; Expiry</span>
              <span aria-hidden="true">{showAdvanced ? "▲" : "▼"}</span>
            </button>

            {showAdvanced && (
              <div className="space-y-5 border-t-4 border-black p-4">
                {/* Go Live At */}
                <DateTimePicker
                  id="go-live"
                  label="Go Live At"
                  optional
                  date={goLiveDate}
                  time={goLiveTime}
                  onDateChange={handleGoLiveDateChange}
                  onTimeChange={handleGoLiveTimeChange}
                  error={goLiveError}
                  hint="Link becomes accessible only after this date and time."
                  disabled={isSubmitting}
                  minDate={today}
                />

                {/* Expires At */}
                <DateTimePicker
                  id="expires"
                  label="Expires At"
                  optional
                  date={expiresDate}
                  time={expiresTime}
                  onDateChange={handleExpiresDateChange}
                  onTimeChange={handleExpiresTimeChange}
                  error={expiresError}
                  hint="Link stops working after this date and time."
                  disabled={isSubmitting}
                  minDate={goLiveDate || today}
                />
              </div>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting || hasFieldError}
            className="neo-button w-full px-6 py-3 text-base disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Shortening..." : "Shorten URL"}
          </button>
        </form>

        {/* API error */}
        {apiError ? (
          <div
            role="alert"
            className="border-4 border-black bg-[#fda4af] px-4 py-3 font-semibold shadow-[4px_4px_0_0_#000]"
          >
            {apiError}
          </div>
        ) : null}

        {/* Success */}
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
