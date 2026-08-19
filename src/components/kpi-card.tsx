import type { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";

export function KpiCard({ label, value, trend, icon: Icon, emphasized = false, danger = false }: {
  label: string; value: string; trend?: number; icon: LucideIcon; emphasized?: boolean; danger?: boolean;
}) {
  const positive = trend === undefined || trend >= 0;
  const points = positive ? "0,25 8,20 15,24 23,12 31,20 39,8 47,15 55,5 63,11 72,2" : "0,8 8,12 15,9 23,21 31,15 39,25 47,19 55,27 63,22 72,29";
  return (
    <article className={`panel panel-hover min-w-0 overflow-hidden p-4 ${emphasized ? "border-[#5d514f] bg-[linear-gradient(145deg,#171d19,#121815)]" : ""}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className={`grid size-7 place-items-center rounded-full ${danger ? "bg-[#35171e]" : emphasized ? "bg-[#312a20]" : "bg-[#1d1a31]"}`}>
            <Icon size={13} className={danger ? "text-[#ff6b82]" : emphasized ? "text-[#f1ba35]" : "text-[#9f8cff]"} />
          </span>
          <p className="text-[10px] text-[#a4aea7]">{label}</p>
        </div>
      </div>
      <div className="mt-4 flex items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="tabular truncate text-[20px] font-semibold tracking-[-0.035em]">{value}</p>
          <span className={`mt-2 inline-flex items-center gap-1 rounded-full px-1.5 py-1 text-[8px] font-semibold ${positive ? "bg-[#123024] text-[#34dc9c]" : "bg-[#35171e] text-[#ff6b82]"}`}>
            {trend === undefined ? "Live" : <>{positive ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}{Math.abs(trend).toFixed(1)}%</>}
          </span>
        </div>
        <svg aria-hidden="true" className="h-9 w-[72px] shrink-0" viewBox="0 0 72 32" fill="none">
          <polyline points={points} stroke={danger || !positive ? "#ff5470" : "#27d797"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </article>
  );
}
