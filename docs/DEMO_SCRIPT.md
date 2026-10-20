# Demo video v2: script and voiceover

- Render: `docs/exhibit-demo-v2.mp4`, 1920×1080, 2:19.5, captions synced to the voice.
- Voice: Kokoro-82M `af_heart`, generated locally with `npx hyperframes tts` (Apache-2.0 model; no credits, no attribution requirement).
- Source project: `~/Developer/exhibit-video/exhibit-demo-v2` (`timeline.json` → `tools/build_v2.py` → `index.html`).
- Footage: scenes 4–6 are a live run on a real PayPal sandbox chargeback (PP-R-EGO-10193744, chipped "PayPal Sandbox · live API"); scenes 7–10 use the demo merchant on the PayPal simulator (chipped "Demo merchant · PayPal simulator"). Speed-ups are labelled on screen.

| Time | Scene | Voiceover |
|---|---|---|
| 0:00.7–0:04.4 | Cold open (title) | Every day, small merchants lose PayPal disputes they should have won. |
| 0:05.6–0:23.8 | Problem | Mastercard expected two hundred and sixty-one million chargebacks worldwide in 2025. The evidence usually exists. A signed delivery scan, a policy the buyer accepted. But it's scattered across PayPal, the store, the carrier and the inbox, and the deadline arrives first. |
| 0:25.0–0:33.6 | Meet Exhibit | This is Exhibit. An AI agent that investigates every PayPal dispute, decides what to do, and files the response, with evidence. |
| 0:34.6–0:54.4 | Live investigation · real PayPal sandbox chargeback | Here's a real chargeback, live in PayPal's sandbox. Daniel's card issuer says a four hundred and twenty dollar briefcase was unauthorized. One click, and Exhibit pulls the case from PayPal's Disputes API, then the order, the delivery scans, the checkout signals, and PayPal's own Seller Protection flag. |
| 0:54.9–1:08.8 | The call (sandbox brief) | About thirty seconds later, it makes the call. Fight. The card passed three-D Secure, the briefcase was signed for at his address, and he wrote to the store the next day to say he loved it. Every reason links back to a real record. |
| 1:09.3–1:20.1 | Evidence packet (sandbox case) | It assembles a reviewer-ready evidence packet. A cover letter and labelled exhibits, rendered from the merchant's own data. The AI chooses the evidence. It can't invent it. |
| 1:20.6–1:30.0 | File with PayPal (demo merchant · simulator) | One click files it with PayPal. The tracking number, the response and the PDF, in a single call. And when PayPal rules for the merchant, the case is won. |
| 1:30.9–1:43.4 | Honest calls: refund, German buyer (demo) | But Exhibit doesn't fight everything. This wallet really did come back to the store, so it refunds and saves the fees. And when a German buyer's parcel is waiting in her pickup locker, it answers her in German. |
| 1:44.3–1:51.0 | Webhook autonomy (demo) | New disputes arrive on PayPal's webhook, and Exhibit investigates them before anyone opens the inbox. |
| 1:56.1–2:04.3 | Protection · Autopilot · Audit (demo) | It closes tracking gaps before claims happen, acts on its own only within the limits you set, and logs every PayPal API call. |
| 2:05.6–2:11.9 | Trust | Cited, never invented. PayPal's rulebook, word for word. And only the actions PayPal allows. |
| 2:13.6–2:16.4 | Close | Exhibit. Every dispute, answered with evidence. |

Words: 316. Voiceover: 121.1s of 139.5s.
