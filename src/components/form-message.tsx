import type { FormState } from "@/lib/form-state";

export function FormMessage({ state }: { state: FormState }) {
  if (state.status === "idle") return null;
  return (
    <p className={`rounded-lg px-3 py-2 text-[10px] ${state.status === "success" ? "bg-[#ffc46b]/8 text-[#ffce7d]" : "bg-[#e84f6f]/8 text-[#ff8199]"}`}>
      {state.message}
    </p>
  );
}
