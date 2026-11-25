import { describe, expect, it } from 'vitest';
import { DEMO_FARMERS, SUPPORT_PROGRAMS } from '../../data/mockData';
import { checkEligibility, calculateDocumentUnlocks } from '../eligibilityEngine';
import { detectNeedFromText } from '../nlpEngine';
import { generatePersonalizedPathway } from '../pathwayEngine';
import { createInitialPhoneSession, processPhoneKeypadInput } from '../phoneEngine';
import { generateDeterministicIneligibilityExplanation } from '../deterministicExplanation';
import {
  calculateProfileCompleteness,
  deriveFarmerCategory,
  getSafeHttpUrl
} from '../../utils/farmerUtils';
import { FarmerProfile } from '../../types';

const ravi = DEMO_FARMERS.find((f) => f.id === 'FARMER_001_RAVI')!;
const meenakshi = DEMO_FARMERS.find((f) => f.id === 'FARMER_002_MEENAKSHI')!;
const anand = DEMO_FARMERS.find((f) => f.id === 'FARMER_003_ANAND')!;
const selvaraj = DEMO_FARMERS.find((f) => f.id === 'FARMER_004_SELVARAJ')!;

const pmksy = SUPPORT_PROGRAMS.find((p) => p.id === 'PROG_PMKSY_DRIP')!;
const pmfby = SUPPORT_PROGRAMS.find((p) => p.id === 'PROG_PMFBY_INSURANCE')!;
const seedSubsidy = SUPPORT_PROGRAMS.find((p) => p.id === 'PROG_CERTIFIED_SEED_SUBSIDY')!;

describe('farmerUtils', () => {
  it('derives farmer category accurately across statutory boundaries', () => {
    expect(deriveFarmerCategory(0.5)).toBe('Marginal (<2.5 acres)');
    expect(deriveFarmerCategory(2.49)).toBe('Marginal (<2.5 acres)');
    expect(deriveFarmerCategory(2.5)).toBe('Small (2.5 - 5.0 acres)');
    expect(deriveFarmerCategory(5.0)).toBe('Small (2.5 - 5.0 acres)');
    expect(deriveFarmerCategory(5.1)).toBe('Medium (5.0 - 10.0 acres)');
    expect(deriveFarmerCategory(10.0)).toBe('Medium (5.0 - 10.0 acres)');
    expect(deriveFarmerCategory(10.1)).toBe('Large (>10.0 acres)');
  });

  it('calculates profile completeness percentage from populated fields', () => {
    expect(calculateProfileCompleteness(meenakshi)).toBe(100);
    const partialFarmer: FarmerProfile = {
      ...meenakshi,
      village: '',
      hasBankAccount: false
    };
    expect(calculateProfileCompleteness(partialFarmer)).toBe(75);
  });

  it('sanitizes URLs to allow only http/https protocols', () => {
    expect(getSafeHttpUrl('https://pmksy.gov.in/scheme')).toBe('https://pmksy.gov.in/scheme');
    expect(getSafeHttpUrl('http://agritech.tnau.ac.in')).toBe('http://agritech.tnau.ac.in/');
    expect(getSafeHttpUrl('javascript:alert(1)')).toBeUndefined();
    expect(getSafeHttpUrl('data:text/html,<script>')).toBeUndefined();
    expect(getSafeHttpUrl('')).toBeUndefined();
  });
});

describe('eligibilityEngine', () => {
  it('marks Scenario A (Ravi) as potentially_eligible for PMKSY due to missing Bank Passbook', () => {
    const result = checkEligibility(ravi, pmksy);
    expect(result.status).toBe('potentially_eligible');
    expect(result.failedCriteria.filter((c) => c.importance === 'mandatory')).toHaveLength(0);
    expect(result.missingDocuments.map((d) => d.id)).toContain('DOC_BANK_PASSBOOK');
    expect(result.overallScore).toBeGreaterThan(70);
    expect(result.overallScore).toBeLessThan(100);
  });

  it('marks Scenario B (Meenakshi) as fully eligible with score 100 for PMFBY', () => {
    const result = checkEligibility(meenakshi, pmfby);
    expect(result.status).toBe('eligible');
    expect(result.missingDocuments).toHaveLength(0);
    expect(result.overallScore).toBe(100);
  });

  it('marks Scenario C (Anand, 14 acres) as not_eligible for PMKSY with land limit failure', () => {
    const result = checkEligibility(anand, pmksy);
    expect(result.status).toBe('not_eligible');
    const failedIds = result.failedCriteria.map((c) => c.id);
    expect(failedIds).toContain('LAND_EXCEEDED');
  });

  it('detects land below minimum boundary edge case', () => {
    const microFarmer: FarmerProfile = {
      ...ravi,
      landSizeAcres: 0.1
    };
    const result = checkEligibility(microFarmer, pmksy);
    expect(result.status).toBe('not_eligible');
    expect(result.failedCriteria.some((c) => c.id === 'LAND_BELOW_MIN')).toBe(true);
  });

  it('computes document unlock opportunities for Selvaraj when missing Farmer ID / Adangal', () => {
    const unlocks = calculateDocumentUnlocks(selvaraj, SUPPORT_PROGRAMS);
    expect(unlocks.length).toBeGreaterThan(0);
    const missingUnlocks = unlocks.filter((u) => u.currentlyMissing);
    expect(missingUnlocks.length).toBeGreaterThan(0);
    expect(missingUnlocks.some((u) => u.unlockedPrograms.length > 0)).toBe(true);
  });
});

