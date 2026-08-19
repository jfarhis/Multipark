"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { Building2, Camera, FileText, FileUp, ReceiptText } from "lucide-react";
import { uploadDocumentAction } from "@/app/admin/actions";
import { initialFormState } from "@/lib/form-state";
import type { DashboardData, DocumentType } from "@/lib/types";
import { FormMessage } from "./form-message";
import { SubmitButton } from "./submit-button";

export function DocumentUploadForm({ data }: { data: DashboardData }) {
  const [state, action] = useActionState(uploadDocumentAction, initialFormState);
  const [type, setType] = useState<DocumentType>("photo");
  const [projectId, setProjectId] = useState(data.projects[0]?.id ?? "");
  const today = new Date().toISOString().slice(0, 10);
  const fileAccept = type === "photo" ? "image/png,image/jpeg,image/webp" : type === "receipt" ? ".pdf,.png,.jpg,.jpeg" : ".pdf,.xlsx,.png,.jpg,.jpeg";
  const eligibleInvestors = data.investors.filter((investor) => data.stakes.some((stake) => stake.projectId === projectId && stake.investorId === investor.id));
  return (
    <section id="upload-update" className="panel mb-4 scroll-mt-24 p-5">
      <div className="flex items-start gap-3"><span className="grid size-10 place-items-center rounded-xl bg-[#2dd4a7]/8 text-[#2dd4a7]"><FileUp size={18} /></span><div><p className="text-[16px] font-semibold">Publicar un avance o documento</p><p className="mt-1 text-[13px] leading-5 text-[#7c86a6]">Elige qué deseas publicar. Los archivos permanecen privados y solo los ven las personas autorizadas.</p></div></div>
      <div className="mt-5 grid gap-3 md:grid-cols-3">
        <button type="button" onClick={() => setType("photo")} className={`rounded-xl border p-4 text-left transition ${type === "photo" ? "border-[#4d7cfe] bg-[#4d7cfe]/10" : "border-[#232b45] bg-[#0e1425]"}`}><Camera size={20} className="text-[#8fb0ff]" /><span className="mt-3 block text-[14px] font-semibold">Foto de avance de obra</span><span className="mt-1 block text-[15px] leading-5 text-[#7c86a6]">Aparece en la galería del proyecto.</span></button>
        <button type="button" onClick={() => setType("report")} className={`rounded-xl border p-4 text-left transition ${type === "report" ? "border-[#4d7cfe] bg-[#4d7cfe]/10" : "border-[#232b45] bg-[#0e1425]"}`}><FileText size={20} className="text-[#8fb0ff]" /><span className="mt-3 block text-[14px] font-semibold">Reporte o documento</span><span className="mt-1 block text-[15px] leading-5 text-[#7c86a6]">PDF, Excel o evidencia del proyecto.</span></button>
        <button type="button" onClick={() => setType("receipt")} className={`rounded-xl border p-4 text-left transition ${type === "receipt" ? "border-[#4d7cfe] bg-[#4d7cfe]/10" : "border-[#232b45] bg-[#0e1425]"}`}><ReceiptText size={20} className="text-[#8fb0ff]" /><span className="mt-3 block text-[14px] font-semibold">Otro comprobante</span><span className="mt-1 block text-[15px] leading-5 text-[#7c86a6]">Para un comprobante de pago usa preferentemente la sección Pagos.</span></button>
      </div>
      {data.projects.length ? <form action={action} className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3 xl:items-end">
        <input type="hidden" name="type" value={type} />
        <label className="field-label">Título visible para el inversionista<input required name="title" className="input-shell mt-2 h-11 px-3" placeholder={type === "photo" ? "Ej. Avance de cimentación — agosto 2026" : "Ej. Reporte mensual — agosto 2026"} /></label>
        <label className="field-label">Proyecto<select required name="projectId" value={projectId} onChange={(event) => setProjectId(event.target.value)} className="input-shell mt-2 h-11 px-3">{data.projects.map((project) => <option key={project.id} value={project.id}>{project.name} — {project.location}</option>)}</select></label>
        <label className="field-label">Quién podrá verlo<select name="investorId" className="input-shell mt-2 h-11 px-3"><option value="">Todos los inversionistas del proyecto</option>{eligibleInvestors.map((investor) => <option key={investor.id} value={investor.id}>Solo {investor.name}</option>)}</select><span className="mt-2 block font-normal text-[#6b7594]">Solo se muestran inversionistas asociados a este proyecto.</span></label>
        <label className="field-label">Fecha del avance o documento<input required name="uploadedDate" type="date" defaultValue={today} className="input-shell mt-2 h-11 px-3" /></label>
        <label className="field-label md:col-span-2">Seleccionar archivo<input required name="file" type="file" accept={fileAccept} className="input-shell mt-2 min-h-11 p-2 text-[13px]" /><span className="mt-2 block font-normal text-[#6b7594]">Máximo 10 MB. {type === "photo" ? "JPG, PNG o WebP." : "PDF, imagen o Excel."}</span></label>
        <div className="flex flex-col-reverse gap-3 md:col-span-2 xl:col-span-3 sm:flex-row sm:items-center sm:justify-between"><FormMessage state={state} /><SubmitButton pendingLabel="Publicando…">Publicar de forma segura</SubmitButton></div>
      </form> : <div className="mt-5 rounded-xl border border-[#2a3554] bg-[#121830] p-4"><p className="text-[14px] font-semibold">Primero crea un proyecto</p><p className="mt-1 text-[13px] leading-5 text-[#7c86a6]">Después podrás publicar fotos, avances y documentos dentro de ese proyecto individual.</p><Link href="/admin#new-project" className="primary-button mt-4 px-4"><Building2 size={14} />Crear primer proyecto</Link></div>}
    </section>
  );
}
