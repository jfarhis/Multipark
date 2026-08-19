export type Role = "admin" | "investor";

export type ProjectStatus =
  | "pre-construction"
  | "in-progress"
  | "delayed"
  | "complete";

export interface Investor {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  bankDetails: string;
}

export interface Project {
  id: string;
  name: string;
  location: string;
  status: ProjectStatus;
  constructionPct: number;
  occupancyPct: number;
  budgetTotal: number;
  estimatedCompletionDate: string;
  projectedIrr: number;
  budgetBreakdown: { label: string; amount: number }[];
  milestones: { label: string; detail: string; complete: boolean }[];
}

export interface InvestorProjectStake {
  investorId: string;
  projectId: string;
  stakePct: number;
  capitalCommitted: number;
}

export interface Distribution {
  id: string;
  projectId: string;
  investorId: string;
  amount: number;
  date: string;
  receiptFileUrl: string;
}

export type DocumentType = "receipt" | "report" | "photo";

export interface ProjectDocument {
  id: string;
  projectId: string;
  investorId: string | null;
  title: string;
  fileUrl: string;
  uploadedDate: string;
  type: DocumentType;
}

export interface Session {
  role: Role;
  investorId?: string;
  name: string;
  email: string;
}

export interface DashboardData {
  investors: Investor[];
  projects: Project[];
  stakes: InvestorProjectStake[];
  distributions: Distribution[];
  documents: ProjectDocument[];
}
