import React, { useState } from 'react';
import {
  Sparkles,
  FileCheck,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Building,
  Coins,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  RotateCcw
} from 'lucide-react';
import { SUPPORT_PROGRAMS } from '../data/mockData';
import { calculateDocumentUnlocks } from '../services/eligibilityEngine';
import { FarmerProfile, Language, SupportProgram } from '../types';

interface DocumentUnlockAdvisoryProps {
  farmer: FarmerProfile;
  language: Language;
  onUpdateFarmerDocs?: (updatedFarmer: FarmerProfile) => void;
  onSelectProgram?: (program: SupportProgram) => void;
}

export const DocumentUnlockAdvisory: React.FC<DocumentUnlockAdvisoryProps> = ({
  farmer,
  language,
  onUpdateFarmerDocs,
  onSelectProgram
}) => {
  const isTa = language === 'ta';
  const [expandedDocId, setExpandedDocId] = useState<string | null>(null);

  const opportunities = calculateDocumentUnlocks(farmer, SUPPORT_PROGRAMS);
  // Focus primarily on documents that actually unlock schemes or are missing
  const unlockableMissing = opportunities.filter(
    (op) => op.currentlyMissing && op.unlockedPrograms.length > 0
  );

  const handleSimulateAddDoc = (docId: string) => {
    if (!onUpdateFarmerDocs) return;
    const existingIdx = farmer.documents.findIndex((d) => d.documentId === docId);
    const updatedDocs = [...farmer.documents];

    if (existingIdx >= 0) {
      updatedDocs[existingIdx] = {
        ...updatedDocs[existingIdx],
        available: true,
        verifiedStatus: 'verified'
      };
    } else {
      updatedDocs.push({
        documentId: docId,
        available: true,
        verifiedStatus: 'verified',
        documentNumber: `DOC-VERIFIED-${Math.floor(1000 + Math.random() * 9000)}`
      });
    }

    onUpdateFarmerDocs({
      ...farmer,
      documents: updatedDocs
    });
  };

  const handleSimulateRemoveDoc = (docId: string) => {
    if (!onUpdateFarmerDocs) return;
    const existingIdx = farmer.documents.findIndex((d) => d.documentId === docId);
    if (existingIdx >= 0) {
      const updatedDocs = [...farmer.documents];
      updatedDocs[existingIdx] = {
        ...updatedDocs[existingIdx],
        available: false,
        verifiedStatus: 'missing'
      };
      onUpdateFarmerDocs({
        ...farmer,
        documents: updatedDocs
      });
    }
  };

  if (unlockableMissing.length === 0) {
    return (
      <div className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-xs text-emerald-950 flex items-start gap-3">
        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
        <div>
          <div className="font-bold text-sm text-emerald-900">
            {isTa ? 'அனைத்து முக்கிய ஆவணங்களும் தயார் நிலையில் உள்ளன!' : 'Full Document Readiness Achieved!'}
          </div>
          <div className="text-emerald-800 mt-1 leading-relaxed">
            {isTa
              ? 'உங்கள் சுயவிவரத்தில் எந்த விடுபட்ட ஆவணமும் இல்லை. அனைத்து தகுதியான திட்டங்களுக்கும் நீங்கள் நேரடியாக விண்ணப்பிக்கலாம்.'
              : 'You do not have pending missing documents blocking your core eligible programs. You can submit directly.'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border-2 border-[#1B4D2E]/20 shadow-sm overflow-hidden space-y-4 p-5 sm:p-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E5E7EB] pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#FEF3C7] text-[#92400E] text-[11px] font-bold mb-1.5 border border-[#FDE68A]">
            <Sparkles className="w-3.5 h-3.5 text-[#D97706]" />
            <span>{isTa ? 'ஆவண வாய்ப்பு பகுப்பாய்வு' : 'Document Multiplier Opportunity'}</span>
          </div>
          <h3 className="font-display font-extrabold text-lg sm:text-xl text-[#111827]">
            {isTa
              ? 'இந்த ஆவணங்களை சேர்த்தால், நீங்கள் பெறக்கூடிய கூடுதல் திட்டங்கள்:'
              : 'If you add these documents, you become eligible for these also:'}
          </h3>
          <p className="text-xs text-[#4B5563] mt-0.5 max-w-2xl leading-relaxed">
            {isTa
              ? 'ஒவ்வொரு விடுபட்ட ஆவணமும் பல அரசு உதவிகளை முடக்கி வைக்கிறது. எந்த ஆவணத்தைப் பெற்றால் எத்தனை திட்டங்கள் திறக்கப்படும் என்பதை கீழே காண்க.'
              : 'Obtaining just one additional paper often unlocks multiple valuable government subsidies and credit facilities simultaneously.'}
          </p>
        </div>

        <div className="text-xs text-[#1B4D2E] font-bold bg-[#EAF5EC] px-3 py-1.5 rounded-xl border border-[#C2E5CA] shrink-0 self-start sm:self-auto">
          {unlockableMissing.length} {isTa ? 'ஆவண வாய்ப்புகள்' : 'Unlocking Papers Available'}
        </div>
      </div>

      {/* List of Unlock Opportunities */}
      <div className="space-y-4 pt-1">
        {unlockableMissing.map((item) => {
          const isExpanded = expandedDocId === item.document.id;
          const totalUnlocked = item.unlockedPrograms.length;

          return (
            <div
              key={item.document.id}
              className="rounded-xl border border-[#E5E7EB] bg-[#FBFBFA] hover:bg-[#F9FAFB] transition-all p-4 space-y-3"
            >
              {/* Document Summary Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300">
                      {isTa ? 'விடுபட்ட ஆவணம்' : 'Missing Paper'}
                    </span>
                    <h4 className="font-display font-bold text-sm sm:text-base text-[#111827]">
                      {isTa ? item.document.nameTa : item.document.name}
                    </h4>
                  </div>
                  <div className="text-xs text-[#6B7280] flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-[#9CA3AF]" />
                    <span>Authority: {item.issuingAuthority}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  {onUpdateFarmerDocs && (
                    <button
                      onClick={() => handleSimulateAddDoc(item.document.id)}
                      className="px-3 py-1.5 text-xs font-bold text-white bg-[#1B4D2E] hover:bg-[#143B23] rounded-lg transition-all shadow-xs flex items-center gap-1 cursor-pointer"
                      title="Simulate obtaining this document to test live eligibility across all schemes"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#86EFAC]" />
                      <span>{isTa ? 'இவ்வாணத்தை பெற்றுவிட்டதாக சோதிக்க' : 'Simulate Adding This Document'}</span>
                    </button>
                  )}

                  <button
                    onClick={() => setExpandedDocId(isExpanded ? null : item.document.id)}
                    className="p-1.5 text-xs text-[#6B7280] hover:text-[#111827] rounded-lg border border-[#D1D5DB] bg-white transition-colors"
                    title="Toggle How to Obtain Guide"
                  >
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* What Unlocks If You Add This Document Banner */}
              <div className="p-3.5 rounded-xl bg-[#F0FDF4] border border-[#BBF7D0] space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-xs text-[#166534] flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
                    <span>
                      {isTa
                        ? `இவ்வாணத்தைச் சேர்த்தால் திறக்கப்படும் ${totalUnlocked} திட்டங்கள்:`
                        : `If you add this document, you unlock these ${totalUnlocked} schemes:`}
                    </span>
                  </div>
                  <span className="text-[11px] font-semibold text-[#15803D]">
                    100% Ready to Apply
                  </span>
                </div>

                {/* Sub-cards of Unlocked Schemes */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-1">
                  {item.unlockedPrograms.map(({ program, benefitsSummary, benefitsSummaryTa, financialEstimate }) => (
                    <div
                      key={program.id}
                      className="p-3 rounded-lg bg-white border border-[#D1FAE5] text-xs space-y-1.5 shadow-2xs hover:border-[#86EFAC] transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#1B4D2E]">{program.shortCode}</span>
                        <span className="text-[10px] text-[#065F46] font-semibold bg-[#ECFDF5] px-1.5 py-0.5 rounded">
                          {financialEstimate || 'Full Subsidy'}
                        </span>
                      </div>
                      <div className="font-semibold text-[#111827] line-clamp-1">
                        {isTa ? program.nameTa : program.name}
                      </div>
                      <p className="text-[11px] text-[#4B5563] line-clamp-2 leading-relaxed">
                        {isTa ? benefitsSummaryTa : benefitsSummary}
                      </p>
                      {onSelectProgram && (
                        <button
                          onClick={() => onSelectProgram(program)}
                          className="text-[11px] font-bold text-[#1B4D2E] hover:underline flex items-center gap-0.5 pt-1"
                        >
                          <span>{isTa ? 'திட்டத்தைப் பார்க்க' : 'View Scheme'}</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Expandable Guide: How to obtain this document locally */}
              {isExpanded && (
                <div className="p-3 rounded-lg bg-amber-50/70 border border-amber-200 text-xs text-amber-950 space-y-1 animate-fadeIn">
                  <div className="font-bold text-[#78350F] flex items-center gap-1">
                    <Building className="w-3.5 h-3.5 text-[#B45309]" />
                    <span>{isTa ? 'கிராமத்தில் இதனைப் பெறுவது எப்படி?' : 'Where & How to Obtain in Your Village:'}</span>
                  </div>
                  <p className="text-[11px] text-amber-900 leading-relaxed pl-5">
                    {isTa ? item.howToObtainTa : item.howToObtain}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
