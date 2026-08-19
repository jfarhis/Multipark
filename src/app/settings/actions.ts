"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getDb } from "@/db";
import { investors } from "@/db/schema";
import { getSession } from "@/lib/auth";
import type { FormState } from "@/lib/form-state";

const settingsSchema = z.object({
  name: z.string().trim().min(2, "Escribe tu nombre completo."),
  phone: z.string().trim().max(40, "El teléfono es demasiado largo."),
  bankDetails: z.string().trim().min(2, "Escribe una referencia bancaria.").max(120, "La referencia bancaria es demasiado larga."),
});

export async function updateSettingsAction(
  _previousState: FormState,
  formData: FormData,
): Promise<FormState> {
  const session = await getSession();
  if (session?.role !== "investor" || !session.investorId) {
    return { status: "error", message: "Se requiere acceso de inversionista para guardar estas preferencias." };
  }
  const parsed = settingsSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone") ?? "",
    bankDetails: formData.get("bankDetails"),
  });
  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message ?? "Revisa tu información." };
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
  return { status: "success", message: "Tus preferencias fueron guardadas." };
}
