import { cookies } from "next/headers";
import type { Session } from "./types";
import { mockDashboardData } from "./mock-data";

export async function getSession(): Promise<Session | null> {
  const role = (await cookies()).get("gasfar_role")?.value;
  if (role === "admin") {
    return {
      role: "admin",
      name: "Joseph Farhi",
      email: "admin@gasfarcapital.com",
    };
  }
  if (role === "investor") {
    const investor = mockDashboardData.investors[0];
    return {
      role: "investor",
      investorId: investor.id,
      name: investor.name,
      email: investor.email,
    };
  }
  return null;
}
