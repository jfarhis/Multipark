"use client";

import { FileSpreadsheet } from "lucide-react";
import { useActionState } from "react";
import { importWorkbookAction, initialFormState } from "@/app/admin/actions";
import { FormMessage } from "./form-message";
import { SubmitButton } from "./submit-button";

export function ExcelImportForm() {
  const [state, action] = useActionState(importWorkbookAction, initialFormState);
  return (
    <details className="panel mt-4 overflow-hidden">
      <summary className="flex cursor-pointer list-none items-center gap-3 p-4 text-[11px] font-semibold"><span className="grid size-8 place-items-center rounded-lg bg-[#22c9a5]/10 text-[#4fdbbd]"><FileSpreadsheet size={14} /></span>Import or update from Excel<span className="ml-auto text-[9px] font-normal text-[#69766e]">Merge safely by record ID</span></summary>
      <form action={action} className="border-t border-[#202b25] p-5">
        <p className="max-w-3xl text-[9px] leading-5 text-[#748078]">The workbook must contain these sheets: Investors, Projects, Investor_Project_Stakes, Distributions, and Documents. Existing matching IDs are updated; other records remain unchanged.</p>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end"><label className="field-label max-w-xl flex-1">Excel workbook<input required name="workbook" type="file" accept=".xlsx,.xls" className="input-shell mt-2 h-10 p-2 text-[10px]" /></label><SubmitButton pendingLabel="Importing workbook…">Import workbook</SubmitButton></div>
        <div className="mt-3"><FormMessage state={state} /></div>
      </form>
    </details>
  );
}
