export function ProgressBar({ value, color = "#8b72ff" }: { value: number; color?: string }) {
  return (
    <div className="h-1.5 overflow-hidden rounded-full bg-[#1a241e]">
      <div className="h-full rounded-full transition-[width] duration-700" style={{ width: `${Math.min(value, 100)}%`, backgroundColor: color }} />
    </div>
  );
}
