"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { LogoMark } from "../ui/Logo";

export type DeckCase = { claim: string; decision: string; tone: string; headline: string; amount: string };

const W = 1600;
const H = 900;

function Frame({ n, total, children, dark }: { n: number; total: number; children: React.ReactNode; dark?: boolean }) {
  return (
    <div className={`relative h-full w-full ${dark ? "bg-[#0a0a0a] text-white" : "bg-white text-ink"}`} style={{ padding: "88px 104px" }}>
      {children}
      <div className={`absolute bottom-10 left-[104px] right-[104px] flex items-center justify-between text-[15px] ${dark ? "text-white/45" : "text-faint"}`}>
        <span className="flex items-center gap-2.5">
          <LogoMark size={18} tone={dark ? "inverse" : "ink"} />
          Exhibit
        </span>
        <span className="num">
          {String(n).padStart(2, "0")} / {String(total).padStart(2, "0")}
        </span>
      </div>
    </div>
  );
}

const Eyebrow = ({ children, dark }: { children: React.ReactNode; dark?: boolean }) => <div className={`mb-6 text-[19px] ${dark ? "text-white/55" : "text-muted"}`}>{children}</div>;
const Title = ({ children, size = 76 }: { children: React.ReactNode; size?: number }) => (
  <h2 className="display" style={{ fontSize: size * 0.92, lineHeight: 1.04, letterSpacing: "-0.04em" }}>
    {children}
  </h2>
);

const TONE: Record<string, string> = { ink: "bg-ink text-white", violet: "bg-white text-ink-2 shadow-[inset_0_0_0_1px_var(--line-strong)]", amber: "bg-sunken text-ink-2", blue: "bg-blue-soft text-blue" };

