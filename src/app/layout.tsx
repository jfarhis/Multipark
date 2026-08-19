import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ClerkProvider } from "@clerk/nextjs";
import { esMX } from "@clerk/localizations";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Gasfar Capital", template: "%s · Gasfar Capital" },
  description: "Portal privado de inversiones inmobiliarias.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <ClerkProvider localization={esMX} signInUrl="/login" signUpUrl="/sign-up">
      <html lang="es-MX" className="h-full antialiased">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
