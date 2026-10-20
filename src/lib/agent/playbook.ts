// Exhibit's dispute rulebook. Two kinds of content live here, kept apart on purpose:
//  1. PAYPAL_POLICY: requirements quoted from PayPal's US Seller Protection program page
//     (snapshot in docs/sources/paypal-us-seller-protection-2026-10-20.txt).
//  2. PLAYBOOK: Exhibit's own response strategy per dispute reason. This is guidance, not PayPal policy.

import type { CaseFile } from "../disputes";
import type { DisputeReason, EvidenceType } from "../paypal/types";
import type { Address } from "../store/types";

export const PAYPAL_POLICY = {
  source: "https://www.paypal.com/us/legalhub/paypal/seller-protection",
  retrieved: "2026-10-20",
  quotes: {
    covered:
      "PayPal’s Seller Protection program may apply when buyer(s) claim that they did not authorize, or benefit from, funds sent from their PayPal account … or they didn’t receive the item from you.",
    inrChargebackExcluded:
      "Item Not Received claims that result from buyers filing chargeback claims with their issuers for card-funded transactions are not eligible for PayPal’s Seller Protection.",
    usAddress: "The primary address for your PayPal account must be in the United States.",
    physical: "The item must be a physical, tangible good that can be shipped.",
    shipToAddress: "You must ship the item to the shipping address on the Transaction Details page in your PayPal account for the transaction.",
    redirected: "If you originally ship the item to the recipient’s shipping address on the Transaction Details page but the item is later redirected to a different address, you will not be eligible.",
    respond: "You must respond to PayPal’s requests for documentation and other information in a timely manner.",
    shipWithin7: "It is recommended that you ship all items within 7 days after receipt of payment.",
    unauthorizedTiming: "You must provide valid proof of shipment or proof of delivery that demonstrates that the item was shipped or provided to the buyer no later than two days after PayPal notified you of the dispute or reversal.",
    proofOfDelivery:
      "Proof of delivery: online or physical documentation from a shipping company that includes an online and verifiable tracking number, date of delivery and ‘delivered’ status, an address for the recipient that matches the shipping address on the Transaction Details page, showing at least the city/state, city/country, or zip/postal code.",
    proofOfShipment:
      "Proof of shipment: online or physical documentation from a shipping company that includes an online and verifiable tracking number, date of shipment, and an address for the recipient that matches the shipping address on the Transaction Details page.",
    unauthorizedEligible: "In the case of Unauthorized Transaction claims, the payment must be marked “eligible” or “partially eligible” for PayPal’s Seller Protection program on the Transaction Details page.",
    snadExcluded: "Items where the buyer claims (either with us or their card issuer) that the item you sent isn’t what was ordered (referred to as a Significantly Not as Described claim) are not eligible.",
  },
} as const;

type Play = { goal: string; evidence: EvidenceType[]; strategy: string[] };

export const PLAYBOOK: Partial<Record<DisputeReason, Play>> & { DEFAULT: Play } = {
  MERCHANDISE_OR_SERVICE_NOT_RECEIVED: {
    goal: "Prove delivery to the address on the PayPal transaction.",
    evidence: ["PROOF_OF_FULFILLMENT", "PROOF_OF_DELIVERY_SIGNATURE"],
    strategy: [
      "Delivered to the matching address with a verifiable tracking number: fight with PROOF_OF_FULFILLMENT and the carrier's tracking details.",
      "Signature or delivery photo strengthens the case; cite it as its own exhibit.",
      "Returned to sender, lost or stuck in transit: do not fight. Refund (accept the claim) and offer to reship; fighting only adds fees.",
      "Inquiry stage and the carrier shows delivery to a locker, neighbour or pickup point: message the buyer in their language first; most of these close without escalation.",
    ],
  },
  MERCHANDISE_OR_SERVICE_NOT_AS_DESCRIBED: {
    goal: "Show the item matched the listing, or resolve cheaply before it escalates.",
    evidence: ["ITEM_DESCRIPTION", "RETURN_POLICY", "OTHER"],
    strategy: [
      "Not covered by PayPal Seller Protection, so the case is decided on the merits.",
      "When the listing disclosed the trait the buyer complains about (for example natural variation), cite the listing text and the policy accepted at checkout.",
      "In the inquiry stage an offer (partial refund, refund with return, replacement) is usually cheaper than an escalated claim. Size it against the item's value.",
      "Damage in transit with a pre-dispatch QC photo: offer a replacement part or replacement before refunding in full.",
    ],
  },
  UNAUTHORISED: {
    goal: "Show the cardholder or account owner made or benefited from the purchase.",
    evidence: ["PROOF_OF_FULFILLMENT", "OTHER"],
    strategy: [
      "Covered by Seller Protection when shipped to the transaction address with valid proof of shipment or delivery.",
      "Compelling evidence: AVS and CVV matches, 3-D Secure authentication, IP and device consistent with the billing address, prior undisputed orders from the same customer, and post-purchase contact from the buyer about the item.",
      "If signals point to real fraud (mismatched IP country, new device, rushed shipping to a different address) and proof is weak, accept and flag the customer.",
    ],
  },
  DUPLICATE_TRANSACTION: {
    goal: "Show each charge is a distinct order.",
    evidence: ["OTHER", "PROOF_OF_FULFILLMENT"],
    strategy: ["Present both orders side by side: order numbers, times, shipping addresses and separate deliveries.", "Quote any buyer message that shows they intended the second order."],
  },
  CREDIT_NOT_PROCESSED: {
    goal: "If a refund is owed, issue it now and prove it; if not, show why not.",
    evidence: ["PROOF_OF_REFUND", "RETURN_POLICY"],
    strategy: [
      "Return received and refund owed under the returns policy: refund immediately, then file PROOF_OF_REFUND with the refund ID. Fighting a refund you owe loses the case and the customer.",
      "Return not received or outside the policy window: cite the return policy and the return tracking.",
    ],
  },
  DEFAULT: {
    goal: "Answer with the facts PayPal asked for.",
    evidence: ["OTHER"],
    strategy: ["Respond before the deadline with the order record, policies and any communication."],
  },
};

