import React from 'react';
import { Sprout, ShieldAlert, FileText, Lock, ExternalLink } from 'lucide-react';
import { Language } from '../types';

interface FooterProps {
  language: Language;
  onNavigate: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ language, onNavigate }) => {
  const isTa = language === 'ta';

  return (
    <footer className="bg-[#18231C] text-[#D1D5DB] border-t border-[#2D3748] mt-20 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Col 1: Wordmark & Proposition */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-md bg-[#2E7D46] flex items-center justify-center text-white">
                <Sprout className="w-4 h-4 text-[#86EFAC]" />
              </div>
              <span className="font-display font-bold text-lg text-white tracking-tight">
                {isTa ? 'வளம்' : 'VALAM'}
              </span>
            </div>
            <p className="text-sm text-[#9CA3AF] max-w-md leading-relaxed mb-4">
              {isTa
                ? 'விவசாயிகளுக்கான கடைசி மைல் தகவல் இடைவெளியை நீக்கும் மக்கள் தொழில்நுட்ப தீர்வு. சிக்கலான அரசு விதிகளை எளிய தனிப்பயன் பாதையாக மாற்றுகிறது.'
                : 'The Last-Mile Farmer Support Navigator. Built for Track 1 · Problem 4. Eliminating fragmented information so eligible farmers access their rightful subsidies and safety nets.'}
            </p>
            <div className="flex items-center gap-4 text-xs text-[#9CA3AF]">
              <span>Tamil Nadu & All India Rules</span>
              <span aria-hidden="true">·</span>
              <span>Deterministic Rule Engine</span>
              <span aria-hidden="true">·</span>
              <span>Open Civic Prototype</span>
            </div>
          </div>

          {/* Col 2: Navigation Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">
              {isTa ? 'வழிகாட்டி பிரிவுகள்' : 'Navigation'}
            </h4>
            <ul className="space-y-2 text-sm text-[#9CA3AF]">
              <li>
                <button
                  onClick={() => onNavigate('dashboard')}
                  className="hover:text-white transition-colors"
                >
                  {isTa ? 'முதன்மை பக்கம்' : 'Farmer Dashboard'}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('navigator')}
                  className="hover:text-white transition-colors"
                >
                  {isTa ? 'தேவை வழிகாட்டி' : 'Need Navigator'}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('programs')}
                  className="hover:text-white transition-colors"
                >
                  {isTa ? 'திட்டங்களின் பட்டியல்' : 'Supported Schemes'}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('phone-simulator')}
                  className="hover:text-white transition-colors"
                >
                  {isTa ? 'பட்டன் போன் சிமுலேட்டர்' : 'Feature Phone Simulator'}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('assisted-mode')}
                  className="hover:text-white transition-colors"
                >
                  {isTa ? 'CSC உதவி மையம்' : 'Assisted Mode (CSC / FPO)'}
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Legal & Governance */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">
              {isTa ? 'சட்டப்பூர்வ வழிகாட்டுதல்' : 'Legal & Trust'}
            </h4>
            <ul className="space-y-2 text-sm text-[#9CA3AF]">
              <li>
                <button
                  onClick={() => onNavigate('privacy')}
                  className="hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>{isTa ? 'தனியுரிமைக் கொள்கை' : 'Privacy Notice'}</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('terms')}
                  className="hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>{isTa ? 'பயன்பாட்டு விதிமுறைகள்' : 'Terms of Use'}</span>
                </button>
              </li>
              <li className="pt-2">
                <a
                  href="https://agricoop.nic.in"
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-[#9CA3AF] hover:text-white transition-colors flex items-center gap-1"
                >
                  <span>Ministry of Agriculture</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Civic Disclaimer Banner */}
        <div className="p-4 rounded-lg bg-[#222E26] border border-[#2D3E33] flex items-start gap-3 text-xs text-[#A1A1AA] leading-relaxed mb-8">
          <ShieldAlert className="w-5 h-5 text-[#F59E0B] shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-white">Civic Prototype Notice: </span>
            {isTa
              ? 'வளம் (Valam) ஒரு மாதிரி முன்மாதிரி அமைப்பு. இதில் காட்டப்படும் தகுதி மதிப்பீடுகள் அரசு விதிகளின்படி உருவாக்கப்பட்ட ஆரம்பநிலை வழிகாட்டுதல் மட்டுமே. இறுதி ஒப்புதல் மற்றும் நிதி உதவி சம்பந்தப்பட்ட அரசு துறைகளின் அதிகாரப்பூர்வ ஆய்வுக்கு உட்பட்டது.'
              : 'Valam is a civic-tech working prototype designed for Track 1 · Problem 4. Eligibility assessments provided by Valam are preliminary evaluations based on public scheme guidelines. Valam does not replace statutory administrative procedures. Always verify documentation with your Block Agricultural Extension Centre or competent revenue authority.'}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-[#2D3748] flex flex-col sm:flex-row items-center justify-between text-xs text-[#6B7280] gap-3">
          <div>
            © 2026 Valam Navigator. Designed for the Last-Mile Farmer Support Gap.
          </div>
          <div className="flex items-center gap-4">
            <span>Built with React + TypeScript</span>
            <span aria-hidden="true">·</span>
            <span>Deterministic Rule Engine</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
