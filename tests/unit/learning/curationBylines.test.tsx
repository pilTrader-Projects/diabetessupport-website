import React from 'react';
import ReactDOMServer from 'react-dom/server';
import CurationBylines from '../../../src/components/learning/CurationBylines';

describe('CurationBylines Component (Issue #44 3-Layer Bylines)', () => {
  it('should render all 3 layers of curation authorship accurately', () => {
    const html = ReactDOMServer.renderToString(
      <CurationBylines
        authorityName="Dr. Benjamin Bikman, PhD"
        authorityTitle="Professor of Cell Biology & Physiology, BYU"
        editorialDesk="Before the Numbers Editorial Desk"
        clinicalReviewer="Clinical Safety Review Desk"
        evidenceLevel="Expert Clinical Lecture"
      />
    );

    // Layer 1: Primary Authority
    expect(html).toContain('Dr. Benjamin Bikman, PhD');
    expect(html).toContain('Professor of Cell Biology &amp; Physiology, BYU');

    // Layer 2: Editorial Desk
    expect(html).toContain('Curated &amp; Synthesized by Before the Numbers Editorial Desk');

    // Layer 3: Clinical Safety Review
    expect(html).toContain('Medically Reviewed for Safety by Clinical Safety Review Desk');

    // Evidence Hierarchy Badge
    expect(html).toContain('Expert Clinical Lecture');
  });

  it('should apply fallback defaults when optional props are omitted', () => {
    const html = ReactDOMServer.renderToString(
      <CurationBylines
        authorityName="Dr. Jason Fung, MD"
      />
    );

    // Primary Authority
    expect(html).toContain('Dr. Jason Fung, MD');

    // Default Editorial Desk
    expect(html).toContain('Curated &amp; Synthesized by Before the Numbers Editorial Desk');

    // Default Clinical Review Desk
    expect(html).toContain('Medically Reviewed for Safety by Before the Numbers Clinical Review Desk');
  });
});
