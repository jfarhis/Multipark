export function ProgressBar({ value, color = "#ff7a2f" }: { value: number; color?: string }) {
  return (
    <div className="h-1.5 overflow-hidden rounded-full bg-[#291511]">
      <div className="h-full rounded-full transition-[width] duration-700" style={{ width: `${Math.min(value, 100)}%`, backgroundColor: color }} />
    </div>
  );
}
