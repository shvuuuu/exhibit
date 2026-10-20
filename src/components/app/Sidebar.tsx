"use client";

import { clsx } from "clsx";
import { Activity, Inbox, Settings, ShieldCheck, Sparkles } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "../ui/Logo";

const NAV = [
  { href: "/app", label: "Disputes", icon: Inbox, match: (p: string) => p === "/app" || p.startsWith("/app/disputes") },
  { href: "/app/protection", label: "Protection", icon: ShieldCheck, match: (p: string) => p.startsWith("/app/protection") },
  { href: "/app/autopilot", label: "Autopilot", icon: Sparkles, match: (p: string) => p.startsWith("/app/autopilot") },
  { href: "/app/activity", label: "PayPal activity", icon: Activity, match: (p: string) => p.startsWith("/app/activity") },
  { href: "/app/settings", label: "Settings", icon: Settings, match: (p: string) => p.startsWith("/app/settings") },
];

export function Sidebar({ merchant, mode, provider }: { merchant: string; mode: string; provider: string }) {
  const path = usePathname();
  return (
    <aside className="sticky top-0 flex h-dvh w-[232px] shrink-0 flex-col border-r border-line bg-[#fafafa] px-3 py-4">
      <Link href="/" className="px-2 pb-6 pt-1">
        <Logo />
      </Link>
      <div className="mb-4 rounded-lg border border-line bg-surface px-3 py-2.5">
        <div className="text-[11px] uppercase tracking-wider text-faint">Merchant</div>
        <div className="mt-0.5 text-[13.5px] font-medium">{merchant}</div>
      </div>
      <nav className="flex flex-col gap-0.5">
        {NAV.map((n) => {
          const active = n.match(path);
          return (
            <Link
              key={n.href}
              href={n.href}
              className={clsx("flex h-8 items-center gap-2.5 rounded-md px-2 text-[13.5px] transition-colors", active ? "bg-surface font-medium text-ink shadow-[0_0_0_1px_var(--line),0_1px_2px_rgb(0_0_0/0.04)]" : "text-ink-2 hover:bg-[#f0f0f0]")}
            >
              <n.icon className="size-4" strokeWidth={1.75} />
              {n.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto space-y-2 px-1 text-[12px] text-muted">
        <div className="flex items-center gap-2">
          <span className={clsx("size-1.5 rounded-full", mode === "sandbox" ? "bg-green" : "bg-amber")} />
          {mode === "sandbox" ? "PayPal Sandbox · live API" : "Demo · PayPal simulator"}
        </div>
        <div className="flex items-center gap-2">
          <span className={clsx("size-1.5 rounded-full", provider === "replay" ? "bg-faint" : "bg-green")} />
          {provider === "anthropic" ? "Claude API · live" : provider === "claude-code" ? "Claude (local login)" : "Recorded agent runs"}
        </div>
      </div>
    </aside>
  );
}
