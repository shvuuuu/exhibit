export const usd = (n: number, digits = 2) => n.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: digits, maximumFractionDigits: digits });

export const usdShort = (n: number) => (n >= 1000 ? `$${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k` : usd(n, 0));

export function relTime(iso: string, now = Date.now()) {
  const diff = new Date(iso).getTime() - now;
  const abs = Math.abs(diff);
  const m = Math.round(abs / 60000);
  const h = Math.round(abs / 3600000);
  const d = Math.round(abs / 86400000);
  const s = m < 1 ? "just now" : m < 60 ? `${m}m` : h < 48 ? `${h}h` : `${d}d`;
  if (s === "just now") return s;
  return diff >= 0 ? `in ${s}` : `${s} ago`;
}

export function dueLabel(hoursLeft: number | null) {
  if (hoursLeft === null) return "—";
  if (hoursLeft < 0) return "Overdue";
  if (hoursLeft < 48) return `${hoursLeft}h left`;
  return `${Math.round(hoursLeft / 24)}d left`;
}

export const shortDate = (iso?: string | null) => {
  if (!iso) return "—";
  const d = new Date(iso);
  const sameYear = d.getFullYear() === new Date().getFullYear();
  return d.toLocaleDateString("en-US", sameYear ? { month: "short", day: "numeric" } : { month: "short", day: "numeric", year: "numeric" });
};

export const dateTime = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }) : "—";
