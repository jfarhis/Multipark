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
    <details id="new-project" className="panel mt-4 overflow-hidden">
      <summary className="flex cursor-pointer list-none items-center gap-3 p-4 text-[11px] font-semibold">
        <span className="grid size-8 place-items-center rounded-lg bg-[#4d7cfe]/10 text-[#7ea2ff]"><Building2 size={14} /></span>
        Agregar un proyecto al portafolio
        <span className="ml-auto text-[9px] font-normal text-[#6b7594]">Abrir formulario</span>
      </summary>
      <form action={action} className="grid gap-3 border-t border-white/6 p-5 sm:grid-cols-2 xl:grid-cols-4">
        <label className="field-label">Nombre del proyecto<input required name="name" className="input-shell mt-2 h-10 px-3" /></label>
        <label className="field-label">Ubicación<input required name="location" className="input-shell mt-2 h-10 px-3" /></label>
        <label className="field-label">Estado<select name="status" className="input-shell mt-2 h-10 px-3"><option value="pre-construction">Preconstrucción</option><option value="in-progress">En progreso</option><option value="delayed">Retrasado</option><option value="complete">Terminado</option></select></label>
        <label className="field-label">Presupuesto total<input required type="number" min="1" name="budgetTotal" className="input-shell mt-2 h-10 px-3" /></label>
        <label className="field-label">Avance de obra %<input required type="number" min="0" max="100" name="constructionPct" defaultValue="0" className="input-shell mt-2 h-10 px-3" /></label>
        <label className="field-label">Ocupación %<input required type="number" min="0" max="100" name="occupancyPct" defaultValue="0" className="input-shell mt-2 h-10 px-3" /></label>
        <label className="field-label">TIR proyectada %<input required type="number" step="0.1" name="projectedIrr" className="input-shell mt-2 h-10 px-3" /></label>
        <label className="field-label">Fecha estimada de terminación<input required type="date" name="estimatedCompletionDate" className="input-shell mt-2 h-10 px-3" /></label>
        <div className="flex items-end sm:col-span-2 xl:col-span-4"><SubmitButton pendingLabel="Creando…">Crear proyecto</SubmitButton></div>
        <div className="sm:col-span-2 xl:col-span-4"><FormMessage state={state} /></div>
      </form>
    </details>
  );
}
