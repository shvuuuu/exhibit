// Shapes follow PayPal's Disputes v1 OpenAPI spec (docs/sources/paypal-disputes-v1-openapi.json).
// Only the fields Exhibit reads are typed; everything else passes through untouched.

export type Money = { currency_code: string; value: string };

export type DisputeReason =
  | "MERCHANDISE_OR_SERVICE_NOT_RECEIVED"
  | "MERCHANDISE_OR_SERVICE_NOT_AS_DESCRIBED"
  | "UNAUTHORISED"
  | "CREDIT_NOT_PROCESSED"
  | "DUPLICATE_TRANSACTION"
  | "INCORRECT_AMOUNT"
  | "PAYMENT_BY_OTHER_MEANS"
  | "CANCELED_RECURRING_BILLING"
  | "PROBLEM_WITH_REMITTANCE"
  | "OTHER";

export type DisputeStatus =
  | "OPEN"
  | "WAITING_FOR_BUYER_RESPONSE"
  | "WAITING_FOR_SELLER_RESPONSE"
  | "UNDER_REVIEW"
  | "RESOLVED"
  | "OTHER";

export type DisputeStage = "INQUIRY" | "CHARGEBACK" | "PRE_ARBITRATION" | "ARBITRATION";

export type DisputeChannel = "INTERNAL" | "EXTERNAL" | "ALERT";

export type OfferType = "REFUND" | "REFUND_WITH_RETURN" | "REFUND_WITH_REPLACEMENT" | "REPLACEMENT_WITHOUT_REFUND";

export type AcceptClaimType = "REFUND" | "REFUND_WITH_RETURN" | "PARTIAL_REFUND" | "REFUND_WITH_RETURN_SHIPMENT_LABEL";

/** The evidence types Exhibit files. The API accepts more; these cover physical-goods merchants. */
export const EVIDENCE_TYPES = [
  "PROOF_OF_FULFILLMENT",
  "PROOF_OF_DELIVERY_SIGNATURE",
  "PROOF_OF_REFUND",
  "PROOF_OF_RETURN",
  "ITEM_DESCRIPTION",
  "RETURN_POLICY",
  "DETAILS_OF_PURCHASE",
  "PROOF_OF_RESHIPMENT",
  "ADDITIONAL_PROOF_OF_SHIPMENT",
  "MERCHANT_RESPONSE",
  "OTHER",
] as const;
export type EvidenceType = (typeof EVIDENCE_TYPES)[number];

export type Link = { href: string; rel: string; method?: string };

export type TrackingInfo = { carrier_name: string; carrier_name_other?: string; tracking_url?: string; tracking_number: string };

export type Evidence = {
  evidence_type: string;
  item_id?: string;
  evidence_info?: { tracking_info?: TrackingInfo[]; refund_ids?: string[] };
  documents?: { name: string; url?: string }[];
  notes?: string;
  source?: "REQUESTED_FROM_BUYER" | "REQUESTED_FROM_SELLER" | "SUBMITTED_BY_BUYER" | "SUBMITTED_BY_SELLER" | "SUBMITTED_BY_PARTNER";
  date?: string;
};

export type DisputeMessage = { posted_by: "BUYER" | "SELLER" | "ARBITER"; time_posted: string; content: string };

export type DisputedTransaction = {
  buyer_transaction_id?: string;
  seller_transaction_id: string;
  create_time?: string;
  transaction_status?: string;
  gross_amount?: Money;
  invoice_number?: string;
  custom?: string;
  buyer?: { name?: string; email?: string };
  seller?: { email?: string; merchant_id?: string; name?: string };
  items?: { item_id?: string; item_name?: string; item_description?: string; item_quantity?: string; reason?: string }[];
};

export type Dispute = {
  dispute_id: string;
  create_time: string;
  update_time: string;
  disputed_transactions: DisputedTransaction[];
  reason: DisputeReason;
  status: DisputeStatus;
  dispute_amount: Money;
  external_reason_code?: string;
  dispute_outcome?: { outcome_code: string; amount_refunded?: Money };
  dispute_life_cycle_stage: DisputeStage;
  dispute_channel?: DisputeChannel;
  messages?: DisputeMessage[];
  extensions?: {
    merchant_contacted?: boolean;
    merchant_contacted_outcome?: string;
    buyer_contacted_channel?: string;
    merchandize_dispute_properties?: { issue_type?: string; product_details?: { product_received?: string; sub_reasons?: string[] } };
  };
  evidences?: Evidence[];
  buyer_response_due_date?: string;
  seller_response_due_date?: string;
  offer?: { buyer_requested_amount?: Money; seller_offered_amount?: Money; offer_type?: OfferType };
  refund_details?: { allowed_refund_amount?: Money };
  allowed_response_options?: {
    acknowledge_return_item?: unknown;
    accept_claim?: { accept_claim_types?: AcceptClaimType[] };
    make_offer?: { offer_types?: OfferType[] };
  };
  links: Link[];
};

export type DisputeSummary = Pick<
  Dispute,
  | "dispute_id"
  | "create_time"
  | "update_time"
  | "reason"
  | "status"
  | "dispute_amount"
  | "dispute_life_cycle_stage"
  | "dispute_channel"
  | "seller_response_due_date"
  | "buyer_response_due_date"
  | "links"
> & { dispute_state?: string };

export type PayPalErrorBody = {
  name?: string;
  message?: string;
  debug_id?: string;
  details?: { issue?: string; description?: string; field?: string }[];
  error?: string;
  error_description?: string;
};

export const REASON_LABEL: Record<DisputeReason, string> = {
  MERCHANDISE_OR_SERVICE_NOT_RECEIVED: "Item not received",
  MERCHANDISE_OR_SERVICE_NOT_AS_DESCRIBED: "Not as described",
  UNAUTHORISED: "Unauthorized",
  CREDIT_NOT_PROCESSED: "Credit not processed",
  DUPLICATE_TRANSACTION: "Duplicate charge",
  INCORRECT_AMOUNT: "Incorrect amount",
  PAYMENT_BY_OTHER_MEANS: "Paid another way",
  CANCELED_RECURRING_BILLING: "Canceled subscription",
  PROBLEM_WITH_REMITTANCE: "Remittance problem",
  OTHER: "Other",
};

export const STAGE_LABEL: Record<DisputeStage, string> = {
  INQUIRY: "Inquiry",
  CHARGEBACK: "Chargeback",
  PRE_ARBITRATION: "Pre-arbitration",
  ARBITRATION: "Arbitration",
};

export const STATUS_LABEL: Record<DisputeStatus, string> = {
  OPEN: "Open",
  WAITING_FOR_BUYER_RESPONSE: "Waiting on buyer",
  WAITING_FOR_SELLER_RESPONSE: "Needs response",
  UNDER_REVIEW: "PayPal reviewing",
  RESOLVED: "Resolved",
  OTHER: "Other",
};
