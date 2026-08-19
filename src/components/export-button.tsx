"use client";

import { Download } from "lucide-react";

export function ExportButton({ filename, rows, label = "Exportar CSV" }: { filename: string; rows: Record<string, string | number>[]; label?: string }) {
  function download() {
    if (!rows.length) return;
    const headers = Object.keys(rows[0]);
    const csv = [headers, ...rows.map((row) => headers.map((header) => row[header]))]
      .map((line) => line.map((value) => `"${String(value ?? "").replaceAll('"', '""')}"`).join(","))
      .join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(url);
  }
  return <button onClick={download} className="secondary-button px-3"><Download size={13} />{label}</button>;
}
