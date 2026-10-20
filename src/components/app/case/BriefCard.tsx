"use client";

import { AlertTriangle, CircleHelp } from "lucide-react";
import type { CaseBrief } from "@/lib/agent/brief";
import { usd } from "@/lib/format";
import { refLabel } from "@/lib/reflabel";
import { Chip, DECISION_META } from "../../ui/Chip";

function Gauge({ value }: { value: number }) {
  const r = 26;
  const c = 2 * Math.PI * r;
  const tone = "var(--ink)";
  return (
    <div className="relative size-[68px]">
      <svg viewBox="0 0 64 64" className="size-full -rotate-90">
        <circle cx="32" cy="32" r={r} fill="none" stroke="#ececec" strokeWidth="5" />
        <circle cx="32" cy="32" r={r} fill="none" stroke={tone} strokeWidth="5" strokeLinecap="round" strokeDasharray={`${(value / 100) * c} ${c}`} />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="num text-[17px]">{value}</span>
        <span className="num text-[10px] text-muted">%</span>
      </div>
    </div>
  );
}

export function BriefCard({ brief, amount, expected, ms }: { brief: CaseBrief; amount: number; expected: number; ms?: number }) {
  const m = DECISION_META[brief.decision];
  return (
    <div className="card rise overflow-hidden">
      <div className="flex items-start gap-5 border-b border-line p-5">
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex items-center gap-2">
            <Chip tone={m.tone}>{m.label}</Chip>
            <span className="text-[12px] text-muted">
              {brief.confidence.toLowerCase()} confidence{ms ? ` · ${(ms / 1000).toFixed(0)}s investigation` : ""}
            </span>
          </div>
          <h2 className="display text-[24px] leading-[1.2] tracking-[-0.025em]">{brief.headline}</h2>
          <p className="mt-2 text-[14px] leading-relaxed text-ink-2">{brief.summary}</p>
        </div>
        <div className="flex shrink-0 flex-col items-center gap-1">
          <Gauge value={brief.win_likelihood} />
          <span className="text-[11px] text-muted">win likelihood</span>
        </div>
      </div>
      <div className="grid grid-cols-3 divide-x divide-line border-b border-line text-[12px]">
        <div className="px-5 py-3">
          <div className="text-muted">At stake</div>
          <div className="num mt-0.5 text-[15px]">{usd(amount)}</div>
        </div>
        <div className="px-5 py-3">
          <div className="text-muted">Expected recovery</div>
          <div className="num mt-0.5 text-[15px]">{usd(expected)}</div>
        </div>
        <div className="px-5 py-3">
          <div className="text-muted">Exhibits</div>
          <div className="num mt-0.5 text-[15px]">{brief.exhibits.length ? brief.exhibits.map((e) => e.label).join(" · ") : "—"}</div>
        </div>
      </div>
      <div className="space-y-3 p-5">
        <ol className="space-y-2.5">
          {brief.reasoning.map((r, i) => (
            <li key={i} className="flex gap-3 text-[13.5px] leading-relaxed">
              <span className="num mt-0.5 text-[11px] text-faint">{String(i + 1).padStart(2, "0")}</span>
              <div>
                {r.point}
                {r.refs.length ? (
                  <span className="ml-1.5 inline-flex flex-wrap gap-1 align-middle">
                    {r.refs.map((ref) => (
                      <span key={ref} title={ref} className="rounded border border-line px-1.5 py-px text-[11px] text-muted">
                        {refLabel(ref)}
                      </span>
                    ))}
                  </span>
                ) : null}
              </div>
            </li>
          ))}
        </ol>
        {brief.risks.length || brief.missing_evidence.length ? (
          <div className="grid gap-3 pt-2 md:grid-cols-2">
            {brief.risks.length ? (
              <div className="rounded-lg border border-line p-3">
                <div className="mb-1.5 flex items-center gap-1.5 text-[12px] font-medium text-ink">
                  <AlertTriangle className="size-3.5" /> Risks
                </div>
                <ul className="space-y-1 text-[12.5px] leading-snug text-ink-2">
                  {brief.risks.map((x, i) => (
                    <li key={i}>{x}</li>
                  ))}
                </ul>
              </div>
            ) : null}
            {brief.missing_evidence.length ? (
              <div className="rounded-lg bg-sunken p-3">
                <div className="mb-1.5 flex items-center gap-1.5 text-[12px] font-medium text-ink-2">
                  <CircleHelp className="size-3.5" /> Would strengthen the case
                </div>
                <ul className="space-y-1 text-[12.5px] leading-snug text-ink-2">
                  {brief.missing_evidence.map((x, i) => (
                    <li key={i}>{x}</li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
