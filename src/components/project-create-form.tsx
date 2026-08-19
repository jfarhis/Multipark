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
        <span className="grid size-8 place-items-center rounded-lg bg-[#8b72ff]/10 text-[#a895ff]"><Building2 size={14} /></span>
        Add a project to the live portfolio
        <span className="ml-auto text-[9px] font-normal text-[#69746f]">Open form</span>
      </summary>
      <form action={action} className="grid gap-3 border-t border-white/6 p-5 sm:grid-cols-2 xl:grid-cols-4">
        <label className="field-label">Project name<input required name="name" className="input-shell mt-2 h-10 px-3" /></label>
        <label className="field-label">Location<input required name="location" className="input-shell mt-2 h-10 px-3" /></label>
        <label className="field-label">Status<select name="status" className="input-shell mt-2 h-10 px-3"><option value="pre-construction">Pre-construction</option><option value="in-progress">In progress</option><option value="delayed">Delayed</option><option value="complete">Complete</option></select></label>
        <label className="field-label">Budget total<input required type="number" min="1" name="budgetTotal" className="input-shell mt-2 h-10 px-3" /></label>
        <label className="field-label">Construction %<input required type="number" min="0" max="100" name="constructionPct" defaultValue="0" className="input-shell mt-2 h-10 px-3" /></label>
        <label className="field-label">Occupancy %<input required type="number" min="0" max="100" name="occupancyPct" defaultValue="0" className="input-shell mt-2 h-10 px-3" /></label>
        <label className="field-label">Projected IRR %<input required type="number" step="0.1" name="projectedIrr" className="input-shell mt-2 h-10 px-3" /></label>
        <label className="field-label">Estimated completion<input required type="date" name="estimatedCompletionDate" className="input-shell mt-2 h-10 px-3" /></label>
        <div className="flex items-end sm:col-span-2 xl:col-span-4"><SubmitButton pendingLabel="Creating…">Create project</SubmitButton></div>
        <div className="sm:col-span-2 xl:col-span-4"><FormMessage state={state} /></div>
      </form>
    </details>
  );
}
