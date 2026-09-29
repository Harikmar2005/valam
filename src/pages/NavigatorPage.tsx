import React, { useState, useEffect } from 'react';
import {
  Send,
  Compass,
  Droplets,
  Shield,
  Coins,
  Wrench,
  Wheat,
  Sprout,
  HelpCircle,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  MapPin,
  Maximize2
} from 'lucide-react';
import { api } from '../services/api';
import { SUPPORT_PROGRAMS } from '../data/mockData';
import { EligibilityExplanationCard } from '../components/EligibilityExplanationCard';
import { VerticalTimelinePathway } from '../components/VerticalTimelinePathway';
import { DocumentUnlockAdvisory } from '../components/DocumentUnlockAdvisory';
import {
  DetectedNeed,
  EligibilityResult,
  FarmerProfile,
  Language,
  NeedCategory,
  PersonalizedPathway,
  SupportProgram
} from '../types';

interface NavigatorPageProps {
  activeFarmer: FarmerProfile;
  language: Language;
  onUpdateFarmer: (farmer: FarmerProfile) => void;
  onOpenFarmerModal: () => void;
}

export const NavigatorPage: React.FC<NavigatorPageProps> = ({
  activeFarmer,
  language,
  onUpdateFarmer,
  onOpenFarmerModal
}) => {
  const isTa = language === 'ta';

  // State
  const [queryText, setQueryText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<NeedCategory | null>(null);
  const [detectedNeed, setDetectedNeed] = useState<DetectedNeed | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Dynamic answers to follow-up questions
  const [cropOverride, setCropOverride] = useState(activeFarmer.crop);
  const [landOverride, setLandOverride] = useState(activeFarmer.landSizeAcres);
  const [irrigationOverride, setIrrigationOverride] = useState(activeFarmer.irrigationType);

  // Results
  const [matchedPrograms, setMatchedPrograms] = useState<SupportProgram[]>([]);
  const [selectedProgram, setSelectedProgram] = useState<SupportProgram | null>(null);
  const [eligibilityResult, setEligibilityResult] = useState<EligibilityResult | null>(null);
  const [activePathway, setActivePathway] = useState<PersonalizedPathway | null>(null);

  // Keep overrides in sync if farmer switches
  useEffect(() => {
    setCropOverride(activeFarmer.crop);
    setLandOverride(activeFarmer.landSizeAcres);
    setIrrigationOverride(activeFarmer.irrigationType);
  }, [activeFarmer]);

  // Categories definitions
  const CATEGORIES = [
    {
      id: 'irrigation' as NeedCategory,
      title: isTa ? 'பாசன வசதி' : 'Irrigation & Water',
      desc: isTa ? 'சொட்டு நீர், தெளிப்பான், பம்புசெட்' : 'Drip, sprinkler, solar pumps',
      icon: <Droplets className="w-5 h-5 text-sky-600" />,
      sampleQuery: isTa ? 'எனக்கு பாசன உதவி வேண்டும்' : 'I need irrigation support for my field.'
    },
    {
      id: 'insurance' as NeedCategory,
      title: isTa ? 'பயிர் காப்பீடு' : 'Crop Insurance',
      desc: isTa ? 'வறட்சி, வெள்ளம், பயிர் இழப்பீடு' : 'PMFBY damage relief & weather risk',
      icon: <Shield className="w-5 h-5 text-emerald-600" />,
      sampleQuery: isTa ? 'பயிர் சேதம் நிவாரணம் வேண்டும்' : 'My crop was damaged by heavy rains.'
    },
    {
      id: 'loan' as NeedCategory,
      title: isTa ? 'விவசாயக் கடன்' : 'Agricultural Loan',
      desc: isTa ? 'குறைந்த வட்டி, கிசான் அட்டை' : 'KCC low interest cultivation loan',
      icon: <Coins className="w-5 h-5 text-amber-600" />,
      sampleQuery: isTa ? 'விவசாய கடன் தேவை' : 'I need a low-interest crop loan.'
    },
    {
      id: 'subsidy' as NeedCategory,
      title: isTa ? 'அரசு மானியம்' : 'Subsidy / Scheme',
      desc: isTa ? 'பி.எம் கிசான், பேரிடர் நிதி' : 'PM-KISAN income & calamity input grant',
      icon: <Wheat className="w-5 h-5 text-teal-600" />,
      sampleQuery: isTa ? 'உர மானியம் வேண்டும்' : 'I want to check my government subsidy.'
    },
    {
      id: 'equipment' as NeedCategory,
      title: isTa ? 'வேளாண் கருவிகள்' : 'Farm Machinery',
      desc: isTa ? 'பவர் டில்லர், டிராக்டர் மானியம்' : 'Power tillers, transplanters, rotavators',
      icon: <Wrench className="w-5 h-5 text-indigo-600" />,
      sampleQuery: isTa ? 'பவர் டில்லர் மானியம் வேண்டும்' : 'I need subsidy to buy a power tiller.'
    },
    {
      id: 'seeds_inputs' as NeedCategory,
      title: isTa ? 'விதை & உரம்' : 'Seeds & Inputs',
      desc: isTa ? 'சான்று பெற்ற விதை, மண் பரிசோதனை' : 'Certified seeds, soil health testing',
      icon: <Sprout className="w-5 h-5 text-green-600" />,
      sampleQuery: isTa ? 'சான்று பெற்ற நெல் விதை வேண்டும்' : 'I need subsidized certified seeds.'
    }
  ];

  // Handle Natural Language Submission
  const handleQuerySubmit = async (textToProcess?: string) => {
    const text = textToProcess || queryText;
    if (!text.trim()) return;

    setIsProcessing(true);
    setActivePathway(null);

    try {
      const detection = await api.detectNeed(text);
      setDetectedNeed(detection);
      setSelectedCategory(detection.detectedCategory);

      if (detection.extractedCrop) {
        setCropOverride(detection.extractedCrop);
      }
      if (detection.extractedLandSize) {
        setLandOverride(detection.extractedLandSize);
      }

      // Fetch programs for this category
      const programs = await api.getSupportPrograms(detection.detectedCategory);
      setMatchedPrograms(programs);

      if (programs.length > 0) {
        const topProg = programs[0];
        setSelectedProgram(topProg);

        // Evaluate eligibility with effective farmer profile
        const effectiveFarmer: FarmerProfile = {
          ...activeFarmer,
          crop: detection.extractedCrop || cropOverride,
          landSizeAcres: detection.extractedLandSize || landOverride,
          irrigationType: irrigationOverride
        };

        const res = await api.checkEligibility(effectiveFarmer.id, topProg.id);
        setEligibilityResult(res);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle Category Tile Click
  const handleCategorySelect = async (cat: NeedCategory, sampleQuery: string) => {
    setSelectedCategory(cat);
    setQueryText(sampleQuery);
    await handleQuerySubmit(sampleQuery);
  };

  // Re-evaluate when overrides or selected program change
  const handleReevaluate = async (prog: SupportProgram) => {
    setSelectedProgram(prog);
    setActivePathway(null);
    setIsProcessing(true);

    try {
      const effectiveFarmer: FarmerProfile = {
        ...activeFarmer,
        crop: cropOverride,
        landSizeAcres: landOverride,
        irrigationType: irrigationOverride
      };

      const res = await api.checkEligibility(effectiveFarmer.id, prog.id);
      setEligibilityResult(res);
    } finally {
      setIsProcessing(false);
    }
  };

  // Generate Personalized Pathway
  const handleGeneratePathway = async () => {
    if (!selectedProgram || !eligibilityResult) return;
    setIsProcessing(true);

    try {
      const effectiveFarmer: FarmerProfile = {
        ...activeFarmer,
        crop: cropOverride,
        landSizeAcres: landOverride,
        irrigationType: irrigationOverride
      };
      const pathway = await api.generatePathway(effectiveFarmer.id, selectedProgram.id);
      setActivePathway(pathway);

      // Scroll smoothly to pathway
      setTimeout(() => {
        document.getElementById('pathway-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } finally {
      setIsProcessing(false);
    }
  };

  // Reset search
  const handleReset = () => {
    setQueryText('');
    setSelectedCategory(null);
    setDetectedNeed(null);
    setMatchedPrograms([]);
    setSelectedProgram(null);
    setEligibilityResult(null);
    setActivePathway(null);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* 1. Header Banner & Farmer Bar */}
      <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#EAF5EC] text-[#1B4D2E] text-xs font-semibold mb-2">
              <Compass className="w-3.5 h-3.5" />
              <span>{isTa ? 'அறிவார்ந்த தேவை கண்டறிதல்' : 'Intelligent Need Navigator'}</span>
            </div>
            <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-[#111827]">
              {isTa ? 'உங்கள் தேவையை கூறுங்கள். வளம் வழியமைக்கும்.' : 'Describe your problem. Valam finds the path.'}
            </h1>
            <p className="text-xs sm:text-sm text-[#6B7280] mt-1">
              {isTa
                ? 'அரசு துறை பெயர்களை தேட வேண்டாம். உங்கள் எளிய விவசாய தேவையை உள்ளிடவும்.'
                : 'No bureaucratic terminology required. Speak in your own words, and we extract intent and eligibility.'}
            </p>
          </div>

          {/* Active Farmer Quick Lockup */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-[#F9FAFB] border border-[#E5E7EB] shrink-0">
            <div className="w-9 h-9 rounded-full bg-[#1B4D2E]/10 text-[#1B4D2E] flex items-center justify-center font-bold text-xs">
              {activeFarmer.name.slice(0, 2).toUpperCase()}
            </div>
            <div className="text-xs">
              <div className="font-bold text-[#111827]">{activeFarmer.name}</div>
              <div className="text-[#6B7280] flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {activeFarmer.district} · {activeFarmer.landSizeAcres} ac ({activeFarmer.crop})
              </div>
            </div>
            <button
              onClick={onOpenFarmerModal}
              className="px-2.5 py-1 text-[11px] font-semibold text-[#1B4D2E] hover:bg-[#EAF5EC] rounded-md transition-colors"
            >
              {isTa ? 'மாற்று' : 'Switch'}
            </button>
          </div>
        </div>

        {/* 2. Natural Language Input Bar */}
        <div className="mt-6">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleQuerySubmit();
            }}
            className="flex flex-col sm:flex-row items-stretch gap-2"
          >
            <div className="relative flex-1">
              <input
                type="text"
                value={queryText}
                onChange={(e) => setQueryText(e.target.value)}
                placeholder={
                  isTa
                    ? 'எ.கா: "எனக்கு பாசன உதவி வேண்டும்" அல்லது "பயிர் சேதமானது"'
                    : 'e.g., "I need irrigation support for my rice field" or "My crop was damaged by flood"'
                }
                className="w-full px-4 py-3.5 pr-10 text-sm text-[#111827] bg-[#FBFBFA] border border-[#D1D5DB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B4D2E] focus:border-transparent transition-all shadow-inner"
              />
              {queryText && (
                <button
                  type="button"
                  onClick={() => setQueryText('')}
                  className="absolute right-3 top-3.5 text-xs text-[#9CA3AF] hover:text-[#4B5563]"
                >
                  ✕
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={isProcessing || !queryText.trim()}
              className="px-6 py-3.5 text-xs font-bold text-white bg-[#1B4D2E] hover:bg-[#143B23] disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-all flex items-center justify-center gap-2 shadow-xs shrink-0 cursor-pointer"
            >
              {isProcessing ? (
                <span>{isTa ? 'கணக்கிடுகிறது...' : 'Evaluating...'}</span>
              ) : (
                <>
                  <span>{isTa ? 'வழிகாட்டுக' : 'Find My Path'}</span>
                  <Send className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Natural language helper prompts */}
          <div className="flex flex-wrap items-center gap-2 mt-3 text-xs text-[#6B7280]">
            <span className="font-medium text-[#4B5563] flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-[#10B981]" />
              {isTa ? 'மாதிரி தேவைகள்:' : 'Quick voice / query prompts:'}
            </span>
            <button
              type="button"
              onClick={() => {
                setQueryText('I need irrigation support for my rice crop');
                handleQuerySubmit('I need irrigation support for my rice crop');
              }}
              className="hover:text-[#1B4D2E] hover:underline"
            >
              "I need irrigation support"
            </button>
            <span>·</span>
            <button
              type="button"
              onClick={() => {
                setQueryText('My crop was damaged by heavy unseasonal rain');
                handleQuerySubmit('My crop was damaged by heavy unseasonal rain');
              }}
              className="hover:text-[#1B4D2E] hover:underline"
            >
              "My crop was damaged"
            </button>
            <span>·</span>
            <button
              type="button"
              onClick={() => {
                setQueryText('எனக்கு பாசன உதவி வேண்டும்');
                handleQuerySubmit('எனக்கு பாசன உதவி வேண்டும்');
              }}
              className="hover:text-[#1B4D2E] hover:underline font-medium text-[#1B4D2E]"
            >
              "எனக்கு பாசன உதவி வேண்டும்"
            </button>
          </div>
        </div>

        {/* 3. Visual Need Category Tiles */}
        <div className="mt-8 pt-6 border-t border-[#E5E7EB]">
          <div className="text-xs font-bold uppercase tracking-wider text-[#6B7280] mb-3">
            {isTa ? 'அல்லது உங்கள் தேவையை நேரடியாக தேர்வு செய்யவும்:' : 'Or Select What You Need Help With:'}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => handleCategorySelect(cat.id, cat.sampleQuery)}
                  className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'border-[#1B4D2E] bg-[#EAF5EC] ring-2 ring-[#1B4D2E]/20'
                      : 'border-[#E5E7EB] bg-white hover:border-[#9CA3AF] hover:bg-[#F9FAFB]'
                  }`}
                >
                  <div className="mb-2">{cat.icon}</div>
                  <div>
                    <h4 className="font-semibold text-xs text-[#111827] leading-tight mb-0.5">
                      {cat.title}
                    </h4>
                    <p className="text-[11px] text-[#6B7280] line-clamp-1">{cat.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 4. NLP Intent Extraction & Follow-Up Answers Card (if detected) */}
      {detectedNeed && (
        <div className="bg-[#F8FAF9] p-5 rounded-2xl border border-[#D7E3D9] text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-[#D7E3D9]">
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#14381E] text-sm">
                {isTa ? 'கண்டறியப்பட்ட விவசாய தேவை:' : 'Extracted Need Profile:'}
              </span>
              <span className="font-semibold text-[#1B4D2E] bg-white px-2.5 py-0.5 rounded-full border border-[#CDE8D2]">
                {isTa ? detectedNeed.categoryNameTa : detectedNeed.categoryName}
              </span>
              <span className="text-[#6B7280]">({detectedNeed.confidence}% match confidence)</span>
            </div>

            <button
              onClick={handleReset}
              className="text-xs text-[#6B7280] hover:text-[#111827] flex items-center gap-1 self-start sm:self-auto"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{isTa ? 'புதிய தேடல்' : 'Start Fresh'}</span>
            </button>
          </div>

          {/* Minimum questions asked: Crop, Location, Land, Irrigation */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Question 1: Crop */}
            <div>
              <label className="block text-[#4B5563] font-medium mb-1">
                {isTa ? '1. பயிரிடும் பயிர் எது?' : '1. What crop do you grow?'}
              </label>
              <select
                value={cropOverride}
                onChange={(e) => {
                  setCropOverride(e.target.value);
                  if (selectedProgram) {
                    handleReevaluate(selectedProgram);
                  }
                }}
                className="w-full p-2 bg-white border border-[#D1D5DB] rounded-lg text-xs font-semibold text-[#111827]"
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

            {/* Question 2: Land size */}
            <div>
              <label className="block text-[#4B5563] font-medium mb-1">
                {isTa ? '2. நிலத்தின் பரப்பளவு (ஏக்கர்):' : '2. What is your land size (acres)?'}
              </label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                max="50"
                value={landOverride}
                onChange={(e) => {
                  const val = parseFloat(e.target.value) || 1;
                  setLandOverride(val);
                  if (selectedProgram) {
                    handleReevaluate(selectedProgram);
                  }
                }}
                className="w-full p-2 bg-white border border-[#D1D5DB] rounded-lg text-xs font-semibold text-[#111827]"
              />
            </div>

            {/* Question 3: Irrigation Source */}
            <div>
              <label className="block text-[#4B5563] font-medium mb-1">
                {isTa ? '3. தற்போதைய பாசன வகை:' : '3. Current irrigation source:'}
              </label>
              <select
                value={irrigationOverride}
                onChange={(e) => {
                  setIrrigationOverride(e.target.value as any);
                  if (selectedProgram) {
                    handleReevaluate(selectedProgram);
                  }
                }}
                className="w-full p-2 bg-white border border-[#D1D5DB] rounded-lg text-xs font-semibold text-[#111827]"
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
      )}

      {/* 5. Matched Programs Tabs */}
      {matchedPrograms.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-lg text-[#111827]">
              {isTa ? 'தொடர்புடைய அரசு திட்டங்கள்' : 'Relevant Support Programs Identified'}
            </h3>
            <span className="text-xs text-[#6B7280]">
              {matchedPrograms.length} {isTa ? 'திட்டங்கள் கிடைத்துள்ளன' : 'programs found'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {matchedPrograms.map((prog) => {
              const isSelected = selectedProgram?.id === prog.id;
              return (
                <div
                  key={prog.id}
                  onClick={() => handleReevaluate(prog)}
                  className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'border-[#1B4D2E] bg-white ring-2 ring-[#1B4D2E]/20 shadow-xs'
                      : 'border-[#E5E7EB] bg-white hover:border-[#9CA3AF] hover:bg-[#FAFAFA]'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] font-bold text-[#1B4D2E] uppercase tracking-wide">
                        {prog.shortCode}
                      </span>
                      <span className="text-[11px] text-[#6B7280]">
                        {prog.sponsoringBody}
                      </span>
                    </div>
                    <h4 className="font-semibold text-sm text-[#111827] mb-1">
                      {isTa ? prog.nameTa : prog.name}
                    </h4>
                    <p className="text-xs text-[#6B7280] line-clamp-2 leading-relaxed">
                      {isTa ? prog.descriptionTa : prog.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#E5E7EB] flex items-center justify-between text-xs">
                    <span className="font-medium text-[#111827]">
                      {isTa ? prog.benefits.financialEstimate || 'முழு மானியம்' : prog.benefits.financialEstimate || 'Full Subsidy'}
                    </span>
                    <span className={`text-[11px] font-bold ${isSelected ? 'text-[#1B4D2E]' : 'text-[#6B7280]'}`}>
                      {isSelected ? (isTa ? 'தேர்வு செய்யப்பட்டது ✓' : 'Selected ✓') : (isTa ? 'மதிப்பிடுக →' : 'Evaluate →')}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 6. Detailed Explainable Eligibility Card */}
      {selectedProgram && eligibilityResult && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-lg text-[#111827]">
              {isTa ? 'விளக்கமான தகுதி பகுப்பாய்வு' : 'Explainable Eligibility Analysis'}
            </h3>
            <span className="text-xs text-[#6B7280]">
              {selectedProgram.name}
            </span>
          </div>

          <EligibilityExplanationCard
            eligibility={eligibilityResult}
            program={selectedProgram}
            language={language}
            farmer={activeFarmer}
            problemStatement={queryText}
            onGeneratePathway={handleGeneratePathway}
            onSelectAlternativeProgram={(progId) => {
              const found = SUPPORT_PROGRAMS.find((p) => p.id === progId);
              if (found) handleReevaluate(found);
            }}
            showPathwayButton={true}
            autoExpandAi={eligibilityResult.status === 'not_eligible'}
          />

          {/* Document Multiplier Opportunities: If you add these documents, you become eligible for these also */}
          <DocumentUnlockAdvisory
            farmer={activeFarmer}
            language={language}
            onUpdateFarmerDocs={onUpdateFarmer}
            onSelectProgram={(prog) => handleReevaluate(prog)}
          />
        </div>
      )}

      {/* 7. Personalized Pathway Timeline (Generated on demand) */}
      {activePathway && (
        <div id="pathway-section" className="space-y-4 pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display font-bold text-xl text-[#111827]">
                {isTa ? 'உங்கள் தனிப்பயனாக்கப்பட்ட செயல் பாதை' : 'Your Valam Support Pathway'}
              </h3>
              <p className="text-xs text-[#6B7280]">
                {isTa
                  ? 'கடைசி மைல் வரை ஒவ்வொரு அடியையும் எளிமையாகப் பின்பற்றுங்கள்.'
                  : 'Follow each actionable step from document preparation to benefit credit.'}
              </p>
            </div>
          </div>

          <VerticalTimelinePathway
            pathway={activePathway}
            farmer={{
              ...activeFarmer,
              crop: cropOverride,
              landSizeAcres: landOverride,
              irrigationType: irrigationOverride
            }}
            language={language}
          />
        </div>
      )}
    </div>
  );
};
