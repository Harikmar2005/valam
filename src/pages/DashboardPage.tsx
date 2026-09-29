import React from 'react';
import {
  Sprout,
  Compass,
  FileText,
  Phone,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ExternalLink,
  MapPin,
  Building,
  ShieldCheck,
  ChevronRight,
  UserPlus
} from 'lucide-react';
import { SUPPORT_PROGRAMS } from '../data/mockData';
import { checkEligibility } from '../services/eligibilityEngine';
import { DocumentUnlockAdvisory } from '../components/DocumentUnlockAdvisory';
import { FarmerProfile, Language, SupportProgram } from '../types';

interface DashboardPageProps {
  activeFarmer: FarmerProfile;
  language: Language;
  onNavigate: (tab: string) => void;
  onOpenFarmerModal: () => void;
  onOpenCreateModal?: () => void;
  onSelectProgramForPathway: (program: SupportProgram) => void;
  onUpdateFarmerDocs?: (updated: FarmerProfile) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  activeFarmer,
  language,
  onNavigate,
  onOpenFarmerModal,
  onOpenCreateModal,
  onSelectProgramForPathway,
  onUpdateFarmerDocs
}) => {
  const isTa = language === 'ta';

  // Calculate profile completeness
  const totalFields = 8;
  let filledFields = 0;
  if (activeFarmer.name) filledFields++;
  if (activeFarmer.state) filledFields++;
  if (activeFarmer.district) filledFields++;
  if (activeFarmer.village) filledFields++;
  if (activeFarmer.landSizeAcres > 0) filledFields++;
  if (activeFarmer.crop) filledFields++;
  if (activeFarmer.category) filledFields++;
  if (activeFarmer.hasBankAccount) filledFields++;
  const completeness = Math.round((filledFields / totalFields) * 100);

  // Document readiness
  const verifiedDocs = activeFarmer.documents.filter((d) => d.available && d.verifiedStatus === 'verified').length;
  const totalDocs = activeFarmer.documents.length;
  const missingDocs = activeFarmer.documents.filter((d) => !d.available || d.verifiedStatus === 'missing').length;

  // Evaluate top programs for this farmer
  const evaluatedPrograms = SUPPORT_PROGRAMS.slice(0, 4).map((prog) => {
    const el = checkEligibility(activeFarmer, prog);
    return {
      program: prog,
      eligibility: el
    };
  });

  const potentialMatchesCount = evaluatedPrograms.filter(
    (ep) => ep.eligibility.status === 'eligible' || ep.eligibility.status === 'potentially_eligible'
  ).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* 1. Welcome & Status Card */}
      <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="text-xs font-semibold uppercase tracking-wider text-[#6B7280]">
                {isTa ? 'செயலில் உள்ள சுயவிவரம்' : 'Active Farmer Session'}
              </span>
            </div>
            <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-[#111827]">
              {isTa ? `வணக்கம், ${activeFarmer.name} ஐயா` : `Welcome, ${activeFarmer.name}`}
            </h1>
            <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-[#6B7280]">
              <span className="flex items-center gap-1 font-medium text-[#111827]">
                <MapPin className="w-3 h-3 text-[#1B4D2E]" />
                {activeFarmer.village}, {activeFarmer.taluk}, {activeFarmer.district}
              </span>
              <span>·</span>
              <span>{activeFarmer.crop} ({activeFarmer.landSizeAcres} acres)</span>
              <span>·</span>
              <span className="font-medium text-[#1B4D2E]">{activeFarmer.category}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {onOpenCreateModal && (
              <button
                onClick={onOpenCreateModal}
                className="px-3.5 py-2 text-xs font-bold text-[#1B4D2E] bg-[#EAF5EC] hover:bg-[#D7EEDD] border border-[#C2E5CA] rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>{isTa ? '+ புதிய ஐடி' : '+ Create Farmer ID'}</span>
              </button>
            )}
            <button
              onClick={onOpenFarmerModal}
              className="px-4 py-2 text-xs font-semibold text-[#1F2937] bg-[#F9FAFB] hover:bg-[#F3F4F6] border border-[#D1D5DB] rounded-lg transition-colors cursor-pointer"
            >
              {isTa ? 'மாதிரி விவசாயி மாற்றுக' : 'Switch Demo Scenario'}
            </button>
            <button
              onClick={() => onNavigate('navigator')}
              className="px-4 py-2 text-xs font-bold text-white bg-[#1B4D2E] hover:bg-[#143B23] rounded-lg transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Compass className="w-4 h-4" />
              <span>{isTa ? 'புதிய தேவை வழிகாட்டி' : 'Find Support'}</span>
            </button>
          </div>
        </div>

        {/* 2. Top Metric Tiles: Profile Completeness & Status Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-6 border-t border-[#E5E7EB]">
          {/* Tile 1: Potential Matches */}
          <div className="p-4 rounded-xl bg-[#F8FAF9] border border-[#E0EBE2]">
            <div className="text-xs text-[#6B7280] font-medium">
              {isTa ? 'பொருந்தக்கூடிய திட்டங்கள்' : 'Potential Scheme Matches'}
            </div>
            <div className="text-2xl font-extrabold text-[#14381E] mt-1 tabular-nums">
              {potentialMatchesCount} {isTa ? 'திட்டங்கள்' : 'Schemes'}
            </div>
            <div className="text-[11px] text-[#1B4D2E] font-medium mt-1">
              {isTa ? 'விவசாய விதிகளின்படி பொருந்துகிறது' : 'Location & crop criteria satisfied'}
            </div>
          </div>

          {/* Tile 2: Document Readiness */}
          <div className="p-4 rounded-xl bg-[#F8FAF9] border border-[#E0EBE2]">
            <div className="text-xs text-[#6B7280] font-medium">
              {isTa ? 'ஆவண தயார்நிலை' : 'Document Readiness'}
            </div>
            <div className="text-2xl font-extrabold text-[#111827] mt-1 tabular-nums">
              {verifiedDocs} / {totalDocs}
            </div>
            <div className="text-[11px] text-[#4B5563] mt-1">
              {missingDocs > 0 ? (
                <span className="text-amber-700 font-semibold">{missingDocs} document missing</span>
              ) : (
                <span className="text-emerald-700 font-semibold">All documents ready</span>
              )}
            </div>
          </div>

          {/* Tile 3: Profile Completeness */}
          <div className="p-4 rounded-xl bg-[#F8FAF9] border border-[#E0EBE2]">
            <div className="text-xs text-[#6B7280] font-medium">
              {isTa ? 'சுயவிவர முழுமை' : 'Profile Completeness'}
            </div>
            <div className="text-2xl font-extrabold text-[#111827] mt-1 tabular-nums">
              {completeness}%
            </div>
            <div className="w-full bg-[#E5E7EB] h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-[#1B4D2E] h-full rounded-full"
                style={{ width: `${completeness}%` }}
              />
            </div>
          </div>

          {/* Tile 4: Active Action Status */}
          <div className="p-4 rounded-xl bg-[#FFFBF0] border border-[#FDE68A]">
            <div className="text-xs text-[#92400E] font-medium">
              {isTa ? 'அடுத்த உடனடி நடவடிக்கை' : 'Next Immediate Action'}
            </div>
            <div className="text-base font-bold text-[#78350F] mt-1 line-clamp-1">
              {missingDocs > 0 ? 'Obtain Bank Passbook' : 'Submit Application'}
            </div>
            <div className="text-[11px] text-[#B45309] mt-1">
              {missingDocs > 0 ? 'Visit nearest branch for seal' : 'Via Uzhavan app or CSC'}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Quick Action Launchers */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#6B7280] mb-3">
          {isTa ? 'விரைவு சேவைகள்' : 'Quick Actions'}
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            onClick={() => onNavigate('navigator')}
            className="p-4 rounded-xl bg-white border border-[#E5E7EB] hover:border-[#1B4D2E] hover:shadow-xs transition-all text-left flex flex-col justify-between cursor-pointer"
          >
            <Compass className="w-5 h-5 text-[#1B4D2E] mb-2" />
            <div>
              <div className="font-bold text-xs text-[#111827]">
                {isTa ? 'தேவை வழிகாட்டி' : 'Find Support'}
              </div>
              <div className="text-[11px] text-[#6B7280]">
                {isTa ? 'பிரச்சனையை கூறி வழியமைக்க' : 'Describe your problem'}
              </div>
            </div>
          </button>

          <button
            onClick={() => onNavigate('profile')}
            className="p-4 rounded-xl bg-white border border-[#E5E7EB] hover:border-[#1B4D2E] hover:shadow-xs transition-all text-left flex flex-col justify-between cursor-pointer"
          >
            <FileText className="w-5 h-5 text-[#1B4D2E] mb-2" />
            <div>
              <div className="font-bold text-xs text-[#111827]">
                {isTa ? 'ஆவணங்களை சரிபார்க்க' : 'Check Documents'}
              </div>
              <div className="text-[11px] text-[#6B7280]">
                {isTa ? 'விடுபட்ட ஆவண விவரங்கள்' : 'Manage on-hand papers'}
              </div>
            </div>
          </button>

          <button
            onClick={() => {
              onSelectProgramForPathway(evaluatedPrograms[0].program);
              onNavigate('navigator');
            }}
            className="p-4 rounded-xl bg-white border border-[#E5E7EB] hover:border-[#1B4D2E] hover:shadow-xs transition-all text-left flex flex-col justify-between cursor-pointer"
          >
            <ShieldCheck className="w-5 h-5 text-[#1B4D2E] mb-2" />
            <div>
              <div className="font-bold text-xs text-[#111827]">
                {isTa ? 'எனது செயல் பாதை' : 'My Pathway'}
              </div>
              <div className="text-[11px] text-[#6B7280]">
                {isTa ? '6-படி விரிவான திட்டம்' : 'Step-by-step roadmap'}
              </div>
            </div>
          </button>

          <button
            onClick={() => onNavigate('phone-simulator')}
            className="p-4 rounded-xl bg-white border border-[#E5E7EB] hover:border-[#1B4D2E] hover:shadow-xs transition-all text-left flex flex-col justify-between cursor-pointer"
          >
            <Phone className="w-5 h-5 text-[#1B4D2E] mb-2" />
            <div>
              <div className="font-bold text-xs text-[#111827]">
                {isTa ? 'போன் சிமுலேட்டர்' : 'Phone Simulator'}
              </div>
              <div className="text-[11px] text-[#6B7280]">
                {isTa ? 'பட்டன் போன் IVR சேவை' : 'Dial 1800-VALAM'}
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Document Multiplier Opportunities: If you add these documents, you become eligible for these also */}
      <DocumentUnlockAdvisory
        farmer={activeFarmer}
        language={language}
        onUpdateFarmerDocs={onUpdateFarmerDocs}
        onSelectProgram={(program) => {
          onSelectProgramForPathway(program);
          onNavigate('navigator');
        }}
      />

      {/* 4. Recommended Support Programs Based on Farm Profile */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display font-bold text-lg text-[#111827]">
              {isTa ? 'உங்கள் நிலத்திற்கு பரிந்துரைக்கப்படும் திட்டங்கள்' : 'Recommended Support for Your Farm'}
            </h3>
            <p className="text-xs text-[#6B7280]">
              {isTa
                ? `${activeFarmer.crop} மற்றும் ${activeFarmer.landSizeAcres} ஏக்கர் நிலத்திற்கு ஏற்ற திட்டங்கள்.`
                : `Matched against ${activeFarmer.crop} crop, ${activeFarmer.landSizeAcres} acres, and ${activeFarmer.district} district.`}
            </p>
          </div>
          <button
            onClick={() => onNavigate('programs')}
            className="text-xs font-semibold text-[#1B4D2E] hover:underline flex items-center gap-1"
          >
            <span>{isTa ? 'அனைத்து திட்டங்கள் →' : 'View all 10 schemes →'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {evaluatedPrograms.map(({ program, eligibility }) => {
            const isEligible = eligibility.status === 'eligible';
            const isPotential = eligibility.status === 'potentially_eligible';

            return (
              <div
                key={program.id}
                className="p-5 rounded-2xl bg-white border border-[#E5E7EB] shadow-xs flex flex-col justify-between hover:border-[#1B4D2E] transition-all"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[11px] font-bold text-[#1B4D2E] uppercase">
                      {program.shortCode}
                    </span>
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded border ${
                        isEligible
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : isPotential
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : 'bg-rose-50 text-rose-800 border-rose-200'
                      }`}
                    >
                      {eligibility.statusLabel}
                    </span>
                  </div>

                  <h4 className="font-display font-bold text-base text-[#111827] mb-1">
                    {isTa ? program.nameTa : program.name}
                  </h4>
                  <p className="text-xs text-[#6B7280] line-clamp-2 leading-relaxed mb-3">
                    {isTa ? program.descriptionTa : program.description}
                  </p>

                  {/* Explainable Criteria Match Snippet */}
                  <div className="p-3 rounded-xl bg-[#F8FAF9] border border-[#E0EBE2] text-xs text-[#2C3E30] space-y-1">
                    <div className="font-semibold text-[#14381E] flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{eligibility.primaryReason}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[#E5E7EB] flex items-center justify-between text-xs">
                  <span className="text-[#6B7280]">
                    {isTa ? 'செயல்முறை காலம்' : 'Processing'}: ~{program.processingDaysAvg} days
                  </span>

                  <button
                    onClick={() => {
                      onSelectProgramForPathway(program);
                      onNavigate('navigator');
                    }}
                    className="font-bold text-[#1B4D2E] hover:text-[#143B23] flex items-center gap-1 cursor-pointer"
                  >
                    <span>{isTa ? 'செயல் பாதையைக் காண்க' : 'Open Pathway'}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
