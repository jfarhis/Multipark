import { SignOutButton } from "@clerk/nextjs";
import { ShieldAlert } from "lucide-react";

export default function AccessPendingPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#0d1210] p-5">
      <section className="panel max-w-md p-8 text-center">
        <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-[#f5b82e]/10 text-[#f5b82e]">
          <ShieldAlert size={21} />
        </span>
        <p className="eyebrow mt-5">Account review</p>
        <h1 className="mt-3 text-[20px] font-semibold">Your account needs access</h1>
        <p className="mt-3 text-[12px] leading-6 text-[#84908a]">
          This email is authenticated, but it is not connected to an investor record yet.
          Ask the Gasfar administrator to add or invite this email.
        </p>
        <SignOutButton redirectUrl="/login">
          <button className="secondary-button mt-6 px-4">Use a different account</button>
        </SignOutButton>
      </section>
    </main>
  );
}
