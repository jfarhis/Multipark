"use client";

import { Save, Trash2, UserRoundPen } from "lucide-react";
import { useActionState } from "react";
import { deleteInvestorAction, updateInvestorAction } from "@/app/admin/actions";
import { initialFormState } from "@/lib/form-state";
import type { Investor } from "@/lib/types";
import { FormMessage } from "./form-message";
import { SubmitButton } from "./submit-button";

export function InvestorProfileForm({ investor }: { investor: Investor }) {
  const [updateState, updateAction] = useActionState(updateInvestorAction.bind(null, investor.id), initialFormState);
  const [deleteState, deleteAction] = useActionState(deleteInvestorAction.bind(null, investor.id, investor.email), initialFormState);
  return (
    <details className="panel mb-4 overflow-hidden">
      <summary className="flex cursor-pointer list-none items-center gap-3 p-4 text-[11px] font-semibold"><span className="grid size-8 place-items-center rounded-lg bg-[#4d7cfe]/10 text-[#8fb0ff]"><UserRoundPen size={14} /></span>Editar inversionista<span className="ml-auto text-[9px] font-normal text-[#6b7594]">Perfil y acceso</span></summary>
      <div className="border-t border-[#232b45] p-5">
        <form action={updateAction} className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4 xl:items-end">
          <label className="field-label">Nombre completo<input required name="name" defaultValue={investor.name} className="input-shell mt-2 h-10 px-3" /></label>
          <label className="field-label">Correo electrónico<input required type="email" name="email" defaultValue={investor.email} className="input-shell mt-2 h-10 px-3" /></label>
          <label className="field-label">Teléfono<input name="phone" defaultValue={investor.phone ?? ""} className="input-shell mt-2 h-10 px-3" /></label>
          <label className="field-label">Referencia bancaria<input name="bankDetails" defaultValue={investor.bankDetails} className="input-shell mt-2 h-10 px-3" /></label>
          <div className="flex flex-wrap items-center justify-between gap-3 sm:col-span-2 xl:col-span-4"><FormMessage state={updateState} /><SubmitButton pendingLabel="Guardando inversionista…"><Save size={13} />Guardar inversionista</SubmitButton></div>
        </form>
        <div className="mt-6 border-t border-[#342126] pt-5">
          <p className="text-[10px] font-semibold text-[#ff8296]">Eliminar inversionista</p><p className="mt-1 text-[9px] text-[#7a7f9e]">Escribe exactamente el correo. También se eliminarán sus participaciones, pagos y documentos privados.</p>
          <form action={deleteAction} className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end"><label className="field-label max-w-md flex-1">Confirmación<input name="confirmation" className="input-shell mt-2 h-10 px-3" placeholder={investor.email} autoComplete="off" /></label><SubmitButton pendingLabel="Eliminando…" variant="danger"><Trash2 size={13} />Eliminar inversionista</SubmitButton></form>
          <div className="mt-3"><FormMessage state={deleteState} /></div>
        </div>
      </div>
    </details>
  );
}
