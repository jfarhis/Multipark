"use client";

import { PencilLine, Save, Trash2 } from "lucide-react";
import { useActionState } from "react";
import { deleteProjectAction, initialFormState, updateProjectAction } from "@/app/admin/actions";
import type { Project } from "@/lib/types";
import { FormMessage } from "./form-message";
import { SubmitButton } from "./submit-button";

export function ProjectEditForm({ project }: { project: Project }) {
  const [updateState, updateAction] = useActionState(updateProjectAction.bind(null, project.id), initialFormState);
  const [deleteState, deleteAction] = useActionState(deleteProjectAction.bind(null, project.id, project.name), initialFormState);
  const budget = new Map(project.budgetBreakdown.map((item) => [item.label.toLowerCase(), item.amount]));

  return (
    <details className="panel mt-5 overflow-hidden">
      <summary className="flex cursor-pointer list-none items-center gap-3 p-4 text-[11px] font-semibold">
        <span className="grid size-8 place-items-center rounded-lg bg-[#8b72ff]/10 text-[#aa99ff]"><PencilLine size={14} /></span>
        Edit this project
        <span className="ml-auto text-[9px] font-normal text-[#69766e]">Administrator controls</span>
      </summary>
      <div className="border-t border-[#202b25] p-5">
        <form action={updateAction} className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <label className="field-label">Project name<input required name="name" defaultValue={project.name} className="input-shell mt-2 h-10 px-3" /></label>
          <label className="field-label">Location<input required name="location" defaultValue={project.location} className="input-shell mt-2 h-10 px-3" /></label>
          <label className="field-label">Status<select name="status" defaultValue={project.status} className="input-shell mt-2 h-10 px-3"><option value="pre-construction">Pre-construction</option><option value="in-progress">In progress</option><option value="delayed">Delayed</option><option value="complete">Complete</option></select></label>
          <label className="field-label">Total budget<input required type="number" min="1" name="budgetTotal" defaultValue={project.budgetTotal} className="input-shell mt-2 h-10 px-3" /></label>
          <label className="field-label">Construction %<input required type="number" min="0" max="100" name="constructionPct" defaultValue={project.constructionPct} className="input-shell mt-2 h-10 px-3" /></label>
          <label className="field-label">Occupancy %<input required type="number" min="0" max="100" name="occupancyPct" defaultValue={project.occupancyPct} className="input-shell mt-2 h-10 px-3" /></label>
          <label className="field-label">Projected IRR %<input required type="number" step="0.1" name="projectedIrr" defaultValue={project.projectedIrr} className="input-shell mt-2 h-10 px-3" /></label>
          <label className="field-label">Estimated completion<input required type="date" name="estimatedCompletionDate" defaultValue={project.estimatedCompletionDate} className="input-shell mt-2 h-10 px-3" /></label>
          <label className="field-label">Construction budget<input required type="number" min="0" name="constructionAmount" defaultValue={budget.get("construction") ?? 0} className="input-shell mt-2 h-10 px-3" /></label>
          <label className="field-label">Land budget<input required type="number" min="0" name="landAmount" defaultValue={budget.get("land") ?? 0} className="input-shell mt-2 h-10 px-3" /></label>
          <label className="field-label">Soft-cost budget<input required type="number" min="0" name="softCostsAmount" defaultValue={budget.get("soft costs") ?? 0} className="input-shell mt-2 h-10 px-3" /></label>
          <label className="field-label">Reserve budget<input required type="number" min="0" name="reserveAmount" defaultValue={budget.get("reserve") ?? 0} className="input-shell mt-2 h-10 px-3" /></label>
          <div className="flex flex-wrap items-center justify-between gap-3 sm:col-span-2 xl:col-span-4"><FormMessage state={updateState} /><SubmitButton pendingLabel="Saving project…"><Save size={13} />Save project</SubmitButton></div>
        </form>

        <div className="mt-6 border-t border-[#342126] pt-5">
          <p className="text-[10px] font-semibold text-[#ff8296]">Remove project</p>
          <p className="mt-1 text-[9px] leading-4 text-[#7b6c70]">This also removes its positions, distributions, and documents. Type the project name exactly to unlock deletion.</p>
          <form action={deleteAction} className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end">
            <label className="field-label max-w-md flex-1">Confirmation<input name="confirmation" className="input-shell mt-2 h-10 px-3" placeholder={project.name} autoComplete="off" /></label>
            <SubmitButton pendingLabel="Removing…" variant="danger"><Trash2 size={13} />Remove project</SubmitButton>
          </form>
          <div className="mt-3"><FormMessage state={deleteState} /></div>
        </div>
      </div>
    </details>
  );
}
