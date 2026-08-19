"use server";

import { clerkClient } from "@clerk/nextjs/server";
import { del, put } from "@vercel/blob";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getDb } from "@/db";
import {
  documents,
  distributions,
  investorProjectStakes,
  investors,
  projects,
} from "@/db/schema";
import { getSession } from "@/lib/auth";
import type { FormState } from "@/lib/form-state";

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
  if (parsed.data.investorId && !(await validatePosition(parsed.data.projectId, parsed.data.investorId))) {
    return { status: "error", message: "That investor does not have ownership in the selected project." };
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
  revalidatePath("/dashboard/documents");
  revalidatePath(`/projects/${parsed.data.projectId}`);
  return { status: "success", message: "Document uploaded securely." };
}

const projectEditSchema = projectSchema.extend({
  constructionAmount: z.coerce.number().min(0),
  landAmount: z.coerce.number().min(0),
  softCostsAmount: z.coerce.number().min(0),
  reserveAmount: z.coerce.number().min(0),
});

export async function updateProjectAction(
  projectId: string,
  _previousState: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();
  const parsed = projectEditSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message ?? "Check the project details." };
  }
  const { constructionAmount, landAmount, softCostsAmount, reserveAmount, ...project } = parsed.data;
  const breakdownTotal = constructionAmount + landAmount + softCostsAmount + reserveAmount;
  if (Math.abs(breakdownTotal - project.budgetTotal) > 1) {
    return { status: "error", message: "The four budget categories must add up to the total budget." };
  }
  try {
    await getDb().update(projects).set({
      ...project,
      budgetBreakdown: [
        { label: "Construction", amount: constructionAmount },
        { label: "Land", amount: landAmount },
        { label: "Soft costs", amount: softCostsAmount },
        { label: "Reserve", amount: reserveAmount },
      ],
      updatedAt: new Date(),
    }).where(eq(projects.id, projectId));
  } catch (error) {
    console.error("[admin:updateProject] Save failed", { projectId, error });
    return { status: "error", message: "The project could not be saved. Please try again." };
  }
  revalidatePath("/admin");
  revalidatePath("/projects");
  revalidatePath(`/projects/${projectId}`);
  return { status: "success", message: "Project details saved." };
}

export async function deleteProjectAction(
  projectId: string,
  expectedName: string,
  _previousState: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();
  if (formData.get("confirmation") !== expectedName) {
    return { status: "error", message: `Type ${expectedName} exactly to confirm.` };
  }
  const db = getDb();
  const [documentRows, distributionRows] = await Promise.all([
    db.select({ pathname: documents.pathname }).from(documents).where(eq(documents.projectId, projectId)),
    db.select({ pathname: distributions.receiptPathname }).from(distributions).where(eq(distributions.projectId, projectId)),
  ]);
  const paths = [...documentRows, ...distributionRows].map((row) => row.pathname).filter((pathname): pathname is string => Boolean(pathname));
  try {
    if (paths.length) await del(paths);
  } catch {
    return { status: "error", message: "The private files could not be removed, so the project was left unchanged." };
  }
  await db.delete(projects).where(eq(projects.id, projectId));
  revalidatePath("/admin");
  revalidatePath("/projects");
  redirect("/projects");
}

const investorEditSchema = investorSchema.extend({
  phone: z.string().trim().max(40).optional(),
});

export async function updateInvestorAction(
  investorId: string,
  _previousState: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();
  const parsed = investorEditSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone") || undefined,
    bankDetails: formData.get("bankDetails") || "Not provided",
  });
  if (!parsed.success) return { status: "error", message: parsed.error.issues[0]?.message ?? "Check the investor details." };
  try {
    await getDb().update(investors).set({ ...parsed.data, updatedAt: new Date() }).where(eq(investors.id, investorId));
  } catch {
    return { status: "error", message: "That email is already assigned to another investor." };
  }
  revalidatePath("/admin/investors");
  revalidatePath(`/admin/investors/${investorId}`);
  return { status: "success", message: "Investor details saved." };
}

