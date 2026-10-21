# Project Roadmap: Diabetes Support Website & Platform

## Overview
Migration of `diabetescareph.wordpress.com` to a modern custom Next.js + MongoDB platform supporting automated API publishing, Kit marketing integration, Google AdSense monetization, and PWA product promotion.

---

## 🎯 Milestones & Issues

### Milestone 1: Project Setup & Architecture
- [x] **[Issue #1](https://github.com/pilTrader-Projects/diabetessupport-website/issues/1)** `[COMPLETED]`: Initialize Next.js (App Router), TypeScript, and Design System foundation.
- [x] **[Issue #2](https://github.com/pilTrader-Projects/diabetessupport-website/issues/2)** `[COMPLETED]`: Implement MongoDB database client & post schema models.

### Milestone 2: WordPress Legacy Data Migration
- [x] **[Issue #3](https://github.com/pilTrader-Projects/diabetessupport-website/issues/3)** `[COMPLETED]`: Build migration tool to import posts from `diabetescareph.wordpress.com`.

### Milestone 3: Automated Content Publishing API
- [x] **[Issue #4](https://github.com/pilTrader-Projects/diabetessupport-website/issues/4)** `[COMPLETED]`: Implement secure `POST /api/v1/posts` endpoint with API Key authentication.

### Milestone 4: Blog Engine & SEO Optimization
- [x] **[Issue #5](https://github.com/pilTrader-Projects/diabetessupport-website/issues/5)** `[COMPLETED]`: Create Blog feed, post view, category navigation, dynamic SEO metadata, and sitemap.

### Milestone 5: Marketing & Lead Capture (Kit & Brevo)
- [x] **[Issue #6](https://github.com/pilTrader-Projects/diabetessupport-website/issues/6)** `[COMPLETED]`: Integrate Kit (ConvertKit) opt-in forms & landing page sub-routes.
- [x] **[PR #17](https://github.com/pilTrader-Projects/diabetessupport-website/pull/17)** `[COMPLETED]`: Admin CMS editing for Kit landing pages, raw script tag preservation, and direct Kit hosted URL iframe embedding.
- [x] **[PR #18](https://github.com/pilTrader-Projects/diabetessupport-website/pull/18)** `[COMPLETED]`: Unified WYSIWYG Article Creator & Editor for Admin CMS (/admin/posts) with pre-populated MongoDB post fetching, sticky formatting toolbar, and dynamic marketing widget embeds.
- [x] **[Issue #28](https://github.com/pilTrader-Projects/diabetessupport-website/issues/28)** `[COMPLETED]`: Integrate Brevo for Email Marketing, Lead Capture Sequence Automation, and Transactional Delivery.

### Milestone 6: Ad Monetization
- [x] **[PR #22](https://github.com/pilTrader-Projects/diabetessupport-website/pull/22)** `[COMPLETED]`: Technical SEO, JSON-LD Schemas, Dynamic `/ads.txt`, Legal Compliance Pages, and Zero-CLS AdSense Infrastructure (Closes Issue #7).

### Milestone 7: PWA Apps Promotion Engine & Mobile UI Optimization
- [x] **[PR #19](https://github.com/pilTrader-Projects/diabetessupport-website/pull/19)** `[COMPLETED]`: GlycoSense Brand Theme Integration & High-Converting PWA Lead Capture Cards.
- [x] **[PR #20](https://github.com/pilTrader-Projects/diabetessupport-website/pull/20)** `[COMPLETED]`: Mobile Responsiveness Optimization & Horizontal Right-Side White Margin Overflow Fix (Header Drawer Nav & Viewport Resets).
- [x] **[PR #21](https://github.com/pilTrader-Projects/diabetessupport-website/pull/21)** `[COMPLETED]`: Breadwinner Pivot Copywriting Revamp, SaMD Regulatory Safe Harbor, and RA 10173 Data Privacy Compliance.
- [x] **[PR #27](https://github.com/pilTrader-Projects/diabetessupport-website/pull/27)** `[COMPLETED]`: PWA Android & Mobile WebAPK Installability with Web App Manifest, maskable and standard high-DPI icons, registered Service Worker (/sw.js) with fetch event handling, and pre-cached /offline fallback.
- [ ] **[Issue #8](https://github.com/pilTrader-Projects/diabetessupport-website/issues/8)**: Implement high-converting PWA promotional banners, sticky CTAs, and app feature cards.

### Milestone 8: Passwordless Community Forum & Discussion Board
- [x] `[COMPLETED]`: Passwordless Community Forum (`/community` and `/community/[slug]`) with Display Names, 4-digit auto-tags, 6-digit cross-device sync PINs, OP highlight badges, conditional Resend email alerts, UGC link sanitization, and Google DiscussionForumPosting JSON-LD schemas.
- [x] `[COMPLETED]`: Default QR Code cross-device synchronization with instant camera deep-linking (`/sync`), live auto-polling, and manual 6-digit PIN fallback.

### Milestone 9: Low-Awareness Lead Capture Funnel (Bikman/Insulin Reset Protocol)
- [x] **[PR #24](https://github.com/pilTrader-Projects/diabetessupport-website/pull/24)** `[COMPLETED]`: Low-Awareness Lead Funnel with Dr. Benjamin Bikman hyperinsulinemia protocol, interactive checklist, RA 10173 compliant lead capture, `/reset-success` bridge upsell to GlycoSense, and automated email delivery (Closes Issue #23).

### Milestone 10: Organic Community Root Page & Advanced SEO/GEO/AEO Hub
- [x] **[PR #26](https://github.com/pilTrader-Projects/diabetessupport-website/pull/26)** `[COMPLETED]`: Mission-driven organic educational hub on root path (`/`), FAQPage JSON-LD schema, direct-answer topical definitions, and passive routing to `/insulin-reset` and `/glycosense` (Closes Issue #25).

### Milestone 11: Brand Repositioning & Rebranding Strategy (`BRD-2026-V1`)
- [ ] **Architecture Directive**: Deprecate clinical naming overlap (`GlycoSense`) in favor of lifestyle-first companion brand `MetricPace` (`/dashboard` and `/insulin-reset`), detailed in [`docs/brand_repositioning_rebranding_strategy.md`](docs/brand_repositioning_rebranding_strategy.md).

### Milestone 12: Founder Story, Multi-Agent Company OS & Lead Funnel Alignment
- [x] **[PR #30](https://github.com/pilTrader-Projects/diabetessupport-website/pull/30)** `[COMPLETED]`: Founder Story (/about & /about/story), Multi-Agent Company Operating System & AI COO orchestration, website theme gradient & glassmorphism harmonization, 8-page 'The Hidden Metabolic Clock' funnel copy alignment, Amazon affiliate monetization, and primary statistical citations (IDF, PSA, DOST-FNRI).

### Milestone 13: Page Transition Standardization & UI Navigation Polish
- [x] **[PR #31](https://github.com/pilTrader-Projects/diabetessupport-website/pull/31)** `[COMPLETED]`: Standardize page transitions across App Router with root template component (`src/app/template.tsx`), hardware-accelerated slide-up keyframes (`pageSlideUpFade`), reduced-motion accessibility support, and scoped anchor smooth scrolling.

### Milestone 14: GlycoSense Cross-Project Collaboration Protocol & Alignment Contract
- [x] **[PR #32](https://github.com/pilTrader-Projects/diabetessupport-website/pull/32)** `[COMPLETED]`: Cross-Project Synchronization Protocols, Master Alignment Contract v1.2.0, Agent Rules (`glycosense_alignment.md`), and Email Migration Campaign Bridge.

### Milestone 15: Dynamic Companion App Link & Rebranding Management
- [x] **[PR #34](https://github.com/pilTrader-Projects/diabetessupport-website/pull/34)** `[COMPLETED]`: Decouple companion app destination (PlayStore / AppStore / Web) and brand naming from static code; provide instant access redirection link on lead capture and dynamic admin panel management without re-deployment (Closes Issue #33).

### Milestone 16: Dynamic Learning Materials Hub & Automated Resource Library
- [x] **[PR #36](https://github.com/pilTrader-Projects/diabetessupport-website/pull/36)** `[COMPLETED / MERGED]`: Rebrand and elevate Educational Articles (`/blog` -> `/learn`) into a comprehensive Learning Materials & Evidence Hub. Features zero-hardcoding Admin Management for Authorities & Personalities (`/admin/learning/authorities`) and Podcasts (`/admin/learning/podcasts`), keyword & guest syndication, automated YouTube & PubMed ingestion, link-rot health verification (`/admin/learning/resources`), lite video player modal with "Watch on YouTube" handoff, multi-dimensional filtering, and "My Library" bookmark lead capture drawer synced with Brevo (Closes Issue #35).
- [x] **[PR #38](https://github.com/pilTrader-Projects/diabetessupport-website/pull/38)** `[COMPLETED]`: Fix dynamic cascading of authority recommended books to video player modal so that adding books to an authority in Admin automatically cascades across all their videos (Closes Issue #37).

### Milestone 17: Site Revision Blueprint - Stop-the-Risk (Phase 0)
- [x] **[PR #48](https://github.com/pilTrader-Projects/diabetessupport-website/pull/48)** `[COMPLETED]`: Domain canonicalization on `www.beforethenumbers.org` (with edge apex-to-www redirection), clinical copy sanitization (hedging 'last biomarker', 'reversal', 'healing', and fear language), emergency fasting/low-carb safety callouts, and MongoDB legacy tag cleanup (Closes Issue #42).

### Milestone 18: Content Strategy - Legacy Blog Migration to Community Forum
- [x] **[PR #49](https://github.com/pilTrader-Projects/diabetessupport-website/pull/49)** `[COMPLETED]`: Abolish legacy WordPress blog posts from `/learn`, migrate live MongoDB documents into Community Discussions (`/community/[slug]`) with Founder attribution (`#FOUNDER`), append conversation prompts, configure 301 permanent redirects, and align Admin CMS with automatic Community thread publishing (Closes Issue #43).

### Milestone 19: Learning Hub - Pure Curation Engine & Structured E-E-A-T Schema
- [x] **[PR #50](https://github.com/pilTrader-Projects/diabetessupport-website/pull/50)** `[COMPLETED]`: Elevate `/learn` to a pure curation index with 3-layer bylines (Primary Authority + Editorial Desk + Medical Reviewer), `MedicalWebPage` & `VideoObject` JSON-LD schemas, evidence level badges, and privacy-sandboxed `youtube-nocookie.com` embeds (Closes Issue #44).

### Milestone 20: Trust & Compliance - Trust Pages Suite & Privacy Realignment
- [x] **[PR #51](https://github.com/pilTrader-Projects/diabetessupport-website/pull/51)** `[COMPLETED]`: Deploy core trust pages (`/editorial-policy` with 3-layer authority curation standards, `/corrections`, updated `/about` governance transparency), realign privacy copy to match actual local browser storage and anonymous 6-digit sync PIN architecture, and enforce strict zero-assumption affiliate link policy (Closes Issue #45).

### Milestone 21: Product & Regulatory - Accelerate MetricPace Rebrand & Localization
- [ ] **[Issue #46](https://github.com/pilTrader-Projects/diabetessupport-website/issues/46)** `[READY / PLANNED]`: Deprecate clinical naming overlaps (`GlycoSense`) in favor of `MetricPace` lifestyle companion ledger, deploy SaMD non-diagnostic safe harbor notices, and complete reciprocal `hreflang` localization on `/ph`.

### Milestone 22: Growth & CRO - Align Hero and Regional Funnel to Learning Hub First
- [x] **[PR #54](https://github.com/pilTrader-Projects/diabetessupport-website/pull/54)** `[COMPLETED / MERGED]`: Align global (`/`) and Philippine (`/ph`) hero sections and resource funnels to prioritize the Learning Materials Hub (`/learn`), deploy Option B emotional family protection hook, eliminate direct clinical liability with safe-harbor independent authority curation framing, and reorder regional action pathways (Closes Issue #53).

### Milestone 23: UX & Layout - Elevate Learning Hub with Sticky Sidebar Filter Navigation & Compact Row Cards
- [x] **[PR #56](https://github.com/pilTrader-Projects/diabetessupport-website/pull/56)** `[COMPLETED / MERGED]`: Re-layout `/learn` into a 2-column layout with a sticky left sidebar filter panel (search, formats, authorities, shows, topics) and compact horizontal single-row material cards (thumbnail on left, metadata/authorities on right) to maximize scannability, perceived catalog depth, and eliminate bounce rate (Closes Issue #55).

### Milestone 24: Admin CMS - Community Article Sync, Engagement Preservation & Status Filters
- [x] **[PR #58](https://github.com/pilTrader-Projects/diabetessupport-website/pull/58)** `[COMPLETED]`: Fix Community Article CMS in Admin Dashboard with non-destructive thread sync (preserving likes, views, and repliesCount), prevent duplicate discussion CTA footers, and support status filtering ('all', 'published', 'draft', 'archived') in GET /api/v1/posts and Admin UI (Closes Issue #57).

### Milestone 25: GA4 Event Tracking Implementation (/learn page)
- [x] **[PR #61](https://github.com/pilTrader-Projects/diabetessupport-website/pull/61)** `[COMPLETED / MERGED]`: Modular GA4 event tracking pipeline for `/learn` affiliate card clicks (left/right sidebars, feed rows) and embedded YouTube video player engagement (play, pause, 15s watch heartbeats, completion percentage), verified with non-intrusive passive propagation, full unit coverage, and automated Playwright E2E regression suite (Closes Issue #59).

---

## 🚀 Site Update & Expansion Blueprint (Revision 2 Reconciled)
*Detailed sequential tracking maintained in [`docs/revisions-updates/SITE_UPDATE_EXECUTION_TRACKER.md`](docs/revisions-updates/SITE_UPDATE_EXECUTION_TRACKER.md).*

### Milestone 26: Site Revision - Governance, Privacy & Consent Foundation (Phase 0 & 1)
- [x] **Item P1-01** [COMPLETED / MERGED] (PR #69, Closes #68): Data Privacy Map (`docs/DATA_MAP.md` for RA 10173 compliance).
- [x] **Item P1-02** [COMPLETED / MERGED] (PR #67, Closes #66): SEO Metadata Helper & Self-Referencing Canonical Fixes (`src/lib/seo.ts` & `/hidden-clock`).
- [ ] **Item P1-03**: Google Consent Mode v2 & `ConsentBanner` Component (cookie settings & ad/GA4 gating).
- [ ] **Item P1-04**: Unified `<EmailCapture />` Component, `ConsentRecord` Model & Zod validation on `/api/v1/subscribe`.
- [ ] **Item P1-05**: GA4 Conversion Event Dispatchers in `src/analytics` (`email_signup`, `lead_magnet_download`, `roadmap_step_click`, `checkout_click`).
- [ ] **Item P1-06**: Standardized `<AffiliateLink />` Component with disclosure & `scripts/check-affiliate-links.ts`.
- [ ] **Item P1-07**: Data-Rights Tooling (`scripts/data-request.ts` export/delete & `DataRequestLog` model).
- [x] **Item P0-01** [COMPLETED / MERGED] (PR #63 & PR #65, Closes #64): Complete Legal Pages Suite (`/privacy`, `/terms`, `/refund-policy`, `/medical-disclaimer`, `/disclosure`, `/copyright`) with front-matter metadata, shared layout, DRAFT legal placeholders, sitemap, footer nav, and 22 Playwright regression tests.
- [ ] **Item P0-GATE**: Priority 0 Gate Checklist Sign-Off (DTI/BIR, DPO, Claims audit, merchant-of-record approved).

### Milestone 27: Site Revision - 5-Step Learning Roadmap Engine (Phase 2)
- [ ] **Item P2-01**: Roadmap Definition (`src/config/roadmap.ts`) & Service Integrity Check with MongoDB resource resolving.
- [ ] **Item P2-02**: 5-Step Roadmap UI above Catalog on `/learn` (`src/app/learn/page.tsx`).
- [ ] **Item P2-03**: Individual Shareable Step Pages (`src/app/learn/roadmap/[step]/page.tsx`).
- [ ] **Item P2-04**: Catalog Hygiene & Sponsored Content Labelling (`LearningResourceModel`).

### Milestone 28: Site Revision - ₱299 Starter Pack Monetization Funnel (Phase 3)
- [ ] **Item P3-01**: Starter Pack Digital Product Assets (30-day meal plan, logs, doctor questions reviewed by dietitian).
- [ ] **Item P3-02**: Merchant of Record Checkout & Refund Verification (Gumroad/Lemon Squeezy).
- [ ] **Item P3-03**: Starter Pack Product Page (`src/app/ph/starter-pack/page.tsx`, `src/config/products.ts`, `<ProductCTA />` on `/learn`).
- [ ] **Item P3-04**: Commercial Launch (`NEXT_PUBLIC_FLAG_STARTER_PACK=true` activation).

### Milestone 29: Site Revision - Welcome Automation & Recommendations (Phase 4)
- [ ] **Item P4-01**: Brevo 5-Email Automated Sequence.
- [ ] **Item P4-02**: Starter Kit Recommendations Page (`src/app/ph/starter-kit/page.tsx` + `src/config/affiliates.ts`).

### Milestone 30: Site Revision - Multi-Edition Architecture & Units (Phase 5)
- [ ] **Item P5-01**: Centralized Edition Config (`src/config/editions/` - `types.ts`, `ph.ts`, `global.ts`).
- [ ] **Item P5-02**: Glucose Units Converter Utility (`src/lib/units.ts` with mg/dL ↔ mmol/L tests).
- [ ] **Item P5-03**: Regional SEO Alternates & Reciprocal `hreflang`.

### Milestone 31: Site Revision - CI Guardrails & Maintenance Playbook (Phase 6 & 7)
- [ ] **Item P6-01**: CI Guardrails (scheduled weekly affiliate check) & `docs/MAINTENANCE.md`.
- [ ] **Item P7-01**: New Edition Expansion Playbook (`/hk`, `/sg`).

---

## 🛡️ Engineering Standards & Workflow
- **Test-Driven Development (TDD)**: Unit & Integration tests created before or alongside code.
- **Sanity Checks**: Mandatory execution of `npm run sanity` before merging PRs.
- **Surgical Git Workflow**: Feature branch (`<issue>-<slug>`) -> PR -> Code Review -> Merge to `main`.

