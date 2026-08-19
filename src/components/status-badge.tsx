import type { ProjectStatus } from "@/lib/types";

const styles: Record<ProjectStatus, string> = {
  "pre-construction": "bg-[#4fd1e8]/10 text-[#79def0] ring-[#4fd1e8]/20",
  "in-progress": "bg-[#6c5ce7]/15 text-[#a99cff] ring-[#6c5ce7]/25",
  delayed: "bg-[#e84f6f]/12 text-[#ff8199] ring-[#e84f6f]/25",
  complete: "bg-[#4fe8b8]/10 text-[#64ebbf] ring-[#4fe8b8]/20",
};

export function StatusBadge({ status }: { status: ProjectStatus }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold capitalize ring-1 ring-inset ${styles[status]}`}>
      <span className="size-1.5 rounded-full bg-current" />
      {status.replace("-", " ")}
    </span>
  );
}
