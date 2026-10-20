import { clsx } from "clsx";
import { ArrowRight, Check, Lock, Quote, ScrollText, ShieldCheck, UserCheck } from "lucide-react";
import Link from "next/link";
import type { CaseBrief } from "@/lib/agent/brief";
import { LogoMark } from "../ui/Logo";
import { Container, PrimaryButton, SecondaryButton } from "./Primitives";

const DECISION: Record<string, { label: string; cls: string }> = {
  FIGHT: { label: "Fight", cls: "bg-ink text-white" },
  OFFER: { label: "Offer", cls: "bg-violet-soft text-violet" },
  REFUND: { label: "Refund", cls: "bg-sunken text-ink-2 ring-1 ring-inset ring-line-strong" },
  MESSAGE_BUYER: { label: "Message", cls: "bg-blue-soft text-blue" },
};

export function Outcomes({ rows }: { rows: { claim: string; reason: string; amount: number; brief: CaseBrief }[] }) {
  return (
    <div className="mt-12 overflow-hidden rounded-2xl border border-line bg-white">
      <div className="hidden grid-cols-[260px_110px_minmax(0,1fr)_90px] gap-6 border-b border-line bg-[#fafafa] px-6 py-3 text-[11.5px] font-medium uppercase tracking-wider text-faint md:grid">
        <span>Buyer&apos;s claim</span>
        <span>Exhibit&apos;s call</span>
        <span>Why</span>
        <span className="text-right">At stake</span>
      </div>
      <ul className="divide-y divide-line">
        {rows.map((r) => {
          const d = DECISION[r.brief.decision];
          return (
            <li key={r.claim} className="grid gap-2 px-6 py-4 transition-colors hover:bg-[#fafafa] md:grid-cols-[260px_110px_minmax(0,1fr)_90px] md:items-center md:gap-6">
              <div>
                <div className="text-[14.5px]">{r.claim}</div>
                <div className="text-[12px] text-faint">{r.reason}</div>
              </div>
              <div>
                <span className={clsx("inline-flex h-6 items-center rounded-md px-2 text-[12px] font-medium", d.cls)}>{d.label}</span>
              </div>
              <div className="text-[14.5px] leading-snug text-ink-2">{r.brief.headline}</div>
              <div className="num text-[13px] text-muted md:text-right">${r.amount.toFixed(0)}</div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

const GUARDRAILS = [
  { icon: Quote, title: "Cites, never invents", body: "The agent may only cite records its tools returned. The packet re-reads each one from source data, so the model chooses and explains evidence but cannot write it." },
  { icon: ScrollText, title: "PayPal's rulebook, verbatim", body: "Seller Protection requirements are quoted from PayPal's published program page, alongside the eligibility flag PayPal returns for the payment." },
  { icon: ShieldCheck, title: "Only actions PayPal allows", body: "A brief is rejected unless its action is open on the dispute right now, its offer type is allowed and its amounts are valid. The model fixes and refiles." },
  { icon: UserCheck, title: "A person stays in charge", body: "Autopilot is off by default, works only inside your limits, and sends low-confidence cases to you. Buyer messages and tool output are treated as data, never instructions." },
];

const ENDPOINTS: [string, string, string][] = [
  ["GET", "/v1/customer/disputes", "inbox sync"],
  ["GET", "/v1/customer/disputes/{id}", "live facts, deadline, allowed actions"],
  ["POST", "/v1/customer/disputes/{id}/provide-evidence", "evidence + PDF"],
  ["POST", "/v1/customer/disputes/{id}/provide-supporting-info", "chargebacks under review"],
  ["POST", "/v1/customer/disputes/{id}/make-offer", "refunds, returns, replacements"],
  ["POST", "/v1/customer/disputes/{id}/send-message", "buyer messages"],
  ["POST", "/v1/customer/disputes/{id}/accept-claim", "honest refunds"],
  ["GET", "/v2/payments/captures/{id}", "PayPal's eligibility flag"],
  ["POST", "/v2/payments/captures/{id}/refund", "refund, then prove it"],
  ["POST", "/v2/checkout/orders/{id}/track", "tracking sync"],
  ["POST", "/v1/notifications/verify-webhook-signature", "CUSTOMER.DISPUTE.*"],
];

export function Trust() {
  return (
    <div className="mt-12 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
        {GUARDRAILS.map((g) => (
          <div key={g.title} className="flex gap-4 rounded-2xl border border-line bg-white p-5">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-sunken">
              <g.icon className="size-4 text-ink-2" strokeWidth={1.9} />
            </span>
            <div>
              <div className="text-[15px] font-semibold tracking-[-0.01em]">{g.title}</div>
              <p className="mt-1.5 text-[14px] leading-relaxed text-muted">{g.body}</p>
            </div>
          </div>
        ))}
      </div>
      <div id="api" className="scroll-mt-24 self-start overflow-hidden rounded-2xl border border-line bg-white">
        <div className="flex items-center justify-between border-b border-line px-5 py-3">
          <span className="text-[13px] font-medium">PayPal REST APIs</span>
          <span className="num flex items-center gap-1.5 text-[11.5px] text-muted">
            <Lock className="size-3" /> OAuth client credentials
          </span>
        </div>
        <ul className="num divide-y divide-line/70 text-[12px]">
          {ENDPOINTS.map(([m, p, d]) => (
            <li key={p} className="flex items-center gap-3 px-5 py-2.5">
              <span className={clsx("w-10 shrink-0 font-medium", m === "GET" ? "text-blue" : "text-ink")}>{m}</span>
              <span className="min-w-0 truncate text-ink-2">{p}</span>
              <span className="ml-auto hidden shrink-0 font-sans text-[12px] text-faint sm:block">{d}</span>
            </li>
          ))}
        </ul>
        <div className="border-t border-line bg-[#fafafa] px-5 py-3 text-[12.5px] text-muted">
          Tested end to end against the PayPal sandbox: real captures, chargebacks via <span className="num text-[11.5px] text-ink-2">process-chargeback</span>, evidence filed.
        </div>
      </div>
    </div>
  );
}

const TIERS = [
  { name: "Protection", price: "Free", note: "always", items: ["Tracking sync to PayPal", "Seller Protection check on every order", "Dispute inbox and deadlines"] },
  { name: "Exhibit", price: "No win, no fee", note: "a share of what it recovers", items: ["Agent investigation on every dispute", "Evidence packets and filing via PayPal", "Honest refund and offer recommendations", "Buyer messages in their language"], featured: true },
  { name: "Autopilot", price: "Platform fee", note: "for higher-volume stores", items: ["Hands-off handling within your rules", "Webhook-triggered, around the clock", "Full audit trail of every PayPal call"] },
];

export function Pricing() {
  return (
    <div className="mt-12">
      <div className="grid gap-4 md:grid-cols-3">
        {TIERS.map((t) => (
          <div key={t.name} className={clsx("flex flex-col rounded-2xl border bg-white p-6", t.featured ? "border-ink shadow-[0_24px_60px_-36px_rgb(10_10_10/0.4)]" : "border-line")}>
            <div className="flex items-center justify-between">
              <span className="text-[14px] font-medium text-ink-2">{t.name}</span>
              {t.featured ? <span className="rounded-full bg-ink px-2.5 py-0.5 text-[11px] font-medium text-white">Recommended</span> : null}
            </div>
            <div className="mt-4 text-[28px] font-semibold tracking-[-0.03em]">{t.price}</div>
            <div className="text-[13px] text-faint">{t.note}</div>
            <ul className="mt-6 space-y-2.5 text-[14px] text-ink-2">
              {t.items.map((i) => (
                <li key={i} className="flex gap-2.5">
                  <Check className="mt-0.5 size-4 shrink-0 text-ink" strokeWidth={2.4} />
                  {i}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <p className="mt-5 text-center text-[13px] text-faint">Pilot pricing: a hypothesis we are testing with our first merchants, not a published price list.</p>
    </div>
  );
}

const FAQS = [
  { q: "Does Exhibit submit anything to PayPal without me?", a: "Not unless you turn on Autopilot. By default every response waits for your approval. With Autopilot on, it only acts inside the limits you set (likelihood, amount, action type), and low-confidence briefs always come to you." },
  { q: "Which PayPal products does it work with?", a: "PayPal Checkout payments and their disputes and chargebacks, through the Disputes v1, Orders v2, Payments v2 and Webhooks APIs. Braintree and Venmo disputes are on the roadmap." },
  { q: "Can the AI make up evidence?", a: "No. Every exhibit must cite a record one of its tools returned, and the PDF is rendered from those source records, not from the model's text. A brief that cites anything else is rejected." },
  { q: "Will it fight every dispute?", a: "No, and that's the point. When the records say you can't win (a parcel returned to sender, a refund you owe), it recommends refunding or an offer, which saves fees and customers." },
  { q: "What data does it need?", a: "Your PayPal REST app credentials plus read access to orders, shipments and support messages. The demo uses a fictional merchant; connectors for Shopify and WooCommerce plug into the same tools." },
  { q: "Is this running against real PayPal?", a: "Yes. With sandbox credentials it creates real captures and chargebacks in PayPal's sandbox and files evidence through the API. Without credentials, a simulator with PayPal's request and response shapes keeps the demo running." },
];

export function Faq() {
  return (
    <div className="mx-auto mt-12 max-w-[820px] divide-y divide-line rounded-2xl border border-line bg-white">
      {FAQS.map((f) => (
        <details key={f.q} className="group px-6 py-5 [&_summary::-webkit-details-marker]:hidden">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-[15.5px] font-medium tracking-[-0.01em]">
            {f.q}
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full border border-line text-muted transition-transform group-open:rotate-45">+</span>
          </summary>
          <p className="mt-3 text-[14.5px] leading-relaxed text-muted">{f.a}</p>
        </details>
      ))}
    </div>
  );
}

export function FinalCta() {
  return (
    <Container>
      <div className="relative overflow-hidden rounded-[28px] bg-ink px-8 py-16 text-center text-white md:px-16 md:py-20">
        <div className="pointer-events-none absolute inset-0 opacity-[0.07] [background-image:linear-gradient(#fff_1px,transparent_1px),linear-gradient(90deg,#fff_1px,transparent_1px)] [background-size:48px_48px]" />
        <div className="relative">
          <LogoMark size={36} tone="inverse" className="mx-auto" />
          <h2 className="display mx-auto mt-6 max-w-[720px] text-[36px] leading-[1.05] md:text-[56px]">Every dispute, answered with evidence.</h2>
          <p className="mx-auto mt-4 max-w-[520px] text-[16px] text-white/65">Open the demo merchant and watch Exhibit work a case end to end. No sign-up.</p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/app" className="inline-flex h-11 items-center gap-2 rounded-full bg-white px-5 text-[14.5px] font-medium text-ink transition-colors hover:bg-white/90">
              Open live demo <ArrowRight className="size-4" />
            </Link>
            <Link href="/pitch" className="inline-flex h-11 items-center gap-2 rounded-full border border-white/25 px-5 text-[14.5px] font-medium text-white transition-colors hover:bg-white/10">
              See the pitch
            </Link>
          </div>
        </div>
      </div>
    </Container>
  );
}

export function Footer() {
  return (
    <footer className="mt-20 border-t border-line">
      <Container className="flex flex-col gap-6 py-10 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          <LogoMark size={20} />
          <span className="text-[15px] font-semibold leading-none tracking-[-0.045em]">Exhibit</span>
        </div>
        <nav className="flex flex-wrap gap-x-6 gap-y-2 text-[13.5px] text-muted">
          <Link href="/app" className="hover:text-ink">Live demo</Link>
          <Link href="/pitch" className="hover:text-ink">Pitch</Link>
          <a href="#how" className="hover:text-ink">How it works</a>
          <a href="#api" className="hover:text-ink">PayPal APIs</a>
          <a href="#faq" className="hover:text-ink">FAQ</a>
        </nav>
        <p className="text-[12.5px] text-faint">Built for the PayPal AI Hackathon 2026 by KaDeep AI · Open source (MIT)</p>
      </Container>
      <Container className="pb-10 text-[12px] text-faint">Demo data is fictional. PayPal decides every case; Exhibit prepares the response.</Container>
    </footer>
  );
}

export { PrimaryButton, SecondaryButton };
