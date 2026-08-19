import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Gasfar Capital", template: "%s · Gasfar Capital" },
  description: "Private real-estate investment portfolio intelligence.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <ClerkProvider signInUrl="/login" signUpUrl="/sign-up">
      <html lang="en" className="h-full antialiased">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
