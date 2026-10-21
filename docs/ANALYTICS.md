# Analytics & Telemetry Architecture (GA4 & Google Consent Mode v2)

**Version:** 1.0.0 (Site Revision Phase 1: P1-05)  
**Governing Laws & Standards:** Republic Act No. 10173 (Philippine Data Privacy Act of 2012), GDPR, Google Consent Mode v2

---

## 1. Overview & Architecture

Before the Numbers uses a privacy-first, modular Google Analytics 4 (GA4) telemetry architecture located under `src/analytics/`. 

The system operates strictly under **Google Consent Mode v2**:
- **Default Privacy State:** Denied by default (`analytics_storage: 'denied'`, `ad_storage: 'denied'`, `ad_user_data: 'denied'`, `ad_personalization: 'denied'`).
- **Affirmative Consent Gating:** The GA4 `gtag.js` measurement scripts (`src/components/analytics/GoogleAnalytics.tsx`) are loaded strictly after the user grants explicit affirmative consent via the `ConsentBanner` (`src/components/common/ConsentBanner.tsx`) or the Cookie Settings panel.
- **Client-Side Dispatchers:** Typed, decoupled event dispatchers in `src/analytics/dispatchers/` safely interface with `window.gtag` via `sendGtagEvent`. If consent is denied or `window.gtag` is unavailable, dispatch calls return `false` cleanly without throwing exceptions.

---

## 2. Mandatory Data Privacy & Zero-PII Guarantee

Under **Republic Act No. 10173 (RA 10173)**, tracking personal or sensitive health information without explicit lawful consent is illegal. 

### Core Rules:
1. **NO Personally Identifiable Information (PII):** Email addresses, full names, phone numbers, physical addresses, and IP addresses are **STRICTLY PROHIBITED** from all event parameters and URLs sent to GA4.
2. **NO Sensitive Health Diagnoses:** Diagnostic conclusions, medical chart notes, or patient clinical statuses must never appear as event attributes.
3. **Automated Scrubbing:** The `privacySanitizer` utility (`src/analytics/utils/privacySanitizer.ts`) runs automatically on all conversion payloads before dispatching. Any parameter containing an email format (`/@/`) or excessive string length is automatically redacted to `redacted_pii` and trimmed.

---

## 3. Event Dictionary & Schema

### Conversion Events (Site Update P1-05)

| Event Name | Trigger Location | Purpose | Parameters | PII Restrictions |
| :--- | :--- | :--- | :--- | :--- |
| `email_signup` | `<EmailCapture />` completion | Tracks successful newsletter / lead funnel subscription | `source` (string)<br>`edition` (string, default: `'ph'`) | **NO email or name**. Only campaign slug (e.g. `newsletter_footer`, `insulin_reset_funnel`). |
| `lead_magnet_download` | `<EmailCapture />` download link click | Tracks digital asset / guide download claim | `file_name` (string)<br>`source` (string)<br>`edition` (string) | **NO download tokens** or user hashes. Asset filename only (e.g. `the-hidden-metabolic-clock.pdf`). |
| `roadmap_step_click` | 5-Step Learning Roadmap (`/learn`) | Tracks user progress through the guided self-recovery curriculum | `step_number` (number: 1–5)<br>`step_slug` (string)<br>`edition` (string) | None. |
| `checkout_click` | Starter Pack product purchase buttons | Tracks outbound checkout intent to Gumroad/Lemon Squeezy | `product_id` (string)<br>`product_name` (string)<br>`currency` (string, e.g. `'PHP'`)<br>`price` (number)<br>`destination_url` (string, optional) | Scrubbed URL without personal checkout query tokens. |

### Content & Engagement Events

| Event Name | Trigger Location | Purpose | Parameters |
| :--- | :--- | :--- | :--- |
| `affiliate_card_click` | Recommended Books & Companion Cards on `/learn` | Tracks monetization outbound interest | `affiliate_item` (string)<br>`card_layout_position` (string)<br>`destination_url` (string)<br>`page_location` (string) |
| `video_engagement` | YouTube Video Player Modal on `/learn` | Tracks educational video watch duration & completion | `video_title` (string)<br>`video_current_time` (number)<br>`engagement_action` (`'play'` \| `'pause'` \| `'heartbeat'`)<br>`completion_percentage` (number) |

---

## 4. Developer Usage Guidelines

All telemetry functions should be imported directly from `@/analytics`:

```typescript
import {
  dispatchEmailSignup,
  dispatchLeadMagnetDownload,
  dispatchRoadmapStepClick,
  dispatchCheckoutClick,
} from '@/analytics';

// 1. Email Signup Conversion
dispatchEmailSignup({
  source: 'insulin_reset_funnel',
  edition: 'ph',
});

// 2. Lead Magnet Download Conversion
dispatchLeadMagnetDownload({
  file_name: 'the-hidden-metabolic-clock.pdf',
  source: 'insulin_reset_funnel',
  edition: 'ph',
});

// 3. Roadmap Step Progression
dispatchRoadmapStepClick({
  step_number: 1,
  step_slug: 'understand-insulin-resistance',
  edition: 'ph',
});

// 4. Product Checkout Intent
dispatchCheckoutClick({
  product_id: 'starter-pack-ph',
  product_name: '30-Day Starter Pack',
  currency: 'PHP',
  price: 299,
  destination_url: 'https://checkout.gumroad.com/...',
});
```

---

## 5. Automated Verification & Testing

- **Unit Testing:** `tests/unit/analytics/conversionDispatchers.test.ts` asserts that all conversion dispatchers send valid payloads, strip accidental PII, enforce numeric types, and respect consent denial.
- **Sanity Verification:** `tests/sanity_check.ts` checks that `docs/ANALYTICS.md` and all dispatcher modules are present prior to deployment.
