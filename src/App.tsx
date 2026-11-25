/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Suspense, lazy, useEffect, useState } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { FarmerSelectorModal } from './components/FarmerSelectorModal';
import { CreateFarmerModal } from './components/CreateFarmerModal';
import { LandingPage } from './pages/LandingPage';
import { DEMO_FARMERS } from './data/mockData';
import { api } from './services/api';
import { FarmerProfile, Language, SupportProgram } from './types';

const DashboardPage = lazy(() =>
  import('./pages/DashboardPage').then((m) => ({ default: m.DashboardPage }))
);
const NavigatorPage = lazy(() =>
  import('./pages/NavigatorPage').then((m) => ({ default: m.NavigatorPage }))
);
const PhoneSimulatorPage = lazy(() =>
  import('./pages/PhoneSimulatorPage').then((m) => ({ default: m.PhoneSimulatorPage }))
);
const AssistedModePage = lazy(() =>
  import('./pages/AssistedModePage').then((m) => ({ default: m.AssistedModePage }))
);
const ProgramsDirectoryPage = lazy(() =>
  import('./pages/ProgramsDirectoryPage').then((m) => ({ default: m.ProgramsDirectoryPage }))
);
const ProfilePage = lazy(() =>
  import('./pages/ProfilePage').then((m) => ({ default: m.ProfilePage }))
);
const LegalPage = lazy(() =>
  import('./pages/LegalPage').then((m) => ({ default: m.LegalPage }))
);

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('landing');
  const [language, setLanguage] = useState<Language>('en');
  const [farmers, setFarmers] = useState<FarmerProfile[]>(DEMO_FARMERS);
  const [activeFarmer, setActiveFarmer] = useState<FarmerProfile>(DEMO_FARMERS[0]);
  const [isFarmerModalOpen, setIsFarmerModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [presetProgram, setPresetProgram] = useState<SupportProgram | null>(null);

  // Sync HTML lang attribute
  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  // Hydrate farmer registry from backend on initial mount
  useEffect(() => {
    let active = true;
    api
      .getFarmers()
      .then((loaded) => {
        if (active && Array.isArray(loaded) && loaded.length > 0) {
          setFarmers(loaded);
        }
      })
      .catch(() => {
        // Fallback already initialized with DEMO_FARMERS
      });
    return () => {
      active = false;
    };
  }, []);

  const navigateToTab = (tab: string) => {
    setCurrentTab(tab);
    if (typeof window !== 'undefined' && typeof window.scrollTo === 'function') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSelectFarmer = (farmer: FarmerProfile) => {
    setActiveFarmer(farmer);
  };

  const handleUpdateFarmer = (updated: FarmerProfile) => {
    setActiveFarmer(updated);
    setFarmers((prev) => {
      const idx = prev.findIndex((f) => f.id === updated.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = updated;
        return next;
      }
      return [...prev, updated];
    });
    void api.saveFarmer(updated).catch(() => {
      // Keep optimistic state if backend rejects or is offline
    });
  };

  const handleFarmerCreated = (newFarmer: FarmerProfile) => {
    setActiveFarmer(newFarmer);
    setFarmers((prev) => {
      const idx = prev.findIndex((f) => f.id === newFarmer.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = newFarmer;
        return next;
      }
      return [...prev, newFarmer];
    });
  };

  const handleNavigateToNavigatorWithProgram = (program: SupportProgram) => {
    setPresetProgram(program);
    navigateToTab('navigator');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FBFBFA] text-[#1E231F]">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-[#1B4D2E] focus:text-white focus:rounded-lg focus:text-xs focus:font-bold"
      >
        {language === 'ta' ? 'முதன்மை உள்ளடக்கத்திற்குச் செல்க' : 'Skip to main content'}
      </a>

      {/* Top Bar */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={navigateToTab}
        language={language}
        setLanguage={setLanguage}
        activeFarmer={activeFarmer}
        onOpenFarmerModal={() => setIsFarmerModalOpen(true)}
        onOpenCreateModal={() => setIsCreateModalOpen(true)}
      />

      {/* Main View Area */}
      <main id="main-content" className="flex-1" tabIndex={-1}>
        <Suspense
          fallback={
            <div className="max-w-7xl mx-auto px-4 py-12 text-center text-xs font-semibold text-[#4B5563]">
              {language === 'ta' ? 'ஏற்றுகிறது...' : 'Loading view...'}
            </div>
          }
        >
          {currentTab === 'landing' && (
            <LandingPage onNavigate={navigateToTab} language={language} />
          )}

          {currentTab === 'dashboard' && (
            <DashboardPage
              activeFarmer={activeFarmer}
              language={language}
              onNavigate={navigateToTab}
              onOpenFarmerModal={() => setIsFarmerModalOpen(true)}
              onOpenCreateModal={() => setIsCreateModalOpen(true)}
              onSelectProgramForPathway={handleNavigateToNavigatorWithProgram}
              onUpdateFarmerDocs={handleUpdateFarmer}
            />
          )}

          {currentTab === 'navigator' && (
            <NavigatorPage
              activeFarmer={activeFarmer}
              language={language}
              onUpdateFarmer={handleUpdateFarmer}
              onOpenFarmerModal={() => setIsFarmerModalOpen(true)}
              presetProgram={presetProgram}
              onClearPresetProgram={() => setPresetProgram(null)}
            />
          )}

          {currentTab === 'programs' && (
            <ProgramsDirectoryPage
              activeFarmer={activeFarmer}
              language={language}
              onNavigateToNavigatorWithProgram={handleNavigateToNavigatorWithProgram}
              onUpdateFarmerDocs={handleUpdateFarmer}
            />
          )}

          {currentTab === 'phone-simulator' && (
            <PhoneSimulatorPage language={language} />
          )}

          {currentTab === 'assisted-mode' && (
            <AssistedModePage
              language={language}
              farmers={farmers}
              onOpenCreateModal={() => setIsCreateModalOpen(true)}
            />
          )}

          {currentTab === 'profile' && (
            <ProfilePage
              activeFarmer={activeFarmer}
              language={language}
              onSaveFarmer={handleUpdateFarmer}
              onOpenCreateModal={() => setIsCreateModalOpen(true)}
            />
          )}

          {currentTab === 'privacy' && (
            <LegalPage
              type="privacy"
              language={language}
              onBack={() => navigateToTab('landing')}
            />
          )}

          {currentTab === 'terms' && (
            <LegalPage
              type="terms"
              language={language}
              onBack={() => navigateToTab('landing')}
            />
          )}
        </Suspense>
      </main>

      {/* Global Farmer Selector Modal */}
      <FarmerSelectorModal
        isOpen={isFarmerModalOpen}
        onClose={() => setIsFarmerModalOpen(false)}
        activeFarmer={activeFarmer}
        farmers={farmers}
        onSelectFarmer={handleSelectFarmer}
        onOpenCreateModal={() => {
          setIsFarmerModalOpen(false);
          setIsCreateModalOpen(true);
        }}
        language={language}
      />

      {/* Global Create Farmer User ID Modal */}
      <CreateFarmerModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onFarmerCreated={handleFarmerCreated}
        language={language}
      />

      {/* Civic Tech Footer */}
      <Footer language={language} onNavigate={navigateToTab} />
    </div>
  );
}
