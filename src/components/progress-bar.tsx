export function ProgressBar({ value, color = "#6c5ce7" }: { value: number; color?: string }) {
  return (
    <div className="h-1.5 overflow-hidden rounded-full bg-[#11112b]">
      <div className="h-full rounded-full transition-[width] duration-700" style={{ width: `${Math.min(value, 100)}%`, backgroundColor: color }} />
    </div>
  );
}
