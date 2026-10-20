/** Human label for an evidence ref ("shipment:SHP-10482" → "Tracking SHP-10482"). Safe on client and server. */
export function refLabel(ref: string) {
  const [ns, ...rest] = ref.split(":");
  const id = rest.join(":");
  if (ns === "paypal") return rest[0] === "seller-protection" ? "Seller Protection check" : rest[0] === "message" ? "Buyer's PayPal message" : "PayPal dispute";
  const names: Record<string, string> = {
    order: "Order",
    listing: "Listing",
    shipment: "Tracking",
    customer: "Customer history",
    msg: "Message",
    conversation: "Conversation",
    risk: "Risk signals",
    policy: "Policy",
  };
  if (ns === "customer") return names.customer;
  if (ns === "policy") return `${id[0]?.toUpperCase()}${id.slice(1)} policy`;
  return `${names[ns] ?? ns} ${id}`;
}
