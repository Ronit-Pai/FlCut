"use client";

export function LogoutButton() {
  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="neo-button shrink-0 px-3 py-1.5 text-xs"
    >
      Logout
    </button>
  );
}
