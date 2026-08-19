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
    <section id="invite-investor" className="panel mt-4 scroll-mt-24 p-5">
      <div className="flex items-start gap-3">
        <span className="grid size-9 place-items-center rounded-xl bg-[#4d7cfe]/10 text-[#7ea2ff]"><MailPlus size={16} /></span>
        <div><p className="text-[15px] font-semibold">1. Agregar e invitar al inversionista</p><p className="mt-1 text-[13px] leading-5 text-[#7c86a6]">Crea su registro y envía una invitación segura. Después abre su perfil para registrar cuánto invirtió en MXN.</p></div>
      </div>
      <form action={action} className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4 xl:items-end">
        <label className="field-label">Nombre completo<input required name="name" className="input-shell mt-2 h-10 px-3" placeholder="Nombre del inversionista" /></label>
        <label className="field-label">Correo electrónico<input required type="email" name="email" className="input-shell mt-2 h-10 px-3" placeholder="nombre@empresa.com" /></label>
        <label className="field-label">Teléfono (opcional)<input type="tel" name="phone" className="input-shell mt-2 h-10 px-3" placeholder="+52 55 0000 0000" /></label>
        <label className="field-label">Referencia bancaria (opcional)<input name="bankDetails" className="input-shell mt-2 h-10 px-3" placeholder="Últimos 4 dígitos o referencia" /></label>
        <div className="md:col-span-2 xl:col-span-4 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between"><FormMessage state={state} /><SubmitButton pendingLabel="Enviando invitación…">Guardar y enviar invitación</SubmitButton></div>
      </form>
    </section>
  );
}
