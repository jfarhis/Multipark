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
      <div className="flex items-start gap-3"><span className="grid size-9 place-items-center rounded-xl bg-[#2dd4a7]/8 text-[#2dd4a7]"><FileUp size={16} /></span><div><p className="text-[12px] font-semibold">Carga segura de documentos</p><p className="mt-1 text-[10px] text-[#7c86a6]">Los archivos son privados y se entregan únicamente después de verificar los permisos.</p></div></div>
      {data.projects.length ? <form action={action} className="mt-5 grid gap-3 lg:grid-cols-5 lg:items-end">
        <label className="field-label">Título<input required name="title" className="input-shell mt-2 h-10 px-3" /></label>
        <label className="field-label">Proyecto<select required name="projectId" className="input-shell mt-2 h-10 px-3">{data.projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}</select></label>
        <label className="field-label">Visible para<select name="investorId" className="input-shell mt-2 h-10 px-3"><option value="">Todos los inversionistas del proyecto</option>{data.investors.map((investor) => <option key={investor.id} value={investor.id}>{investor.name}</option>)}</select></label>
        <label className="field-label">Tipo<select name="type" className="input-shell mt-2 h-10 px-3"><option value="report">Reporte</option><option value="receipt">Comprobante</option><option value="photo">Foto</option></select></label>
        <label className="field-label">Archivo<input required name="file" type="file" accept=".pdf,.png,.jpg,.jpeg,.xlsx" className="input-shell mt-2 h-10 p-2 text-[10px]" /></label>
        <div className="lg:col-span-5 flex items-center justify-between gap-3"><FormMessage state={state} /><SubmitButton pendingLabel="Cargando…">Cargar de forma segura</SubmitButton></div>
      </form> : <div className="mt-5 rounded-xl border border-[#2a3554] bg-[#121830] p-4 text-[10px] text-[#7c86a6]">Primero crea un proyecto para poder agregar documentos.</div>}
    </section>
  );
}
