export type Address = {
  name: string;
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  postal_code: string;
  country: string; // ISO-3166 alpha-2
};

export type Product = {
  sku: string;
  name: string;
  price: number;
  description: string;
  material: string;
  dimensions: string;
  color: string;
  listing_notes: string[];
  photos: { caption: string; tone: string }[];
};

export type OrderItem = { sku: string; name: string; qty: number; unit_price: number };

export type Order = {
  id: string;
  placed_at: string;
  currency: string;
  customer_email: string;
  items: OrderItem[];
  subtotal: number;
  shipping_cost: number;
  tax: number;
  total: number;
  shipping_address: Address;
  billing_address?: Address;
  shipping_method: string;
  paypal: { order_id: string; capture_id: string; invoice_id: string; funding: "PAYPAL" | "CARD" };
  checkout: { ip: string; user_agent: string; accepted_terms_at: string; policies_version: string };
  shipment_ids: string[];
  refunds?: { id: string; amount: number; at: string }[];
  notes?: string;
};

export type ShipmentEvent = { at: string; location: string; description: string; code: "LABEL" | "PICKUP" | "TRANSIT" | "OUT_FOR_DELIVERY" | "DELIVERED" | "EXCEPTION" | "RETURNED" };

export type Shipment = {
  id: string;
  order_id: string;
  direction: "OUTBOUND" | "RETURN";
  carrier: "UPS" | "USPS" | "FEDEX" | "DHL" | "DHL_DEUTSCHE_POST" | "ROYAL_MAIL";
  service: string;
  tracking_number: string;
  tracking_url: string;
  shipped_at: string;
  delivered_at?: string;
  status: "IN_TRANSIT" | "DELIVERED" | "RETURNED_TO_SENDER" | "EXCEPTION";
  delivered_to?: Address;
  signature?: { name: string; at: string };
  delivery_photo?: string;
  qc_photo?: string;
  events: ShipmentEvent[];
  pushed_to_paypal: boolean;
};

export type Customer = {
  email: string;
  name: string;
  country: string;
  first_order_at: string;
  order_ids: string[];
  lifetime_value: number;
  prior_disputes: number;
  notes?: string;
};

export type SupportMessage = {
  id: string;
  at: string;
  from: "customer" | "merchant";
  channel: "email" | "chat";
  subject?: string;
  body: string;
  language: string;
};

export type Conversation = { order_id: string; messages: SupportMessage[] };

export type RiskSignals = {
  order_id: string;
  avs_result?: "Y" | "A" | "Z" | "N" | "U";
  cvv_result?: "M" | "N" | "U";
  three_ds?: "AUTHENTICATED" | "ATTEMPTED" | "NOT_ENROLLED" | "NONE";
  ip: { address: string; city: string; region?: string; country: string };
  ip_to_shipping_km: number;
  device: { id: string; seen_before: boolean; first_seen: string };
  email_age_days: number;
  orders_last_24h: number;
};

export type Policy = { id: "returns" | "shipping" | "terms"; title: string; url: string; version: string; body: string; shown_at_checkout: boolean };

export type Merchant = {
  name: string;
  legal_name: string;
  email: string;
  website: string;
  address: Address;
  support_hours: string;
};
