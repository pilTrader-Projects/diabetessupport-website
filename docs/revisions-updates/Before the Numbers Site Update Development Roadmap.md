# Before the Numbers: Site Update Development Roadmap

*Revision 2: reconciled with the live codebase, legal-first. Stack: Next.js 16 on Vercel with MongoDB and Brevo; domain at Namecheap. Built with an AI coding agent (Antigravity). Goal: a solid, scalable, easy-to-maintain site that can grow from /ph to other Asian editions.*

## What changed in this revision

Revision 2 keeps what already works in your repository, and adds a new Priority 0 phase so nothing is sold, collected, or claimed until it is legally documented.

| Topic | Revision 1 assumed | Revision 2 decision |
| --- | --- | --- |
| Database | None until needed | Keep MongoDB + Mongoose |
| Content | 119 static JSON files | Keep MongoDB resources and Admin CMS; roadmap is a small overlay that references them |
| Email | MailerLite or Kit | Keep Brevo |
| Tests and CI | Vitest, new workflow | Keep Jest, Playwright, sanity suite, existing ci.yml |
| Routing | Move all pages under \[edition\] | Keep middleware + localizationResolver; add edition config files only |
| Articles | Merge into /learn | Keep articles in /community and curation in /learn |
| Tracking | New trackEvent() | Extend the existing src/analytics dispatchers |
| Order of work | Editions before revenue | Legal gate, then roadmap and email, then Starter Pack, then editions |
| Legal | Mentioned in risks only | New Phase 0 (Priority 0) gating every paid feature |

## 1. How to use this document

- Work **one phase at a time, one feature per Git branch**. Do not start a phase until the previous phase's acceptance checks pass.
- Every feature has: **Goal, Tasks, Done when, and an Antigravity prompt**. Paste the prompt into the agent, then review the plan it proposes **before** it writes code.
- Paste the **Master Project Rules (Section 4)** into your project's agent rules file first. Every later prompt assumes it.
- Time estimates assume part-time work (about 10 hours a week). Treat them as rough.
- This revision follows your engineering team's audit of the live codebase. **Phase 0 audits what already exists** (GlycoSense, community, My Library sync) so nothing is rebuilt blindly.

## 2. Objectives and principles

**Business objectives (in order):** (1) turn /learn visitors into email subscribers, (2) sell a ₱299 Filipino Starter Pack, (3) add small affiliate income, (4) expand by country without rewrites.

**Engineering principles (the "solid" part):**

1. **Content is data, not code.** Videos live in MongoDB; roadmap steps and edition facts live in typed config files, not hard-coded in components.
2. **One config per edition.** Anything country-specific (language, units, currency, statistics, legal text, partners) comes from `config/editions/<code>.ts`.
3. **Validate everything at the edges.** Forms, API routes, and content files are checked with Zod schemas.
4. **Small, boring dependencies.** Prefer managed services (email provider, payments) over building your own. Keep MongoDB, Brevo, and the existing test stack; add no new database or service unless a feature needs it.
5. **Every change is reviewable.** Branch, preview deploy, review diff, merge. Never push straight to main.
6. **Health content is high-risk.** Medical claims, units, and thresholds need a human check before publishing.

## 3. Architecture (reconciled with the live codebase)

**Stack**

| Layer | Decision |
| --- | --- |
| Framework | Next.js 16 App Router + TypeScript (strict), as today |
| Database | MongoDB + Mongoose (resources, authorities, podcast channels, leads, tokens, community) |
| Content | MongoDB + Admin CMS + YouTube sync; the roadmap is a small config file that references resource slugs |
| Email | Brevo through `brevoService` and `/api/v1/subscribe` |
| Analytics | GA4 through the `src/analytics` dispatchers, consent-gated |
| Ads | AdSense, consent-gated |
| Routing and editions | `src/middleware.ts` + `localizationResolver`: `/` is global, `/ph` is Philippines; edition facts move to `src/config/editions/` |
| Page roles | `/learn` is video curation and the roadmap; `/community` holds articles and discussion |
| Testing | Jest (ts-jest), Playwright, and the sanity suite (`tests/sanity_check.ts`) |
| CI | Existing `.github/workflows/ci.yml`, extended |
| Payments | Hosted checkout from a merchant-of-record platform; no payment SDK in our code |
| Hosting and DNS | Vercel; Namecheap |

**Proposed folder structure**

```
src/
  analytics/            # extend with new dispatchers
  app/
    learn/roadmap/[step]/   # Phase 2
    ph/starter-pack/        # Phase 3
    ph/starter-kit/         # Phase 4
    privacy/ terms/ refund-policy/ medical-disclaimer/ disclosure/ copyright/   # Phase 0
  components/
    EmailCapture.tsx  ConsentBanner.tsx  AffiliateLink.tsx  ProductCTA.tsx
  config/
    editions/ (types.ts, global.ts, ph.ts)
    roadmap.ts  products.ts  affiliates.ts  site.ts
  content/legal/*.md        # lawyer-reviewed text, versioned
  lib/    seo.ts  units.ts  editions.ts
  models/ ConsentRecord, DataRequestLog (new) + existing models
  services/ roadmapService.ts (new) + brevoService.ts (existing)
scripts/  check-affiliate-links.ts  data-request.ts
docs/     DATA_MAP.md  CONSENT.md  ANALYTICS.md  MAINTENANCE.md
```

