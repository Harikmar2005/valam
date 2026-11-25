import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Navbar } from '../Navbar';
import { FarmerSelectorModal } from '../FarmerSelectorModal';
import { CreateFarmerModal } from '../CreateFarmerModal';
import { EligibilityExplanationCard } from '../EligibilityExplanationCard';
import { DocumentUnlockAdvisory } from '../DocumentUnlockAdvisory';
import { NavigatorPage } from '../../pages/NavigatorPage';
import { DEMO_FARMERS, SUPPORT_PROGRAMS } from '../../data/mockData';
import { checkEligibility } from '../../services/eligibilityEngine';
import { api } from '../../services/api';

const ravi = DEMO_FARMERS[0];
const anand = DEMO_FARMERS[2];
const selvaraj = DEMO_FARMERS[3];
const pmksy = SUPPORT_PROGRAMS[0];

describe('Navbar component', () => {
  it('renders navigation tabs, switches language, and opens farmer modal', async () => {
    const user = userEvent.setup();
    const setCurrentTab = vi.fn();
    const setLanguage = vi.fn();
    const onOpenFarmerModal = vi.fn();
    const onOpenCreateModal = vi.fn();

    render(
      <Navbar
        currentTab="landing"
        setCurrentTab={setCurrentTab}
        language="en"
        setLanguage={setLanguage}
        activeFarmer={ravi}
        onOpenFarmerModal={onOpenFarmerModal}
        onOpenCreateModal={onOpenCreateModal}
      />
    );

    await user.click(screen.getByRole('button', { name: /need navigator/i }));
    expect(setCurrentTab).toHaveBeenCalledWith('navigator');

    await user.click(screen.getByRole('button', { name: /தமிழ்/i }));
    expect(setLanguage).toHaveBeenCalledWith('ta');

    await user.click(screen.getByRole('button', { name: /switch demo scenario/i }));
    expect(onOpenFarmerModal).toHaveBeenCalledTimes(1);
  });
});

describe('FarmerSelectorModal component', () => {
  it('renders custom + demo farmers, selects a scenario, and closes on Escape', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const onSelectFarmer = vi.fn();
    const onOpenCreateModal = vi.fn();

    render(
      <FarmerSelectorModal
        isOpen={true}
        onClose={onClose}
        activeFarmer={ravi}
        farmers={DEMO_FARMERS}
        onSelectFarmer={onSelectFarmer}
        onOpenCreateModal={onOpenCreateModal}
        language="en"
      />
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Meenakshi Sundaram/i }));
    expect(onSelectFarmer).toHaveBeenCalledWith(DEMO_FARMERS[1]);
    expect(onClose).toHaveBeenCalled();

    await user.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledTimes(2);
  });
});

describe('CreateFarmerModal component', () => {
  it('validates required fields and saves a new farmer digital ID', async () => {
    const user = userEvent.setup();
    const saveSpy = vi.spyOn(api, 'saveFarmer').mockImplementation(async (farmer) => farmer);
    const onClose = vi.fn();
    const onFarmerCreated = vi.fn();

    render(
      <CreateFarmerModal
        isOpen={true}
        onClose={onClose}
        onFarmerCreated={onFarmerCreated}
        language="en"
      />
    );

    await user.type(screen.getByLabelText(/farmer full name/i), 'Karthik Subramanian');
    await user.click(screen.getByRole('button', { name: /create farmer id & proceed/i }));

    await waitFor(() => {
      expect(saveSpy).toHaveBeenCalled();
    });
    expect(onFarmerCreated).toHaveBeenCalled();
    expect(screen.getByText(/farmer user id created successfully/i)).toBeInTheDocument();

    saveSpy.mockRestore();
  });
});

describe('EligibilityExplanationCard & DocumentUnlockAdvisory', () => {
  it('renders criteria checks, fetches AI explanation, and triggers pathway callback', async () => {
    const user = userEvent.setup();
    const el = checkEligibility(anand, pmksy);
    const onGeneratePathway = vi.fn();
    const onSelectAlt = vi.fn();
    const explainSpy = vi.spyOn(api, 'explainIneligibility');

    render(
      <EligibilityExplanationCard
        eligibility={el}
        program={pmksy}
        language="en"
        farmer={anand}
        problemStatement="I want 100% drip irrigation subsidy"
        onGeneratePathway={onGeneratePathway}
        onSelectAlternativeProgram={onSelectAlt}
      />
    );

    expect(screen.getByText(/Not Currently Eligible/i)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /explain why with ai/i }));
    await waitFor(() => {
      expect(explainSpy).toHaveBeenCalledTimes(1);
      expect(screen.getByText(/Why This Application Is Not Eligible:/i)).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /generate personalized pathway/i }));
    expect(onGeneratePathway).toHaveBeenCalledTimes(1);

    explainSpy.mockRestore();
  });

  it('simulates adding a missing document in DocumentUnlockAdvisory', async () => {
    const user = userEvent.setup();
    const onUpdateDocs = vi.fn();
    const onSelectProgram = vi.fn();

    render(
      <DocumentUnlockAdvisory
        farmer={selvaraj}
        language="en"
        onUpdateFarmerDocs={onUpdateDocs}
        onSelectProgram={onSelectProgram}
      />
    );

    const simulateButtons = screen.getAllByRole('button', { name: /simulate adding this document/i });
    expect(simulateButtons.length).toBeGreaterThan(0);
    await user.click(simulateButtons[0]);
    expect(onUpdateDocs).toHaveBeenCalledTimes(1);
  });
});

describe('NavigatorPage interactive workflow', () => {
  it('evaluates Tamil query, shows missing Bank Passbook, and builds 6-step pathway', async () => {
    const user = userEvent.setup();
    const onUpdateFarmer = vi.fn();
    const onOpenFarmerModal = vi.fn();

    render(
      <NavigatorPage
        activeFarmer={ravi}
        language="en"
        onUpdateFarmer={onUpdateFarmer}
        onOpenFarmerModal={onOpenFarmerModal}
      />
    );

    const input = screen.getByLabelText(/describe your agricultural support need/i);
    await user.type(input, 'எனக்கு பாசன உதவி வேண்டும்');
    await user.click(screen.getByRole('button', { name: /find my path/i }));

    await waitFor(() => {
      expect(screen.getByText(/Extracted Need Profile/i)).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText(/Potentially Eligible/i)).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /generate personalized pathway/i }));
    await waitFor(() => {
      expect(screen.getByText(/Your Valam Support Pathway/i)).toBeInTheDocument();
    });
  });
});
