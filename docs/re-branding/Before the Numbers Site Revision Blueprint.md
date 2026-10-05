# Before the Numbers: Site Revision Blueprint

*For the development, copywriting, medical-review and legal teams. Prepared 5 October 2026. Based on a live review of the homepage at beforethenumbers.org.*

## 1. Purpose, scope and how to use this document

This blueprint turns the audit findings into concrete tasks, rewrite directions and acceptance criteria. Each task has a priority and an owner so the work can be split across teams.

**Scope limit.** Only the homepage was reviewed live. The pages /ph, /learn, /glycosense, /hidden-clock, /community, /about, the privacy policy and the terms were not reviewed. Anything touching them is marked **Verify**, meaning the team should check the current state first.

**Priority legend**

- **P0**: complete within 1 week, before any promotion or outreach push.
- **P1**: complete within weeks 2 to 4.
- **P2**: complete within weeks 5 to 8, then maintain.

**Owner tags**: **\[DEV\]** development, **\[COPY\]** copywriting and editorial, **\[MED\]** licensed medical reviewer, **\[LEGAL\]** counsel or data protection officer.

## 2. Findings at a glance

| # | Finding | Priority | Owner |
| --- | --- | --- | --- |
| 1 | Canonical tag points to the apex domain, but the live host and all internal links use www, with no redirect | P0 | DEV |
| 2 | Privacy and encryption claims are absolute and unverified; the "My Library" storage model is unexplained | P0 | DEV, LEGAL |
| 3 | No visible author, medical reviewer, review date or reference list on content | P0 | COPY, MED |
| 4 | Several science claims are unsourced or overstated | P0 | COPY, MED |
| 5 | "Reverse", "before it's too late" and "peer-reviewed" language conflicts with the site's own principles | P0 | COPY |
| 6 | Fasting and low-carb content has no safety caveats | P0 | MED, COPY |
| 7 | GlycoSense needs its own notice, consent step and scope limits | P0 | DEV, LEGAL |
| 8 | Typos and polish issues (for example "Loose Weight") | P0 | COPY |
| 9 | Emoji slug, leaked WordPress excerpt, stray   fragments | P1 | DEV, COPY |
| 10 | Evidence hub is one-sided and mostly video, with no guideline sources | P1 | COPY, MED |
| 11 | Metadata and localization: og:locale en\_US, no hreflang, no structured data | P1 | DEV |
| 12 | Missing trust pages: editorial policy, medical review board, funding, corrections | P1 | COPY, LEGAL |

## 3. Guiding principles

Every change below should follow these six rules.

1. **Say only what we can source.** Each factual claim needs a reference a reviewer can open.
2. **Urgency without fear.** The site promises "clarity rather than paralyzing with fear," so no "before it's too late" phrasing.
3. **Education, not diagnosis.** No wording that implies a reader can tell whether they have a condition.
4. **Balanced evidence, labelled by strength.** Show readers whether something is a guideline, a trial, an observational study or an expert opinion.
5. **Privacy claims must match engineering reality.** Never publish a promise the system cannot prove.
6. **Answer first.** Lead with the direct answer, then the explanation. This serves readers and AI answer engines equally.

## 4. Workstream A: Development

### A1. Domain canonicalization (P0)

**Problem.** The canonical and og:url point to https://beforethenumbers.org, but the live site served at https://www.beforethenumbers.org and its navigation links all use www.

**Tasks**

- Decide the single authoritative host. Recommendation: the apex (beforethenumbers.org), since the canonical and the brand already use it.
- Add a site-wide 301 from www to the apex (or the reverse if the team chooses www). Include http to https.
- Update every internal link, sitemap URL, canonical tag, og:url, schema URL and email template to the chosen host.
- Enable HSTS once redirects are verified.
- If the singular domain beforethenumber.org (without the "s") or .com/.net variants are owned, 301 them to the authoritative host. If not owned, consider registering the singular .org to catch typos.

**Acceptance criteria**

- Every host and protocol variant resolves in one hop to a single URL with HTTP 200.
- Crawling the site finds zero internal links to the non-authoritative host.
- Search Console shows one property set as preferred, with the other redirecting.

### A2. URL hygiene and redirects (P1)

