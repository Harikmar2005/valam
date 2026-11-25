import express, { NextFunction, Request, Response } from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { DEMO_FARMERS, SUPPORT_PROGRAMS, SYSTEM_DOCUMENTS } from '../data/mockData.js';
import { checkEligibility } from '../services/eligibilityEngine.js';
import { detectNeedFromText } from '../services/nlpEngine.js';
import { generatePersonalizedPathway } from '../services/pathwayEngine.js';
import { createInitialPhoneSession, processPhoneKeypadInput } from '../services/phoneEngine.js';
import { explainIneligibilityWithAi } from '../services/aiIneligibilityService.js';
import { deriveFarmerCategory } from '../utils/farmerUtils.js';
import {
  FarmerProfile,
  NeedCategory,
  PersonalizedPathway,
  PhoneSessionState
} from '../types/index.js';
import {
  aiExplainSchema,
  eligibilityCheckSchema,
  farmerProfileSchema,
  NEED_CATEGORIES,
  needDetectSchema,
  pathwayGenerateSchema,
  phoneInputSchema,
  phoneSessionSchema,
  safeIdSchema
} from './validation.js';

const MAX_FARMERS_STORE = 500;
const MAX_PATHWAYS_STORE = 500;

export interface CreateAppOptions {
  enableRateLimit?: boolean;
  allowedOrigins?: string[];
}

function getAllowedOrigins(explicitOrigins?: string[]): string[] {
  if (explicitOrigins && explicitOrigins.length > 0) {
    return explicitOrigins;
  }
  const fromEnv = process.env.ALLOWED_ORIGINS
    ?.split(',')
    .map((o) => o.trim())
    .filter(Boolean);
  if (fromEnv && fromEnv.length > 0) {
    return fromEnv;
  }
  return ['http://localhost:3000', 'http://127.0.0.1:3000'];
}

function isOriginAllowed(origin: string, allowedList: string[]): boolean {
  if (allowedList.includes(origin)) return true;
  try {
    const parsed = new URL(origin);
    // Allow AI Studio hosted preview origins over HTTPS only
    if (parsed.protocol === 'https:' && parsed.hostname.endsWith('.run.app')) {
      return true;
    }
  } catch {
    return false;
  }
  return false;
}

/**
 * Builds and configures the Express application with security headers,
 * restrictive CORS, rate limiting, Zod validation, and VALAM API routes.
 */
