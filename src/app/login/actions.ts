"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { Role } from "@/lib/types";

export async function demoLogin(role: Role) {
  (await cookies()).set("gasfar_role", role, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
  redirect(role === "admin" ? "/admin" : "/dashboard");
}

export async function logout() {
  (await cookies()).delete("gasfar_role");
  redirect("/login");
}