- Rebuild the slug of the article titled with an emoji (currently encoded as %f0%9f%a9%b8...). Use plain ASCII, for example /learn/how-diabetes-really-starts.
- 301 every old slug to its new one. Keep a redirect map (template in Appendix A).
- Set a rule in the CMS: ASCII slugs only, no emoji, maximum 60 characters, no stop-word padding.
- Remove emoji from page titles and H1s. Emoji can stay as decorative icons only if marked aria-hidden (see A6).

### A3. Template and rendering bugs (P1)

- **Leaked excerpt.** One article card shows the default WordPress "Continue reading" text inside the excerpt. Write a manual excerpt (140 to 160 characters) for every article and switch the card template to use it.
- **  fragments.** Several card titles show   in the extracted text. Verify in a browser whether it renders correctly. If it shows, strip the entities from titles at the data level and use normal spaces.
- **Card consistency.** All cards should show: title, one-line excerpt, topic tag, reviewer name and last-reviewed date (see A9).

### A4. Metadata, localization and structured data (P1)

**Metadata**

- Give every page a unique title (under 60 characters) and meta description (under 160 characters). Today the homepage values are good; replicate that standard.
- Change og:locale to en\_PH on /ph pages. Keep en\_US only if the root page targets a global audience.
- Add hreflang between the global root and /ph: root as "en" with x-default, /ph as "en-PH", each referencing the other.

**Structured data (JSON-LD)**

- Site-wide: Organization (name, URL, logo, contact, sameAs links) and WebSite.
- Educational articles: Article plus MedicalWebPage, with author, reviewedBy, datePublished, dateModified (example in Appendix B).
- Q&A blocks: FAQPage markup. Note that Google now shows FAQ rich results for very few sites, so treat this as semantic clarity for crawlers and answer engines, not as a ranking promise.
- BreadcrumbList on /learn and /ph pages.
- Validate every template with Google's Rich Results Test and the Schema.org validator.

### A5. Crawlability and AI-engine access (P1)

- Review robots.txt. Confirm which crawlers are allowed. If the goal is to be cited by answer engines, make sure their user agents are not blocked by accident. If some are blocked on purpose, document the policy.
- Publish an XML sitemap listing only canonical, indexable URLs. Reference it in robots.txt.
- Use `noindex` on thin pages such as saved-library views (/learn?format=saved) and filter parameters. Keep filtered views out of the sitemap or canonicalize them.
- An llms.txt file is optional. Its benefit is unproven, so do not prioritize it above the other tasks.

### A6. Performance and accessibility (P2)

- Measure Core Web Vitals on mobile (the main device in the Philippines) and set targets: LCP under 2.5 seconds, INP under 200 ms, CLS under 0.1.
- Mark decorative emoji icons aria-hidden="true" and ensure every link and button has a text label.
- Check colour contrast against WCAG 2.2 AA, including the dark-blue theme with light text.
- Test with keyboard-only navigation and a screen reader on the main flows.
- Keep the viewport allowing zoom (current setting is good).

### A7. Privacy engineering and the "My Library" feature (P0)

The site states that health metrics are encrypted, owned by the user, never disclosed to third parties, and that "My Library" works across devices without passwords. Each statement must be provable.

**Tasks**

- **Data inventory.** List every item collected: library bookmarks, GlycoSense logs, analytics events, cookies, IP addresses, contact-form data. For each, record purpose, storage location, retention and who can access it.
- **Explain the storage model.** If "My Library" saves to the browser (localStorage or cookies), say so, and tell users that clearing the browser removes it. If it uses an anonymous server-side ID, explain how cross-device access works without login, because that is hard to do securely. Revise the copy to match what actually happens.
- **Encryption.** Confirm TLS everywhere and encryption at rest for any stored health logs. State exactly what is encrypted, not just "encrypted."
- **Third parties.** Audit analytics, fonts, embeds and hosting. YouTube embeds and analytics tools are third parties. Use privacy-enhanced embeds (youtube-nocookie.com) or click-to-load embeds, and make sure no health log data reaches any analytics tool.
- **Consent and cookies.** Add a consent banner if non-essential cookies or trackers are used. Link it to the privacy policy.
- **User rights.** Provide a way to export and delete all data, and a contact route for privacy requests.
- **Retention.** Define how long logs are kept and delete on schedule.

**Acceptance criteria**

- A written data map signed off by the data protection officer.
- Every public privacy statement traces to a verified technical fact.
- A test account can export and fully delete its data.

### A8. GlycoSense Companion (P0, Verify current state)