export function createApp(options: CreateAppOptions = {}) {
  const { enableRateLimit = true, allowedOrigins: explicitOrigins } = options;
  const allowedOrigins = getAllowedOrigins(explicitOrigins);

  const app = express();
  app.disable('x-powered-by');
  app.set('trust proxy', 1);

  // Security headers compatible with AI Studio iframe preview
  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
      frameguard: false
    })
  );

  // Restrictive CORS (no wildcard credentials)
  app.use((req: Request, res: Response, next: NextFunction) => {
    const origin = req.headers.origin;
    if (origin) {
      if (!isOriginAllowed(origin, allowedOrigins)) {
        if (req.path.startsWith('/api/')) {
          return res.status(403).json({ error: 'Origin not permitted by CORS policy' });
        }
      } else {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Vary', 'Origin');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
      }
    }
    if (req.method === 'OPTIONS') {
      return res.status(204).end();
    }
    next();
  });

  // Strict JSON body size cap
  app.use(express.json({ limit: '100kb' }));

  // Rate limiting on API routes
  if (enableRateLimit) {
    const apiLimiter = rateLimit({
      windowMs: 60 * 1000,
      max: 120,
      standardHeaders: 'draft-7',
      legacyHeaders: false,
      message: { error: 'Too many requests, please try again shortly.' }
    });

    const aiLimiter = rateLimit({
      windowMs: 60 * 1000,
      max: 20,
      standardHeaders: 'draft-7',
      legacyHeaders: false,
      message: { error: 'AI explanation rate limit exceeded, please wait a minute.' }
    });

    app.use('/api/', apiLimiter);
    app.use('/api/ai/', aiLimiter);
  }

  // In-memory bounded stores (fresh per app instance for test isolation)
  const farmers: FarmerProfile[] = structuredClone(DEMO_FARMERS);
  const pathwaysStore = new Map<string, PersonalizedPathway>();

  function applyFarmerOverrides(
    base: FarmerProfile,
    overrides?: { crop?: string; landSizeAcres?: number; irrigationType?: FarmerProfile['irrigationType'] }
  ): FarmerProfile {
    if (!overrides) return base;
    const landSizeAcres = overrides.landSizeAcres ?? base.landSizeAcres;
    return {
      ...base,
      crop: overrides.crop ?? base.crop,
      landSizeAcres,
      category: overrides.landSizeAcres !== undefined ? deriveFarmerCategory(landSizeAcres) : base.category,
      irrigationType: overrides.irrigationType ?? base.irrigationType
    };
  }

  // Healthcheck
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', service: 'valam-api' });
  });

  // 1. GET /api/farmers
  app.get('/api/farmers', (_req: Request, res: Response) => {
    res.json(farmers);
  });

  // 2. GET /api/farmers/:id
  app.get('/api/farmers/:id', (req: Request, res: Response) => {
    const idCheck = safeIdSchema.safeParse(req.params.id);
    if (!idCheck.success) {
      return res.status(400).json({ error: 'Invalid farmer ID format' });
    }
    const farmer = farmers.find((f) => f.id === idCheck.data);
    if (!farmer) {
      return res.status(404).json({ error: 'Farmer profile not found' });
    }
    res.json(farmer);
  });

  // 3. POST /api/farmers
  app.post('/api/farmers', (req: Request, res: Response) => {
    const parsed = farmerProfileSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: 'Invalid farmer profile payload',
        details: parsed.error.issues.map((i) => ({ path: i.path.join('.'), message: i.message }))
      });
    }

    const data = parsed.data;
    const farmerId = data.id || `FARMER_${Date.now()}`;
    const normalizedFarmer: FarmerProfile = {
      ...data,
      id: farmerId,
      category: deriveFarmerCategory(data.landSizeAcres)
    };

    const existingIdx = farmers.findIndex((f) => f.id === farmerId);
    if (existingIdx >= 0) {
      farmers[existingIdx] = normalizedFarmer;
    } else {
      if (farmers.length >= MAX_FARMERS_STORE) {
        // Preserve demo farmers at index 0..3 and evict oldest custom entry
        farmers.splice(DEMO_FARMERS.length, 1);
      }
      farmers.push(normalizedFarmer);
    }

    res.status(201).json(normalizedFarmer);
  });

  // 4. GET /api/farmers/:id/documents
  app.get('/api/farmers/:id/documents', (req: Request, res: Response) => {
    const idCheck = safeIdSchema.safeParse(req.params.id);
    if (!idCheck.success) {
      return res.status(400).json({ error: 'Invalid farmer ID format' });
    }
    const farmer = farmers.find((f) => f.id === idCheck.data);
    if (!farmer) {
      return res.status(404).json({ error: 'Farmer profile not found' });
    }
    const detailedDocuments = SYSTEM_DOCUMENTS.map((doc) => {
      const fDoc = farmer.documents.find((d) => d.documentId === doc.id);
      return {
        ...doc,
        isAvailable: fDoc ? fDoc.available : false,
        verifiedStatus: fDoc ? fDoc.verifiedStatus : 'missing',
        documentNumber: fDoc?.documentNumber
      };
    });
    res.json(detailedDocuments);
  });

  // 5. POST /api/needs/detect
  app.post('/api/needs/detect', (req: Request, res: Response) => {
    const parsed = needDetectSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Query parameter is required (1-1000 chars)' });
    }
    const result = detectNeedFromText(parsed.data.query);
    res.json(result);
  });

  // 6. GET /api/support-programs
  app.get('/api/support-programs', (req: Request, res: Response) => {
    const { category } = req.query;
    if (category !== undefined) {
      if (typeof category !== 'string' || !NEED_CATEGORIES.includes(category as NeedCategory)) {
        return res.status(400).json({ error: 'Invalid support program category' });
      }
      const filtered = SUPPORT_PROGRAMS.filter((p) => p.category === category);
      return res.json(filtered);
    }
    res.json(SUPPORT_PROGRAMS);
  });

  // 7. GET /api/support-programs/:id
  app.get('/api/support-programs/:id', (req: Request, res: Response) => {
    const idCheck = safeIdSchema.safeParse(req.params.id);
    if (!idCheck.success) {
      return res.status(400).json({ error: 'Invalid program ID format' });
    }
    const program = SUPPORT_PROGRAMS.find((p) => p.id === idCheck.data);
    if (!program) {
      return res.status(404).json({ error: 'Support program not found' });
    }
    res.json(program);
  });

  // 8. POST /api/eligibility/check
  app.post('/api/eligibility/check', (req: Request, res: Response) => {
    const parsed = eligibilityCheckSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid eligibility check request' });
    }
    const { farmerId, programId, overrides } = parsed.data;
    const baseFarmer = farmerId ? farmers.find((f) => f.id === farmerId) : farmers[0];
    if (!baseFarmer) {
      return res.status(404).json({ error: 'Farmer profile not found' });
    }
    const program = programId ? SUPPORT_PROGRAMS.find((p) => p.id === programId) : SUPPORT_PROGRAMS[0];
    if (!program) {
      return res.status(404).json({ error: 'Support program not found' });
    }

    const effectiveFarmer = applyFarmerOverrides(baseFarmer, overrides);
    const result = checkEligibility(effectiveFarmer, program);
    res.json(result);
  });

  // 8b. POST /api/ai/explain-ineligibility
  app.post('/api/ai/explain-ineligibility', async (req: Request, res: Response) => {
    const parsed = aiExplainSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid AI explanation request payload' });
    }

    try {
      const { farmerId, farmer: customFarmer, programId, problemStatement, language } = parsed.data;
      const storedFarmer = farmerId ? farmers.find((f) => f.id === farmerId) : farmers[0];
      if (!storedFarmer && !customFarmer) {
        return res.status(404).json({ error: 'Farmer profile not found' });
      }

      const farmer: FarmerProfile = {
        ...(storedFarmer || farmers[0]),
        ...(customFarmer || {})
      };

      const program = programId
        ? SUPPORT_PROGRAMS.find((p) => p.id === programId)
        : SUPPORT_PROGRAMS[0];
      if (!program) {
        return res.status(404).json({ error: 'Support program not found' });
      }

      // Always recompute eligibility server-side from trusted rules rather than trusting client status
      const eligibility = checkEligibility(farmer, program);

      const explanation = await explainIneligibilityWithAi({
        farmer,
        program,
        eligibility,
        problemStatement,
        language
      });

      res.json(explanation);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      console.error('Error in /api/ai/explain-ineligibility:', message);
      res.status(500).json({ error: 'Failed to generate ineligibility explanation' });
    }
  });

  // 9. POST /api/pathways/generate
  app.post('/api/pathways/generate', (req: Request, res: Response) => {
    const parsed = pathwayGenerateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid pathway generation request' });
    }

    const { farmerId, programId, overrides } = parsed.data;
    const baseFarmer = farmerId ? farmers.find((f) => f.id === farmerId) : farmers[0];
    if (!baseFarmer) {
      return res.status(404).json({ error: 'Farmer profile not found' });
    }
    const program = programId ? SUPPORT_PROGRAMS.find((p) => p.id === programId) : SUPPORT_PROGRAMS[0];
    if (!program) {
      return res.status(404).json({ error: 'Support program not found' });
    }

    const effectiveFarmer = applyFarmerOverrides(baseFarmer, overrides);
    const eligibility = checkEligibility(effectiveFarmer, program);
    const pathway = generatePersonalizedPathway(effectiveFarmer, program, eligibility);

    if (pathwaysStore.size >= MAX_PATHWAYS_STORE) {
      const oldestKey = pathwaysStore.keys().next().value;
      if (oldestKey) pathwaysStore.delete(oldestKey);
    }
    pathwaysStore.set(pathway.id, pathway);
    res.json(pathway);
  });

  // 10. GET /api/pathways/:id
  app.get('/api/pathways/:id', (req: Request, res: Response) => {
    const idCheck = safeIdSchema.safeParse(req.params.id);
    if (!idCheck.success) {
      return res.status(400).json({ error: 'Invalid pathway ID format' });
    }
    const pathway = pathwaysStore.get(idCheck.data);
    if (!pathway) {
      return res.status(404).json({ error: 'Pathway record not found' });
    }
    res.json(pathway);
  });

  // 11. POST /api/phone/session
  app.post('/api/phone/session', (req: Request, res: Response) => {
    const parsed = phoneSessionSchema.safeParse(req.body ?? {});
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid caller number format' });
    }
    const state = createInitialPhoneSession(parsed.data.callerNumber);
    res.json(state);
  });

  // 12. POST /api/phone/input
  app.post('/api/phone/input', (req: Request, res: Response) => {
    const parsed = phoneInputSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid phone keypad input payload' });
    }
    const updatedState = processPhoneKeypadInput(
      parsed.data.digit,
      parsed.data.currentState as PhoneSessionState
    );
    res.json(updatedState);
  });

  // Malformed JSON and fallback error handler (prevents leaking stack traces)
  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    if (err instanceof SyntaxError && 'status' in err && (err as { status?: number }).status === 400) {
      return res.status(400).json({ error: 'Malformed JSON request body' });
    }
    console.error('Unhandled API error:', err instanceof Error ? err.message : 'Unknown error');
    return res.status(500).json({ error: 'Internal server error' });
  });

  return app;
}
