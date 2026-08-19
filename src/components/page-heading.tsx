import type { ReactNode } from "react";

export function PageHeading({ eyebrow, title, description, action }: { eyebrow?: string; title: string; description: string; action?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        {eyebrow && <p className="eyebrow mb-2">{eyebrow}</p>}
        <h1 className="text-[22px] font-medium tracking-[-0.025em]">{title}</h1>
        <p className="mt-1.5 max-w-2xl text-[12px] leading-5 text-[#8f8faf]">{description}</p>
      </div>
      {action}
    </div>
  );
}
