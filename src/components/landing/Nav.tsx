import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { LogoMark } from "../ui/Logo";
import { Container } from "./Primitives";

const LINKS = [
  ["How it works", "#how"],
  ["Product", "#product"],
  ["Trust", "#trust"],
  ["Pricing", "#pricing"],
  ["FAQ", "#faq"],
] as const;

export function Nav() {
  return (
    <header className="sticky top-0 z-50 border-b border-line/80 bg-white/80 backdrop-blur-md supports-[backdrop-filter]:bg-white/70">
      <Container className="flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2" aria-label="Exhibit home">
          <LogoMark size={24} />
          <span className="text-[17px] font-semibold leading-none tracking-[-0.045em]">Exhibit</span>
        </Link>
        <nav className="hidden items-center gap-8 text-[14px] text-muted md:flex">
          {LINKS.map(([label, href]) => (
            <a key={href} href={href} className="transition-colors hover:text-ink">
              {label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/pitch" className="hidden h-9 items-center rounded-full px-3.5 text-[14px] text-ink-2 transition-colors hover:bg-sunken sm:inline-flex">
            Pitch
          </Link>
          <Link href="/app" className="inline-flex h-9 items-center gap-1.5 rounded-full bg-ink px-4 text-[14px] font-medium text-white transition-colors hover:bg-ink-2">
            Open live demo <ArrowRight className="size-3.5" />
          </Link>
        </div>
      </Container>
    </header>
  );
}
