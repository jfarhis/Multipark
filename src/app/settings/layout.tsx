import type { ReactNode } from "react";
import { ProtectedShell } from "@/components/protected-shell";
export default function SettingsLayout({ children }: { children: ReactNode }) { return <ProtectedShell>{children}</ProtectedShell>; }
