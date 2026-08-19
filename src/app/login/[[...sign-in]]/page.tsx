import { SignIn } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Activity, Building2, LockKeyhole, ShieldCheck } from "lucide-react";
import { Logo } from "@/components/logo";
import { getSession } from "@/lib/auth";

export default async function LoginPage() {
  const { userId } = await auth();
  if (userId) {
    const session = await getSession();
    redirect(session?.role === "admin" ? "/admin" : session ? "/dashboard" : "/access-pending");
  }

  return (
    <main className="login-grid relative min-h-screen overflow-hidden lg:grid lg:grid-cols-[1.08fr_.92fr]">
      <section className="relative hidden min-h-screen flex-col justify-between border-r border-white/6 bg-[#090d0b] p-10 lg:flex">
        <Logo />
        <div className="max-w-[600px]">
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-[#4fe8b8]/15 bg-[#4fe8b8]/6 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[.18em] text-[#72eac1]">
            <Activity size={12} /> Live portfolio intelligence
          </div>
          <h1 className="max-w-[560px] text-[52px] font-medium leading-[1.02] tracking-[-.055em] text-[#f4f7f5]">
            Every investment. One precise view.
          </h1>
          <p className="mt-6 max-w-[510px] text-[14px] leading-7 text-[#87928d]">
            Secure access to real-estate performance, construction progress,
            distributions, ownership, and confidential documents.
          </p>
          <div className="mt-10 grid grid-cols-3 gap-3">
            {[
              [Building2, "Portfolio", "Live project data"],
              [ShieldCheck, "Role-based", "Private access"],
              [LockKeyhole, "Encrypted", "Secure documents"],
            ].map(([Icon, title, detail]) => {
              const TileIcon = Icon as typeof Building2;
              return (
                <div key={String(title)} className="login-feature-card rounded-xl p-4">
                  <TileIcon size={16} />
                  <p className="mt-6 text-[12px] font-semibold text-[#e9eeeb]">{String(title)}</p>
                  <p className="mt-1 text-[10px] text-[#69736e]">{String(detail)}</p>
                </div>
              );
            })}
          </div>
        </div>
        <p className="text-[9px] uppercase tracking-[.16em] text-[#4c5651]">
          © 2026 Gasfar Capital · Private and confidential
        </p>
      </section>
      <section className="relative flex min-h-screen items-center justify-center bg-[#0d1210] px-5 py-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_10%,rgba(108,92,231,.12),transparent_34%)]" />
        <div className="relative w-full max-w-[420px]">
          <div className="mb-8 lg:hidden"><Logo /></div>
          <p className="eyebrow mb-3 text-[#72eac1]">Secure investor portal</p>
          <h2 className="text-[28px] font-medium tracking-[-.04em]">Welcome back</h2>
          <p className="mb-7 mt-2 text-[12px] leading-5 text-[#7d8983]">
            Sign in with the email connected to your Gasfar account.
          </p>
          <SignIn
            path="/login"
            routing="path"
            signUpUrl="/sign-up"
            forceRedirectUrl="/post-login"
          />
        </div>
      </section>
    </main>
  );
}
