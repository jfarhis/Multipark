"use client";

import { PencilLine, Save, Trash2 } from "lucide-react";
import { useActionState } from "react";
import { deleteProjectAction, updateProjectAction } from "@/app/admin/actions";
import { initialFormState } from "@/lib/form-state";
import type { Project } from "@/lib/types";
import { FormMessage } from "./form-message";
import { SubmitButton } from "./submit-button";

export function ProjectEditForm({ project }: { project: Project }) {
  const [updateState, updateAction] = useActionState(updateProjectAction.bind(null, project.id), initialFormState);
  const [deleteState, deleteAction] = useActionState(deleteProjectAction.bind(null, project.id, project.name), initialFormState);
  const budget = new Map(project.budgetBreakdown.map((item) => [item.label.toLowerCase(), item.amount]));
  const budgetValue = (...labels: string[]) => labels.map((label) => budget.get(label)).find((amount) => amount !== undefined) ?? 0;
  const milestoneRows = Array.from({ length: 6 }, (_, index) => project.milestones[index] ?? { label: "", detail: "", complete: false });

  return (
    <details className="panel mt-5 overflow-hidden">
      <summary className="flex cursor-pointer list-none items-center gap-3 p-4 text-[11px] font-semibold">
        <span className="grid size-8 place-items-center rounded-lg bg-[#8b72ff]/10 text-[#aa99ff]"><PencilLine size={14} /></span>
        Editar este proyecto
        <span className="ml-auto text-[9px] font-normal text-[#69766e]">Controles de administrador</span>
      </summary>
      <div className="border-t border-[#202b25] p-5">
        <form action={updateAction} className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <label className="field-label">Nombre del proyecto<input required name="name" defaultValue={project.name} className="input-shell mt-2 h-10 px-3" /></label>
          <label className="field-label">Ubicación<input required name="location" defaultValue={project.location} className="input-shell mt-2 h-10 px-3" /></label>
          <label className="field-label">Estado<select name="status" defaultValue={project.status} className="input-shell mt-2 h-10 px-3"><option value="pre-construction">Preconstrucción</option><option value="in-progress">En progreso</option><option value="delayed">Retrasado</option><option value="complete">Terminado</option></select></label>
          <label className="field-label">Presupuesto total<input required type="number" min="1" name="budgetTotal" defaultValue={project.budgetTotal} className="input-shell mt-2 h-10 px-3" /></label>
          <label className="field-label">Avance de obra %<input required type="number" min="0" max="100" name="constructionPct" defaultValue={project.constructionPct} className="input-shell mt-2 h-10 px-3" /></label>
          <label className="field-label">Ocupación %<input required type="number" min="0" max="100" name="occupancyPct" defaultValue={project.occupancyPct} className="input-shell mt-2 h-10 px-3" /></label>
          <label className="field-label">TIR proyectada %<input required type="number" step="0.1" name="projectedIrr" defaultValue={project.projectedIrr} className="input-shell mt-2 h-10 px-3" /></label>
          <label className="field-label">Fecha estimada de terminación<input required type="date" name="estimatedCompletionDate" defaultValue={project.estimatedCompletionDate} className="input-shell mt-2 h-10 px-3" /></label>
          <label className="field-label">Presupuesto de construcción<input required type="number" min="0" name="constructionAmount" defaultValue={budgetValue("construcción", "construction")} className="input-shell mt-2 h-10 px-3" /></label>
          <label className="field-label">Presupuesto de terreno<input required type="number" min="0" name="landAmount" defaultValue={budgetValue("terreno", "land")} className="input-shell mt-2 h-10 px-3" /></label>
          <label className="field-label">Costos indirectos<input required type="number" min="0" name="softCostsAmount" defaultValue={budgetValue("costos indirectos", "soft costs")} className="input-shell mt-2 h-10 px-3" /></label>
          <label className="field-label">Reserva<input required type="number" min="0" name="reserveAmount" defaultValue={budgetValue("reserva", "reserve")} className="input-shell mt-2 h-10 px-3" /></label>
          <div className="border-t border-[#202b25] pt-5 sm:col-span-2 xl:col-span-4"><p className="text-[11px] font-semibold">Línea de tiempo editable</p><p className="mt-1 text-[9px] text-[#718078]">Agrega hasta seis hitos. Deja el nombre vacío para ocultar una fila.</p></div>
          <div className="grid gap-3 sm:col-span-2 xl:col-span-4 xl:grid-cols-2">
            {milestoneRows.map((milestone, index) => <div key={index} className="grid gap-3 rounded-xl border border-[#202b25] bg-[#0b110e] p-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end"><label className="field-label">Hito {index + 1}<input name={`milestoneLabel${index}`} defaultValue={milestone.label} className="input-shell mt-2 h-10 px-3" placeholder="Ej. Adquisición del terreno" /></label><label className="field-label">Detalle o fecha<input name={`milestoneDetail${index}`} defaultValue={milestone.detail} className="input-shell mt-2 h-10 px-3" placeholder="Ej. Terminado o marzo 2027" /></label><label className="flex h-10 items-center gap-2 text-[9px] text-[#8a968e]"><input name={`milestoneComplete${index}`} type="checkbox" defaultChecked={milestone.complete} className="size-4 accent-[#22c9a5]" />Terminado</label></div>)}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 sm:col-span-2 xl:col-span-4"><FormMessage state={updateState} /><SubmitButton pendingLabel="Guardando proyecto…"><Save size={13} />Guardar proyecto</SubmitButton></div>
        </form>

        <div className="mt-6 border-t border-[#342126] pt-5">
          <p className="text-[10px] font-semibold text-[#ff8296]">Eliminar proyecto</p>
          <p className="mt-1 text-[9px] leading-4 text-[#7b6c70]">También elimina sus participaciones, distribuciones y documentos. Escribe exactamente el nombre del proyecto para confirmar.</p>
          <form action={deleteAction} className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end">
            <label className="field-label max-w-md flex-1">Confirmación<input name="confirmation" className="input-shell mt-2 h-10 px-3" placeholder={project.name} autoComplete="off" /></label>
            <SubmitButton pendingLabel="Eliminando…" variant="danger"><Trash2 size={13} />Eliminar proyecto</SubmitButton>
          </form>
          <div className="mt-3"><FormMessage state={deleteState} /></div>
        </div>
      </div>
    </details>
  );
}
