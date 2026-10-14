import React from 'react';
import ReactDOMServer from 'react-dom/server';
import CurationBylines from '../../../src/components/learning/CurationBylines';

describe('CurationBylines Component (Issue #44 3-Layer Bylines)', () => {
  it('should render primary authority, curation attribution, and honest safety advisory by default', () => {
    const html = ReactDOMServer.renderToString(
      <CurationBylines
        authorityName="Dr. Benjamin Bikman, PhD"
        authorityTitle="Professor of Cell Biology & Physiology, BYU"
        editorialDesk="Before the Numbers Editorial Desk"
        evidenceLevel="Expert Clinical Lecture"
      />
    );

    // Layer 1: Primary Authority
    expect(html).toContain('Dr. Benjamin Bikman, PhD');
    expect(html).toContain('Professor of Cell Biology &amp; Physiology, BYU');

    // Layer 2: Editorial Curation
    expect(html).toContain('Curated &amp; Synthesized by Before the Numbers Editorial Desk');

    // Layer 3: Honest Safety Advisory (replaces fictitious Clinical Review Desk)
    expect(html).toContain('Educational resource only — consult your doctor before medication changes.');
    expect(html).not.toContain('Clinical Review Desk');

    // Evidence Hierarchy Badge
    expect(html).toContain('Expert Clinical Lecture');
  });

  it('should render verified medical reviewer when a licensed clinician is explicitly provided', () => {
    const html = ReactDOMServer.renderToString(
      <CurationBylines
        authorityName="Dr. Benjamin Bikman, PhD"
        clinicalReviewer="Dr. Sarah Jenkins, MD"
      />
    );

    expect(html).toContain('Medically Reviewed for Safety by Dr. Sarah Jenkins, MD');
  });

  it('should apply fallback defaults when optional props are omitted and never emit fictitious claims', () => {
    const html = ReactDOMServer.renderToString(
      <CurationBylines
        authorityName="Dr. Jason Fung, MD"
      />
    );

    // Primary Authority
    expect(html).toContain('Dr. Jason Fung, MD');

    // Default Editorial Desk
    expect(html).toContain('Curated &amp; Synthesized by Before the Numbers');

    // Honest Safety Advisory fallback
    expect(html).toContain('Educational resource only — consult your doctor before medication changes.');
    expect(html).not.toContain('Clinical Review Desk');
  });
});
