import "server-only";
// Evidence refs are the contract between the agent and the evidence packet: the agent may only
// cite refs that tools returned, and the packet re-reads each ref from source records. The model
// can choose and explain evidence, but it cannot write it.

import type { CaseFile } from "./disputes";
import { evaluateSellerProtection, type ProtectionReport } from "./agent/playbook";
import type { Dispute } from "./paypal/types";
import { store } from "./store/repo";
import type { Customer, Order, Policy, Product, RiskSignals, Shipment, SupportMessage } from "./store/types";

export type ResolvedRef =
  | { kind: "dispute"; ref: string; data: Dispute }
  | { kind: "order"; ref: string; data: Order }
  | { kind: "listing"; ref: string; data: Product }
  | { kind: "shipment"; ref: string; data: Shipment }
  | { kind: "customer"; ref: string; data: Customer }
  | { kind: "message"; ref: string; data: SupportMessage }
  | { kind: "conversation"; ref: string; data: SupportMessage[] }
  | { kind: "risk"; ref: string; data: RiskSignals }
  | { kind: "policy"; ref: string; data: Policy & { accepted_at?: string } }
  | { kind: "protection"; ref: string; data: ProtectionReport }
  | { kind: "paypal_message"; ref: string; data: NonNullable<Dispute["messages"]>[number] };

export const refs = {
  dispute: (id: string) => `paypal:dispute:${id}`,
  protection: (id: string) => `paypal:seller-protection:${id}`,
  paypalMessage: (id: string, i: number) => `paypal:message:${id}:${i}`,
  order: (id: string) => `order:${id}`,
  listing: (sku: string) => `listing:${sku}`,
  shipment: (id: string) => `shipment:${id}`,
  customer: (email: string) => `customer:${email}`,
  message: (id: string) => `msg:${id}`,
  conversation: (orderId: string) => `conversation:${orderId}`,
  risk: (orderId: string) => `risk:${orderId}`,
  policy: (id: string) => `policy:${id}`,
};

export function resolveRef(ref: string, cf: CaseFile): ResolvedRef | undefined {
  const [ns, ...rest] = ref.split(":");
  const id = rest.join(":");
  const d = cf.dispute;
  switch (ns) {
    case "paypal": {
      const [sub, ...tail] = rest;
      const disputeId = sub === "message" ? tail.slice(0, -1).join(":") : tail.join(":");
      if (disputeId && disputeId !== d.dispute_id) return undefined;
      if (sub === "dispute") return { kind: "dispute", ref, data: d };
      if (sub === "seller-protection") return { kind: "protection", ref, data: evaluateSellerProtection(cf) };
      if (sub === "message") {
        const m = d.messages?.[Number(tail[tail.length - 1])];
        return m ? { kind: "paypal_message", ref, data: m } : undefined;
      }
      return undefined;
    }
    case "order":
      return cf.order && cf.order.id === id ? { kind: "order", ref, data: cf.order } : undefined;
    case "listing": {
      const p = store.product(id);
      return p && cf.order?.items.some((i) => i.sku === id) ? { kind: "listing", ref, data: p } : undefined;
    }
    case "shipment": {
      const s = cf.shipments.find((x) => x.id === id);
      return s ? { kind: "shipment", ref, data: s } : undefined;
    }
    case "customer":
      return cf.customer && cf.customer.email === id ? { kind: "customer", ref, data: cf.customer } : undefined;
    case "msg": {
      const m = cf.conversation?.messages.find((x) => x.id === id);
      return m ? { kind: "message", ref, data: m } : undefined;
    }
    case "conversation":
      return cf.conversation && cf.conversation.order_id === id ? { kind: "conversation", ref, data: cf.conversation.messages } : undefined;
    case "risk":
      return cf.risk && cf.risk.order_id === id ? { kind: "risk", ref, data: cf.risk } : undefined;
    case "policy": {
      const p = store.policy(id);
      return p ? { kind: "policy", ref, data: { ...p, accepted_at: cf.order?.checkout.accepted_terms_at } } : undefined;
    }
    default:
      return undefined;
  }
}

export { refLabel } from "./reflabel";
