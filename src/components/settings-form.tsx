"use client";

import { Save, ShieldCheck } from "lucide-react";
import { useActionState } from "react";
import type { Session } from "@/lib/types";
import { initialFormState } from "@/lib/form-state";
import { updateSettingsAction } from "@/app/settings/actions";
import { FormMessage } from "./form-message";
import { SubmitButton } from "./submit-button";

type InvestorSettings = {
  name: string;
  phone: string | null;
  bankDetails: string;
  distributionNotices: boolean;
  constructionUpdates: boolean;
  documentNotices: boolean;
  monthlyDigest: boolean;
};

export function SettingsForm({ session, investor }: { session: Session; investor?: InvestorSettings }) {
  const [state, action] = useActionState(updateSettingsAction, initialFormState);
  if (session.role === "admin") {
    return <section className="panel max-w-2xl p-6"><span className="grid size-10 place-items-center rounded-xl bg-[#4fe8b8]/8 text-[#5fe5b7]"><ShieldCheck size={18} /></span><h2 className="mt-5 text-[15px] font-semibold">Administrator account</h2><p className="mt-2 text-[11px] leading-5 text-[#7e8983]">Signed in as {session.email}. Passwords, verification methods, and account security are managed securely by Clerk from the profile menu in the top right.</p></section>;
  }
  return <form action={action} className="grid gap-4 xl:grid-cols-[1.25fr_.75fr]"><section className="panel p-5"><p className="text-[13px] font-semibold">Contact information</p><p className="mt-1 text-[10px] text-[#7e8983]">Used for account and distribution notices.</p><div className="mt-6 grid gap-4 sm:grid-cols-2"><label className="field-label">Full name<input name="name" className="input-shell mt-2 h-10 px-3" defaultValue={investor?.name ?? session.name} /></label><label className="field-label">Login email<input readOnly className="input-shell mt-2 h-10 px-3 opacity-60" defaultValue={session.email} /></label><label className="field-label">Phone number<input name="phone" className="input-shell mt-2 h-10 px-3" defaultValue={investor?.phone ?? ""} /></label><label className="field-label">Bank reference<input name="bankDetails" className="input-shell mt-2 h-10 px-3" defaultValue={investor?.bankDetails ?? "Not provided"} /></label></div><div className="mt-6 flex items-center justify-between gap-3"><FormMessage state={state} /><SubmitButton pendingLabel="Saving…"><Save size={14} />Save changes</SubmitButton></div></section><section className="panel p-5"><p className="text-[13px] font-semibold">Notifications</p><p className="mt-1 text-[10px] text-[#7e8983]">Choose the updates you receive.</p><div className="mt-5 space-y-3">{[["distributionNotices", "Distribution notices", "When a new payment is posted", investor?.distributionNotices ?? true], ["constructionUpdates", "Construction updates", "Milestone and progress changes", investor?.constructionUpdates ?? true], ["documentNotices", "New documents", "Reports and receipts added", investor?.documentNotices ?? true], ["monthlyDigest", "Monthly digest", "Portfolio summary by email", investor?.monthlyDigest ?? false]].map(([name, label, detail, checked]) => <label key={String(name)} className="flex items-center gap-3 rounded-xl bg-white/[.025] p-3"><input name={String(name)} type="checkbox" defaultChecked={Boolean(checked)} className="size-4 accent-[#8b72ff]" /><span><span className="block text-[10px] font-medium">{label}</span><span className="mt-1 block text-[9px] text-[#69746f]">{detail}</span></span></label>)}</div></section></form>;
}
