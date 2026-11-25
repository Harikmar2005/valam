# VALAM Automated Testing Guide

VALAM uses a multi-layer testing architecture covering deterministic domain engines, React components, Express API security and routes, FastAPI/SQLite parity routes, and browser end-to-end workflows.

## Single Command Verification

Run type-checking, unit/component/API tests with coverage, Playwright end-to-end tests, and the production build in one command:

```bash
npm run test:all
```

## Individual Test Suites

| Layer | Framework | Command | Location |
| --- | --- | --- | --- |
| Type Safety | TypeScript (`tsc --noEmit`) | `npm run lint` | Entire `src/` + `server.ts` |
| Unit & Rule Engines | Vitest | `npm run test:unit` | `src/services/__tests__/engines.test.ts` |
| Frontend Components | Vitest + React Testing Library | `npm run test:unit` | `src/components/__tests__/components.test.tsx` |
| Express API & Security | Vitest + Supertest | `npm run test:unit` | `src/server/__tests__/api.test.ts` |
| Code Coverage | Vitest (`@vitest/coverage-v8`) | `npm run test:coverage` | Outputs `coverage/` |
| End-to-End Workflows | Playwright (Chromium) | `npm run test:e2e` | `e2e/valam.spec.ts` |
| Production Bundle | Vite | `npm run build` | Outputs `dist/` |

## FastAPI Backend Tests (Python)

In a Python environment with `backend/requirements.txt` and `pytest` / `httpx` installed:

```bash
pip install -r backend/requirements.txt pytest httpx
pytest backend/tests/test_api.py -v
```
