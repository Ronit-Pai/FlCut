type DateTimePickerProps = {
  id: string;
  label: string;
  optional?: boolean;
  date: string;
  time: string;
  onDateChange: (value: string) => void;
  onTimeChange: (value: string) => void;
  error?: string | null;
  hint?: string | null;
  disabled?: boolean;
  minDate?: string;
};

export function DateTimePicker({
  id,
  label,
  optional = false,
  date,
  time,
  onDateChange,
  onTimeChange,
  error,
  hint,
  disabled,
  minDate,
}: DateTimePickerProps) {
  return (
    <div className="space-y-2">
      <p className="flex items-center gap-2 font-mono text-sm font-bold uppercase tracking-wider">
        {label}
        {optional && (
          <span className="border-2 border-black bg-white px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-widest shadow-[2px_2px_0_0_#000]">
            Optional
          </span>
        )}
      </p>

      <div className="flex gap-2">
        <input
          id={`${id}-date`}
          type="date"
          value={date}
          onChange={(e) => onDateChange(e.target.value)}
          disabled={disabled}
          min={minDate}
          className={[
            "neo-input flex-1 px-3 py-2.5 font-mono text-sm",
            error ? "border-[#f43f5e]" : "",
          ].join(" ")}
          aria-label={`${label} date`}
        />
        <input
          id={`${id}-time`}
          type="time"
          value={time}
          onChange={(e) => onTimeChange(e.target.value)}
          disabled={disabled || !date}
          className={[
            "neo-input w-28 px-3 py-2.5 font-mono text-sm",
            error ? "border-[#f43f5e]" : "",
          ].join(" ")}
          aria-label={`${label} time`}
        />
      </div>

      {error ? (
        <p role="alert" className="font-mono text-xs font-semibold text-[#be123c]">
          ✕ {error}
        </p>
      ) : hint ? (
        <p className="font-mono text-xs text-black/40">{hint}</p>
      ) : date ? (
        <p className="font-mono text-xs text-black/50">
          Local time · stored as UTC
        </p>
      ) : null}
    </div>
  );
}
