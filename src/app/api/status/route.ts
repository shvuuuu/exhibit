import { AI_MODEL, aiProvider, paypalMode } from "@/lib/config";
import { paypal } from "@/lib/paypal/client";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const check = new URL(req.url).searchParams.get("check") === "1";
  let paypalOk: boolean | null = null;
  let paypalError: string | null = null;
  if (check) {
    try {
      await paypal().listDisputes({ page_size: 1 });
      paypalOk = true;
    } catch (e) {
      paypalOk = false;
      paypalError = e instanceof Error ? e.message : String(e);
    }
  }
  return Response.json({ paypalMode: paypalMode(), aiProvider: aiProvider(), model: AI_MODEL, paypalOk, paypalError });
}
