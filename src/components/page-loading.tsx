import { LoaderCircle } from "lucide-react";

export function PageLoading({ label = "Cargando sección…" }: { label?: string }) {
  return (
    <div className="panel grid min-h-[360px] place-items-center p-8 text-center" role="status" aria-live="polite">
      <div>
        <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-[#4d7cfe]/10 text-[#8fb0ff]"><LoaderCircle size={22} className="animate-spin" /></span>
        <p className="mt-4 text-[16px] font-semibold">{label}</p>
        <p className="mt-2 text-[13px] text-[#8a93b2]">Tu clic fue recibido. Estamos preparando la información.</p>
      </div>
    </div>
  );
}
