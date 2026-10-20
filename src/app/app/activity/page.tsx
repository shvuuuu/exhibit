import { clsx } from "clsx";
import Link from "next/link";
import { PageHeader } from "@/components/app/PageHeader";
import { listActivity } from "@/lib/db";
import { dateTime } from "@/lib/format";

export const dynamic = "force-dynamic";
export const metadata = { title: "PayPal activity" };

type ApiMeta = { method: string; path: string; status: number; ms: number; debugId?: string; mode: string };

const KIND_LABEL: Record<string, string> = {
  agent: "Agent",
  agent_error: "Agent",
  action: "Action",
  action_error: "Action",
  webhook: "Webhook",
  sandbox: "Sandbox",
  seed: "Seed",
  system: "System",
  settings: "Settings",
};

function endpointOf(path: string) {
  return path
    .replace(/\?.*$/, "")
    .replace(/PP-[A-Z]-[A-Z0-9-]+/g, "{id}")
    .replace(/\/orders\/[^/]+/, "/orders/{id}")
    .replace(/\/captures\/[^/]+/, "/captures/{id}");
}

export default function ActivityPage() {
  const api = listActivity({ kind: "api", limit: 500 });
  const events = listActivity({ limit: 300 }).filter((a) => a.kind !== "api");
  const surface = new Map<string, { count: number; errors: number; ms: number }>();
  for (const a of api) {
    const m = a.meta as ApiMeta;
    const key = `${m.method} ${endpointOf(m.path)}`;
    const cur = surface.get(key) ?? { count: 0, errors: 0, ms: 0 };
    cur.count++;
    cur.ms += m.ms;
    if (m.status >= 400) cur.errors++;
    surface.set(key, cur);
  }
  const endpoints = [...surface.entries()].sort((a, b) => b[1].count - a[1].count);

  return (
    <>
      <PageHeader eyebrow="Audit trail" title="PayPal activity" subtitle="Every PayPal API call Exhibit makes, and every decision and action it takes, in order. Nothing happens off the record." />
      <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] gap-6 px-8 py-6">
        <div className="space-y-6">
          <section className="card">
            <div className="border-b border-line px-5 py-3.5 text-[13px] font-medium">PayPal API surface</div>
            <table className="w-full text-[12.5px]">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wider text-faint">
                  <th className="px-5 py-2 font-medium">Endpoint</th>
                  <th className="py-2 pl-4 text-right font-medium">Calls</th>
                  <th className="py-2 pl-4 text-right font-medium">Avg</th>
                  <th className="px-5 py-2 text-right font-medium">Errors</th>
                </tr>
              </thead>
              <tbody>
                {endpoints.map(([k, v]) => (
                  <tr key={k} className="border-t border-line/70">
                    <td className="num px-5 py-2 text-ink-2">{k}</td>
                    <td className="num py-2 pl-4 text-right">{v.count}</td>
                    <td className="num py-2 pl-4 text-right text-muted">{Math.round(v.ms / v.count)}ms</td>
                    <td className={clsx("num px-5 py-2 text-right", v.errors ? "text-red" : "text-faint")}>{v.errors}</td>
                  </tr>
                ))}
                {!endpoints.length ? (
                  <tr>
                    <td className="px-5 py-4 text-muted">No calls yet.</td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </section>
          <section className="card">
            <div className="border-b border-line px-5 py-3.5 text-[13px] font-medium">Decisions and actions</div>
            <ul className="divide-y divide-line/70">
              {events.map((e) => (
                <li key={e.id} className="flex items-start gap-3 px-5 py-2.5 text-[12.5px]">
                  <span className={clsx("mt-1.5 size-1.5 shrink-0 rounded-full", e.kind.endsWith("error") ? "bg-red" : e.kind === "action" ? "bg-green" : e.kind === "webhook" ? "bg-blue" : "bg-line-strong")} />
                  <span className="w-16 shrink-0 text-muted">{KIND_LABEL[e.kind] ?? e.kind}</span>
                  <span className="min-w-0 flex-1 text-ink-2">
                    {e.message}
                    {e.dispute_id ? (
                      <Link href={`/app/disputes/${e.dispute_id}`} className="num ml-1.5 text-[11.5px] text-blue hover:underline">
                        {e.dispute_id}
                      </Link>
                    ) : null}
                  </span>
                  <span className="shrink-0 text-faint">{dateTime(e.at)}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>
        <section className="card self-start">
          <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
            <span className="text-[13px] font-medium">API log</span>
            <span className="text-[12px] text-muted">latest {api.length}</span>
          </div>
          <div className="scroll-thin max-h-[78vh] overflow-auto">
            <table className="w-full text-[12px]">
              <tbody>
                {api.map((a) => {
                  const m = a.meta as ApiMeta;
                  return (
                    <tr key={a.id} className="border-b border-line/60">
                      <td className="num w-36 py-1.5 pl-5 text-faint">{dateTime(a.at)}</td>
                      <td className="num w-12 py-1.5 text-ink-2">{m.method}</td>
                      <td className="num max-w-0 truncate py-1.5 pr-3 text-ink-2">{m.path}</td>
                      <td className={clsx("num w-12 py-1.5 text-right", m.status < 300 ? "text-green" : "text-red")}>{m.status}</td>
                      <td className="num w-20 py-1.5 pl-3 pr-5 text-right text-faint">{m.ms}ms</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </>
  );
}
