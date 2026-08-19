import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#0d1210] p-5">
      <SignUp
        path="/sign-up"
        routing="path"
        signInUrl="/login"
        forceRedirectUrl="/post-login"
      />
    </main>
  );
}
