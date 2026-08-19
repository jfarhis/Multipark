"use client";

import { AlertTriangle, RotateCcw } from "lucide-react";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <main className="grid min-h-screen place-items-center p-6"><div className="panel max-w-md p-8 text-center"><span className="mx-auto grid size-12 place-items-center rounded-2xl bg-[#e84f6f]/12 text-[#ff7a94]"><AlertTriangle size={21} /></span><h1 className="mt-5 text-[18px] font-semibold">We couldn&apos;t load this view</h1><p className="mt-2 text-[11px] leading-5 text-[#8585a7]">The data source may be temporarily unavailable. Your account and portfolio data are safe.</p><button onClick={reset} className="primary-button mt-6 px-4"><RotateCcw size={14} />Try again</button></div></main>;
}