**Edition routing:** keep the existing middleware and `localizationResolver`. Do not move pages under an `[edition]` folder; edition differences come from config files read by shared components.

## 4. Master Project Rules (paste into the agent rules file first)

```
You are working on "Before the Numbers", a Next.js 16 (App Router) + TypeScript site on Vercel with MongoDB/Mongoose and Brevo. Audience: families and breadwinners in Asia, starting with the Philippines. Content is health education; accuracy, safety, and legal compliance matter.

Rules:
1. Reuse before rebuilding. Keep MongoDB, Brevo, src/analytics, Jest, Playwright, the sanity suite, and the existing CI. Do not replace any of them without my approval.
2. TypeScript strict mode. No `any` unless justified in a comment.
3. Do not move the app directory or change src/middleware.ts routing. Country-specific values (statistics, currency, glucose unit, legal text, partners) come from src/config/editions/<code>.ts, never hard-coded in shared components.
4. Validate all external input with Zod. Never log emails or health data. Never send health-related tags or attributes to Brevo or GA4.
5. Consent first. Analytics and ads run only after consent. No new data collection without a documented purpose, a consent record, and a deletion path.
6. Never invent legal text, medical claims, statistics, testimonials, or compliance statements. Use clearly marked DRAFT placeholders for humans (lawyer, dietitian) to replace.
7. No outcome promises in copy. Never use speaker names, photos, or quotes to promote paid products.
8. Do not change medical wording, thresholds, or disclaimers unless the task says so; flag anything medical you are unsure about.
9. Prefer small, well-known dependencies; ask before adding one. No payment SDK; use hosted checkout links.
10. Work in a feature branch. Before coding, output a short plan listing the files you will create or change, and wait for my approval.
11. After coding: run lint, typecheck, Jest, the sanity suite, and build; report results. Summarize what changed and what I should verify manually.
12. Keep secrets in environment variables; document each in .env.example.
```

## 5. Roadmap overview

| Phase | Focus | Priority | Time | Gate or outcome |
| --- | --- | --- | --- | --- |
| 0 | Make it right: business, tax, privacy, legal pages, claims audit | P0 | 1-2 weeks, mostly non-code | The 0.6 gate checklist passes |
| 1 | Engineering foundation: metadata, consent, EmailCapture, events, affiliate component, data-rights script | P1 | 1-2 weeks | Runs in parallel with Phase 0 |
| 2 | 5-step roadmap on /learn | P2 | 1-1.5 weeks | Roadmap above the catalog |
| 3 | Starter Pack | P2 | 1 week plus writing the product | Needs the Phase 0 gate and Phase 1.2-1.4 |
| 4 | Welcome emails and recommendations | P3 | 3-5 days | Sequence live; links checked |
| 5 | Edition config and units | P3 | 3-5 days | Config-driven editions |
| 6 | Quality and upkeep | P3 | Ongoing | Guardrails and checklists |
| 7 | New edition playbook | P4 | 1-2 days engineering each | Local audience, medical review, and legal check first |

**Order:** Phases 0 and 1 run first and in parallel. Phase 2 follows. Phase 3 launches only after the Phase 0 gate passes and Phase 1.2-1.4 (consent, EmailCapture, events) are live. Phases 4-7 follow.

## 6. Phase 0 (Priority 0): Make it right

Phase 0 is the gate: no checkout link, new data collection, or affiliate push goes live until the gate checklist in 0.6 passes. It is mostly non-code work and takes 1-2 weeks; Phase 1 engineering can run in parallel because it sells nothing.

I am not a lawyer or accountant. The points below reflect general Philippine practice as I understand it, so verify each with a Philippine lawyer and accountant. A one-time paid review of your privacy policy, terms, and refund policy is the best money you can spend before selling.

### 0.1 Business and tax setup (you, not code)

- Register a business name with the DTI (sole proprietorship) or form a corporation. Ask your city or municipality whether a barangay clearance or mayor's permit applies to an online business.
- Register with the BIR as self-employed or a business, and issue the receipts or invoices it requires for every sale.
- Ask your accountant to choose between the 8% flat income-tax option and graduated rates plus percentage tax. Ask where the VAT threshold applies and how to declare income from AdSense, affiliate programs, and checkout platforms.
- Choose a checkout platform that acts as merchant of record (it collects and remits buyer-side sales tax or VAT): Lemon Squeezy or Gumroad. Confirm it can pay out to your Philippine bank or wallet before you build anything around it.
- Keep records of every sale, payout, and expense from day one.

**Done when:** DTI and BIR registration are complete, your accountant has confirmed the tax option, and your checkout account is approved for payouts.

### 0.2 Data privacy (Data Privacy Act, RA 10173)

Email addresses are personal information. Anything about someone's health, such as glucose logs or a condition, is sensitive personal information with stricter consent rules, so collect as little of it as possible.