export function Deck({ cases }: { cases: DeckCase[] }) {
  const slides: ((n: number, total: number) => React.ReactNode)[] = [
    (n, t) => (
      <Frame n={n} total={t} dark>
        <div className="flex h-full flex-col justify-center">
          <LogoMark size={64} tone="inverse" />
          <h1 className="display mt-10" style={{ fontSize: 120, lineHeight: 0.98, letterSpacing: "-0.045em" }}>
            Win the disputes
            <br />
            you <span className="text-white/45">should</span> never lose.
          </h1>
          <p className="mt-10 max-w-[900px] text-[28px] leading-snug text-white/70">Exhibit is the AI dispute agent for PayPal merchants.</p>
          <p className="mt-16 text-[18px] text-white/45">PayPal AI Hackathon 2026 · KaDeep AI</p>
        </div>
      </Frame>
    ),
    (n, t) => (
      <Frame n={n} total={t}>
        <Eyebrow>The problem</Eyebrow>
        <Title>Disputes are a deadline, not a debate.</Title>
        <div className="mt-16 grid grid-cols-3 gap-8">
          {[
            ["261M", "chargebacks expected worldwide in 2025", "Mastercard & Datos Insights"],
            ["$33.8B", "in disputed value expected in 2025", "Mastercard & Datos Insights"],
            ["4 systems", "hold the evidence: PayPal, the store, the carrier and the inbox", "Every dispute, every time"],
          ].map(([a, b, c]) => (
            <div key={a} className="border-t-2 border-ink pt-6">
              <div className="num text-[64px] leading-none">{a}</div>
              <div className="mt-4 text-[22px] leading-snug text-ink-2">{b}</div>
              <div className="mt-3 text-[15px] text-faint">{c}</div>
            </div>
          ))}
        </div>
        <p className="mt-14 max-w-[1150px] text-[26px] leading-snug text-ink-2">Miss the deadline and the case is decided without you. So small merchants either fight everything badly or refund everything, and lose money both ways.</p>
      </Frame>
    ),
    (n, t) => (
      <Frame n={n} total={t}>
        <Eyebrow>The insight</Eyebrow>
        <Title size={92}>
          The evidence already exists.
          <br />
          <span className="text-muted">Nobody has time to assemble it.</span>
        </Title>
        <p className="mt-14 max-w-[1100px] text-[27px] leading-snug text-ink-2">
          A signed UPS scan, a policy the buyer accepted, a return that arrived four days ago. Winning (or knowing you can&apos;t) is an investigation problem. The whole dispute lifecycle is now an API, and models can finally reason
          over evidence like an ops lead.
        </p>
      </Frame>
    ),
    (n, t) => (
      <Frame n={n} total={t}>
        <div className="grid h-full grid-cols-[520px_1fr] gap-14">
          <div className="flex flex-col justify-center">
            <Eyebrow>The product</Eyebrow>
            <Title size={68}>A payments ops lead that never sleeps.</Title>
            <ul className="mt-10 space-y-4 text-[22px] text-ink-2">
              <li>Investigates every PayPal dispute the moment it opens</li>
              <li>Decides: fight, offer, refund or message</li>
              <li>Writes the response and builds the evidence packet</li>
              <li>Files it through the PayPal API on your approval</li>
            </ul>
          </div>
          <div className="flex items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/screens/case-fight.png" alt="Exhibit case workspace" className="w-full rounded-2xl border border-line shadow-[0_40px_80px_-40px_rgb(20_20_19/0.45)]" />
          </div>
        </div>
      </Frame>
    ),
    (n, t) => (
      <Frame n={n} total={t}>
        <Eyebrow>How it works</Eyebrow>
        <Title>From webhook to filed response.</Title>
        <div className="mt-16 grid grid-cols-4 gap-6">
          {[
            ["Webhook", "CUSTOMER.DISPUTE.CREATED arrives; signature verified with PayPal"],
            ["Investigate", "9 tools: PayPal dispute, order, carrier scans, buyer history, messages, risk signals, policies, Seller Protection check"],
            ["Build the case", "Decision, win likelihood, response letter, labelled exhibits rendered into a PDF"],
            ["Act", "provide-evidence, make-offer, refund, accept-claim or send-message, by click or Autopilot"],
          ].map(([a, b], i) => (
            <div key={a} className="rounded-2xl border border-line bg-surface p-7">
              <div className="num text-[16px] text-faint">0{i + 1}</div>
              <div className="mt-6 text-[28px] font-medium">{a}</div>
              <div className="mt-3 text-[19px] leading-snug text-muted">{b}</div>
            </div>
          ))}
        </div>
        <p className="mt-12 text-[22px] text-ink-2">About 30 seconds per case on the demo merchant, start to brief.</p>
      </Frame>
    ),
    (n, t) => (
      <Frame n={n} total={t}>
        <Eyebrow>Real calls from the agent</Eyebrow>
        <Title size={64}>It fights what it can win. It refunds what it can&apos;t.</Title>
        <div className="mt-10 divide-y divide-line rounded-2xl border border-line bg-surface">
          {cases.slice(0, 6).map((c) => (
            <div key={c.claim} className="grid grid-cols-[340px_150px_1fr] items-center gap-8 px-8 py-[18px]">
              <div className="text-[19px] text-ink-2">{c.claim}</div>
              <div>
                <span className={`inline-flex h-8 items-center rounded-md px-3 text-[16px] font-medium ${TONE[c.tone] ?? "bg-sunken"}`}>{c.decision}</span>
              </div>
              <div className="text-[20px] leading-snug">{c.headline}</div>
            </div>
          ))}
        </div>
      </Frame>
    ),
    (n, t) => (
      <Frame n={n} total={t}>
        <Eyebrow>Built to be trusted with money</Eyebrow>
        <Title>An agent that shows its work.</Title>
        <div className="mt-14 grid grid-cols-2 gap-x-14 gap-y-10">
          {[
            ["Cites, never invents", "The agent may only cite records its tools returned; exhibits are rendered from those records. It chooses and explains evidence. It cannot write it."],
            ["PayPal's rulebook, verbatim", "Every case is checked against PayPal's published Seller Protection requirements, quoted word for word."],
            ["Only actions PayPal allows", "Briefs are rejected unless the action is open on the case right now and the amounts are valid."],
            ["Autopilot with limits", "Amount and confidence thresholds, low-confidence cases always go to a person, and every PayPal call is audit-logged."],
          ].map(([a, b]) => (
            <div key={a} className="border-t border-line pt-6">
              <div className="text-[28px] font-medium">{a}</div>
              <div className="mt-3 text-[20px] leading-snug text-muted">{b}</div>
            </div>
          ))}
        </div>
      </Frame>
    ),
    (n, t) => (
      <Frame n={n} total={t}>
        <div className="grid grid-cols-[1fr_1fr] gap-14">
          <div>
            <Eyebrow>PayPal integration</Eyebrow>
            <Title size={66}>The whole dispute lifecycle, through the API.</Title>
            <p className="mt-8 text-[22px] leading-snug text-ink-2">
              OAuth client credentials, Disputes v1, Orders v2, Payments v2 and Webhooks. In the sandbox Exhibit creates real transactions and chargebacks, files evidence, and has PayPal adjudicate.
            </p>
          </div>
          <div className="num space-y-3 rounded-2xl border border-line bg-surface p-8 text-[17px] text-ink-2">
            {[
              "GET  /v1/customer/disputes",
              "GET  /v1/customer/disputes/{id}",
              "POST …/{id}/provide-evidence   multipart + PDF",
              "POST …/{id}/make-offer",
              "POST …/{id}/send-message",
              "POST …/{id}/accept-claim",
              "POST /v2/payments/captures/{id}/refund",
              "POST /v2/checkout/orders/{id}/track",
              "POST /v1/notifications/verify-webhook-signature",
              "POST /v2/customer-support/process-chargeback   sandbox",
              "POST …/{id}/adjudicate   sandbox",
            ].map((l) => (
              <div key={l}>{l}</div>
            ))}
          </div>
        </div>
      </Frame>
    ),
    (n, t) => (
      <Frame n={n} total={t}>
        <Eyebrow>Market</Eyebrow>
        <Title>Every PayPal merchant gets disputes.</Title>
        <div className="mt-16 grid grid-cols-2 gap-10">
          {[
            ["439M", "active PayPal accounts at the end of 2025"],
            ["$1.79T", "total payment volume PayPal processed in 2025"],
          ].map(([a, b]) => (
            <div key={a} className="border-t-2 border-ink pt-6">
              <div className="num text-[88px] leading-none">{a}</div>
              <div className="mt-4 text-[24px] text-ink-2">{b}</div>
            </div>
          ))}
        </div>
        <p className="mt-6 text-[15px] text-faint">Source: PayPal Holdings, Form 10-K for fiscal 2025.</p>
        <p className="mt-10 max-w-[1150px] text-[24px] leading-snug text-ink-2">We start with independent e-commerce brands on PayPal Checkout: too small for a payments ops team, big enough that every lost dispute hurts.</p>
      </Frame>
    ),
    (n, t) => (
      <Frame n={n} total={t}>
        <Eyebrow>Business model · hypothesis to test with pilots</Eyebrow>
        <Title>No win, no fee.</Title>
        <div className="mt-14 grid grid-cols-3 gap-6">
          {[
            ["Protection", "Free", "Tracking sync to PayPal and Seller Protection checks on every order"],
            ["Exhibit", "% of recovered", "A share of money won back. Refund recommendations and inquiry messages are included"],
            ["Autopilot", "Platform fee", "Hands-off handling within your rules, for higher-volume stores"],
          ].map(([a, b, c]) => (
            <div key={a} className="rounded-2xl border border-line bg-surface p-8">
              <div className="text-[19px] text-muted">{a}</div>
              <div className="mt-3 text-[38px] font-medium">{b}</div>
              <div className="mt-4 text-[19px] leading-snug text-muted">{c}</div>
            </div>
          ))}
        </div>
        <p className="mt-10 text-[22px] text-ink-2">Aligned with the merchant: Exhibit earns when it wins, and saves them fees when it tells them not to fight.</p>
      </Frame>
    ),
    (n, t) => (
      <Frame n={n} total={t}>
        <Eyebrow>Roadmap</Eyebrow>
        <Title>From hackathon to the PayPal ecosystem.</Title>
        <div className="mt-14 grid grid-cols-3 gap-6">
          {[
            ["Shipped", ["Disputes inbox + agent", "Evidence packets (PDF)", "Seller Protection checks", "Autopilot with limits", "Tracking sync", "Webhooks + sandbox lifecycle"]],
            ["Next 90 days", ["Shopify and WooCommerce connectors", "Carrier APIs: signature images, POD letters", "Pilot with 20 PayPal merchants", "Win-rate tracking per reason code"]],
            ["After", ["Braintree and Venmo disputes", "Pre-dispute buyer outreach", "Listing for PayPal merchants", "Multi-store agencies"]],
          ].map(([a, items]) => (
            <div key={a as string} className="rounded-2xl border border-line bg-surface p-8">
              <div className="text-[24px] font-medium">{a as string}</div>
              <ul className="mt-5 space-y-3 text-[19px] text-ink-2">
                {(items as string[]).map((i) => (
                  <li key={i}>· {i}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Frame>
    ),
    (n, t) => (
      <Frame n={n} total={t} dark>
        <div className="flex h-full flex-col justify-center">
          <div className="text-[19px] text-white/55">Team</div>
          <div className="mt-4 text-[44px]">Shivansh Dwivedi · KaDeep AI, Mumbai</div>
          <p className="mt-5 max-w-[1100px] text-[24px] leading-snug text-white/65">
            We build AI agents that verify software before it ships. Exhibit brings the same evidence-first discipline to payments: show the proof, or don&apos;t make the claim.
          </p>
          <h2 className="display mt-20" style={{ fontSize: 96, lineHeight: 1, letterSpacing: "-0.045em" }}>
            Every dispute,
            <br />
            answered with evidence.
          </h2>
          <p className="mt-10 text-[22px] text-white/70">Try the live demo: open Exhibit and run any case.</p>
        </div>
      </Frame>
    ),
  ];

  const total = slides.length;
  const [i, setI] = useState(0);
  const [scale, setScale] = useState(1);

  const go = useCallback((d: number) => setI((x) => Math.min(total - 1, Math.max(0, x + d))), [total]);

  useEffect(() => {
    const fromHash = Number(window.location.hash.replace("#", ""));
    // Deep links (#5) jump to a slide once the page has mounted.
    if (fromHash >= 1 && fromHash <= total) requestAnimationFrame(() => setI(fromHash - 1));
    const onKey = (e: KeyboardEvent) => {
      if (["ArrowRight", "PageDown", " "].includes(e.key)) go(1);
      if (["ArrowLeft", "PageUp"].includes(e.key)) go(-1);
      if (e.key === "Home") setI(0);
      if (e.key === "End") setI(total - 1);
    };
    const fit = () => setScale(Math.min(window.innerWidth / W, window.innerHeight / H));
    fit();
    window.addEventListener("keydown", onKey);
    window.addEventListener("resize", fit);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", fit);
    };
  }, [go, total]);

  useEffect(() => {
    history.replaceState(null, "", `#${i + 1}`);
  }, [i]);

  return (
    <div className="fixed inset-0 flex items-center justify-center overflow-hidden bg-[#f0f0f0]">
      <div style={{ width: W, height: H, transform: `scale(${scale})`, transformOrigin: "center" }} className="shrink-0 overflow-hidden shadow-2xl">
        <div key={i} className="rise h-full w-full">
          {slides[i](i + 1, total)}
        </div>
      </div>
      <div className="fixed bottom-4 right-4 flex items-center gap-1 rounded-lg bg-surface/90 p-1 text-[12px] shadow backdrop-blur print:hidden">
        <Link href="/" className="px-2 text-muted hover:text-ink">
          Exit
        </Link>
        <button type="button" onClick={() => go(-1)} className="rounded p-1.5 hover:bg-sunken" aria-label="Previous slide">
          <ArrowLeft className="size-4" />
        </button>
        <button type="button" onClick={() => go(1)} className="rounded p-1.5 hover:bg-sunken" aria-label="Next slide">
          <ArrowRight className="size-4" />
        </button>
      </div>
      <div className="fixed inset-x-0 top-0 h-[3px] bg-transparent print:hidden">
        <div className="h-full bg-ink transition-all" style={{ width: `${((i + 1) / total) * 100}%` }} />
      </div>
    </div>
  );
}
