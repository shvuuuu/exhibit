import "server-only";
import fs from "node:fs";
import path from "node:path";
import type { CaseBrief } from "@/lib/agent/brief";
import type { AgentEvent } from "@/lib/agent/tools";

export type Replay = { scenario: string; ids: { dispute_id: string; order_id: string }; events: AgentEvent[]; brief: CaseBrief };

export function loadReplay(key: string): Replay | null {
  const p = path.join(process.cwd(), "replays", `${key}.json`);
  return fs.existsSync(p) ? (JSON.parse(fs.readFileSync(p, "utf8")) as Replay) : null;
}

export type ToolStep = { name: string; label: string; kind: string; arg: string };

/** The tool calls a recorded run made, in order, with the one argument worth showing. */
export function toolSteps(r: Replay): ToolStep[] {
  return r.events
    .filter((e): e is Extract<AgentEvent, { t: "tool_call" }> => e.t === "tool_call")
    .map((e) => {
      const input = (e.input ?? {}) as Record<string, unknown>;
      const first = Object.entries(input).find(([, v]) => typeof v === "string" && (v as string).length < 40);
      return { name: e.name, label: e.label, kind: e.kind, arg: first ? String(first[1]) : "" };
    });
}

/** Demo-merchant cases shown on the page: the buyer's claim as filed, and the disputed amount. */
export const CASES: { key: string; claim: string; amount: number; reason: string }[] = [
  { key: "inr-delivered-signed", claim: "“I never received my bag.”", amount: 284, reason: "Item not received" },
  { key: "unauth-friendly-fraud", claim: "Card chargeback: “unauthorized”", amount: 420, reason: "Unauthorized" },
  { key: "duplicate-two-orders", claim: "“I was charged twice.”", amount: 96, reason: "Duplicate" },
  { key: "inr-returned-to-sender", claim: "“Never got my wallet.”", amount: 68, reason: "Item not received" },
  { key: "credit-not-processed", claim: "“Returned it, no refund.”", amount: 180, reason: "Credit not processed" },
  { key: "inquiry-packstation-de", claim: "„Mein Paket ist nie angekommen.“", amount: 236, reason: "Item not received" },
  { key: "snad-damaged-ring", claim: "“Strap ring arrived broken.”", amount: 355, reason: "Not as described" },
  { key: "snad-color", claim: "“Darker than the photos.”", amount: 166, reason: "Not as described" },
];

/** The agent's nine tools, as named in src/lib/agent/tools.ts. */
export const ALL_TOOLS: { name: string; label: string }[] = [
  { name: "get_paypal_dispute", label: "PayPal Disputes API" },
  { name: "lookup_order", label: "Store orders" },
  { name: "get_carrier_tracking", label: "Carrier tracking" },
  { name: "get_customer_history", label: "Customer history" },
  { name: "get_support_conversation", label: "Support inbox" },
  { name: "get_payment_risk_signals", label: "Risk signals" },
  { name: "get_store_policies", label: "Store policies" },
  { name: "check_seller_protection", label: "PayPal Seller Protection" },
  { name: "file_case_brief", label: "Case brief" },
];