- Name a Data Protection Officer (it can be you) and publish a contact email.
- Map your data: what you collect, where it lives (MongoDB, Brevo, GA4, localStorage, PIN sync), why, and how long you keep it.
- Minimize: do not tag subscribers by health condition in Brevo, keep GlycoSense data on the device unless the user opts into PIN sync, and define a retention and deletion rule for synced data.
- Consent: an unticked checkbox on every email form, a separate explicit consent for any health data stored on your servers, and a stored consent record (time, source, privacy-notice version).
- User rights: a working way to access, correct, delete, and unsubscribe, with a response target such as 30 days.
- Breach plan: a one-page procedure. Qualifying breaches must be reported to the National Privacy Commission and affected users within 72 hours (verify current rules).
- Check whether your processing system must be registered with the NPC (the thresholds depend on staff size and the number of sensitive records) and keep a short privacy-impact note either way.
- Confirm the data processing terms of Brevo, MongoDB Atlas, Vercel, and Google are accepted in your accounts.
- State that the service is for adults 18 and over and do not knowingly collect data from minors.

**Done when:** the data map exists, the DPO contact is published, and the consent record design is approved.

**Antigravity prompt (data map)**

```
Produce a read-only compliance data map as docs/DATA_MAP.md. Do not change code. For every place the app collects, stores, or sends personal data, list: data fields, purpose, storage location (MongoDB model, Brevo, GA4, localStorage, cookie), who can access it, retention, and deletion path. Cover: email forms (NewsletterOptInForm, LeadCaptureForm, /api/v1/subscribe), GlycoSense (what stays in localStorage vs what is synced by PIN), My Library sync, community posts and comments, admin tools, analytics, ads. Flag anything that could be health-related, anything stored without explicit consent, anything with no deletion path, and any place emails or health data are logged. End with a prioritized list of gaps.
```

### 0.3 Legal pages

The agent builds the pages; your lawyer reviews the text before they are published. Each page shows an effective date and a version.

| Page | Route | Must cover |
| --- | --- | --- |
| Privacy Policy | /privacy | Data collected, purposes, processors, retention, user rights, DPO contact, cookies, age limit |
| Terms of Use | /terms | Community rules, no medical advice in comments, user content license, takedown, liability limits |
| Refund Policy | /refund-policy | Digital product terms; state your window clearly (for example 7 days) |
| Medical Disclaimer | /medical-disclaimer | Not medical advice, emergencies, medication warnings (especially fasting), consult your doctor |
| Disclosure | /disclosure | Ads, affiliate links, and your own products; how you are funded |
| Copyright and Takedown | /copyright | Videos are embedded from official players, contact for removal, no affiliation with featured speakers |

The footer and the Starter Pack page also show seller identity: business name, contact email, and your registration details as your accountant advises.

**Done when:** every page is live, dated, versioned, lawyer-reviewed, and linked from the footer.

**Antigravity prompt (legal pages)**

```
Add legal pages at /privacy, /terms, /refund-policy, /medical-disclaimer, /disclosure, /copyright. Store the text as markdown files in src/content/legal/ with front matter: title, effectiveDate, version, reviewedBy (empty until reviewed). Render them with one shared layout. Pre-fill each with clearly marked DRAFT placeholder sections for me to replace with lawyer-approved text; do NOT invent legal wording or claim compliance. Show a visible "Last updated" date. Add all six links to the footer, include them in sitemap, and add a Jest test failing the production build if any page has a missing effectiveDate. Reuse the existing /editorial-policy and /corrections pages; link to them, do not rewrite them.
```

### 0.4 Claims, content, and endorsement audit

Work through this against the live site, page by page. Your team reports much of the clinical-claim cleanup is done, so the job here is to verify, not redo.

- [ ] Replace "zero ads / non-promotional / zero-commercial" wording with a true statement of how the site is funded.
- [ ] Remove the five-star line and any unverifiable social proof until real, permissioned testimonials exist.
- [ ] Describe GlycoSense as a personal logging tool. Remove diagnostic, treatment, "cure", or "reverse" language and "advanced AI" overclaims.
- [ ] Remove or clearly label sponsored videos (the DrinkAeira item) and miracle-claim titles. Put extended and dry-fasting items behind an "ask your doctor first" label.
- [ ] Verify each video's true channel and speaker, show "Video by \[name\] on YouTube", and add a "not affiliated with or endorsed by" statement.
- [ ] Do not use any speaker's name, photo, or quote to promote a paid product, including the Starter Pack page.
- [ ] Embed only through the official YouTube player. Never download or re-host videos. Review the YouTube API Services terms for your sync service, including privacy-policy wording and how long you may store API data (verify).
- [ ] Give every statistic in the edition copy a source and a year.
- [ ] Have a licensed nutritionist-dietitian review the Starter Pack meal plan (licensing applies in the Philippines; verify) and frame it as general education, not an individual prescription.

### 0.5 Ads and affiliate program rules

- Read the AdSense program policies, including health content and misleading claims. Visitors from the EU, UK, and Switzerland need a Google-certified consent banner before ads or ad cookies run (built in Phase 1).
- Join only programs you can comply with. Amazon Associates has no Philippine store, so Amazon links need care; Shopee and Lazada programs fit your audience better. Follow each program's disclosure wording.
- Put an "affiliate link" label next to the link itself, not only in the footer, and mark links `rel="sponsored"`.

### 0.6 Gate checklist: all must pass before the Starter Pack launches