- **Own notice.** Show a short, plain-language privacy notice and collect explicit consent before the first log is saved.
- **Scope limits on screen.** Add a persistent line: "For tracking and conversation with your doctor. Not a diagnostic tool." Home glucose meters have a margin of error, so readings from them do not diagnose anything.
- **No verdict language.** The tool must not output phrases such as "you are prediabetic" or "your readings are normal." Use neutral trend language ("higher than your 7-day average") and prompts to discuss patterns with a clinician.
- **Safety prompts.** Display a notice for very high or very low readings and for symptoms that need urgent care (see Appendix D for wording).
- **Units.** Support mg/dL and mmol/L with clear labelling and conversion checks.
- **Regulatory check.** Ask counsel whether any feature (alerts, interpretation, recommendations) could classify the tool as a medical device under Philippine FDA rules. Keep features within an informational log until that is answered.
- **Data export.** The "doctor-ready summary" should be exportable as PDF with the date range, units and a disclaimer line.

### A9. Content model for trust signals (P0 for template, P1 for backfill)

Add these fields to every article and guide in the CMS and display them on the page:

- Author name and credential.
- Medical reviewer name, credential and licence jurisdiction.
- Date published and **last reviewed** date.
- Reference list component (numbered, with links to primary sources).
- Evidence label (see B5).
- A "Report an error" link feeding the corrections process (see B7).

Articles without a reviewer should show "Not yet medically reviewed" or be set to noindex until reviewed.

### A10. QA, monitoring and release (P1)

- Work on a staging site. Run a full crawl before and after changes to compare redirects, canonicals, titles and status codes.
- Monitor 404s and redirect chains weekly for the first two months.
- Re-submit the sitemap and watch the Search Console coverage report for canonical and duplicate warnings.
- Run the final checklist in section 8 before sign-off.

## 5. Workstream B: Copywriting and editorial

### B1. Voice charter

**Do**

- Use plain, warm, specific language. Short sentences. Local examples (rice, sinigang, nilaga, merienda, family meals) where they help.
- Use hedged verbs for science that varies by person: "can," "may," "in many people," "studies suggest."
- Give the reader one clear next step per page, usually a conversation with their doctor or a question to ask at a check-up.

**Don't**

- Promise cures, reversals or timelines ("heal," "reverse," "restore," "before it's too late").
- Shame foods, bodies or families.
- Imply the reader can diagnose themselves or someone else.
- Present a single expert's view as settled fact.

### B2. Claim-by-claim rewrite directions

The table lists the specific claims found on the homepage, why each is a problem, and the direction to rewrite. The medical reviewer must approve final wording.

| Current wording or element | Problem | Rewrite direction |
| --- | --- | --- |
| "Fasting blood sugar is often the **last biomarker** to cross diagnostic thresholds. For 10 to 15 years..." (homepage Q&A and FAQ) | "Last" is overstated, since HbA1c or an oral glucose tolerance test can flag problems earlier or alongside. The 10 to 15 year window is presented as universal. | "Fasting glucose can look normal while other signals begin to shift, such as after-meal glucose, triglycerides, HDL, waist size and blood pressure. In many people, insulin levels rise before glucose does. How long this takes varies widely, and no single number tells the whole story. Ask your doctor which tests suit you: fasting glucose, HbA1c or a glucose tolerance test." Cite a review or guideline. |
| "Pancreas works in overdrive... hyperinsulinemia" | Accurate in outline but presented without caveats. Fasting insulin testing is not routine or standardized. | Keep the plain explanation. Add: "Insulin levels are not part of routine screening, so this is a reason to look at the whole picture with a clinician, not a test to order yourself." |
| GLUT4 post-meal walking explanation | The mechanism is correct. There is no supporting reference and no caution for people on glucose-lowering medicine. | Keep the mechanism. Add a citation for studies on post-meal walking and glucose. Add: "If you take insulin or certain diabetes pills, ask your doctor how activity affects your risk of low blood sugar." |
| "Sustainable metabolic **restoration**" | Implies a cure. | "Sustainable habits that support metabolic health." |
| "root biology of **healing**" | Implies treatment. | "the biology behind metabolic health." |
| "Your body can **heal** from insulin resistance..." and "before it's **too late**" (article blurbs) | Overpromise plus fear language, which contradicts the Hope and Agency principle. | "Insulin resistance can improve with changes such as regular movement, enough sleep and, when appropriate, gradual weight loss. Here is what the evidence shows and what to discuss with your doctor." |
| Article title "How to **Reverse** Insulin Resistance Naturally" | "Reverse" and "naturally" are strong claims, and "naturally" is vague. | "Ways to Improve Insulin Sensitivity: What the Evidence Says." Update the slug and add a redirect. |
| Lecture titles with "Type 2 Diabetes **Reversal**" | These are third-party titles. They conflict with a site that says it does not push extremes. | Keep the speaker's original title but add a label: "Third-party lecture. The speaker uses the term 'reversal.' Clinical guidelines generally use 'remission,' which has a defined meaning. Discuss any dietary change with your doctor." |
| Section header "**Peer-reviewed** science and expert authorities" | The featured items are video lectures, not peer-reviewed papers. | "Evidence and expert perspectives." Label each item by type (see B5). Use "peer-reviewed" only for items that are. |
| "100% Free **Forever**" | A permanent promise the team may not be able to keep. | "Free to use. No ads." Add "forever" only if funding and governance support it. |
| "Track ... fasting markers" and finger-prick logs | Readers may treat home readings as diagnostic. | "Track trends to share with your doctor. Home readings can differ from lab tests and cannot diagnose a condition." |
| Tags: "**Loose** Weight, Reverse Type 2 Diabetes, Obesity" | Typo, and the tags are claims. | Replace with neutral topic tags such as "Type 2 diabetes," "Weight," "Nutrition." Fix at the template or data level. |

