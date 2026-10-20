import { clsx } from "clsx";
import Link from "next/link";
import type { ReactNode } from "react";

export function Container({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={clsx("mx-auto w-full max-w-[1200px] px-5 md:px-8", className)}>{children}</div>;
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return <div className="num mb-4 text-[12px] uppercase tracking-[0.14em] text-muted">{children}</div>;
}

export function SectionHead({ eyebrow, title, lede, center }: { eyebrow: string; title: ReactNode; lede?: ReactNode; center?: boolean }) {
  return (
    <div className={clsx("max-w-[720px]", center && "mx-auto text-center")}>
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 className="display text-[34px] leading-[1.05] md:text-[48px]">{title}</h2>
      {lede ? <p className="mt-5 text-[17px] leading-relaxed text-muted md:text-[18px]">{lede}</p> : null}
    </div>
  );
}

export function Section({ id, children, className }: { id?: string; children: ReactNode; className?: string }) {
  return (
    <section id={id} className={clsx("scroll-mt-20 border-t border-line py-20 md:py-28", className)}>
      {children}
    </section>
  );
}

export function PrimaryButton({ href, children, className }: { href: string; children: ReactNode; className?: string }) {
  return (
    <Link
      href={href}
      className={clsx(
        "inline-flex h-11 items-center justify-center gap-2 rounded-full bg-ink px-5 text-[14.5px] font-medium text-white transition-colors hover:bg-ink-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink",
        className,
      )}
    >
      {children}
    </Link>
  );
}

export function SecondaryButton({ href, children, className }: { href: string; children: ReactNode; className?: string }) {
  return (
    <Link
      href={href}
      className={clsx(
        "inline-flex h-11 items-center justify-center gap-2 rounded-full border border-line-strong bg-white px-5 text-[14.5px] font-medium text-ink transition-colors hover:bg-sunken focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink",
        className,
      )}
    >
      {children}
    </Link>
  );
}

/** CSS-only entrance; reduced-motion users get the final state immediately. */
export function Rise({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?: string }) {
  return (
    <div className={clsx("motion-safe:[animation:landing-rise_0.7s_cubic-bezier(0.2,0.7,0.2,1)_both]", className)} style={{ animationDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

export function LandingKeyframes() {
  return <style>{`@keyframes landing-rise { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: none; } }`}</style>;
}
