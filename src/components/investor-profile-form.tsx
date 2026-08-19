"use client";

import { Save, Trash2, UserRoundPen } from "lucide-react";
import { useActionState } from "react";
import { deleteInvestorAction, initialFormState, updateInvestorAction } from "@/app/admin/actions";
import type { Investor } from "@/lib/types";
import { FormMessage } from "./form-message";
import { SubmitButton } from "./submit-button";

export function InvestorProfileForm({ investor }: { investor: Investor }) {
  const [updateState, updateAction] = useActionState(updateInvestorAction.bind(null, investor.id), initialFormState);
  const [deleteState, deleteAction] = useActionState(deleteInvestorAction.bind(null, investor.id, investor.email), initialFormState);
  return (
    <details className="panel mb-4 overflow-hidden">
      <summary className="flex cursor-pointer list-none items-center gap-3 p-4 text-[11px] font-semibold"><span className="grid size-8 place-items-center rounded-lg bg-[#8b72ff]/10 text-[#aa99ff]"><UserRoundPen size={14} /></span>Edit investor details<span className="ml-auto text-[9px] font-normal text-[#69766e]">Profile and access</span></summary>
      <div className="border-t border-[#202b25] p-5">
        <form action={updateAction} className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4 xl:items-end">
          <label className="field-label">Full name<input required name="name" defaultValue={investor.name} className="input-shell mt-2 h-10 px-3" /></label>
          <label className="field-label">Email<input required type="email" name="email" defaultValue={investor.email} className="input-shell mt-2 h-10 px-3" /></label>
          <label className="field-label">Phone<input name="phone" defaultValue={investor.phone ?? ""} className="input-shell mt-2 h-10 px-3" /></label>
          <label className="field-label">Bank reference<input name="bankDetails" defaultValue={investor.bankDetails} className="input-shell mt-2 h-10 px-3" /></label>
          <div className="flex flex-wrap items-center justify-between gap-3 sm:col-span-2 xl:col-span-4"><FormMessage state={updateState} /><SubmitButton pendingLabel="Saving investor…"><Save size={13} />Save investor</SubmitButton></div>
        </form>
        <div className="mt-6 border-t border-[#342126] pt-5">
          <p className="text-[10px] font-semibold text-[#ff8296]">Remove investor</p><p className="mt-1 text-[9px] text-[#7b6c70]">Type the investor email exactly. Their positions, payments, and private documents will also be removed.</p>
          <form action={deleteAction} className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end"><label className="field-label max-w-md flex-1">Confirmation<input name="confirmation" className="input-shell mt-2 h-10 px-3" placeholder={investor.email} autoComplete="off" /></label><SubmitButton pendingLabel="Removing…" variant="danger"><Trash2 size={13} />Remove investor</SubmitButton></form>
          <div className="mt-3"><FormMessage state={deleteState} /></div>
        </div>
      </div>
    </details>
  );
}