export async function deleteInvestorAction(
  investorId: string,
  expectedEmail: string,
  _previousState: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();
  if (String(formData.get("confirmation") ?? "").toLowerCase() !== expectedEmail.toLowerCase()) {
    return { status: "error", message: `Type ${expectedEmail} exactly to confirm.` };
  }
  const db = getDb();
  const [documentRows, distributionRows] = await Promise.all([
    db.select({ pathname: documents.pathname }).from(documents).where(eq(documents.investorId, investorId)),
    db.select({ pathname: distributions.receiptPathname }).from(distributions).where(eq(distributions.investorId, investorId)),
  ]);
  const paths = [...documentRows, ...distributionRows].map((row) => row.pathname).filter((pathname): pathname is string => Boolean(pathname));
  try {
    if (paths.length) await del(paths);
  } catch {
    return { status: "error", message: "The investor's private files could not be removed, so the account was left unchanged." };
  }
  await db.delete(investors).where(eq(investors.id, investorId));
  revalidatePath("/admin/investors");
  revalidatePath("/admin");
  redirect("/admin/investors");
}

const distributionSchema = z.object({
  projectId: z.string().min(1),
  investorId: z.string().min(1),
  amount: z.coerce.number().positive(),
  date: z.string().min(10),
});

async function uploadReceipt(file: FormDataEntryValue | null, projectId: string) {
  if (!(file instanceof File) || file.size === 0) return null;
  if (file.size > 10 * 1024 * 1024) throw new Error("Receipt files must be 10 MB or smaller.");
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
  const blob = await put(`receipts/${projectId}/${crypto.randomUUID()}-${safeName}`, file, { access: "private", addRandomSuffix: false });
  return blob.pathname;
}

async function validatePosition(projectId: string, investorId: string) {
  const [stake] = await getDb().select({ investorId: investorProjectStakes.investorId }).from(investorProjectStakes).where(and(eq(investorProjectStakes.projectId, projectId), eq(investorProjectStakes.investorId, investorId))).limit(1);
  return Boolean(stake);
}

export async function createDistributionAction(
  _previousState: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();
  const parsed = distributionSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { status: "error", message: parsed.error.issues[0]?.message ?? "Check the distribution details." };
  if (!(await validatePosition(parsed.data.projectId, parsed.data.investorId))) {
    return { status: "error", message: "Assign this investor ownership in the project before recording a distribution." };
  }
  let receiptPathname: string | null = null;
  try {
    receiptPathname = await uploadReceipt(formData.get("receipt"), parsed.data.projectId);
    await getDb().insert(distributions).values({ id: `dist-${crypto.randomUUID()}`, ...parsed.data, receiptPathname });
  } catch (error) {
    if (receiptPathname) await del(receiptPathname).catch(() => undefined);
    return { status: "error", message: error instanceof Error ? error.message : "The distribution could not be created." };
  }
  revalidatePath("/admin/distributions");
  revalidatePath("/admin");
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/documents");
  revalidatePath(`/projects/${parsed.data.projectId}`);
  return { status: "success", message: "Distribution recorded." };
}

export async function updateDistributionAction(
  distributionId: string,
  _previousState: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();
  const parsed = distributionSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { status: "error", message: parsed.error.issues[0]?.message ?? "Check the distribution details." };
  if (!(await validatePosition(parsed.data.projectId, parsed.data.investorId))) {
    return { status: "error", message: "Assign this investor ownership in the project before moving the distribution." };
  }
  const db = getDb();
  const [current] = await db.select().from(distributions).where(eq(distributions.id, distributionId)).limit(1);
  if (!current) return { status: "error", message: "Distribution not found." };
  let replacementPath: string | null = null;
  try {
    replacementPath = await uploadReceipt(formData.get("receipt"), parsed.data.projectId);
    await db.update(distributions).set({ ...parsed.data, receiptPathname: replacementPath ?? current.receiptPathname }).where(eq(distributions.id, distributionId));
  } catch (error) {
    if (replacementPath) await del(replacementPath).catch(() => undefined);
    return { status: "error", message: error instanceof Error ? error.message : "The distribution could not be updated." };
  }
  if (replacementPath && current.receiptPathname) await del(current.receiptPathname).catch(() => undefined);
  revalidatePath("/admin/distributions");
  revalidatePath("/admin");
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/documents");
  revalidatePath(`/projects/${current.projectId}`);
  revalidatePath(`/projects/${parsed.data.projectId}`);
  return { status: "success", message: "Distribution updated." };
}

