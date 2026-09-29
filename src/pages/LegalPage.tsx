import React from 'react';
import { Lock, FileText, ShieldAlert, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Language } from '../types';

interface LegalPageProps {
  type: 'privacy' | 'terms';
  language: Language;
  onBack: () => void;
}

export const LegalPage: React.FC<LegalPageProps> = ({ type, language, onBack }) => {
  const isTa = language === 'ta';
  const isPrivacy = type === 'privacy';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-xs font-semibold text-[#1B4D2E] hover:underline cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>{isTa ? 'பின்செல்க' : 'Back to App'}</span>
      </button>

      <div className="bg-white p-8 rounded-2xl border border-[#E5E7EB] shadow-xs space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-[#E5E7EB]">
          <div className="w-10 h-10 rounded-xl bg-[#EAF5EC] text-[#1B4D2E] flex items-center justify-center font-bold">
            {isPrivacy ? <Lock className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
          </div>
          <div>
            <h1 className="font-display font-extrabold text-2xl text-[#111827]">
              {isPrivacy
                ? isTa ? 'தனியுரிமைக் கொள்கை' : 'Valam Privacy & Data Governance Notice'
                : isTa ? 'பயன்பாட்டு விதிமுறைகள்' : 'Terms of Service & Civic Disclaimer'}
            </h1>
            <p className="text-xs text-[#6B7280]">
              Last updated: September 2026 · Built for Track 1 · Problem 4
            </p>
          </div>
        </div>

        {/* Civic Disclaimer Callout */}
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-950 flex items-start gap-3 leading-relaxed">
          <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Important Civic Disclaimer: </span>
            "Eligibility shown by Valam is a preliminary assessment based on the information provided and notified statutory scheme criteria. Always verify requirements with the relevant official authority before making financial or agricultural commitments."
          </div>
        </div>

        {isPrivacy ? (
          <div className="space-y-4 text-xs sm:text-sm text-[#4B5563] leading-relaxed">
            <h3 className="font-bold text-[#111827] text-base">1. Data Minimization Principle</h3>
            <p>
              Valam is built upon the principle of strict data minimization. We do not collect unnecessary sensitive personally identifiable information (PII). We do not store complete bank account numbers, biometric details, or Aadhaar credentials in our database.
            </p>

            <h3 className="font-bold text-[#111827] text-base">2. Purpose of Processing</h3>
            <p>
              Any landholding, crop category, district, and document status inputs provided by farmers or extension operators are processed strictly for the purpose of matching agricultural support schemes and generating personalized readiness pathways.
            </p>

            <h3 className="font-bold text-[#111827] text-base">3. Client-Side & Local Processing</h3>
            <p>
              Demonstration farmer profiles are simulated within local and server-side session stores. No farmer data is sold, monetized, or shared with commercial marketing agencies.
            </p>
          </div>
        ) : (
          <div className="space-y-4 text-xs sm:text-sm text-[#4B5563] leading-relaxed">
            <h3 className="font-bold text-[#111827] text-base">1. Nature of the Service</h3>
            <p>
              Valam ("The Last-Mile Farmer Support Navigator") is an open civic-technology prototype designed to address information fragmentation in public agricultural support delivery. Valam does not guarantee sanction, disbursement, or statutory eligibility for any government subsidy.
            </p>

            <h3 className="font-bold text-[#111827] text-base">2. Statutory Final Authority</h3>
            <p>
              Official departments (such as the Department of Agriculture, Horticulture, TEDA, and commercial lending institutions) remain the sole authorized bodies for approving schemes and disbursing benefits.
            </p>

            <h3 className="font-bold text-[#111827] text-base">3. Feature Phone Simulation</h3>
            <p>
              The phone simulator available at <code>/phone-simulator</code> is an in-browser prototype simulating IVR and USSD interactions for demonstration purposes. It does not initiate real telecommunications carrier calls or incur operator charges.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
