/**
 * Depreciation Calculation Utilities
 * Supports multiple depreciation methods for asset valuation
 */

export type DepreciationMethod = 'none' | 'straight-line' | 'declining-balance' | 'sum-of-years';

export interface DepreciationConfig {
  purchasePrice: number;
  salvageValue: number;
  usefulLifeYears: number;
  depreciationStartDate: string; // ISO date string
  method: DepreciationMethod;
}

export interface DepreciationResult {
  currentBookValue: number;
  accumulatedDepreciation: number;
  annualDepreciation: number;
  monthlyDepreciation: number;
  ageInYears: number;
  ageInMonths: number;
  remainingLifeYears: number;
  depreciationPercentage: number;
}

/**
 * Calculate the age of an asset in years and months
 */
function calculateAssetAge(startDate: string): { years: number; months: number; totalMonths: number } {
  const start = new Date(startDate);
  const now = new Date();

  const totalMonths = (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth());
  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;

  return { years, months, totalMonths };
}

/**
 * Straight-line depreciation
 * (Cost - Salvage Value) / Useful Life
 */
function calculateStraightLine(config: DepreciationConfig): DepreciationResult {
  const depreciableAmount = config.purchasePrice - config.salvageValue;
  const annualDepreciation = depreciableAmount / config.usefulLifeYears;
  const monthlyDepreciation = annualDepreciation / 12;

  const age = calculateAssetAge(config.depreciationStartDate);
  const ageInYears = age.years + (age.months / 12);

  // Cap accumulated depreciation at depreciable amount
  const accumulatedDepreciation = Math.min(
    monthlyDepreciation * age.totalMonths,
    depreciableAmount
  );

  const currentBookValue = Math.max(
    config.purchasePrice - accumulatedDepreciation,
    config.salvageValue
  );

  const remainingLifeYears = Math.max(0, config.usefulLifeYears - ageInYears);
  const depreciationPercentage = (accumulatedDepreciation / config.purchasePrice) * 100;

  return {
    currentBookValue,
    accumulatedDepreciation,
    annualDepreciation,
    monthlyDepreciation,
    ageInYears,
    ageInMonths: age.totalMonths,
    remainingLifeYears,
    depreciationPercentage,
  };
}

/**
 * Declining balance depreciation (200% / Double declining)
 * Book Value * (2 / Useful Life)
 */
function calculateDecliningBalance(config: DepreciationConfig): DepreciationResult {
  const depreciationRate = 2 / config.usefulLifeYears;
  const age = calculateAssetAge(config.depreciationStartDate);

  let bookValue = config.purchasePrice;
  let accumulatedDepreciation = 0;

  // Calculate depreciation year by year
  for (let year = 0; year < age.years; year++) {
    const yearDepreciation = bookValue * depreciationRate;
    const cappedDepreciation = Math.min(
      yearDepreciation,
      bookValue - config.salvageValue
    );

    accumulatedDepreciation += cappedDepreciation;
    bookValue -= cappedDepreciation;

    // Stop if we've reached salvage value
    if (bookValue <= config.salvageValue) {
      bookValue = config.salvageValue;
      break;
    }
  }

  // Handle partial year
  if (age.months > 0 && bookValue > config.salvageValue) {
    const yearDepreciation = bookValue * depreciationRate;
    const monthlyDepreciation = yearDepreciation / 12;
    const partialYearDepreciation = Math.min(
      monthlyDepreciation * age.months,
      bookValue - config.salvageValue
    );

    accumulatedDepreciation += partialYearDepreciation;
    bookValue -= partialYearDepreciation;
  }

  const currentBookValue = Math.max(bookValue, config.salvageValue);
  const annualDepreciation = currentBookValue * depreciationRate;
  const monthlyDepreciation = annualDepreciation / 12;
  const ageInYears = age.years + (age.months / 12);
  const remainingLifeYears = Math.max(0, config.usefulLifeYears - ageInYears);
  const depreciationPercentage = (accumulatedDepreciation / config.purchasePrice) * 100;

  return {
    currentBookValue,
    accumulatedDepreciation,
    annualDepreciation,
    monthlyDepreciation,
    ageInYears,
    ageInMonths: age.totalMonths,
    remainingLifeYears,
    depreciationPercentage,
  };
}