- [ ] DTI and BIR registration done; tax option confirmed by your accountant
- [ ] Checkout account approved and payout tested
- [ ] DPO named; contact email published
- [ ] Data map complete; consent record design approved
- [ ] Six legal pages live and lawyer-reviewed
- [ ] Claims audit (0.4) fully ticked
- [ ] Affiliate and ad programs approved and disclosures in place
- [ ] Seller identity visible in footer and product page
- [ ] Breach and data-request procedures written down

## 7. Phase 1 (Priority 1): Engineering foundation

Phase 1 makes the existing stack consistent, consent-aware, and measurable, and it runs in parallel with Phase 0. Reuse what exists (`src/analytics`, `brevoService`, `ci.yml`); do not rebuild it. Every task below ships as its own branch and pull request.

### 1.1 Metadata helper and canonical fixes

**Goal:** Fix `/hidden-clock` (its canonical points to `/insulin-reset`), fix `og:url`, and stop the repeated site name in page titles.

**Done when:** every page has a unique title with the site name once, a self-referencing canonical, and a matching `og:url`; view-source confirms it on five sample pages.

**Antigravity prompt**

```
Create src/lib/seo.ts exporting buildMetadata({ title, description, path }) that returns Next.js Metadata with: a title that appends the site name exactly once, a self-referencing canonical (https://www.beforethenumbers.org + path), og:url equal to the canonical, og and twitter tags, and robots index,follow. Apply it to every public page, starting with src/app/hidden-clock/page.tsx (its canonical currently points to /insulin-reset; make it /hidden-clock). Do not change page copy. Add a Jest test that renders metadata for 5 sample routes and asserts canonical equals og:url and the title contains the site name once. In the summary, show before/after metadata for each changed page.
```

### 1.2 Consent and consent-gated tracking

**Goal:** No analytics or ad cookies run before a visitor chooses.

For EU, UK, and Swiss visitors AdSense requires a Google-certified consent tool, so use the certified one available inside AdSense (Privacy & messaging) for ads, and wire GA4 to Consent Mode. Denying by default everywhere is the simplest and cleanest setting; revisit it with your lawyer once traffic grows.

**Done when:** with consent denied, no GA4 or ad network requests fire (check the browser network tab); after accepting, they do; the choice persists and can be changed from the footer.

**Antigravity prompt**

```
Implement consent-gated tracking in the existing Next.js app. 1) Set Google Consent Mode v2 defaults to denied (analytics_storage, ad_storage, ad_user_data, ad_personalization) before the gtag script loads. 2) Add a ConsentBanner client component with Accept and Decline, persisted in a first-party cookie, and a "Cookie settings" footer link that reopens it; on Accept call gtag consent update. 3) Load the AdSense script only after consent is granted (and note in docs/CONSENT.md that EEA/UK/CH ads must use Google's certified CMP configured in the AdSense dashboard; do not claim our banner satisfies that). 4) Make the existing src/analytics dispatchers a safe no-op when consent is denied. 5) Add a Playwright test that asserts no googletagmanager or ad requests occur before consent and that they occur after Accept. Do not change event names or parameters.
```

### 1.3 One EmailCapture component with consent records

**Goal:** Every signup form uses one component and one API route, and every signup leaves an auditable consent record.

**Done when:** a test signup shows a `ConsentRecord` in MongoDB, a double-opt-in email from Brevo, and a `email_signup` event; submitting without the checkbox is rejected.

**Antigravity prompt**

```
Standardize email capture on the existing Brevo integration. 1) Create a reusable <EmailCapture source edition /> client component to replace NewsletterOptInForm and funnel/LeadCaptureForm (keep their visual styles via props). It has an unticked consent checkbox with a link to /privacy, a honeypot field, loading and error states, and fires email_signup only on success. 2) Harden /api/v1/subscribe: validate with Zod { email, firstName?, edition, source, consent:true, noticeVersion }, reject if consent is not true, add a per-IP rate limit, use Brevo double opt-in, never log emails, and never send health-related attributes or tags to Brevo. 3) Add a Mongoose model ConsentRecord { email, source, edition, noticeVersion, consentedAt, ipHash } written on every successful signup. 4) Jest tests for validation, rate limit, and consent rejection; extend the Playwright regression suite with a mocked-API signup flow. Do not change Brevo list ids or env var names; document anything new in .env.example.
```

### 1.4 Conversion events

**Goal:** Fix "Key events = 0" in GA4.

**Tasks:** Add the missing events to the existing dispatchers, then mark `email_signup` and `checkout_click` as Key events in GA4 and submit the sitemap in Search Console.

**Done when:** GA4 Realtime shows each event when you trigger it yourself.

**Antigravity prompt**

```
Extend src/analytics with typed dispatchers (same pattern as dispatchAffiliateCardClick) for: email_signup, lead_magnet_download, roadmap_step_click, checkout_click. Parameters may include source, edition, step_id, product_id only; never send emails, names, or any health data. Wire email_signup into EmailCapture, lead_magnet_download into the Hidden Clock download, and leave roadmap_step_click and checkout_click ready for Phases 2 and 3. Add Jest tests asserting each dispatcher is a no-op without consent and sends the exact event name and allowed parameters with consent. Document every event in docs/ANALYTICS.md.
```

### 1.5 One affiliate link component

