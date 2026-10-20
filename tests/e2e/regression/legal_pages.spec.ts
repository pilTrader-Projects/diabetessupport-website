import { test, expect, type Page } from '@playwright/test';

/**
 * REG-004..REG-008: Legal content regression suite (P0-01, issue #62).
 *
 * Guards the markdown-driven legal area (/privacy, /terms, global footer notices, legacy redirects,
 * sitemap) so unrelated code changes cannot silently break how it renders.
 */

const LEGAL_PAGES = [
  {
    path: '/privacy',
    h1: 'Privacy Policy & Data Protection',
    title: /Privacy Policy & Data Security Notice/,
    sections: [
      '1. Commitment to Health Data Confidentiality',
      '2. Local Device Storage Architecture (localStorage)',
      '3. Anonymous Cross-Device Pairing',
      '4. Google AdSense & Advertising Cookies',
      '5. Email Subscriptions & Communication (Brevo)',
      '6. Data Rights, Export & Local Deletion',
      '7. Contact Our Data Protection Officer',
    ],
  },
  {
    path: '/terms',
    h1: 'Terms of Service & Clinical Disclaimer',
    title: /Terms of Service & Medical Safe Harbor/,
    sections: [
      'Mandatory Medical & Non-Diagnostic Disclaimer',
      '1. Software as a Medical Device (SaMD) Safe Harbor',
      '2. Intellectual Property & Fair Use',
      '3. Limitation of Liability',
    ],
  },
  {
    path: '/refund-policy',
    h1: 'Refund & Cancellation Policy',
    title: /Refund Policy/,
    sections: [
      'DRAFT: Pending Final Legal Review',
      '1. Digital Product Refund Eligibility',
      '2. Processing & Payout Timelines',
      '3. Exceptions & Abuse Prevention',
      '4. Contact for Refund Requests',
    ],
  },
  {
    path: '/medical-disclaimer',
    h1: 'Medical & Clinical Information Disclaimer',
    title: /Medical Disclaimer & Clinical Safety Notice/,
    sections: [
      '⚠️ Mandatory Emergency & Non-Diagnostic Notice',
      '1. Educational Purpose Only (No Doctor-Patient Relationship)',
      '2. Medication Warnings & Fasting Precautions',
      '3. Individual Variation & Professional Consultation',
      '4. Software as a Medical Device (SaMD) Disclaimer',
    ],
  },
  {
    path: '/disclosure',
    h1: 'Transparency & Editorial Disclosure',
    title: /Advertising & Affiliate Disclosure/,
    sections: [
      '1. How Before the Numbers is Funded',
      '2. Google AdSense & Programmatic Advertising',
      '3. Affiliate Relationships & Sponsored Links',
      '4. Editorial Independence & Non-Influence',
    ],
  },
  {
    path: '/copyright',
    h1: 'Copyright, Fair Use & Content Removal Notice',
    title: /Copyright & Takedown Policy/,
    sections: [
      '1. Curated Educational Video Embeds',
      '2. Non-Affiliation with Featured Speakers',
      '3. Original Content & Trademarks',
      '4. DMCA & Copyright Takedown Procedure',
    ],
  },
] as const;

/** Collects uncaught page errors, ignoring known third-party tracker noise. */
function trackPageErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('pageerror', (err) => {
    if (!/google|doubleclick|adsbygoogle/i.test(err.message)) errors.push(err.message);
  });
  return errors;
}

