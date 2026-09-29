import React, { useState } from 'react';
import {
  X,
  UserPlus,
  Sparkles,
  CheckCircle2,
  Copy,
  MapPin,
  FileCheck2,
  ShieldCheck,
  CreditCard,
  Building,
  ArrowRight
} from 'lucide-react';
import { SYSTEM_DOCUMENTS } from '../data/mockData';
import { api } from '../services/api';
import { FarmerCategory, FarmerProfile, IrrigationType, Language } from '../types';

interface CreateFarmerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFarmerCreated: (newFarmer: FarmerProfile) => void;
  language: Language;
}

export const CreateFarmerModal: React.FC<CreateFarmerModalProps> = ({
  isOpen,
  onClose,
  onFarmerCreated,
  language
}) => {
  if (!isOpen) return null;
  const isTa = language === 'ta';

  // Generate a realistic default ID
  const generateRandomId = () => {
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    return `VLM-TN-${new Date().getFullYear()}-${randomDigits}`;
  };

  // Form State
  const [userId, setUserId] = useState(generateRandomId());
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('+91 ');
  const [state, setState] = useState('Tamil Nadu');
  const [district, setDistrict] = useState('Thanjavur');
  const [taluk, setTaluk] = useState('');
  const [village, setVillage] = useState('');
  const [landSizeAcres, setLandSizeAcres] = useState<number>(2.0);
  const [crop, setCrop] = useState('Rice');
  const [irrigationType, setIrrigationType] = useState<IrrigationType>('Borewell / Tube Well');
  const [hasBankAccount, setHasBankAccount] = useState(true);
  const [bankName, setBankName] = useState('Canara Bank');
  const [hasAadhaarLinkedBank, setHasAadhaarLinkedBank] = useState(true);

  // Selected Documents
  const [availableDocIds, setAvailableDocIds] = useState<string[]>([
    'DOC_AADHAAR',
    'DOC_PATTA_CHITTA'
  ]);

  // Submission Status
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdProfile, setCreatedProfile] = useState<FarmerProfile | null>(null);
  const [copied, setCopied] = useState(false);

  // Derive Category from land size
  const getCategory = (acres: number): FarmerCategory => {
    if (acres < 2.5) return 'Marginal (<2.5 acres)';
    if (acres <= 5.0) return 'Small (2.5 - 5.0 acres)';
    if (acres <= 10.0) return 'Medium (5.0 - 10.0 acres)';
    return 'Large (>10.0 acres)';
  };

  const handleToggleDoc = (docId: string) => {
    setAvailableDocIds((prev) =>
      prev.includes(docId) ? prev.filter((id) => id !== docId) : [...prev, docId]
    );
  };

  const handleCopyId = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);

    const documents = SYSTEM_DOCUMENTS.map((doc) => {
      const isAvailable = availableDocIds.includes(doc.id);
      return {
        documentId: doc.id,
        available: isAvailable,
        verifiedStatus: (isAvailable ? 'verified' : 'missing') as any,
        documentNumber: isAvailable ? `DOC-${Math.floor(10000 + Math.random() * 90000)}` : undefined
      };
    });

    const newFarmer: FarmerProfile = {
      id: userId.trim() || generateRandomId(),
      name: name.trim(),
      phone: phone.trim() || '+91 94400 00000',
      state: state.trim() || 'Tamil Nadu',
      district: district.trim() || 'Thanjavur',
      taluk: taluk.trim() || 'Taluk Centre',
      village: village.trim() || 'Revenue Village',
      landSizeAcres: Number(landSizeAcres) || 1.0,
      crop: crop || 'Rice',
      category: getCategory(Number(landSizeAcres) || 1.0),
      irrigationType,
      hasBankAccount,
      bankName: hasBankAccount ? bankName : undefined,
      hasAadhaarLinkedBank,
      documents
    };

    try {
      const saved = await api.saveFarmer(newFarmer);
      setCreatedProfile(saved);
      onFarmerCreated(saved);
    } catch (err) {
      console.error(err);
      // Fallback local save
      setCreatedProfile(newFarmer);
      onFarmerCreated(newFarmer);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-[#E5E7EB]">
        {/* Header */}
        <div className="p-5 border-b border-[#E5E7EB] flex items-center justify-between bg-[#F8FAF9]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#1B4D2E] text-white flex items-center justify-center font-bold">
              <UserPlus className="w-5 h-5 text-[#86EFAC]" />
            </div>
            <div>
              <h2 className="font-display font-extrabold text-lg text-[#111827]">
                {isTa ? 'புதிய விவசாயி பயனர் ஐடி பதிவு' : 'Create New Farmer User ID'}
              </h2>
              <p className="text-xs text-[#6B7280]">
                {isTa
                  ? 'புதிய விவசாயி விவரங்களை உள்ளிட்டு தனித்துவமான வளம் பயனர் ஐடியை உருவாக்குக.'
                  : 'Register a new farmer profile with a personalized ID and test real-time eligibility.'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#6B7280] hover:bg-[#E5E7EB] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        {createdProfile ? (
          // Success State: Digital Farmer Card
          <div className="p-6 space-y-6">
            <div className="p-5 rounded-2xl bg-[#F0FDF4] border-2 border-[#86EFAC] text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-[#DCFCE7] text-[#15803D] flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="font-display font-bold text-lg text-[#14532D]">
                {isTa ? 'விவசாயி ஐடி வெற்றிகரமாக உருவாக்கப்பட்டது!' : 'Farmer User ID Created Successfully!'}
              </h3>
              <p className="text-xs text-[#166534] max-w-md mx-auto">
                {isTa
                  ? `இந்த பயனர் ஐடி (${createdProfile.id}) மூலம் கணினியில் பதிவு செய்யப்பட்டுள்ளது. இப்போது நீங்கள் தகுதி ஆய்வைத் தொடங்கலாம்.`
                  : `Your farmer profile is now active under User ID ${createdProfile.id}. You can immediately run eligibility matches and generate pathways.`}
              </p>
            </div>

            {/* Visual Digital Farmer ID Card */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-[#183822] to-[#122A1A] text-white shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <ShieldCheck className="w-36 h-36" />
              </div>

              <div className="flex items-center justify-between mb-4 border-b border-white/20 pb-3">
                <div className="flex items-center gap-2">
                  <span className="font-display font-bold text-lg tracking-wider text-white">
                    VALAM KISAN CARD
                  </span>
                  <span className="text-[10px] bg-[#34D399] text-[#064E3B] font-extrabold px-2 py-0.5 rounded">
                    ACTIVE
                  </span>
                </div>
                <span className="text-xs text-[#A7F3D0] font-mono">TN-AGRI-2026</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-[11px] text-[#A7F3D0] block">Farmer Name</span>
                  <span className="font-extrabold text-base text-white">{createdProfile.name}</span>
                </div>

                <div>
                  <span className="text-[11px] text-[#A7F3D0] block">User ID / Registration No.</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="font-mono font-bold text-sm text-[#FDE047]">{createdProfile.id}</span>
                    <button
                      onClick={() => handleCopyId(createdProfile.id)}
                      className="p-1 rounded bg-white/10 hover:bg-white/20 text-white transition-colors"
                      title="Copy ID"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    {copied && <span className="text-[10px] text-[#34D399]">Copied!</span>}
                  </div>
                </div>

                <div>
                  <span className="text-[11px] text-[#A7F3D0] block">Location</span>
                  <span className="font-medium text-[#E2E8F0]">
                    {createdProfile.village}, {createdProfile.district}
                  </span>
                </div>

                <div>
                  <span className="text-[11px] text-[#A7F3D0] block">Crop & Landholding</span>
                  <span className="font-medium text-[#E2E8F0]">
                    {createdProfile.crop} · {createdProfile.landSizeAcres} Acres ({createdProfile.category})
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-white/15 flex items-center justify-between text-[11px] text-[#D1FAE5]">
                <span>Documents on Hand: {createdProfile.documents.filter((d) => d.available).length}/{createdProfile.documents.length}</span>
                <span className="font-mono">Status: Ready for Scheme Matching</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={onClose}
                className="px-5 py-2.5 text-xs font-bold text-white bg-[#1B4D2E] hover:bg-[#143B23] rounded-xl transition-all flex items-center gap-2 shadow-xs cursor-pointer"
              >
                <span>{isTa ? 'வழிகாட்டியைத் தொடங்குக' : 'Start with this Farmer ID'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          // Form State
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Step 1: User ID Field */}
            <div className="p-4 rounded-xl bg-[#F8FAF9] border border-[#D7E3D9] space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-[#14381E] uppercase tracking-wide">
                  {isTa ? 'பயனர் அடையாள எண் (User ID)' : 'Farmer User ID'}
                </label>
                <button
                  type="button"
                  onClick={() => setUserId(generateRandomId())}
                  className="text-[11px] font-semibold text-[#1B4D2E] hover:underline flex items-center gap-1"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isTa ? 'புதிய ஐடி உருவாக்குக' : 'Auto-Generate ID'}</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  placeholder="e.g. VLM-TN-2026-8941"
                  className="flex-1 p-2.5 bg-white border border-[#D1D5DB] rounded-lg text-xs font-mono font-bold text-[#111827] focus:outline-none focus:ring-1 focus:ring-[#1B4D2E]"
                  required
                />
              </div>
              <p className="text-[11px] text-[#6B7280]">
                {isTa
                  ? 'நீங்கள் விரும்பும் தனிப்பயன் ஐடியை வழங்கலாம் அல்லது தானாக உருவாக்கப்பட்ட எண்ணைப் பயன்படுத்தலாம்.'
                  : 'Provide a custom identifier (e.g. your Uzhavan ID or national ID token) or keep the auto-generated ID.'}
              </p>
            </div>

            {/* Step 2: Personal & Location Details */}
            <div className="space-y-4">
              <h3 className="font-display font-bold text-sm text-[#111827] border-b border-[#E5E7EB] pb-2">
                {isTa ? '1. அடிப்படை விவரங்கள்' : '1. Personal & Location Details'}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-semibold text-[#374151] mb-1">
                    {isTa ? 'முழுப் பெயர் *' : 'Farmer Full Name *'}
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. K. Ramesh"
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
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98400 12345"
                    className="w-full p-2.5 bg-[#FBFBFA] border border-[#D1D5DB] rounded-lg text-xs font-medium text-[#111827]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#374151] mb-1">
                    {isTa ? 'மாவட்டம்' : 'District'}
                  </label>
                  <select
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full p-2.5 bg-[#FBFBFA] border border-[#D1D5DB] rounded-lg text-xs font-medium text-[#111827]"
                  >
                    <option value="Thanjavur">Thanjavur (தஞ்சாவூர்)</option>
                    <option value="Madurai">Madurai (மதுரை)</option>
                    <option value="Tiruchirappalli">Tiruchirappalli (திருச்சிராப்பள்ளி)</option>
                    <option value="Dharmapuri">Dharmapuri (தருமபுரி)</option>
                    <option value="Salem">Salem (சேலம்)</option>
                    <option value="Coimbatore">Coimbatore (கோயம்புத்தூர்)</option>
                    <option value="Tiruvarur">Tiruvarur (திருவாரூர்)</option>
                    <option value="Tirunelveli">Tirunelveli (திருநெல்வேலி)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#374151] mb-1">
                    {isTa ? 'கிராமம் / வருவாய் கிராமம்' : 'Village'}
                  </label>
                  <input
                    type="text"
                    value={village}
                    onChange={(e) => setVillage(e.target.value)}
                    placeholder="e.g. Thiruvidaimarudur"
                    className="w-full p-2.5 bg-[#FBFBFA] border border-[#D1D5DB] rounded-lg text-xs font-medium text-[#111827]"
                  />
                </div>
              </div>
            </div>

            {/* Step 3: Land & Agricultural Prerequisite Details */}
            <div className="space-y-4">
              <h3 className="font-display font-bold text-sm text-[#111827] border-b border-[#E5E7EB] pb-2">
                {isTa ? '2. நிலம் மற்றும் பயிர் விவரங்கள்' : '2. Land & Cultivation Details'}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block font-semibold text-[#374151] mb-1">
                    {isTa ? 'நிலப் பரப்பளவு (ஏக்கர்)' : 'Land Size (Acres)'}
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    max="100"
                    value={landSizeAcres}
                    onChange={(e) => setLandSizeAcres(parseFloat(e.target.value) || 1)}
                    className="w-full p-2.5 bg-[#FBFBFA] border border-[#D1D5DB] rounded-lg text-xs font-semibold text-[#111827]"
                    required
                  />
                  <span className="text-[10px] text-[#1B4D2E] font-medium mt-1 block">
                    Category: {getCategory(landSizeAcres)}
                  </span>
                </div>

                <div>
                  <label className="block font-semibold text-[#374151] mb-1">
                    {isTa ? 'பயிர்' : 'Primary Crop'}
                  </label>
                  <select
                    value={crop}
                    onChange={(e) => setCrop(e.target.value)}
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
                    {isTa ? 'பாசன வகை' : 'Irrigation Type'}
                  </label>
                  <select
                    value={irrigationType}
                    onChange={(e) => setIrrigationType(e.target.value as any)}
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

            {/* Step 4: Documents on Hand */}
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-2">
                <h3 className="font-display font-bold text-sm text-[#111827]">
                  {isTa ? '3. தற்போது கையில் உள்ள ஆவணங்கள்' : '3. Documents on Hand'}
                </h3>
                <span className="text-[11px] text-[#6B7280]">
                  {availableDocIds.length} of {SYSTEM_DOCUMENTS.length} checked
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {SYSTEM_DOCUMENTS.map((doc) => {
                  const isChecked = availableDocIds.includes(doc.id);
                  return (
                    <div
                      key={doc.id}
                      onClick={() => handleToggleDoc(doc.id)}
                      className={`p-2.5 rounded-lg border transition-all cursor-pointer flex items-center justify-between ${
                        isChecked
                          ? 'border-emerald-300 bg-emerald-50 text-emerald-950 font-semibold'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span className="truncate pr-2">{isTa ? doc.nameTa : doc.name}</span>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        className="rounded text-[#1B4D2E] focus:ring-0"
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-[#E5E7EB]">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-[#6B7280] hover:text-[#111827] transition-colors"
              >
                {isTa ? 'ரத்து செய்க' : 'Cancel'}
              </button>

              <button
                type="submit"
                disabled={isSubmitting || !name.trim()}
                className="px-6 py-2.5 text-xs font-bold text-white bg-[#1B4D2E] hover:bg-[#143B23] disabled:opacity-50 rounded-xl transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <UserPlus className="w-4 h-4" />
                <span>{isSubmitting ? (isTa ? 'பதிவாகிறது...' : 'Creating...') : (isTa ? 'பயனர் ஐடி உருவாக்குக' : 'Create Farmer ID & Proceed')}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
