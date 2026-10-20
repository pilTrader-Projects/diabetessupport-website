import React from 'react';
import ReactDOMServer from 'react-dom/server';
import PrivacyPage, { metadata as privacyMetadata } from '@/app/privacy/page';
import TermsPage, { metadata as termsMetadata } from '@/app/terms/page';
import RefundPolicyPage, { metadata as refundMetadata } from '@/app/refund-policy/page';
import MedicalDisclaimerPage, { metadata as medicalMetadata } from '@/app/medical-disclaimer/page';
import DisclosurePage, { metadata as disclosureMetadata } from '@/app/disclosure/page';
import CopyrightPage, { metadata as copyrightMetadata } from '@/app/copyright/page';

describe('Markdown-driven legal pages suite (P0-01)', () => {
  describe('Canonical metadata export', () => {
    it('/privacy exports metadata with canonical /privacy', () => {
      expect(privacyMetadata.title).toBe('Privacy Policy & Data Security Notice | Before the Numbers');
      expect(privacyMetadata.alternates?.canonical).toBe('/privacy');
    });

    it('/terms exports metadata with canonical /terms', () => {
      expect(termsMetadata.title).toBe('Terms of Service & Medical Safe Harbor | Before the Numbers');
      expect(termsMetadata.alternates?.canonical).toBe('/terms');
    });

    it('/refund-policy exports metadata with canonical /refund-policy', () => {
      expect(refundMetadata.title).toBe('Refund Policy | Before the Numbers');
      expect(refundMetadata.alternates?.canonical).toBe('/refund-policy');
    });

    it('/medical-disclaimer exports metadata with canonical /medical-disclaimer', () => {
      expect(medicalMetadata.title).toBe('Medical Disclaimer & Clinical Safety Notice | Before the Numbers');
      expect(medicalMetadata.alternates?.canonical).toBe('/medical-disclaimer');
    });

    it('/disclosure exports metadata with canonical /disclosure', () => {
      expect(disclosureMetadata.title).toBe('Advertising & Affiliate Disclosure | Before the Numbers');
      expect(disclosureMetadata.alternates?.canonical).toBe('/disclosure');
    });

    it('/copyright exports metadata with canonical /copyright', () => {
      expect(copyrightMetadata.title).toBe('Copyright & Takedown Policy | Before the Numbers');
      expect(copyrightMetadata.alternates?.canonical).toBe('/copyright');
    });
  });

  describe('Page content rendering from markdown', () => {
    it('privacy renders a single h1, last-updated line and original wording', () => {
      const html = ReactDOMServer.renderToStaticMarkup(<PrivacyPage />);
      expect((html.match(/<h1/g) || []).length).toBe(1);
      expect(html).toContain('Privacy Policy &amp; Data Protection');
      expect(html).toContain('Last Updated: October 2026');
      expect(html).toContain('Republic Act No. 10173');
      expect(html).toContain('Zero health records are stored on a central server');
      expect(html).toContain('href="mailto:dpo@beforethenumbers.org"');
      expect(html).toContain('href="/terms"');
      expect(html).toContain('href="/contact"');
    });

    it('privacy external links open safely', () => {
      const html = ReactDOMServer.renderToStaticMarkup(<PrivacyPage />);
      expect(html).toContain('href="https://myadcenter.google.com/"');
      expect(html).toContain('rel="noopener noreferrer"');
    });

    it('terms renders disclaimer, numbered sections and placeholders resolved', () => {
      const html = ReactDOMServer.renderToStaticMarkup(<TermsPage />);
      expect((html.match(/<h1/g) || []).length).toBe(1);
      expect(html).toContain('Mandatory Medical &amp; Non-Diagnostic Disclaimer');
      expect(html).toContain('Software as a Medical Device (SaMD) Safe Harbor');
      expect(html).toContain('Limitation of Liability');
      expect(html).toContain('owned by Before the Numbers');
      expect(html).toContain('Platform: www.beforethenumbers.org');
      expect(html).not.toContain('{{');
      expect(html).toContain('href="/privacy"');
      expect(html).toContain('href="/about"');
    });

    it('refund-policy renders 7-day refund window and billing contact', () => {
      const html = ReactDOMServer.renderToStaticMarkup(<RefundPolicyPage />);
      expect((html.match(/<h1/g) || []).length).toBe(1);
      expect(html).toContain('Refund &amp; Cancellation Policy');
      expect(html).toContain('7-day satisfaction refund period');
      expect(html).toContain('href="mailto:billing@beforethenumbers.org"');
      expect(html).toContain('href="/terms"');
      expect(html).toContain('href="/medical-disclaimer"');
      expect(html).not.toContain('{{');
    });

    it('medical-disclaimer renders emergency notice, medication warnings and SaMD disclaimer', () => {
      const html = ReactDOMServer.renderToStaticMarkup(<MedicalDisclaimerPage />);
      expect((html.match(/<h1/g) || []).length).toBe(1);
      expect(html).toContain('Medical &amp; Clinical Information Disclaimer');
      expect(html).toContain('Mandatory Emergency &amp; Non-Diagnostic Notice');
      expect(html).toContain('Prescription Medication Warning');
      expect(html).toContain('Fasting Precautions');
      expect(html).toContain('Software as a Medical Device (SaMD) Disclaimer');
      expect(html).toContain('href="/refund-policy"');
      expect(html).toContain('href="/disclosure"');
      expect(html).not.toContain('{{');
    });

    it('disclosure renders funding sources, AdSense cookies, and affiliate links rel sponsored', () => {
      const html = ReactDOMServer.renderToStaticMarkup(<DisclosurePage />);
      expect((html.match(/<h1/g) || []).length).toBe(1);
      expect(html).toContain('Transparency &amp; Editorial Disclosure');
      expect(html).toContain('Google AdSense');
      expect(html).toContain('rel=&quot;sponsored noopener noreferrer&quot;');
      expect(html).toContain('href="/medical-disclaimer"');
      expect(html).toContain('href="/copyright"');
      expect(html).not.toContain('{{');
    });

    it('copyright renders official YouTube embed policy and takedown contact', () => {
      const html = ReactDOMServer.renderToStaticMarkup(<CopyrightPage />);
      expect((html.match(/<h1/g) || []).length).toBe(1);
      expect(html).toContain('Copyright, Fair Use &amp; Content Removal Notice');
      expect(html).toContain('official YouTube embedded player API');
      expect(html).toContain('never use a speaker&#x27;s name, photograph, likeness, or quote to sell');
      expect(html).toContain('href="mailto:copyright@beforethenumbers.org"');
      expect(html).toContain('href="/disclosure"');
      expect(html).toContain('href="/privacy"');
      expect(html).not.toContain('{{');
    });
  });
});
