import { and, asc, eq, inArray, isNull, or } from "drizzle-orm";
import { getDb } from "@/db";
import {
  distributions,
  documents,
  investorProjectStakes,
  investors,
  projects,
} from "@/db/schema";
import type { DashboardData, Session } from "../types";

type InvestorRow = typeof investors.$inferSelect;
type ProjectRow = typeof projects.$inferSelect;
type StakeRow = typeof investorProjectStakes.$inferSelect;
type DistributionRow = typeof distributions.$inferSelect;
type DocumentRow = typeof documents.$inferSelect;

function emptyData(): DashboardData {
  return { investors: [], projects: [], stakes: [], distributions: [], documents: [] };
}

function toDashboardData(
  investorRows: InvestorRow[],
  projectRows: ProjectRow[],
  stakeRows: StakeRow[],
  distributionRows: DistributionRow[],
  documentRows: DocumentRow[],
): DashboardData {
  return {
    investors: investorRows.map((row) => ({
      id: row.id,
      name: row.name,
      email: row.email,
      phone: row.phone,
      bankDetails: row.bankDetails,
    })),
    projects: projectRows.map((row) => ({
      id: row.id,
      name: row.name,
      location: row.location,
      status: row.status,
      constructionPct: row.constructionPct,
      occupancyPct: row.occupancyPct,
      budgetTotal: row.budgetTotal,
      estimatedCompletionDate: row.estimatedCompletionDate,
      projectedIrr: row.projectedIrr,
      budgetBreakdown: row.budgetBreakdown,
      milestones: row.milestones,
    })),
    stakes: stakeRows.map((row) => ({
      investorId: row.investorId,
      projectId: row.projectId,
      stakePct: row.stakePct,
      capitalCommitted: row.capitalCommitted,
    })),
    distributions: distributionRows.map((row) => ({
      id: row.id,
      projectId: row.projectId,
      investorId: row.investorId,
      amount: row.amount,
      date: row.date,
      receiptFileUrl: row.receiptPathname ? `/api/receipts/${row.id}` : "#",
    })),
    documents: [
      ...documentRows.map((row) => ({
        id: row.id,
        projectId: row.projectId,
        investorId: row.investorId,
        title: row.title,
        fileUrl: row.pathname
          ? `/api/documents/${row.id}`
          : (row.externalUrl?.startsWith("https://") || row.externalUrl?.startsWith("http://") ? row.externalUrl : "#"),
        uploadedDate: row.uploadedDate,
        type: row.type,
      })),
      ...distributionRows
        .filter((row) => Boolean(row.receiptPathname))
        .map((row) => ({
          id: `distribution-receipt-${row.id}`,
          projectId: row.projectId,
          investorId: row.investorId,
          title: `Comprobante de distribución — ${row.date}`,
          fileUrl: `/api/receipts/${row.id}`,
          uploadedDate: row.date,
          type: "receipt" as const,
        })),
    ],
  };
}

// Every read goes through this function so that an investor session can only
// ever load its own slice of the portfolio, no matter what the page renders.
export async function getDashboardData(session: Session | null): Promise<DashboardData> {
  if (!session || !process.env.DATABASE_URL) return emptyData();
  const db = getDb();

  if (session.role === "admin") {
    const [investorRows, projectRows, stakeRows, distributionRows, documentRows] =
      await Promise.all([
        db.select().from(investors).orderBy(asc(investors.name)),
        db.select().from(projects).orderBy(asc(projects.name)),
        db.select().from(investorProjectStakes),
        db.select().from(distributions).orderBy(asc(distributions.date)),
        db.select().from(documents).orderBy(asc(documents.uploadedDate)),
      ]);
    return toDashboardData(investorRows, projectRows, stakeRows, distributionRows, documentRows);
  }

  const investorId = session.investorId;
  if (!investorId) return emptyData();

  const [investorRows, stakeRows, distributionRows] = await Promise.all([
    db.select().from(investors).where(eq(investors.id, investorId)),
    db.select().from(investorProjectStakes).where(eq(investorProjectStakes.investorId, investorId)),
    db.select().from(distributions).where(eq(distributions.investorId, investorId)).orderBy(asc(distributions.date)),
  ]);

  const projectIds = stakeRows.map((row) => row.projectId);
  const [projectRows, documentRows] = projectIds.length
    ? await Promise.all([
      db.select().from(projects).where(inArray(projects.id, projectIds)).orderBy(asc(projects.name)),
      db
        .select()
        .from(documents)
        .where(
          and(
            inArray(documents.projectId, projectIds),
            or(isNull(documents.investorId), eq(documents.investorId, investorId)),
          ),
        )
        .orderBy(asc(documents.uploadedDate)),
    ])
    : [[], []];

  return toDashboardData(investorRows, projectRows, stakeRows, distributionRows, documentRows);
}
