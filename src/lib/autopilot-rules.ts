// Pure autopilot rules, shared by the server (to act) and the Autopilot page (to preview).
import type { CaseBrief } from "./agent/brief";

export type AutopilotSettings = {
  enabled: boolean;
  fight: { enabled: boolean; minLikelihood: number; maxAmount: number };
  refund: { enabled: boolean; maxAmount: number };
  offers: { enabled: boolean; maxAmount: number };
  messages: { enabled: boolean };
};

export const DEFAULT_AUTOPILOT: AutopilotSettings = {
  enabled: false,
  fight: { enabled: true, minLikelihood: 85, maxAmount: 300 },
  refund: { enabled: true, maxAmount: 75 },
  offers: { enabled: false, maxAmount: 60 },
  messages: { enabled: true },
};

export type AutopilotVerdict = { verdict: "AUTO" | "REVIEW"; rule: string; reason: string };

/** Decides whether Exhibit may act on its own. Anything outside an explicit rule goes to a human. */
export function evaluateAutopilot(brief: CaseBrief, amount: number, s: AutopilotSettings): AutopilotVerdict {
  const money = `$${amount.toFixed(2)}`;
  if (!s.enabled) return { verdict: "REVIEW", rule: "off", reason: "Autopilot is off: every response waits for your approval." };
  if (brief.confidence === "LOW") return { verdict: "REVIEW", rule: "confidence", reason: "Low-confidence briefs always go to a person." };
  switch (brief.decision) {
    case "FIGHT":
      if (!s.fight.enabled) return { verdict: "REVIEW", rule: "fight", reason: "Auto-filing evidence is disabled." };
      if (brief.win_likelihood < s.fight.minLikelihood) return { verdict: "REVIEW", rule: "fight", reason: `Win likelihood ${brief.win_likelihood}% is under your ${s.fight.minLikelihood}% threshold.` };
      if (amount > s.fight.maxAmount) return { verdict: "REVIEW", rule: "fight", reason: `${money} is above your $${s.fight.maxAmount} auto-file limit.` };
      return { verdict: "AUTO", rule: "fight", reason: `Strong case (${brief.win_likelihood}%) under $${s.fight.maxAmount}: evidence is filed automatically.` };
    case "REFUND":
      if (!s.refund.enabled) return { verdict: "REVIEW", rule: "refund", reason: "Auto-refunds are disabled." };
      if (amount > s.refund.maxAmount) return { verdict: "REVIEW", rule: "refund", reason: `${money} is above your $${s.refund.maxAmount} auto-refund limit.` };
      return { verdict: "AUTO", rule: "refund", reason: `Unwinnable and under $${s.refund.maxAmount}: refunded automatically to save fees.` };
    case "OFFER":
      if (!s.offers.enabled) return { verdict: "REVIEW", rule: "offers", reason: "Offers always need your approval." };
      if ((brief.paypal_action.amount ?? 0) > s.offers.maxAmount) return { verdict: "REVIEW", rule: "offers", reason: `Offer above your $${s.offers.maxAmount} limit.` };
      return { verdict: "AUTO", rule: "offers", reason: "Offer within your limit is sent automatically." };
    case "MESSAGE_BUYER":
      if (!s.messages.enabled) return { verdict: "REVIEW", rule: "messages", reason: "Buyer messages need your approval." };
      return { verdict: "AUTO", rule: "messages", reason: "Inquiry-stage messages are sent automatically." };
  }
}
