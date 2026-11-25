import React from 'react';
import { Sprout, Phone, Users, ShieldCheck, Compass, LayoutDashboard, UserPlus } from 'lucide-react';
import { FarmerProfile, Language } from '../types';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  activeFarmer: FarmerProfile;
  onOpenFarmerModal: () => void;
  onOpenCreateModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  language,
  setLanguage,
  activeFarmer,
  onOpenFarmerModal,
  onOpenCreateModal
}) => {
  const isTa = language === 'ta';

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E5E7EB] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Zone 1: Single text wordmark */}
        <button
          type="button"
          onClick={() => setCurrentTab('landing')}
          aria-label={isTa ? 'வளம் முகப்பு' : 'VALAM Home'}
          className="flex items-center gap-2 group text-left focus-visible:outline-2 focus-visible:outline-[#1B4D2E] focus-visible:outline-offset-2 rounded-lg cursor-pointer"
        >
          <div className="w-8 h-8 rounded-lg bg-[#1B4D2E] flex items-center justify-center text-white shadow-sm group-hover:bg-[#143B23] transition-colors">
            <Sprout className="w-5 h-5 text-[#86EFAC]" aria-hidden="true" />
          </div>
          <div className="flex flex-col">
            <span className="font-display font-extrabold text-xl tracking-tight text-[#111827]">
              {isTa ? 'வளம்' : 'VALAM'}
            </span>
          </div>
        </button>

        {/* Zone 2: 4-6 clean text navigation links */}
        <nav aria-label={isTa ? 'முதன்மை வழிசெலுத்தல்' : 'Primary navigation'} className="hidden md:flex items-center gap-6 text-sm font-medium text-[#4B5563]">
          <button
            type="button"
            onClick={() => setCurrentTab('dashboard')}
            aria-current={currentTab === 'dashboard' ? 'page' : undefined}
            className={`transition-colors flex items-center gap-1.5 py-1 cursor-pointer ${
              currentTab === 'dashboard'
                ? 'text-[#1B4D2E] font-semibold border-b-2 border-[#1B4D2E]'
                : 'hover:text-[#111827]'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" aria-hidden="true" />
            <span>{isTa ? 'முதன்மை பக்கம்' : 'Dashboard'}</span>
          </button>

          <button
            type="button"
            onClick={() => setCurrentTab('navigator')}
            aria-current={currentTab === 'navigator' ? 'page' : undefined}
            className={`transition-colors flex items-center gap-1.5 py-1 cursor-pointer ${
              currentTab === 'navigator'
                ? 'text-[#1B4D2E] font-semibold border-b-2 border-[#1B4D2E]'
                : 'hover:text-[#111827]'
            }`}
          >
            <Compass className="w-4 h-4" aria-hidden="true" />
            <span>{isTa ? 'தேவை வழிகாட்டி' : 'Need Navigator'}</span>
          </button>

          <button
            type="button"
            onClick={() => setCurrentTab('programs')}
            aria-current={currentTab === 'programs' ? 'page' : undefined}
            className={`transition-colors flex items-center gap-1.5 py-1 cursor-pointer ${
              currentTab === 'programs'
                ? 'text-[#1B4D2E] font-semibold border-b-2 border-[#1B4D2E]'
                : 'hover:text-[#111827]'
            }`}
          >
            <ShieldCheck className="w-4 h-4" aria-hidden="true" />
            <span>{isTa ? 'அரசு திட்டங்கள்' : 'Support Programs'}</span>
          </button>

          <button
            type="button"
            onClick={() => setCurrentTab('phone-simulator')}
            aria-current={currentTab === 'phone-simulator' ? 'page' : undefined}
            className={`transition-colors flex items-center gap-1.5 py-1 cursor-pointer ${
              currentTab === 'phone-simulator'
                ? 'text-[#1B4D2E] font-semibold border-b-2 border-[#1B4D2E]'
                : 'hover:text-[#111827]'
            }`}
          >
            <Phone className="w-4 h-4" aria-hidden="true" />
            <span>{isTa ? 'போன் சிமுலேட்டர்' : 'Phone Simulator'}</span>
          </button>

          <button
            type="button"
            onClick={() => setCurrentTab('assisted-mode')}
            aria-current={currentTab === 'assisted-mode' ? 'page' : undefined}
            className={`transition-colors flex items-center gap-1.5 py-1 cursor-pointer ${
              currentTab === 'assisted-mode'
                ? 'text-[#1B4D2E] font-semibold border-b-2 border-[#1B4D2E]'
                : 'hover:text-[#111827]'
            }`}
          >
            <Users className="w-4 h-4" aria-hidden="true" />
            <span>{isTa ? 'உதவி மையம்' : 'Assisted Mode'}</span>
          </button>
        </nav>

        {/* Zone 3: Actions & Language Toggle */}
        <div className="flex items-center gap-3">
          {/* Language Selector */}
          <div
            role="group"
            aria-label={isTa ? 'மொழி தேர்வு' : 'Language selector'}
            className="flex items-center bg-[#F3F4F6] rounded-lg p-0.5 border border-[#E5E7EB]"
          >
            <button
              type="button"
              onClick={() => setLanguage('en')}
              aria-pressed={language === 'en'}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                language === 'en'
                  ? 'bg-white text-[#111827] shadow-xs'
                  : 'text-[#4B5563] hover:text-[#111827]'
              }`}
              title="English"
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => setLanguage('ta')}
              aria-pressed={language === 'ta'}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                language === 'ta'
                  ? 'bg-white text-[#111827] shadow-xs'
                  : 'text-[#4B5563] hover:text-[#111827]'
              }`}
              title="தமிழ்"
            >
              தமிழ்
            </button>
          </div>

          {/* Active Farmer Indicator / Switcher */}
          <button
            type="button"
            onClick={onOpenFarmerModal}
            aria-label={isTa ? `செயலில் உள்ள விவசாயி: ${activeFarmer.name}. மாற்ற கிளிக் செய்யவும்` : `Active farmer: ${activeFarmer.name}. Switch demo scenario`}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-[#1E293B] bg-[#F8FAFC] hover:bg-[#F1F5F9] border border-[#CBD5E1] rounded-lg transition-colors cursor-pointer"
            title="Switch demo farmer profile"
          >
            <span className="w-2 h-2 rounded-full bg-[#10B981]" aria-hidden="true" />
            <span className="font-semibold text-[#0F172A]">{activeFarmer.name}</span>
            <span className="text-[#475569] hidden sm:inline">({activeFarmer.district})</span>
          </button>

          {/* Create User ID Button */}
          <button
            type="button"
            onClick={onOpenCreateModal}
            aria-label={isTa ? 'புதிய விவசாயி ஐடி உருவாக்குக' : 'Create new farmer user ID'}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#1B4D2E] bg-[#EAF5EC] hover:bg-[#D7EEDD] border border-[#C2E5CA] rounded-lg transition-colors cursor-pointer"
            title="Create a new farmer user ID"
          >
            <UserPlus className="w-3.5 h-3.5" aria-hidden="true" />
            <span className="hidden sm:inline">{isTa ? '+ புதிய ஐடி' : '+ Create ID'}</span>
          </button>

          {/* Primary Action Button */}
          <button
            type="button"
            onClick={() => setCurrentTab('navigator')}
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-[#1B4D2E] hover:bg-[#143B23] rounded-lg transition-all shadow-xs cursor-pointer"
          >
            <span>{isTa ? 'தொடங்குக' : 'Start Navigator'}</span>
          </button>
        </div>
      </div>

      {/* Mobile Navigation Strip */}
      <nav aria-label={isTa ? 'மொபைல் வழிசெலுத்தல்' : 'Mobile navigation'} className="md:hidden flex items-center justify-between px-4 py-2 border-t border-[#E5E7EB] bg-[#FAFAFA] text-xs font-medium text-[#4B5563] overflow-x-auto gap-4">
        <button
          type="button"
          onClick={() => setCurrentTab('dashboard')}
          aria-current={currentTab === 'dashboard' ? 'page' : undefined}
          className={`shrink-0 py-1 ${currentTab === 'dashboard' ? 'text-[#1B4D2E] font-bold' : ''}`}
        >
          {isTa ? 'முகப்பு' : 'Dashboard'}
        </button>
        <button
          type="button"
          onClick={() => setCurrentTab('navigator')}
          aria-current={currentTab === 'navigator' ? 'page' : undefined}
          className={`shrink-0 py-1 ${currentTab === 'navigator' ? 'text-[#1B4D2E] font-bold' : ''}`}
        >
          {isTa ? 'வழிகாட்டி' : 'Navigator'}
        </button>
        <button
          type="button"
          onClick={() => setCurrentTab('programs')}
          aria-current={currentTab === 'programs' ? 'page' : undefined}
          className={`shrink-0 py-1 ${currentTab === 'programs' ? 'text-[#1B4D2E] font-bold' : ''}`}
        >
          {isTa ? 'திட்டங்கள்' : 'Programs'}
        </button>
        <button
          type="button"
          onClick={() => setCurrentTab('phone-simulator')}
          aria-current={currentTab === 'phone-simulator' ? 'page' : undefined}
          className={`shrink-0 py-1 ${currentTab === 'phone-simulator' ? 'text-[#1B4D2E] font-bold' : ''}`}
        >
          {isTa ? 'சிமுலேட்டர்' : 'Phone'}
        </button>
        <button
          type="button"
          onClick={() => setCurrentTab('assisted-mode')}
          aria-current={currentTab === 'assisted-mode' ? 'page' : undefined}
          className={`shrink-0 py-1 ${currentTab === 'assisted-mode' ? 'text-[#1B4D2E] font-bold' : ''}`}
        >
          {isTa ? 'உதவி மையம்' : 'Assisted'}
        </button>
      </nav>
    </header>
  );
};
