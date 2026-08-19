import type { FormState } from "@/lib/form-state";

export function FormMessage({ state }: { state: FormState }) {
  if (state.status === "idle") return null;
  return (
    <p className={`rounded-lg px-3 py-2 text-[13px] ${state.status === "success" ? "bg-[#2dd4a7]/8 text-[#43e0b3]" : "bg-[#e84f6f]/8 text-[#ff8199]"}`}>
      {state.message}
    </p>
  );
}
