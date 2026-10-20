export function PageHeader({ title, subtitle, actions, eyebrow }: { title: React.ReactNode; subtitle?: React.ReactNode; actions?: React.ReactNode; eyebrow?: React.ReactNode }) {
  return (
    <div className="flex items-end justify-between gap-6 border-b border-line px-8 pb-5 pt-7">
      <div className="min-w-0">
        {eyebrow ? <div className="mb-1.5 text-[12px] text-muted">{eyebrow}</div> : null}
        <h1 className="display text-[30px] leading-[1.1]">{title}</h1>
        {subtitle ? <p className="mt-1.5 max-w-2xl text-[13.5px] text-muted">{subtitle}</p> : null}
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
    </div>
  );
}
