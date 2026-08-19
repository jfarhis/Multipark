"use client";

import { FileSpreadsheet } from "lucide-react";
import { useActionState } from "react";
import { importWorkbookAction } from "@/app/admin/actions";
import { initialFormState } from "@/lib/form-state";
import { FormMessage } from "./form-message";
import { SubmitButton } from "./submit-button";

export function ExcelImportForm() {
  const [state, action] = useActionState(importWorkbookAction, initialFormState);
  return (
    <details className="panel mt-4 overflow-hidden">
      <summary className="flex cursor-pointer list-none items-center gap-3 p-4 text-[14px] font-semibold"><span className="grid size-8 place-items-center rounded-lg bg-[#4d7cfe]/10 text-[#2dd4a7]"><FileSpreadsheet size={14} /></span>Importar o actualizar desde Excel<span className="ml-auto text-[12px] font-normal text-[#6b7594]">Combina por ID de registro</span></summary>
      <form action={action} className="border-t border-[#232b45] p-5">
        <p className="max-w-3xl text-[12px] leading-5 text-[#7c86a6]">El archivo debe contener las hojas Investors, Projects, Investor_Project_Stakes, Distributions y Documents. Los ID existentes se actualizan; los demás registros no cambian.</p>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end"><label className="field-label max-w-xl flex-1">Archivo de Excel<input required name="workbook" type="file" accept=".xlsx,.xls" className="input-shell mt-2 h-10 p-2 text-[13px]" /></label><SubmitButton pendingLabel="Importando…">Importar archivo</SubmitButton></div>
        <div className="mt-3"><FormMessage state={state} /></div>
      </form>
    </details>
  );
}
