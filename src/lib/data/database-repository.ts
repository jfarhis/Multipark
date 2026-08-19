import { asc } from "drizzle-orm";
import { getDb } from "@/db";
import {
  distributions,
  documents,
  investorProjectStakes,
  investors,
  projects,
} from "@/db/schema";
import type { DashboardData } from "../types";
import type { DashboardRepository } from "./repository";

export class DatabaseDashboardRepository implements DashboardRepository {
  async getDashboardData(): Promise<DashboardData> {
    const db = getDb();
    const [investorRows, projectRows, stakeRows, distributionRows, documentRows] =
      await Promise.all([
        db.select().from(investors).orderBy(asc(investors.name)),
        db.select().from(projects).orderBy(asc(projects.name)),
        db.select().from(investorProjectStakes),
        db.select().from(distributions).orderBy(asc(distributions.date)),
        db.select().from(documents).orderBy(asc(documents.uploadedDate)),
      ]);

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
        receiptFileUrl: row.receiptPathname
          ? `/api/receipts/${row.id}`
          : "#",
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
        ...distributionRows.filter((row) => Boolean(row.receiptPathname)).map((row) => ({
          id: `distribution-receipt-${row.id}`,
          projectId: row.projectId,
          investorId: row.investorId,
          title: `Distribution receipt — ${row.date}`,
          fileUrl: `/api/receipts/${row.id}`,
          uploadedDate: row.date,
          type: "receipt" as const,
        })),
      ],
    };
  }
}
