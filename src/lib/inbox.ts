import "server-only";
import { expectedRecovery, type CaseBrief } from "./agent/brief";
import type { Dispute } from "./paypal/types";
import { REASON_LABEL, STAGE_LABEL, STATUS_LABEL } from "./paypal/types";
import { store } from "./store/repo";

export type InboxRow = {
  id: string;
  buyer: string;
  item: string;
  reason: string;
  reasonCode: Dispute["reason"];
  stage: string;
  status: string;
  statusCode: Dispute["status"];
  amount: number;
  currency: string;
  createdAt: string;
  dueAt: string | null;
  hoursLeft: number | null;
  decision: CaseBrief["decision"] | null;
  likelihood: number | null;
  headline: string | null;
  expected: number | null;
  outcome: string | null;
  title: string | null;
};

export function inboxRows(disputes: Dispute[], briefs: Map<string, CaseBrief>): InboxRow[] {
  return disputes.map((d) => {
    const t = d.disputed_transactions[0];
    const brief = briefs.get(d.dispute_id) ?? null;
    const amount = Number(d.dispute_amount.value);
    const due = d.status === "RESOLVED" ? null : (d.seller_response_due_date ?? null);
    return {
      id: d.dispute_id,
      buyer: t?.buyer?.name ?? "Unknown buyer",
      item: t?.items?.map((i) => i.item_name).filter(Boolean).join(", ") || store.orderForDispute(d)?.items.map((i) => i.name).join(", ") || "—",
      reason: REASON_LABEL[d.reason] ?? d.reason,
      reasonCode: d.reason,
      stage: STAGE_LABEL[d.dispute_life_cycle_stage] ?? d.dispute_life_cycle_stage,
      status: STATUS_LABEL[d.status] ?? d.status,
      statusCode: d.status,
      amount,
      currency: d.dispute_amount.currency_code,
      createdAt: d.create_time,
      dueAt: due,
      hoursLeft: due ? Math.round((new Date(due).getTime() - Date.now()) / 3600_000) : null,
      decision: brief?.decision ?? null,
      likelihood: brief?.win_likelihood ?? null,
      headline: brief?.headline ?? null,
      expected: brief ? expectedRecovery(brief, amount) : null,
      outcome: d.dispute_outcome?.outcome_code ?? null,
      title: store.scenario(d.dispute_id)?.title ?? null,
    };
  });
}

export function dashboardStats(rows: InboxRow[]) {
  const open = rows.filter((r) => r.statusCode !== "RESOLVED");
  const history = store.history();
  const resolvedNow = rows.filter((r) => r.statusCode === "RESOLVED");
  const won = history.filter((h) => h.outcome === "RESOLVED_SELLER_FAVOUR").length + resolvedNow.filter((r) => r.outcome === "RESOLVED_SELLER_FAVOUR").length;
  const decided = history.length + resolvedNow.length;
  const recovered =
    history.filter((h) => h.outcome === "RESOLVED_SELLER_FAVOUR").reduce((a, h) => a + h.amount, 0) +
    resolvedNow.filter((r) => r.outcome === "RESOLVED_SELLER_FAVOUR").reduce((a, r) => a + r.amount, 0);
  return {
    openCount: open.length,
    atRisk: open.reduce((a, r) => a + r.amount, 0),
    dueSoon: open.filter((r) => r.hoursLeft !== null && r.hoursLeft <= 72).length,
    needsResponse: open.filter((r) => r.statusCode === "WAITING_FOR_SELLER_RESPONSE").length,
    analyzed: open.filter((r) => r.decision).length,
    expected: open.reduce((a, r) => a + (r.expected ?? 0), 0),
    recovered,
    winRate: decided ? Math.round((won / decided) * 100) : null,
    decided,
  };
}
