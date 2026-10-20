import { notFound } from "next/navigation";
import { CaseWorkspace } from "@/components/app/case/CaseWorkspace";
import { evaluateSellerProtection } from "@/lib/agent/playbook";
import { isRunning } from "@/lib/agent/run";
import { aiProvider, paypalMode } from "@/lib/config";
import { listActivity } from "@/lib/db";
import { actionsFor, cachedDispute, caseFile, latestRun, refreshDispute } from "@/lib/disputes";
import { PayPalError } from "@/lib/paypal/client";
import { store } from "@/lib/store/repo";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return { title: id };
}

export default async function DisputePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let d = cachedDispute(id);
  try {
    d = await refreshDispute(id);
  } catch (e) {
    if (!d) {
      if (e instanceof PayPalError && e.status === 404) notFound();
      throw e;
    }
  }
  const cf = caseFile(d);
  const run = latestRun(id) ?? null;
  return (
    <CaseWorkspace
      initial={{
        cf,
        run: run ? { id: run.id, status: run.status, provider: run.provider, model: run.model, brief: run.brief, events: run.events as never } : null,
        running: isRunning(id),
        actions: actionsFor(id) as never,
        api: listActivity({ disputeId: id, kind: "api", limit: 60 }) as never,
      }}
      protection={evaluateSellerProtection(cf, store.merchant().address.country)}
      mode={paypalMode()}
      provider={aiProvider()}
    />
  );
}
