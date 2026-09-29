import React, { useState } from 'react';
import {
  User,
  MapPin,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Save,
  RotateCcw,
  Sparkles,
  HelpCircle,
  Building,
  UserPlus
} from 'lucide-react';
import { SYSTEM_DOCUMENTS, SUPPORT_PROGRAMS } from '../data/mockData';
import { calculateDocumentUnlocks } from '../services/eligibilityEngine';
import { FarmerProfile, Language } from '../types';

interface ProfilePageProps {
  activeFarmer: FarmerProfile;
  language: Language;
  onSaveFarmer: (updated: FarmerProfile) => void;
  onOpenCreateModal?: () => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({
  activeFarmer,
  language,
  onSaveFarmer,
  onOpenCreateModal
}) => {
  const isTa = language === 'ta';

  // Form State
  const [formData, setFormData] = useState<FarmerProfile>({ ...activeFarmer });
  const [isSavedAlert, setIsSavedAlert] = useState(false);

  // Sync if activeFarmer changes externally
  React.useEffect(() => {
    setFormData({ ...activeFarmer });
  }, [activeFarmer]);

  // Calculate completeness
  const totalFields = 8;
  let filledFields = 0;
  if (formData.name) filledFields++;
  if (formData.state) filledFields++;
  if (formData.district) filledFields++;
  if (formData.village) filledFields++;
  if (formData.landSizeAcres > 0) filledFields++;
  if (formData.crop) filledFields++;
  if (formData.category) filledFields++;
  if (formData.hasBankAccount) filledFields++;
  const completeness = Math.round((filledFields / totalFields) * 100);

  // Document toggling
  const handleToggleDocument = (docId: string) => {
    const existingIdx = formData.documents.findIndex((d) => d.documentId === docId);
    const updatedDocs = [...formData.documents];

    if (existingIdx >= 0) {
      const current = updatedDocs[existingIdx];
      const newAvail = !current.available;
      updatedDocs[existingIdx] = {
        ...current,
        available: newAvail,
        verifiedStatus: newAvail ? 'verified' : 'missing'
      };
    } else {
      updatedDocs.push({
        documentId: docId,
        available: true,
        verifiedStatus: 'verified'
      });
    }

    setFormData({ ...formData, documents: updatedDocs });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveFarmer(formData);
    setIsSavedAlert(true);
    setTimeout(() => setIsSavedAlert(false), 2500);
  };

  const unlockOpportunities = calculateDocumentUnlocks(formData, SUPPORT_PROGRAMS);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#EAF5EC] text-[#1B4D2E] text-xs font-semibold mb-2">
              <User className="w-3.5 h-3.5" />
              <span>{isTa ? 'விவசாயி சுயவிவர மேலாண்மை' : 'Farmer Profile Dossier'}</span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-[#111827]">
                {formData.name}
              </h1>
              <span className="font-mono text-xs font-bold text-[#1B4D2E] bg-[#EAF5EC] px-2.5 py-1 rounded-md border border-[#C2E5CA]">
                ID: {formData.id}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#4B5563] mt-1">
              {isTa
                ? 'உங்கள் நிலம், பயிர் மற்றும் ஆவண நிலையை சரிபார்த்து புதுப்பிக்கவும்.'
                : 'Manage landholdings, crop records, and available documents to ensure accurate eligibility calculations.'}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {onOpenCreateModal && (
              <button
                type="button"
                onClick={onOpenCreateModal}
                className="px-3.5 py-2.5 text-xs font-bold text-[#1B4D2E] bg-[#EAF5EC] hover:bg-[#D7EEDD] border border-[#C2E5CA] rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
              >
                <UserPlus className="w-4 h-4" />
                <span>{isTa ? '+ புதிய ஐடி பதிவு' : '+ Register New User ID'}</span>
              </button>
            )}

            {/* Profile Completeness Pill */}
            <div className="p-4 rounded-xl bg-[#F8FAF9] border border-[#D7E3D9] text-xs min-w-[200px]">
            <div className="flex items-center justify-between font-semibold text-[#14381E] mb-1">
              <span>{isTa ? 'சுயவிவர முழுமை' : 'Profile Completeness'}</span>
              <span className="font-mono text-sm">{completeness}%</span>
            </div>
            <div className="w-full bg-[#E5E7EB] h-2 rounded-full overflow-hidden">
              <div
                className="bg-[#1B4D2E] h-full rounded-full transition-all duration-300"
                style={{ width: `${completeness}%` }}
              />
            </div>
            <div className="text-[10px] text-[#6B7280] mt-1.5">
              {completeness === 100
                ? isTa ? '✓ அனைத்து தகவல்களும் உள்ளன' : '✓ Ready for instant verification'
                : isTa ? 'சில விவரங்கள் தேவைப்படுகின்றன' : 'Add missing details for faster claims'}
            </div>
          </div>
          </div>
        </div>

        {/* Save feedback alert */}
        {isSavedAlert && (
          <div className="mt-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Profile and document statuses saved successfully!</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* Farm & Personal Information */}
        <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-xs space-y-6">
          <h3 className="font-display font-bold text-lg text-[#111827]">
            {isTa ? 'நிலம் மற்றும் தனிப்பட்ட தகவல்கள்' : 'Personal & Agricultural Holding Details'}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 text-xs">
            <div>
              <label className="block font-semibold text-[#374151] mb-1">
                {isTa ? 'விவசாயி பெயர்' : 'Farmer Full Name'}
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full p-2.5 bg-[#FBFBFA] border border-[#D1D5DB] rounded-lg text-xs font-medium text-[#111827]"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-[#374151] mb-1">
                {isTa ? 'கைபேசி எண்' : 'Mobile Number'}
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full p-2.5 bg-[#FBFBFA] border border-[#D1D5DB] rounded-lg text-xs font-medium text-[#111827]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#374151] mb-1">
                {isTa ? 'மாநிலம்' : 'State'}
              </label>
              <input
                type="text"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                className="w-full p-2.5 bg-[#FBFBFA] border border-[#D1D5DB] rounded-lg text-xs font-medium text-[#111827]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#374151] mb-1">
                {isTa ? 'மாவட்டம்' : 'District'}
              </label>
              <input
                type="text"
                value={formData.district}
                onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                className="w-full p-2.5 bg-[#FBFBFA] border border-[#D1D5DB] rounded-lg text-xs font-medium text-[#111827]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#374151] mb-1">
                {isTa ? 'கிராமம்' : 'Village'}
              </label>
              <input
                type="text"
                value={formData.village}
                onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                className="w-full p-2.5 bg-[#FBFBFA] border border-[#D1D5DB] rounded-lg text-xs font-medium text-[#111827]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#374151] mb-1">
                {isTa ? 'நில பரப்பளவு (ஏக்கர்)' : 'Total Land Size (Acres)'}
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.landSizeAcres}
                onChange={(e) => {
                  const val = parseFloat(e.target.value) || 0;
                  let cat = formData.category;
                  if (val < 2.5) cat = 'Marginal (<2.5 acres)';
                  else if (val <= 5.0) cat = 'Small (2.5 - 5.0 acres)';
                  else if (val <= 10.0) cat = 'Medium (5.0 - 10.0 acres)';
                  else cat = 'Large (>10.0 acres)';

                  setFormData({ ...formData, landSizeAcres: val, category: cat });
                }}
                className="w-full p-2.5 bg-[#FBFBFA] border border-[#D1D5DB] rounded-lg text-xs font-medium text-[#111827]"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-[#374151] mb-1">
                {isTa ? 'முதன்மையான பயிர்' : 'Primary Crop'}
              </label>
              <select
                value={formData.crop}
                onChange={(e) => setFormData({ ...formData, crop: e.target.value })}
                className="w-full p-2.5 bg-[#FBFBFA] border border-[#D1D5DB] rounded-lg text-xs font-medium text-[#111827]"
              >
                <option value="Rice">Rice / Paddy (நெல்)</option>
                <option value="Cotton">Cotton (பருத்தி)</option>
                <option value="Sugarcane">Sugarcane (கரும்பு)</option>
                <option value="Banana">Banana (வாழை)</option>
                <option value="Vegetables">Vegetables (காய்கறி)</option>
                <option value="Groundnut">Groundnut (நிலக்கடலை)</option>
                <option value="Pulses">Pulses (பயறு / உளுந்து)</option>
                <option value="Maize">Maize (மக்காச்சோளம்)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-[#374151] mb-1">
                {isTa ? 'விவசாயி வகைப்பாடு' : 'Farmer Category'}
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                className="w-full p-2.5 bg-[#FBFBFA] border border-[#D1D5DB] rounded-lg text-xs font-medium text-[#111827]"
              >
                <option value="Marginal (<2.5 acres)">Marginal (&lt;2.5 acres)</option>
                <option value="Small (2.5 - 5.0 acres)">Small (2.5 - 5.0 acres)</option>
                <option value="Medium (5.0 - 10.0 acres)">Medium (5.0 - 10.0 acres)</option>
                <option value="Large (>10.0 acres)">Large (&gt;10.0 acres)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-[#374151] mb-1">
                {isTa ? 'பாசன நீர் ஆதாரம்' : 'Irrigation Source'}
              </label>
              <select
                value={formData.irrigationType}
                onChange={(e) => setFormData({ ...formData, irrigationType: e.target.value as any })}
                className="w-full p-2.5 bg-[#FBFBFA] border border-[#D1D5DB] rounded-lg text-xs font-medium text-[#111827]"
              >
                <option value="Borewell / Tube Well">Borewell / Tube Well</option>
                <option value="Canal Irrigation">Canal Irrigation</option>
                <option value="Rainfed">Rainfed (Dryland)</option>
                <option value="Drip / Sprinkler">Drip / Sprinkler</option>
                <option value="None">None</option>
              </select>
            </div>
          </div>
        </div>

        {/* Available Documents Checklist & Dynamic Simulator */}
        <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="font-display font-bold text-lg text-[#111827]">
                {isTa ? 'ஆவண தயார்நிலை சரிபார்ப்பு' : 'Available Document Checklist'}
              </h3>
              <p className="text-xs text-[#6B7280]">
                {isTa
                  ? 'விவசாயியிடம் உள்ள ஆவணங்களை தேர்வு செய்து, தகுதி எவ்வாறு மாறுகிறது என்பதை சோதிக்கலாம்.'
                  : 'Toggle documents on/off to test how Valam detects missing paperwork in real time.'}
              </p>
            </div>

            <span className="text-xs text-[#1B4D2E] font-semibold bg-[#EAF5EC] px-3 py-1 rounded-full">
              {formData.documents.filter((d) => d.available).length} / {SYSTEM_DOCUMENTS.length} on hand
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
            {SYSTEM_DOCUMENTS.map((doc) => {
              const currentDoc = formData.documents.find((d) => d.documentId === doc.id);
              const isAvailable = currentDoc ? currentDoc.available : false;

              return (
                <div
                  key={doc.id}
                  onClick={() => handleToggleDocument(doc.id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                    isAvailable
                      ? 'border-emerald-200 bg-emerald-50/40 hover:bg-emerald-50/70'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-[#111827]">
                        {isTa ? doc.nameTa : doc.name}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#6B7280] leading-relaxed">
                      {isTa ? doc.descriptionTa : doc.description}
                    </p>
                    <div className="text-[10px] text-[#4B5563]">
                      Authority: {doc.issuingAuthority}
                    </div>

                    {/* Unlocked Schemes Info */}
                    {(() => {
                      const op = unlockOpportunities.find((o) => o.document.id === doc.id);
                      if (!op || op.unlockedPrograms.length === 0) return null;
                      return (
                        <div className="mt-2 p-1.5 rounded-md bg-[#EAF5EC] border border-[#C2E5CA] text-[10px] text-[#14381E] flex items-center gap-1 font-semibold">
                          <Sparkles className="w-3 h-3 text-[#15803D] shrink-0" />
                          <span>
                            {isTa ? 'சேர்த்தால் திறக்கப்படும்:' : 'Adds eligibility for:'}{' '}
                            {op.unlockedPrograms.map((p) => p.program.shortCode).join(', ')}
                          </span>
                        </div>
                      );
                    })()}
                  </div>

                  <div className="shrink-0 mt-0.5">
                    {isAvailable ? (
                      <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">
                        ✓ On Hand
                      </span>
                    ) : (
                      <span className="text-[11px] font-semibold text-rose-800 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                        ✗ Missing
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Submit Bar */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            className="px-6 py-2.5 text-xs font-bold text-white bg-[#1B4D2E] hover:bg-[#143B23] rounded-lg transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{isTa ? 'சுயவிவரத்தை சேமிக்க' : 'Save Changes'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