test.describe('REG-004: Legal pages render correctly from markdown', () => {
  for (const legal of LEGAL_PAGES) {
    test(`${legal.path}: status, heading, sections and metadata`, async ({ page }) => {
      const errors = trackPageErrors(page);
      const res = await page.goto(legal.path);
      expect(res?.status()).toBe(200);

      await expect(page).toHaveTitle(legal.title);
      await expect(page.locator('h1')).toHaveCount(1);
      await expect(page.locator('h1')).toHaveText(legal.h1);
      await expect(page.getByText(/^Last Updated: [A-Z][a-z]+ \d{4}/)).toBeVisible();

      for (const section of legal.sections) {
        await expect(page.getByRole('heading', { level: 2, name: section })).toBeVisible();
      }

      // Self-referencing canonical
      const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
      expect(canonical).toMatch(new RegExp(`${legal.path}$`));

      // No unresolved markdown placeholders or raw markdown syntax leaking into the page
      const text = await page.locator('main, body').first().innerText();
      expect(text).not.toContain('{{');
      expect(text).not.toMatch(/^:::/m);
      expect(text).not.toContain('**');

      expect(errors).toEqual([]);
    });
  }

  test('/privacy: key links and safe external link attributes', async ({ page }) => {
    await page.goto('/privacy');

    await expect(page.locator('a[href="mailto:dpo@beforethenumbers.org"]').first()).toBeVisible();
    await expect(page.getByRole('link', { name: 'Contact Page' })).toHaveAttribute('href', '/contact');

    for (const href of ['https://myadcenter.google.com/', 'https://optout.aboutads.info/']) {
      const link = page.locator(`a[href="${href}"]`);
      await expect(link).toHaveAttribute('target', '_blank');
      await expect(link).toHaveAttribute('rel', /noopener/);
    }

    await expect(page.getByText('Zero health records are stored on a central server')).toBeVisible();
  });

  test('/terms: amber disclaimer panel and in-page navigation', async ({ page }) => {
    await page.goto('/terms');

    const disclaimer = page.locator('section.bg-amber-50');
    await expect(disclaimer).toBeVisible();
    await expect(disclaimer).toContainText('NOT medical advice, clinical diagnosis, or a treatment plan');
    await expect(page.getByText('Platform: www.beforethenumbers.org')).toBeVisible();

    await page.getByRole('main').getByRole('link', { name: /Privacy Policy/ }).click();
    await expect(page).toHaveURL(/\/privacy$/);
    await expect(page.locator('h1')).toHaveText('Privacy Policy & Data Protection');
  });

  test('/privacy: in-page navigation reaches /terms', async ({ page }) => {
    await page.goto('/privacy');
    await page.getByRole('main').getByRole('link', { name: /Terms of Service/ }).click();
    await expect(page).toHaveURL(/\/terms$/);
    await expect(page.locator('h1')).toHaveText('Terms of Service & Clinical Disclaimer');
  });

  test('legal pages have no horizontal overflow on a mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 800 });
    for (const legal of LEGAL_PAGES) {
      await page.goto(legal.path);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth
      );
      expect(overflow, `${legal.path} overflows horizontally`).toBeLessThanOrEqual(0);
    }
  });
});

test.describe('REG-005: Legacy legal URLs redirect permanently', () => {
  for (const [from, to] of [
    ['/privacy-policy', '/privacy'],
    ['/terms-of-service', '/terms'],
  ]) {
    test(`${from} -> ${to}`, async ({ page, request }) => {
      const res = await request.get(from, { maxRedirects: 0 });
      expect([301, 308]).toContain(res.status());
      expect(res.headers()['location']).toMatch(new RegExp(`${to}$`));

      await page.goto(from);
      await expect(page).toHaveURL(new RegExp(`${to}$`));
      await expect(page.locator('h1')).toBeVisible();
    });
  }
});

test.describe('REG-006: Global footer notices (markdown-driven) on every page', () => {
  for (const path of ['/', '/learn', '/community', '/privacy', '/terms']) {
    test(`${path}: footer copyright, disclaimer and privacy notice`, async ({ page }) => {
      await page.goto(path);
      const footer = page.getByRole('contentinfo');
      await expect(footer).toBeVisible();

      await expect(footer).toContainText(
        new RegExp(`© ${new Date().getFullYear()} .+\\. All rights reserved\\.`)
      );
      await expect(footer.getByText('Medical Disclaimer:')).toBeVisible();
      await expect(footer).toContainText('must not be used as medical advice, diagnosis, or treatment');
      await expect(footer.getByText('Data Privacy & Security Notice:')).toBeVisible();
      await expect(footer).toContainText('Republic Act No. 10173');
      await expect(footer).not.toContainText('{{');
      await expect(footer).not.toContainText('**');
    });
  }

  test('footer links navigate to the markdown-driven legal pages', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('contentinfo').getByRole('link', { name: 'Privacy Policy' }).click();
    await expect(page).toHaveURL(/\/privacy$/);
    await expect(page.locator('h1')).toHaveText('Privacy Policy & Data Protection');

    await page.getByRole('contentinfo').getByRole('link', { name: 'Terms of Service' }).click();
    await expect(page).toHaveURL(/\/terms$/);
    await expect(page.locator('h1')).toHaveText('Terms of Service & Clinical Disclaimer');
  });
});

test.describe('REG-007: Sitemap lists the canonical legal URLs only', () => {
  test('/sitemap.xml contains all 6 canonical legal URLs and not legacy routes', async ({ request }) => {
    const res = await request.get('/sitemap.xml');
    expect(res.status()).toBe(200);
    const xml = await res.text();

    for (const slug of ['/privacy', '/terms', '/refund-policy', '/medical-disclaimer', '/disclosure', '/copyright']) {
      expect(xml).toMatch(new RegExp(`<loc>[^<]*${slug}</loc>`));
    }
    expect(xml).not.toContain('/privacy-policy');
    expect(xml).not.toContain('/terms-of-service');
  });
});
