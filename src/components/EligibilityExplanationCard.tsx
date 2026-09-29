import React, { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileText,
  Info,
  ArrowRight,
  ExternalLink,
  Building,
  Check,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Loader2,
  HelpCircle,
  Compass,
  ShieldCheck
} from 'lucide-react';
import { api } from '../services/api';
import { DEMO_FARMERS } from '../data/mockData';
import {
  AiIneligibilityExplanation,
  EligibilityResult,
  FarmerProfile,
  Language,
  SupportProgram
} from '../types';

interface EligibilityExplanationCardProps {
  eligibility: EligibilityResult;
  program: SupportProgram;
  language: Language;
  farmer?: FarmerProfile;
  problemStatement?: string;
  onGeneratePathway?: () => void;
  onSelectAlternativeProgram?: (programId: string) => void;
  showPathwayButton?: boolean;
  autoExpandAi?: boolean;
}

export const EligibilityExplanationCard: React.FC<EligibilityExplanationCardProps> = ({
  eligibility,
  program,
  language,
  farmer,
  problemStatement,
  onGeneratePathway,
  onSelectAlternativeProgram,
  showPathwayButton = true,
  autoExpandAi = false
}) => {
  const isTa = language === 'ta';

  // AI Diagnostic State
  const [aiExplanation, setAiExplanation] = useState<AiIneligibilityExplanation | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isAiExpanded, setIsAiExpanded] = useState(autoExpandAi || eligibility.status === 'not_eligible');

  const activeFarmer = farmer || DEMO_FARMERS[0];

  const handleFetchAiExplanation = async () => {
    if (aiExplanation) {
      setIsAiExpanded(!isAiExpanded);
      return;
    }

    setIsAiLoading(true);
    setIsAiExpanded(true);
    try {
      const result = await api.explainIneligibility({
        farmer: activeFarmer,
        program,
        eligibility,
        problemStatement,
        language
      });
      setAiExplanation(result);
    } catch (err) {
      console.error('Failed to get AI ineligibility explanation:', err);
    } finally {
      setIsAiLoading(false);
    }
  };

  const getStatusBadge = () => {
    switch (eligibility.status) {
      case 'eligible':
        return {
          bg: 'bg-emerald-50 border-emerald-200 text-emerald-900',
          icon: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />,
          label: isTa ? eligibility.statusLabelTa : eligibility.statusLabel
        };
      case 'potentially_eligible':
        return {
          bg: 'bg-amber-50 border-amber-200 text-amber-900',
          icon: <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />,
          label: isTa ? eligibility.statusLabelTa : eligibility.statusLabel
        };
      case 'partially_eligible':
        return {
          bg: 'bg-sky-50 border-sky-200 text-sky-900',
          icon: <Info className="w-5 h-5 text-sky-600 shrink-0" />,
          label: isTa ? eligibility.statusLabelTa : eligibility.statusLabel
        };
      case 'not_eligible':
      default:
        return {
          bg: 'bg-rose-50 border-rose-200 text-rose-900',
          icon: <XCircle className="w-5 h-5 text-rose-600 shrink-0" />,
          label: isTa ? eligibility.statusLabelTa : eligibility.statusLabel
        };
    }
  };

  const badge = getStatusBadge();

  return (
    <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-xs overflow-hidden space-y-0">
      {/* Header Banner */}
      <div className={`p-5 border-b border-[#E5E7EB] ${badge.bg}`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start sm:items-center gap-3">
            {badge.icon}
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#4B5563]">
                  {isTa ? 'தகுதி நிலை' : 'Eligibility Evaluation'}
                </span>
                <span className="text-xs font-medium text-[#6B7280]">·</span>
                <span className="text-xs font-mono font-medium text-[#4B5563]">
                  {isTa ? 'கணக்கீட்டு குறியீடு' : 'Score'}: {eligibility.overallScore}/100
                </span>
              </div>
              <h3 className="font-display font-bold text-lg text-[#111827]">
                {badge.label}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-[#6B7280] bg-white/80 px-2.5 py-1 rounded-md border border-[#E5E7EB]">
              {isTa ? 'சராசரி ஒப்புதல் காலம்' : 'Est. Processing'}: {program.processingDaysAvg} {isTa ? 'நாட்கள்' : 'Days'}
            </span>
          </div>
        </div>

        {/* Primary Explanation Note */}
        <p className="mt-3 text-xs sm:text-sm text-[#374151] leading-relaxed bg-white/60 p-3 rounded-lg border border-[#E5E7EB]/60">
          <span className="font-semibold text-[#111827]">
            {isTa ? 'மதிப்பீட்டு சுருக்கம்: ' : 'Assessment Note: '}
          </span>
          {isTa ? eligibility.primaryReasonTa : eligibility.primaryReason}
        </p>

        {/* PROMINENT AI INELIGIBILITY EXPLANATION TRIGGER */}
        <div className="mt-4 pt-3 border-t border-[#E5E7EB]/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-1.5 text-xs text-[#374151]">
            <Sparkles className="w-4 h-4 text-[#D97706] shrink-0" />
            <span className="font-semibold">
              {eligibility.status === 'not_eligible'
                ? isTa
                  ? 'விண்ணப்பம் ஏன் தகுதி பெறவில்லை என்ற நேரடி AI விளக்கம்:'
                  : 'AI Root-Cause Diagnosis: Why is this application not eligible?'
                : isTa
                ? 'தகுதி பெற தேவையான AI ஆலோசனைகள் மற்றும் மாற்று வழிகள்:'
                : 'AI Strategic Advisory: What barriers exist & how to qualify?'}
            </span>
          </div>

          <button
            onClick={handleFetchAiExplanation}
            disabled={isAiLoading}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer shrink-0 self-start sm:self-auto ${
              eligibility.status === 'not_eligible'
                ? 'bg-[#B91C1C] hover:bg-[#991B1B] text-white ring-2 ring-rose-300'
                : 'bg-[#1B4D2E] hover:bg-[#143B23] text-white ring-1 ring-emerald-300'
            }`}
          >
            {isAiLoading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>{isTa ? 'AI ஆய்வு செய்கிறது...' : 'AI Analyzing Rules...'}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>
                  {aiExplanation
                    ? isAiExpanded
                      ? isTa ? 'AI விளக்கத்தை மறை' : 'Hide AI Diagnostic'
                      : isTa ? 'AI விளக்கத்தைக் காட்டு' : 'View AI Diagnostic'
                    : isTa
                    ? 'AI-யிடம் விளக்கம் கேட்க'
                    : 'Explain Why With AI'}
                </span>
                {isAiExpanded ? <ChevronUp className="w-3.5 h-3.5 ml-0.5" /> : <ChevronDown className="w-3.5 h-3.5 ml-0.5" />}
              </>
            )}
          </button>
        </div>

        {/* AI Ineligibility Diagnostic Panel */}
        {isAiExpanded && (
          <div className="mt-4 p-4 rounded-xl bg-white border-2 border-amber-300 shadow-md text-xs space-y-4 animate-fadeIn">
            {isAiLoading && (
              <div className="flex items-center justify-center py-6 gap-3 text-[#4B5563]">
                <Loader2 className="w-5 h-5 text-[#1B4D2E] animate-spin" />
                <span className="font-semibold">
                  {isTa
                    ? 'உங்கள் விவசாய விவரங்கள் மற்றும் அரசு விதிமுறைகளை AI பகுப்பாய்வு செய்கிறது...'
                    : 'Gemini AI is examining your problem statement and statutory government rules...'}
                </span>
              </div>
            )}

            {aiExplanation && !isAiLoading && (
              <div className="space-y-4">
                {/* 1. Root Cause Explanation */}
                <div className="p-3.5 rounded-xl bg-rose-50/70 border border-rose-200 text-rose-950 space-y-1.5">
                  <div className="font-bold text-rose-900 flex items-center gap-1.5 text-xs sm:text-sm">
                    <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>
                      {isTa ? 'ஏன் இந்த விண்ணப்பம் தகுதி பெறவில்லை?' : 'Why This Application Is Not Eligible:'}
                    </span>
                  </div>
                  <p className="text-xs text-rose-900 leading-relaxed font-medium pl-5">
                    {isTa ? aiExplanation.rootCauseTa : aiExplanation.rootCause}
                  </p>
                </div>

                {/* 2. Actionable Remedy / How to Fix */}
                <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 text-emerald-950 space-y-1.5">
                  <div className="font-bold text-emerald-900 flex items-center gap-1.5 text-xs sm:text-sm">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>
                      {isTa ? 'தகுதி பெற செய்ய வேண்டிய வழிமுறை:' : 'Actionable Remedy & Fix to Qualify:'}
                    </span>
                  </div>
                  <p className="text-xs text-emerald-900 leading-relaxed pl-5 font-medium">
                    {isTa ? aiExplanation.actionableRemedyTa : aiExplanation.actionableRemedy}
                  </p>
                </div>

                {/* 3. Alternative Eligible Schemes */}
                {aiExplanation.alternativePrograms && aiExplanation.alternativePrograms.length > 0 && (
                  <div className="space-y-2 pt-1">
                    <div className="font-bold text-[#111827] flex items-center gap-1.5">
                      <Compass className="w-4 h-4 text-[#1B4D2E]" />
                      <span>
                        {isTa ? 'உங்களுக்கு ஏற்ற மாற்று அரசு திட்டங்கள்:' : 'Alternative Schemes Better Suited for You:'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {aiExplanation.alternativePrograms.map((alt) => (
                        <div
                          key={alt.programId}
                          className="p-3 rounded-xl bg-[#F8FAF9] border border-[#C2E5CA] hover:border-[#1B4D2E] transition-all space-y-1.5 shadow-2xs"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs text-[#1B4D2E]">{alt.shortCode}</span>
                            <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded">
                              {isTa ? 'பரிந்துரை' : 'Alternative Fit'}
                            </span>
                          </div>
                          <div className="font-semibold text-xs text-[#111827]">
                            {isTa ? alt.programNameTa : alt.programName}
                          </div>
                          <p className="text-[11px] text-[#4B5563] leading-relaxed">
                            {isTa ? alt.whyBetterFitTa : alt.whyBetterFit}
                          </p>
                          {onSelectAlternativeProgram && (
                            <button
                              onClick={() => onSelectAlternativeProgram(alt.programId)}
                              className="text-[11px] font-bold text-[#1B4D2E] hover:underline flex items-center gap-1 pt-1 cursor-pointer"
                            >
                              <span>{isTa ? 'இத்திட்டத்தை சோதிக்க' : 'Switch to this Scheme'}</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Official Policy Note */}
                <div className="text-[10px] text-[#6B7280] italic flex items-center gap-1 pt-1 border-t border-[#E5E7EB]">
                  <HelpCircle className="w-3 h-3 text-[#9CA3AF] shrink-0" />
                  <span>{isTa ? aiExplanation.officialGuidanceNoteTa : aiExplanation.officialGuidanceNote}</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="p-5 space-y-6">
        {/* Section 1: Why This Support Was Matched (Verified Rules) */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#111827] mb-3 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{isTa ? 'இந்த உதவி ஏன் பொருந்துகிறது? (ஏற்ற விதிகள்)' : 'Why This Support Was Matched (Verified Rules)'}</span>
          </h4>
          <div className="space-y-2">
            {eligibility.matchedCriteria.map((c) => (
              <div
                key={c.id}
                className="flex items-start gap-2.5 p-3 rounded-lg bg-[#F8FAF8] border border-[#E2ECE2] text-xs"
              >
                <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
                <div>
                  <span className="font-semibold text-[#1F2937]">
                    {isTa ? c.titleTa : c.title}:{' '}
                  </span>
                  <span className="text-[#4B5563] leading-relaxed">
                    {isTa ? c.explanationTa : c.explanation}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 2: Failed Criteria (Unmet Criteria) */}
        {eligibility.failedCriteria.length > 0 && (
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-rose-800 mb-3 flex items-center gap-1.5">
              <XCircle className="w-4 h-4 text-rose-600" />
              <span>{isTa ? 'பொருந்தாத நிபந்தனைகள்' : 'Unmet Criteria / Disqualifiers'}</span>
            </h4>
            <div className="space-y-2">
              {eligibility.failedCriteria.map((c) => (
                <div
                  key={c.id}
                  className="flex items-start gap-2.5 p-3 rounded-lg bg-rose-50/50 border border-rose-200 text-xs"
                >
                  <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-rose-900">
                      {isTa ? c.titleTa : c.title}:{' '}
                    </span>
                    <span className="text-rose-800 leading-relaxed">
                      {isTa ? c.explanationTa : c.explanation}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Section 3: Document Readiness Comparison */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#111827] flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-[#1B4D2E]" />
              <span>
                {isTa
                  ? `ஆவண தயார்நிலை (${eligibility.readyDocuments.length} / ${eligibility.readyDocuments.length + eligibility.missingDocuments.length} ஆவணங்கள் தயார்)`
                  : `Document Readiness (${eligibility.readyDocuments.length} of ${eligibility.readyDocuments.length + eligibility.missingDocuments.length} Ready)`}
              </span>
            </h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Ready Documents */}
            {eligibility.readyDocuments.map((doc) => (
              <div
                key={doc.id}
                className="p-3 rounded-lg bg-[#FAFAFA] border border-[#E5E7EB] flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-medium text-[#111827]">{isTa ? doc.nameTa : doc.name}</span>
                </div>
                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {isTa ? 'தயார்' : 'Ready'}
                </span>
              </div>
            ))}

            {/* Missing Documents */}
            {eligibility.missingDocuments.map((doc) => (
              <div
                key={doc.id}
                className="p-3 rounded-lg bg-amber-50/60 border border-amber-200 flex flex-col gap-1.5 text-xs col-span-1 sm:col-span-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span className="font-semibold text-amber-950">
                      {isTa ? doc.nameTa : doc.name}
                    </span>
                  </div>
                  <span className="text-[11px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded border border-amber-300">
                    {isTa ? 'விடுபட்டது' : 'Missing'}
                  </span>
                </div>
                <p className="text-[11px] text-amber-900 leading-relaxed pl-6">
                  <span className="font-semibold">{isTa ? 'பெறுவது எப்படி: ' : 'How to obtain: '}</span>
                  {isTa ? doc.howToObtainTa : doc.howToObtain}
                </p>
                <div className="pl-6 text-[11px] text-[#4B5563] flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-[#6B7280]" />
                  <span>
                    {isTa ? 'வழங்கும் அதிகாரி: ' : 'Issuing authority: '}
                    {doc.issuingAuthority}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 4: Benefits Overview & Official Link */}
        <div className="p-4 rounded-xl bg-[#F8FAF9] border border-[#E0EBE2] text-xs text-[#2A382D]">
          <div className="font-semibold text-sm text-[#14381E] mb-1">
            {isTa ? 'திட்டத்தின் பயன்கள்' : 'Entitled Scheme Benefits'}
          </div>
          <p className="leading-relaxed mb-2 text-[#3A4B3D]">
            {isTa ? program.benefits.ta : program.benefits.en}
          </p>
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#D7E3D9] text-[11px]">
            <span className="font-medium text-[#1B4D2E]">
              {isTa ? 'விண்ணப்பிக்கும் தளம்: ' : 'Application Channel: '}
              {program.applicationChannel.name}
            </span>
            <a
              href={program.officialInformationUrl}
              target="_blank"
              rel="noreferrer"
              className="text-[#1B4D2E] hover:underline flex items-center gap-1 font-semibold"
            >
              <span>{isTa ? 'அதிகாரப்பூர்வ தளம்' : 'Official Portal'}</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* CTA to Generate Personalized Pathway */}
        {showPathwayButton && onGeneratePathway && (
          <div className="pt-2 flex items-center justify-between">
            <div className="text-xs text-[#6B7280]">
              {eligibility.missingDocuments.length === 0
                ? isTa ? 'உடனடியாக விண்ணப்பிக்கலாம்' : 'Ready for direct submission'
                : isTa ? 'ஆவணம் பெறுவதற்கான செயல் பாதை தேவை' : 'Action roadmap available'}
            </div>
            <button
              onClick={onGeneratePathway}
              className="px-5 py-2.5 text-xs font-bold text-white bg-[#1B4D2E] hover:bg-[#143B23] rounded-lg transition-all flex items-center gap-2 shadow-xs cursor-pointer"
            >
              <span>{isTa ? 'செயல் பாதையை உருவாக்குக' : 'Generate Personalized Pathway'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
