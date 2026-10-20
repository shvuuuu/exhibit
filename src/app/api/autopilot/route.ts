import { getAutopilot, setAutopilot, type AutopilotSettings } from "@/lib/autopilot";
import { logActivity } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json(getAutopilot());
}

export async function PUT(req: Request) {
  const s = (await req.json()) as AutopilotSettings;
  setAutopilot(s);
  logActivity("settings", `Autopilot ${s.enabled ? "on" : "off"}`);
  return Response.json(getAutopilot());
}
