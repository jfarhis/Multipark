import type { LucideIcon } from "lucide-react";

export function KpiCard({ label, value, icon: Icon, emphasized = false }: {
  label: string; value: string; icon: LucideIcon; emphasized?: boolean;
}) {
  return (
    <article className={`panel panel-hover min-w-0 overflow-hidden p-4 ${emphasized ? "border-[#6b4630] bg-[linear-gradient(145deg,#271410,#20100d)]" : ""}`}>
      <div className="flex items-center gap-2">
        <span className={`grid size-7 place-items-center rounded-full ${emphasized ? "bg-[#3a2a14]" : "bg-[#3a1c0e]"}`}>
          <Icon size={13} className={emphasized ? "text-[#f1ba35]" : "text-[#ff9d4d]"} />
        </span>
        <p className="text-[10px] text-[#c9ab99]">{label}</p>
      </div>
      <p className="tabular mt-4 truncate text-[20px] font-semibold tracking-[-0.035em]">{value}</p>
    </article>
  );
}
