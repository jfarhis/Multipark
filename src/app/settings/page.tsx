import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { investors } from "@/db/schema";
import { SettingsForm } from "@/components/settings-form";
import { PageHeading } from "@/components/page-heading";
export default async function SettingsPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  const [investor] = session.role === "investor" && session.investorId
    ? await getDb().select().from(investors).where(eq(investors.id, session.investorId)).limit(1)
    : [];
  return <><PageHeading eyebrow="Preferencias de cuenta" title="Configuración" description="Administra tus datos de contacto, información bancaria y preferencias de notificaciones." /><SettingsForm session={session} investor={investor} /></>;
}
