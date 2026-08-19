import type { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";

export function KpiCard({ label, value, icon: Icon, emphasized = false, trend, trendLabel }: {
  label: string; value: string; icon: LucideIcon; emphasized?: boolean;
  // trend must come from real data (e.g. distributionTrend) — never hardcode it
  trend?: number; trendLabel?: string;
}) {
  const showTrend = trend !== undefined && Number.isFinite(trend);
  const positive = (trend ?? 0) >= 0;
  return (
    <article className={`panel panel-hover min-w-0 overflow-hidden p-4 ${emphasized ? "border-[#31406e] bg-[linear-gradient(145deg,#161d33,#121830)]" : ""}`}>
      <div className="flex items-center gap-2">
        <span className={`grid size-7 place-items-center rounded-full ${emphasized ? "bg-[#173247]" : "bg-[#1b2547]"}`}>
          <Icon size={13} className={emphasized ? "text-[#38bdf8]" : "text-[#7ea2ff]"} />
        </span>
        <p className="text-[13px] text-[#aab3cf]">{label}</p>
      </div>
      <p className="tabular mt-4 truncate text-[20px] font-semibold tracking-[-0.035em]">{value}</p>
      {showTrend ? (
        <p className="mt-2 flex items-center gap-1.5 text-[12px] text-[#6b7594]">
          <span className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 font-semibold ${positive ? "bg-[#2dd4a7]/10 text-[#4be3ba]" : "bg-[#ff5470]/10 text-[#ff788e]"}`}>
            {positive ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
            {Math.abs(trend!).toFixed(1)}%
          </span>
          {trendLabel}
        </p>
      ) : null}
    </article>
  );
}
