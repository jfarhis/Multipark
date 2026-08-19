"use server";

import { clerkClient } from "@clerk/nextjs/server";
import { put } from "@vercel/blob";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getDb } from "@/db";
import {
  documents,
  investorProjectStakes,
  investors,
  projects,
} from "@/db/schema";
import { getSession } from "@/lib/auth";

export type FormState = { status: "idle" | "success" | "error"; message: string };
export const initialFormState: FormState = { status: "idle", message: "" };

async function requireAdmin() {
  const session = await getSession();
  if (session?.role !== "admin") throw new Error("Administrator access required.");
  return session;
}

const investorSchema = z.object({
  name: z.string().trim().min(2, "Enter the investor's full name."),
  email: z.email("Enter a valid email address.").transform((value) => value.toLowerCase()),
  bankDetails: z.string().trim().max(120).default("Not provided"),
});

export async function inviteInvestorAction(
  _previousState: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();
  const parsed = investorSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    bankDetails: formData.get("bankDetails") || "Not provided",
  });
  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message ?? "Check the investor details." };
  }

  const db = getDb();
  const id = `inv-${crypto.randomUUID()}`;
  try {
    await db.insert(investors).values({ id, ...parsed.data });
  } catch {
    return { status: "error", message: "That email is already connected to an investor." };
  }

  try {
    const client = await clerkClient();
    const deploymentHost = process.env.VERCEL_PROJECT_PRODUCTION_URL ?? "multipark-seven.vercel.app";
    await client.invitations.createInvitation({
      emailAddress: parsed.data.email,
      redirectUrl: `https://${deploymentHost}/sign-up`,
      publicMetadata: { role: "investor", investorId: id },
    });
  } catch {
    revalidatePath("/admin/investors");
    return {
      status: "error",
      message: "The investor was saved, but the invitation email could not be sent. You can retry it later.",
    };
  }

  revalidatePath("/admin/investors");
  return { status: "success", message: `Invitation sent to ${parsed.data.email}.` };
}

const projectSchema = z.object({
  name: z.string().trim().min(2),
  location: z.string().trim().min(2),
  status: z.enum(["pre-construction", "in-progress", "delayed", "complete"]),
  constructionPct: z.coerce.number().min(0).max(100),
  occupancyPct: z.coerce.number().min(0).max(100),
  budgetTotal: z.coerce.number().positive(),
  estimatedCompletionDate: z.string().min(10),
  projectedIrr: z.coerce.number().min(-100).max(100),
});

export async function createProjectAction(
  _previousState: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();
  const parsed = projectSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message ?? "Check the project details." };
  }
  const baseId = parsed.data.name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  try {
    await getDb().insert(projects).values({
      id: baseId,
      ...parsed.data,
      budgetBreakdown: [
        { label: "Construction", amount: Math.round(parsed.data.budgetTotal * 0.55) },
        { label: "Land", amount: Math.round(parsed.data.budgetTotal * 0.25) },
        { label: "Soft costs", amount: Math.round(parsed.data.budgetTotal * 0.12) },
        { label: "Reserve", amount: Math.round(parsed.data.budgetTotal * 0.08) },
      ],
    });
  } catch {
    return { status: "error", message: "A project with that name already exists." };
  }
  revalidatePath("/admin");
  return { status: "success", message: `${parsed.data.name} was created.` };
}

export async function updateInvestorStakesAction(
  investorId: string,
  _previousState: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();
  const db = getDb();
  const projectRows = await db.select({ id: projects.id, budgetTotal: projects.budgetTotal }).from(projects);
  const projectBudget = new Map(projectRows.map((project) => [project.id, project.budgetTotal]));
  const changes: { projectId: string; stakePct: number; capitalCommitted: number }[] = [];
  for (const [key, rawValue] of formData.entries()) {
    if (!key.startsWith("stake:")) continue;
    const projectId = key.slice(6);
    const stakePct = Number(rawValue);
    const capitalCommitted = projectBudget.get(projectId);
    if (!Number.isFinite(stakePct) || stakePct < 0 || stakePct > 100 || capitalCommitted === undefined) {
      return { status: "error", message: "Every ownership percentage must be between 0 and 100." };
    }
    changes.push({ projectId, stakePct, capitalCommitted });
  }
  await Promise.all(changes.map((change) => change.stakePct === 0
    ? db.delete(investorProjectStakes).where(and(eq(investorProjectStakes.investorId, investorId), eq(investorProjectStakes.projectId, change.projectId)))
    : db.insert(investorProjectStakes).values({ investorId, ...change }).onConflictDoUpdate({
      target: [investorProjectStakes.investorId, investorProjectStakes.projectId],
      set: { stakePct: change.stakePct, capitalCommitted: change.capitalCommitted, updatedAt: new Date() },
    })));
  revalidatePath(`/admin/investors/${investorId}`);
  revalidatePath("/admin");
  return { status: "success", message: "Ownership percentages saved." };
}

const documentSchema = z.object({
  title: z.string().trim().min(2),
  projectId: z.string().min(1),
  investorId: z.string().optional(),
  type: z.enum(["receipt", "report", "photo"]),
});

export async function uploadDocumentAction(
  _previousState: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();
  const file = formData.get("file");
  const parsed = documentSchema.safeParse({
    title: formData.get("title"),
    projectId: formData.get("projectId"),
    investorId: formData.get("investorId") || undefined,
    type: formData.get("type"),
  });
  if (!parsed.success || !(file instanceof File) || file.size === 0) {
    return { status: "error", message: "Choose a file and complete all document fields." };
  }
  if (file.size > 10 * 1024 * 1024) {
    return { status: "error", message: "Documents must be 10 MB or smaller." };
  }
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
  const pathname = `projects/${parsed.data.projectId}/${crypto.randomUUID()}-${safeName}`;
  try {
    const blob = await put(pathname, file, { access: "private", addRandomSuffix: false });
    await getDb().insert(documents).values({
      id: `doc-${crypto.randomUUID()}`,
      projectId: parsed.data.projectId,
      investorId: parsed.data.investorId || null,
      title: parsed.data.title,
      pathname: blob.pathname,
      uploadedDate: new Date().toISOString().slice(0, 10),
      type: parsed.data.type,
    });
  } catch {
    return { status: "error", message: "The secure upload could not be completed. Please try again." };
  }
  revalidatePath("/admin/documents");
  return { status: "success", message: "Document uploaded securely." };
}
