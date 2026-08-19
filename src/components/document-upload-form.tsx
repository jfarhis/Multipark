"use client";

import { useActionState } from "react";
import { FileUp } from "lucide-react";
import { uploadDocumentAction } from "@/app/admin/actions";
import { initialFormState } from "@/lib/form-state";
import type { DashboardData } from "@/lib/types";
import { FormMessage } from "./form-message";
import { SubmitButton } from "./submit-button";

export function DocumentUploadForm({ data }: { data: DashboardData }) {
  const [state, action] = useActionState(uploadDocumentAction, initialFormState);
  return (
    <section className="panel mb-4 p-5">
      <div className="flex items-start gap-3"><span className="grid size-9 place-items-center rounded-xl bg-[#4fe8b8]/8 text-[#5fe5b7]"><FileUp size={16} /></span><div><p className="text-[12px] font-semibold">Secure document upload</p><p className="mt-1 text-[10px] text-[#7e8983]">Files are private and only delivered after account permission checks.</p></div></div>
      <form action={action} className="mt-5 grid gap-3 lg:grid-cols-5 lg:items-end">
        <label className="field-label">Title<input required name="title" className="input-shell mt-2 h-10 px-3" /></label>
        <label className="field-label">Project<select required name="projectId" className="input-shell mt-2 h-10 px-3">{data.projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}</select></label>
        <label className="field-label">Visible to<select name="investorId" className="input-shell mt-2 h-10 px-3"><option value="">All project investors</option>{data.investors.map((investor) => <option key={investor.id} value={investor.id}>{investor.name}</option>)}</select></label>
        <label className="field-label">Type<select name="type" className="input-shell mt-2 h-10 px-3"><option value="report">Report</option><option value="receipt">Receipt</option><option value="photo">Photo</option></select></label>
        <label className="field-label">File<input required name="file" type="file" accept=".pdf,.png,.jpg,.jpeg,.xlsx" className="input-shell mt-2 h-10 p-2 text-[10px]" /></label>
        <div className="lg:col-span-5 flex items-center justify-between gap-3"><FormMessage state={state} /><SubmitButton pendingLabel="Uploading…">Upload securely</SubmitButton></div>
      </form>
    </section>
  );
}
