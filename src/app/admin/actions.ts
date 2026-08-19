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
  if (session?.role !== "admin") throw new Error("Se requiere acceso de administrador.");
  return session;
}

const investorSchema = z.object({
  name: z.string().trim().min(2, "Escribe el nombre completo del inversionista."),
  email: z.email("Escribe un correo electrónico válido.").transform((value) => value.toLowerCase()),
  bankDetails: z.string().trim().max(120).default("No proporcionado"),
});

export async function inviteInvestorAction(
  _previousState: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();
  const parsed = investorSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    bankDetails: formData.get("bankDetails") || "No proporcionado",
  });
  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message ?? "Revisa los datos del inversionista." };
  }

  const db = getDb();
  const id = `inv-${crypto.randomUUID()}`;
  try {
    await db.insert(investors).values({ id, ...parsed.data });
  } catch {
    return { status: "error", message: "Ese correo ya está conectado a un inversionista." };
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
      message: "El inversionista se guardó, pero no se pudo enviar la invitación. Puedes intentarlo de nuevo más tarde.",
    };
  }

  revalidatePath("/admin/investors");
  return { status: "success", message: `Invitación enviada a ${parsed.data.email}.` };
}

const projectSchema = z.object({
  name: z.string().trim().min(2, "Escribe el nombre del proyecto."),
  location: z.string().trim().min(2, "Escribe la ubicación del proyecto."),
  status: z.enum(["pre-construction", "in-progress", "delayed", "complete"]),
  constructionPct: z.coerce.number().min(0, "El avance no puede ser negativo.").max(100, "El avance no puede superar 100%."),
  occupancyPct: z.coerce.number().min(0, "La ocupación no puede ser negativa.").max(100, "La ocupación no puede superar 100%."),
  budgetTotal: z.coerce.number().positive("El presupuesto debe ser mayor que cero."),
  estimatedCompletionDate: z.string().min(10, "Selecciona la fecha estimada de terminación."),
  projectedIrr: z.coerce.number().min(-100, "La TIR mínima es -100%.").max(100, "La TIR máxima es 100%."),
});

export async function createProjectAction(
  _previousState: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();
  const parsed = projectSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message ?? "Revisa los datos del proyecto." };
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
        { label: "Construcción", amount: Math.round(parsed.data.budgetTotal * 0.55) },
        { label: "Terreno", amount: Math.round(parsed.data.budgetTotal * 0.25) },
        { label: "Costos indirectos", amount: Math.round(parsed.data.budgetTotal * 0.12) },
        { label: "Reserva", amount: Math.round(parsed.data.budgetTotal * 0.08) },
      ],
      milestones: [],
    });
  } catch {
    return { status: "error", message: "Ya existe un proyecto con ese nombre." };
  }
  revalidatePath("/admin");
  return { status: "success", message: `${parsed.data.name} fue creado.` };
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
      return { status: "error", message: "Cada porcentaje de participación debe estar entre 0 y 100." };
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
  return { status: "success", message: "Participaciones guardadas." };
}

