import type { DashboardData, Distribution, InvestorProjectStake } from "./types";

const investors = [
  ["inv-001", "Alexander Roth", "alexander@gasfar.demo"],
  ["inv-002", "Sofia Mendoza", "sofia@gasfar.demo"],
  ["inv-003", "Marcus Chen", "marcus@gasfar.demo"],
  ["inv-004", "Isabella Laurent", "isabella@gasfar.demo"],
  ["inv-005", "Noah Williams", "noah@gasfar.demo"],
  ["inv-006", "Valentina Cruz", "valentina@gasfar.demo"],
  ["inv-007", "Ethan Park", "ethan@gasfar.demo"],
  ["inv-008", "Mia Thompson", "mia@gasfar.demo"],
  ["inv-009", "Lucas García", "lucas@gasfar.demo"],
  ["inv-010", "Amelia Bennett", "amelia@gasfar.demo"],
].map(([id, name, email], index) => ({
  id,
  name,
  email,
  bankDetails: `•••• ${String(4108 + index * 137).slice(-4)}`,
}));

const projects: DashboardData["projects"] = [
  {
    id: "aurora-residences",
    name: "Aurora Residences",
    location: "Polanco, Mexico City",
    status: "in-progress",
    constructionPct: 68,
    occupancyPct: 82,
    budgetTotal: 18_400_000,
    estimatedCompletionDate: "2027-04-15",
    projectedIrr: 17.8,
    budgetBreakdown: [
      { label: "Construction", amount: 9_100_000 },
      { label: "Land", amount: 4_800_000 },
      { label: "Soft costs", amount: 2_700_000 },
      { label: "Reserve", amount: 1_800_000 },
    ],
  },
  {
    id: "marina-vista",
    name: "Marina Vista",
    location: "Puerto Vallarta, Jalisco",
    status: "in-progress",
    constructionPct: 43,
    occupancyPct: 64,
    budgetTotal: 24_600_000,
    estimatedCompletionDate: "2027-11-30",
    projectedIrr: 19.2,
    budgetBreakdown: [
      { label: "Construction", amount: 13_900_000 },
      { label: "Land", amount: 5_500_000 },
      { label: "Soft costs", amount: 3_100_000 },
      { label: "Reserve", amount: 2_100_000 },
    ],
  },
  {
    id: "casa-verde",
    name: "Casa Verde Collection",
    location: "Tulum, Quintana Roo",
    status: "complete",
    constructionPct: 100,
    occupancyPct: 94,
    budgetTotal: 12_900_000,
    estimatedCompletionDate: "2025-12-12",
    projectedIrr: 21.4,
    budgetBreakdown: [
      { label: "Construction", amount: 7_200_000 },
      { label: "Land", amount: 2_900_000 },
      { label: "Soft costs", amount: 1_700_000 },
      { label: "Reserve", amount: 1_100_000 },
    ],
  },
  {
    id: "norte-logistics",
    name: "Norte Logistics Park",
    location: "Monterrey, Nuevo León",
    status: "delayed",
    constructionPct: 37,
    occupancyPct: 48,
    budgetTotal: 31_200_000,
    estimatedCompletionDate: "2028-02-20",
    projectedIrr: 14.6,
    budgetBreakdown: [
      { label: "Construction", amount: 18_300_000 },
      { label: "Land", amount: 6_800_000 },
      { label: "Soft costs", amount: 3_700_000 },
      { label: "Reserve", amount: 2_400_000 },
    ],
  },
];

const stakeMatrix = [
  ["inv-001", "aurora-residences", 9.8, 18_400_000],
  ["inv-001", "marina-vista", 6.0, 24_600_000],
  ["inv-001", "casa-verde", 7.5, 12_900_000],
  ["inv-002", "aurora-residences", 8.2, 18_400_000],
  ["inv-002", "norte-logistics", 5.5, 31_200_000],
  ["inv-003", "marina-vista", 12.0, 24_600_000],
  ["inv-003", "casa-verde", 5.2, 12_900_000],
  ["inv-004", "aurora-residences", 11.5, 18_400_000],
  ["inv-004", "marina-vista", 8.8, 24_600_000],
  ["inv-005", "casa-verde", 14.0, 12_900_000],
  ["inv-005", "norte-logistics", 7.5, 31_200_000],
  ["inv-006", "aurora-residences", 6.4, 18_400_000],
  ["inv-006", "marina-vista", 9.2, 24_600_000],
  ["inv-007", "norte-logistics", 10.8, 31_200_000],
  ["inv-008", "casa-verde", 9.5, 12_900_000],
  ["inv-008", "marina-vista", 5.1, 24_600_000],
  ["inv-009", "aurora-residences", 7.8, 18_400_000],
  ["inv-009", "norte-logistics", 4.7, 31_200_000],
  ["inv-010", "marina-vista", 7.2, 24_600_000],
  ["inv-010", "casa-verde", 6.8, 12_900_000],
] as const;

const stakes: InvestorProjectStake[] = stakeMatrix.map(
  ([investorId, projectId, stakePct, capitalCommitted]) => ({
    investorId,
    projectId,
    stakePct,
    capitalCommitted,
  }),
);

const distributionDates = [
  "2025-09-15",
  "2025-12-15",
  "2026-03-15",
  "2026-06-15",
];

const distributions: Distribution[] = stakes.flatMap((stake, stakeIndex) =>
  distributionDates
    .slice(0, stake.projectId === "casa-verde" ? 4 : 3)
    .map((date, dateIndex) => ({
      id: `dist-${stakeIndex + 1}-${dateIndex + 1}`,
      projectId: stake.projectId,
      investorId: stake.investorId,
      amount: Math.round(
        stake.capitalCommitted *
          (stake.stakePct / 100) *
          (0.018 + dateIndex * 0.003),
      ),
      date,
      receiptFileUrl: `/receipts/${stake.investorId}-${date}.pdf`,
    })),
);

const documents: DashboardData["documents"] = projects.flatMap(
  (project, projectIndex) => [
    {
      id: `doc-${projectIndex + 1}-1`,
      projectId: project.id,
      investorId: null,
      title: `${project.name} — Q2 progress report`,
      fileUrl: "#",
      uploadedDate: "2026-07-12",
      type: "report" as const,
    },
    {
      id: `doc-${projectIndex + 1}-2`,
      projectId: project.id,
      investorId: null,
      title: `${project.name} — Site progress photos`,
      fileUrl: "#",
      uploadedDate: "2026-07-28",
      type: "photo" as const,
    },
  ],
);

documents.push(
  ...distributions.slice(0, 12).map((distribution, index) => ({
    id: `receipt-${index + 1}`,
    projectId: distribution.projectId,
    investorId: distribution.investorId,
    title: `Distribution receipt — ${distribution.date}`,
    fileUrl: distribution.receiptFileUrl,
    uploadedDate: distribution.date,
    type: "receipt" as const,
  })),
);

export const mockDashboardData: DashboardData = {
  investors,
  projects,
  stakes,
  distributions,
  documents,
};
