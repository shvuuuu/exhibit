import { syncTrackingToPayPal } from "@/lib/actions";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { shipmentIds?: string[] };
  const results = await syncTrackingToPayPal(body.shipmentIds);
  return Response.json({ results });
}
