"use client";

import type { ColDef, ICellRendererParams } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import { Check, CircleDashed, Loader2, UploadCloud } from "lucide-react";
import { useMemo, useState } from "react";
import { shortDate, usd } from "@/lib/format";
import { Button } from "../ui/Button";
import { Chip } from "../ui/Chip";
import { exhibitGridTheme } from "./InboxGrid";

export type ProtectionRow = {
  shipmentId: string;
  orderId: string;
  customer: string;
  destination: string;
  carrier: string;
  tracking: string;
  status: string;
  shippedAt: string;
  amount: number;
  onPayPal: boolean;
  disputed: boolean;
};

function OrderCell({ data }: ICellRendererParams<ProtectionRow>) {
  if (!data) return null;
  return (
    <div className="flex h-full flex-col justify-center leading-tight">
      <span className="font-medium">{data.customer}</span>
      <span className="num mt-1 text-[11.5px] text-faint">
        {data.orderId} · {data.destination}
      </span>
    </div>
  );
}

function TrackingCell({ data }: ICellRendererParams<ProtectionRow>) {
  if (!data) return null;
  return (
    <div className="flex h-full flex-col justify-center leading-tight">
      <span>{data.carrier.replace(/_/g, " ")}</span>
      <span className="num mt-1 text-[11.5px] text-muted">{data.tracking}</span>
    </div>
  );
}

function SyncCell({ data }: ICellRendererParams<ProtectionRow>) {
  if (!data) return null;
  return (
    <div className="flex h-full items-center">
      {data.onPayPal ? (
        <span className="inline-flex items-center gap-1.5 text-[12.5px] text-green">
          <Check className="size-3.5" strokeWidth={2.5} /> On PayPal
        </span>
      ) : (
        <span className="inline-flex items-center gap-1.5 text-[12.5px] text-muted">
          <CircleDashed className="size-3.5" /> Missing
        </span>
      )}
    </div>
  );
}

export function ProtectionView({ initial }: { initial: ProtectionRow[] }) {
  const [rows, setRows] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const missing = rows.filter((r) => !r.onPayPal);
  const covered = rows.length - missing.length;
  const pct = rows.length ? Math.round((covered / rows.length) * 100) : 100;

  const cols = useMemo<ColDef<ProtectionRow>[]>(
    () => [
      { headerName: "Order", field: "customer", flex: 1.6, minWidth: 230, cellRenderer: OrderCell },
      { headerName: "Tracking", field: "tracking", flex: 1.4, minWidth: 220, cellRenderer: TrackingCell },
      { headerName: "Carrier status", field: "status", width: 150, cellRenderer: (p: ICellRendererParams<ProtectionRow>) => (p.data ? <div className="flex h-full items-center"><Chip tone={p.data.status === "DELIVERED" ? "green" : p.data.status === "RETURNED_TO_SENDER" ? "red" : "neutral"}>{p.data.status.replace(/_/g, " ").toLowerCase()}</Chip></div> : null) },
      { headerName: "Shipped", field: "shippedAt", width: 110, valueFormatter: (p) => shortDate(p.value) },
      { headerName: "Amount", field: "amount", width: 110, cellClass: "num", valueFormatter: (p) => usd(p.value) },
      { headerName: "PayPal tracking", field: "onPayPal", width: 150, cellRenderer: SyncCell, sort: "asc" },
    ],
    [],
  );

  const sync = async () => {
    setBusy(true);
    try {
      const res = await fetch("/api/protection", { method: "POST", body: "{}" }).then((r) => r.json());
      const okIds = new Set<string>(res.results.filter((r: { ok: boolean }) => r.ok).map((r: { shipment_id: string }) => r.shipment_id));
      setRows((prev) => prev.map((r) => (okIds.has(r.shipmentId) ? { ...r, onPayPal: true } : r)));
      setNote(`${okIds.size} shipment${okIds.size === 1 ? "" : "s"} sent to PayPal with POST /v2/checkout/orders/{id}/track`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6 px-8 py-6">
      <div className="grid grid-cols-[1.3fr_1fr_1fr] gap-4">
        <div className="card flex items-center gap-6 px-6 py-5">
          <div className="relative size-[86px] shrink-0">
            <svg viewBox="0 0 36 36" className="size-full -rotate-90">
              <circle cx="18" cy="18" r="15.5" fill="none" stroke="var(--sunken)" strokeWidth="3.4" />
              <circle cx="18" cy="18" r="15.5" fill="none" stroke={pct === 100 ? "var(--green)" : "var(--ink)"} strokeWidth="3.4" strokeLinecap="round" strokeDasharray={`${(pct / 100) * 97.4} 97.4`} />
            </svg>
            <span className="num absolute inset-0 flex items-center justify-center text-[19px]">{pct}%</span>
          </div>
          <div>
            <div className="text-[12px] text-muted">Shipments with tracking on PayPal</div>
            <div className="mt-1 text-[14px] leading-snug text-ink-2">
              Tracking sent to PayPal is on record the moment an item-not-received claim arrives. Shipments PayPal never saw start that fight from zero.
            </div>
          </div>
        </div>
        <div className="card px-5 py-5">
          <div className="text-[12px] text-muted">Missing from PayPal</div>
          <div className="num mt-1.5 text-[26px] leading-none">{missing.length}</div>
          <div className="mt-2 text-[12px] text-faint">{usd(missing.reduce((a, r) => a + r.amount, 0))} in orders without tracking</div>
        </div>
        <div className="card flex flex-col justify-between px-5 py-5">
          <div className="text-[12px] text-muted">Close the gap</div>
          <Button variant="primary" disabled={busy || !missing.length} onClick={sync} className="mt-3">
            {busy ? <Loader2 className="size-4 animate-spin" /> : <UploadCloud className="size-4" />}
            {missing.length ? `Push ${missing.length} to PayPal` : "Everything is synced"}
          </Button>
          <div className="mt-2 text-[11.5px] text-faint">{note ?? "Orders v2 tracking API"}</div>
        </div>
      </div>
      <div className="card overflow-hidden ag-theme-exhibit">
        <AgGridReact<ProtectionRow> theme={exhibitGridTheme} rowData={rows} columnDefs={cols} domLayout="autoHeight" getRowId={(p) => p.data.shipmentId} suppressCellFocus defaultColDef={{ suppressMovable: true }} rowHeight={58} />
      </div>
    </div>
  );
}