const documentSchema = z.object({
  title: z.string().trim().min(2, "Escribe el título del documento."),
  projectId: z.string().min(1, "Selecciona un proyecto."),
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
    return { status: "error", message: "Selecciona un archivo y completa todos los campos." };
  }
  if (parsed.data.investorId && !(await validatePosition(parsed.data.projectId, parsed.data.investorId))) {
    return { status: "error", message: "Ese inversionista no tiene participación en el proyecto seleccionado." };
  }
  if (file.size > 10 * 1024 * 1024) {
    return { status: "error", message: "Los documentos deben pesar 10 MB o menos." };
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
    return { status: "error", message: "No se pudo completar la carga segura. Inténtalo de nuevo." };
  }
  revalidatePath("/admin/documents");
  revalidatePath("/dashboard/documents");
  revalidatePath(`/projects/${parsed.data.projectId}`);
  return { status: "success", message: "Documento cargado de forma segura." };
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
    return { status: "error", message: parsed.error.issues[0]?.message ?? "Revisa los datos del proyecto." };
  }
  const { constructionAmount, landAmount, softCostsAmount, reserveAmount, ...project } = parsed.data;
  const breakdownTotal = constructionAmount + landAmount + softCostsAmount + reserveAmount;
  if (Math.abs(breakdownTotal - project.budgetTotal) > 1) {
    return { status: "error", message: "Las cuatro categorías deben sumar el presupuesto total." };
  }
  const milestones = Array.from({ length: 6 }, (_, index) => ({
    label: String(formData.get(`milestoneLabel${index}`) ?? "").trim(),
    detail: String(formData.get(`milestoneDetail${index}`) ?? "").trim(),
    complete: formData.get(`milestoneComplete${index}`) === "on",
  })).filter((milestone) => milestone.label.length > 0);
  if (milestones.some((milestone) => milestone.detail.length === 0)) {
    return { status: "error", message: "Cada hito con nombre necesita una descripción o fecha." };
  }
  try {
    await getDb().update(projects).set({
      ...project,
      budgetBreakdown: [
        { label: "Construcción", amount: constructionAmount },
        { label: "Terreno", amount: landAmount },
        { label: "Costos indirectos", amount: softCostsAmount },
        { label: "Reserva", amount: reserveAmount },
      ],
      milestones,
      updatedAt: new Date(),
    }).where(eq(projects.id, projectId));
  } catch (error) {
    console.error("[admin:updateProject] Save failed", { projectId, error });
    return { status: "error", message: "No se pudo guardar el proyecto. Inténtalo de nuevo." };
  }
  revalidatePath("/admin");
  revalidatePath("/projects");
  revalidatePath(`/projects/${projectId}`);
  return { status: "success", message: "Proyecto guardado." };
}

export async function deleteProjectAction(
  projectId: string,
  expectedName: string,
  _previousState: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();
  if (formData.get("confirmation") !== expectedName) {
    return { status: "error", message: `Escribe ${expectedName} exactamente para confirmar.` };
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
    return { status: "error", message: "No se pudieron eliminar los archivos privados; el proyecto no fue modificado." };
  }
  await db.delete(projects).where(eq(projects.id, projectId));
  revalidatePath("/admin");
  revalidatePath("/projects");
  redirect("/projects");
}

const investorEditSchema = investorSchema.extend({
  phone: z.string().trim().max(40, "El teléfono es demasiado largo.").optional(),
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
    bankDetails: formData.get("bankDetails") || "No proporcionado",
  });
  if (!parsed.success) return { status: "error", message: parsed.error.issues[0]?.message ?? "Revisa los datos del inversionista." };
  try {
    await getDb().update(investors).set({ ...parsed.data, updatedAt: new Date() }).where(eq(investors.id, investorId));
  } catch {
    return { status: "error", message: "Ese correo ya está asignado a otro inversionista." };
  }
  revalidatePath("/admin/investors");
  revalidatePath(`/admin/investors/${investorId}`);
  return { status: "success", message: "Datos del inversionista guardados." };
}

export async function deleteInvestorAction(
  investorId: string,
  expectedEmail: string,
  _previousState: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();
  if (String(formData.get("confirmation") ?? "").toLowerCase() !== expectedEmail.toLowerCase()) {
    return { status: "error", message: `Escribe ${expectedEmail} exactamente para confirmar.` };
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
    return { status: "error", message: "No se pudieron eliminar los archivos privados; la cuenta no fue modificada." };
  }
  await db.delete(investors).where(eq(investors.id, investorId));
  revalidatePath("/admin/investors");
  revalidatePath("/admin");
  redirect("/admin/investors");
}

const distributionSchema = z.object({
  projectId: z.string().min(1, "Selecciona un proyecto."),
  investorId: z.string().min(1, "Selecciona un inversionista."),
  amount: z.coerce.number().positive("El monto debe ser mayor que cero."),
  date: z.string().min(10, "Selecciona una fecha."),
});

