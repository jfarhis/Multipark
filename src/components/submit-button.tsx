"use client";

import { LoaderCircle } from "lucide-react";
import { useFormStatus } from "react-dom";

export function SubmitButton({ children, pendingLabel = "Saving…", variant = "primary" }: { children: React.ReactNode; pendingLabel?: string; variant?: "primary" | "secondary" | "danger" }) {
  const { pending } = useFormStatus();
  const className = variant === "danger" ? "danger-button" : variant === "secondary" ? "secondary-button" : "primary-button";
  return (
    <button type="submit" disabled={pending} className={`${className} px-4 disabled:cursor-wait disabled:opacity-65`}>
      {pending && <LoaderCircle size={14} className="animate-spin" />}
      {pending ? pendingLabel : children}
    </button>
  );
}
