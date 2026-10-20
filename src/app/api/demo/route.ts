import { runAgent } from "@/lib/agent/run";
import { paypalMode } from "@/lib/config";
import { refreshDispute } from "@/lib/disputes";
import { seedDemo, simulateIncomingDispute } from "@/lib/seed";

/** Demo-mode controls: reset the merchant, or have a new dispute arrive the way a webhook would deliver it. */
export async function POST(req: Request) {
  if (paypalMode() !== "demo") return Response.json({ error: "Demo controls are only available in demo mode." }, { status: 400 });
  const { op } = (await req.json()) as { op: "reset" | "incoming" };
  if (op === "reset") {
    seedDemo();
    return Response.json({ ok: true });
  }
  if (op === "incoming") {
    const d = simulateIncomingDispute();
    if (!d) return Response.json({ error: "no template" }, { status: 500 });
    await refreshDispute(d.dispute_id);
    void runAgent(d.dispute_id, undefined, { trigger: "webhook" });
    return Response.json({ ok: true, dispute_id: d.dispute_id });
  }
  return Response.json({ error: "unknown op" }, { status: 400 });
}
