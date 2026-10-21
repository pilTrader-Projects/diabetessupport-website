# Compliance Data Privacy Map & Personal Data Inventory
**Republic Act No. 10173 (Data Privacy Act of 2012) & National Privacy Commission (NPC) Compliance**
*Platform:* Before the Numbers (`diabetessupport.ph` / `diabetessupport-website`)  
*Document Version:* 1.0.0  
*Effective Date:* October 21, 2026  
*Classification:* Read-Only Internal Governance & Compliance Audit  
*Reference Ticket:* Site Update P1-01 (Issue #68)

---

## 1. Executive Summary & Regulatory Framework

### 1.1 Purpose & Scope
This Data Privacy Map provides an exhaustive, read-only inventory of all personal information (PI) and sensitive personal information (SPI) collected, processed, transmitted, stored, and retained across the **Before the Numbers** platform. It establishes the baseline for regulatory compliance under Philippine and international privacy standards, identifies security and regulatory gaps across all active features, and prescribes concrete remediation pathways.

### 1.2 Statutory & Regulatory Framework
This inventory and audit are governed by:
- **Republic Act No. 10173**: The Data Privacy Act of 2012 (DPA).
- **NPC Circular No. 16-01**: Security of Personal Data in Government Agencies (best-practice standard for private health platforms).
- **NPC Circular No. 16-03**: Personal Data Breach Management.
- **NPC Advisory Opinion No. 2018-013 & No. 2020-022**: Processing of Health and Medical Data by Digital Platforms.
- **Implementing Rules and Regulations (IRR) of RA 10173**: Sections 21-29 (Data Subject Rights) and Section 34 (Security Measures).

### 1.3 Key Definitions under RA 10173
- **Personal Information (PI) [Section 3(g)]**: Any information, whether recorded in a material form or not, from which the identity of an individual is apparent or can be reasonably and directly ascertained.
- **Sensitive Personal Information (SPI) [Section 3(l)]**: Personal information referring to an individual's race, ethnic origin, marital status, age, color, and religious, philosophical, or political affiliations; health, education, genetic, or sexual life of a person; proceeding for any offense committed or alleged to have been committed; or issued by government agencies peculiar to an individual.
  > *Critical Note:* Self-reported metabolic symptoms, finger-prick blood glucose readings, blood pressure measurements, and algorithmic metabolic stage classifications constitute **health-related SPI** under Section 3(l)(2), which requires explicit, specific, and documented consent before collection.
- **Privileged Information [Section 3(k)]**: Any and all forms of data which under the Rules of Court and other pertinent laws constitute privileged communication (e.g. physician-patient communications).

---

## 2. Data Protection Officer (DPO) & Governance

### 2.1 Governance Structure
- **Data Protection Officer (DPO):** Legal & Compliance Team (`dpo@diabetessupport.ph` / `privacy@diabetessupport.ph`).
- **Physical Address:** Before the Numbers Health Platform, Metro Manila, Philippines.
- **Data Controller:** Before the Numbers (`diabetessupport.ph`).
- **Data Processing System Registration:** Registered with the National Privacy Commission (NPC) in accordance with NPC Circular 17-01.

### 2.2 Roles and Responsibilities
- **Data Protection Officer (DPO):** Supervises adherence to RA 10173, conducts annual Privacy Impact Assessments (PIAs), processes Data Subject Access Requests (DSARs), and coordinates breach notifications with the NPC within 72 hours of discovery.
- **Lead Software Engineering Team:** Implements security guardrails, encryption at rest/transit, automated data erasure routines, and audit logging without logging PII/SPI.

---

## 3. Comprehensive Touchpoint Inventory

The platform processes personal information across seven functional domains. The table below details every data element, collection mechanism, storage, processing purpose, retention timeline, and deletion pathway.

| Touchpoint ID | Feature / Component | Data Fields Collected | Classification (PI vs. SPI) | Purpose of Processing | Storage Location & Mechanism | Access Control | Retention Period | Deletion / Erasure Path |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TP-01** | Newsletter Subscription (`NewsletterOptInForm`, `/api/v1/subscribe`) | `email`, `firstName` (optional), `source` (`'homepage_lead_magnet'`, `'footer'`), `ipAddress` | **PI** | Distribute weekly metabolic educational newsletter, verify unique submission | MongoDB Atlas (`Lead` collection, `status: 'subscribed'`) & Brevo (Sendinblue) API | Application API Server, Admin Session (`bts_admin_session`) | Until user unsubscribes or requests erasure | One-click unsubscribe link in Brevo emails; manual DSAR to DPO (automated endpoint in P1-07) |
| **TP-02** | Insulin Reset Funnel (`LeadCaptureForm`, `SymptomChecklist`, `/api/v1/leads`) | `email`, `firstName`, `symptomsChecked` (`string[]`), `metabolicStage` (`'EARLY_STAGE_HYPERINSULINEMIA'`, etc.), `source`, `ipAddress` | **SPI & PI** (`symptomsChecked`, `metabolicStage` are health SPI) | Provide tailored metabolic staging, send Insulin Resistance Reset protocol guide | MongoDB Atlas (`Lead` collection) & Brevo custom attributes (`METABOLIC_STAGE`) | Application API Server, Admin Session | 36 months from last activity or until erasure requested | Manual DSAR request to DPO; Brevo unsubscribe does not delete MongoDB record (automated in P1-07) |
| **TP-03** | Starter Kit Opt-In (`KitOptInForm`, `/api/v1/subscribe`) | `email`, `firstName`, `source: 'starter_kit'` | **PI** | Deliver digital starter kit PDF and educational onboarding sequence | MongoDB Atlas (`Lead` collection) & Brevo API | Application API Server, Admin Session | Until user unsubscribes or requests erasure | Unsubscribe header/link in Brevo emails; manual DSAR to DPO |
| **TP-04** | GlycoSense Health Tracker (`/glycosense`, `GlucoseLogger`, `BloodPressureLogger`) | Blood glucose readings (mg/dL or mmol/L), measurement context (`fasting`, `post-prandial`, `bedtime`), systolic/diastolic blood pressure, pulse, meal log notes | **SPI** (Direct Health Metrics) | User self-monitoring, lifestyle trend visualization, blood sugar pattern tracking | **Local Device Only** (`window.localStorage`: `glucose_logs`, `bp_logs`, `meal_tags`) | Local user device only; never transmitted to server by default | Indefinite until browser cache cleared or user clicks "Reset All Data" | User-initiated "Clear Data" button in GlycoSense UI; browser storage clear |
| **TP-05** | My Library & Cross-Device Sync (`/sync`, `SyncDeviceModal`, `DeviceSync`, `/api/v1/community/sync`) | 6-digit numeric PIN (`syncPin`), `deviceFingerprint`, `payload` (JSON string of bookmarks, reading history, and local health logs) | **SPI & PI** (`payload` contains unencrypted health logs if synced) | Cross-device profile and saved protocol synchronization | MongoDB Atlas (`DeviceSync` collection) | Accessible by any client presenting the valid 6-digit `syncPin` | TTL index: automatically deleted after 30 days (`expiresAt: Date`) | Automatic MongoDB TTL deletion at 30 days; manual flush via admin |
| **TP-06** | Community Forum (`/community`, `Thread`, `Reply`, `/api/v1/community/threads`) | `author` (display name), `tag` (4-digit random number), `title`, `content` (may contain medical anecdotes), `category`, `ipAddress` (SHA-256 hashed), optional notification `email` | **PI & Voluntary SPI** (anecdotal health testimonials in thread body) | Public peer support, community question answering, thread reply alerts | MongoDB Atlas (`Thread`, `Reply` collections) | Public read-access; write-access via Next.js API; IP/email accessible to Admins | Indefinite for forum continuity; emails retained until alert unsubscribed | Manual moderation deletion via Admin Panel; user deletion request to DPO |
| **TP-07** | Admin Authentication & Dashboard (`/admin`, `src/lib/adminAuth.ts`, `ApiKey`, `AppConfig`) | Session token (`bts_admin_session` HttpOnly cookie), Admin Username, Password Hash (Argon2/bcrypt), API key hashes | **Non-PI Platform Security** | Administrative role verification, platform configuration, campaign management | Browser Cookies (`HttpOnly`, `SameSite=Strict`), MongoDB Atlas (`ApiKey`, `AppConfig`) | Platform Admins only (HMAC-SHA256 signature verification) | 24-hour cookie expiration; revoked on logout | Admin logout clears cookie; DB credentials revokable via admin CLI |
| **TP-08** | Web Analytics & Behavioral Tracking (`GoogleAnalytics`, `gtagTransport`, GA4) | Client IP Address, User-Agent, Screen Resolution, Page Paths visited, Custom interaction events (`lead_generated`, `video_engagement`, `affiliate_card_click`) | **PI** (Pseudonymous online identifiers under NPC definitions) | Audience measurement, conversion tracking, content optimization | Google Analytics Servers (EU/US cloud infrastructure) | Aggregated view in Google Analytics 4 Dashboard | Google standard 2-month / 14-month retention | Browser cookie clearing, browser DNT/GPC header, Google opt-out add-on |
| **TP-09** | Display Advertising (`AdSenseScript`, `AdUnit`, Google AdSense) | Cookie IDs (`__gads`, `__gpi`), IP address, ad view/click telemetry | **PI** (Advertising tracking identifiers) | Monetization via contextual and non-personalized healthcare display ads | Google AdSense ad-serving infrastructure | Google ad servers | Controlled by Google Advertising Policies (up to 13 months) | AdSettings opt-out, browser third-party cookie blocking |
| **TP-10** | System Runtime Logs (Server console outputs, Next.js API routes) | Diagnostic log streams, transient IP addresses, occasional debug parameters | **PI** (Operational traces) | Service stability monitoring, error tracking, security auditing | Vercel Serverless Logs / Runtime stdout | System Administrators / DevOps | 7 to 30 days (Vercel platform standard) | Automated rolling truncation by Vercel platform |

---

## 4. Sensitive Personal Information (SPI) & Health Data Classification

### 4.1 Statutory Basis (RA 10173 Section 3(l))
Section 3(l) of RA 10173 strictly prohibits the processing of Sensitive Personal Information except under specified conditions:
1. The data subject has given his or her **explicit, specific, and informed consent**, prior to collection.
2. The processing is provided for by existing laws and regulations.
3. The processing is necessary to protect the life and health of the data subject and the data subject is unable to give consent.
4. The processing is conducted by non-profit organizations for specific legitimate purposes.
5. The processing is necessary for medical treatment by a medical practitioner or medical institution.

### 4.2 Health Data Classification Matrix
The platform processes several distinct categories of health data:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                   HEALTH DATA CLASSIFICATION AT A GLANCE                    │
├───────────────────────┬──────────────────────────────┬──────────────────────┤
│ Data Element          │ Clinical / Informational     │ Storage & Exposure   │
│                       │ Classification               │ Risk                 │
├───────────────────────┼──────────────────────────────┼──────────────────────┤
│ Blood Glucose Readings│ Clinical Metric (SPI)        │ localStorage (TP-04) │
│ (mg/dL / mmol/L)      │ Finger-prick self-monitoring │ High if PIN-synced   │
├───────────────────────┼──────────────────────────────┼──────────────────────┤
│ Blood Pressure (BP)   │ Clinical Metric (SPI)        │ localStorage (TP-04) │
│ (Systolic / Diastolic)│ Cardiovascular parameter     │ High if PIN-synced   │
├───────────────────────┼──────────────────────────────┼──────────────────────┤
│ Metabolic Symptoms    │ Self-Reported Symptoms (SPI) │ MongoDB + Brevo      │
│ Checked (Brain fog,   │ Diagnostic indicator for     │ (TP-02)              │
│ post-meal fatigue...) │ metabolic dysfunction        │ CRITICAL COMPLIANCE  │
├───────────────────────┼──────────────────────────────┼──────────────────────┤
│ Metabolic Stage       │ Algorithmic Profile (SPI)    │ MongoDB + Brevo      │
│ (e.g. EARLY_STAGE_    │ Inferred health status       │ (TP-02)              │
│ HYPERINSULINEMIA)     │                              │ CRITICAL COMPLIANCE  │
├───────────────────────┼──────────────────────────────┼──────────────────────┤
│ Community Anecdotes   │ Voluntary Health Disclosure  │ MongoDB Public       │
│ (Forum discussions)   │ Qualitative personal history │ Low (Pseudonymous)   │
└───────────────────────┴──────────────────────────────┴──────────────────────┘
```

### 4.3 Mandatory Guardrails for SPI Processing
1. **Explicit Consent Requirement:** Health data must never be collected on an assumed or bundled consent basis. Every form ingesting symptoms or health metrics must present an un-checked, mandatory explicit consent checkbox explicitly naming health data processing.
2. **Data Minimization:** Health categories (e.g. `metabolicStage`, `symptomsChecked`) must **NOT** be exported to general-purpose third-party marketing automation platforms (Brevo) where non-clinical personnel or external marketing workflows may access them.
3. **Local-First Principle:** Clinical measurements in GlycoSense must remain in client-side storage by default. Any server transmission (e.g., cross-device sync) must utilize client-side end-to-end encryption or cryptographically strong authenticated tokens.

---

## 5. Third-Party Sub-Processors & Data Flows

Under Section 14 of the DPA, personal information controllers are responsible for personal data entrusted to sub-processors. The platform utilizes five primary external sub-processors:

```
                               ┌─────────────────────────────────┐
                               │   End User / Patient Browser    │
                               └──────────────┬──────────────────┘
                                              │
                     ┌────────────────────────┼────────────────────────┐
                     │ HTTPS                  │ HTTPS                  │ HTTPS
                     ▼                        ▼                        ▼
        ┌─────────────────────────┐ ┌──────────────────┐ ┌────────────────────────┐
        │   Vercel Edge & Compute │ │  Google GA4 /    │ │ Google AdSense         │
        │   (Hosting & Next.js)   │ │  gtag.js         │ │ (Display Advertising)  │
        └────────────┬────────────┘ └──────────────────┘ └────────────────────────┘
                     │
         ┌───────────┴───────────┐
         │ Node.js Serverless    │
         │ API Routes            │
         └─────┬───────────┬─────┘
               │           │
      Mongoose │           │ REST API (HTTPS)
               ▼           ▼
┌──────────────────┐ ┌────────────────────────┐
│  MongoDB Atlas   │ │  Brevo (Sendinblue)    │
│  Cloud Database  │ │  Transactional Email   │
│  (Data at Rest)  │ │  & Newsletter Engine   │
└──────────────────┘ └────────────────────────┘
```

### 5.1 Sub-Processor Verification Table

| Sub-Processor | Role / Function | Data Elements Transferred | Hosting Location | Safeguards & Security Certifications | NPC DPA Alignment |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Vercel, Inc.** | Application compute, edge routing, serverless execution | Transient HTTP requests, IP addresses, request headers | United States / Global Edge Network | SOC 2 Type II, ISO 27001, TLS 1.3 enforced, DDoS mitigation | Data Processing Addendum (DPA) in place |
| **MongoDB Atlas** | Primary persistent database | `Lead`, `Thread`, `Reply`, `DeviceSync`, `AppConfig`, `ApiKey` collections | AWS / GCP Cloud (Southeast Asia / Singapore Region preferred) | SOC 2 Type II, ISO 27017/27018, AES-256 encryption at rest, TLS in transit, VPC Peering | Enterprise Cloud DPA, Encrypted storage volumes |
| **Brevo (Sendinblue SAS)** | Email automation, campaign delivery, lead nurturing | `email`, `firstName`, `source`, `METABOLIC_STAGE` (current state) | European Union (France / Germany) | GDPR Compliant, ISO 27001, TLS encryption in transit, strict access control | Standard Contractual Clauses (SCCs), GDPR compliance |
| **Google LLC (Analytics)** | Site usage measurement and analytics | Client IP (anonymized), device user-agent, page URLs, engagement timestamps | United States / Global Data Centers | ISO 27001, SOC 2, Google Consent Mode v2 support | International Data Transfer Framework |
| **Google LLC (AdSense)** | Display advertising | Tracking cookies (`__gads`), user browser characteristics, ad impressions | United States / Global Data Centers | IAB TCF 2.2 Framework, Google Publisher Policies | Consent gating required before script execution |

---

## 6. Data Subject Rights Fulfillment Mechanism

Republic Act No. 10173 grants data subjects eight fundamental rights (Sections 21-29). The platform operationalizes these rights as follows:

### 6.1 Right to be Informed (Sec. 21)
- **Implementation:** Clear, plain-language Privacy Policy accessible at `/privacy` on every public footer; contextual notice on every collection form prior to data submission; Clinical Safety and Medical Disclaimers at `/medical-disclaimer`.

### 6.2 Right to Access (Sec. 22)
- **Current Procedure:** Data subjects may email `privacy@diabetessupport.ph`. The DPO manually queries MongoDB collections (`Lead`, `Thread`, `Reply`) and Brevo contact databases to provide a JSON or PDF extract within 15 business days.
- **Remediation Roadmap (P1-07):** Implementation of an authenticated or email-verified automated self-service lookup endpoint (`/api/v1/privacy/data-request`).

### 6.3 Right to Rectification / Correction (Sec. 23)
- **Current Procedure:** Data subjects request corrections to email, names, or forum posts via `privacy@diabetessupport.ph`. Forum authors can edit or request deletion of threads through administrative moderation.

### 6.4 Right to Erasure or Blocking (Right to be Forgotten) (Sec. 24)
- **Current Procedure:** Data subject submits erasure request. DPO manually:
  1. Deletes or anonymizes the lead record in MongoDB (`db.leads.deleteOne({ email })`).
  2. Blocks / deletes the contact in Brevo via API or dashboard.
  3. Deletes or redacts any forum thread or reply bearing the user's name or identity.
- **GlycoSense Local Health Data:** Data subjects possess direct physical autonomy to clear all local readings instantly using the "Reset All Data" button in `/glycosense`.
- **Remediation Roadmap (P1-07):** Implementation of automated erasure endpoint `/api/v1/privacy/forget-me` orchestrating cascade deletion across MongoDB and Brevo.

### 6.5 Right to Object (Sec. 25)
- **Implementation:** Data subjects can opt out of newsletter and marketing emails via the single-click "Unsubscribe" link in all Brevo communications. Cookie banner (P1-03) provides granular toggles to refuse non-essential analytics and advertising cookies.

### 6.6 Right to Data Portability (Sec. 26)
- **GlycoSense:** Local storage data can be exported as structured CSV/JSON directly from the client interface for sharing with physicians.
- **Account Records:** Provided in standard machine-readable JSON format upon verified DSAR.

### 6.7 Right to Damages & Right to File a Complaint (Sec. 27 & 28)
- Data subjects are explicitly advised in `/privacy` of their right to lodge a formal complaint with the National Privacy Commission (NPC) at `complaints@privacy.gov.ph` if their privacy rights are infringed.

---

## 7. Compliance Red Flags & Risk Audit

Through surgical static code analysis across models, API routes, and components, five critical compliance vulnerabilities have been identified:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    ACTIVE COMPLIANCE VULNERABILITIES                        │
├──────┬────────────────────────────────┬──────────────────────────┬──────────┤
│ Code │ Vulnerability Description      │ Affected Source Files    │ Severity │
├──────┼────────────────────────────────┼──────────────────────────┼──────────┤
│ RF-01│ Health SPI collected without   │ LeadCaptureForm.tsx      │ HIGH     │
│      │ explicit, unticked checkbox    │ /api/v1/leads/route.ts   │          │
├──────┼────────────────────────────────┼──────────────────────────┼──────────┤
│ RF-02│ Health SPI exported to Brevo   │ /api/v1/leads/route.ts   │ HIGH     │
│      │ (METABOLIC_STAGE attribute)    │ brevoService.ts          │          │
├──────┼────────────────────────────────┼──────────────────────────┼──────────┤
│ RF-03│ Unauthenticated 6-digit PIN    │ DeviceSync.ts            │ MEDIUM   │
│      │ exposes health payload         │ /api/v1/community/sync   │          │
├──────┼────────────────────────────────┼──────────────────────────┼──────────┤
│ RF-04│ Server console logs raw email  │ /api/v1/leads/route.ts   │ MEDIUM   │
│      │ addresses and PII              │ communityNotifications.ts│          │
├──────┼────────────────────────────────┼──────────────────────────┼──────────┤
│ RF-05│ Analytics & AdSense load       │ layout.tsx               │ HIGH     │
│      │ without prior consent gating   │ GoogleAnalytics.tsx      │          │
└──────┴────────────────────────────────┴──────────────────────────┴──────────┘
```

### Detailed Breakdown of Identified Red Flags:

#### Red Flag RF-01: Health SPI Collected Without Explicit Unticked Consent Checkbox
- **Source Files:** `src/components/funnel/LeadCaptureForm.tsx`, `src/app/api/v1/leads/route.ts`
- **Issue:** The form collects `symptomsChecked` and computes `metabolicStage`, saving both directly to the `Lead` model upon submission without an explicit, standalone, unticked checkbox requiring the user to affirm: *"I consent to the collection and processing of my health-related symptoms to receive my personalized protocol."*
- **Legal Infringement:** RA 10173 Section 12 & 13; NPC Advisory Opinion 2020-022. Bundled or implied consent for health data is strictly invalid.
- **Target Remediation:** Site Update Ticket **P1-04**.

#### Red Flag RF-02: Health Condition Tagging Exported to Brevo
- **Source Files:** `src/app/api/v1/leads/route.ts`, `src/services/brevoService.ts`
- **Issue:** When a user completes the funnel, the API route passes `attributes: { METABOLIC_STAGE: metabolicStage }` to `brevoService.syncContact()`. This persists health staging (SPI) inside a general-purpose commercial email platform.
- **Legal Infringement:** RA 10173 Section 11(c) (Principle of Proportionality and Minimization). Third-party email marketing platforms should only store communication identifiers (email, name), not diagnostic or metabolic staging tags.
- **Target Remediation:** Site Update Ticket **P1-04** (sanitize Brevo payload to store only campaign code, moving condition logic to internal system or generic campaign lists).

#### Red Flag RF-03: Unauthenticated 6-Digit PIN Sync for Health Payloads
- **Source Files:** `src/models/DeviceSync.ts`, `src/app/api/v1/community/sync/route.ts`
- **Issue:** The `DeviceSync` model stores a `payload` string alongside a 6-digit `syncPin`. A 6-digit numeric PIN offers only 1,000,000 combinations. Without strict rate limiting or client-side encryption, an attacker could brute-force PINs and extract synchronizing users' health readings and bookmarks.
- **Legal Infringement:** RA 10173 Section 20 (Security of Personal Information). Health SPI requires appropriate technical safeguards against unauthorized access.
- **Target Remediation:** Site Update Ticket **P1-06** (Local-First Encryption and secure PIN hashing / rate-limiting).

#### Red Flag RF-04: Server Console Logging Raw Email Addresses (PII)
- **Source Files:**
  - `src/app/api/v1/leads/route.ts`:
    ```typescript
    console.log(`[Lead Capture]: Resolved campaign: ${campaignCode}, createdBy: lead_${cleanEmail}`);
    ```
  - `src/lib/communityNotifications.ts`:
    ```typescript
    console.log(`[Community Notification (Sandbox/Disabled)]: Reply by ${replyAuthor} to ${subscriberEmail}...`);
    ```
- **Issue:** Plaintext email addresses are emitted into server stdout logs, which are ingested and retained by Vercel's logging infrastructure.
- **Legal Infringement:** NPC Circular 16-01; Security best practices for PII masking.
- **Target Remediation:** Sanitize all diagnostic log lines to hash or mask email addresses (e.g., `k***n@example.com` or SHA-256 truncation).

#### Red Flag RF-05: Analytics & AdSense Executing Prior to Consent
- **Source Files:** `src/app/layout.tsx`, `src/components/analytics/GoogleAnalytics.tsx`, `src/components/ads/AdSenseScript.tsx`
- **Issue:** Both `GoogleAnalytics` and `AdSenseScript` mount and fire network requests immediately upon document load without verifying user consent via Google Consent Mode v2 or an interactive cookie consent banner.
- **Legal Infringement:** NPC Advisory Opinion on Tracking Technologies; ePrivacy / GDPR international harmonization.
- **Target Remediation:** Site Update Ticket **P1-03** (Google Consent Mode v2 Cookie Banner with default `denied` state).

---

## 8. Prioritized Remediation Roadmap

The following remediation roadmap directly aligns with the *Before the Numbers Site Update Development Roadmap (Revision 2)*:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       REMEDIATION EXECUTION MATRIX                          │
├─────────┬──────────────────────────────────────┬────────────────────────────┤
│ Phase   │ Remediation Action                   │ Target Delivery Ticket     │
├─────────┼──────────────────────────────────────┼────────────────────────────┤
│ Phase 1 │ Google Consent Mode v2 Banner        │ P1-03                      │
│         │ • Default denied for ad/analytics    │ (PR in progress)           │
│         │ • Dynamic unblocking on user consent │                            │
├─────────┼──────────────────────────────────────┼────────────────────────────┤
│ Phase 1 │ Explicit SPI Consent & Brevo Hygiene │ P1-04                      │
│         │ • Mandatory unticked checkbox in lead│ (Next sprint)              │
│         │   capture form for health data       │                            │
│         │ • Strip METABOLIC_STAGE from Brevo   │                            │
│         │ • Create ConsentRecord collection    │                            │
├─────────┼──────────────────────────────────────┼────────────────────────────┤
│ Phase 1 │ Local-First Storage Encryption       │ P1-06                      │
│         │ • AES-GCM encryption for GlycoSense  │ (Phase 1 Sprint)           │
│         │ • Cryptographic rate limiting on PIN │                            │
├─────────┼──────────────────────────────────────┼────────────────────────────┤
│ Phase 1 │ Automated User Data Erasure Endpoint │ P1-07                      │
│         │ • /api/v1/privacy/forget-me endpoint │ (Phase 1 Sprint)           │
│         │ • Dual-cascade delete (DB + Brevo)   │                            │
├─────────┼──────────────────────────────────────┼────────────────────────────┤
│ Phase 2 │ Production Security & Sanity Gate    │ P0-GATE                    │
│         │ • Complete pre-deployment audit pass │ (Pre-launch sign-off)      │
│         │ • Zero raw PII in stdout verification│                            │
└─────────┴──────────────────────────────────────┴────────────────────────────┘
```

### Verification & Governance Sign-Off
This Data Map constitutes an active compliance document. Any pull request adding new models, API routes, third-party analytics SDKs, or external advertising tags must update this inventory synchronously as part of the Definition of Done.

*Approved by:*  
**Data Protection Officer & Architecture Council**  
*Before the Numbers Platform*
