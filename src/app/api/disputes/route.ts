import { disputesForInbox, latestBriefs } from "@/lib/disputes";
import { dashboardStats, inboxRows } from "@/lib/inbox";

export const dynamic = "force-dynamic";

export async function GET() {
  const disputes = await disputesForInbox();
  const rows = inboxRows(disputes, latestBriefs());
    return Response.json({ rows, stats: dashboardStats(rows) });
}