async function uploadReceipt(file: FormDataEntryValue | null, projectId: string) {
  if (!(file instanceof File) || file.size === 0) return null;
  if (file.size > 10 * 1024 * 1024) throw new Error("Los comprobantes deben pesar 10 MB o menos.");
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
  if (!parsed.success) return { status: "error", message: parsed.error.issues[0]?.message ?? "Revisa los datos de la distribución." };
  if (!(await validatePosition(parsed.data.projectId, parsed.data.investorId))) {
    return { status: "error", message: "Asigna una participación al inversionista antes de registrar una distribución." };
  }
  let receiptPathname: string | null = null;
  try {
    receiptPathname = await uploadReceipt(formData.get("receipt"), parsed.data.projectId);
    await getDb().insert(distributions).values({ id: `dist-${crypto.randomUUID()}`, ...parsed.data, receiptPathname });
  } catch (error) {
    if (receiptPathname) await del(receiptPathname).catch(() => undefined);
    return { status: "error", message: error instanceof Error ? error.message : "No se pudo registrar la distribución." };
  }
  revalidatePath("/admin/distributions");
  revalidatePath("/admin");
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/documents");
  revalidatePath(`/projects/${parsed.data.projectId}`);
  return { status: "success", message: "Distribución registrada." };
}

export async function updateDistributionAction(
  distributionId: string,
  _previousState: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();
  const parsed = distributionSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { status: "error", message: parsed.error.issues[0]?.message ?? "Revisa los datos de la distribución." };
  if (!(await validatePosition(parsed.data.projectId, parsed.data.investorId))) {
    return { status: "error", message: "Asigna una participación al inversionista antes de mover la distribución." };
  }
  const db = getDb();
  const [current] = await db.select().from(distributions).where(eq(distributions.id, distributionId)).limit(1);
  if (!current) return { status: "error", message: "No se encontró la distribución." };
  let replacementPath: string | null = null;
  try {
    replacementPath = await uploadReceipt(formData.get("receipt"), parsed.data.projectId);
    await db.update(distributions).set({ ...parsed.data, receiptPathname: replacementPath ?? current.receiptPathname }).where(eq(distributions.id, distributionId));
  } catch (error) {
    if (replacementPath) await del(replacementPath).catch(() => undefined);
    return { status: "error", message: error instanceof Error ? error.message : "No se pudo actualizar la distribución." };
  }
  if (replacementPath && current.receiptPathname) await del(current.receiptPathname).catch(() => undefined);
  revalidatePath("/admin/distributions");
  revalidatePath("/admin");
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/documents");
  revalidatePath(`/projects/${current.projectId}`);
  revalidatePath(`/projects/${parsed.data.projectId}`);
  return { status: "success", message: "Distribución actualizada." };
}

