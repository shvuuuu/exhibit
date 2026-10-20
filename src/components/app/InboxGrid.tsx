"use client";

import { AllCommunityModule, ModuleRegistry, themeQuartz, type ColDef, type ICellRendererParams } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import type { InboxRow } from "@/lib/inbox";
import { dueLabel, usd } from "@/lib/format";
import { Chip, DecisionChip, outcomeMeta } from "../ui/Chip";
import { Meter } from "../ui/Meter";

ModuleRegistry.registerModules([AllCommunityModule]);

export const exhibitGridTheme = themeQuartz.withParams({
  fontFamily: "var(--font-geist)",
  fontSize: 13,
  dataFontSize: 13,
  headerFontSize: 11,
  headerFontWeight: 500,
  headerTextColor: "#737373",
  headerBackgroundColor: "#ffffff",
  backgroundColor: "#ffffff",
  foregroundColor: "#0a0a0a",
  borderColor: "#ebebeb",
  rowBorder: { color: "#f0f0f0" },
  columnBorder: false,
  headerColumnBorder: false,
  wrapperBorder: false,
  wrapperBorderRadius: 12,
  rowHoverColor: "#fafafa",
  selectedRowBackgroundColor: "#f5f5f5",
  accentColor: "#0a0a0a",
  cellHorizontalPadding: 16,
  spacing: 6,
  headerHeight: 38,
  rowHeight: 66,
});

// Reasons read as plain labels; only fraud claims get color.
const REASON_TONE: Record<string, "neutral" | "red"> = {
  UNAUTHORISED: "red",
};

function CaseCell({ data }: ICellRendererParams<InboxRow>) {
  if (!data) return null;
  return (
    <div className="flex h-full flex-col justify-center leading-tight">
      <div className="flex items-center gap-2">
        <span className="font-medium">{data.buyer}</span>
        <span className="num text-[11.5px] text-faint">{data.id}</span>
      </div>
      <div className="mt-1 truncate text-[12.5px] text-muted">{data.headline ?? data.title ?? data.item}</div>
    </div>
  );
}

function ReasonCell({ data }: ICellRendererParams<InboxRow>) {
  if (!data) return null;
  return (
    <div className="flex h-full flex-col items-start justify-center gap-1 leading-tight">
      <Chip tone={REASON_TONE[data.reasonCode] ?? "neutral"}>{data.reason}</Chip>
      <span className="pl-0.5 text-[11.5px] text-muted">{data.stage}</span>
    </div>
  );
}

function AmountCell({ data }: ICellRendererParams<InboxRow>) {
  if (!data) return null;
  return <div className="num flex h-full items-center justify-end text-[13.5px]">{usd(data.amount)}</div>;
}

function DueCell({ data }: ICellRendererParams<InboxRow>) {
  if (!data) return null;
  const h = data.hoursLeft;
  const tone = h === null ? "text-faint" : h < 48 ? "text-red" : h < 120 ? "text-ink" : "text-muted";
  return (
    <div className={`flex h-full items-center gap-1.5 text-[13px] ${tone}`}>
      {h !== null && h < 48 ? <span className="size-1.5 rounded-full bg-red pulse-dot" /> : null}
      {dueLabel(h)}
    </div>
  );
}

function CallCell({ data }: ICellRendererParams<InboxRow>) {
  if (!data) return null;
  return (
    <div className="flex h-full items-center gap-3">
      <DecisionChip decision={data.decision} />
      {data.likelihood !== null ? <Meter value={data.likelihood} /> : null}
    </div>
  );
}

function StatusCell({ data }: ICellRendererParams<InboxRow>) {
  if (!data) return null;
  const o = outcomeMeta(data.outcome);
  if (o) return <div className="flex h-full items-center"><Chip tone={o.tone} dot>{o.label}</Chip></div>;
  const tone = data.statusCode === "WAITING_FOR_SELLER_RESPONSE" ? "text-ink" : "text-muted";
  return <div className={`flex h-full items-center text-[13px] ${tone}`}>{data.status}</div>;
}

export function InboxGrid({ rows }: { rows: InboxRow[] }) {
  const router = useRouter();
  const cols = useMemo<ColDef<InboxRow>[]>(
    () => [
      // valueGetters fold in every field a renderer reads, so AG Grid refreshes the cell when any of them changes.
      { headerName: "Case", colId: "case", valueGetter: (p) => `${p.data?.buyer}|${p.data?.headline ?? p.data?.title ?? ""}`, flex: 2.6, minWidth: 280, cellRenderer: CaseCell, sortable: true },
      { headerName: "Reason", field: "reason", flex: 1.2, minWidth: 170, cellRenderer: ReasonCell },
      { headerName: "Amount", field: "amount", width: 120, cellRenderer: AmountCell, headerClass: "ag-right-aligned-header", sortable: true },
      { headerName: "Due", field: "hoursLeft", width: 120, cellRenderer: DueCell, sortable: true, sort: "asc", comparator: (a, b) => (a ?? 1e9) - (b ?? 1e9) },
      { headerName: "Exhibit's call", colId: "call", valueGetter: (p) => (p.data?.decision ? `${p.data.decision}|${p.data.likelihood}` : ""), flex: 1.2, minWidth: 190, cellRenderer: CallCell, sortable: true, comparator: (_a, _b, na, nb) => (na.data?.likelihood ?? -1) - (nb.data?.likelihood ?? -1) },
      { headerName: "Status", colId: "status", valueGetter: (p) => `${p.data?.status}|${p.data?.outcome ?? ""}`, flex: 1, minWidth: 150, cellRenderer: StatusCell },
    ],
    [],
  );
  return (
    <div className="card overflow-hidden ag-theme-exhibit">
      <AgGridReact<InboxRow>
        theme={exhibitGridTheme}
        rowData={rows}
        columnDefs={cols}
        domLayout="autoHeight"
        getRowId={(p) => p.data.id}
        suppressCellFocus
        animateRows
        onRowClicked={(e) => e.data && router.push(`/app/disputes/${e.data.id}`)}
        defaultColDef={{ resizable: false, sortable: false, suppressMovable: true }}
      />
    </div>
  );
}
