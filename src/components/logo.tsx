export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div className="relative grid size-10 shrink-0 place-items-center rounded-[13px] bg-[#6c5ce7] shadow-[0_10px_30px_rgba(108,92,231,.35)]">
        <span className="absolute h-4 w-[5px] -translate-x-1 rounded-full bg-white/95" />
        <span className="absolute h-6 w-[5px] translate-x-1.5 rounded-full bg-[#81f0e1]" />
      </div>
      {!compact && (
        <div>
          <div className="text-[14px] font-semibold tracking-[0.02em]">Gasfar Capital</div>
          <div className="mt-0.5 text-[9px] font-medium uppercase tracking-[0.22em] text-[#77779b]">Private investments</div>
        </div>
      )}
    </div>
  );
}