### B3. Safety copy (P0)

Add the wording in Appendix D, reviewed by the medical reviewer, in these places:

- A short "Important" box on every page that discusses fasting, low-carb eating or exercise: who should talk to a doctor first (people taking insulin or sulfonylureas, pregnant or breastfeeding people, children and teens, older adults, people with kidney disease, and anyone with a history of eating disorders).
- A "Do not change or stop your medicines without your doctor" line on every page where diet or fasting is discussed.
- A "When to get care" box on GlycoSense and on the Hidden Clock framework.
- A short note that metabolic health markers and thresholds vary by guideline and by person.

### B4. Philippines hub (/ph) (P1, Verify current state)

- Every statistic (for example the number of Filipinos living with diabetes and the share undiagnosed) needs a source, the year, and a link on the page. State whether it is an estimate and from which edition of the source.
- Keep dietary suggestions framed as options to discuss, not prescriptions. If brown or red rice is mentioned, describe it as one choice within overall meal context, in line with the "no demonizing" principle, and cite evidence.
- Cover practical local access: where to get screened, how to ask for an HbA1c, what to bring to a consultation, and the relevant public programs. Have the reviewer verify each programme claim.
- Review the economic and dialysis framing for fear language. Present stakes factually and follow with actions the reader can take.
- Write the Tagalog and Cebuano versions only after the English copy is approved and reviewed. Have a medical translator check them.

### B5. Evidence hub redesign (P1)

**Balance**

- Add guideline and public-health sources next to the clinician lectures: the DOH, PhilHealth materials, the WHO, the International Diabetes Federation and the American Diabetes Association. Consider including a Philippine professional body (for example the Philippine Society of Endocrinology, Diabetes and Metabolism, **Verify** the exact name and URL).
- Include more than one perspective on carbohydrate restriction and fasting, including the limitations and the risks.

**Labels.** Tag every resource with a type and an evidence level so readers can weigh it:

- Guideline or consensus statement
- Randomized trial or systematic review
- Observational study
- Expert lecture or opinion
- Podcast or interview

**"Watch Breakdown" pages.** If these summarize third-party lectures, confirm that the summaries are original, attributed and linked back to the source, and that nothing copyrighted is reproduced. **\[LEGAL\]** to review.

### B6. SEO and answer-engine writing standards (P1 and ongoing)

- One H1 per page. Descriptive H2s phrased as the questions people ask.
- Place a one to two sentence direct answer under each question heading, then the detail. This pattern already works on the homepage; extend it to all guides.
- Use the same names consistently: "Before the Numbers," "The Hidden Metabolic Clock," and the five-step cycle.
- Add a short glossary (insulin resistance, hyperinsulinemia, HbA1c, prediabetes, metabolic syndrome) and link terms to it on first use.
- Link related guides to each other and to the Hidden Clock framework with descriptive anchor text.
- Do not keyword-stuff. Write for the reader first.
- Use the article template in Appendix C for every new guide.

### B7. Trust and governance pages (P1)

Create or update these pages and link them from the footer:

