import { Boxes, Check, FileText, Landmark, ScrollText, ShieldCheck, Truck } from "lucide-react";
import { BriefCard } from "../app/case/BriefCard";
import { expectedRecovery } from "@/lib/agent/brief";
import type { Replay, ToolStep } from "./data";

const KIND_ICON = { paypal: Landmark, store: Boxes, carrier: Truck, risk: ShieldCheck, policy: ScrollText, brief: FileText } as const;

function Trace({ steps }: { steps: ToolStep[] }) {
  return (
    <div className="rounded-xl border border-line bg-white">
      <div className="flex items-center justify-between border-b border-line px-4 py-3 text-[12.5px]">
        <span className="flex items-center gap-2 font-medium">
          <span className="size-1.5 rounded-full bg-green" /> Investigation
        </span>
        <span className="num text-[11.5px] text-faint">{steps.length} steps · ~30s</span>
      </div>
      <ol className="space-y-3 px-4 py-4">
        {steps.map((s, i) => {
          const Icon = KIND_ICON[s.kind as keyof typeof KIND_ICON] ?? Boxes;
          return (
            <li key={`${s.name}-${i}`} className="flex gap-3">
              <span className={`flex size-7 shrink-0 items-center justify-center rounded-lg border ${s.kind === "brief" ? "border-ink bg-ink text-white" : "border-line bg-sunken text-ink-2"}`}>
                <Icon className="size-3.5" strokeWidth={1.9} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 text-[12.5px] font-medium">
                  {s.label}
                  <Check className="size-3 text-green" strokeWidth={3} />
                </div>
                <div className="num truncate text-[11px] text-faint">{s.name}</div>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

/** The hero visual: a real recorded run on a demo case, composed from the product's own components. */
export function ProductFrame({ replay, steps }: { replay: Replay; steps: ToolStep[] }) {
  const b = replay.brief;
  return (
    <div className="rounded-[22px] border border-line bg-sunken p-2 shadow-[0_40px_120px_-48px_rgb(10_10_10/0.35)] md:p-2.5">
      <div className="relative overflow-hidden rounded-[16px] border border-line bg-white">
        <div className="flex h-10 items-center gap-2 border-b border-line px-4">
          <span className="size-2.5 rounded-full bg-line-strong" />
          <span className="size-2.5 rounded-full bg-line-strong" />
          <span className="size-2.5 rounded-full bg-line-strong" />
          <span className="num ml-3 truncate text-[11.5px] text-faint">exhibit · {replay.ids.dispute_id} · Megan Hale · Item not received · $284.00</span>
        </div>
        <div className="relative max-h-[600px] overflow-hidden">
          <div className="grid gap-4 bg-[#fafafa] p-2.5 text-left sm:p-4 lg:grid-cols-[250px_minmax(0,1fr)_270px] lg:p-5">
            <div className="hidden lg:block">
              <Trace steps={steps} />
            </div>
            <div className="min-w-0">
              <BriefCard brief={b} amount={284} expected={expectedRecovery(b, 284)} ms={30000} />
            </div>
            <div className="hidden space-y-3 lg:block">
              <div className="rounded-xl border border-line bg-white p-4">
                <div className="text-[11px] font-medium uppercase tracking-wider text-muted">PayPal Seller Protection</div>
                <div className="mt-2 inline-flex items-center gap-1.5 rounded-md bg-green-soft px-2 py-1 text-[12px] font-medium text-green">
                  <span className="size-1.5 rounded-full bg-green" /> Likely protected
                </div>
                <div className="mt-2 text-[12px] text-muted">Every published requirement met</div>
              </div>
              <div className="overflow-hidden rounded-xl border border-line bg-white">
                <div className="px-4 pt-4 text-[11px] font-medium uppercase tracking-wider text-muted">Evidence packet</div>
                <ul className="mt-2 divide-y divide-line">
                  {b.exhibits.map((e) => (
                    <li key={e.label} className="flex gap-2.5 px-4 py-2.5">
                      <span className="flex size-5 shrink-0 items-center justify-center rounded bg-ink text-[11px] font-semibold text-white">{e.label}</span>
                      <span className="text-[12px] font-medium leading-snug">{e.title}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-xl border border-line bg-white p-4">
                <div className="flex h-10 items-center justify-center gap-2 rounded-lg bg-ink text-[13px] font-medium text-white">
                  <FileText className="size-4" /> File evidence with PayPal
                </div>
                <div className="num mt-2 text-center text-[10px] text-faint">POST /v1/customer/disputes/{"{id}"}/provide-evidence</div>
              </div>
            </div>
          </div>
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-white via-white/80 to-transparent" />
        </div>
      </div>
    </div>
  );
}
