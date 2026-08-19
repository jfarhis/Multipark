import { ArrowRight, BarChart3, Building2, CheckCircle2, ShieldCheck } from "lucide-react";
import { demoLogin } from "./actions";
import { Logo } from "@/components/logo";

export default function LoginPage() {
  return (
    <main className="relative grid min-h-screen overflow-hidden lg:grid-cols-[1.08fr_.92fr]">
      <div className="absolute left-[16%] top-[-12%] h-[420px] w-[420px] rounded-full bg-[#6c5ce7]/10 blur-[100px]" />
      <section className="relative hidden flex-col justify-between border-r border-[#2c2c54]/55 p-12 lg:flex">
        <Logo />
        <div className="max-w-xl"><p className="eyebrow mb-5 text-[#6fdfd4]">Investor intelligence, refined</p><h1 className="text-[52px] font-medium leading-[1.06] tracking-[-0.05em]">Clarity across every investment.</h1><p className="mt-6 max-w-lg text-[15px] leading-7 text-[#9292b1]">A private view of portfolio performance, construction progress, distributions, and documents—all in one precise workspace.</p>
          <div className="mt-10 grid grid-cols-3 gap-3">{[[Building2, "4 active", "Projects"], [BarChart3, "$87.1M", "Portfolio"], [ShieldCheck, "Private", "Access"]].map(([Icon, value, label]) => { const IconComponent = Icon as typeof Building2; return <div key={String(label)} className="panel p-4"><IconComponent size={16} className="text-[#7f70ef]" /><p className="mt-4 text-[15px] font-semibold">{String(value)}</p><p className="mt-1 text-[10px] text-[#8585a7]">{String(label)}</p></div>; })}</div>
        </div>
        <p className="text-[10px] text-[#64648a]">© 2026 Gasfar Capital · Private and confidential</p>
      </section>
      <section className="relative flex items-center justify-center px-5 py-10"><div className="w-full max-w-[420px]">
        <div className="mb-10 lg:hidden"><Logo /></div><p className="eyebrow mb-3">Secure portal</p><h2 className="text-[28px] font-medium tracking-[-0.035em]">Welcome back</h2><p className="mt-2 text-[13px] text-[#9090b0]">Choose a demo workspace to explore the product.</p>
        <div className="mt-8 space-y-3">
          <form action={demoLogin.bind(null, "admin")}><button className="group panel panel-hover flex w-full items-center gap-4 p-4 text-left"><span className="grid size-11 place-items-center rounded-xl bg-[#6c5ce7]/18 text-[#a99dff]"><ShieldCheck size={20} /></span><span className="flex-1"><span className="block text-[13px] font-semibold">Continue as administrator</span><span className="mt-1 block text-[10px] text-[#8585a7]">Portfolio, investors, documents, and reporting</span></span><ArrowRight size={16} className="text-[#6f6f94] transition group-hover:translate-x-1 group-hover:text-white" /></button></form>
          <form action={demoLogin.bind(null, "investor")}><button className="group panel panel-hover flex w-full items-center gap-4 p-4 text-left"><span className="grid size-11 place-items-center rounded-xl bg-[#00cec9]/12 text-[#4fe8db]"><Building2 size={20} /></span><span className="flex-1"><span className="block text-[13px] font-semibold">Continue as investor</span><span className="mt-1 block text-[10px] text-[#8585a7]">Personal positions, returns, and receipts</span></span><ArrowRight size={16} className="text-[#6f6f94] transition group-hover:translate-x-1 group-hover:text-white" /></button></form>
        </div>
        <div className="mt-6 flex items-start gap-2.5 rounded-xl border border-[#2c2c54]/70 bg-[#171735] p-3.5 text-[10px] leading-4 text-[#7f7fa1]"><CheckCircle2 size={14} className="mt-0.5 shrink-0 text-[#4fe8b8]" /> Demo access uses sample data. Production authentication can connect to your chosen identity provider.</div>
      </div></section>
    </main>
  );
}
