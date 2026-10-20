import fs from "node:fs";
import path from "node:path";
import { Deck, type DeckCase } from "@/components/pitch/Deck";
import type { CaseBrief } from "@/lib/agent/brief";

export const metadata = { title: "Pitch" };

const CASES: { key: string; claim: string }[] = [
  { key: "inr-delivered-signed", claim: "“I never received my bag.”" },
  { key: "unauth-friendly-fraud", claim: "Card chargeback: “unauthorized”" },
  { key: "inr-returned-to-sender", claim: "“Never got my wallet.”" },
  { key: "credit-not-processed", claim: "“Returned it, no refund.”" },
  { key: "inquiry-packstation-de", claim: "„Mein Paket ist nie angekommen.“" },
  { key: "snad-damaged-ring", claim: "“Strap ring arrived broken.”" },
];

const LABEL: Record<string, [string, string]> = { FIGHT: ["Fight", "ink"], OFFER: ["Offer", "violet"], REFUND: ["Refund", "amber"], MESSAGE_BUYER: ["Message", "blue"] };

export default function PitchPage() {
  const cases: DeckCase[] = CASES.flatMap(({ key, claim }) => {
    const p = path.join(process.cwd(), "replays", `${key}.json`);
    if (!fs.existsSync(p)) return [];
    const b = (JSON.parse(fs.readFileSync(p, "utf8")) as { brief: CaseBrief }).brief;
    const [decision, tone] = LABEL[b.decision];
    return [{ claim, decision, tone, headline: b.headline, amount: "" }];
  });
  return <Deck cases={cases} />;
}
