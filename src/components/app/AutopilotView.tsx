"use client";

import { clsx } from "clsx";
import { Check, Loader2 } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import type { CaseBrief } from "@/lib/agent/brief";
import { evaluateAutopilot, type AutopilotSettings } from "@/lib/autopilot-rules";
import { usd } from "@/lib/format";
import { Button } from "../ui/Button";
import { Chip, DecisionChip } from "../ui/Chip";

type Case = { id: string; buyer: string; reason: string; amount: number; brief: CaseBrief };

function Toggle({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button type="button" role="switch" aria-checked={on} aria-label={label} onClick={() => onChange(!on)} className={clsx("relative h-[22px] w-[38px] shrink-0 rounded-full transition-colors", on ? "bg-ink" : "bg-line-strong")}>
      <span className={clsx("absolute top-[3px] size-4 rounded-full bg-white shadow transition-all", on ? "left-[19px]" : "left-[3px]")} />
    </button>
  );
}

function NumberField({ value, onChange, prefix, suffix }: { value: number; onChange: (v: number) => void; prefix?: string; suffix?: string }) {
  return (
    <span className="inline-flex h-8 items-center rounded-md border border-line-strong bg-surface px-2 text-[13px]">
      {prefix ? <span className="text-muted">{prefix}</span> : null}
      <input type="number" value={value} onChange={(e) => onChange(Number(e.target.value))} className="num w-14 bg-transparent text-right outline-none" />
      {suffix ? <span className="ml-0.5 text-muted">{suffix}</span> : null}
    </span>
  );
}

function Rule({ title, body, on, onToggle, children }: { title: string; body: string; on: boolean; onToggle: (v: boolean) => void; children?: React.ReactNode }) {
  return (
    <div className="flex items-start gap-4 border-b border-line px-5 py-4 last:border-0">
      <Toggle on={on} onChange={onToggle} label={title} />
      <div className="min-w-0 flex-1">
        <div className="text-[14px] font-medium">{title}</div>
        <div className="mt-0.5 text-[12.5px] text-muted">{body}</div>
        {children ? <div className={clsx("mt-3 flex flex-wrap items-center gap-2 text-[13px] text-ink-2", !on && "opacity-40")}>{children}</div> : null}
      </div>
    </div>
  );
}

export function AutopilotView({ initial, cases }: { initial: AutopilotSettings; cases: Case[] }) {
  const [s, setS] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const preview = useMemo(() => cases.map((c) => ({ ...c, verdict: evaluateAutopilot(c.brief, c.amount, s) })), [cases, s]);
  const auto = preview.filter((p) => p.verdict.verdict === "AUTO");

  const update = (patch: Partial<AutopilotSettings>) => {
    setSaved(false);
    setS((prev) => ({ ...prev, ...patch }));
  };

  const save = async () => {
    setSaving(true);
    await fetch("/api/autopilot", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(s) });
    setSaving(false);
    setSaved(true);
  };

  return (
    <div className="grid grid-cols-[minmax(0,1fr)_420px] gap-6 px-8 py-6">
      <div className="space-y-4">
        <div className="card flex items-center gap-4 px-5 py-4">
          <Toggle on={s.enabled} onChange={(v) => update({ enabled: v })} label="Autopilot" />
          <div className="flex-1">
            <div className="text-[15px] font-medium">Autopilot {s.enabled ? "on" : "off"}</div>
            <div className="text-[12.5px] text-muted">When on, Exhibit acts on new disputes the moment PayPal&apos;s webhook arrives, within the limits below. Everything else waits for you.</div>
          </div>
          <Button variant="primary" onClick={save} disabled={saving}>
            {saving ? <Loader2 className="size-4 animate-spin" /> : saved ? <Check className="size-4" /> : null}
            {saved ? "Saved" : "Save rules"}
          </Button>
        </div>
        <div className={clsx("card", !s.enabled && "opacity-60")}>
          <Rule title="File evidence on strong cases" body="Submit the evidence packet when the case is strong and the amount is modest." on={s.fight.enabled} onToggle={(v) => update({ fight: { ...s.fight, enabled: v } })}>
            When win likelihood is at least <NumberField value={s.fight.minLikelihood} suffix="%" onChange={(v) => update({ fight: { ...s.fight, minLikelihood: v } })} /> and the amount is at most{" "}
            <NumberField value={s.fight.maxAmount} prefix="$" onChange={(v) => update({ fight: { ...s.fight, maxAmount: v } })} />
          </Rule>
          <Rule title="Refund cases you can't win" body="Accept small, unwinnable claims right away instead of paying fees to lose them." on={s.refund.enabled} onToggle={(v) => update({ refund: { ...s.refund, enabled: v } })}>
            When the amount is at most <NumberField value={s.refund.maxAmount} prefix="$" onChange={(v) => update({ refund: { ...s.refund, maxAmount: v } })} />
          </Rule>
          <Rule title="Send offers" body="Propose partial refunds, returns or replacements in the inquiry stage." on={s.offers.enabled} onToggle={(v) => update({ offers: { ...s.offers, enabled: v } })}>
            When the offer is at most <NumberField value={s.offers.maxAmount} prefix="$" onChange={(v) => update({ offers: { ...s.offers, maxAmount: v } })} />
          </Rule>
          <Rule title="Message buyers in the inquiry stage" body="Reply in the buyer's language with the facts, often enough to close the case before it escalates." on={s.messages.enabled} onToggle={(v) => update({ messages: { enabled: v } })} />
        </div>
        <p className="px-1 text-[12px] text-faint">Low-confidence briefs always go to a person, whatever the rules say. Every automatic action is logged with the brief that justified it.</p>
      </div>

      <div className="card self-start">
        <div className="border-b border-line px-5 py-4">
          <div className="text-[14px] font-medium">Preview on your open cases</div>
          <div className="mt-0.5 text-[12.5px] text-muted">
            With these rules, Exhibit would handle {auto.length} of {preview.length} analyzed cases on its own ({usd(auto.reduce((a, c) => a + c.amount, 0), 0)}).
          </div>
        </div>
        <ul className="divide-y divide-line">
          {preview.map((p) => (
            <li key={p.id}>
              <Link href={`/app/disputes/${p.id}`} className="flex items-start gap-3 px-5 py-3 hover:bg-[#fafafa]">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 text-[13px]">
                    <span className="font-medium">{p.buyer}</span>
                    <span className="num text-[12px] text-muted">{usd(p.amount)}</span>
                  </div>
                  <div className="mt-0.5 text-[12px] leading-snug text-muted">{p.verdict.reason}</div>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <DecisionChip decision={p.brief.decision} />
                  {p.verdict.verdict === "AUTO" ? <Chip tone="green">auto</Chip> : <Chip>you</Chip>}
                </div>
              </Link>
            </li>
          ))}
          {!preview.length ? <li className="px-5 py-6 text-[13px] text-muted">Run Exhibit on a few cases to preview the rules.</li> : null}
        </ul>
      </div>
    </div>
  );
}
