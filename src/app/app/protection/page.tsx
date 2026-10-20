import { PageHeader } from "@/components/app/PageHeader";
import { ProtectionView, type ProtectionRow } from "@/components/app/ProtectionView";
import { store } from "@/lib/store/repo";

export const dynamic = "force-dynamic";
export const metadata = { title: "Protection" };

export default function ProtectionPage() {
  const rows: ProtectionRow[] = store
    .shipments()
    .filter((s) => s.direction === "OUTBOUND")
    .map((s) => {
      const o = store.order(s.order_id);
      const a = o?.shipping_address;
      return {
        shipmentId: s.id,
        orderId: s.order_id,
        customer: a?.name ?? o?.customer_email ?? "—",
        destination: a ? `${a.city}, ${a.country}` : "—",
        carrier: s.carrier,
        tracking: s.tracking_number,
        status: s.status,
        shippedAt: s.shipped_at,
        amount: o?.total ?? 0,
        onPayPal: s.pushed_to_paypal,
        disputed: false,
      };
    })
    .sort((a, b) => b.shippedAt.localeCompare(a.shippedAt));
  return (
    <>
      <PageHeader
        eyebrow="Prevention"
        title="Protection"
        subtitle="Disputes are won before they start. Exhibit makes sure every shipment's tracking reaches PayPal, so it is already on record when an item-not-received claim arrives."
      />
      <ProtectionView initial={rows} />
    </>
  );
}
