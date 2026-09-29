/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { FarmerSelectorModal } from './components/FarmerSelectorModal';
import { CreateFarmerModal } from './components/CreateFarmerModal';
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { NavigatorPage } from './pages/NavigatorPage';
import { PhoneSimulatorPage } from './pages/PhoneSimulatorPage';
import { AssistedModePage } from './pages/AssistedModePage';
import { ProgramsDirectoryPage } from './pages/ProgramsDirectoryPage';
import { ProfilePage } from './pages/ProfilePage';
import { LegalPage } from './pages/LegalPage';
import { DEMO_FARMERS, SUPPORT_PROGRAMS } from './data/mockData';
import { FarmerProfile, Language, SupportProgram } from './types';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('landing');
  const [language, setLanguage] = useState<Language>('en');
  const [activeFarmer, setActiveFarmer] = useState<FarmerProfile>(DEMO_FARMERS[0]);
  const [isFarmerModalOpen, setIsFarmerModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [presetProgram, setPresetProgram] = useState<SupportProgram | null>(null);

  // Sync title and language attribute
  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const handleSelectFarmer = (farmer: FarmerProfile) => {
    setActiveFarmer(farmer);
  };

  const handleUpdateFarmer = (updated: FarmerProfile) => {
    setActiveFarmer(updated);
  };

  const handleFarmerCreated = (newFarmer: FarmerProfile) => {
    setActiveFarmer(newFarmer);
  };

  const handleNavigateToNavigatorWithProgram = (program: SupportProgram) => {
    setPresetProgram(program);
    setCurrentTab('navigator');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FBFBFA] text-[#1E231F]">
      {/* Top Bar */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={(tab) => {
          setCurrentTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        language={language}
        setLanguage={setLanguage}
        activeFarmer={activeFarmer}
        onOpenFarmerModal={() => setIsFarmerModalOpen(true)}
        onOpenCreateModal={() => setIsCreateModalOpen(true)}
      />

      {/* Main View Area */}
      <main className="flex-1">
        {currentTab === 'landing' && (
          <LandingPage
            onNavigate={(tab) => {
              setCurrentTab(tab);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            language={language}
          />
        )}

        {currentTab === 'dashboard' && (
          <DashboardPage
            activeFarmer={activeFarmer}
            language={language}
            onNavigate={(tab) => {
              setCurrentTab(tab);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
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
            onBack={() => setCurrentTab('landing')}
          />
        )}

        {currentTab === 'terms' && (
          <LegalPage
            type="terms"
            language={language}
            onBack={() => setCurrentTab('landing')}
          />
        )}
      </main>

      {/* Global Farmer Selector Modal */}
      <FarmerSelectorModal
        isOpen={isFarmerModalOpen}
        onClose={() => setIsFarmerModalOpen(false)}
        activeFarmer={activeFarmer}
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
      <Footer
        language={language}
        onNavigate={(tab) => {
          setCurrentTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />
    </div>
  );
}
