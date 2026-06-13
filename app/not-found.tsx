export default function NotFound() {
  return (
    <div className="flex min-h-full flex-1 items-center justify-center bg-[#fff7a8] p-6">
      <div className="neo-card max-w-md space-y-4 p-8 text-center">
        <p className="font-mono text-sm font-bold uppercase tracking-widest text-black/70">
          404
        </p>
        <h1 className="text-3xl font-black uppercase tracking-tight">
          Link not found
        </h1>
        <p className="text-base font-medium text-black/80">
          This short link does not exist or is no longer active.
        </p>
      </div>
    </div>
  );
}
