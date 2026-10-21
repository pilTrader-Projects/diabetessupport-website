# Site Update Execution Tracker (Revision 2 Reconciled)

> **Document Status:** Active Master Tracking Log  
> **Source Blueprint:** [Before the Numbers Site Update Development Roadmap.md](file:///Users/user/dev/projects/nocode/diabetessupport-website/docs/revisions-updates/Before%20the%20Numbers%20Site%20Update%20Development%20Roadmap.md)  
> **Repository Baseline:** Next.js 16 (App Router), TypeScript (Strict), MongoDB/Mongoose, Brevo, Jest, Playwright, Sanity Suite  

---

## 📋 Rules of Engagement

1. **Strict Sequential Progression:** Do not start an item until the preceding item's acceptance criteria pass and the PR is merged to `main`.
2. **One Feature per Git Branch:** Always branch from clean `main` using the designated branch naming convention (`<issue_number>-<slug>` or `feature/<slug>`).
3. **TDD & Verification Gate:** Every code change must run and pass the full verification chain before opening a PR:
   ```bash
   npm run lint && npx tsc --noEmit && npm test && npm run sanity && npm run test:regression
   ```
4. **Audit Trail:** Every PR must update this tracking document to mark `[x]`, link the GitHub PR number, and record the merge commit hash.
5. **Phase 0 Gate Rule:** The Starter Pack (`NEXT_PUBLIC_FLAG_STARTER_PACK`) **must not be enabled** in production until all items in **Phase 0.6 Gate Checklist** pass.

---

## 🚦 Master Execution Checklist

### Phase 0 & Phase 1: Foundation, Compliance & Tracking (P0 / P1)

*Phase 0 (Legal/Governance) and Phase 1 (Technical Foundation) run in parallel as Phase 1 sells nothing and establishes the required consent, privacy, and tracking infrastructure.*

| ID | Status | Focus | Branch Name | PR / Commit | Done Criteria |
| :--- | :---: | :--- | :--- | :--- | :--- |
| **P1-01** | [x] | **Data Privacy Map** | `main` | PR #69 (Closed #68) | `docs/DATA_MAP.md` created documenting all personal data touchpoints, storage locations (MongoDB, Brevo, localStorage), retention rules, and deletion paths. |
| **P1-02** | [x] | **SEO Metadata & Canonical Fixes** | `main` | PR #67 (Closed #66) | `src/lib/seo.ts` created with `buildMetadata()`. `/hidden-clock` canonical updated to self-reference (`/hidden-clock`). Title duplication eliminated. Jest test confirms canonical matches `og:url`. |
| **P1-03** | [x] | **Consent Mode v2 & Consent Banner** | `main` | PR #71 (Closed #70) | Google Consent Mode v2 initialized (default `denied`). `ConsentBanner.tsx` created with cookie persistence and footer "Cookie settings" trigger. AdSense and GA4 gated on consent. Playwright test verifies no ad/tracker network requests before consent. |
| **P1-04** | [x] | **Unified `<EmailCapture />` & Consent Records** | `74-email-capture-consent` | PR pending (Closes #74) | Reusable `<EmailCapture />` component created with unticked consent checkbox, honeypot, and Brevo double opt-in. Zod validation on `/api/v1/subscribe`. `ConsentRecord` Mongoose model logs signups. Jest + Playwright tests pass. |
| **P1-05** | [ ] | **GA4 Conversion Event Dispatchers** | `feature/conversion-event-dispatchers` | PR: #___ | `src/analytics` extended with typed dispatchers for `email_signup`, `lead_magnet_download`, `roadmap_step_click`, and `checkout_click`. No PII/health data sent. Documented in `docs/ANALYTICS.md`. Unit tests pass. |
| **P1-06** | [ ] | **Standardized `<AffiliateLink />` & Link Health** | `feature/affiliate-link-component` | PR: #___ | Reusable `<AffiliateLink />` with `rel="sponsored noopener noreferrer"`, visible label linking to `/disclosure`, and `dispatchAffiliateCardClick` trigger. `scripts/check-affiliate-links.ts` created and verifies all URLs return 200. |
| **P1-07** | [ ] | **Data-Rights Management Tooling** | `feature/data-rights-tooling` | PR: #___ | `scripts/data-request.ts` implemented with `export <email>` and `delete <email>`. `DataRequestLog` Mongoose model logs anonymized hashed requests. Jest tests with mocked Brevo and MongoDB pass. |
| **P0-01** | [x] | **Legal Pages Suite (Draft Placeholders)** | `main` | PR #63 & PR #65 (Closed #64) | **Completed & Merged:** `/privacy`, `/terms`, `/refund-policy`, `/medical-disclaimer`, `/disclosure`, `/copyright` with versioned front-matter, shared layout, DRAFT lawyer-review placeholders, sitemap integration, footer navigation, and 22 Playwright regression tests. |
| **P0-02** | [ ] | **Business & Tax Registration** | *Non-Code (Founder)* | N/A | DTI business name, BIR registration completed, tax option confirmed with accountant, and merchant-of-record checkout platform approved for Philippine payouts. |
| **P0-03** | [x] | **Claims, Content & Endorsement Audit** | `main` | PR #73 (Closed #72) | "Zero ads" claims replaced with funding disclosure; testimonials verified or removed; GlycoSense framed as non-diagnostic logger; DrinkAeira flagged `sponsored`; YouTube attribution statements added. |
| **P0-04** | [ ] | **Ads & Affiliate Program Compliance** | *Governance / Policy* | N/A | AdSense program policies verified; Shopee/Lazada affiliate terms reviewed; program disclosure text verified. |
| **P0-GATE** | [ ] | **Priority 0 Hard Gate Verification** | *Sign-off Check* | Sign-off Date: `____-__-__` | **ALL 0.6 Checklist items verified** (DTI/BIR, DPO named, legal pages lawyer-approved, claims audited, breach plan ready). Starter pack feature flag remains OFF until this is ticked. |

---

### Phase 2: The 5-Step Roadmap on `/learn` (P2)

*Presents a guided "Start Here" curriculum above the existing MongoDB learning materials catalog without altering the sticky sidebar or video player engine.*

| ID | Status | Focus | Branch Name | PR / Commit | Done Criteria |
| :--- | :---: | :--- | :--- | :--- | :--- |
| **P2-01** | [ ] | **Roadmap Definition & Integrity Service** | `feature/roadmap-definition-service` | PR: #___ | `src/config/roadmap.ts` defines the 5 steps referencing existing MongoDB resource slugs. `roadmapService.ts` resolves slugs and fails build/tests if any slug is missing. ISR caching applied. Jest tests pass. |
| **P2-02** | [ ] | **Roadmap UI on `/learn` Page** | `feature/learn-roadmap-ui` | PR: #___ | 5-step cards rendered above existing catalog in `src/app/learn/page.tsx`. `<EmailCapture source="learn-roadmap" />` placed after Step 2. `SafetyNotice` placed before Step 5. `roadmap_step_click` events fire. Mobile Lighthouse score >= 85. |
| **P2-03** | [ ] | **Individual Shareable Step Pages** | `feature/roadmap-step-pages` | PR: #___ | Dynamic routes created at `src/app/learn/roadmap/[step]/page.tsx` with static params, prev/next navigation, and `buildMetadata()` SEO tags. Playwright tests confirm all 5 step URLs render. |
| **P2-04** | [ ] | **Catalog Hygiene & Sponsored Labelling** | `feature/catalog-hygiene-sponsored` | PR: #___ | Added `sponsored: boolean` to `LearningResourceModel` and Admin CMS. "Sponsored content" badge displayed in catalog and excluded from roadmap. Advanced fasting topics grouped under safety warning. |

---

### Phase 3: The ₱299 Starter Pack Monetization Funnel (P2)

*The first direct digital product. Launches ONLY after P0-GATE is passed.*

| ID | Status | Focus | Branch Name | PR / Commit | Done Criteria |
| :--- | :---: | :--- | :--- | :--- | :--- |
| **P3-01** | [ ] | **Starter Pack Product Creation** | *Content / Dietitian* | N/A | 30-day Filipino meal plan, glucose log sheet, and doctor question list written and reviewed by licensed nutritionist-dietitian. Disclaimers added. No outcome guarantees. |
| **P3-02** | [ ] | **Checkout Setup & Test Transactions** | *Merchant of Record* | N/A | Product listed on Gumroad or Lemon Squeezy with `/refund-policy` link. Test purchase and test refund successfully verified. |
| **P3-03** | [ ] | **Starter Pack Product Landing Page** | `feature/starter-pack-landing-page` | PR: #___ | `src/config/products.ts` and `src/app/ph/starter-pack/page.tsx` implemented. Hosted checkout button fires `checkout_click`. `<ProductCTA />` slot created on `/learn` behind `NEXT_PUBLIC_FLAG_STARTER_PACK`. Tests pass. |
| **P3-04** | [ ] | **Commercial Launch & Live Activation** | `chore/activate-starter-pack` | PR: #___ | `NEXT_PUBLIC_FLAG_STARTER_PACK` set to `true`. Sitemap includes starter pack. Real-time conversion tracking verified in GA4. |

---

### Phase 4: Welcome Automation & Recommendations (P3)

| ID | Status | Focus | Branch Name | PR / Commit | Done Criteria |
| :--- | :---: | :--- | :--- | :--- | :--- |
| **P4-01** | [ ] | **Brevo 5-Email Automated Sequence** | *Email Automation* | N/A | 5-day welcome sequence live in Brevo (Day 0 welcome, Day 2 insulin basics, Day 4 Filipino plate, Day 7 tracking, Day 10 Starter Pack). Unsubscribe links and disclaimers in every email. |
| **P4-02** | [ ] | **Starter Kit Recommendations Page** | `feature/ph-starter-kit-page` | PR: #___ | `src/config/affiliates.ts` and `src/app/ph/starter-kit/page.tsx` created. Renders `<AffiliateLink />` cards with why-we-picked-it notes and FDA registration status. Build fails if any item is unverified > 90 days. |

---

### Phase 5: Multi-Edition Architecture & Glucose Units (P3)

| ID | Status | Focus | Branch Name | PR / Commit | Done Criteria |
| :--- | :---: | :--- | :--- | :--- | :--- |
| **P5-01** | [ ] | **Centralized Edition Config** | `feature/edition-config-system` | PR: #___ | `src/config/editions/` (`types.ts`, `ph.ts`, `global.ts`) created. Country stats, currency, IDF citations, and legal text extracted from components into config. Middleware routing unchanged. Jest test verifies source/year on all stats. |
| **P5-02** | [ ] | **Glucose Units Conversion Utility** | `feature/glucose-units-utility` | PR: #___ | `src/lib/units.ts` with `formatGlucose()` and `parseGlucose()` (factor 18.016). Jest tests pass for 70, 100, 126, 140 mg/dL conversions in both directions. GlycoSense thresholds formatted dynamically. |
| **P5-03** | [ ] | **Regional SEO & Reciprocal `hreflang`** | `feature/hreflang-seo-alternates` | PR: #___ | `buildMetadata` in `src/lib/seo.ts` emits `alternates.languages` (hreflang) linking `/` and `/ph` pages with `x-default`. Sitemap lists both versions. Unit tests assert reciprocal links. |

---

### Phase 6 & Phase 7: Quality Gates, Monitoring & Expansion (P3 / P4)

| ID | Status | Focus | Branch Name | PR / Commit | Done Criteria |
| :--- | :---: | :--- | :--- | :--- | :--- |
| **P6-01** | [ ] | **CI Guardrails & Maintenance Checklist** | `chore/ci-maintenance-guardrails` | PR: #___ | `.github/workflows/ci.yml` extended with scheduled weekly affiliate link check. `docs/MAINTENANCE.md` created with monthly/annual audit schedules. |
| **P7-01** | [ ] | **New Edition Expansion Template** | `docs/new-edition-playbook` | PR: #___ | Reusable playbook and generator script for new country editions (`/hk`, `/sg`) requiring medical and legal review before activation. |

---

## 🛠️ Step-by-Step Developer Workflow

Whenever you are assigned or pick up an item from this checklist:

1. **Check Dependencies:** Verify that all preceding checklist items are marked `[x]` and merged to `main`.
2. **Sync Main:**
   ```bash
   git checkout main && git pull origin main
   ```
3. **Create Branch:**
   ```bash
   git checkout -b <branch_name_from_table>
   ```
4. **Implement following TDD:**
   - Write or update unit tests in `tests/unit/`
   - Write or update E2E tests in `tests/e2e/`
   - Implement the code changes
5. **Run Sanity & Full Regression:**
   ```bash
   npm run lint
   npx tsc --noEmit
   npm test
   npm run sanity
   npm run test:regression
   ```
6. **Open PR & Update Tracker:**
   - Push branch and create PR using `gh pr create`
   - Update this file (`SITE_UPDATE_EXECUTION_TRACKER.md`) to mark the item `[x]` and link the PR
   - Merge only when CI passes all checks.
