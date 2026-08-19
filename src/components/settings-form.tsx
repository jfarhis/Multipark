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
    return <section className="panel max-w-2xl p-6"><span className="grid size-10 place-items-center rounded-xl bg-[#2dd4a7]/8 text-[#2dd4a7]"><ShieldCheck size={18} /></span><h2 className="mt-5 text-[15px] font-semibold">Cuenta de administrador</h2><p className="mt-2 text-[14px] leading-5 text-[#7c86a6]">Sesión iniciada como {session.email}. La contraseña, los métodos de verificación y la seguridad de la cuenta se administran desde el menú de perfil en la esquina superior derecha.</p></section>;
  }
  return <form action={action} className="grid gap-4 xl:grid-cols-[1.25fr_.75fr]"><section className="panel p-5"><p className="text-[13px] font-semibold">Información de contacto</p><p className="mt-1 text-[13px] text-[#7c86a6]">Se utiliza para avisos de cuenta y pagos.</p><div className="mt-6 grid gap-4 sm:grid-cols-2"><label className="field-label">Nombre completo<input name="name" className="input-shell mt-2 h-10 px-3" defaultValue={investor?.name ?? session.name} /></label><label className="field-label">Correo de acceso<input readOnly className="input-shell mt-2 h-10 px-3 opacity-60" defaultValue={session.email} /></label><label className="field-label">Teléfono<input name="phone" className="input-shell mt-2 h-10 px-3" defaultValue={investor?.phone ?? ""} /></label><label className="field-label">Referencia bancaria<input name="bankDetails" className="input-shell mt-2 h-10 px-3" defaultValue={investor?.bankDetails ?? "No proporcionado"} /></label></div><div className="mt-6 flex items-center justify-between gap-3"><FormMessage state={state} /><SubmitButton pendingLabel="Guardando…"><Save size={14} />Guardar cambios</SubmitButton></div></section><section className="panel p-5"><p className="text-[13px] font-semibold">Notificaciones</p><p className="mt-1 text-[13px] text-[#7c86a6]">Elige las actualizaciones que deseas recibir.</p><div className="mt-5 space-y-3">{[["distributionNotices", "Avisos de pagos", "Cuando se registra un nuevo pago", investor?.distributionNotices ?? true], ["constructionUpdates", "Avances de obra", "Cambios en hitos y progreso", investor?.constructionUpdates ?? true], ["documentNotices", "Nuevos documentos", "Cuando se agregan reportes o comprobantes", investor?.documentNotices ?? true], ["monthlyDigest", "Resumen mensual", "Resumen del portafolio por correo", investor?.monthlyDigest ?? false]].map(([name, label, detail, checked]) => <label key={String(name)} className="flex items-center gap-3 rounded-xl bg-white/[.025] p-3"><input name={String(name)} type="checkbox" defaultChecked={Boolean(checked)} className="size-4 accent-[#4d7cfe]" /><span><span className="block text-[13px] font-medium">{label}</span><span className="mt-1 block text-[12px] text-[#6b7594]">{detail}</span></span></label>)}</div></section></form>;
}
