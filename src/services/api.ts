import { DEMO_FARMERS, SUPPORT_PROGRAMS } from '../data/mockData';
import { checkEligibility } from './eligibilityEngine';
import { detectNeedFromText } from './nlpEngine';
import { generatePersonalizedPathway } from './pathwayEngine';
import { createInitialPhoneSession, processPhoneKeypadInput } from './phoneEngine';
import { generateDeterministicIneligibilityExplanation } from './deterministicExplanation';
import { deriveFarmerCategory } from '../utils/farmerUtils';
import {
  AiIneligibilityExplanation,
  DetectedNeed,
  EligibilityResult,
  FarmerProfile,
  IrrigationType,
  Language,
  NeedCategory,
  PersonalizedPathway,
  PhoneSessionState,
  SupportProgram
} from '../types';

const API_BASE = '/api';

export interface FarmerOverrides {
  crop?: string;
  landSizeAcres?: number;
  irrigationType?: IrrigationType;
}

function applyLocalOverrides(farmer: FarmerProfile, overrides?: FarmerOverrides): FarmerProfile {
  if (!overrides) return farmer;
  const landSizeAcres = overrides.landSizeAcres ?? farmer.landSizeAcres;
  return {
    ...farmer,
    crop: overrides.crop ?? farmer.crop,
    landSizeAcres,
    category: overrides.landSizeAcres !== undefined ? deriveFarmerCategory(landSizeAcres) : farmer.category,
    irrigationType: overrides.irrigationType ?? farmer.irrigationType
  };
}

let cachedPrograms: SupportProgram[] | null = null;

/**
 * Typed frontend API client for VALAM with resilient local fallback when
 * running in offline or standalone preview modes.
 */
export const api = {
  // Farmers
  async getFarmers(): Promise<FarmerProfile[]> {
    try {
      const res = await fetch(`${API_BASE}/farmers`);
      if (res.ok) return await res.json();
    } catch {
      // network offline fallback
    }
    return DEMO_FARMERS;
  },

  async getFarmerById(id: string): Promise<FarmerProfile> {
    try {
      const res = await fetch(`${API_BASE}/farmers/${encodeURIComponent(id)}`);
      if (res.ok) return await res.json();
    } catch {
      // network offline fallback
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
      if (res.status >= 400 && res.status < 500) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody.error || 'Invalid farmer profile data');
      }
    } catch (err) {
      if (err instanceof Error && err.message.startsWith('Invalid')) {
        throw err;
      }
      // network offline fallback
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

  // Support Programs (cached for session efficiency)
  async getSupportPrograms(category?: NeedCategory): Promise<SupportProgram[]> {
    if (!category && cachedPrograms) {
      return cachedPrograms;
    }
    try {
      const url = category
        ? `${API_BASE}/support-programs?category=${encodeURIComponent(category)}`
        : `${API_BASE}/support-programs`;
      const res = await fetch(url);
      if (res.ok) {
        const data: SupportProgram[] = await res.json();
        if (!category) cachedPrograms = data;
        return data;
      }
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
      const res = await fetch(`${API_BASE}/support-programs/${encodeURIComponent(id)}`);
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }
    const found = SUPPORT_PROGRAMS.find((p) => p.id === id);
    if (!found) throw new Error('Program not found');
    return found;
  },

  // Deterministic Eligibility Check (supports live parameter overrides)
  async checkEligibility(
    farmerId: string,
    programId: string,
    overrides?: FarmerOverrides
  ): Promise<EligibilityResult> {
    try {
      const res = await fetch(`${API_BASE}/eligibility/check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ farmerId, programId, overrides })
      });
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }
    const baseFarmer = DEMO_FARMERS.find((f) => f.id === farmerId) || DEMO_FARMERS[0];
    const effectiveFarmer = applyLocalOverrides(baseFarmer, overrides);
    const program = SUPPORT_PROGRAMS.find((p) => p.id === programId) || SUPPORT_PROGRAMS[0];
    return checkEligibility(effectiveFarmer, program);
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
        body: JSON.stringify({
          farmerId: params.farmer.id,
          farmer: params.farmer,
          programId: params.program.id,
          problemStatement: params.problemStatement,
          language: params.language
        })
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

  // Pathway Generation (supports live parameter overrides)
  async generatePathway(
    farmerId: string,
    programId: string,
    overrides?: FarmerOverrides
  ): Promise<PersonalizedPathway> {
    try {
      const res = await fetch(`${API_BASE}/pathways/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ farmerId, programId, overrides })
      });
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }
    const baseFarmer = DEMO_FARMERS.find((f) => f.id === farmerId) || DEMO_FARMERS[0];
    const effectiveFarmer = applyLocalOverrides(baseFarmer, overrides);
    const program = SUPPORT_PROGRAMS.find((p) => p.id === programId) || SUPPORT_PROGRAMS[0];
    const eligibility = checkEligibility(effectiveFarmer, program);
    return generatePersonalizedPathway(effectiveFarmer, program, eligibility);
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

  async handlePhoneInput(
    sessionId: string,
    digit: string,
    currentState: PhoneSessionState
  ): Promise<PhoneSessionState> {
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
