import React, { useState } from 'react';
import {
  ShieldCheck,
  Search,
  Filter,
  ExternalLink,
  ChevronDown,
  CheckCircle2,
  AlertTriangle,
  Info,
  Droplets,
  Coins,
  Wrench,
  Wheat,
  Shield,
  Sprout
} from 'lucide-react';
import { SUPPORT_PROGRAMS, SYSTEM_DOCUMENTS } from '../data/mockData';
import { checkEligibility } from '../services/eligibilityEngine';
import { EligibilityExplanationCard } from '../components/EligibilityExplanationCard';
import { DocumentUnlockAdvisory } from '../components/DocumentUnlockAdvisory';
import { FarmerProfile, Language, NeedCategory, SupportProgram } from '../types';

interface ProgramsDirectoryPageProps {
  activeFarmer: FarmerProfile;
  language: Language;
  onNavigateToNavigatorWithProgram: (program: SupportProgram) => void;
  onUpdateFarmerDocs?: (updated: FarmerProfile) => void;
}

export const ProgramsDirectoryPage: React.FC<ProgramsDirectoryPageProps> = ({
  activeFarmer,
  language,
  onNavigateToNavigatorWithProgram,
  onUpdateFarmerDocs
}) => {
  const isTa = language === 'ta';

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [inspectedProgram, setInspectedProgram] = useState<SupportProgram | null>(null);

  const categories = [
    { id: 'all', label: isTa ? 'அனைத்து திட்டங்கள்' : 'All Schemes' },
    { id: 'irrigation', label: isTa ? 'பாசனம்' : 'Irrigation' },
    { id: 'insurance', label: isTa ? 'பயிர் காப்பீடு' : 'Insurance' },
    { id: 'loan', label: isTa ? 'விவசாயக் கடன்' : 'Loans' },
    { id: 'equipment', label: isTa ? 'இயந்திரங்கள்' : 'Equipment' },
    { id: 'subsidy', label: isTa ? 'அரசு மானியம்' : 'Subsidies' },
    { id: 'seeds_inputs', label: isTa ? 'விதை & உரம்' : 'Seeds & Soil' }
  ];

  const filteredPrograms = SUPPORT_PROGRAMS.filter((p) => {
    const matchesCat = selectedCategory === 'all' || p.category === selectedCategory;
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.shortCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#EAF5EC] text-[#1B4D2E] text-xs font-semibold mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{isTa ? 'அரசு உதவித் திட்டங்களின் தொகுப்பு' : 'Support Programs Database'}</span>
            </div>
            <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-[#111827]">
              {isTa ? 'அங்கீகரிக்கப்பட்ட விவசாய உதவித் திட்டங்கள்' : 'Government Agricultural Support Directory'}
            </h1>
            <p className="text-xs sm:text-sm text-[#4B5563] mt-1 max-w-2xl leading-relaxed">
              {isTa
                ? 'பிரதம மந்திரி மற்றும் தமிழக அரசின் முக்கிய 10 உதவித் திட்டங்கள். ஒவ்வொரு திட்டத்திற்கும் உங்கள் சுயவிவரத்திற்கான தகுதியை உடனடியாக மதிப்பிடலாம்.'
                : '10 realistic sample support programs covering irrigation, insurance, credit, machinery, and seed subsidies with deterministic rule definitions.'}
            </p>
          </div>

          <div className="text-xs text-[#92400E] bg-amber-50 p-3 rounded-xl border border-amber-200 max-w-xs shrink-0">
            <span className="font-bold">Prototype Notice: </span>
            This mock database models active schemes for demonstration purposes. Official circulars should be consulted for statutory guidelines.
          </div>
        </div>

        {/* Search & Filters */}
        <div className="mt-6 pt-6 border-t border-[#E5E7EB] flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCategory(c.id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                  selectedCategory === c.id
                    ? 'bg-[#1B4D2E] text-white shadow-xs'
                    : 'bg-[#F3F4F6] text-[#4B5563] hover:bg-[#E5E7EB]'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-[#9CA3AF] absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isTa ? 'திட்டங்களை தேடுக...' : 'Search programs...'}
              className="w-full pl-9 pr-4 py-2 text-xs bg-[#FBFBFA] border border-[#D1D5DB] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1B4D2E]"
            />
          </div>
        </div>
      </div>

      {/* Document Multiplier Opportunities: If you add these documents, you become eligible for these also */}
      <DocumentUnlockAdvisory
        farmer={activeFarmer}
        language={language}
        onUpdateFarmerDocs={onUpdateFarmerDocs}
        onSelectProgram={onNavigateToNavigatorWithProgram}
      />

      {/* Program Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display font-bold text-lg text-[#111827]">
            {isTa ? 'அனைத்து அரசு திட்டங்களின் விவரங்கள்' : 'All Cataloged Government Schemes'}
          </h2>
          <span className="text-xs text-[#6B7280]">
            {filteredPrograms.length} {isTa ? 'திட்டங்கள் காட்டப்படுகின்றன' : 'schemes shown'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredPrograms.map((program) => {
          const el = checkEligibility(activeFarmer, program);

          return (
            <div
              key={program.id}
              className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-xs flex flex-col justify-between hover:border-[#1B4D2E] transition-all"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[11px] font-bold text-[#1B4D2E] uppercase tracking-wide">
                    {program.shortCode}
                  </span>
                  <span className="text-[10px] text-[#6B7280] bg-[#F3F4F6] px-2 py-0.5 rounded">
                    {program.sponsoringBody}
                  </span>
                </div>

                <h3 className="font-display font-bold text-base text-[#111827] mb-1.5">
                  {isTa ? program.nameTa : program.name}
                </h3>

                <p className="text-xs text-[#4B5563] line-clamp-3 leading-relaxed mb-4">
                  {isTa ? program.descriptionTa : program.description}
                </p>

                {/* Key Eligibility Rules Summary */}
                <div className="p-3 rounded-xl bg-[#F9FAFB] border border-[#E5E7EB] text-xs text-[#374151] space-y-1.5 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[#6B7280]">Land Range:</span>
                    <span className="font-semibold text-[#111827]">
                      {program.minLandSizeAcres} to {program.maxLandSizeAcres} acres
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#6B7280]">Crops:</span>
                    <span className="font-semibold text-[#111827] truncate max-w-[150px]">
                      {program.eligibleCrops.join(', ')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#6B7280]">Target Categories:</span>
                    <span className="font-semibold text-[#111827]">
                      {program.eligibleCategories.length >= 4 ? 'All Categories' : 'Small & Marginal'}
                    </span>
                  </div>
                </div>

                {/* Quick Status for Active Farmer */}
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#F8FAF9] border border-[#E0EBE2] text-xs">
                  <span className="text-[#6B7280]">For {activeFarmer.name}:</span>
                  <span
                    className={`font-bold text-[11px] ${
                      el.status === 'eligible'
                        ? 'text-emerald-700'
                        : el.status === 'potentially_eligible'
                        ? 'text-amber-800'
                        : 'text-rose-700'
                    }`}
                  >
                    {el.statusLabel}
                  </span>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="mt-5 pt-3 border-t border-[#E5E7EB] flex items-center justify-between text-xs">
                <button
                  onClick={() => setInspectedProgram(program)}
                  className="text-[#4B5563] hover:text-[#111827] font-semibold cursor-pointer"
                >
                  {isTa ? 'விதிகளை காண்க' : 'Inspect Rules'}
                </button>

                <button
                  onClick={() => onNavigateToNavigatorWithProgram(program)}
                  className="px-3.5 py-1.5 font-bold text-white bg-[#1B4D2E] hover:bg-[#143B23] rounded-lg transition-colors cursor-pointer shadow-xs"
                >
                  {isTa ? 'செயல் பாதை →' : 'Get Pathway →'}
                </button>
              </div>
            </div>
          );
        })}
        </div>
      </div>

      {/* Rules Inspection Modal */}
      {inspectedProgram && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-[#E5E7EB] p-6 space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-bold text-[#1B4D2E] uppercase">
                  {inspectedProgram.shortCode} Rules Specification
                </span>
                <h3 className="font-display font-extrabold text-xl text-[#111827]">
                  {inspectedProgram.name}
                </h3>
              </div>
              <button
                onClick={() => setInspectedProgram(null)}
                className="p-1 rounded-lg text-[#6B7280] hover:bg-[#F3F4F6]"
              >
                ✕
              </button>
            </div>

            {/* Explanation Card */}
            <EligibilityExplanationCard
              eligibility={checkEligibility(activeFarmer, inspectedProgram)}
              program={inspectedProgram}
              language={language}
              farmer={activeFarmer}
              onSelectAlternativeProgram={(progId) => {
                const found = SUPPORT_PROGRAMS.find((p) => p.id === progId);
                if (found) {
                  setInspectedProgram(null);
                  onNavigateToNavigatorWithProgram(found);
                }
              }}
              showPathwayButton={false}
            />

            <div className="pt-4 border-t border-[#E5E7EB] flex items-center justify-between">
              <a
                href={inspectedProgram.officialInformationUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-[#1B4D2E] hover:underline flex items-center gap-1 font-semibold"
              >
                <span>Official Scheme Documentation</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <button
                onClick={() => {
                  const p = inspectedProgram;
                  setInspectedProgram(null);
                  onNavigateToNavigatorWithProgram(p);
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-[#1B4D2E] hover:bg-[#143B23] rounded-lg transition-colors"
              >
                Generate Pathway for this Program
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
