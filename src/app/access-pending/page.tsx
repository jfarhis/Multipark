import { SignOutButton } from "@clerk/nextjs";
import { ShieldAlert } from "lucide-react";

export default function AccessPendingPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#0c1120] p-5">
      <section className="panel max-w-md p-8 text-center">
        <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-[#f5b82e]/10 text-[#f5b82e]">
          <ShieldAlert size={21} />
        </span>
        <p className="eyebrow mt-5">Revisión de cuenta</p>
        <h1 className="mt-3 text-[20px] font-semibold">Tu cuenta necesita acceso</h1>
        <p className="mt-3 text-[12px] leading-6 text-[#8a93b2]">
          Este correo está autenticado, pero todavía no está conectado a un inversionista.
          Pide al administrador de Gasfar que agregue o invite este correo.
        </p>
        <SignOutButton redirectUrl="/login">
          <button className="secondary-button mt-6 px-4">Usar otra cuenta</button>
        </SignOutButton>
      </section>
    </main>
  );
}
