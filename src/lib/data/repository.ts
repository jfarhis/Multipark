import type { DashboardData } from "../types";
import { mockDashboardData } from "../mock-data";
import { DatabaseDashboardRepository } from "./database-repository";

export interface DashboardRepository {
  getDashboardData(): Promise<DashboardData>;
}

export class MockDashboardRepository implements DashboardRepository {
  async getDashboardData() {
    return mockDashboardData;
  }
}

export const dashboardRepository: DashboardRepository = process.env.DATABASE_URL
  ? new DatabaseDashboardRepository()
  : new MockDashboardRepository();
