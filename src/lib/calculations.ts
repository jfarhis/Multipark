import type {
  DashboardData,
  Distribution,
  InvestorProjectStake,
  Project,
} from "./types";

export const money = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export const compactMoney = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "USD",
  notation: "compact",
  maximumFractionDigits: 1,
});

// capitalCommitted stores the investor's actual capital (already scaled by
// their stake) — both the admin stake editor and the Excel import save it that way.
export function capitalForStake(stake: InvestorProjectStake) {
  return stake.capitalCommitted;
}

export function distributionsForStake(
  data: DashboardData,
  stake: InvestorProjectStake,
) {
  return data.distributions
    .filter(
      (distribution) =>
        distribution.investorId === stake.investorId &&
        distribution.projectId === stake.projectId,
    )
    .reduce((sum, distribution) => sum + distribution.amount, 0);
}

export function projectRaised(data: DashboardData, projectId: string) {
  return data.stakes
    .filter((stake) => stake.projectId === projectId)
    .reduce((sum, stake) => sum + capitalForStake(stake), 0);
}

export function projectDistributed(data: DashboardData, projectId: string) {
  return data.distributions
    .filter((distribution) => distribution.projectId === projectId)
    .reduce((sum, distribution) => sum + distribution.amount, 0);
}

export function investorPortfolio(data: DashboardData, investorId: string) {
  const stakes = data.stakes.filter((stake) => stake.investorId === investorId);
  const totalInvested = stakes.reduce(
    (sum, stake) => sum + capitalForStake(stake),
    0,
  );
  const totalDistributed = stakes.reduce(
    (sum, stake) => sum + distributionsForStake(data, stake),
    0,
  );
  const weightedIrr = stakes.reduce((sum, stake) => {
    const project = data.projects.find((item) => item.id === stake.projectId);
    return sum + (project?.projectedIrr ?? 0) * capitalForStake(stake);
  }, 0);

  return {
    stakes,
    totalInvested,
    totalDistributed,
    blendedIrr: totalInvested ? weightedIrr / totalInvested : 0,
  };
}

export function portfolioMetrics(data: DashboardData) {
  const totalInvested = data.stakes.reduce(
    (sum, stake) => sum + capitalForStake(stake),
    0,
  );
  const totalDistributed = data.distributions.reduce(
    (sum, distribution) => sum + distribution.amount,
    0,
  );
  const averageIrr = data.projects.length
    ? data.projects.reduce((sum, project) => sum + project.projectedIrr, 0) / data.projects.length
    : 0;
  const totalBudget = data.projects.reduce((sum, project) => sum + project.budgetTotal, 0);
  const blendedOccupancy = totalBudget
    ? data.projects.reduce(
      (sum, project) => sum + project.occupancyPct * project.budgetTotal,
      0,
    ) / totalBudget
    : 0;

  return { totalInvested, totalDistributed, averageIrr, blendedOccupancy };
}

const monthFormatter = new Intl.DateTimeFormat("es-MX", { month: "short", year: "2-digit" });

// Aggregates distributions into calendar months, with a running cumulative
// total, for the dual-series line charts. Months come back sorted ascending.
export function monthlyDistributionSeries(distributions: Distribution[]) {
  const byMonth = new Map<string, number>();
  for (const distribution of distributions) {
    const month = distribution.date.slice(0, 7);
    byMonth.set(month, (byMonth.get(month) ?? 0) + distribution.amount);
  }
  let cumulative = 0;
  return [...byMonth.keys()].sort().map((month) => {
    const amount = byMonth.get(month)!;
    cumulative += amount;
    return { month, label: monthFormatter.format(new Date(`${month}-15T12:00:00`)), amount, cumulative };
  });
}

// Percent change of the latest complete data point vs the one before it.
// Returns undefined when there is not enough history to compare honestly.
export function distributionTrend(series: { amount: number }[]) {
  if (series.length < 2) return undefined;
  const previous = series[series.length - 2].amount;
  if (!previous) return undefined;
  return ((series[series.length - 1].amount - previous) / previous) * 100;
}

export function completionLabel(project: Project) {
  return new Intl.DateTimeFormat("es-MX", {
    month: "short",
    year: "numeric",
  }).format(new Date(`${project.estimatedCompletionDate}T12:00:00`));
}
