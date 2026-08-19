import {
  Building2,
  Camera,
  Check,
  CircleDollarSign,
  HandCoins,
  UserPlus,
} from "lucide-react";
import Link from "next/link";
import type { DashboardData } from "@/lib/types";

const stepStyles = {
  done: "border-[#2dd4a7]/25 bg-[#2dd4a7]/6",
  next: "border-[#4d7cfe]/45 bg-[#4d7cfe]/10 shadow-[0_0_28px_rgba(77,124,254,.1)]",
  waiting: "border-[#232b45] bg-[#0e1425]",
} as const;

export function AdminSetupGuide({ data }: { data: DashboardData }) {
  const steps = [
    {
      title: "Crear el proyecto de naves",
      description: "Agrega nombre, dirección completa, presupuesto en MXN y avance de obra.",
      done: data.projects.length > 0,
      href: "/admin#new-project",
      action: "Agregar proyecto",
      icon: Building2,
    },
    {
      title: "Agregar al inversionista",
      description: "Registra sus datos y envíale una invitación segura para crear su acceso.",
      done: data.investors.length > 0,
      href: "/admin/investors#invite-investor",
      action: "Agregar inversionista",
      icon: UserPlus,
    },
    {
      title: "Registrar su inversión",
      description: "Escribe el capital invertido en pesos; el porcentaje se calcula automáticamente.",
      done: data.stakes.length > 0,
      href: data.investors[0] ? `/admin/investors/${data.investors[0].id}` : "/admin/investors",
      action: "Asignar inversión",
      icon: CircleDollarSign,
    },
    {
      title: "Publicar avances y documentos",
      description: "Sube fotos de obra, reportes y archivos visibles para todo el proyecto o una sola persona.",
      done: data.documents.some((document) => document.type === "photo" || document.type === "report"),
      href: "/admin/documents#upload-update",
      action: "Subir avance",
      icon: Camera,
    },
    {
      title: "Registrar pagos",
      description: "Captura cada pago en MXN y adjunta su comprobante privado.",
      done: data.distributions.length > 0,
      href: "/admin/distributions#new-payment",
      action: "Registrar pago",
      icon: HandCoins,
    },
  ];
  const completed = steps.filter((step) => step.done).length;
  const nextIndex = steps.findIndex((step) => !step.done);

  return (
    <section className="panel mb-5 overflow-hidden">
      <div className="flex flex-col gap-4 border-b border-[#232b45] p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="eyebrow">Guía de configuración</p>
          <h2 className="mt-2 text-[18px] font-semibold">Prepara lo que verá cada inversionista</h2>
          <p className="mt-2 max-w-3xl text-[13px] leading-6 text-[#8a93b2]">
            Sigue estos pasos en orden. Todo lo que registres se guarda de forma privada y solo se muestra a los inversionistas relacionados con cada proyecto.
          </p>
        </div>
        <div className="min-w-44 rounded-xl border border-[#2a3554] bg-[#121830] p-3">
          <div className="flex items-center justify-between text-[15px]"><span className="text-[#8a93b2]">Avance de configuración</span><strong>{completed} de {steps.length}</strong></div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#080d1b]"><div className="h-full rounded-full bg-[linear-gradient(90deg,#4d7cfe,#38bdf8)]" style={{ width: `${(completed / steps.length) * 100}%` }} /></div>
        </div>
      </div>
      <div className="grid gap-3 p-4 lg:grid-cols-5">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const state = step.done ? "done" : index === nextIndex ? "next" : "waiting";
          return (
            <article key={step.title} className={`flex min-h-56 flex-col rounded-xl border p-4 ${stepStyles[state]}`}>
              <div className="flex items-center justify-between">
                <span className={`grid size-10 place-items-center rounded-xl ${step.done ? "bg-[#2dd4a7]/12 text-[#4be3ba]" : "bg-[#1b2547] text-[#8fb0ff]"}`}>{step.done ? <Check size={18} /> : <Icon size={18} />}</span>
                <span className="text-[15px] font-semibold text-[#6b7594]">Paso {index + 1}</span>
              </div>
              <h3 className="mt-4 text-[15px] font-semibold">{step.title}</h3>
              <p className="mt-2 flex-1 text-[13px] leading-5 text-[#8a93b2]">{step.description}</p>
              <Link href={step.href} className={step.done ? "secondary-button mt-4 px-3" : "primary-button mt-4 px-3"}>{step.done ? "Revisar" : step.action}</Link>
            </article>
          );
        })}
      </div>
    </section>
  );
}