describe('nlpEngine', () => {
  it('detects English irrigation intent, crop, and land size', () => {
    const res = detectNeedFromText('I need drip irrigation support for my 2.4 acres rice crop');
    expect(res.detectedCategory).toBe('irrigation');
    expect(res.extractedCrop).toBe('Rice');
    expect(res.extractedLandSize).toBe(2.4);
    expect(res.confidence).toBeGreaterThanOrEqual(75);
  });

  it('detects Tamil irrigation query accurately', () => {
    const res = detectNeedFromText('எனக்கு பாசன உதவி மற்றும் சொட்டு நீர் வேண்டும்');
    expect(res.detectedCategory).toBe('irrigation');
    expect(res.confidence).toBeGreaterThan(70);
  });

  it('detects crop insurance, loan, equipment, subsidy, and seed categories', () => {
    expect(detectNeedFromText('My cotton crop was damaged by flood').detectedCategory).toBe('insurance');
    expect(detectNeedFromText('I need a KCC bank loan for agriculture').detectedCategory).toBe('loan');
    expect(detectNeedFromText('Want subsidy to buy a power tiller machine').detectedCategory).toBe('equipment');
    expect(detectNeedFromText('Check my PM KISAN disaster relief subsidy').detectedCategory).toBe('subsidy');
    expect(detectNeedFromText('Need certified seeds and soil test').detectedCategory).toBe('seeds_inputs');
  });

  it('falls back gracefully on ambiguous or unrecognized query text', () => {
    const res = detectNeedFromText('hello');
    expect(res.detectedCategory).toBe('irrigation');
    expect(res.confidence).toBe(70);
  });
});

describe('pathwayEngine', () => {
  it('generates 6-step pathway highlighting missing document action in Step 2 for Ravi', () => {
    const el = checkEligibility(ravi, pmksy);
    const pathway = generatePersonalizedPathway(ravi, pmksy, el);
    expect(pathway.steps).toHaveLength(6);
    expect(pathway.steps[0].status).toBe('completed');
    expect(pathway.steps[1].status).toBe('action_required');
    expect(pathway.steps[1].documentsNeeded).toContain('Bank Passbook / Cancelled Cheque');
    expect(pathway.readinessPercentage).toBe(17);
  });

  it('generates ready pathway when all mandatory documents are present', () => {
    const el = checkEligibility(meenakshi, pmfby);
    const pathway = generatePersonalizedPathway(meenakshi, pmfby, el);
    expect(pathway.steps[1].status).toBe('completed');
    expect(pathway.steps[2].status).toBe('in_progress');
    expect(pathway.readinessPercentage).toBe(33);
  });
});

describe('phoneEngine', () => {
  it('completes a full Tamil IVR keypad journey and generates bilingual SMS checklist', () => {
    let state = createInitialPhoneSession('+91 98765 43210');
    expect(state.step).toBe('welcome');

    state = processPhoneKeypadInput('1', state); // Tamil
    expect(state.language).toBe('ta');
    expect(state.step).toBe('need_category');

    state = processPhoneKeypadInput('1', state); // Irrigation
    expect(state.selectedNeed).toBe('irrigation');
    expect(state.step).toBe('crop_select');

    state = processPhoneKeypadInput('1', state); // Rice
    expect(state.selectedCrop).toBe('Rice');
    expect(state.step).toBe('land_size');

    state = processPhoneKeypadInput('1', state); // <2.5 acres -> 2.0
    expect(state.selectedLandAcres).toBe(2.0);
    expect(state.step).toBe('irrigation_type');

    state = processPhoneKeypadInput('1', state); // Borewell
    expect(state.selectedIrrigation).toBe('Borewell / Tube Well');
    expect(state.step).toBe('documents_check');

    state = processPhoneKeypadInput('3', state); // All docs ready
    expect(state.step).toBe('result');
    expect(state.matchedProgram).toBeDefined();
    expect(state.smsMessageTa).toContain('தமிழக அரசு');
    expect(state.smsMessageEn).toContain('GOVT OF TN');
  });

  it('handles result screen navigation (9 to restart, 0 to end)', () => {
    let state = createInitialPhoneSession();
    for (const key of ['2', '2', '2', '2', '3', '2']) {
      state = processPhoneKeypadInput(key, state);
    }
    expect(state.step).toBe('result');

    const restarted = processPhoneKeypadInput('9', state);
    expect(restarted.step).toBe('need_category');

    const ended = processPhoneKeypadInput('0', state);
    expect(ended.step).toBe('welcome');
  });
});

describe('deterministicExplanation', () => {
  it('explains land cap disqualifier and offers sub-division remedy when docs are complete', () => {
    const anandAllDocs: FarmerProfile = {
      ...anand,
      documents: anand.documents.map((d) => ({ ...d, available: true, verifiedStatus: 'verified' }))
    };
    const el = checkEligibility(anandAllDocs, pmksy);
    const exp = generateDeterministicIneligibilityExplanation(
      anandAllDocs,
      pmksy,
      el,
      'I want 100% free borewell subsidy'
    );
    expect(exp.rootCause).toContain('100%');
    expect(exp.actionableRemedy).toContain('joint patta');
    expect(exp.alternativePrograms.length).toBeGreaterThan(0);
    expect(exp.rootCauseTa.length).toBeGreaterThan(10);
  });

  it('identifies crop mismatch for PROG_CERTIFIED_SEED_SUBSIDY with Cotton', () => {
    const cottonFarmer: FarmerProfile = { ...meenakshi, crop: 'Cotton' };
    const el = checkEligibility(cottonFarmer, seedSubsidy);
    const exp = generateDeterministicIneligibilityExplanation(cottonFarmer, seedSubsidy, el);
    expect(exp.rootCause).toContain('Cotton');
  });
});