**Goal:** Every affiliate link is labeled, disclosed, tracked, and checked.

**Done when:** no raw affiliate anchors remain; every one renders through `<AffiliateLink />` with a visible label and `rel="sponsored noopener"`; the link-check script reports zero failures.

**Antigravity prompt**

```
Create an <AffiliateLink merchant href label /> component that renders an anchor with rel="sponsored noopener noreferrer", a visible "affiliate link" label next to it linking to /disclosure, and calls the existing dispatchAffiliateCardClick on click. Replace every existing raw affiliate or Amazon anchor across /learn, community articles, and ph pages with it. Write scripts/check-affiliate-links.ts that collects all affiliate URLs from the codebase and database, requests each, and prints any that return 4xx or 5xx or redirect to an unexpected host. Do not add new affiliate links.
```

### 1.6 Data-rights tooling

**Goal:** You can honor an access or deletion request in minutes, with a record that you did.

**Done when:** running the script for a test email exports its data and then deletes it from MongoDB and Brevo, and logs the request without storing the email in plain text.

**Antigravity prompt**

```
Add an admin-only script scripts/data-request.ts with two commands: export <email> (collect that person's records from ConsentRecord, leads, community posts and comments, and the Brevo contact, output as JSON) and delete <email> (delete or anonymize those records and delete the Brevo contact). Log each request to a DataRequestLog model with a hashed email, action, date, and result. Require explicit --confirm for delete. Add Jest tests with mocked Brevo and an in-memory MongoDB. Do not expose this through any public route.
```

## 8. Phase 2: The 5-step roadmap on /learn

Phase 2 puts a curated "Start here" roadmap above the existing catalog, using the resources already in MongoDB. `/learn` stays a pure video and authority curation hub; articles stay in `/community`.

### 2.1 Roadmap definition and integrity check

**Goal:** The roadmap is a small config file that references existing resources by slug, so swapping a video is a one-line edit and a deleted resource can never leave a broken step.

