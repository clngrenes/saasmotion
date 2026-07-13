import React from "react";

interface StudioSectionProps {
  readonly title: string;
  readonly hint?: string;
  readonly children: React.ReactNode;
}

export const StudioSection: React.FC<StudioSectionProps> = ({
  title,
  hint,
  children,
}) => (
  <section className="flex flex-col gap-3">
    <div className="flex items-baseline justify-between gap-3">
      <h2 className="text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-500">
        {title}
      </h2>
      {hint && <span className="text-[11px] text-zinc-600">{hint}</span>}
    </div>
    {children}
  </section>
);
