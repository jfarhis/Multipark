import { getSession } from "@/lib/auth";
import { SettingsForm } from "@/components/settings-form";
import { PageHeading } from "@/components/page-heading";
export default async function SettingsPage() { const session = await getSession(); return <><PageHeading eyebrow="Account preferences" title="Settings" description="Manage contact details, banking information, and notification preferences." /><SettingsForm session={session!} /></>; }
