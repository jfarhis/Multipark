"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getDb } from "@/db";
import { investors } from "@/db/schema";
import { getSession } from "@/lib/auth";
import type { FormState } from "@/lib/form-state";

const settingsSchema = z.object({
  name: z.string().trim().min(2),
  phone: z.string().trim().max(40),
  bankDetails: z.string().trim().min(2).max(120),
});

export async function updateSettingsAction(
  _previousState: FormState,
  formData: FormData,
): Promise<FormState> {
  const session = await getSession();
  if (session?.role !== "investor" || !session.investorId) {
    return { status: "error", message: "Investor access is required to save these preferences." };
  }
  const parsed = settingsSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone") ?? "",
    bankDetails: formData.get("bankDetails"),
  });
  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message ?? "Check your information." };
  }
  await getDb()
    .update(investors)
    .set({
      ...parsed.data,
      distributionNotices: formData.get("distributionNotices") === "on",
      constructionUpdates: formData.get("constructionUpdates") === "on",
      documentNotices: formData.get("documentNotices") === "on",
      monthlyDigest: formData.get("monthlyDigest") === "on",
      updatedAt: new Date(),
    })
    .where(eq(investors.id, session.investorId));
  revalidatePath("/settings");
  return { status: "success", message: "Your account preferences were saved." };
}
