import { expect, test } from '@playwright/test';

test.describe('VALAM Farmer Workflows E2E', () => {
  test('Workflow 1: Landing -> Need Navigator -> Tamil NLP Query -> Pathway generation', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Support should reach the farmer');

    await page.getByRole('button', { name: 'Find My Support' }).click();
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Describe your problem');

    const input = page.getByLabel('Describe your agricultural support need');
    await input.fill('எனக்கு பாசன உதவி வேண்டும்');
    await page.getByRole('button', { name: 'Find My Path' }).click();

    await expect(page.getByText('Extracted Need Profile:')).toBeVisible();
    await expect(page.getByText('Explainable Eligibility Analysis')).toBeVisible();

    await page.getByRole('button', { name: /Generate Personalized Pathway/i }).click();
    await expect(page.getByText('Your Valam Support Pathway')).toBeVisible();
  });

  test('Workflow 2: Tamil language toggle translates UI labels cleanly', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'தமிழ்' }).click();
    await expect(page.getByRole('heading', { level: 1 })).toContainText('அரசு உதவி விவசாயியைத் தேடி வர வேண்டும்');
  });

  test('Workflow 3: Support Programs -> Get Pathway opens Navigator for selected program', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Support Programs' }).click();
    await expect(page.getByText('Government Agricultural Support Directory')).toBeVisible();

    await page.getByPlaceholder('Search programs...').fill('PMFBY');
    await page.getByRole('button', { name: 'Get Pathway →' }).first().click();

    await expect(page.getByText('Explainable Eligibility Analysis')).toBeVisible();
    await expect(page.getByText(/Pradhan Mantri Fasal Bima Yojana/i).first()).toBeVisible();
  });

  test('Workflow 4: Create Custom Farmer ID persists in Selector & Dashboard', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Create new farmer user ID' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();

    await page.getByLabel(/Farmer Full Name/i).fill('Muthuvel Pandian');
    await page.getByRole('button', { name: /Create Farmer ID & Proceed/i }).click();
    await expect(page.getByText('Farmer User ID Created Successfully!')).toBeVisible();

    await page.getByRole('button', { name: 'Start with this Farmer ID' }).click();
    await page.getByRole('navigation', { name: 'Primary navigation' }).getByRole('button', { name: 'Dashboard', exact: true }).click();
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Welcome, Muthuvel Pandian');
  });

  test('Workflow 5: Feature Phone Simulator 1-Click Scenario dispatches SMS checklist', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('navigation', { name: 'Primary navigation' }).getByRole('button', { name: 'Phone Simulator', exact: true }).click();
    await expect(page.getByText('Feature Phone Keypad, IVR & USSD Simulator')).toBeVisible();

    await page.getByRole('button', { name: /Scenario 1: Marginal Paddy Farmer/i }).click();
    await expect(page.getByText('Sender: GOV-VALAM-TN')).toBeVisible({ timeout: 10000 });
  });

  test('Workflow 6: Assisted Mode generates printable Farmer Assistance Docket', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('navigation', { name: 'Primary navigation' }).getByRole('button', { name: 'Assisted Mode', exact: true }).click();
    await expect(page.getByText('Assisted Mode for Field Extension Workers')).toBeVisible();

    await page.getByRole('button', { name: 'Generate Official Docket' }).click();
    await expect(page.getByText('Official Farmer Assistance Docket')).toBeVisible();
    await expect(page.getByText('Next Action Checklist (Handout for Farmer)')).toBeVisible();
  });
});
