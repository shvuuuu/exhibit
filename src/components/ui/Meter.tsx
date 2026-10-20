export function Meter({ value, className = "" }: { value: number; className?: string }) {
  // Monochrome: the number carries the meaning; the bar only shows magnitude.
  const tone = "var(--ink)";
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <span className="relative h-1 w-14 overflow-hidden rounded-full bg-[#ececec]">
        <span className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${Math.max(4, value)}%`, background: tone }} />
      </span>
      <span className="num text-[12px] text-ink-2">{value}%</span>
    </span>
  );
}