- **About.** Who runs the initiative, why it exists, where it is based, and how it is funded. State plainly whether it is a registered nonprofit. Do not imply nonprofit or institutional status unless it is registered and the registration can be shown. A .org domain does not confer nonprofit status.
- **Editorial policy.** How topics are chosen, how sources are selected, how medical review works, how often content is re-reviewed (suggest every 12 months) and how conflicts of interest are handled.
- **Medical review board.** Names, credentials and licence jurisdiction of reviewers, with a short bio each.
- **Corrections.** How to report an error, response time target, and a public log of significant changes.
- **Contact.** A monitored email address and a response expectation.

## 6. Workstream C: Medical and legal review

### C1. Medical review process \[MED\]

- Appoint at least one licensed physician (an endocrinologist or internist registered in the Philippines is ideal) as lead reviewer. Add a second reviewer for backup and for peer review of sensitive topics.
- Reviewers sign off on: factual accuracy, hedging, sources, safety caveats and whether wording could be read as personal medical advice.
- Review order of priority: homepage and the Hidden Clock framework, then the three guide articles, then GlycoSense copy, then /ph, then the rest of the hub.
- Set a re-review schedule and display the date on every page.

### C2. Legal and privacy review \[LEGAL\]

Counsel should confirm each of the following. The items below are prompts for the review, not legal conclusions.

- **Data Privacy Act (RA 10173).** Health data is sensitive personal information. Confirm that the site has a compliant privacy notice, a lawful basis and consent where needed, a designated data protection officer, a breach response plan, and that any registration or notification duty with the National Privacy Commission is met (**Verify** the current thresholds in NPC issuances).
- **Accuracy of the public statement.** The "Data Privacy & Security Notice" in the footer says data handling "adheres" to RA 10173 and that data is never disclosed to third parties. Revise it to what the team can prove, with a link to the full privacy policy.
- **Disclaimers.** The current disclaimer is a good start. Make it consistent and visible on every educational page and tool. Understand that a disclaimer reduces risk but does not remove liability, particularly if the content itself gives individualized advice.
- **Terms of service.** Include: no doctor-patient relationship, third-party content and links, user-submitted data, limitation of liability, and governing law.
- **Copyright.** Review use of third-party lectures, thumbnails, quotes and book references.
- **Medical device question.** See A8.
- **Entity status.** Confirm the legal entity behind the site, the trademark position on "Before the Numbers" and "The Hidden Metabolic Clock," and the copyright notice. "All rights reserved" and "open-access" sit awkwardly together, so consider a Creative Commons licence for educational materials if sharing is the intent.

## 7. Phased roadmap

| Phase | Timing | Deliverables |
| --- | --- | --- |
| **0: Stop-the-risk** | Week 1 | Canonical and redirect fix (A1). Remove or soften "reverse," "heal," "too late," "peer-reviewed" and "forever" wording (B2). Fix typos. Add the safety box and "don't change your medicines" lines (B3). Rewrite privacy notice to match the data map's first draft (A7, C2). Add the scope line and consent step to GlycoSense (A8). |
| **1: Trust foundation** | Weeks 2 to 4 | Appoint medical reviewers (C1). Add author, reviewer, date and reference fields (A9). Create About, editorial policy, review board and corrections pages (B7). Fix slugs, excerpts and rendering bugs (A2, A3). Add metadata, hreflang and schema (A4). Review robots.txt and sitemap (A5). Rewrite homepage Q&A with sources (B2). |
| **2: Depth and balance** | Weeks 5 to 8 | Rebuild the evidence hub with labels and guideline sources (B5). Review and rewrite /ph with sourced statistics (B4). Back-fill review data on all guides. Performance and accessibility pass (A6). Glossary and internal linking (B6). |
| **3: Maintain** | Ongoing | Re-review every 12 months. Monthly crawl, redirect and 404 checks. Quarterly privacy and analytics audit. Track corrections and update the public log. |

**Dependencies.** The medical reviewer must be in place before final copy approval. The data map must be complete before the privacy notice is finalized. Counsel's view on the medical-device question must come before any new GlycoSense interpretation features.

## 8. Final QA and sign-off checklist

**Technical**

- All host and protocol variants redirect in one hop to the authoritative URL.
- Canonical, og:url, sitemap and internal links all use the same host.
- No emoji or encoded characters in URLs. Old slugs redirect.
- No leaked default excerpts or visible HTML entities.
- Unique titles and descriptions on every page. Schema validates with no errors.
- hreflang pairs are reciprocal.
- robots.txt and sitemap reviewed and documented.
- Mobile Core Web Vitals meet the targets. Accessibility checks pass.

