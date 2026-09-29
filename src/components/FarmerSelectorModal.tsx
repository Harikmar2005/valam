import React from 'react';
import { X, CheckCircle, AlertTriangle, UserCheck, MapPin, UserPlus, Sparkles } from 'lucide-react';
import { DEMO_FARMERS } from '../data/mockData';
import { FarmerProfile, Language } from '../types';

interface FarmerSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeFarmer: FarmerProfile;
  onSelectFarmer: (farmer: FarmerProfile) => void;
  onOpenCreateModal: () => void;
  language: Language;
}

export const FarmerSelectorModal: React.FC<FarmerSelectorModalProps> = ({
  isOpen,
  onClose,
  activeFarmer,
  onSelectFarmer,
  onOpenCreateModal,
  language
}) => {
  if (!isOpen) return null;
  const isTa = language === 'ta';

  const scenarioDescriptions = [
    {
      id: 'FARMER_001_RAVI',
      scenarioLabel: 'Scenario A: Potentially Eligible + Missing Bank Doc',
      scenarioLabelTa: 'சூழ்நிலை 1: தகுதி உள்ளது + வங்கி புத்தகம் விடுபட்டுள்ளது',
      outcomeBadge: 'Potentially Eligible',
      badgeColor: 'bg-amber-100 text-amber-900 border-amber-300'
    },
    {
      id: 'FARMER_002_MEENAKSHI',
      scenarioLabel: 'Scenario B: Fully Eligible + All Documents Ready',
      scenarioLabelTa: 'சூழ்நிலை 2: முழு தகுதி + அனைத்து ஆவணங்களும் தயார்',
      outcomeBadge: '100% Ready to Apply',
      badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-300'
    },
    {
      id: 'FARMER_003_ANAND',
      scenarioLabel: 'Scenario C: Land Size Exceeded (>10 acres)',
      scenarioLabelTa: 'சூழ்நிலை 3: நில அளவு வரம்பு தாண்டியது (>10 ஏக்கர்)',
      outcomeBadge: 'Land Size Cap Exceeded',
      badgeColor: 'bg-rose-100 text-rose-900 border-rose-300'
    },
    {
      id: 'FARMER_004_SELVARAJ',
      scenarioLabel: 'Scenario D: Missing Farmer ID & Adangal',
      scenarioLabelTa: 'சூழ்நிலை 4: உழவர் அட்டை & அடங்கல் தேவை',
      outcomeBadge: 'Multiple Docs Missing',
      badgeColor: 'bg-slate-100 text-slate-800 border-slate-300'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-[#E5E7EB]">
        {/* Header */}
        <div className="p-5 border-b border-[#E5E7EB] flex items-center justify-between">
          <div>
            <h3 className="font-display font-bold text-lg text-[#111827]">
              {isTa ? 'விவசாயி மாதிரி சுயவிவரத்தை தேர்வு செய்க' : 'Select Demo Farmer Scenario'}
            </h3>
            <p className="text-xs text-[#6B7280]">
              {isTa
                ? 'வெவ்வேறு தகுதி நிலைகள் மற்றும் விடுபட்ட ஆவணங்களை பரிசோதிக்க மாதிரி சுயவிவரத்தை தேர்வு செய்யவும்.'
                : 'Test different eligibility outcomes, missing documents, and pathways by switching scenarios.'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#6B7280] hover:bg-[#F3F4F6] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Register New Custom Farmer ID Action */}
        <div className="px-5 pt-4">
          <button
            onClick={() => {
              onClose();
              onOpenCreateModal();
            }}
            className="w-full p-3 rounded-xl bg-[#EAF5EC] hover:bg-[#D7EEDD] border border-[#A7F3D0] text-[#14381E] flex items-center justify-between transition-colors cursor-pointer group"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#1B4D2E] text-white flex items-center justify-center font-bold">
                <UserPlus className="w-4 h-4 text-[#86EFAC]" />
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-[#111827] group-hover:text-[#1B4D2E]">
                  {isTa ? '+ புதிய விவசாயி ஐடி பதிவு செய்க' : '+ Create New Farmer User ID'}
                </div>
                <div className="text-[11px] text-[#4B5563]">
                  {isTa ? 'தனிப்பயன் பயனர் ஐடி, நிலம் & ஆவணங்களுடன் பதிவு' : 'Register your own profile with a custom ID & documents'}
                </div>
              </div>
            </div>
            <span className="text-xs font-bold text-[#1B4D2E] group-hover:translate-x-0.5 transition-transform">
              {isTa ? 'தொடங்குக →' : 'Register →'}
            </span>
          </button>
        </div>

        {/* Scenarios List */}
        <div className="p-5 space-y-3">
          {DEMO_FARMERS.map((farmer) => {
            const isSelected = activeFarmer.id === farmer.id;
            const meta = scenarioDescriptions.find((s) => s.id === farmer.id);
            const verifiedDocs = farmer.documents.filter((d) => d.available && d.verifiedStatus === 'verified').length;
            const totalDocs = farmer.documents.length;

            return (
              <div
                key={farmer.id}
                onClick={() => {
                  onSelectFarmer(farmer);
                  onClose();
                }}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'border-[#1B4D2E] bg-[#F4F9F5] ring-2 ring-[#1B4D2E]/20'
                    : 'border-[#E5E7EB] hover:border-[#9CA3AF] hover:bg-[#FBFBFA]'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-full bg-[#1B4D2E]/10 text-[#1B4D2E] flex items-center justify-center font-bold text-sm">
                      {farmer.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-sm text-[#111827]">{farmer.name}</h4>
                        {isSelected && (
                          <span className="text-[11px] font-medium text-[#1B4D2E] flex items-center gap-0.5">
                            <CheckCircle className="w-3.5 h-3.5 text-[#1B4D2E]" />
                            {isTa ? 'செயலில் உள்ளது' : 'Active'}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-[#6B7280]">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {farmer.district}, {farmer.state}
                        </span>
                        <span>·</span>
                        <span>{farmer.crop}</span>
                        <span>·</span>
                        <span className="font-medium text-[#111827]">{farmer.landSizeAcres} acres</span>
                      </div>
                    </div>
                  </div>

                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded border ${meta?.badgeColor}`}>
                    {isTa ? meta?.scenarioLabelTa.split(':')[0] : meta?.outcomeBadge}
                  </span>
                </div>

                <div className="mt-2 pt-2 border-t border-[#E5E7EB]/60 flex items-center justify-between text-xs text-[#4B5563]">
                  <span className="text-[#374151] font-medium">
                    {isTa ? meta?.scenarioLabelTa : meta?.scenarioLabel}
                  </span>
                  <span className="text-[11px] text-[#6B7280]">
                    {verifiedDocs}/{totalDocs} {isTa ? 'ஆவணங்கள் தயார்' : 'docs ready'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#F9FAFB] border-t border-[#E5E7EB] flex items-center justify-between text-xs text-[#6B7280]">
          <span>Tip: Ravi Kumar showcases missing bank document detection.</span>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-[#111827] bg-white border border-[#D1D5DB] rounded-lg hover:bg-[#F3F4F6] transition-colors"
          >
            {isTa ? 'மூடுக' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
