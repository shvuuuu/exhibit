"use client";

import { clsx } from "clsx";
import { Check, ChevronDown, Download, ExternalLink, FileText, Gavel, Languages, Loader2, Send, X } from "lucide-react";
import { useState } from "react";
import type { CaseBrief } from "@/lib/agent/brief";
import type { ProtectionReport } from "@/lib/agent/playbook";
import type { AutopilotVerdict } from "@/lib/autopilot";
import type { ActionResult } from "@/lib/actions";
import type { Dispute } from "@/lib/paypal/types";
import { usd } from "@/lib/format";
import { Button } from "../../ui/Button";
import { Chip } from "../../ui/Chip";

const VERDICT_TONE = { LIKELY_ELIGIBLE: "green", AT_RISK: "outline", NOT_ELIGIBLE: "red", NOT_APPLICABLE: "neutral" } as const;
const VERDICT_LABEL = { LIKELY_ELIGIBLE: "Likely protected", AT_RISK: "At risk", NOT_ELIGIBLE: "Not protected", NOT_APPLICABLE: "Not covered" } as const;

export function ProtectionCard({ report }: { report: ProtectionReport }) {
  const [open, setOpen] = useState(false);
  return (
    <section className="card p-4">
      <button type="button" className="flex w-full items-center justify-between" onClick={() => setOpen(!open)}>
        <h3 className="text-[12px] font-medium uppercase tracking-wider text-muted">PayPal Seller Protection</h3>
        <span className="flex items-center gap-2">
          <Chip tone={VERDICT_TONE[report.verdict]} dot>
            {VERDICT_LABEL[report.verdict]}
          </Chip>
          <ChevronDown className={clsx("size-4 text-faint transition-transform", open && "rotate-180")} />
        </span>
      </button>
      <p className="mt-2 text-[12.5px] leading-snug text-ink-2">{report.summary}</p>
      {open ? (
        <ul className="mt-3 space-y-2.5 border-t border-line pt-3">
          {report.checks.map((c) => (
            <li key={c.id} className="flex gap-2.5 text-[12.5px] leading-snug">
              <span className={clsx("mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full", c.status === "pass" ? "bg-green-soft text-green" : c.status === "fail" ? "bg-red-soft text-red" : "bg-sunken text-faint")}>
                {c.status === "pass" ? <Check className="size-3" strokeWidth={3} /> : c.status === "fail" ? <X className="size-3" strokeWidth={3} /> : <span className="size-1 rounded-full bg-current" />}
              </span>
              <div>
                <div className="font-medium">{c.label}</div>
                <div className="text-muted">{c.detail}</div>
                {c.quote ? <div className="mt-1 border-l-2 border-line pl-2 text-[11.5px] italic text-faint">“{c.quote}”</div> : null}
              </div>
            </li>
          ))}
          <li className="text-[11px] text-faint">
            Requirements quoted from{" "}
            <a className="underline" href={report.source} target="_blank" rel="noreferrer">
              PayPal&apos;s Seller Protection program
            </a>
            . PayPal makes the final decision.
          </li>
        </ul>
      ) : null}
    </section>
  );
}

function actionLabel(brief: CaseBrief, amount: number) {
  const a = brief.paypal_action;
  switch (a.type) {
    case "provide_evidence":
      return "File evidence with PayPal";
    case "provide_supporting_info":
      return "Send case to PayPal's review";
    case "refund_then_prove":
      return `Refund ${usd(a.amount ?? amount)} and file proof`;
    case "make_offer":
      return a.offer_type === "REPLACEMENT_WITHOUT_REFUND" ? "Offer a replacement" : `Offer ${usd(a.amount ?? 0)} ${a.offer_type === "REFUND_WITH_RETURN" ? "with return" : "refund"}`;
    case "accept_claim":
      return `Accept and refund ${usd(amount)}`;
    case "send_message":
      return "Send message to buyer";
  }
}

const API_OF: Record<string, string> = {
  provide_evidence: "POST /v1/customer/disputes/{id}/provide-evidence",
  provide_supporting_info: "POST /v1/customer/disputes/{id}/provide-supporting-info",
  refund_then_prove: "POST /v2/payments/captures/{id}/refund → provide-evidence",
  make_offer: "POST /v1/customer/disputes/{id}/make-offer",
  accept_claim: "POST /v1/customer/disputes/{id}/accept-claim",
  send_message: "POST /v1/customer/disputes/{id}/send-message",
};