Draft steps (confirm each video's source, speaker, and length before you attach your note, per Phase 0.4):

| Step | Goal | Starting picks |
| --- | --- | --- |
| 1. Understand | What insulin does | What is Insulin? (Jamnadas); What is Insulin Resistance? (Fung) |
| 2. Spot the signs | Why "normal" can mislead | Your blood sugar can look normal (Berry); What Your Glucose Monitor Is Missing (Bikman) |
| 3. Know the causes | Food, fat, lifestyle | What causes Insulin Resistance? (Fung); The Most Dangerous Fat in Your Body (Bikman) |
| 4. Take action | Sustainable changes | Reverse Insulin Resistance Through Diet, Exercise & Sleep (Bikman); Lower Blood Sugar Without Cutting Carbs (Fung) |
| 5. Stay safe | Medication and fasting caution | Fasting and medication precautions (Fung); Reversing Diabetes: Medication and Diet (Jamnadas) |

**Done when:** the build or test run fails if any roadmap slug is missing from the database or is flagged sponsored.

**Antigravity prompt**

```
Add the roadmap definition without changing the LearningResource model's existing fields. Create src/config/roadmap.ts exporting five steps { id, order, title, goal, resourceSlugs[], safetyNote?, editionNotes?: Record<'global'|'ph', Record<resourceSlug, string>> } using the existing resource slugs for these titles: What is Insulin?; What is Insulin Resistance?; Your blood sugar can look normal; 163 What Your Glucose Monitor Is Missing; What causes Insulin Resistance?; 156 The Most Dangerous Fat in Your Body; How To Reverse Insulin Resistance Through Diet, Exercise & Sleep; How to Lower Blood Sugar Without Cutting Carbs 6/6; Fasting and medication precautions; Reversing Diabetes: The Roles Medication and Diet Play. Add src/services/roadmapService.ts with getRoadmap(edition) that resolves slugs to resources and throws a clear error for any missing slug. Add a Jest test that runs against the seeded or mocked resources and fails if a slug is missing. Cache the resolved roadmap (ISR or the existing caching pattern) so /learn does not add a database query per visit.
```

### 2.2 Roadmap UI above the catalog

**Goal:** First-time visitors see a guided path, not 119 items.

**Page order:** short hero, five step cards, an email capture after Step 2, a safety notice before Step 5, then the existing catalog (filters, My Library) unchanged below, then the Starter Pack slot (hidden until Phase 3).

**Done when:** on a phone, the roadmap appears before any filter panel; the catalog still works; Lighthouse mobile performance is 85 or higher.

**Antigravity prompt**

```
In src/app/learn/page.tsx add a "Start here" roadmap section above the existing 2-column catalog without altering catalog behavior. Render getRoadmap(edition) as five step cards showing title, goal, 2-3 resource cards (thumbnail, title, speaker, one-line note from editionNotes if present, and a Mark-as-done checkbox stored in localStorage), then place <EmailCapture source="learn-roadmap" /> after step 2 and a SafetyNotice (reuse existing clinical wording) before step 5. Include a hidden placeholder slot for a Starter Pack call to action that renders nothing until a feature flag is on. Lazy-load video embeds from the thumbnail click. Mobile first, keyboard accessible. Fire roadmap_step_click on step card clicks using the Phase 1 dispatcher. Show the catalog collapsed by default on screens under 768px.
```

### 2.3 Step pages

**Goal:** Each step has its own shareable, indexable URL for Facebook and search.

**Antigravity prompt**

```
Create src/app/learn/roadmap/[step]/page.tsx using generateStaticParams from the roadmap config. Each page shows the step title and goal, its resources, Previous and Next navigation, the safety note if present, an EmailCapture, and unique metadata through buildMetadata. Add the step URLs to the sitemap handler and link the step cards to them. Return notFound() for unknown steps. Add a Playwright test visiting all five step URLs.
```

### 2.4 Library hygiene

**Goal:** Sponsored and high-risk items are labeled or kept out of featured areas.

**Antigravity prompt**

```
Add an optional boolean field sponsored (default false) to LearningResource and expose it in the Admin CMS form. Mark the DrinkAeira item sponsored. Show a "Sponsored content" badge on sponsored resources in the catalog and exclude them from the roadmap and any featured area. Add an "Advanced fasting (ask your doctor first)" topic filter to the catalog and move extended and dry-fasting items under it via the existing tagging, without deleting any resource. Add a script that lists resources missing sourceChannel so I can fix attribution.
```

## 9. Phase 3: The Starter Pack (first revenue)

Phase 3 launches only after the Phase 0 gate passes and Phase 1 consent, email capture, and tracking are live. The target is about 20 sales of the ₱299 Filipino Metabolic Starter Pack in a month, roughly the ₱5,500-6,000 that equals $100 (approximate; check the current exchange rate).

### 3.1 Build the product (no code)

The pack contains four items, all written by you or commissioned, never copied from or repackaged from other creators: a reading and watching roadmap (links to the free videos with your own notes), a 30-day Filipino meal plan with a shopping list, a glucose log sheet, and a doctor-visit question list.

- Have a licensed nutritionist-dietitian review the meal plan before sale.
- Put the medical disclaimer on the first page and the last page.
- Make no outcome promises: no "reverse diabetes in 30 days", no weight-loss guarantees, no before-and-after claims.
- Add a version number and date, and keep a source list for every health statistic.
- Do not use any speaker's name, photo, or quote to sell the pack.

### 3.2 Checkout setup

- Create the product on your merchant-of-record platform (Lemon Squeezy or Gumroad) with your business details, price, and refund policy link matching `/refund-policy`.
- Make one real test purchase and one test refund. Confirm the file delivers and the receipt arrives.
- Record each sale and payout for your accountant.

**Done when:** a test purchase delivers the file, a test refund works, and the sale appears in your records.

### 3.3 Product page and call to action

**Goal:** A clear, honest sales page that meets the Phase 0 requirements and tracks `checkout_click`.

The page shows: what is inside, who it is for, the price, how and when it is delivered, a link to the refund policy, the medical disclaimer, seller identity, and an FAQ. It shows no testimonials until real, permissioned ones exist.

**Done when:** the page exists at `/ph/starter-pack`, the feature flag can switch the `/learn` and email calls to action on or off, and `checkout_click` fires on the button.

**Antigravity prompt**

```
Create the Starter Pack product page without adding a payment SDK; use the hosted checkout URL only. 1) Add src/config/products.ts with a Product type { id, title, price per edition (amount, currency), checkoutUrl per edition, bullets[], faq[], version, updatedOn } and one product: filipino-metabolic-starter-pack. 2) Create src/app/ph/starter-pack/page.tsx (and src/app/starter-pack/page.tsx that uses the global edition entry when one exists, else redirects to /learn) showing: what's inside, who it's for, price, delivery, FAQ, link to /refund-policy, the medical disclaimer component, and a seller identity block read from src/config/site.ts (business name, contact email; leave registration fields empty with a build warning until I fill them). No testimonials, no speaker names or photos. 3) Create <ProductCTA productId /> and render it in the /learn placeholder slot behind a feature flag NEXT_PUBLIC_FLAG_STARTER_PACK (default off). 4) Fire checkout_click through the Phase 1 dispatcher with product_id and edition. 5) buildMetadata for the page, sitemap entry only when the flag is on. 6) Jest and Playwright tests: page renders with the flag on, the CTA is absent with it off, the buy button links to the configured checkout URL.
```

### 3.4 Launch and measure

- Turn the flag on only after you tick every item in the 0.6 gate checklist.
- Announce to your email list and Facebook page first, and link from the `/learn` roadmap and the welcome sequence.
- Review weekly: visitors, signups, `checkout_click`, sales, and refunds. If clicks are high and sales are low, fix the sales page; if clicks are low, fix traffic and the placement.

## 10. Phase 4: Welcome emails and affiliate recommendations

Phase 4 turns new subscribers into buyers and adds a small, honest affiliate income. It reuses Brevo and the Phase 1 `<AffiliateLink />`.

### 4.1 Welcome sequence in Brevo (no code)

Build one automation triggered by confirmed double opt-in. Every email shows your sender name, a working unsubscribe link, your business contact, and the medical disclaimer. Do not segment subscribers by health condition.

| Day | Email | Purpose |
| --- | --- | --- |
| 0 | Welcome and your free download | Deliver the lead magnet; set expectations |
| 2 | How insulin resistance starts | Link roadmap Step 1 |
| 4 | The Filipino plate | Practical meal ideas; link a community article |
| 7 | How to track your numbers | Introduce GlycoSense as a logging tool |
| 10 | The Starter Pack | Offer with price, contents, and refund policy; disclose that it is your product |

**Done when:** a test subscriber receives all five emails on schedule and the unsubscribe link works.

### 4.2 Affiliate recommendations

- Join the Shopee and Lazada affiliate programs and read each one's disclosure and content rules.
- Recommend only products with a clear purpose, such as a home glucose meter, test strips, or a blood pressure monitor. Check that each medical device is registered with the Philippine FDA (verify), and write that it supports home tracking, not diagnosis.
- Say why you picked each item in one honest sentence. Do not call anything "best" without a stated basis.
- Show the disclosure at the top of the page and next to every link.

**Done when:** every recommended product link works, is labeled, and passes the link-check script.

**Antigravity prompt**

```
Create a recommendations page at src/app/ph/starter-kit/page.tsx driven by src/config/affiliates.ts (id, name, category, merchant, per-edition url, whyWePickedIt, deviceRegistrationNote, lastCheckedOn). Render each item with <AffiliateLink /> from Phase 1, an affiliate disclosure block at the top linking to /disclosure, and a short "for home tracking, not diagnosis; ask your doctor" notice. Leave the list empty with a clear empty state until I add items. Add the page to the sitemap only when the list is not empty. Add a Jest test that fails the build if any item lacks whyWePickedIt or has a lastCheckedOn older than 90 days.
```

## 11. Phase 5: Edition config and glucose units

Phase 5 prepares expansion without touching routing. `/` stays global and `/ph` stays Philippines through the existing middleware and `localizationResolver`; country-specific facts move into one config file per edition. Do not move the app directory under `[edition]`; that would put Admin routes, sitemap handlers, and caching at risk for no revenue gain.

The test of success: adding a new English edition takes 1-2 days of engineering, not a copy of the `/ph` pages.

### 5.1 Edition config

**Goal:** Every country-specific value comes from `src/config/editions/<code>.ts`: locale, glucose unit, currency, statistics with source and year, cost examples, privacy law text, partner links, payment options, and testing guidance.

**Done when:** a search for Philippine-only values (pesos, RA 10173, local statistics) finds them only in `ph.ts`, not in shared components.

**Antigravity prompt**

```
Extract country-specific values into an edition config system without changing routing. Create src/config/editions/types.ts (Edition: code, locale, language, name, glucoseUnit 'mg/dL'|'mmol/L', currency, stats[] each with value, label, sourceUrl, year, costExamples, legal { privacyLawName, privacyNoticeVersion }, partners[], paymentOptions[]), plus global.ts and ph.ts filled from the current copy (statistics, IDF citations, dialysis costs, RA 10173 text). Add src/lib/editions.ts with getEdition(code) and a fallback to global. Keep src/middleware.ts and src/lib/localizationResolver.ts routing exactly as is. Refactor shared components and the /ph pages to read from the edition object. No visual change. List every hard-coded value you moved, and fail a Jest test if any stat lacks sourceUrl or year.
```

### 5.2 Glucose units

**Goal:** Thresholds display in the right unit for each edition. A wrong unit is a safety problem, so a person must review the thresholds before any mmol/L edition goes live.

**Done when:** conversions pass tests (for example 100 mg/dL is about 5.6 mmol/L) and no threshold number changed.

**Antigravity prompt**

```
Create src/lib/units.ts with formatGlucose(valueMgDl, unit) and parseGlucose(value, unit) using the factor 18.016, rounding mmol/L to one decimal and mg/dL to whole numbers. Add Jest tests for 70, 100, 126, and 140 mg/dL in both directions, including round trips. Render the existing GlycoSense thresholds through formatGlucose using the edition's glucoseUnit. Do not change any threshold value or any medical wording.
```

### 5.3 hreflang

**Antigravity prompt**

```
Extend buildMetadata in src/lib/seo.ts to emit alternates.languages (hreflang) for pages that exist in both the global and ph editions, plus x-default pointing to the global page. Update the sitemap handler to list both versions. Add a Jest test asserting each pair links reciprocally.
```

## 12. Phase 6: Quality, monitoring, and upkeep

Phase 6 is ongoing. Your CI already runs lint, typecheck, Jest, the sanity suite, build, and Playwright; extend it rather than replace it.

- **Tests:** add Jest tests for every new service and component in Phases 1-5, and Playwright flows for signup, roadmap, consent, and the Starter Pack page.
- **Performance:** keep Lighthouse mobile performance on `/learn` at 85 or higher; lazy-load embeds; add Lighthouse CI or bundle-size monitoring if you want a guardrail.
- **Monitoring:** Vercel Analytics, an uptime monitor (UptimeRobot free tier), and Search Console coverage and Core Web Vitals reviewed monthly.
- **Content upkeep:** review the legal pages every 6 months and whenever you add a data source, product, or edition; re-run the link-check script monthly; re-verify statistics yearly.
- **Security basics:** keep secrets in Vercel environment variables, enable two-factor authentication on GitHub, Vercel, MongoDB Atlas, Brevo, Namecheap, and your checkout account, and set MongoDB backups.

**Antigravity prompt**

```
Extend the existing .github/workflows/ci.yml (do not replace it) with: a Lighthouse CI step on /learn that warns when mobile performance drops below 85, and a scheduled weekly job that runs scripts/check-affiliate-links.ts and opens a GitHub issue if any link fails. Add a docs/MAINTENANCE.md checklist covering monthly, six-monthly, and yearly tasks from this roadmap. Keep Jest as the unit test runner and Playwright for end-to-end tests.
```

## 13. Phase 7: Adding a new edition

Use this checklist for /hk, /sg, and others. Engineering takes 1-2 days per English-language edition once Phase 5 is done; the content, medical review, and legal work take longer and matter more.

1. **Audience first:** launch only where you have an audience, such as a Facebook group, contacts, or proven search demand.
2. **Edition config:** copy `ph.ts`, then set locale, glucose unit, currency, sourced statistics, and local cost examples.
3. **Local medical review:** someone qualified in that country checks thresholds, foods, and testing guidance before launch.
4. **Country legal check:** confirm that country's privacy law and consumer rules with a local adviser before collecting data or selling (for example Hong Kong's PDPO and Singapore's PDPA), and update the privacy policy, terms, and refund policy for that edition.
5. **Commerce:** local currency price, a local payment method through your merchant-of-record platform, and a local affiliate program where one exists.
6. **Content:** a local meal plan, roadmap notes, and cost examples; for Chinese editions add translation files and test fonts and layout.
7. **SEO:** add hreflang pairs and the sitemap entry, and check Search Console coverage.
8. **QA:** run Jest and Playwright, then review five pages on a phone.

**Antigravity prompt (reusable)**

```
Add a new edition with code "<CODE>" (locale <LOCALE>, glucose unit <UNIT>, currency <CURRENCY>). Create src/config/editions/<code>.ts by copying ph.ts, replacing every Philippine-specific value with TODO placeholders that make a Jest test fail until filled (statistics need sourceUrl and year; legal.privacyLawName and privacyNoticeVersion must be set). Register the route in the existing middleware and localizationResolver following the /ph pattern, add the sitemap and hreflang entries, and add a Playwright test that the edition's home and /learn render. List every file changed and every TODO I must fill with locally reviewed content. Do not enable the Starter Pack for the edition until I set its flag.
```

## 14. Risks and open decisions

| Item | Risk | Mitigation |
| --- | --- | --- |
| Selling before Phase 0 passes | Tax, privacy, or consumer-law exposure | Feature flag stays off until the 0.6 gate is fully ticked |
| Health data | Sensitive personal information; breach impact is high | Collect little, keep GlycoSense on-device by default, consent records, breach plan |
| Medical claims | Harm to readers, ad-policy violations, legal exposure | Claims audit, disclaimers, dietitian review, no outcome promises |
| Using speakers' names | Implied endorsement; misuse of likeness | Factual attribution only, no speaker names or photos on sales pages, "not affiliated" notice |
| Copyright | Re-hosting or repackaging others' content | Official embeds only; sell only your own materials; takedown contact |
| Ads and affiliates | Policy violations; account bans | Read each program's rules, consent banner for EU/UK/CH, labeled links |
| Glucose units | mg/dL vs mmol/L confusion in other editions | Unit utility, per-edition config, tests, human review |
| Payments | Payout and eligibility rules vary | Merchant-of-record platform; confirm Philippine payout before building around it |
| AI-agent errors | Plausible but wrong code or legal text | Plan-first approval, tests, preview deploys, no invented legal wording |
| Scope creep | Rebuilding GlycoSense and community early | Leave them alone until Phases 0-3 are done |

**Open decisions for you:**

- Sole proprietorship or corporation, and which tax option (ask your accountant).
- Gumroad or Lemon Squeezy, based on Philippine payout availability.
- Refund window length (for example 7 days).
- Who acts as DPO and who is the named medical or nutrition reviewer.
- Whether the Starter Pack launches on `/ph` only or globally.

## 15. Working routine and the first three weeks

**For every feature:**

1. Create a branch named for the feature.
2. Paste the prompt, read the agent's plan, and approve or correct it before it codes.
3. Run it locally and check the **Done when** items yourself.
4. Open a pull request, read the diff summary, and check the Vercel preview.
5. Merge only when CI passes, and note the change in `CHANGELOG.md`.

**First three weeks (Phase 0 tasks and Phase 1 code run side by side):**

| Week | You (non-code) | Agent (code) |
| --- | --- | --- |
| 1 | Register with DTI and BIR; ask your accountant for the tax option; name the DPO; pick the checkout platform | Data map (0.2), metadata and canonical fixes (1.1) |
| 2 | Send draft legal text to your lawyer; finish the claims audit (0.4); start the Starter Pack content | Legal pages (0.3), consent and tracking (1.2), EmailCapture and consent records (1.3) |
| 3 | Get the meal plan reviewed; set up Brevo welcome sequence; join affiliate programs | Conversion events (1.4), affiliate component (1.5), data-rights script (1.6), roadmap config and UI (2.1-2.2) |

Then: step pages and library hygiene (2.3-2.4), check the 0.6 gate, launch the Starter Pack (Phase 3), the welcome sequence and recommendations (Phase 4), edition config and units (Phase 5), and Phases 6-7 as ongoing work.