export type CheckStatus = "pass" | "fail" | "unknown" | "info";
export type ProtectionCheck = { id: string; label: string; status: CheckStatus; detail: string; quote?: string };
export type ProtectionReport = {
  program: string;
  applies: boolean;
  verdict: "LIKELY_ELIGIBLE" | "NOT_ELIGIBLE" | "NOT_APPLICABLE" | "AT_RISK";
  summary: string;
  checks: ProtectionCheck[];
  source: string;
};

const norm = (s?: string) => (s ?? "").toLowerCase().replace(/[^a-z0-9]/g, "");

export function addressesMatch(a?: Address, b?: Address) {
  if (!a || !b) return false;
  return norm(a.postal_code) === norm(b.postal_code) && norm(a.line1) === norm(b.line1) && norm(a.country) === norm(b.country);
}

/** Deterministic check of the case against PayPal's published Seller Protection requirements. */
export function evaluateSellerProtection(cf: CaseFile, merchantCountry = "US"): ProtectionReport {
  const d = cf.dispute;
  const q = PAYPAL_POLICY.quotes;
  const checks: ProtectionCheck[] = [];
  const outbound = cf.shipments.find((s) => s.direction === "OUTBOUND");
  const isInr = d.reason === "MERCHANDISE_OR_SERVICE_NOT_RECEIVED";
  const isUnauth = d.reason === "UNAUTHORISED";
  const cardIssuerInr = isInr && d.dispute_channel === "EXTERNAL";

  const flag = cf.capture?.seller_protection;
  const flagCheck = (strict: boolean): ProtectionCheck | undefined => {
    if (!flag) return undefined;
    const ok = flag.status === "ELIGIBLE" || flag.status === "PARTIALLY_ELIGIBLE";
    const cats = (flag.dispute_categories ?? []).map((c) => c.replace(/_/g, " ").toLowerCase()).join(", ");
    return {
      id: "paypal-flag",
      label: "PayPal's eligibility flag on the payment",
      status: ok ? (strict ? "pass" : "info") : strict ? "fail" : "info",
      detail: `PayPal reports ${flag.status.replace(/_/g, " ").toLowerCase()}${cats ? ` for ${cats}` : ""} (Payments API).`,
      quote: isUnauth ? q.unauthorizedEligible : undefined,
    };
  };

  if (!(isInr || isUnauth) || cardIssuerInr) {
    const why =
      d.reason === "MERCHANDISE_OR_SERVICE_NOT_AS_DESCRIBED"
        ? { detail: "Not-as-described claims are excluded from Seller Protection. The case is decided on the evidence.", quote: q.snadExcluded }
        : cardIssuerInr
          ? { detail: "Item-not-received chargebacks filed with the card issuer are excluded.", quote: q.inrChargebackExcluded }
          : { detail: "Seller Protection covers item-not-received and unauthorized claims. This reason is decided on the evidence.", quote: q.covered };
    checks.push({ id: "coverage", label: "Claim type covered", status: "fail", ...why });
    const fc = flagCheck(false);
    if (fc) checks.push(fc);
    return {
      program: "PayPal Seller Protection (US)",
      applies: false,
      verdict: "NOT_APPLICABLE",
      summary: why.detail,
      checks,
      source: PAYPAL_POLICY.source,
    };
  }

  checks.push({ id: "coverage", label: "Claim type covered", status: "pass", detail: isInr ? "Item not received, filed with PayPal." : "Unauthorized transaction.", quote: q.covered });
  checks.push({ id: "us", label: "Seller account in the US", status: merchantCountry === "US" ? "pass" : "fail", detail: `Merchant primary address: ${merchantCountry}.`, quote: q.usAddress });
  checks.push({ id: "physical", label: "Physical, shippable good", status: "pass", detail: "Leather goods shipped by carrier.", quote: q.physical });
  const fc = flagCheck(isUnauth);
  if (fc) checks.push(fc);

  if (!outbound) {
    checks.push({ id: "shipment", label: "Shipment on record", status: "fail", detail: "No outbound shipment found for this order.", quote: isInr ? q.proofOfDelivery : q.proofOfShipment });
  } else {
    const txnAddress = cf.order?.shipping_address;
    const shippedMatch = addressesMatch(txnAddress, outbound.delivered_to ?? txnAddress);
    checks.push({
      id: "address",
      label: "Shipped to the transaction address",
      status: !txnAddress ? "unknown" : outbound.status === "RETURNED_TO_SENDER" ? "info" : shippedMatch ? "pass" : "fail",
      detail: txnAddress ? `${txnAddress.line1}, ${txnAddress.city} ${txnAddress.postal_code} ${txnAddress.country}` : "Transaction address unavailable.",
      quote: q.shipToAddress,
    });
    checks.push({
      id: "tracking",
      label: "Online, verifiable tracking number",
      status: outbound.tracking_number ? "pass" : "fail",
      detail: `${outbound.carrier} ${outbound.tracking_number}`,
      quote: isInr ? q.proofOfDelivery : q.proofOfShipment,
    });
    if (isInr) {
      const delivered = outbound.status === "DELIVERED" && !!outbound.delivered_at;
      checks.push({
        id: "delivered",
        label: "Carrier shows ‘delivered’ with a date",
        status: delivered ? "pass" : "fail",
        detail: delivered ? `Delivered ${outbound.delivered_at?.slice(0, 10)}${outbound.signature ? `, signed by ${outbound.signature.name}` : ""}.` : `Carrier status: ${outbound.status.replace(/_/g, " ").toLowerCase()}.`,
        quote: q.proofOfDelivery,
      });
      checks.push({ id: "redirect", label: "Not redirected after shipping", status: delivered && addressesMatch(txnAddress, outbound.delivered_to) ? "pass" : delivered ? "fail" : "unknown", detail: delivered ? "Delivery address matches the transaction." : "No delivery to verify.", quote: q.redirected });
    } else {
      const notified = new Date(d.create_time).getTime();
      const shipped = new Date(outbound.shipped_at).getTime();
      checks.push({
        id: "ship-timing",
        label: "Shipped no later than 2 days after notice",
        status: shipped <= notified + 2 * 86400_000 ? "pass" : "fail",
        detail: `Shipped ${outbound.shipped_at.slice(0, 10)}; dispute opened ${d.create_time.slice(0, 10)}.`,
        quote: q.unauthorizedTiming,
      });
    }
    if (cf.order) {
      const days = (new Date(outbound.shipped_at).getTime() - new Date(cf.order.placed_at).getTime()) / 86400_000;
      checks.push({ id: "ship-7", label: "Shipped within 7 days of payment", status: days <= 7 ? "pass" : "info", detail: `Shipped ${Math.max(0, Math.round(days))} day(s) after payment.`, quote: q.shipWithin7 });
    }
  }

  const due = d.seller_response_due_date ? new Date(d.seller_response_due_date).getTime() : undefined;
  checks.push({
    id: "respond",
    label: "Response before PayPal's deadline",
    status: due === undefined ? "unknown" : due > Date.now() ? "pass" : "fail",
    detail: due === undefined ? "No deadline on the dispute." : `Due ${new Date(due).toISOString().slice(0, 16).replace("T", " ")} UTC.`,
    quote: q.respond,
  });

  const failed = checks.filter((c) => c.status === "fail");
  const verdict = failed.length === 0 ? "LIKELY_ELIGIBLE" : failed.some((c) => ["delivered", "address", "tracking", "shipment", "coverage", "us", "paypal-flag"].includes(c.id)) ? "NOT_ELIGIBLE" : "AT_RISK";
  return {
    program: "PayPal Seller Protection (US)",
    applies: true,
    verdict,
    summary:
      verdict === "LIKELY_ELIGIBLE"
        ? "Every published requirement checks out on the records we hold. PayPal makes the final call."
        : verdict === "AT_RISK"
          ? `Eligible on paper, but ${failed.map((c) => c.label.toLowerCase()).join(", ")} needs attention.`
          : `Fails ${failed.map((c) => c.label.toLowerCase()).join(", ")}.`,
    checks,
    source: PAYPAL_POLICY.source,
  };
}
