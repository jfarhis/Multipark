import type { ReactNode } from "react";
import { ProtectedShell } from "@/components/protected-shell";
export const dynamic = "force-dynamic";
export default function AdminLayout({ children }: { children: ReactNode }) { return <ProtectedShell role="admin">{children}</ProtectedShell>; }
