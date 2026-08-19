import { auth, currentUser } from "@clerk/nextjs/server";
import { eq, or, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { investors } from "@/db/schema";
import type { Session } from "./types";

const adminEmail = (process.env.GASFAR_ADMIN_EMAIL ?? "Joseph@gasfar.com").toLowerCase();

export async function getSession(): Promise<Session | null> {
  const { userId } = await auth();
  if (!userId) return null;

  const user = await currentUser();
  const email = user?.primaryEmailAddress?.emailAddress.toLowerCase();
  if (!user || !email) return null;
  const name = [user.firstName, user.lastName].filter(Boolean).join(" ") || email;

  if (email === adminEmail) {
    return {
      role: "admin",
      name,
      email,
    };
  }

  const db = getDb();
  const [investor] = await db
    .select()
    .from(investors)
    .where(
      or(
        eq(investors.clerkUserId, userId),
        sql`lower(${investors.email}) = ${email}`,
      ),
    )
    .limit(1);

  if (!investor) return null;
  if (!investor.clerkUserId) {
    await db
      .update(investors)
      .set({ clerkUserId: userId, updatedAt: new Date() })
      .where(eq(investors.id, investor.id));
  }

  return {
    role: "investor",
    investorId: investor.id,
    name: investor.name,
    email: investor.email,
  };
}
