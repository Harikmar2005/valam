import { DEMO_FARMERS, SUPPORT_PROGRAMS, SYSTEM_DOCUMENTS } from '../data/mockData';
import { checkEligibility } from './eligibilityEngine';
import { detectNeedFromText } from './nlpEngine';
import { generatePersonalizedPathway } from './pathwayEngine';
import { createInitialPhoneSession, processPhoneKeypadInput } from './phoneEngine';
import { generateDeterministicIneligibilityExplanation } from './aiIneligibilityService';
import {
  AiIneligibilityExplanation,
  DetectedNeed,
  EligibilityResult,
  FarmerProfile,
  Language,
  NeedCategory,
  PersonalizedPathway,
  PhoneSessionState,
  SupportProgram
} from '../types';

const API_BASE = '/api';

export const api = {
  // Farmers
  async getFarmers(): Promise<FarmerProfile[]> {
    try {
      const res = await fetch(`${API_BASE}/farmers`);
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }
    return DEMO_FARMERS;
  },

  async getFarmerById(id: string): Promise<FarmerProfile> {
    try {
      const res = await fetch(`${API_BASE}/farmers/${id}`);
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }
    const found = DEMO_FARMERS.find((f) => f.id === id);
    if (!found) throw new Error('Farmer not found');
    return found;
  },

  async saveFarmer(farmer: FarmerProfile): Promise<FarmerProfile> {
    try {
      const res = await fetch(`${API_BASE}/farmers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(farmer)
      });
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }
    const idx = DEMO_FARMERS.findIndex((f) => f.id === farmer.id);
    if (idx >= 0) {
      DEMO_FARMERS[idx] = farmer;
    } else {
      DEMO_FARMERS.push(farmer);
    }
    return farmer;
  },

  // Need Detection (NLP / Keyword extraction)
  async detectNeed(query: string): Promise<DetectedNeed> {
    try {
      const res = await fetch(`${API_BASE}/needs/detect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }
    return detectNeedFromText(query);
  },

  // Support Programs
  async getSupportPrograms(category?: NeedCategory): Promise<SupportProgram[]> {
    try {
      const url = category ? `${API_BASE}/support-programs?category=${category}` : `${API_BASE}/support-programs`;
      const res = await fetch(url);
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }
    if (category) {
      return SUPPORT_PROGRAMS.filter((p) => p.category === category);
    }
    return SUPPORT_PROGRAMS;
  },

  async getSupportProgramById(id: string): Promise<SupportProgram> {
    try {
      const res = await fetch(`${API_BASE}/support-programs/${id}`);
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }
    const found = SUPPORT_PROGRAMS.find((p) => p.id === id);
    if (!found) throw new Error('Program not found');
    return found;
  },

  // Deterministic Eligibility Check
  async checkEligibility(farmerId: string, programId: string): Promise<EligibilityResult> {
    try {
      const res = await fetch(`${API_BASE}/eligibility/check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ farmerId, programId })
      });
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }
    const farmer = DEMO_FARMERS.find((f) => f.id === farmerId) || DEMO_FARMERS[0];
    const program = SUPPORT_PROGRAMS.find((p) => p.id === programId) || SUPPORT_PROGRAMS[0];
    return checkEligibility(farmer, program);
  },

  // AI-Powered Ineligibility Explainability
  async explainIneligibility(params: {
    farmer: FarmerProfile;
    program: SupportProgram;
    eligibility: EligibilityResult;
    problemStatement?: string;
    language?: Language;
  }): Promise<AiIneligibilityExplanation> {
    try {
      const res = await fetch(`${API_BASE}/ai/explain-ineligibility`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      });
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }
    return generateDeterministicIneligibilityExplanation(
      params.farmer,
      params.program,
      params.eligibility,
      params.problemStatement
    );
  },

  // Pathway Generation
  async generatePathway(farmerId: string, programId: string): Promise<PersonalizedPathway> {
    try {
      const res = await fetch(`${API_BASE}/pathways/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ farmerId, programId })
      });
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }
    const farmer = DEMO_FARMERS.find((f) => f.id === farmerId) || DEMO_FARMERS[0];
    const program = SUPPORT_PROGRAMS.find((p) => p.id === programId) || SUPPORT_PROGRAMS[0];
    const eligibility = checkEligibility(farmer, program);
    return generatePersonalizedPathway(farmer, program, eligibility);
  },

  // Feature Phone Simulation
  async startPhoneSession(callerNumber = '+91 94432 18901'): Promise<PhoneSessionState> {
    try {
      const res = await fetch(`${API_BASE}/phone/session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ callerNumber })
      });
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }
    return createInitialPhoneSession(callerNumber);
  },

  async handlePhoneInput(sessionId: string, digit: string, currentState: PhoneSessionState): Promise<PhoneSessionState> {
    try {
      const res = await fetch(`${API_BASE}/phone/input`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, digit, currentState })
      });
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }

    return processPhoneKeypadInput(digit, currentState);
  }
};
