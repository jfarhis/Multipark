import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import type { Role } from "@/lib/types";
import { getSession } from "@/lib/auth";
import { AppShell } from "./app-shell";

export async function ProtectedShell({ children, role }: { children: ReactNode; role?: Role }) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (role && session.role !== role) redirect(session.role === "admin" ? "/admin" : "/dashboard");
  return <AppShell session={session}>{children}</AppShell>;
}
