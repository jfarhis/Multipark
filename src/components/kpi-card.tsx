import type { LucideIcon } from "lucide-react";

export function KpiCard({ label, value, icon: Icon, emphasized = false }: {
  label: string; value: string; icon: LucideIcon; emphasized?: boolean;
}) {
  return (
    <article className={`panel panel-hover min-w-0 overflow-hidden p-4 ${emphasized ? "border-[#5d514f] bg-[linear-gradient(145deg,#171d19,#121815)]" : ""}`}>
      <div className="flex items-center gap-2">
        <span className={`grid size-7 place-items-center rounded-full ${emphasized ? "bg-[#312a20]" : "bg-[#1d1a31]"}`}>
          <Icon size={13} className={emphasized ? "text-[#f1ba35]" : "text-[#9f8cff]"} />
        </span>
        <p className="text-[10px] text-[#a4aea7]">{label}</p>
      </div>
      <p className="tabular mt-4 truncate text-[20px] font-semibold tracking-[-0.035em]">{value}</p>
    </article>
  );
}
