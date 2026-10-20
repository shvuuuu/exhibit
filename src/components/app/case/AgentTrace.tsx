"use client";

import { clsx } from "clsx";
import { Boxes, Brain, Check, ChevronRight, FileText, Landmark, Loader2, ScrollText, ShieldCheck, Truck, X } from "lucide-react";
import { useState } from "react";
import type { RunEvent } from "@/lib/agent/run";

const KIND_ICON = { paypal: Landmark, store: Boxes, carrier: Truck, risk: ShieldCheck, policy: ScrollText, brief: FileText } as const;

type Step =
  | { type: "thought"; text: string }
  | { type: "tool"; id: string; name: string; kind: keyof typeof KIND_ICON; label: string; input: unknown; result?: { ok: boolean; summary: string; output: unknown; ms: number } };

export function toSteps(events: RunEvent[]): Step[] {
  const steps: Step[] = [];
  for (const e of events) {
    if (e.t === "thinking" || e.t === "text") {
      const last = steps[steps.length - 1];
      if (last?.type === "thought") last.text += e.text;
      else steps.push({ type: "thought", text: e.text });
    } else if (e.t === "tool_call") {
      steps.push({ type: "tool", id: e.id, name: e.name, kind: e.kind, label: e.label, input: e.input });
    } else if (e.t === "tool_result") {
      const s = steps.find((x): x is Extract<Step, { type: "tool" }> => x.type === "tool" && x.id === e.id && !x.result);
      if (s) s.result = { ok: e.ok, summary: e.summary, output: e.output, ms: e.ms };
    }
  }
  return steps.filter((s) => s.type !== "thought" || s.text.trim());
}

function Thought({ text, live }: { text: string; live: boolean }) {
  const [open, setOpen] = useState(false);
  const clean = text.trim();
  const long = clean.length > 240;
  return (
    <div className="flex gap-3">
      <div className="flex w-7 shrink-0 justify-center pt-0.5">
        <Brain className="size-4 text-faint" strokeWidth={1.75} />
      </div>
      <button type="button" onClick={() => setOpen(!open)} className="min-w-0 flex-1 text-left">
        <p className={clsx("whitespace-pre-wrap text-[13px] leading-relaxed text-muted", !open && long && "line-clamp-3")}>
          {clean}
          {live ? <span className="pulse-dot ml-0.5 inline-block h-3.5 w-1.5 translate-y-0.5 bg-faint" /> : null}
        </p>
      </button>
    </div>
  );
}

function ToolStep({ s }: { s: Extract<Step, { type: "tool" }> }) {
  const [open, setOpen] = useState(false);
  const Icon = KIND_ICON[s.kind] ?? Boxes;
  const pending = !s.result;
  return (
    <div className="rise flex gap-3">
      <div className="flex w-7 shrink-0 justify-center">
        <span className={clsx("flex size-7 items-center justify-center rounded-lg border", s.kind === "brief" ? "border-ink bg-ink text-white" : "border-line bg-surface text-ink-2")}>
          <Icon className="size-3.5" strokeWidth={1.9} />
        </span>
      </div>
      <div className="min-w-0 flex-1">
        <button type="button" onClick={() => setOpen(!open)} className="group flex w-full items-center gap-2 text-left">
          <span className="text-[13.5px] font-medium">{s.label}</span>
          <span className="num text-[11.5px] text-faint">{s.name}</span>
          <span className="ml-auto flex items-center gap-2 text-[11.5px] text-faint">
            {pending ? <Loader2 className="size-3.5 animate-spin text-ink-2" /> : s.result?.ok ? <Check className="size-3.5 text-green" /> : <X className="size-3.5 text-red" />}
            {s.result ? `${s.result.ms} ms` : "running"}
            <ChevronRight className={clsx("size-3.5 transition-transform", open && "rotate-90")} />
          </span>
        </button>
        <div className={clsx("mt-0.5 text-[13px]", s.result?.ok === false ? "text-red" : "text-ink-2")}>{s.result ? s.result.summary : <span className="shimmer inline-block h-3 w-48 rounded" />}</div>
        {open ? (
          <div className="mt-2 grid gap-2 text-[11.5px]">
            <pre className="num scroll-thin max-h-40 overflow-auto rounded-lg bg-sunken p-2.5 text-ink-2">{JSON.stringify(s.input, null, 2)}</pre>
            {s.result ? <pre className="num scroll-thin max-h-72 overflow-auto rounded-lg bg-sunken p-2.5 text-ink-2">{JSON.stringify(s.result.output, null, 2)}</pre> : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function AgentTrace({ events, running }: { events: RunEvent[]; running: boolean }) {
  const steps = toSteps(events);
  return (
    <div className="space-y-4">
      {steps.map((s, i) => (s.type === "thought" ? <Thought key={`t${i}`} text={s.text} live={running && i === steps.length - 1} /> : <ToolStep key={s.id} s={s} />))}
      {running && steps[steps.length - 1]?.type !== "thought" && steps.every((s) => s.type !== "tool" || s.result) ? (
        <div className="flex items-center gap-3 pl-1 text-[13px] text-muted">
          <Loader2 className="size-4 animate-spin" /> Thinking…
        </div>
      ) : null}
    </div>
  );
}