**Content**

- Every factual claim has a reference on the page.
- No cure, reversal or fear wording remains.
- Fasting, low-carb and exercise content carries the safety box.
- Every article shows author, reviewer, last-reviewed date and evidence label.
- All resources in the hub are labelled by type and evidence level, and include guideline sources.
- No typos in titles, tags or headings.

**Privacy and legal**

- Data map signed off. Every public privacy claim is backed by a technical fact.
- GlycoSense consent, scope line and safety prompts are live.
- User data export and delete tested.
- Terms, privacy policy and disclaimer are consistent across the site.
- Counsel confirmation recorded for the open items in section 6.

## Appendix A: Redirect map template

| Old URL | New URL | Type | Date added | Verified |
| --- | --- | --- | --- | --- |
| /learn/reverse-insulin-resistance-naturally | /learn/improve-insulin-sensitivity-evidence | 301 |  |  |
| /learn/(emoji-encoded slug) | /learn/how-diabetes-really-starts | 301 |  |  |
| https://www.beforethenumbers.org/(all) | https://beforethenumbers.org/(same path) | 301 |  |  |

## Appendix B: Example structured data for an educational article

The values in brackets are placeholders to be filled by the team.

```json
{
  "@context": "https://schema.org",
  "@type": "MedicalWebPage",
  "name": "[Article title]",
  "url": "https://beforethenumbers.org/learn/[slug]",
  "inLanguage": "en",
  "datePublished": "[YYYY-MM-DD]",
  "dateModified": "[YYYY-MM-DD]",
  "lastReviewed": "[YYYY-MM-DD]",
  "author": { "@type": "Person", "name": "[Author]" },
  "reviewedBy": { "@type": "Person", "name": "[Reviewer, credential]" },
  "publisher": { "@type": "Organization", "name": "Before the Numbers" }
}
```

## Appendix C: Article template

1. **H1** in plain words, no emoji, no promises.
2. **Direct answer** in one or two sentences.
3. **Byline block**: author, reviewer and credential, published and last-reviewed dates, evidence label.
4. **Key points** (three to five short items).
5. **Body** with question-style H2s, each opening with its own short answer.
6. **What this means for you**: one practical step and one question to ask a doctor.
7. **Safety box** where relevant (see Appendix D).
8. **Who should be careful** (medicines, pregnancy, children, older adults, kidney disease, eating-disorder history) where relevant.
9. **References**, numbered, linked to primary sources.
10. **Related guides** and a link to report an error.

## Appendix D: Safety copy bank (for medical review before use)

These lines are draft starting points. The medical reviewer must edit and approve them.

- **General.** "This page is for education and is not medical advice. It cannot tell you whether you have a condition. Talk to a doctor or other qualified health professional about your own situation."
- **Medicines.** "Do not start, stop or change any medicine because of something you read here. Talk to your doctor first."
- **Fasting and low-carb eating.** "Changes to meal timing or carbohydrate intake can be unsafe for some people, including those who take insulin or certain diabetes medicines, are pregnant or breastfeeding, are under 18, are older adults, have kidney disease, or have had an eating disorder. Speak to your doctor before making changes."
- **Home readings.** "Home glucose and blood pressure readings can differ from lab results and cannot diagnose a condition. Use them to see trends and to share with your doctor."
- **When to get care.** "Seek medical care promptly if you have very high or very low readings, or symptoms such as intense thirst, frequent urination, unexplained weight loss, blurred vision, confusion, fainting, or chest pain. In an emergency, call your local emergency number or go to the nearest hospital."
- **Privacy line for tools.** "We collect only what this tool needs. You can export or delete your data at any time. Read how we protect it in our privacy policy." (Use only after the data map confirms it is true.)

## Appendix E: Open questions for the team

1. Which host is authoritative, apex or www? (A1)
2. How does "My Library" store data and sync across devices without a login? (A7)
3. Which analytics, embeds and third-party scripts run on the site, and does any receive user health data? (A7)
4. Who will serve as lead medical reviewer, and by what date? (C1)
5. Is the organization registered, and as what? Who funds it? (B7, C2)
6. Do the "Watch Breakdown" pages contain original summaries or reproduced material? (B5)
7. What do /ph, /glycosense, /hidden-clock, /community and the privacy and terms pages currently say? These need the same review applied to the homepage.
