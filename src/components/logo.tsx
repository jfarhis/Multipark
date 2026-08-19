export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div className="relative grid size-10 shrink-0 place-items-center rounded-[13px] bg-[#3b5bfe] shadow-[0_10px_30px_rgba(59,91,254,.35)]">
        <span className="absolute h-4 w-[5px] -translate-x-1 rounded-full bg-white/95" />
        <span className="absolute h-6 w-[5px] translate-x-1.5 rounded-full bg-[#9bd4ff]" />
      </div>
      {!compact && (
        <div>
          <div className="text-[14px] font-semibold tracking-[0.02em]">Gasfar Capital</div>
          <div className="mt-0.5 text-[9px] font-medium uppercase tracking-[0.22em] text-[#6b7594]">Inversiones privadas</div>
        </div>
      )}
    </div>
  );
}