/**
 * Sum of years digits depreciation
 * Remaining Life / Sum of Years * Depreciable Amount
 */
function calculateSumOfYears(config: DepreciationConfig): DepreciationResult {
  const depreciableAmount = config.purchasePrice - config.salvageValue;
  const sumOfYears = (config.usefulLifeYears * (config.usefulLifeYears + 1)) / 2;
  const age = calculateAssetAge(config.depreciationStartDate);

  let accumulatedDepreciation = 0;

  // Calculate year by year
  for (let year = 0; year < age.years; year++) {
    const remainingLife = config.usefulLifeYears - year;
    const yearDepreciation = (remainingLife / sumOfYears) * depreciableAmount;
    accumulatedDepreciation += yearDepreciation;
  }

  // Handle partial year
  if (age.months > 0 && age.years < config.usefulLifeYears) {
    const remainingLife = config.usefulLifeYears - age.years;
    const yearDepreciation = (remainingLife / sumOfYears) * depreciableAmount;
    const monthlyDepreciation = yearDepreciation / 12;
    accumulatedDepreciation += monthlyDepreciation * age.months;
  }

  // Cap accumulated depreciation
  accumulatedDepreciation = Math.min(accumulatedDepreciation, depreciableAmount);

  const currentBookValue = Math.max(
    config.purchasePrice - accumulatedDepreciation,
    config.salvageValue
  );

  const ageInYears = age.years + (age.months / 12);
  const remainingLifeYears = Math.max(0, config.usefulLifeYears - ageInYears);

  // Calculate current year's depreciation for annual/monthly values
  const currentYearRemainingLife = Math.max(0, config.usefulLifeYears - age.years);
  const annualDepreciation = currentYearRemainingLife > 0
    ? (currentYearRemainingLife / sumOfYears) * depreciableAmount
    : 0;
  const monthlyDepreciation = annualDepreciation / 12;

  const depreciationPercentage = (accumulatedDepreciation / config.purchasePrice) * 100;

  return {
    currentBookValue,
    accumulatedDepreciation,
    annualDepreciation,
    monthlyDepreciation,
    ageInYears,
    ageInMonths: age.totalMonths,
    remainingLifeYears,
    depreciationPercentage,
  };
}

/**
 * Calculate depreciation for an asset
 */
export function calculateDepreciation(config: DepreciationConfig): DepreciationResult | null {
  // Validate inputs
  if (!config.purchasePrice || config.purchasePrice <= 0) {
    return null;
  }

  if (!config.usefulLifeYears || config.usefulLifeYears <= 0) {
    return null;
  }

  if (!config.depreciationStartDate) {
    return null;
  }

  if (config.method === 'none') {
    return null;
  }

  // Ensure salvage value is valid
  config.salvageValue = config.salvageValue || 0;
  if (config.salvageValue >= config.purchasePrice) {
    config.salvageValue = 0;
  }

  try {
    switch (config.method) {
      case 'straight-line':
        return calculateStraightLine(config);

      case 'declining-balance':
        return calculateDecliningBalance(config);

      case 'sum-of-years':
        return calculateSumOfYears(config);

      default:
        return null;
    }
  } catch (error) {
    console.error('Error calculating depreciation:', error);
    return null;
  }
}

/**
 * Format currency for display
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value);
}

/**
 * Get depreciation method display name
 */
export function getDepreciationMethodName(method: DepreciationMethod): string {
  const names: Record<DepreciationMethod, string> = {
    'none': 'No Depreciation',
    'straight-line': 'Straight-Line',
    'declining-balance': 'Declining Balance (200%)',
    'sum-of-years': 'Sum of Years Digits',
  };

  return names[method] || 'Unknown';
}
