---
description: Cross-Functional Marketing & Funnel Campaign Launch Workflow
---

# Cross-Functional Campaign & Funnel Launch Workflow

This workflow orchestrates marketing campaigns, lead magnets, and customer journeys across all 5 company departments, under the oversight of the **AI Agent COO** and final approval of the **Human CEO**.

---

## 1. Workflow Stages

```
   ┌────────────────────────────────────────────────────────┐
   │ 1. CAMPAIGN BRIEF (Human CEO -> AI COO -> Marketing)    │
   └───────────────────────────┬────────────────────────────┘
                               │
   ┌───────────────────────────▼────────────────────────────┐
   │ 2. COPY & NARRATIVE (Copywriter + SEO/GEO Specialist)  │
   │    • Emotive Filipino family hook & Founder story      │
   │    • E-E-A-T keywords, JSON-LD schema & entity graph    │
   └───────────────────────────┬────────────────────────────┘
                               │
   ┌───────────────────────────▼────────────────────────────┐
   │ 3. FUNNEL & AUTOMATION DESIGN (Automation Specialist)  │
   │    • Brevo lead list & tags (e.g., insulin_reset)      │
   │    • Nurture email sequences & GridFS asset download   │
   └───────────────────────────┬────────────────────────────┘
                               │
   ┌───────────────────────────▼────────────────────────────┐
   │ 4. TECHNICAL BUILD (Tech Lead + Developer)             │
   │    • TDD: Red -> Green -> Blue (Unit Tests First)      │
   │    • Next.js App Router, Tailwind, Form Validation     │
   └───────────────────────────┬────────────────────────────┘
                               │
   ┌───────────────────────────▼────────────────────────────┐
   │ 5. QA & VERIFICATION (QA Engineer)                     │
   │    • npm test (100% pass) + sanity check pass          │
   │    • Core Web Vitals & mobile viewport responsiveness   │
   └───────────────────────────┬────────────────────────────┘
                               │
   ┌───────────────────────────▼────────────────────────────┐
   │ 6. EXECUTIVE REVIEW & LAUNCH (AI COO -> Human CEO)     │
   │    • COO prepares Executive Memo                       │
   │    • Human CEO gives final deployment greenlight       │
   └────────────────────────────────────────────────────────┘
```

---

## 2. Stage Breakdown & Deliverables

### Stage 1: Campaign Strategy & Target Definition
- **Owner**: Marketing & Growth Strategist.
- **Output**:
  - Target audience segment (e.g., undiagnosed breadwinners, pre-diabetic individuals).
  - Core value proposition and conversion goal (e.g., email opt-in for 3-Page Cheat Sheet).
  - Selected marketing channels (organic search, community forum banner, direct traffic).

### Stage 2: Brand Copywriting & SEO/GEO Optimization
- **Owners**: Lead Copywriter + SEO/GEO Specialist.
- **Deliverables**:
  - Headline, subheadline, and empathetic body copy tailored to Filipino cultural eating patterns.
  - Integration of personal narrative or founder turning point when applicable.
  - Target search keywords and Generative Engine entity optimization markers.
  - Medical disclaimers complying with `docs/intended-use-statement.md`.

### Stage 3: Funnel & Lifecycle Automation Setup
- **Owner**: Automation & Funnel Specialist.
- **Deliverables**:
  - Funnel flow architecture (e.g., Step 1: Symptom quiz -> Step 2: Email capture -> Step 3: Success page + Tokenized download link).
  - Brevo configuration: list name, subscription tags, and automated welcome sequence trigger.
  - Digital asset setup: PDF cheat sheet uploaded to MongoDB GridFS with secure download token generation.

### Stage 4: Engineering Implementation (TDD)
- **Owners**: Senior Tech Lead + Full-Stack Developer.
- **Protocol**:
  - **RED**: Write comprehensive unit tests for UI components, form validations, and API routes.
  - **GREEN**: Implement minimal frontend and backend code to pass tests.
  - **BLUE**: Refactor for Clean Code, responsive mobile layouts, and optimal performance.

### Stage 5: Quality Assurance & Sanity Verification
- **Owner**: QA & Reliability Engineer.
- **Protocol**:
  - Run full automated test suite (`npm test`).
  - Run environment sanity check (`tests/sanity_check.ts`).
  - Verify zero console errors, zero layout shifts (zero-CLS), and full mobile compatibility.

### Stage 6: COO Review & Human CEO Go-Live
- **Owner**: AI Agent COO & Human CEO.
- **Action**:
  - COO verifies all 5 preceding gates are passed.
  - COO presents the final working preview, metrics, and launch checklist to the Human CEO.
  - Human CEO gives final authorization for production release.
