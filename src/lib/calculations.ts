import type {
  DashboardData,
  InvestorProjectStake,
  Project,
} from "./types";

export const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export const compactMoney = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  notation: "compact",
  maximumFractionDigits: 1,
});

export function capitalForStake(stake: InvestorProjectStake) {
  return stake.capitalCommitted * (stake.stakePct / 100);
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

export function completionLabel(project: Project) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    year: "numeric",
  }).format(new Date(`${project.estimatedCompletionDate}T12:00:00`));
}
