// @vitest-environment node
import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from '../app.js';

describe('Express API & Security Controls', () => {
  const app = createApp({ enableRateLimit: false });

  it('GET /api/health returns healthy status and helmet headers without x-powered-by', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok', service: 'valam-api' });
    expect(res.headers['x-powered-by']).toBeUndefined();
    expect(res.headers['x-content-type-options']).toBe('nosniff');
  });

  it('GET /api/farmers returns seeded demo farmers and GET /api/farmers/:id handles valid/invalid/404 IDs', async () => {
    const listRes = await request(app).get('/api/farmers');
    expect(listRes.status).toBe(200);
    expect(Array.isArray(listRes.body)).toBe(true);
    expect(listRes.body.length).toBeGreaterThanOrEqual(4);

    const singleRes = await request(app).get('/api/farmers/FARMER_001_RAVI');
    expect(singleRes.status).toBe(200);
    expect(singleRes.body.name).toBe('Ravi Kumar');

    const docsRes = await request(app).get('/api/farmers/FARMER_001_RAVI/documents');
    expect(docsRes.status).toBe(200);
    expect(docsRes.body.length).toBeGreaterThan(0);

    const notFoundRes = await request(app).get('/api/farmers/FARMER_999_MISSING');
    expect(notFoundRes.status).toBe(404);

    const badIdRes = await request(app).get('/api/farmers/bad$id!');
    expect(badIdRes.status).toBe(400);
  });

  it('POST /api/farmers creates a new farmer profile and rejects invalid payloads with 400', async () => {
    const invalidRes = await request(app)
      .post('/api/farmers')
      .send({ name: '', landSizeAcres: -5 });
    expect(invalidRes.status).toBe(400);
    expect(invalidRes.body.error).toContain('Invalid');

    const validRes = await request(app).post('/api/farmers').send({
      id: 'FARMER_TEST_01',
      name: 'Senthil Nathan',
      phone: '+91 98422 11223',
      state: 'Tamil Nadu',
      district: 'Thanjavur',
      taluk: 'Orathanadu',
      village: 'Pudur',
      landSizeAcres: 3.2,
      crop: 'Rice',
      category: 'Marginal (<2.5 acres)', // Should be normalized server-side to Small
      irrigationType: 'Borewell / Tube Well',
      hasBankAccount: true,
      hasAadhaarLinkedBank: true,
      documents: []
    });

    expect(validRes.status).toBe(201);
    expect(validRes.body.id).toBe('FARMER_TEST_01');
    expect(validRes.body.category).toBe('Small (2.5 - 5.0 acres)');
  });

  it('POST /api/needs/detect detects English/Tamil intent and rejects empty query', async () => {
    const emptyRes = await request(app).post('/api/needs/detect').send({ query: '' });
    expect(emptyRes.status).toBe(400);

    const tamilRes = await request(app)
      .post('/api/needs/detect')
      .send({ query: 'எனக்கு பாசன உதவி வேண்டும்' });
    expect(tamilRes.status).toBe(200);
    expect(tamilRes.body.detectedCategory).toBe('irrigation');
  });

  it('GET /api/support-programs filters by category and validates category query param', async () => {
    const allRes = await request(app).get('/api/support-programs');
    expect(allRes.status).toBe(200);
    expect(allRes.body).toHaveLength(10);

    const filteredRes = await request(app).get('/api/support-programs?category=insurance');
    expect(filteredRes.status).toBe(200);
    expect(filteredRes.body.every((p: { category: string }) => p.category === 'insurance')).toBe(true);

    const invalidCatRes = await request(app).get('/api/support-programs?category=unknown_cat');
    expect(invalidCatRes.status).toBe(400);

    const byIdRes = await request(app).get('/api/support-programs/PROG_PMKSY_DRIP');
    expect(byIdRes.status).toBe(200);
    expect(byIdRes.body.shortCode).toBe('PMKSY-MI');
  });

  it('POST /api/eligibility/check evaluates base profile and live parameter overrides', async () => {
    const baseRes = await request(app).post('/api/eligibility/check').send({
      farmerId: 'FARMER_001_RAVI',
      programId: 'PROG_PMKSY_DRIP'
    });
    expect(baseRes.status).toBe(200);
    expect(baseRes.body.status).toBe('potentially_eligible');

    // Override Ravi's land to 14 acres -> should become not_eligible
    const overrideRes = await request(app).post('/api/eligibility/check').send({
      farmerId: 'FARMER_001_RAVI',
      programId: 'PROG_PMKSY_DRIP',
      overrides: { landSizeAcres: 14 }
    });
    expect(overrideRes.status).toBe(200);
    expect(overrideRes.body.status).toBe('not_eligible');
  });

  it('POST /api/pathways/generate stores pathway and GET /api/pathways/:id retrieves it', async () => {
    const genRes = await request(app).post('/api/pathways/generate').send({
      farmerId: 'FARMER_002_MEENAKSHI',
      programId: 'PROG_PMFBY_INSURANCE'
    });
    expect(genRes.status).toBe(200);
    expect(genRes.body.steps).toHaveLength(6);

    const fetchRes = await request(app).get(`/api/pathways/${genRes.body.id}`);
    expect(fetchRes.status).toBe(200);
    expect(fetchRes.body.id).toBe(genRes.body.id);

    const missingPathway = await request(app).get('/api/pathways/PATHWAY_DOES_NOT_EXIST');
    expect(missingPathway.status).toBe(404);
  });

  it('POST /api/ai/explain-ineligibility returns structured bilingual root cause', async () => {
    const res = await request(app).post('/api/ai/explain-ineligibility').send({
      farmerId: 'FARMER_003_ANAND',
      programId: 'PROG_PMKSY_DRIP',
      problemStatement: 'I want 100% drip irrigation subsidy',
      language: 'en'
    });
    expect(res.status).toBe(200);
    expect(res.body.rootCause).toBeTruthy();
    expect(res.body.rootCauseTa).toBeTruthy();
    expect(Array.isArray(res.body.alternativePrograms)).toBe(true);
  });

  it('POST /api/phone/session & /api/phone/input process valid keypad digits and reject invalid digits', async () => {
    const sessRes = await request(app).post('/api/phone/session').send({
      callerNumber: '+91 94432 18901'
    });
    expect(sessRes.status).toBe(200);

    const stepRes = await request(app).post('/api/phone/input').send({
      sessionId: sessRes.body.sessionId,
      digit: '1',
      currentState: sessRes.body
    });
    expect(stepRes.status).toBe(200);
    expect(stepRes.body.language).toBe('ta');

    const badDigitRes = await request(app).post('/api/phone/input').send({
      sessionId: sessRes.body.sessionId,
      digit: '99',
      currentState: sessRes.body
    });
    expect(badDigitRes.status).toBe(400);
  });

  it('rejects untrusted CORS origins with 403 and handles malformed JSON cleanly', async () => {
    const corsBlocked = await request(app)
      .get('/api/farmers')
      .set('Origin', 'https://malicious-site.example');
    expect(corsBlocked.status).toBe(403);

    const corsAllowed = await request(app)
      .get('/api/farmers')
      .set('Origin', 'http://localhost:3000');
    expect(corsAllowed.status).toBe(200);
    expect(corsAllowed.headers['access-control-allow-origin']).toBe('http://localhost:3000');

    const badJson = await request(app)
      .post('/api/needs/detect')
      .set('Content-Type', 'application/json')
      .send('{"query":');
    expect(badJson.status).toBe(400);
    expect(badJson.body.error).toBe('Malformed JSON request body');
  });

  it('enforces AI route rate limits when rate limiting is enabled', async () => {
    const limitedApp = createApp({ enableRateLimit: true });
    let lastStatus = 200;
    for (let i = 0; i < 22; i++) {
      const res = await request(limitedApp).post('/api/ai/explain-ineligibility').send({
        farmerId: 'FARMER_003_ANAND',
        programId: 'PROG_PMKSY_DRIP',
        language: 'en'
      });
      lastStatus = res.status;
    }
    expect(lastStatus).toBe(429);
  });
});
