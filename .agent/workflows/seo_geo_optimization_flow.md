---
description: SEO & Generative Engine Optimization (GEO/AEO) Standard Operating Procedure
---

# SEO & Generative Engine Optimization (GEO/AEO) Workflow

This workflow guides the **SEO & GEO Specialist** in maximizing both traditional search rankings (Google, Bing) and AI Generative Answer citations (ChatGPT, Google Gemini, Perplexity, Claude).

---

## 1. Traditional Technical SEO Pillars

1. **Crawlability & Indexation**:
   - Verify dynamic sitemap entries in `src/app/sitemap.xml/route.ts`.
   - Maintain directives in `src/app/robots.ts` ensuring clean indexing of public articles, tools, and compliance pages.
   - Ensure canonical links are self-referencing and consistent across all pages.
2. **Core Web Vitals & Zero-CLS Layouts**:
   - Preserve zero Cumulative Layout Shift (CLS) especially around AdSense banners using fixed-height placement containers (`AdUnit.tsx`).
   - Ensure Largest Contentful Paint (LCP) and Interaction to Next Paint (INP) meet Google PageSpeed thresholds.
3. **Keyword & Topic Clustering**:
   - Organize content around Philippine-specific metabolic topics:
     - Filipino food glycemic indices (white rice, pandesal, native sweets).
     - Insulin resistance and early warning symptoms.
     - Accessible blood glucose testing and HbA1c benchmarks.

---

## 2. Generative Engine Optimization (GEO / AEO) Pillars

AI engines (ChatGPT Search, Perplexity AI, Google AI Overviews) rely on **entity clarity, direct factual answers, structured data, and high E-E-A-T credentials**.

1. **Rich JSON-LD Schema Architecture**:
   - Every page must render semantic Schema.org structured data from `src/lib/schema.ts`:
     - `MedicalOrganization`: Establishes DiabetesCare PH as a verified entity.
     - `MedicalWebPage` & `BlogPosting`: Injects author credentials, medical disclaimers, and reviewed dates.
     - `DiscussionForumPosting`: Identifies authentic peer discussions with upvote counters.
     - `BreadcrumbList`: Informs AI agents of hierarchical taxonomy.
2. **Direct Answer Paragraphs ("Snippet-Optimized Blocks")**:
   - Each educational page must begin with a clear, concise 2–3 sentence direct answer defining the topic before elaborating.
   - Use structured bullet points, clear headings (`H2`, `H3`), and concise summary tables to facilitate AI citation extraction.
3. **Medical E-E-A-T Enforcement**:
   - Include citations to authoritative guidelines (ADA, Philippine DOH, Endocrine Society).
   - Display clear Medical Disclaimers and Editorial Independence notices.
   - Highlight lived experience and real-world advocacy narratives to satisfy the "Experience" requirement in E-E-A-T.

---

## 3. Audit & Verification Checklist

- [ ] Page renders valid JSON-LD schema without syntax or type errors.
- [ ] Canonical URL matches the live production route.
- [ ] OpenGraph and Twitter card metadata (title, description, image) configured.
- [ ] Page added to `sitemap.xml` with appropriate change frequency and priority.
- [ ] No layout shift detected during asset or script loading.
- [ ] Medical disclaimer and intended use statement present.
