import React, { useState } from 'react';
import {
  Users,
  Search,
  CheckCircle2,
  AlertTriangle,
  Printer,
  FileText,
  UserPlus,
  ArrowRight,
  ShieldCheck,
  Building,
  MapPin,
  Clock,
  Sparkles
} from 'lucide-react';
import { DEMO_FARMERS, SUPPORT_PROGRAMS } from '../data/mockData';
import { checkEligibility } from '../services/eligibilityEngine';
import { generatePersonalizedPathway } from '../services/pathwayEngine';
import { FarmerProfile, Language, SupportProgram } from '../types';

interface AssistedModePageProps {
  language: Language;
  onOpenCreateModal?: () => void;
}

export const AssistedModePage: React.FC<AssistedModePageProps> = ({ language, onOpenCreateModal }) => {
  const isTa = language === 'ta';

  // State
  const [farmersList, setFarmersList] = useState<FarmerProfile[]>(DEMO_FARMERS);
  const [selectedFarmerId, setSelectedFarmerId] = useState<string>(DEMO_FARMERS[0].id);
  const [selectedProgramId, setSelectedProgramId] = useState<string>(SUPPORT_PROGRAMS[0].id);
  const [searchQuery, setSearchQuery] = useState('');
  const [isGeneratingDocket, setIsGeneratingDocket] = useState(false);
  const [generatedDocket, setGeneratedDocket] = useState<any | null>(null);

  // Operator metadata
  const operatorDetails = {
    centreName: 'Common Service Centre #TN-THJ-402',
    operatorName: 'V. Sundaresan (VLE Certification #8819)',
    block: 'Thiruvidaimarudur Block, Thanjavur District'
  };

  const currentFarmer = farmersList.find((f) => f.id === selectedFarmerId) || farmersList[0];
  const currentProgram = SUPPORT_PROGRAMS.find((p) => p.id === selectedProgramId) || SUPPORT_PROGRAMS[0];

  const eligibility = checkEligibility(currentFarmer, currentProgram);

  const handleGenerateDocket = () => {
    setIsGeneratingDocket(true);
    setTimeout(() => {
      const pathway = generatePersonalizedPathway(currentFarmer, currentProgram, eligibility);
      setGeneratedDocket({
        docketId: `VLM-CSC-${Date.now().toString().slice(-6)}`,
        farmer: currentFarmer,
        program: currentProgram,
        eligibility,
        pathway,
        operator: operatorDetails,
        issuedAt: new Date().toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      });
      setIsGeneratingDocket(false);
    }, 400);
  };

  // Filtered farmers
  const filteredFarmers = farmersList.filter((f) =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.village.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-white rounded-2xl border border-[#E5E7EB] shadow-xs">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#EAF5EC] text-[#1B4D2E] text-xs font-semibold mb-2">
            <Users className="w-3.5 h-3.5" />
            <span>{isTa ? 'இ-சேவை & FPO களப்பணியாளர் தளம்' : 'CSC / VLE / FPO Operator Portal'}</span>
          </div>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-[#111827]">
            {isTa ? 'உதவி மையப் பயன்முறை (Assisted Mode)' : 'Assisted Mode for Field Extension Workers'}
          </h1>
          <p className="text-xs sm:text-sm text-[#4B5563] mt-1 max-w-2xl leading-relaxed">
            {isTa
              ? 'கைபேசி அல்லது கணினி இல்லாத விவசாயிகளுக்கு, இ-சேவை மைய பணியாளர்கள் அல்லது கிராம வேளாண் அலுவலர்கள் மூலம் உடனடி தகுதி ஆய்வு செய்து அச்சிடப்பட்ட ஆவணத்தை வழங்கும் முறை.'
              : 'Community workers, CSC Village Level Entrepreneurs (VLEs), and FPO managers can conduct instant eligibility audits and issue official printable Action Dockets for farmers.'}
          </p>
        </div>

        {/* Operator Badge */}
        <div className="p-3.5 rounded-xl bg-[#F8FAF9] border border-[#D7E3D9] text-xs text-[#2C3E30] shrink-0">
          <div className="font-bold text-[#14381E] flex items-center gap-1.5">
            <Building className="w-3.5 h-3.5 text-[#1B4D2E]" />
            <span>{operatorDetails.centreName}</span>
          </div>
          <div className="text-[11px] text-[#4B5563] mt-0.5">{operatorDetails.operatorName}</div>
          <div className="text-[11px] text-[#6B7280]">{operatorDetails.block}</div>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Col: Farmer Intake & Selection */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-xs space-y-4">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-display font-bold text-base text-[#111827]">
                {isTa ? 'விவசாயி தேர்வு & தேடல்' : 'Farmer Queue & Registry'}
              </h3>
              {onOpenCreateModal && (
                <button
                  type="button"
                  onClick={onOpenCreateModal}
                  className="px-2.5 py-1 text-[11px] font-bold text-[#1B4D2E] bg-[#EAF5EC] hover:bg-[#D7EEDD] border border-[#C2E5CA] rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                >
                  <UserPlus className="w-3 h-3" />
                  <span>{isTa ? '+ புதிய பதிவு' : '+ Register Walk-In'}</span>
                </button>
              )}
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-[#9CA3AF] absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isTa ? 'பெயர் அல்லது ஊர் கொண்டு தேடுக...' : 'Search by name, village, or district...'}
                className="w-full pl-9 pr-4 py-2 text-xs bg-[#FBFBFA] border border-[#D1D5DB] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1B4D2E]"
              />
            </div>

            {/* Farmer Selection Radio Cards */}
            <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
              {filteredFarmers.map((f) => {
                const isSelected = f.id === selectedFarmerId;
                const verifiedDocs = f.documents.filter((d) => d.available && d.verifiedStatus === 'verified').length;

                return (
                  <div
                    key={f.id}
                    onClick={() => {
                      setSelectedFarmerId(f.id);
                      setGeneratedDocket(null);
                    }}
                    className={`p-3 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#1B4D2E] bg-[#F4F9F5] ring-1 ring-[#1B4D2E]'
                        : 'border-[#E5E7EB] bg-white hover:bg-[#FAFAFA]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-xs text-[#111827]">{f.name}</div>
                      <span className="text-[11px] font-semibold text-[#1B4D2E] bg-[#EAF5EC] px-2 py-0.5 rounded">
                        {f.category.split(' ')[0]}
                      </span>
                    </div>
                    <div className="text-[11px] text-[#6B7280] mt-1 flex items-center justify-between">
                      <span>{f.village}, {f.district}</span>
                      <span>{f.crop} · {f.landSizeAcres} ac</span>
                    </div>
                    <div className="mt-2 pt-1.5 border-t border-[#E5E7EB]/60 text-[10px] text-[#4B5563] flex items-center justify-between">
                      <span>Docs on hand: {verifiedDocs}/{f.documents.length}</span>
                      <span className="font-medium text-[#1B4D2E]">{isSelected ? 'Active →' : 'Select'}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Scheme Selector */}
          <div className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-xs space-y-3">
            <h3 className="font-display font-bold text-base text-[#111827]">
              {isTa ? 'ஆய்வு செய்ய வேண்டிய திட்டம்' : 'Target Support Program'}
            </h3>
            <select
              value={selectedProgramId}
              onChange={(e) => {
                setSelectedProgramId(e.target.value);
                setGeneratedDocket(null);
              }}
              className="w-full p-2.5 bg-[#FBFBFA] border border-[#D1D5DB] rounded-lg text-xs font-semibold text-[#111827]"
            >
              {SUPPORT_PROGRAMS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.shortCode} - {p.name}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-[#6B7280]">
              Select scheme to evaluate eligibility rules and document completeness for {currentFarmer.name}.
            </p>
          </div>
        </div>

        {/* Right Col: Instant Eligibility Audit & Printable Assistance Docket */}
        <div className="lg:col-span-7 space-y-6">
          {/* Quick Audit Snapshot Card */}
          <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-xs space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] uppercase tracking-wider font-bold text-[#6B7280]">
                  Immediate Eligibility Audit
                </span>
                <h3 className="font-display font-bold text-lg text-[#111827]">
                  {currentFarmer.name} ➔ {currentProgram.shortCode}
                </h3>
              </div>

              <span
                className={`text-xs font-bold px-3 py-1 rounded-full border ${
                  eligibility.status === 'eligible'
                    ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                    : eligibility.status === 'potentially_eligible'
                    ? 'bg-amber-100 text-amber-900 border-amber-300'
                    : 'bg-rose-100 text-rose-900 border-rose-300'
                }`}
              >
                {eligibility.statusLabel}
              </span>
            </div>

            {/* Audit Checklist Matrix */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-[#F9FAFB] border border-[#E5E7EB]">
                <div className="text-[#6B7280] font-medium">Jurisdiction & Location</div>
                <div className="font-semibold text-[#111827] mt-0.5">
                  ✓ {currentFarmer.district} (Notified Zone)
                </div>
              </div>

              <div className="p-3 rounded-lg bg-[#F9FAFB] border border-[#E5E7EB]">
                <div className="text-[#6B7280] font-medium">Crop & Landholding</div>
                <div className="font-semibold text-[#111827] mt-0.5">
                  ✓ {currentFarmer.crop} ({currentFarmer.landSizeAcres} acres)
                </div>
              </div>

              <div className="p-3 rounded-lg bg-[#F9FAFB] border border-[#E5E7EB]">
                <div className="text-[#6B7280] font-medium">Farmer Classification</div>
                <div className="font-semibold text-[#111827] mt-0.5">
                  ✓ {currentFarmer.category}
                </div>
              </div>

              <div className="p-3 rounded-lg bg-[#F9FAFB] border border-[#E5E7EB]">
                <div className="text-[#6B7280] font-medium">Document Dossier Status</div>
                <div className="font-semibold text-[#111827] mt-0.5">
                  {eligibility.missingDocuments.length === 0 ? (
                    <span className="text-emerald-700">✓ All {eligibility.readyDocuments.length} Docs Ready</span>
                  ) : (
                    <span className="text-amber-800">⚠ {eligibility.missingDocuments.length} Missing ({eligibility.missingDocuments[0]?.name})</span>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex items-center justify-between">
              <div className="text-xs text-[#6B7280]">
                Operator can generate and hand over a physical action docket to the farmer.
              </div>

              <button
                onClick={handleGenerateDocket}
                disabled={isGeneratingDocket}
                className="px-5 py-2.5 text-xs font-bold text-white bg-[#1B4D2E] hover:bg-[#143B23] rounded-lg transition-all flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <FileText className="w-4 h-4" />
                <span>{isGeneratingDocket ? 'Preparing...' : 'Generate Official Docket'}</span>
              </button>
            </div>
          </div>

          {/* Generated Official Assistance Docket (Printable) */}
          {generatedDocket && (
            <div className="bg-white rounded-2xl border-2 border-[#1B4D2E] shadow-lg overflow-hidden print-card">
              {/* Docket Top Banner */}
              <div className="p-5 bg-[#1B4D2E] text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="text-[11px] uppercase tracking-wider text-[#A7F3D0] font-bold">
                    Official Farmer Assistance Docket
                  </div>
                  <div className="font-display font-extrabold text-xl text-white">
                    Token: {generatedDocket.docketId}
                  </div>
                  <div className="text-xs text-[#D1FAE5] mt-0.5">
                    Issued at: {generatedDocket.issuedAt} · {generatedDocket.operator.centreName}
                  </div>
                </div>

                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 text-xs font-bold text-[#14381E] bg-[#86EFAC] hover:bg-[#6EE7B7] rounded-lg transition-all flex items-center gap-1.5 self-start sm:self-auto cursor-pointer no-print shadow-xs"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Physical Handout</span>
                </button>
              </div>

              {/* Docket Body */}
              <div className="p-6 space-y-6 text-xs text-[#1F2937]">
                {/* Farmer Details Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-[#F9FAFB] border border-[#E5E7EB]">
                  <div>
                    <span className="text-[#6B7280] block text-[11px]">Farmer Name</span>
                    <span className="font-bold text-[#111827] text-sm">{generatedDocket.farmer.name}</span>
                  </div>
                  <div>
                    <span className="text-[#6B7280] block text-[11px]">Village & District</span>
                    <span className="font-semibold text-[#111827]">{generatedDocket.farmer.village}, {generatedDocket.farmer.district}</span>
                  </div>
                  <div>
                    <span className="text-[#6B7280] block text-[11px]">Crop & Land Area</span>
                    <span className="font-semibold text-[#111827]">{generatedDocket.farmer.crop} ({generatedDocket.farmer.landSizeAcres} ac)</span>
                  </div>
                  <div>
                    <span className="text-[#6B7280] block text-[11px]">Category</span>
                    <span className="font-semibold text-[#111827]">{generatedDocket.farmer.category}</span>
                  </div>
                </div>

                {/* Scheme & Assessment */}
                <div>
                  <h4 className="font-bold uppercase tracking-wider text-[#111827] text-xs mb-2">
                    Evaluated Program & Findings
                  </h4>
                  <div className="p-4 rounded-xl border border-[#E5E7EB] space-y-2">
                    <div className="font-bold text-sm text-[#1B4D2E]">
                      {generatedDocket.program.name} ({generatedDocket.program.shortCode})
                    </div>
                    <p className="text-[#4B5563] leading-relaxed">
                      {generatedDocket.eligibility.primaryReason}
                    </p>
                    <div className="pt-2 border-t border-[#E5E7EB] text-[#111827] font-semibold">
                      Action Required: {generatedDocket.eligibility.recommendedAction}
                    </div>
                  </div>
                </div>

                {/* Next Steps Checklist for Farmer */}
                <div>
                  <h4 className="font-bold uppercase tracking-wider text-[#111827] text-xs mb-2">
                    Next Action Checklist (Handout for Farmer)
                  </h4>
                  <div className="space-y-2">
                    {generatedDocket.pathway.steps.map((s: any) => (
                      <div
                        key={s.stepNumber}
                        className="p-3 rounded-lg border border-[#E5E7EB] flex items-start gap-3"
                      >
                        <span className="w-5 h-5 rounded-full bg-[#1B4D2E]/10 text-[#1B4D2E] font-bold flex items-center justify-center shrink-0">
                          {s.stepNumber}
                        </span>
                        <div>
                          <div className="font-semibold text-[#111827]">{s.title}</div>
                          <div className="text-[#6B7280] mt-0.5">{s.description}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Seal & Signature lines */}
                <div className="pt-8 border-t border-[#E5E7EB] grid grid-cols-2 gap-8 text-[11px] text-[#6B7280]">
                  <div>
                    <div className="border-b border-[#9CA3AF] w-40 mb-1" />
                    <div>Signature of VLE Operator / Seal</div>
                    <div>{generatedDocket.operator.centreName}</div>
                  </div>
                  <div className="text-right">
                    <div className="border-b border-[#9CA3AF] w-40 ml-auto mb-1" />
                    <div>Farmer Acknowledgment / Thumb Impression</div>
                    <div>{generatedDocket.farmer.name}</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
