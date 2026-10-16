---
description: CI/CD Workflow
---

# CI/CD Flow

// turbo-all

1.  **Linting**: Run `npm run lint` and `npx tsc --noEmit` to check for style and type violations.
2.  **Unit Tests**: Run `npm test` to verify logic.
3.  **Sanity Test**: Run `npm run sanity` (triggers `tests/sanity_check.ts`).
4.  **Build**: Run `npm run build` to ensure project compiles.
5.  **E2E / Regression Tests**: Run `npm run test:regression` (triggers Playwright real-browser suite).
6.  **Audit**: Run `npm audit` for security vulnerabilities.
7.  **Report**: QA Engineer generates a `walkthrough.md` with results.
