import * as XLSX from "xlsx";
import type {
  DashboardData,
  Distribution,
  Investor,
  InvestorProjectStake,
  Project,
  ProjectDocument,
} from "../types";
import type { DashboardRepository } from "./repository";

const rows = <T>(workbook: XLSX.WorkBook, sheetName: string) => {
  const sheet = workbook.Sheets[sheetName];
  if (!sheet) throw new Error(`Falta la hoja de Excel: ${sheetName}`);
  return XLSX.utils.sheet_to_json<T>(sheet, { raw: false });
};

export class ExcelDashboardRepository implements DashboardRepository {
  constructor(private readonly workbookPath: string) {}

  async getDashboardData(): Promise<DashboardData> {
    const workbook = XLSX.readFile(this.workbookPath);
    const investorRows = rows<Record<string, string>>(workbook, "Investors");
    const projectRows = rows<Record<string, string>>(workbook, "Projects");
    const stakeRows = rows<Record<string, string>>(
      workbook,
      "Investor_Project_Stakes",
    );
    const distributionRows = rows<Record<string, string>>(
      workbook,
      "Distributions",
    );
    const documentRows = rows<Record<string, string>>(workbook, "Documents");

    const investors: Investor[] = investorRows.map((row) => ({
      id: row.id,
      name: row.name,
      email: row.email,
      bankDetails: row.bank_details,
    }));
    const projects: Project[] = projectRows.map((row) => ({
      id: row.id,
      name: row.name,
      location: row.location,
      status: row.status as Project["status"],
      constructionPct: Number(row.construction_pct),
      occupancyPct: Number(row.occupancy_pct),
      budgetTotal: Number(row.budget_total),
      estimatedCompletionDate: row.est_completion_date,
      projectedIrr: Number(row.projected_irr ?? 0),
      budgetBreakdown: [],
      milestones: [],
    }));
    const stakes: InvestorProjectStake[] = stakeRows.map((row) => ({
      investorId: row.investor_id,
      projectId: row.project_id,
      stakePct: Number(row.stake_pct),
      capitalCommitted: Number(row.capital_committed),
    }));
    const distributions: Distribution[] = distributionRows.map((row) => ({
      id: row.id,
      projectId: row.project_id,
      investorId: row.investor_id,
      amount: Number(row.amount),
      date: row.date,
      receiptFileUrl: row.receipt_file_url,
    }));
    const documents: ProjectDocument[] = documentRows.map((row) => ({
      id: row.id,
      projectId: row.project_id,
      investorId: row.investor_id || null,
      title: row.title,
      fileUrl: row.file_url,
      uploadedDate: row.uploaded_date,
      type: row.type as ProjectDocument["type"],
    }));

    return { investors, projects, stakes, distributions, documents };
  }
}
