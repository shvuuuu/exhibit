import { adoptSandboxOrder, finalizeSandboxSeeds, sandboxSeeds, startSandboxSeeds } from "@/lib/seed";
import { syncDisputes } from "@/lib/disputes";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function GET() {
  return Response.json({ seeds: sandboxSeeds() });
}

/**
 * Sandbox seeding in two steps: `start` creates one PayPal order per scenario (captured at once on
 * card-enabled accounts, otherwise left for the buyer to approve); `finalize` captures approved
 * orders and opens their chargebacks. `adopt` registers an order created elsewhere.
 */
export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { op?: "start" | "finalize" | "adopt"; keys?: string[]; key?: string; order_id?: string; dispute_id?: string };
  try {
    if (body.op === "adopt") {
      if (!body.key || !body.order_id) return Response.json({ error: "key and order_id are required" }, { status: 400 });
      adoptSandboxOrder(body.key, body.order_id, body.dispute_id);
      const seeds = await finalizeSandboxSeeds();
      return Response.json({ seeds });
    }
    const seeds = body.op === "finalize" ? await finalizeSandboxSeeds() : await startSandboxSeeds(body.keys);
    // New chargebacks can take a moment to appear in the list; a sync now picks up whatever is ready.
    await syncDisputes().catch(() => undefined);
    return Response.json({ seeds });
  } catch (e) {
    return Response.json({ error: e instanceof Error ? e.message : String(e) }, { status: 400 });
  }
}
