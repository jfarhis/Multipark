import type { ReactNode } from "react";
import { ProtectedShell } from "@/components/protected-shell";
export const dynamic = "force-dynamic";
export default function ProjectsLayout({ children }: { children: ReactNode }) { return <ProtectedShell>{children}</ProtectedShell>; }
