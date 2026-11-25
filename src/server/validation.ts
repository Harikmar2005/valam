import { z } from 'zod';

export const FARMER_CATEGORIES = [
  'Marginal (<2.5 acres)',
  'Small (2.5 - 5.0 acres)',
  'Medium (5.0 - 10.0 acres)',
  'Large (>10.0 acres)'
] as const;

export const IRRIGATION_TYPES = [
  'Rainfed',
  'Borewell / Tube Well',
  'Canal Irrigation',
  'Drip / Sprinkler',
  'None'
] as const;

export const NEED_CATEGORIES = [
  'irrigation',
  'insurance',
  'loan',
  'subsidy',
  'equipment',
  'seeds_inputs',
  'documents',
  'other'
] as const;

export const safeIdSchema = z
  .string()
  .trim()
  .min(2)
  .max(64)
  .regex(/^[A-Za-z0-9_-]+$/, 'Identifier may only contain letters, numbers, hyphens, and underscores');

export const farmerDocumentStatusSchema = z.object({
  documentId: safeIdSchema,
  available: z.boolean(),
  documentNumber: z.string().trim().max(64).optional(),
  verifiedStatus: z.enum(['verified', 'unverified', 'missing', 'needs_update']),
  updatedAt: z.string().trim().max(64).optional()
});

export const farmerProfileSchema = z.object({
  id: safeIdSchema.optional(),
  name: z.string().trim().min(1, 'Name is required').max(120),
  phone: z.string().trim().min(5).max(25),
  state: z.string().trim().min(1).max(80).default('Tamil Nadu'),
  district: z.string().trim().min(1).max(80),
  taluk: z.string().trim().min(1).max(80).default('Taluk Centre'),
  village: z.string().trim().min(1).max(80).default('Revenue Village'),
  landSizeAcres: z.number().finite().positive().max(500),
  crop: z.string().trim().min(1).max(80),
  secondaryCrops: z.array(z.string().trim().min(1).max(80)).max(10).optional(),
  category: z.enum(FARMER_CATEGORIES),
  irrigationType: z.enum(IRRIGATION_TYPES),
  hasBankAccount: z.boolean().default(true),
  bankName: z.string().trim().max(120).optional(),
  hasAadhaarLinkedBank: z.boolean().default(true),
  documents: z.array(farmerDocumentStatusSchema).max(20).default([]),
  avatarUrl: z.string().trim().max(300).optional()
});

export const needDetectSchema = z.object({
  query: z.string().trim().min(1, 'Query parameter is required').max(1000)
});

export const farmerOverridesSchema = z
  .object({
    crop: z.string().trim().min(1).max(80).optional(),
    landSizeAcres: z.number().finite().positive().max(500).optional(),
    irrigationType: z.enum(IRRIGATION_TYPES).optional()
  })
  .optional();

export const eligibilityCheckSchema = z.object({
  farmerId: safeIdSchema.optional(),
  programId: safeIdSchema.optional(),
  overrides: farmerOverridesSchema
});

export const pathwayGenerateSchema = z.object({
  farmerId: safeIdSchema.optional(),
  programId: safeIdSchema.optional(),
  overrides: farmerOverridesSchema
});

export const aiExplainSchema = z.object({
  farmerId: safeIdSchema.optional(),
  farmer: farmerProfileSchema.partial().optional(),
  programId: safeIdSchema.optional(),
  problemStatement: z.string().trim().max(500).optional(),
  language: z.enum(['en', 'ta']).default('en')
});

export const phoneSessionSchema = z.object({
  callerNumber: z
    .string()
    .trim()
    .min(5)
    .max(25)
    .regex(/^[+0-9\s-]+$/, 'Invalid caller number format')
    .default('+91 94432 18901')
});

export const phoneInputSchema = z.object({
  sessionId: safeIdSchema.optional(),
  digit: z
    .string()
    .trim()
    .regex(/^[0-9*#]$/, 'Digit must be a single keypad character (0-9, *, #)'),
  currentState: z
    .object({
      sessionId: safeIdSchema,
      language: z.enum(['en', 'ta']),
      step: z.enum([
        'welcome',
        'language_select',
        'need_category',
        'crop_select',
        'land_size',
        'irrigation_type',
        'documents_check',
        'processing',
        'result',
        'sms_sent'
      ]),
      callerNumber: z.string().trim().min(3).max(25),
      selectedNeed: z.enum(NEED_CATEGORIES).optional(),
      selectedCrop: z.string().trim().max(80).optional(),
      selectedLandAcres: z.number().finite().positive().max(500).optional(),
      selectedIrrigation: z.enum(IRRIGATION_TYPES).optional(),
      selectedDocsLevel: z.string().trim().max(10).optional(),
      ivrAudioPromptEn: z.string().max(1000).default(''),
      ivrAudioPromptTa: z.string().max(1000).default(''),
      ussdScreenText: z.string().max(1000).default('')
    })
    .passthrough()
});

/**
 * Strips ASCII control characters and collapses whitespace before passing
 * user-supplied text into LLM prompts.
 */
export function sanitizePromptInput(value: string | undefined, maxLen = 400): string {
  if (!value) return '';
  return value
    .replace(/[\u0000-\u001F\u007F]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLen);
}
