export type Language = 'en' | 'ta';

export type FarmerCategory = 'Marginal (<2.5 acres)' | 'Small (2.5 - 5.0 acres)' | 'Medium (5.0 - 10.0 acres)' | 'Large (>10.0 acres)';

export type IrrigationType = 'Rainfed' | 'Borewell / Tube Well' | 'Canal Irrigation' | 'Drip / Sprinkler' | 'None';

export interface DocumentItem {
  id: string;
  name: string;
  nameTa: string;
  code: string;
  description: string;
  descriptionTa: string;
  issuingAuthority: string;
  howToObtain: string;
  howToObtainTa: string;
}

export interface FarmerDocumentStatus {
  documentId: string;
  available: boolean;
  documentNumber?: string;
  verifiedStatus: 'verified' | 'unverified' | 'missing' | 'needs_update';
  updatedAt?: string;
}

export interface FarmerProfile {
  id: string;
  name: string;
  phone: string;
  state: string;
  district: string;
  taluk: string;
  village: string;
  landSizeAcres: number;
  crop: string;
  secondaryCrops?: string[];
  category: FarmerCategory;
  irrigationType: IrrigationType;
  hasBankAccount: boolean;
  bankName?: string;
  hasAadhaarLinkedBank: boolean;
  documents: FarmerDocumentStatus[];
  avatarUrl?: string;
}

export type NeedCategory =
  | 'irrigation'
  | 'insurance'
  | 'loan'
  | 'subsidy'
  | 'equipment'
  | 'seeds_inputs'
  | 'documents'
  | 'other';

export interface SupportProgram {
  id: string;
  name: string;
  nameTa: string;
  shortCode: string;
  description: string;
  descriptionTa: string;
  category: NeedCategory;
  sponsoringBody: 'Central Government' | 'State Government (Tamil Nadu)' | 'Joint (Centrally Sponsored)' | 'NABARD';
  targetStates: string[];
  targetDistricts?: string[];
  eligibleCrops: string[];
  minLandSizeAcres: number;
  maxLandSizeAcres: number;
  eligibleCategories: FarmerCategory[];
  requiredIrrigationTypes?: IrrigationType[];
  requiredDocuments: string[]; // document ids
  benefits: {
    en: string;
    ta: string;
    financialEstimate?: string;
  };
  applicationChannel: {
    type: 'online_portal' | 'csc_center' | 'bank_branch' | 'agriculture_office' | 'mobile_app';
    name: string;
    url?: string;
  };
  processingDaysAvg: number;
  officialInformationUrl: string;
  importantNote?: string;
}

export interface CriteriaCheck {
  id: string;
  title: string;
  titleTa: string;
  passed: boolean;
  explanation: string;
  explanationTa: string;
  importance: 'mandatory' | 'preference' | 'informational';
}

export interface EligibilityResult {
  programId: string;
  programName: string;
  programNameTa: string;
  status: 'eligible' | 'potentially_eligible' | 'partially_eligible' | 'not_eligible';
  statusLabel: string;
  statusLabelTa: string;
  overallScore: number; // 0 - 100 explainable score
  matchedCriteria: CriteriaCheck[];
  failedCriteria: CriteriaCheck[];
  missingDocuments: DocumentItem[];
  readyDocuments: DocumentItem[];
  primaryReason: string;
  primaryReasonTa: string;
  recommendedAction: string;
  recommendedActionTa: string;
}

export interface PathwayStep {
  stepNumber: number;
  title: string;
  titleTa: string;
  description: string;
  descriptionTa: string;
  status: 'completed' | 'in_progress' | 'action_required' | 'not_started';
  estimatedDays: string;
  actionUrl?: string;
  actionText?: string;
  actionTextTa?: string;
  documentsNeeded?: string[];
  departmentContact?: string;
  officerRole?: string;
}

export interface PersonalizedPathway {
  id: string;
  farmerId: string;
  programId: string;
  programName: string;
  programNameTa: string;
  generatedAt: string;
  eligibilityStatus: string;
  summary: string;
  summaryTa: string;
  steps: PathwayStep[];
  readinessPercentage: number;
  nearestCenterHint: string;
  trackingReference?: string;
}

export interface DetectedNeed {
  rawQuery: string;
  detectedCategory: NeedCategory;
  categoryName: string;
  categoryNameTa: string;
  extractedCrop?: string;
  extractedLocation?: string;
  extractedLandSize?: number;
  confidence: number;
  reasoning: string;
  followUpQuestions: {
    key: string;
    questionEn: string;
    questionTa: string;
    options?: string[];
  }[];
}

export interface DocumentUnlockOpportunity {
  document: DocumentItem;
  currentlyMissing: boolean;
  unlockedPrograms: {
    program: SupportProgram;
    eligibilityBefore: EligibilityResult['status'];
    eligibilityAfter: 'eligible' | 'potentially_eligible';
    benefitsSummary: string;
    benefitsSummaryTa: string;
    financialEstimate?: string;
  }[];
  totalPotentialBenefit?: string;
  howToObtain: string;
  howToObtainTa: string;
  issuingAuthority: string;
}

export interface AiIneligibilityExplanation {
  rootCause: string;
  rootCauseTa: string;
  actionableRemedy: string;
  actionableRemedyTa: string;
  alternativePrograms: {
    programId: string;
    programName: string;
    programNameTa: string;
    shortCode: string;
    whyBetterFit: string;
    whyBetterFitTa: string;
  }[];
  officialGuidanceNote: string;
  officialGuidanceNoteTa: string;
}

export type PhoneSessionStep =
  | 'welcome'
  | 'language_select'
  | 'need_category'
  | 'crop_select'
  | 'land_size'
  | 'irrigation_type'
  | 'documents_check'
  | 'processing'
  | 'result'
  | 'sms_sent';

export interface PhoneSessionState {
  sessionId: string;
  language: Language;
  step: PhoneSessionStep;
  callerNumber: string;
  selectedNeed?: NeedCategory;
  selectedCrop?: string;
  selectedLandAcres?: number;
  selectedIrrigation?: IrrigationType;
  selectedDocsLevel?: string;
  matchedProgram?: SupportProgram;
  matchedPrograms?: SupportProgram[];
  eligibilityStatus?: 'eligible' | 'potentially_eligible' | 'partially_eligible' | 'not_eligible';
  missingDocNames?: string[];
  missingDocNamesTa?: string[];
  ivrAudioPromptEn: string;
  ivrAudioPromptTa: string;
  ussdScreenText: string;
  smsMessageEn?: string;
  smsMessageTa?: string;
  smsDeliveredAt?: string;
  collectedSummary?: {
    needTitle: string;
    needTitleTa: string;
    crop: string;
    landAcres: number;
    category: string;
    irrigation: string;
    docsReadyCount: number;
  };
}
