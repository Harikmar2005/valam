import { FarmerCategory, FarmerProfile } from '../types';

/**
 * Derives the official Indian agricultural landholding classification
 * from total acreage.
 */
export function deriveFarmerCategory(acres: number): FarmerCategory {
  if (acres < 2.5) return 'Marginal (<2.5 acres)';
  if (acres <= 5.0) return 'Small (2.5 - 5.0 acres)';
  if (acres <= 10.0) return 'Medium (5.0 - 10.0 acres)';
  return 'Large (>10.0 acres)';
}

/**
 * Calculates profile completeness percentage (0-100) across 8 core
 * registration and bank readiness fields.
 */
export function calculateProfileCompleteness(farmer: FarmerProfile): number {
  const totalFields = 8;
  let filledFields = 0;

  if (farmer.name?.trim()) filledFields++;
  if (farmer.state?.trim()) filledFields++;
  if (farmer.district?.trim()) filledFields++;
  if (farmer.village?.trim()) filledFields++;
  if (farmer.landSizeAcres > 0) filledFields++;
  if (farmer.crop?.trim()) filledFields++;
  if (farmer.category) filledFields++;
  if (farmer.hasBankAccount) filledFields++;

  return Math.round((filledFields / totalFields) * 100);
}

/**
 * Validates external URLs to allow only safe HTTP(S) protocols in links.
 */
export function getSafeHttpUrl(rawUrl?: string): string | undefined {
  if (!rawUrl || typeof rawUrl !== 'string') return undefined;
  try {
    const parsed = new URL(rawUrl.trim());
    if (parsed.protocol === 'https:' || parsed.protocol === 'http:') {
      return parsed.toString();
    }
  } catch {
    return undefined;
  }
  return undefined;
}