export async function deleteDistributionAction(
  distributionId: string,
  _previousState: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();
  if (formData.get("confirmation") !== "ELIMINAR") return { status: "error", message: "Escribe ELIMINAR para confirmar." };
  const db = getDb();
  const [current] = await db.select().from(distributions).where(eq(distributions.id, distributionId)).limit(1);
  if (!current) return { status: "error", message: "No se encontró la distribución." };
  try {
    if (current.receiptPathname) await del(current.receiptPathname);
  } catch {
    return { status: "error", message: "No se pudo eliminar el comprobante privado; el registro no fue modificado." };
  }
  await db.delete(distributions).where(eq(distributions.id, distributionId));
  revalidatePath("/admin/distributions");
  revalidatePath("/admin");
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/documents");
  revalidatePath(`/projects/${current.projectId}`);
  return { status: "success", message: "Distribución eliminada." };
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
  if (!parsed.success) return { status: "error", message: parsed.error.issues[0]?.message ?? "Revisa los datos del documento." };
  if (parsed.data.investorId && !(await validatePosition(parsed.data.projectId, parsed.data.investorId))) {
    return { status: "error", message: "Ese inversionista no tiene participación en el proyecto seleccionado." };
  }
  const db = getDb();
  const [current] = await db.select().from(documents).where(eq(documents.id, documentId)).limit(1);
  if (!current) return { status: "error", message: "No se encontró el documento." };
  const file = formData.get("file");
  let replacementPath: string | null = null;
  try {
    if (file instanceof File && file.size > 0) {
      if (file.size > 10 * 1024 * 1024) return { status: "error", message: "Los documentos deben pesar 10 MB o menos." };
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
    return { status: "error", message: "No se pudo actualizar el documento." };
  }
  if (replacementPath && current.pathname) await del(current.pathname).catch(() => undefined);
  revalidatePath("/admin/documents");
  revalidatePath("/dashboard/documents");
  revalidatePath(`/projects/${current.projectId}`);
  revalidatePath(`/projects/${parsed.data.projectId}`);
  return { status: "success", message: "Documento actualizado." };
}

export async function deleteDocumentAction(
  documentId: string,
  _previousState: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();
  if (formData.get("confirmation") !== "ELIMINAR") return { status: "error", message: "Escribe ELIMINAR para confirmar." };
  const db = getDb();
  const [current] = await db.select().from(documents).where(eq(documents.id, documentId)).limit(1);
  if (!current) return { status: "error", message: "No se encontró el documento." };
  try {
    if (current.pathname) await del(current.pathname);
  } catch {
    return { status: "error", message: "No se pudo eliminar el archivo privado; el documento no fue modificado." };
  }
  await db.delete(documents).where(eq(documents.id, documentId));
  revalidatePath("/admin/documents");
  revalidatePath("/dashboard/documents");
  revalidatePath(`/projects/${current.projectId}`);
  return { status: "success", message: "Documento eliminado." };
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
  if (!(file instanceof File) || file.size === 0) return { status: "error", message: "Selecciona un archivo de Excel." };
  if (file.size > 15 * 1024 * 1024) return { status: "error", message: "El archivo de Excel debe pesar 15 MB o menos." };
  try {
    const XLSX = await import("xlsx");
    const workbook = XLSX.read(await file.arrayBuffer(), { type: "array" });
    const sheetRows = (name: string) => {
      const sheet = workbook.Sheets[name];
      if (!sheet) throw new Error(`Falta la hoja: ${name}`);
      return XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { raw: false });
    };
    const investorRows = z.array(workbookInvestorSchema).parse(sheetRows("Investors"));
    const projectRows = z.array(workbookProjectSchema).parse(sheetRows("Projects"));
    const stakeRows = z.array(workbookStakeSchema).parse(sheetRows("Investor_Project_Stakes"));
    const distributionRows = z.array(workbookDistributionSchema).parse(sheetRows("Distributions"));
    const documentRows = z.array(workbookDocumentSchema).parse(sheetRows("Documents"));
    const db = getDb();

    for (const row of investorRows) {
      await db.insert(investors).values({ id: row.id, name: row.name, email: row.email.toLowerCase(), bankDetails: row.bank_details || "No proporcionado" }).onConflictDoUpdate({ target: investors.id, set: { name: row.name, email: row.email.toLowerCase(), bankDetails: row.bank_details || "No proporcionado", updatedAt: new Date() } });
    }
    for (const row of projectRows) {
      const values = { id: row.id, name: row.name, location: row.location, status: row.status, constructionPct: row.construction_pct, occupancyPct: row.occupancy_pct, budgetTotal: row.budget_total, estimatedCompletionDate: row.est_completion_date, projectedIrr: row.projected_irr, budgetBreakdown: [{ label: "Construcción", amount: Math.round(row.budget_total * .55) }, { label: "Terreno", amount: Math.round(row.budget_total * .25) }, { label: "Costos indirectos", amount: Math.round(row.budget_total * .12) }, { label: "Reserva", amount: Math.round(row.budget_total * .08) }], milestones: [] };
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
    return { status: "success", message: `Se importaron ${investorRows.length} inversionistas, ${projectRows.length} proyectos, ${stakeRows.length} participaciones, ${distributionRows.length} distribuciones y ${documentRows.length} documentos.` };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { status: "error", message: "La importación se detuvo: revisa el formato y los campos obligatorios del archivo." };
    }
    return { status: "error", message: error instanceof Error ? `La importación se detuvo: ${error.message}` : "No se pudo importar el archivo." };
  }
}
