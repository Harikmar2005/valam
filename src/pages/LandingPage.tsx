import React from 'react';
import {
  Compass,
  Phone,
  ShieldCheck,
  FileCheck2,
  Users,
  CheckCircle2,
  ArrowRight,
  Sprout,
  AlertTriangle,
  Scale,
  Sparkles,
  HelpCircle
} from 'lucide-react';
import { Language } from '../types';

interface LandingPageProps {
  onNavigate: (tab: string) => void;
  language: Language;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate, language }) => {
  const isTa = language === 'ta';

  return (
    <div className="space-y-24">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-8 pb-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Proposition */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EAF5EC] border border-[#CDE8D2] text-[#1B4D2E] text-xs font-semibold">
                <Sprout className="w-3.5 h-3.5" />
                <span>Track 1 · Problem 4 · The Last-Mile Farmer Support Gap</span>
              </div>

              <h1 className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl tracking-tight text-[#111827] leading-[1.1]">
                {isTa
                  ? 'அரசு உதவி விவசாயியைத் தேடி வர வேண்டும்.'
                  : 'Support should reach the farmer, not the other way around.'}
              </h1>

              <p className="text-base sm:text-lg text-[#4B5563] leading-relaxed max-w-2xl">
                {isTa
                  ? 'விவசாயிகளின் எளிய மொழியில் தேவையைப் புரிந்து கொண்டு, சிக்கலான தகுதி விதிகளை கணக்கிட்டு, விடுபட்ட ஆவணங்களை சுட்டிக்காட்டி, கடைசி மைல் வரை தனிப்பயனாக்கப்பட்ட செயல் பாதையை அமைக்கும் வழிகாட்டி.'
                  : 'An intelligent last-mile farmer support navigator that turns fragmented government schemes, complex eligibility rules, and documentation hurdles into a transparent, personalized pathway to benefits.'}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => onNavigate('navigator')}
                  className="px-6 py-3 text-sm font-bold text-white bg-[#1B4D2E] hover:bg-[#143B23] rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer group"
                >
                  <span>{isTa ? 'எனக்கான உதவியை காண்க' : 'Find My Support'}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </button>

                <button
                  onClick={() => onNavigate('phone-simulator')}
                  className="px-5 py-3 text-sm font-semibold text-[#1F2937] bg-white hover:bg-[#F9FAFB] border border-[#D1D5DB] rounded-xl transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Phone className="w-4 h-4 text-[#1B4D2E]" />
                  <span>{isTa ? 'பட்டன் போன் சிமுலேட்டர்' : 'Try Phone Simulator'}</span>
                </button>

                <button
                  onClick={() => onNavigate('assisted-mode')}
                  className="px-4 py-3 text-sm font-semibold text-[#4B5563] hover:text-[#111827] transition-colors"
                >
                  {isTa ? 'CSC மையம் பயன்முறை →' : 'Assisted Mode (CSC) →'}
                </button>
              </div>

              {/* Trust Signal / Principles */}
              <div className="pt-4 border-t border-[#E5E7EB] flex flex-wrap items-center gap-6 text-xs text-[#6B7280]">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                  <span>Deterministic Rule Engine</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                  <span>Explainable Criteria</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                  <span>Tamil & English Native</span>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Visual Asset */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-[#E5E7EB] bg-[#E5E7EB] aspect-[4/3]">
                <img
                  src="/src/assets/images/hero_farmer_field_1790664459033.jpg"
                  alt="Farmer standing proudly near agricultural fields in Tamil Nadu at dawn"
                  className="w-full h-full object-cover"
                  loading="eager"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    // Fallback container if image fails
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6 text-white">
                  <div className="text-xs uppercase tracking-wider text-[#A7F3D0] font-bold mb-1">
                    Thanjavur Delta Region
                  </div>
                  <h3 className="font-display font-bold text-lg text-white">
                    "I just want to know: am I eligible for drip irrigation, and which paper is missing?"
                  </h3>
                  <p className="text-xs text-[#E2E8F0] mt-1">
                    — Ravi Kumar, 2.4 acres paddy farmer
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. THE PROBLEM & VALAM MECHANISM (ARGUMENT FLOW) */}
      <section className="bg-white py-16 border-y border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs uppercase tracking-wider font-bold text-[#1B4D2E]">
              Core Transformation
            </span>
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-[#111827] mt-2">
              From Fragmented Portals to a Personalized Action Pathway
            </h2>
            <p className="text-sm sm:text-base text-[#4B5563] mt-3">
              Don’t force farmers to navigate bureaucratic jargon across 14 different department portals.
              Let them describe their problem, and let Valam engineer the pathway.
            </p>
          </div>

          {/* 3-Step Transformation Visual */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            {/* Step 1: The Problem */}
            <div className="p-6 rounded-2xl bg-[#FFFBF8] border border-[#FED7AA]/60 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-[#FFEDD5] text-[#C2410C] flex items-center justify-center font-bold mb-4">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <span className="text-xs uppercase font-bold text-[#C2410C] tracking-wider">
                  The Status Quo
                </span>
                <h3 className="font-display font-bold text-lg text-[#111827] mt-1 mb-2">
                  Fragmented Information
                </h3>
                <p className="text-xs sm:text-sm text-[#6B7280] leading-relaxed">
                  Subsidies exist for drip, insurance, and solar pumps, but eligibility circulars are buried in PDFs with technical land ceilings and unstated document dependencies.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#FED7AA]/40 text-xs font-semibold text-[#9A3412]">
                Result: 42% eligible farmers miss deadlines
              </div>
            </div>

            {/* Step 2: Valam Mechanism */}
            <div className="p-6 rounded-2xl bg-[#F4F9F5] border border-[#BBF7D0] flex flex-col justify-between ring-2 ring-[#1B4D2E]/20">
              <div>
                <div className="w-10 h-10 rounded-xl bg-[#DCFCE7] text-[#166534] flex items-center justify-center font-bold mb-4">
                  <Compass className="w-5 h-5" />
                </div>
                <span className="text-xs uppercase font-bold text-[#166534] tracking-wider">
                  Valam Engine
                </span>
                <h3 className="font-display font-bold text-lg text-[#111827] mt-1 mb-2">
                  Understand → Match → Prepare
                </h3>
                <p className="text-xs sm:text-sm text-[#4B5563] leading-relaxed">
                  Converts simple speech into structured criteria. Evaluates land size, notified crop, and location against deterministic rules. Pinpoints the exact missing document.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#BBF7D0] text-xs font-bold text-[#166534]">
                100% Explainable & Rule-Audited
              </div>
            </div>

            {/* Step 3: Clear Outcome */}
            <div className="p-6 rounded-2xl bg-[#F0FDF4] border border-[#86EFAC] flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-[#DCFCE7] text-[#15803D] flex items-center justify-center font-bold mb-4">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <span className="text-xs uppercase font-bold text-[#15803D] tracking-wider">
                  The Outcome
                </span>
                <h3 className="font-display font-bold text-lg text-[#111827] mt-1 mb-2">
                  Personalized Pathway
                </h3>
                <p className="text-xs sm:text-sm text-[#4B5563] leading-relaxed">
                  A 6-step roadmap with exact contacts: from where to get the missing Bank Passbook seal to the Village AAO inspection and direct benefit transfer.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#86EFAC]/60 text-xs font-bold text-[#15803D]">
                Result: From confusion to actionable claim
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. FOUR CORE PILLARS OF INNOVATION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs uppercase tracking-wider font-bold text-[#1B4D2E]">
            Built For Real Hackathon Criteria
          </span>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-[#111827] mt-2">
            Why Valam Breaks the Last-Mile Gap
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Pillar 1: Deterministic Rule Engine */}
          <div className="p-6 rounded-2xl bg-white border border-[#E5E7EB] shadow-xs">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#EAF5EC] text-[#1B4D2E] flex items-center justify-center font-bold">
                <Scale className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display font-bold text-lg text-[#111827]">
                  1. Zero Black-Box Decisions
                </h3>
                <span className="text-xs text-[#6B7280]">
                  30% Weight: Eligibility Matching Accuracy
                </span>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-[#4B5563] leading-relaxed mb-4">
              We never use an LLM as the final authority on eligibility. Valam's deterministic rule engine compares the farmer's landholding, notified crop, and location against statutory gazettes. Every decision lists the exact passed and failed conditions.
            </p>
            <div className="bg-[#F9FAFB] p-3 rounded-lg border border-[#E5E7EB] text-xs font-mono text-[#374151]">
              ✓ Location: Thanjavur (Operational Zone)<br />
              ✓ Crop: Rice (Supported)<br />
              ✓ Land: 2.4 acres (&lt; 2.5 acre Marginal Cap)<br />
              ⚠ Missing: Bank Passbook front page
            </div>
          </div>

          {/* Pillar 2: Missing Document Detection */}
          <div className="p-6 rounded-2xl bg-white border border-[#E5E7EB] shadow-xs">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#EAF5EC] text-[#1B4D2E] flex items-center justify-center font-bold">
                <FileCheck2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display font-bold text-lg text-[#111827]">
                  2. Document Readiness Engine
                </h3>
                <span className="text-xs text-[#6B7280]">
                  Eliminating the #1 reason for scheme rejection
                </span>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-[#4B5563] leading-relaxed mb-4">
              Most applications fail because farmers arrive at the counter without the correct rubber-stamped document. Valam checks your 6 available documents and provides concrete instructions on where and how to obtain the missing one in your village.
            </p>
            <div className="bg-[#F9FAFB] p-3 rounded-lg border border-[#E5E7EB] text-xs text-[#374151]">
              <span className="font-semibold text-[#111827]">How to obtain Bank Document:</span> Visit Canara Bank / PACCS branch with your passbook. Request account verification stamp with IFSC code.
            </div>
          </div>

          {/* Pillar 3: Feature Phone IVR Simulation */}
          <div className="p-6 rounded-2xl bg-white border border-[#E5E7EB] shadow-xs">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#EAF5EC] text-[#1B4D2E] flex items-center justify-center font-bold">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display font-bold text-lg text-[#111827]">
                  3. Button-Phone & USSD Simulation
                </h3>
                <span className="text-xs text-[#6B7280]">
                  20% Weight: Innovation & Originality
                </span>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-[#4B5563] leading-relaxed mb-4">
              Over 50% of marginal farmers rely on basic keypad devices without broadband or touchscreens. Valam includes a dedicated feature-phone simulator with realistic numeric keypad, audio IVR prompts in Tamil and English, and actionable SMS checklists.
            </p>
            <button
              onClick={() => onNavigate('phone-simulator')}
              className="text-xs font-bold text-[#1B4D2E] hover:underline flex items-center gap-1"
            >
              <span>Test the Phone Simulator in Browser →</span>
            </button>
          </div>

          {/* Pillar 4: Assisted Mode for CSC / FPO */}
          <div className="p-6 rounded-2xl bg-white border border-[#E5E7EB] shadow-xs">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#EAF5EC] text-[#1B4D2E] flex items-center justify-center font-bold">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display font-bold text-lg text-[#111827]">
                  4. Assisted Mode for Extension Workers
                </h3>
                <span className="text-xs text-[#6B7280]">
                  Equipping CSCs, VLEs, and FPO village agents
                </span>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-[#4B5563] leading-relaxed mb-4">
              Volunteers and CSC operators can run high-speed intakes for farmers who cannot use digital devices. Instantly generate printable "Farmer Assistance Dockets" with unique tracking tokens and clear checklist items.
            </p>
            <button
              onClick={() => onNavigate('assisted-mode')}
              className="text-xs font-bold text-[#1B4D2E] hover:underline flex items-center gap-1"
            >
              <span>Open Assisted Mode Portal →</span>
            </button>
          </div>
        </div>
      </section>

      {/* 4. REAL-WORLD DEMO SCENARIOS */}
      <section className="bg-white py-16 border-t border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <span className="text-xs uppercase tracking-wider font-bold text-[#1B4D2E]">
                Demo-First Design
              </span>
              <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-[#111827] mt-1">
                Explore Pre-Built Farmer Scenarios
              </h2>
              <p className="text-xs sm:text-sm text-[#6B7280] mt-1">
                Every scenario exercises different logical branches of the Valam engine.
              </p>
            </div>
            <button
              onClick={() => onNavigate('navigator')}
              className="px-4 py-2 text-xs font-semibold text-white bg-[#1B4D2E] hover:bg-[#143B23] rounded-lg transition-colors shrink-0"
            >
              {isTa ? 'வழிகாட்டியைத் தொடங்குக' : 'Open Need Navigator'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Scenario A */}
            <div className="p-5 rounded-xl border border-[#E5E7EB] bg-[#FAFAFA] flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300">
                  Scenario A
                </span>
                <h4 className="font-display font-bold text-base text-[#111827] mt-2 mb-1">
                  Ravi Kumar (2.4 Acres)
                </h4>
                <div className="text-xs text-[#6B7280] mb-3">
                  Thanjavur · Rice · Needs Irrigation Support
                </div>
                <p className="text-xs text-[#4B5563] leading-relaxed">
                  Eligible for PMKSY 100% drip subsidy, but missing bank passbook copy. Valam identifies the gap and generates a pathway to secure the bank verification stamp.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-[#E5E7EB] text-xs font-semibold text-amber-800">
                Outcome: Potentially Eligible (1 Doc Missing)
              </div>
            </div>

            {/* Scenario B */}
            <div className="p-5 rounded-xl border border-[#E5E7EB] bg-[#FAFAFA] flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 border border-emerald-300">
                  Scenario B
                </span>
                <h4 className="font-display font-bold text-base text-[#111827] mt-2 mb-1">
                  Meenakshi Sundaram (3.5 Acres)
                </h4>
                <div className="text-xs text-[#6B7280] mb-3">
                  Madurai · Cotton · Needs Crop Insurance
                </div>
                <p className="text-xs text-[#4B5563] leading-relaxed">
                  Has all 6 documents ready including Adangal and Small Farmer certificate. Directly eligible for PMFBY crop insurance enrollment with immediate submission links.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-[#E5E7EB] text-xs font-semibold text-emerald-800">
                Outcome: 100% Eligible & Ready to Submit
              </div>
            </div>

            {/* Scenario C */}
            <div className="p-5 rounded-xl border border-[#E5E7EB] bg-[#FAFAFA] flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-900 border border-rose-300">
                  Scenario C
                </span>
                <h4 className="font-display font-bold text-base text-[#111827] mt-2 mb-1">
                  Anand Verma (14.0 Acres)
                </h4>
                <div className="text-xs text-[#6B7280] mb-3">
                  Dharmapuri · Sugarcane · Large Farmer
                </div>
                <p className="text-xs text-[#4B5563] leading-relaxed">
                  Exceeds the 12.5-acre cap for small-farmer preferential drip subsidy. Valam explains the disqualifier clearly and redirects to general NABARD / AIF mechanization loans.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-[#E5E7EB] text-xs font-semibold text-rose-800">
                Outcome: Explainable Disqualification + Alternative
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. CALL TO ACTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="p-8 sm:p-12 rounded-3xl bg-[#183822] text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl">
          <div className="max-w-xl">
            <span className="text-xs uppercase font-bold tracking-wider text-[#A7F3D0]">
              Ready for Live Evaluation
            </span>
            <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-white mt-1 mb-3">
              Describe your farm problem. Let Valam find your path.
            </h2>
            <p className="text-xs sm:text-sm text-[#D1FAE5] leading-relaxed">
              Experience the end-to-end flow: from natural language question answering to rule-based criteria match and vertical pathway docket.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => onNavigate('navigator')}
              className="px-6 py-3 text-xs sm:text-sm font-bold text-[#14381E] bg-[#86EFAC] hover:bg-[#6EE7B7] rounded-xl transition-all shadow-md cursor-pointer"
            >
              {isTa ? 'வழிகாட்டியைத் தொடங்குக' : 'Launch Need Navigator'}
            </button>
            <button
              onClick={() => onNavigate('phone-simulator')}
              className="px-5 py-3 text-xs sm:text-sm font-semibold text-white bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl transition-colors cursor-pointer"
            >
              {isTa ? 'போன் சிமுலேட்டர்' : 'Phone Simulator'}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
