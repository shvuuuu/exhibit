import { clsx } from "clsx";

export type Tone = "neutral" | "outline" | "green" | "red" | "amber" | "blue" | "violet" | "ink";

const tones: Record<Tone, string> = {
  neutral: "bg-sunken text-ink-2",
  outline: "bg-surface text-ink-2 shadow-[inset_0_0_0_1px_var(--line-strong)]",
  green: "bg-green-soft text-green",
  red: "bg-red-soft text-red",
  amber: "bg-sunken text-ink-2",
  blue: "bg-blue-soft text-blue",
  violet: "bg-surface text-ink-2 shadow-[inset_0_0_0_1px_var(--line-strong)]",
  ink: "bg-ink text-white",
};

export function Chip({ tone = "neutral", children, className, dot }: { tone?: Tone; children: React.ReactNode; className?: string; dot?: boolean }) {
  return (
    <span className={clsx("inline-flex h-[22px] items-center gap-1.5 whitespace-nowrap rounded-md px-2 text-[12px] font-medium", tones[tone], className)}>
      {dot ? <span className="size-1.5 rounded-full bg-current" /> : null}
      {children}
    </span>
  );
}

export const DECISION_META: Record<string, { label: string; tone: Tone; verb: string }> = {
  FIGHT: { label: "Fight", tone: "ink", verb: "File evidence" },
  OFFER: { label: "Offer", tone: "outline", verb: "Send offer" },
  REFUND: { label: "Refund", tone: "neutral", verb: "Refund" },
  MESSAGE_BUYER: { label: "Message", tone: "blue", verb: "Message buyer" },
};

export function DecisionChip({ decision }: { decision: string | null }) {
  if (!decision) return <span className="text-[12px] text-faint">Not analyzed</span>;
  const m = DECISION_META[decision];
  return <Chip tone={m?.tone ?? "neutral"}>{m?.label ?? decision}</Chip>;
}

export function outcomeMeta(code: string | null | undefined): { label: string; tone: Tone } | null {
  if (!code) return null;
  if (code === "RESOLVED_SELLER_FAVOUR") return { label: "Won", tone: "green" };
  if (code === "RESOLVED_BUYER_FAVOUR") return { label: "Refunded", tone: "red" };
  if (code === "RESOLVED_WITH_PAYOUT") return { label: "Settled", tone: "outline" };
  return { label: code.replace(/_/g, " ").toLowerCase(), tone: "neutral" };
}
