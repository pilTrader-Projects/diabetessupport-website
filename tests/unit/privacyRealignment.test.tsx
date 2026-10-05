import React from 'react';
import ReactDOMServer from 'react-dom/server';
import PrivacyPolicyPage, { metadata as privacyMetadata } from '@/app/privacy-policy/page';

describe('Privacy Policy & Storage Architecture Realignment (Issue #45)', () => {
  it('exports valid metadata with canonical link', () => {
    expect(privacyMetadata.title).toContain('Privacy Policy');
    expect(privacyMetadata.alternates?.canonical).toBe('/privacy-policy');
  });

  it('accurately discloses local device caching via localStorage', () => {
    const html = ReactDOMServer.renderToString(<PrivacyPolicyPage />);

    expect(html).toContain('Local Device Storage Architecture');
    expect(html).toContain('localStorage');
    expect(html).toContain('My Library');
    expect(html).toContain('anonymous bookmarks and saved reading lists are retained strictly on your device');
  });

  it('accurately discloses ephemeral cross-device pairing and zero permanent health logs on server', () => {
    const html = ReactDOMServer.renderToString(<PrivacyPolicyPage />);

    expect(html).toContain('Anonymous Cross-Device Pairing');
    expect(html).toContain('ephemeral 6-digit sync PIN');
    expect(html).toContain('10-minute validity');
    expect(html).toContain('Zero health records are stored on a central server');
  });

  it('provides explicit instructions for user data clearing and data export', () => {
    const html = ReactDOMServer.renderToString(<PrivacyPolicyPage />);

    expect(html).toContain('Data Rights, Export &amp; Local Deletion');
    expect(html).toContain('Clearing Local Browser Data');
    expect(html).toContain('dpo@beforethenumbers.org');
  });

  it('cites compliance with Philippine Data Privacy Act (RA 10173) and sensitive health data principles', () => {
    const html = ReactDOMServer.renderToString(<PrivacyPolicyPage />);

    expect(html).toContain('Republic Act No. 10173');
    expect(html).toContain('National Privacy Commission');
    expect(html).toContain('Sensitive Personal Information');
  });
});
