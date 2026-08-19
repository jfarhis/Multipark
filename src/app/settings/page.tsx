import { getSession } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { investors } from "@/db/schema";
import { SettingsForm } from "@/components/settings-form";
import { PageHeading } from "@/components/page-heading";
export default async function SettingsPage() {
  const session = await getSession();
  const [investor] = session?.role === "investor" && session.investorId
    ? await getDb().select().from(investors).where(eq(investors.id, session.investorId)).limit(1)
    : [];
  return <><PageHeading eyebrow="Account preferences" title="Settings" description="Manage contact details, banking information, and notification preferences." /><SettingsForm session={session!} investor={investor} /></>;
}
