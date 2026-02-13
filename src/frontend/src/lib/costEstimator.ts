// Cost estimation utilities for ICP/cycles calculations

// Approximate conversion rate (as of Feb 2026)
// Check https://internetcomputer.org/docs/current/developer-docs/gas-cost for latest
export const CYCLES_PER_ICP = 1_000_000_000_000; // 1 trillion cycles per ICP (approximate)

// Approximate cost factors (these are rough estimates)
const STORAGE_CYCLES_PER_GB_PER_MONTH = 127_000_000_000; // ~127B cycles per GB per month
const COMPUTE_CYCLES_PER_BILLION_INSTRUCTIONS = 590_000; // ~590K cycles per billion instructions

// Rough estimate: 1ms of compute ≈ 10M instructions on IC
const INSTRUCTIONS_PER_MS = 10_000_000;

export interface CostBreakdown {
  storageCyclesPerMonth: number;
  computeCyclesPerMonth: number;
  totalCyclesPerMonth: number;
}

export function calculateCosts(
  modelSizeMB: number,
  requestsPerDay: number,
  computeMs: number
): CostBreakdown {
  // Storage costs
  const modelSizeGB = modelSizeMB / 1024;
  const storageCyclesPerMonth = modelSizeGB * STORAGE_CYCLES_PER_GB_PER_MONTH;

  // Compute costs
  const requestsPerMonth = requestsPerDay * 30;
  const instructionsPerRequest = computeMs * INSTRUCTIONS_PER_MS;
  const billionInstructionsPerRequest = instructionsPerRequest / 1_000_000_000;
  const computeCyclesPerRequest = billionInstructionsPerRequest * COMPUTE_CYCLES_PER_BILLION_INSTRUCTIONS;
  const computeCyclesPerMonth = computeCyclesPerRequest * requestsPerMonth;

  return {
    storageCyclesPerMonth: Math.round(storageCyclesPerMonth),
    computeCyclesPerMonth: Math.round(computeCyclesPerMonth),
    totalCyclesPerMonth: Math.round(storageCyclesPerMonth + computeCyclesPerMonth),
  };
}

export function formatNumber(num: number): string {
  if (num >= 1_000_000_000_000) {
    return `${(num / 1_000_000_000_000).toFixed(2)}T`;
  }
  if (num >= 1_000_000_000) {
    return `${(num / 1_000_000_000).toFixed(2)}B`;
  }
  if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(2)}M`;
  }
  if (num >= 1_000) {
    return `${(num / 1_000).toFixed(2)}K`;
  }
  return num.toFixed(0);
}
