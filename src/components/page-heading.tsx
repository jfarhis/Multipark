import type { ReactNode } from "react";

export function PageHeading({ eyebrow, title, description, action }: { eyebrow?: string; title: string; description: string; action?: ReactNode }) {
  return (
    <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        {eyebrow ? <p className="eyebrow mb-1.5">{eyebrow}</p> : null}
        <h1 className="text-[20px] font-semibold tracking-[-0.025em]">{title}</h1>
        <p className="mt-1 max-w-2xl text-[10px] leading-4 text-[#748078]">{description}</p>
      </div>
      {action}
    </div>
  );
}
