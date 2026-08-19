import type { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";

export function KpiCard({ label, value, trend, icon: Icon, emphasized = false, danger = false }: {
  label: string; value: string; trend: number; icon: LucideIcon; emphasized?: boolean; danger?: boolean;
}) {
  const positive = trend >= 0;
  return (
    <article className={`panel panel-hover min-w-0 overflow-hidden p-5 ${emphasized ? "border-[#7667ee]/60 bg-[linear-gradient(145deg,#6c5ce7,#5341c5)]" : ""}`}>
      <div className="flex items-start justify-between gap-3">
        <p className={`text-[12px] ${emphasized ? "text-white/72" : "text-[#9a9ab8]"}`}>{label}</p>
        <span className={`grid size-8 place-items-center rounded-lg ${emphasized ? "bg-white/12" : "bg-[#262652]"}`}>
          <Icon size={15} className={danger ? "text-[#ff7f98]" : emphasized ? "text-white" : "text-[#9d90ff]"} />
        </span>
      </div>
      <div className="mt-4 flex items-end justify-between gap-2">
        <p className="tabular truncate text-[25px] font-semibold tracking-[-0.035em]">{value}</p>
        <span className={`mb-1 inline-flex shrink-0 items-center gap-0.5 text-[10px] font-semibold ${emphasized ? "text-[#bffcf0]" : positive ? "text-[#4fe8b8]" : "text-[#ff718d]"}`}>
          {positive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}{Math.abs(trend).toFixed(1)}%
        </span>
      </div>
    </article>
  );
}
