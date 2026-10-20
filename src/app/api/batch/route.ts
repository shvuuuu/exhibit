import { runAgent } from "@/lib/agent/run";
import { cachedDisputes, latestBriefs } from "@/lib/disputes";

/** Runs Exhibit on every open dispute that has no brief yet, two at a time, in the background. */
export async function POST() {
  const briefs = latestBriefs();
  const todo = cachedDisputes().filter((d) => d.status !== "RESOLVED" && !briefs.has(d.dispute_id)).map((d) => d.dispute_id);
  void (async () => {
    for (let i = 0; i < todo.length; i += 2) await Promise.all(todo.slice(i, i + 2).map((id) => runAgent(id, undefined, { trigger: "batch" })));
  })();
  return Response.json({ queued: todo });
}
