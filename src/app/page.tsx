import { ArrowRight, Play } from "lucide-react";
import { Bento } from "@/components/landing/Bento";
import { ALL_TOOLS, CASES, loadReplay, toolSteps } from "@/components/landing/data";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Nav } from "@/components/landing/Nav";
import { Container, LandingKeyframes, PrimaryButton, Rise, SecondaryButton, Section, SectionHead } from "@/components/landing/Primitives";
import { ProductFrame } from "@/components/landing/ProductFrame";
import { Faq, FinalCta, Footer, Outcomes, Pricing, Trust } from "@/components/landing/Sections";
import { buildRecentOrders } from "@/lib/store/scenarios";

export const metadata = { title: { absolute: "Exhibit — the AI dispute agent for PayPal merchants" } };

const APIS = ["Disputes v1", "Orders v2", "Payments v2", "Webhooks", "OAuth 2.0", "Sandbox process-chargeback"];

const STATS: [string, string, string][] = [
  ["261M", "chargebacks expected worldwide in 2025", "Mastercard & Datos Insights, 2025"],
  ["$33.8B", "in disputed value expected in 2025", "Mastercard & Datos Insights, 2025"],
  ["439M", "active PayPal accounts at the end of 2025", "PayPal FY2025 Form 10-K"],
  ["~30s", "for Exhibit to investigate a case and draft the response", "Measured on the demo merchant"],
];

