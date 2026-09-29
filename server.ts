import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { DEMO_FARMERS, SUPPORT_PROGRAMS, SYSTEM_DOCUMENTS } from './src/data/mockData.js';
import { checkEligibility } from './src/services/eligibilityEngine.js';
import { detectNeedFromText } from './src/services/nlpEngine.js';
import { generatePersonalizedPathway } from './src/services/pathwayEngine.js';
import { createInitialPhoneSession, processPhoneKeypadInput } from './src/services/phoneEngine.js';
import { explainIneligibilityWithAi } from './src/services/aiIneligibilityService.js';
import { FarmerProfile, NeedCategory, PhoneSessionState } from './src/types/index.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// In-memory persistent database for the prototype
let farmers: FarmerProfile[] = JSON.parse(JSON.stringify(DEMO_FARMERS));
const pathwaysStore: Record<string, any> = {};

// 1. GET /api/farmers
app.get('/api/farmers', (_req: Request, res: Response) => {
  res.json(farmers);
});

// 2. GET /api/farmers/:id
app.get('/api/farmers/:id', (req: Request, res: Response) => {
  const farmer = farmers.find((f) => f.id === req.params.id);
  if (!farmer) {
    return res.status(404).json({ error: 'Farmer profile not found' });
  }
  res.json(farmer);
});

// 3. POST /api/farmers
app.post('/api/farmers', (req: Request, res: Response) => {
  const newFarmer: FarmerProfile = req.body;
  if (!newFarmer.id) {
    newFarmer.id = `FARMER_${Date.now()}`;
  }
  const existingIdx = farmers.findIndex((f) => f.id === newFarmer.id);
  if (existingIdx >= 0) {
    farmers[existingIdx] = newFarmer;
  } else {
    farmers.push(newFarmer);
  }
  res.status(201).json(newFarmer);
});

// 4. GET /api/farmers/:id/documents
app.get('/api/farmers/:id/documents', (req: Request, res: Response) => {
  const farmer = farmers.find((f) => f.id === req.params.id);
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
  const { query } = req.body;
  if (!query || typeof query !== 'string') {
    return res.status(400).json({ error: 'Query parameter is required' });
  }
  const result = detectNeedFromText(query);
  res.json(result);
});

// 6. GET /api/support-programs
app.get('/api/support-programs', (req: Request, res: Response) => {
  const { category } = req.query;
  if (category) {
    const filtered = SUPPORT_PROGRAMS.filter((p) => p.category === category);
    return res.json(filtered);
  }
  res.json(SUPPORT_PROGRAMS);
});

// 7. GET /api/support-programs/:id
app.get('/api/support-programs/:id', (req: Request, res: Response) => {
  const program = SUPPORT_PROGRAMS.find((p) => p.id === req.params.id);
  if (!program) {
    return res.status(404).json({ error: 'Support program not found' });
  }
  res.json(program);
});

// 8. POST /api/eligibility/check
app.post('/api/eligibility/check', (req: Request, res: Response) => {
  const { farmerId, programId } = req.body;
  const farmer = farmers.find((f) => f.id === farmerId) || farmers[0];
  const program = SUPPORT_PROGRAMS.find((p) => p.id === programId) || SUPPORT_PROGRAMS[0];

  const result = checkEligibility(farmer, program);
  res.json(result);
});

// 8b. POST /api/ai/explain-ineligibility
app.post('/api/ai/explain-ineligibility', async (req: Request, res: Response) => {
  try {
    const {
      farmerId,
      farmer: customFarmer,
      programId,
      program: customProgram,
      eligibility: customEligibility,
      problemStatement,
      language
    } = req.body;

    const farmer = customFarmer || farmers.find((f) => f.id === farmerId) || farmers[0];
    const program = customProgram || SUPPORT_PROGRAMS.find((p) => p.id === programId) || SUPPORT_PROGRAMS[0];
    const eligibility = customEligibility || checkEligibility(farmer, program);

    const explanation = await explainIneligibilityWithAi({
      farmer,
      program,
      eligibility,
      problemStatement,
      language: language || 'en'
    });

    res.json(explanation);
  } catch (err: any) {
    console.error('Error in /api/ai/explain-ineligibility:', err);
    res.status(500).json({ error: err.message || 'Failed to generate ineligibility explanation' });
  }
});

// 9. POST /api/pathways/generate
app.post('/api/pathways/generate', (req: Request, res: Response) => {
  const { farmerId, programId } = req.body;
  const farmer = farmers.find((f) => f.id === farmerId) || farmers[0];
  const program = SUPPORT_PROGRAMS.find((p) => p.id === programId) || SUPPORT_PROGRAMS[0];

  const eligibility = checkEligibility(farmer, program);
  const pathway = generatePersonalizedPathway(farmer, program, eligibility);
  pathwaysStore[pathway.id] = pathway;
  res.json(pathway);
});

// 10. GET /api/pathways/:id
app.get('/api/pathways/:id', (req: Request, res: Response) => {
  const pathway = pathwaysStore[req.params.id];
  if (!pathway) {
    return res.status(404).json({ error: 'Pathway record not found' });
  }
  res.json(pathway);
});

// 11. POST /api/phone/session
app.post('/api/phone/session', (req: Request, res: Response) => {
  const { callerNumber = '+91 94432 18901' } = req.body;
  const state = createInitialPhoneSession(callerNumber);
  res.json(state);
});

// 12. POST /api/phone/input
app.post('/api/phone/input', (req: Request, res: Response) => {
  const { sessionId, digit, currentState } = req.body;
  if (!currentState) {
    return res.status(400).json({ error: 'Current state required' });
  }

  const updatedState = processPhoneKeypadInput(digit, currentState);
  res.json(updatedState);
});

// Setup Vite middleware for local development
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Valam server running at http://localhost:${PORT}`);
  });
}

startServer();
