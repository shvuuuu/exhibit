"use client";

import { clsx } from "clsx";
import { BookCheck, Check, FileSearch, Gavel, Webhook } from "lucide-react";
import { useState } from "react";

export type HowData = {
  disputeId: string;
  tools: { name: string; label: string }[];
  headline: string;
  likelihood: number;
  exhibits: { label: string; title: string }[];
  letter: string;
};

const STEPS = [
  { icon: Webhook, title: "A dispute lands", body: "PayPal's CUSTOMER.DISPUTE.CREATED webhook arrives. Exhibit verifies the signature with PayPal and starts immediately." },
  { icon: FileSearch, title: "Exhibit investigates", body: "Nine tools pull the live dispute, the order and listing, carrier scans, the buyer's history and messages, checkout signals and PayPal's Seller Protection rules." },
  { icon: BookCheck, title: "It builds the case", body: "A decision with a win likelihood, cited reasoning, a letter for PayPal's reviewer and a PDF of labelled exhibits rendered from your records." },
  { icon: Gavel, title: "It files with PayPal", body: "One click, or Autopilot within your limits, calls the right PayPal API: evidence, supporting info, an offer, a refund or a message." },
];

function Code({ children }: { children: React.ReactNode }) {
  return <pre className="num overflow-x-auto whitespace-pre rounded-xl border border-line bg-sunken p-5 text-[12.5px] leading-[1.7] text-ink-2">{children}</pre>;
}

function Panel({ i, d }: { i: number; d: HowData }) {
  if (i === 0)
    return (
      <div className="space-y-4">
        <Code>{`POST /api/webhooks/paypal
{
  "event_type": "CUSTOMER.DISPUTE.CREATED",
  "resource": {
    "dispute_id": "${d.disputeId}",
    "reason": "MERCHANDISE_OR_SERVICE_NOT_RECEIVED",
    "dispute_amount": { "currency_code": "USD", "value": "284.00" }
  }
}`}</Code>
        <div className="flex items-center gap-2 text-[13px] text-muted">
          <Check className="size-4 text-green" /> Verified with <span className="num text-[12px] text-ink-2">POST /v1/notifications/verify-webhook-signature</span>
        </div>
      </div>
    );
  if (i === 1)
    return (
      <ul className="grid gap-2 sm:grid-cols-2">
        {d.tools.map((t, k) => (
          <li key={t.name} className="flex items-center gap-3 rounded-xl border border-line bg-white px-4 py-3">
            <span className="num text-[11px] text-faint">{String(k + 1).padStart(2, "0")}</span>
            <div className="min-w-0">
              <div className="text-[13.5px] font-medium">{t.label}</div>
              <div className="num truncate text-[11px] text-faint">{t.name}</div>
            </div>
          </li>
        ))}
      </ul>
    );
  if (i === 2)
    return (
      <div className="rounded-xl border border-line bg-white p-5">
        <div className="flex items-center gap-2">
          <span className="rounded-md bg-ink px-2 py-0.5 text-[12px] font-medium text-white">Fight</span>
          <span className="num text-[12px] text-muted">{d.likelihood}% win likelihood</span>
        </div>
        <div className="mt-3 text-[19px] font-semibold leading-snug tracking-[-0.02em]">{d.headline}</div>
        <ul className="mt-4 space-y-2">
          {d.exhibits.map((e) => (
            <li key={e.label} className="flex items-start gap-2.5 text-[13px]">
              <span className="flex size-5 shrink-0 items-center justify-center rounded bg-ink text-[11px] font-semibold text-white">{e.label}</span>
              {e.title}
            </li>
          ))}
        </ul>
        <p className="mt-4 line-clamp-3 border-t border-line pt-4 text-[13px] leading-relaxed text-muted">{d.letter}</p>
      </div>
    );
  return (
    <Code>{`POST /v1/customer/disputes/${d.disputeId}/provide-evidence
Content-Type: multipart/form-data

input = {
  "evidences": [{
    "evidence_type": "PROOF_OF_FULFILLMENT",
    "evidence_info": { "tracking_info": [{
      "carrier_name": "UPS", "tracking_number": "1Z84V6A90392847516"
    }]},
    "notes": "Kora Atelier shipped and delivered this order…"
  }]
}
evidence-file = exhibit-evidence-packet.pdf

→ 200 OK`}</Code>
  );
}

export function HowItWorks({ data }: { data: HowData }) {
  const [active, setActive] = useState(0);
  return (
    <div className="mt-12 grid gap-6 lg:grid-cols-[380px_minmax(0,1fr)] lg:gap-10">
      <div role="tablist" aria-label="How Exhibit works" className="flex flex-col gap-2">
        {STEPS.map((s, i) => (
          <button
            key={s.title}
            type="button"
            role="tab"
            aria-selected={active === i}
            onClick={() => setActive(i)}
            className={clsx(
              "group rounded-2xl border p-5 text-left transition-colors",
              active === i ? "border-ink bg-white shadow-[0_1px_2px_rgb(0_0_0/0.04)]" : "border-line bg-white hover:border-line-strong hover:bg-[#fafafa]",
            )}
          >
            <div className="flex items-center gap-3">
              <span className={clsx("flex size-8 items-center justify-center rounded-lg", active === i ? "bg-ink text-white" : "bg-sunken text-ink-2")}>
                <s.icon className="size-4" strokeWidth={1.9} />
              </span>
              <span className="num text-[11px] text-faint">0{i + 1}</span>
              <span className="text-[15.5px] font-semibold tracking-[-0.01em]">{s.title}</span>
            </div>
            <p className={clsx("mt-3 text-[14px] leading-relaxed text-muted", active === i ? "block" : "hidden lg:block")}>{s.body}</p>
          </button>
        ))}
      </div>
      <div role="tabpanel" className="min-w-0 self-start rounded-2xl border border-line bg-[#fafafa] p-4 md:p-6 lg:sticky lg:top-24">
        <div key={active} className="motion-safe:[animation:landing-rise_0.45s_ease-out_both]">
          <Panel i={active} d={data} />
        </div>
      </div>
    </div>
  );
}
