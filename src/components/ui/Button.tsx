import { clsx } from "clsx";
import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "amber";

const styles: Record<Variant, string> = {
  primary: "bg-ink text-white hover:bg-[#262626] disabled:bg-[#d4d4d4]",
  secondary: "bg-surface text-ink border border-line hover:bg-[#fafafa] hover:border-line-strong shadow-[0_1px_1px_rgb(0_0_0/0.03)] disabled:text-faint",
  ghost: "text-ink-2 hover:bg-sunken disabled:text-faint",
  danger: "bg-surface text-red border border-line-strong hover:bg-red-soft",
  amber: "bg-sunken text-ink hover:bg-[#ececec]",
};

export function Button({ variant = "secondary", size = "md", className, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: "sm" | "md" | "lg" }) {
  return (
    <button
      {...props}
      className={clsx(
        "inline-flex items-center justify-center gap-1.5 rounded-lg font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:cursor-not-allowed",
        size === "sm" ? "h-7 px-2.5 text-[12.5px]" : size === "lg" ? "h-11 px-5 text-[15px]" : "h-9 px-3.5 text-[13.5px]",
        styles[variant],
        className,
      )}
    />
  );
}
