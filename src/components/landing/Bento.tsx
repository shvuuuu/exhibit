import { clsx } from "clsx";
import { Activity, Check, FileText, Languages, ShieldCheck, Sparkles, Truck } from "lucide-react";
import type { ReactNode } from "react";
import { PAYPAL_POLICY } from "@/lib/agent/playbook";
import { DEFAULT_AUTOPILOT } from "@/lib/autopilot-rules";
import type { ToolStep } from "./data";

function Tile({ icon: Icon, title, body, children, className }: { icon: typeof Activity; title: string; body: string; children?: ReactNode; className?: string }) {
  return (
    <div className={clsx("group flex flex-col overflow-hidden rounded-2xl border border-line bg-white transition-shadow hover:shadow-[0_12px_40px_-24px_rgb(10_10_10/0.3)]", className)}>
      <div className="p-6 pb-0">
        <div className="flex items-center gap-2 text-[13px] font-medium text-ink-2">
          <Icon className="size-4" strokeWidth={1.9} />
          {title}
        </div>
        <p className="mt-2 text-[14.5px] leading-relaxed text-muted">{body}</p>
      </div>
      <div className="mt-5 flex-1 px-6 pb-6">{children}</div>
    </div>
  );
}

export function Bento({ steps, exhibits, german, coverage }: { steps: ToolStep[]; exhibits: { label: string; title: string }[]; german: { de: string; en: string }; coverage: { synced: number; total: number } }) {
  const pct = Math.round((coverage.synced / coverage.total) * 100);
  const ap = DEFAULT_AUTOPILOT;
  return (
    <div className="mt-12 grid gap-4 md:grid-cols-6">
      <Tile icon={Activity} title="A live investigation, step by step" body="Every tool call streams to the case page with its inputs and results, so you can see exactly what the agent looked at." className="md:col-span-4">
        <div className="rounded-xl border border-line bg-[#fafafa] p-4">
          <ol className="grid gap-2 sm:grid-cols-2">
            {steps.slice(0, 6).map((s, i) => (
              <li key={`${s.name}-${i}`} className="flex items-center gap-2.5 rounded-lg border border-line bg-white px-3 py-2.5">
                <Check className="size-3.5 shrink-0 text-green" strokeWidth={3} />
                <span className="text-[13px] font-medium">{s.label}</span>
                <span className="num ml-auto truncate text-[10.5px] text-faint">{s.arg || s.name}</span>
              </li>
            ))}
          </ol>
        </div>
      </Tile>

      <Tile icon={FileText} title="Evidence packet, ready for review" body="A cover letter and labelled exhibits, rendered from your records, never from model text." className="md:col-span-2">
        <div className="relative h-[180px]">
          {[2, 1, 0].map((k) => (
            <div key={k} className="absolute inset-x-3 rounded-lg border border-line bg-white p-3 shadow-sm" style={{ top: k * 14, transform: `rotate(${(k - 1) * 1.6}deg)` }}>
              {k === 0 ? (
                <div className="space-y-2">
                  <div className="text-[10px] font-medium uppercase tracking-wider text-faint">Response to PayPal dispute</div>
                  {exhibits.map((e) => (
                    <div key={e.label} className="flex items-center gap-2 text-[11.5px]">
                      <span className="flex size-4 items-center justify-center rounded bg-ink text-[9.5px] font-semibold text-white">{e.label}</span>
                      <span className="truncate">{e.title}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-[92px]" />
              )}
            </div>
          ))}
        </div>
      </Tile>

      <Tile icon={ShieldCheck} title="PayPal's rulebook, word for word" body="Each case is checked against PayPal's published Seller Protection requirements and the eligibility flag PayPal returns for the payment." className="md:col-span-3">
        <div className="space-y-2.5">
          {[
            ["Shipped to the transaction address", PAYPAL_POLICY.quotes.shipToAddress],
            ["Delivered, with a verifiable tracking number", PAYPAL_POLICY.quotes.proofOfDelivery],
          ].map(([label, quote]) => (
            <div key={label} className="rounded-xl border border-line bg-[#fafafa] p-3.5">
              <div className="flex items-center gap-2 text-[13px] font-medium">
                <span className="flex size-4 items-center justify-center rounded-full bg-green-soft text-green">
                  <Check className="size-2.5" strokeWidth={3.5} />
                </span>
                {label}
              </div>
              <p className="mt-1.5 line-clamp-2 border-l-2 border-line pl-2.5 text-[12px] italic text-muted">“{quote}”</p>
            </div>
          ))}
          <div className="num flex items-center gap-2 text-[11.5px] text-muted">
            <span className="size-1.5 rounded-full bg-green" /> GET /v2/payments/captures/{"{id}"} → seller_protection: ELIGIBLE
          </div>
        </div>
      </Tile>

      <Tile icon={Sparkles} title="Autopilot, inside your limits" body="Exhibit acts on its own only where you allow it. Low-confidence cases always go to a person." className="md:col-span-3">
        <div className="divide-y divide-line rounded-xl border border-line bg-white">
          {[
            ["File evidence on strong cases", `≥ ${ap.fight.minLikelihood}% likelihood, ≤ $${ap.fight.maxAmount}`, true],
            ["Refund cases you can't win", `≤ $${ap.refund.maxAmount}`, true],
            ["Message buyers in the inquiry stage", "in their language", true],
            ["Send offers", `≤ $${ap.offers.maxAmount}`, false],
          ].map(([label, rule, on]) => (
            <div key={label as string} className="flex items-center gap-3 px-4 py-3">
              <span className={clsx("relative h-[18px] w-[30px] shrink-0 rounded-full", on ? "bg-ink" : "bg-line-strong")}>
                <span className={clsx("absolute top-[2px] size-[14px] rounded-full bg-white", on ? "left-[14px]" : "left-[2px]")} />
              </span>
              <span className="text-[13px] font-medium">{label as string}</span>
              <span className="num ml-auto text-[11px] text-faint">{rule as string}</span>
            </div>
          ))}
        </div>
      </Tile>

      <Tile icon={Truck} title="Protection before the claim" body="Finds shipments whose tracking never reached PayPal and pushes them with the Orders v2 tracking API." className="md:col-span-2">
        <div className="flex items-center gap-5">
          <div className="relative size-[88px] shrink-0">
            <svg viewBox="0 0 36 36" className="size-full -rotate-90">
              <circle cx="18" cy="18" r="15.5" fill="none" stroke="var(--sunken)" strokeWidth="3.4" />
              <circle cx="18" cy="18" r="15.5" fill="none" stroke="var(--ink)" strokeWidth="3.4" strokeLinecap="round" strokeDasharray={`${(pct / 100) * 97.4} 97.4`} />
            </svg>
            <span className="num absolute inset-0 flex items-center justify-center text-[17px]">{pct}%</span>
          </div>
          <div className="text-[13px] leading-snug text-muted">
            {coverage.synced} of {coverage.total} demo shipments on PayPal. One click pushes the other {coverage.total - coverage.synced}.
          </div>
        </div>
      </Tile>

      <Tile icon={Activity} title="Every call on the record" body="Method, endpoint, status, latency and PayPal debug ID, for every request." className="md:col-span-2">
        <div className="num space-y-1.5 rounded-xl border border-line bg-[#fafafa] p-3.5 text-[11px] text-ink-2">
          {[
            ["GET", "/v1/customer/disputes/{id}", "200"],
            ["GET", "/v2/payments/captures/{id}", "200"],
            ["POST", "…/{id}/provide-evidence", "200"],
            ["POST", "/v2/checkout/orders/{id}/track", "201"],
          ].map(([m, p, s]) => (
            <div key={p} className="flex gap-2">
              <span className="w-9 text-muted">{m}</span>
              <span className="truncate">{p}</span>
              <span className="ml-auto text-green">{s}</span>
            </div>
          ))}
        </div>
      </Tile>

      <Tile icon={Languages} title="The buyer's language" body="A German buyer gets a German reply. You get the English copy." className="md:col-span-2">
        <div className="space-y-2">
          <p className="line-clamp-3 rounded-xl border border-line bg-white p-3 text-[12.5px] leading-relaxed">{german.de}</p>
          <p className="line-clamp-2 rounded-xl bg-[#fafafa] p-3 text-[12px] leading-relaxed text-muted">{german.en}</p>
        </div>
      </Tile>
    </div>
  );
}