export function ResponsePanel({
  dispute,
  brief,
  autopilot,
  mode,
  lastAction,
  onSubmit,
  onSandbox,
}: {
  dispute: Dispute;
  brief: CaseBrief;
  autopilot: AutopilotVerdict | null;
  mode: string;
  lastAction: (ActionResult & { at?: string }) | null;
  onSubmit: (overrides: { letter: string; buyerMessage?: string }) => Promise<void>;
  onSandbox: (op: "decide" | "require_evidence" | "buyer_accepts_offer", outcome?: "SELLER_FAVOR" | "BUYER_FAVOR") => Promise<void>;
}) {
  const [letter, setLetter] = useState(brief.response_letter);
  const [message, setMessage] = useState(brief.buyer_message?.text ?? "");
  const [showEnglish, setShowEnglish] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const amount = Number(dispute.dispute_amount.value);
  const a = brief.paypal_action;
  const relFor: Record<string, string> = { provide_evidence: "provide_evidence", refund_then_prove: "provide_evidence", provide_supporting_info: "provide_supporting_info", make_offer: "make_offer", accept_claim: "accept_claim", send_message: "send_message" };
  const canAct = dispute.links.some((l) => l.rel === relFor[a.type]);
  const letterUsed = a.type !== "send_message";
  const packetUsed = a.type === "provide_evidence" || a.type === "refund_then_prove" || a.type === "provide_supporting_info";
  const packetHref = `/api/disputes/${dispute.dispute_id}/packet`;

  const run = async (key: string, fn: () => Promise<void>) => {
    setBusy(key);
    try {
      await fn();
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="space-y-3">
      {brief.exhibits.length ? (
        <section className="card overflow-hidden">
          <div className="flex items-center justify-between px-4 pt-4">
            <h3 className="text-[12px] font-medium uppercase tracking-wider text-muted">Evidence packet</h3>
            <div className="flex gap-1">
              <a href={packetHref} target="_blank" rel="noreferrer" className="inline-flex h-7 items-center gap-1 rounded-md px-2 text-[12px] text-ink-2 hover:bg-sunken">
                <ExternalLink className="size-3.5" /> Preview
              </a>
              <a href={`${packetHref}?download=1`} className="inline-flex h-7 items-center gap-1 rounded-md px-2 text-[12px] text-ink-2 hover:bg-sunken">
                <Download className="size-3.5" /> PDF
              </a>
            </div>
          </div>
          <ul className="mt-2 divide-y divide-line">
            {brief.exhibits.map((e) => (
              <li key={e.label} className="flex gap-3 px-4 py-2.5">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-ink text-[12px] font-semibold text-white">{e.label}</span>
                <div className="min-w-0">
                  <div className="text-[13px] font-medium leading-tight">{e.title}</div>
                  <div className="mt-0.5 text-[12px] leading-snug text-muted">{e.why}</div>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {letterUsed ? (
        <section className="card p-4">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-[12px] font-medium uppercase tracking-wider text-muted">Response to PayPal</h3>
            <span className={clsx("num text-[11px]", letter.length > 1900 ? "text-red" : "text-faint")}>{letter.length} / 1900</span>
          </div>
          <textarea
            value={letter}
            onChange={(e) => setLetter(e.target.value)}
            rows={10}
            className="scroll-thin w-full resize-y rounded-lg border border-line bg-[#fafafa] p-3 text-[13px] leading-relaxed outline-none focus:border-ink-2"
          />
        </section>
      ) : null}

      {brief.buyer_message ? (
        <section className="card p-4">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-[12px] font-medium uppercase tracking-wider text-muted">Message to buyer</h3>
            <span className="flex items-center gap-2">
              <Chip>{brief.buyer_message.language.toUpperCase()}</Chip>
              {brief.buyer_message.english ? (
                <button type="button" onClick={() => setShowEnglish(!showEnglish)} className="inline-flex items-center gap-1 text-[12px] text-muted hover:text-ink">
                  <Languages className="size-3.5" /> {showEnglish ? "Original" : "English"}
                </button>
              ) : null}
            </span>
          </div>
          {showEnglish && brief.buyer_message.english ? (
            <p className="whitespace-pre-wrap rounded-lg bg-sunken p-3 text-[13px] leading-relaxed text-ink-2">{brief.buyer_message.english}</p>
          ) : (
            <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={7} className="scroll-thin w-full resize-y rounded-lg border border-line bg-[#fafafa] p-3 text-[13px] leading-relaxed outline-none focus:border-ink-2" />
          )}
        </section>
      ) : null}

      <section className="card p-4">
        {lastAction?.ok ? (
          <div className="rise">
            <div className="flex items-center gap-2 text-[14px] font-medium text-green">
              <span className="flex size-5 items-center justify-center rounded-full bg-green text-white">
                <Check className="size-3.5" strokeWidth={3} />
              </span>
              Sent to PayPal
            </div>
            <p className="mt-1.5 text-[13px] text-ink-2">{lastAction.detail}</p>
            <div className="num mt-2 text-[11px] text-faint">{API_OF[lastAction.kind] ?? lastAction.kind} → 200</div>
          </div>
        ) : (
          <>
            {autopilot ? (
              <div className="mb-3 flex gap-2 text-[12.5px] leading-snug text-muted">
                <Gavel className="mt-0.5 size-3.5 shrink-0" />
                <span>{autopilot.reason}</span>
              </div>
            ) : null}
            <Button
              variant="primary"
              size="lg"
              className="w-full"
              disabled={!canAct || !!busy || letter.length > 1900}
              onClick={() => run("submit", () => onSubmit({ letter, buyerMessage: brief.buyer_message ? message : undefined }))}
            >
              {busy === "submit" ? <Loader2 className="size-4 animate-spin" /> : packetUsed ? <FileText className="size-4" /> : <Send className="size-4" />}
              {actionLabel(brief, amount)}
            </Button>
            <div className="num mt-2 text-center text-[11px] text-faint">{API_OF[a.type]}</div>
            {!canAct ? <p className="mt-2 text-center text-[12px] text-muted">PayPal is not waiting on you for this case right now.</p> : null}
            {lastAction && !lastAction.ok ? (
              <div className="mt-3 rounded-lg bg-red-soft p-3 text-[12.5px] text-red">
                {lastAction.error}
                {lastAction.issue ? <div className="num mt-1 text-[11px]">issue {lastAction.issue}{lastAction.debugId ? ` · debug_id ${lastAction.debugId}` : ""}</div> : null}
              </div>
            ) : null}
          </>
        )}
      </section>

      {dispute.status === "UNDER_REVIEW" || (mode === "demo" && dispute.status === "WAITING_FOR_BUYER_RESPONSE") ? (
        <section className="rounded-xl border border-dashed border-line-strong p-4">
          <div className="mb-1 text-[12px] font-medium uppercase tracking-wider text-muted">{mode === "demo" ? "Simulator controls" : "Sandbox controls"}</div>
          <p className="mb-3 text-[12.5px] text-muted">
            {dispute.status === "UNDER_REVIEW" ? "Stand in for PayPal's reviewer with the sandbox-only adjudicate endpoint." : "Stand in for the buyer and accept the offer."}
          </p>
          {dispute.status === "UNDER_REVIEW" ? (
            <div className="flex gap-2">
              <Button size="sm" variant="secondary" disabled={!!busy} onClick={() => run("seller", () => onSandbox("decide", "SELLER_FAVOR"))}>
                {busy === "seller" ? <Loader2 className="size-3.5 animate-spin" /> : null} Rule for merchant
              </Button>
              <Button size="sm" variant="ghost" disabled={!!busy} onClick={() => run("buyer", () => onSandbox("decide", "BUYER_FAVOR"))}>
                Rule for buyer
              </Button>
            </div>
          ) : (
            <Button size="sm" variant="secondary" disabled={!!busy} onClick={() => run("accept", () => onSandbox("buyer_accepts_offer"))}>
              Buyer accepts offer
            </Button>
          )}
        </section>
      ) : null}
    </div>
  );
}
