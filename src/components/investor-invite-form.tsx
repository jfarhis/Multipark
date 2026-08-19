"use client";

import { useActionState } from "react";
import { MailPlus } from "lucide-react";
import { inviteInvestorAction } from "@/app/admin/actions";
import { initialFormState } from "@/lib/form-state";
import { FormMessage } from "./form-message";
import { SubmitButton } from "./submit-button";

export function InvestorInviteForm() {
  const [state, action] = useActionState(inviteInvestorAction, initialFormState);
  return (
    <section id="invite-investor" className="panel mt-4 p-5">
      <div className="flex items-start gap-3">
        <span className="grid size-9 place-items-center rounded-xl bg-[#8b72ff]/10 text-[#a895ff]"><MailPlus size={16} /></span>
        <div><p className="text-[12px] font-semibold">Invite a new investor</p><p className="mt-1 text-[10px] text-[#7e8983]">Creates their record and emails a secure account invitation.</p></div>
      </div>
      <form action={action} className="mt-5 grid gap-3 lg:grid-cols-[1fr_1fr_.8fr_auto] lg:items-end">
        <label className="field-label">Full name<input required name="name" className="input-shell mt-2 h-10 px-3" placeholder="Investor name" /></label>
        <label className="field-label">Email<input required type="email" name="email" className="input-shell mt-2 h-10 px-3" placeholder="name@company.com" /></label>
        <label className="field-label">Bank reference<input name="bankDetails" className="input-shell mt-2 h-10 px-3" placeholder="Masked details only" /></label>
        <SubmitButton pendingLabel="Sending…">Send invitation</SubmitButton>
      </form>
      <div className="mt-3"><FormMessage state={state} /></div>
    </section>
  );
}
