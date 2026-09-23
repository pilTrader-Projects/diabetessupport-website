---
description: AI Agent COO Executive Orchestration Workflow
---

# AI Agent COO Executive Orchestration Workflow

This workflow governs how the **AI Agent COO** receives directives from the **Human CEO**, breaks them down into cross-departmental operations, monitors execution, resolves blockers, and delivers structured executive briefings back to the CEO.

---

## Stage 1: Ingestion & Strategic Decomposition

1. **CEO Directive Intake**:
   - The COO receives strategic objectives, ideas, or directives from the **Human CEO**.
   - Identifies the scope, business goals, target deliverables, and desired completion horizon.
2. **Impact & Feasibility Assessment**:
   - Evaluates required involvement across departments:
     - **Marketing**: Target audience, positioning, channels.
     - **Copywriting**: Core message, tone, founder story hooks.
     - **SEO/GEO**: Keyword targets, schema structure, AI citation opportunities.
     - **Automation/Funnel**: Lead magnets, Brevo sequences, download assets.
     - **Engineering**: Next.js UI, database schemas, APIs, third-party integrations.
     - **QA**: Test plans, edge cases, sanity verifications.
3. **COO Operational Blueprint Creation**:
   - The COO generates a cross-departmental Execution Blueprint.
   - For high-impact or strategic shifts, presents an **Executive Summary** to the Human CEO for initial alignment before spinning off resources.

---

## Stage 2: Cross-Department Task Dispatch & Sequencing

The COO dispatches tasks following a strict dependency sequence:

```
[Phase 1: Brand & Strategy]
Marketing Strategy + Copywriting Angles + SEO/GEO Entity Mapping
                       │
                       ▼
[Phase 2: Funnel Architecture]
Automation Specialist maps Brevo lists, tags & user journeys
                       │
                       ▼
[Phase 3: Technical Build]
Tech Lead architects & Full-Stack Dev builds with TDD (RED -> GREEN -> BLUE)
                       │
                       ▼
[Phase 4: Quality & Verification]
QA runs full unit tests (100% pass) + system sanity checks
```

- Each task must contain:
  - **Context & Objective**: Why this work matters to the company.
  - **Inputs**: Assets produced by preceding departments.
  - **Acceptance Criteria**: Concrete definition of done.
  - **Standards Gate**: Adherence to `docs/standards.md`, `docs/guardrails.md`, and medical disclaimers.

---

## Stage 3: Operational Blocker Resolution

When an agent encounters a blocker or inter-department friction:
1. **Self-Contained Resolution**: The COO mediates conflicts directly (e.g., resolving trade-offs between copy length and mobile page speed).
2. **CEO Escalation Gate**: If a decision impacts brand positioning, core medical messaging, monetization policies, or budget, the COO immediately prepares an **Executive Escalation Memo**:
   - **Problem Context**: What is blocked and why.
   - **Options Analyzed**: 2–3 viable solutions with pros/cons.
   - **COO Recommendation**: The preferred path forward.
   - **CEO Decision Prompt**: Direct ask for approval.

---

## Stage 4: Executive Synthesis & Reporting to Human CEO

Upon completion of departmental milestones, the COO prepares an **Executive Milestone Report**:
- **Accomplishments**: High-level summary of what was delivered.
- **Verification Status**: Test suite results (`npm test`), sanity check results (`tests/sanity_check.ts`), and build checks.
- **Artifact Links**: Direct clickable links to deliverables (e.g., live pages, schemas, email flows).
- **Next Tactical Steps**: Recommended immediate priorities for CEO approval.
