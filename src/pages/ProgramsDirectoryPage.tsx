import React, { useEffect, useMemo, useState } from 'react';
import { ShieldCheck, Search, ExternalLink, X } from 'lucide-react';
import { SUPPORT_PROGRAMS } from '../data/mockData';
import { checkEligibility } from '../services/eligibilityEngine';
import { getSafeHttpUrl } from '../utils/farmerUtils';
import { EligibilityExplanationCard } from '../components/EligibilityExplanationCard';
import { DocumentUnlockAdvisory } from '../components/DocumentUnlockAdvisory';
import { FarmerProfile, Language, SupportProgram } from '../types';

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

  useEffect(() => {
    if (!inspectedProgram) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setInspectedProgram(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [inspectedProgram]);

  const categories = [
    { id: 'all', label: isTa ? 'அனைத்து திட்டங்கள்' : 'All Schemes' },
    { id: 'irrigation', label: isTa ? 'பாசனம்' : 'Irrigation' },
    { id: 'insurance', label: isTa ? 'பயிர் காப்பீடு' : 'Insurance' },
    { id: 'loan', label: isTa ? 'விவசாயக் கடன்' : 'Loans' },
    { id: 'equipment', label: isTa ? 'இயந்திரங்கள்' : 'Equipment' },
    { id: 'subsidy', label: isTa ? 'அரசு மானியம்' : 'Subsidies' },
    { id: 'seeds_inputs', label: isTa ? 'விதை & உரம்' : 'Seeds & Soil' }
  ];

  const evaluatedEntries = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return SUPPORT_PROGRAMS.filter((p) => {
      const matchesCat = selectedCategory === 'all' || p.category === selectedCategory;
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.nameTa.toLowerCase().includes(q) ||
        p.shortCode.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q);
      return matchesCat && matchesSearch;
    }).map((program) => ({
      program,
      eligibility: checkEligibility(activeFarmer, program)
    }));
  }, [activeFarmer, selectedCategory, searchQuery]);

  const inspectedEligibility = useMemo(
    () => (inspectedProgram ? checkEligibility(activeFarmer, inspectedProgram) : null),
    [activeFarmer, inspectedProgram]
  );

  const safeOfficialUrl = inspectedProgram
    ? getSafeHttpUrl(inspectedProgram.officialInformationUrl)
    : undefined;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#EAF5EC] text-[#1B4D2E] text-xs font-semibold mb-2">
              <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
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
            <span className="font-bold">Advisory Notice: </span>
            Always confirm final scheme deadlines and circular updates with your local Agriculture Office before applying.
          </div>
        </div>

        {/* Search & Filters */}
        <div className="mt-6 pt-6 border-t border-[#E5E7EB] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0" role="group" aria-label={isTa ? 'திட்ட வகைகள்' : 'Program categories'}>
            {categories.map((c) => (
              <button
                type="button"
                key={c.id}
                onClick={() => setSelectedCategory(c.id)}
                aria-pressed={selectedCategory === c.id}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                  selectedCategory === c.id
                    ? 'bg-[#1B4D2E] text-white shadow-xs'
                    : 'bg-[#F3F4F6] text-[#374151] hover:bg-[#E5E7EB]'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-[#6B7280] absolute left-3 top-2.5" aria-hidden="true" />
            <label htmlFor="programs-search-input" className="sr-only">
              {isTa ? 'திட்டங்களை தேடுக' : 'Search agricultural support programs'}
            </label>
            <input
              id="programs-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isTa ? 'திட்டங்களை தேடுக...' : 'Search programs...'}
              className="w-full pl-9 pr-4 py-2 text-xs bg-[#FBFBFA] border border-[#D1D5DB] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1B4D2E]"
            />
          </div>
        </div>
      </div>

      {/* Document Multiplier Opportunities */}
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
          <span className="text-xs text-[#4B5563]">
            {evaluatedEntries.length} {isTa ? 'திட்டங்கள் காட்டப்படுகின்றன' : 'schemes shown'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {evaluatedEntries.map(({ program, eligibility }) => (
            <div
              key={program.id}
              className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-xs flex flex-col justify-between hover:border-[#1B4D2E] transition-all"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[11px] font-bold text-[#1B4D2E] uppercase tracking-wide">
                    {program.shortCode}
                  </span>
                  <span className="text-[10px] text-[#4B5563] bg-[#F3F4F6] px-2 py-0.5 rounded">
                    {program.sponsoringBody}
                  </span>
                </div>

                <h3 className="font-display font-bold text-base text-[#111827] mb-1.5">
                  {isTa ? program.nameTa : program.name}
                </h3>

                <p className="text-xs text-[#4B5563] line-clamp-3 leading-relaxed mb-4">
                  {isTa ? program.descriptionTa : program.description}
                </p>

                <div className="p-3 rounded-xl bg-[#F9FAFB] border border-[#E5E7EB] text-xs text-[#374151] space-y-1.5 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[#4B5563]">Land Range:</span>
                    <span className="font-semibold text-[#111827]">
                      {program.minLandSizeAcres} to {program.maxLandSizeAcres} acres
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#4B5563]">Crops:</span>
                    <span className="font-semibold text-[#111827] truncate max-w-[150px]">
                      {program.eligibleCrops.join(', ')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#4B5563]">Target Categories:</span>
                    <span className="font-semibold text-[#111827]">
                      {program.eligibleCategories.length >= 4 ? 'All Categories' : 'Small & Marginal'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#F8FAF9] border border-[#E0EBE2] text-xs">
                  <span className="text-[#4B5563]">For {activeFarmer.name}:</span>
                  <span
                    className={`font-bold text-[11px] ${
                      eligibility.status === 'eligible'
                        ? 'text-emerald-700'
                        : eligibility.status === 'potentially_eligible'
                        ? 'text-amber-800'
                        : 'text-rose-700'
                    }`}
                  >
                    {isTa ? eligibility.statusLabelTa : eligibility.statusLabel}
                  </span>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-[#E5E7EB] flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={() => setInspectedProgram(program)}
                  className="text-[#4B5563] hover:text-[#111827] font-semibold cursor-pointer"
                >
                  {isTa ? 'விதிகளை காண்க' : 'Inspect Rules'}
                </button>

                <button
                  type="button"
                  onClick={() => onNavigateToNavigatorWithProgram(program)}
                  className="px-3.5 py-1.5 font-bold text-white bg-[#1B4D2E] hover:bg-[#143B23] rounded-lg transition-colors cursor-pointer shadow-xs"
                >
                  {isTa ? 'செயல் பாதை →' : 'Get Pathway →'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Rules Inspection Modal */}
      {inspectedProgram && inspectedEligibility && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          aria-labelledby="rules-modal-title"
        >
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-[#E5E7EB] p-6 space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-bold text-[#1B4D2E] uppercase">
                  {inspectedProgram.shortCode} Rules Specification
                </span>
                <h3 id="rules-modal-title" className="font-display font-extrabold text-xl text-[#111827]">
                  {isTa ? inspectedProgram.nameTa : inspectedProgram.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setInspectedProgram(null)}
                aria-label={isTa ? 'விதிகள் சாளரத்தை மூடுக' : 'Close rules specification'}
                className="p-1.5 rounded-lg text-[#4B5563] hover:bg-[#F3F4F6] cursor-pointer"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>

            <EligibilityExplanationCard
              eligibility={inspectedEligibility}
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
              {safeOfficialUrl ? (
                <a
                  href={safeOfficialUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-[#1B4D2E] hover:underline flex items-center gap-1 font-semibold"
                >
                  <span>Official Scheme Documentation</span>
                  <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                </a>
              ) : (
                <span />
              )}

              <button
                type="button"
                onClick={() => {
                  const p = inspectedProgram;
                  setInspectedProgram(null);
                  onNavigateToNavigatorWithProgram(p);
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-[#1B4D2E] hover:bg-[#143B23] rounded-lg transition-colors cursor-pointer"
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