export async function deleteDistributionAction(
  distributionId: string,
  _previousState: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();
  if (formData.get("confirmation") !== "DELETE") return { status: "error", message: "Type DELETE to confirm." };
  const db = getDb();
  const [current] = await db.select().from(distributions).where(eq(distributions.id, distributionId)).limit(1);
  if (!current) return { status: "error", message: "Distribution not found." };
  try {
    if (current.receiptPathname) await del(current.receiptPathname);
  } catch {
    return { status: "error", message: "The private receipt could not be removed, so the record was left unchanged." };
  }
  await db.delete(distributions).where(eq(distributions.id, distributionId));
  revalidatePath("/admin/distributions");
  revalidatePath("/admin");
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/documents");
  revalidatePath(`/projects/${current.projectId}`);
  return { status: "success", message: "Distribution removed." };
}

export async function updateDocumentAction(
  documentId: string,
  _previousState: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();
  const parsed = documentSchema.safeParse({
    title: formData.get("title"),
    projectId: formData.get("projectId"),
    investorId: formData.get("investorId") || undefined,
    type: formData.get("type"),
  });
  if (!parsed.success) return { status: "error", message: parsed.error.issues[0]?.message ?? "Check the document details." };
  if (parsed.data.investorId && !(await validatePosition(parsed.data.projectId, parsed.data.investorId))) {
    return { status: "error", message: "That investor does not have ownership in the selected project." };
  }
  const db = getDb();
  const [current] = await db.select().from(documents).where(eq(documents.id, documentId)).limit(1);
  if (!current) return { status: "error", message: "Document not found." };
  const file = formData.get("file");
  let replacementPath: string | null = null;
  try {
    if (file instanceof File && file.size > 0) {
      if (file.size > 10 * 1024 * 1024) return { status: "error", message: "Documents must be 10 MB or smaller." };
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
      replacementPath = (await put(`projects/${parsed.data.projectId}/${crypto.randomUUID()}-${safeName}`, file, { access: "private", addRandomSuffix: false })).pathname;
    }
    await db.update(documents).set({
      ...parsed.data,
      investorId: parsed.data.investorId || null,
      pathname: replacementPath ?? current.pathname,
      externalUrl: replacementPath ? null : current.externalUrl,
    }).where(eq(documents.id, documentId));
  } catch {
    if (replacementPath) await del(replacementPath).catch(() => undefined);
    return { status: "error", message: "The document could not be updated." };
  }
  if (replacementPath && current.pathname) await del(current.pathname).catch(() => undefined);
  revalidatePath("/admin/documents");
  revalidatePath("/dashboard/documents");
  revalidatePath(`/projects/${current.projectId}`);
  revalidatePath(`/projects/${parsed.data.projectId}`);
  return { status: "success", message: "Document updated." };
}

export async function deleteDocumentAction(
  documentId: string,
  _previousState: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();
  if (formData.get("confirmation") !== "DELETE") return { status: "error", message: "Type DELETE to confirm." };
  const db = getDb();
  const [current] = await db.select().from(documents).where(eq(documents.id, documentId)).limit(1);
  if (!current) return { status: "error", message: "Document not found." };
  try {
    if (current.pathname) await del(current.pathname);
  } catch {
    return { status: "error", message: "The private file could not be removed, so the document was left unchanged." };
  }
  await db.delete(documents).where(eq(documents.id, documentId));
  revalidatePath("/admin/documents");
  revalidatePath("/dashboard/documents");
  revalidatePath(`/projects/${current.projectId}`);
  return { status: "success", message: "Document removed." };
}

const workbookInvestorSchema = z.object({ id: z.string().min(1), name: z.string().min(2), email: z.email(), bank_details: z.string().optional() });
const workbookProjectSchema = z.object({ id: z.string().min(1), name: z.string().min(2), location: z.string().min(1), status: z.enum(["pre-construction", "in-progress", "delayed", "complete"]), construction_pct: z.coerce.number().min(0).max(100), occupancy_pct: z.coerce.number().min(0).max(100), budget_total: z.coerce.number().positive(), est_completion_date: z.string().min(8), projected_irr: z.coerce.number() });
const workbookStakeSchema = z.object({ investor_id: z.string().min(1), project_id: z.string().min(1), stake_pct: z.coerce.number().min(0).max(100), capital_committed: z.coerce.number().positive() });
const workbookDistributionSchema = z.object({ id: z.string().min(1), investor_id: z.string().min(1), project_id: z.string().min(1), amount: z.coerce.number().positive(), date: z.string().min(8), receipt_file_url: z.string().optional() });
const workbookDocumentSchema = z.object({ id: z.string().min(1), project_id: z.string().min(1), investor_id: z.string().optional(), title: z.string().min(2), file_url: z.string().optional(), uploaded_date: z.string().min(8), type: z.enum(["receipt", "report", "photo"]) });

