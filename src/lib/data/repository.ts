import type { DashboardData } from "../types";
import { DatabaseDashboardRepository } from "./database-repository";

export interface DashboardRepository {
  getDashboardData(): Promise<DashboardData>;
}

export class EmptyDashboardRepository implements DashboardRepository {
  async getDashboardData() {
    return { investors: [], projects: [], stakes: [], distributions: [], documents: [] };
  }
}

export const dashboardRepository: DashboardRepository = process.env.DATABASE_URL
  ? new DatabaseDashboardRepository()
  : new EmptyDashboardRepository();
