/**
 * Square plate. The gold arm is the middle stroke of the E, pulled off the
 * stem by exactly one stem-width: the line taken out of the file.
 * Grid is 48, module is 6, corner radius is 11.
 */
export function LogoMark({
  size = 22,
  tone = "ink",
  className = "",
}: {
  size?: number;
  tone?: "ink" | "inverse";
  className?: string;
}) {
  const plate = tone === "inverse" ? "var(--paper)" : "var(--ink)";
  const letter = tone === "inverse" ? "var(--ink)" : "var(--paper)";
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" className={className} aria-hidden>
      <rect width="48" height="48" rx="11" fill={plate} />
      <path fill={letter} d="M8 8h32v6H8zM8 34h32v6H8zM8 8h6v32H8z" />
      <path fill="var(--amber)" d="M20 21h20v6H20z" />
    </svg>
  );
}

export function Logo({
  className = "",
  mark = 22,
  tone = "ink",
}: {
  className?: string;
  mark?: number;
  tone?: "ink" | "inverse";
}) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <LogoMark size={mark} tone={tone} />
      <span className="text-[15.5px] font-semibold leading-none tracking-[-0.045em]">Exhibit</span>
    </span>
  );
}
