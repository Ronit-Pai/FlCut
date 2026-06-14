"use client";

import { FormEvent, useState } from "react";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = (await response.json()) as {
        success: boolean;
        error?: string;
      };

      if (!response.ok || !data.success) {
        setError(data.error ?? "Login failed. Please try again.");
        return;
      }

      window.location.replace("/");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-full flex-1 items-center justify-center bg-[#7dd3fc] p-6">
      <main className="neo-card w-full max-w-md space-y-8 p-8 sm:p-10">
        <header className="space-y-3 border-b-4 border-black pb-6">
          <p className="font-mono text-sm font-bold uppercase tracking-[0.2em]">
            Finite Loop Club
          </p>
          <h1 className="text-4xl font-black uppercase leading-none tracking-tight sm:text-5xl">
            FLCut
          </h1>
          <p className="text-base font-semibold text-black/80">
            Login to create and manage links.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-5">
          <label htmlFor="email" className="block space-y-2">
            <span className="font-mono text-sm font-bold uppercase tracking-wider">
              Email
            </span>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="username"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="admin@example.com"
              className="neo-input w-full px-4 py-3 font-mono text-base"
              disabled={isLoading}
            />
          </label>

          <label htmlFor="password" className="block space-y-2">
            <span className="font-mono text-sm font-bold uppercase tracking-wider">
              Password
            </span>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Password"
              className="neo-input w-full px-4 py-3 font-mono text-base"
              disabled={isLoading}
            />
          </label>

          <button
            type="submit"
            disabled={isLoading}
            className="neo-button w-full px-6 py-3 text-base disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? "Logging in..." : "Login"}
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
      </main>
    </div>
  );
}
