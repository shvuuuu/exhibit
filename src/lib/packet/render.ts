import "server-only";
import { createElement } from "react";
import { renderToBuffer } from "@react-pdf/renderer";
import type { CaseBrief } from "../agent/brief";
import type { CaseFile } from "../disputes";
import { resolveRef } from "../evidence";
import { store } from "../store/repo";
import { PacketDocument, type PacketExhibit } from "./Packet";

export function packetExhibits(cf: CaseFile, brief: CaseBrief): PacketExhibit[] {
  return brief.exhibits
    .map((e) => ({ label: e.label, title: e.title, why: e.why, resolved: resolveRef(e.ref, cf) }))
    .filter((e): e is PacketExhibit => !!e.resolved)
    .sort((a, b) => a.label.localeCompare(b.label));
}

export async function renderPacket(cf: CaseFile, brief: CaseBrief, letter = brief.response_letter): Promise<Buffer> {
  const exhibits = packetExhibits(cf, brief);
  const doc = createElement(PacketDocument, { cf, brief, exhibits, letter, merchant: store.merchant() });
  // renderToBuffer's type wants a <Document> element; PacketDocument renders one.
  return renderToBuffer(doc as Parameters<typeof renderToBuffer>[0]);
}

export function packetFilename(disputeId: string) {
  return `exhibit-${disputeId}-evidence-packet.pdf`;
}