export default function Landing() {
  const hero = loadReplay("inr-delivered-signed");
  const german = loadReplay("inquiry-packstation-de");
  const steps = hero ? toolSteps(hero) : [];
  const rows = CASES.map((c) => ({ ...c, replay: loadReplay(c.key) }))
    .filter((c) => c.replay)
    .map((c) => ({ claim: c.claim, reason: c.reason, amount: c.amount, brief: c.replay!.brief }));
  const notFight = rows.filter((r) => r.brief.decision !== "FIGHT").length;
  const recent = buildRecentOrders(new Date());
  const coverage = { synced: recent.filter((r) => r.shipment.pushed_to_paypal).length, total: recent.length };

  return (
    <div className="bg-white text-ink">
      <LandingKeyframes />
      <Nav />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[560px] [background-image:linear-gradient(to_right,#f2f2f2_1px,transparent_1px),linear-gradient(to_bottom,#f2f2f2_1px,transparent_1px)] [background-size:56px_56px] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,#000_40%,transparent_100%)]" />
        <Container className="relative pb-16 pt-16 text-center md:pt-24">
          <Rise>
            <a href="#how" className="inline-flex items-center gap-2 rounded-full border border-line bg-white py-1 pl-1 pr-3 text-[12.5px] text-ink-2 shadow-[0_1px_2px_rgb(0_0_0/0.04)] transition-colors hover:border-line-strong">
              <span className="rounded-full bg-ink px-2 py-0.5 text-[11px] font-medium text-white">New</span>
              Built on the PayPal Disputes API
              <ArrowRight className="size-3 text-faint" />
            </a>
          </Rise>
          <Rise delay={80}>
            <h1 className="display mx-auto mt-7 max-w-[900px] text-[44px] leading-[0.98] tracking-[-0.045em] sm:text-[60px] md:text-[78px]">
              Win the disputes you should never lose.
            </h1>
          </Rise>
          <Rise delay={160}>
            <p className="mx-auto mt-6 max-w-[640px] text-[17px] leading-relaxed text-muted md:text-[19px]">
              Exhibit is the AI dispute agent for PayPal merchants. It investigates every case the moment it opens, builds a cited evidence packet from your own records, and files the response through PayPal. When you can&apos;t win, it tells you to refund.
            </p>
          </Rise>
          <Rise delay={240}>
            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <PrimaryButton href="/app">
                Open the live demo <ArrowRight className="size-4" />
              </PrimaryButton>
              <SecondaryButton href="/pitch">
                <Play className="size-3.5" /> Watch the pitch
              </SecondaryButton>
            </div>
            <div className="num mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-1 text-[12px] text-faint">
              <span>9 investigation tools</span>
              <span className="hidden sm:inline">·</span>
              <span>6 PayPal actions</span>
              <span className="hidden sm:inline">·</span>
              <span>No sign-up, no keys</span>
            </div>
          </Rise>
        </Container>
        {hero ? (
          <Container className="relative pb-6">
            <Rise delay={320}>
              <ProductFrame replay={hero} steps={steps} />
            </Rise>
            <p className="mt-4 text-center text-[12.5px] text-faint">A real recorded run of Exhibit&apos;s agent on the demo merchant&apos;s case, rendered with the product&apos;s own components.</p>
          </Container>
        ) : null}
      </section>

      {/* PayPal strip */}
      <Container className="py-14">
        <div className="flex flex-col items-center gap-5">
          <div className="text-[12.5px] text-faint">Talks to PayPal through</div>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {APIS.map((a) => (
              <span key={a} className="num rounded-full border border-line bg-white px-3.5 py-1.5 text-[12.5px] text-ink-2">
                {a}
              </span>
            ))}
          </div>
        </div>
      </Container>

      {/* Problem */}
      <Section>
        <Container>
          <SectionHead
            eyebrow="The problem"
            title="Disputes are a deadline, not a debate."
            lede="The evidence almost always exists: a signed scan, a policy the buyer accepted, a return that already arrived. It's scattered across PayPal, the store, the carrier and the inbox, and the response window closes first."
          />
          <div className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
            {STATS.map(([n, l, s]) => (
              <div key={n} className="bg-white p-7">
                <div className="num text-[40px] leading-none tracking-[-0.04em]">{n}</div>
                <div className="mt-4 text-[14.5px] leading-snug text-ink-2">{l}</div>
                <div className="mt-2 text-[12px] text-faint">{s}</div>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* How it works */}
      <Section id="how">
        <Container>
          <SectionHead eyebrow="How it works" title="From webhook to filed response, while you sleep." lede="Exhibit works a case the way an experienced payments ops lead would, then hands you a decision, a letter and an evidence packet to approve." />
          {hero ? (
            <HowItWorks
              data={{
                disputeId: hero.ids.dispute_id,
                tools: ALL_TOOLS,
                headline: hero.brief.headline,
                likelihood: hero.brief.win_likelihood,
                exhibits: hero.brief.exhibits.map((e) => ({ label: e.label, title: e.title })),
                letter: hero.brief.response_letter,
              }}
            />
          ) : null}
        </Container>
      </Section>

      {/* Product */}
      <Section id="product" className="bg-[#fafafa]">
        <Container>
          <SectionHead eyebrow="Product" title="Everything a dispute needs, in one place." lede="Investigation, evidence, policy, filing and prevention, built around PayPal's own APIs and rules." />
          {hero && german ? (
            <Bento
              steps={steps}
              exhibits={hero.brief.exhibits.map((e) => ({ label: e.label, title: e.title }))}
              german={{ de: german.brief.buyer_message?.text ?? "", en: german.brief.buyer_message?.english ?? "" }}
              coverage={coverage}
            />
          ) : null}
        </Container>
      </Section>

      {/* Outcomes */}
      <Section>
        <Container>
          <SectionHead eyebrow="Real calls on real cases" title="It fights what it can win. It refunds what it can't." lede={`${rows.length} demo cases, ${rows.length} briefs from the agent. ${notFight} of them say don't fight: refund, offer or talk to the buyer instead.`} />
          <Outcomes rows={rows} />
        </Container>
      </Section>

      {/* Trust */}
      <Section id="trust">
        <Container>
          <SectionHead eyebrow="Trust" title="An agent you can hand money to." lede="Every step is grounded in a record, every rule is PayPal's own, and every action is one PayPal allows right now." />
          <Trust />
        </Container>
      </Section>

      {/* Pricing */}
      <Section id="pricing">
        <Container>
          <SectionHead center eyebrow="Pricing" title="No win, no fee." lede="Exhibit earns when it recovers money, and saves you the fee when it tells you not to fight." />
          <Pricing />
        </Container>
      </Section>

      {/* FAQ */}
      <Section id="faq">
        <Container>
          <SectionHead center eyebrow="FAQ" title="Questions merchants ask." />
          <Faq />
        </Container>
      </Section>

      <div className="border-t border-line pt-20 md:pt-28">
        <FinalCta />
      </div>
      <Footer />
    </div>
  );
}
