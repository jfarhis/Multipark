"use client";

import { useActionState } from "react";
import { Building2 } from "lucide-react";
import { createProjectAction } from "@/app/admin/actions";
import { initialFormState } from "@/lib/form-state";
import { FormMessage } from "./form-message";
import { SubmitButton } from "./submit-button";

export function ProjectCreateForm() {
  const [state, action] = useActionState(createProjectAction, initialFormState);
  return (
    <details id="new-project" open className="panel mb-5 overflow-hidden scroll-mt-24">
      <summary className="flex cursor-pointer list-none items-center gap-3 p-5 text-[15px] font-semibold">
        <span className="grid size-10 place-items-center rounded-xl bg-[#4d7cfe]/10 text-[#7ea2ff]"><Building2 size={18} /></span>
        <span><span className="block">Agregar proyecto de naves industriales</span><span className="mt-1 block text-[13px] font-normal text-[#8a93b2]">Completa la información principal. Después podrás agregar hitos, inversionistas y fotos.</span></span>
        <span className="ml-auto hidden text-[15px] font-normal text-[#6b7594] sm:block">Mostrar u ocultar</span>
      </summary>
      <form action={action} className="border-t border-white/6 p-5">
        <div className="grid gap-5 xl:grid-cols-3">
          <fieldset className="rounded-xl border border-[#232b45] bg-[#0e1425] p-4">
            <legend className="px-2 text-[13px] font-semibold text-[#8fb0ff]">1. Identidad y ubicación</legend>
            <div className="mt-2 grid gap-4">
              <label className="field-label">Nombre del proyecto<input required name="name" className="input-shell mt-2 h-11 px-3" placeholder="Ej. Parque Industrial Norte" /></label>
              <label className="field-label">Dirección o ubicación de las naves<input required name="location" className="input-shell mt-2 h-11 px-3" placeholder="Calle, municipio, estado, México" /><span className="mt-2 block font-normal leading-5 text-[#6b7594]">Esta ubicación será visible para los inversionistas y tendrá acceso directo a Google Maps.</span></label>
            </div>
          </fieldset>
          <fieldset className="rounded-xl border border-[#232b45] bg-[#0e1425] p-4">
            <legend className="px-2 text-[13px] font-semibold text-[#8fb0ff]">2. Estado del proyecto</legend>
            <div className="mt-2 grid gap-4 sm:grid-cols-2">
              <label className="field-label sm:col-span-2">Etapa actual<select name="status" className="input-shell mt-2 h-11 px-3"><option value="pre-construction">Preconstrucción</option><option value="in-progress">En construcción</option><option value="delayed">Retrasado</option><option value="complete">Terminado</option></select></label>
              <label className="field-label">Avance de obra (%)<input required type="number" min="0" max="100" name="constructionPct" defaultValue="0" className="input-shell mt-2 h-11 px-3" /></label>
              <label className="field-label">Ocupación (%)<input required type="number" min="0" max="100" name="occupancyPct" defaultValue="0" className="input-shell mt-2 h-11 px-3" /></label>
              <label className="field-label sm:col-span-2">Terminación estimada<input required type="date" name="estimatedCompletionDate" className="input-shell mt-2 h-11 px-3" /></label>
            </div>
          </fieldset>
          <fieldset className="rounded-xl border border-[#232b45] bg-[#0e1425] p-4">
            <legend className="px-2 text-[13px] font-semibold text-[#8fb0ff]">3. Información de inversión</legend>
            <div className="mt-2 grid gap-4">
              <label className="field-label">Presupuesto total (MXN)<input required type="number" min="1" step="1" name="budgetTotal" className="input-shell mt-2 h-11 px-3" placeholder="Ej. 25000000" /><span className="mt-2 block font-normal leading-5 text-[#6b7594]">Escribe pesos completos, sin comas ni símbolo.</span></label>
              <label className="field-label">TIR proyectada (%)<input required type="number" min="-100" max="100" step="0.1" name="projectedIrr" className="input-shell mt-2 h-11 px-3" placeholder="Ej. 14.5" /></label>
            </div>
          </fieldset>
        </div>
        <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between"><FormMessage state={state} /><SubmitButton pendingLabel="Creando proyecto…">Crear proyecto y continuar</SubmitButton></div>
      </form>
    </details>
  );
}
