import { AutopilotView } from "@/components/app/AutopilotView";
import { PageHeader } from "@/components/app/PageHeader";
import { getAutopilot } from "@/lib/autopilot";
import { cachedDisputes, latestBriefs } from "@/lib/disputes";
import { REASON_LABEL } from "@/lib/paypal/types";

export const dynamic = "force-dynamic";
export const metadata = { title: "Autopilot" };

export default function AutopilotPage() {
  const briefs = latestBriefs();
  const cases = cachedDisputes()
    .filter((d) => d.status !== "RESOLVED" && briefs.has(d.dispute_id))
    .map((d) => ({ id: d.dispute_id, buyer: d.disputed_transactions[0]?.buyer?.name ?? "Buyer", reason: REASON_LABEL[d.reason], amount: Number(d.dispute_amount.value), brief: briefs.get(d.dispute_id)! }));
  return (
    <>
      <PageHeader eyebrow="Rules, not vibes" title="Autopilot" subtitle="Decide which responses Exhibit may send on its own. It never acts outside these limits, and you can see exactly what it would do before you switch it on." />
      <AutopilotView initial={getAutopilot()} cases={cases} />
    </>
  );
}
