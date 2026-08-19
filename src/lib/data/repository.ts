import type { DashboardData } from "../types";
import { mockDashboardData } from "../mock-data";

export interface DashboardRepository {
  getDashboardData(): Promise<DashboardData>;
}

export class MockDashboardRepository implements DashboardRepository {
  async getDashboardData() {
    return mockDashboardData;
  }
}

export const dashboardRepository: DashboardRepository =
  new MockDashboardRepository();
