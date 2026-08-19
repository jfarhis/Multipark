"use client";

import { LoaderCircle } from "lucide-react";
import { useFormStatus } from "react-dom";

export function SubmitButton({ children, pendingLabel = "Saving…" }: { children: React.ReactNode; pendingLabel?: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="primary-button px-4 disabled:cursor-wait disabled:opacity-65">
      {pending && <LoaderCircle size={14} className="animate-spin" />}
      {pending ? pendingLabel : children}
    </button>
  );
}