export async function importWorkbookAction(
  _previousState: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();
  const file = formData.get("workbook");
  if (!(file instanceof File) || file.size === 0) return { status: "error", message: "Choose an Excel workbook." };
  if (file.size > 15 * 1024 * 1024) return { status: "error", message: "The workbook must be 15 MB or smaller." };
  try {
    const XLSX = await import("xlsx");
    const workbook = XLSX.read(await file.arrayBuffer(), { type: "array" });
    const sheetRows = (name: string) => {
      const sheet = workbook.Sheets[name];
      if (!sheet) throw new Error(`Missing sheet: ${name}`);
      return XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { raw: false });
    };
    const investorRows = z.array(workbookInvestorSchema).parse(sheetRows("Investors"));
    const projectRows = z.array(workbookProjectSchema).parse(sheetRows("Projects"));
    const stakeRows = z.array(workbookStakeSchema).parse(sheetRows("Investor_Project_Stakes"));
    const distributionRows = z.array(workbookDistributionSchema).parse(sheetRows("Distributions"));
    const documentRows = z.array(workbookDocumentSchema).parse(sheetRows("Documents"));
    const db = getDb();

    for (const row of investorRows) {
      await db.insert(investors).values({ id: row.id, name: row.name, email: row.email.toLowerCase(), bankDetails: row.bank_details || "Not provided" }).onConflictDoUpdate({ target: investors.id, set: { name: row.name, email: row.email.toLowerCase(), bankDetails: row.bank_details || "Not provided", updatedAt: new Date() } });
    }
    for (const row of projectRows) {
      const values = { id: row.id, name: row.name, location: row.location, status: row.status, constructionPct: row.construction_pct, occupancyPct: row.occupancy_pct, budgetTotal: row.budget_total, estimatedCompletionDate: row.est_completion_date, projectedIrr: row.projected_irr, budgetBreakdown: [{ label: "Construction", amount: Math.round(row.budget_total * .55) }, { label: "Land", amount: Math.round(row.budget_total * .25) }, { label: "Soft costs", amount: Math.round(row.budget_total * .12) }, { label: "Reserve", amount: Math.round(row.budget_total * .08) }] };
      await db.insert(projects).values(values).onConflictDoUpdate({ target: projects.id, set: { ...values, updatedAt: new Date() } });
    }
    for (const row of stakeRows) {
      await db.insert(investorProjectStakes).values({ investorId: row.investor_id, projectId: row.project_id, stakePct: row.stake_pct, capitalCommitted: row.capital_committed }).onConflictDoUpdate({ target: [investorProjectStakes.investorId, investorProjectStakes.projectId], set: { stakePct: row.stake_pct, capitalCommitted: row.capital_committed, updatedAt: new Date() } });
    }
    for (const row of distributionRows) {
      await db.insert(distributions).values({ id: row.id, investorId: row.investor_id, projectId: row.project_id, amount: row.amount, date: row.date }).onConflictDoUpdate({ target: distributions.id, set: { investorId: row.investor_id, projectId: row.project_id, amount: row.amount, date: row.date } });
    }
    for (const row of documentRows) {
      await db.insert(documents).values({ id: row.id, projectId: row.project_id, investorId: row.investor_id || null, title: row.title, externalUrl: row.file_url || null, uploadedDate: row.uploaded_date, type: row.type }).onConflictDoUpdate({ target: documents.id, set: { projectId: row.project_id, investorId: row.investor_id || null, title: row.title, externalUrl: row.file_url || null, uploadedDate: row.uploaded_date, type: row.type } });
    }
    revalidatePath("/admin");
    revalidatePath("/admin/investors");
    revalidatePath("/admin/distributions");
    revalidatePath("/admin/documents");
    revalidatePath("/projects");
    return { status: "success", message: `Imported ${investorRows.length} investors, ${projectRows.length} projects, ${stakeRows.length} positions, ${distributionRows.length} distributions, and ${documentRows.length} documents.` };
  } catch (error) {
    return { status: "error", message: error instanceof Error ? `Import stopped: ${error.message}` : "The workbook could not be imported." };
  }
}
