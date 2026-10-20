# Live PayPal sandbox run (2026-10-20)

Every step below ran against `api-m.sandbox.paypal.com` through Exhibit itself (app in sandbox mode). Credentials live only in `.env.local`.

## Cases

| Case | Dispute | Capture | Agent brief | Action filed by Exhibit | PayPal state |
|---|---|---|---|---|---|
| Megan Hale · item not received · $284 | PP-R-QJO-10193739 | 6KA23344L64978705 | Fight, 80% | `provide-supporting-info` (letter + PDF packet, stored by PayPal) | **RESOLVED** · `RESOLVED_WITH_PAYOUT` / `REPRESENTED_BY_PAYPAL` |
| Daniel Reyes · unauthorized (card) · $420 | PP-R-EGO-10193744 | 2GW87112CH2430330 | Fight, 88–90% | `provide-evidence` (PROOF_OF_FULFILLMENT + UPS tracking + letter + PDF) | UNDER_REVIEW |
| Jordan Kim · returned to sender · $68 | PP-R-KHB-10193747 | 57002361HH0398920 | Refund, 3% | `accept-claim` (REFUND) | UNDER_REVIEW (accepted, settling) |
| Priya Patel · credit not processed · $180 | PP-R-XTI-10193748 | 1P876401S2873814W | Refund, 5% | `accept-claim` (REFUND) | UNDER_REVIEW (accepted, settling) |

On the credit-not-processed chargeback the agent chose `accept-claim` over refund-then-prove: the issuer has already pulled the funds back, so a separate capture refund would pay the buyer twice. Refund-then-prove remains for PayPal-internal claims.

## Endpoints verified live

OAuth 2.0 client credentials · Orders v2 create (PayPal checkout, buyer approval) and capture · Payments v2 GET capture (`seller_protection: ELIGIBLE`) · `process-chargeback` (sandbox) · Disputes list and detail · `provide-evidence` (multipart: evidence JSON + PDF) · `provide-supporting-info` (multipart: notes + PDF) · `accept-claim` (JSON) · `adjudicate` (sandbox, accepted; outcome is asynchronous).

## Learned from the real API (now enforced by the simulator too)

- Chargebacks move OPEN → UNDER_REVIEW (supporting info only) → WAITING_FOR_SELLER_RESPONSE (about 5 minutes) → UNDER_REVIEW after a response.
- Only the evidence types PayPal requested are accepted; several evidences in one call need `item_id`; a multi-evidence payload with `tracking_url` returned a sandbox 500. Exhibit sends one evidence per call with tracking (no URL) and the PDF packet.
- This sandbox business account is not enabled for direct card processing (`PAYEE_NOT_ENABLED_FOR_CARD_PROCESSING`), so seeding uses PayPal checkout with buyer approval. Published test cards are shared across sandbox accounts and can be refused as "already added to another account"; a Luhn-valid `4032…` number works.

## Not tested live

- Webhooks: PayPal delivers only to a public HTTPS URL (no tunnel on this machine). Signature verification is implemented with `verify-webhook-signature`.
- `make-offer` and `send-message`: only exist in the inquiry stage, which `process-chargeback` cannot create, and buyer-side dispute creation needs PayPal partner consent.
