import "server-only";
import { kvGet, kvSet } from "./db";
import type { CaseBrief } from "./agent/brief";
import type { Dispute } from "./paypal/types";
import { DEFAULT_AUTOPILOT, evaluateAutopilot as evaluateRules, type AutopilotSettings, type AutopilotVerdict } from "./autopilot-rules";

export { DEFAULT_AUTOPILOT, type AutopilotSettings, type AutopilotVerdict };

export function getAutopilot(): AutopilotSettings {
  const s = kvGet<Partial<AutopilotSettings>>("autopilot", {});
  return { ...DEFAULT_AUTOPILOT, ...s, fight: { ...DEFAULT_AUTOPILOT.fight, ...s.fight }, refund: { ...DEFAULT_AUTOPILOT.refund, ...s.refund }, offers: { ...DEFAULT_AUTOPILOT.offers, ...s.offers }, messages: { ...DEFAULT_AUTOPILOT.messages, ...s.messages } };
}

export function setAutopilot(s: AutopilotSettings) {
  kvSet("autopilot", s);
}

/** Decides whether Exhibit may act on its own. Anything outside an explicit rule goes to a human. */
export function evaluateAutopilot(brief: CaseBrief, d: Dispute, s = getAutopilot()): AutopilotVerdict {
  return evaluateRules(brief, Number(d.dispute_amount.value), s);
}
