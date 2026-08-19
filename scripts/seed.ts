import { getDb } from "../src/db";
import {
  distributions,
  documents,
  investorProjectStakes,
  investors,
  projects,
} from "../src/db/schema";
import { mockDashboardData } from "../src/lib/mock-data";

async function seed() {
const db = getDb();

await db
  .insert(investors)
  .values(mockDashboardData.investors)
  .onConflictDoUpdate({
    target: investors.id,
    set: {
      name: investors.name,
      email: investors.email,
      bankDetails: investors.bankDetails,
      updatedAt: new Date(),
    },
  });

await db
  .insert(projects)
  .values(mockDashboardData.projects)
  .onConflictDoUpdate({
    target: projects.id,
    set: {
      name: projects.name,
      location: projects.location,
      status: projects.status,
      constructionPct: projects.constructionPct,
      occupancyPct: projects.occupancyPct,
      budgetTotal: projects.budgetTotal,
      estimatedCompletionDate: projects.estimatedCompletionDate,
      projectedIrr: projects.projectedIrr,
      budgetBreakdown: projects.budgetBreakdown,
      updatedAt: new Date(),
    },
  });

for (const stake of mockDashboardData.stakes) {
  await db
    .insert(investorProjectStakes)
    .values(stake)
    .onConflictDoUpdate({
      target: [investorProjectStakes.investorId, investorProjectStakes.projectId],
      set: {
        stakePct: stake.stakePct,
        capitalCommitted: stake.capitalCommitted,
        updatedAt: new Date(),
      },
    });
}

await db
  .insert(distributions)
  .values(
    mockDashboardData.distributions.map((distribution) => ({
      id: distribution.id,
      projectId: distribution.projectId,
      investorId: distribution.investorId,
      amount: distribution.amount,
      date: distribution.date,
      receiptPathname: null,
    })),
  )
  .onConflictDoNothing();

await db
  .insert(documents)
  .values(
    mockDashboardData.documents.map((document) => ({
      id: document.id,
      projectId: document.projectId,
      investorId: document.investorId,
      title: document.title,
      externalUrl: document.fileUrl === "#" ? null : document.fileUrl,
      pathname: null,
      uploadedDate: document.uploadedDate,
      type: document.type,
    })),
  )
  .onConflictDoNothing();

console.log(
  `Seeded ${mockDashboardData.investors.length} investors, ${mockDashboardData.projects.length} projects, and ${mockDashboardData.distributions.length} distributions.`,
);
}

seed().catch((error) => {
  console.error("Database seed failed.", error);
  process.exitCode = 1;
});
