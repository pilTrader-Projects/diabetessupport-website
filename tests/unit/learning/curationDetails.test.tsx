import React from 'react';
import ReactDOMServer from 'react-dom/server';
import CurationDetails from '../../../src/components/learning/CurationDetails';
import { ILearningResource } from '../../../src/types/learning';

describe('CurationDetails Component (Issue #44 Standardized Curation Template)', () => {
  const mockResource: ILearningResource = {
    _id: 'res_101',
    title: 'Cellular Mechanisms of Hyperinsulinemia',
    slug: 'cellular-mechanisms-hyperinsulinemia',
    type: 'video',
    authorityName: 'Dr. Benjamin Bikman, PhD',
    authorityTitle: 'Professor of Cell Biology',
    summary: 'Chronically elevated insulin forces adipocytes into an anabolic lock.',
    keyTakeaways: [
      'Elevated insulin suppresses hormone-sensitive lipase (HSL).',
      'Hepatic de novo lipogenesis increases triglyceride output.',
      'Skeletal muscle glycogen depletion enhances insulin sensitivity.',
    ],
    sourceUrl: 'https://www.youtube.com/watch?v=sample123',
    platform: 'youtube',
    topics: ['Insulin Resistance', 'Ketosis'],
    status: 'published',
    discussionQuestions: [
      'How does my current fasting insulin compare to optimal metabolic ranges?',
    ],
    citations: ['Bikman B et al. Cell Metab 2020.'],
  };

  it('should render executive takeaway, core mechanisms, clinical safety box, and physician questions', () => {
    const html = ReactDOMServer.renderToString(<CurationDetails resource={mockResource} />);

    // Executive Takeaway
    expect(html).toContain('Executive Scientific Takeaway');
    expect(html).toContain(mockResource.summary);

    // Core Mechanisms (Key Takeaways)
    expect(html).toContain('Core Biological Mechanisms');
    expect(html).toContain('Elevated insulin suppresses hormone-sensitive lipase (HSL).');

    // Clinical Safety Box
    expect(html).toContain('Clinical Safety &amp; Guidance Notice');
    expect(html).toContain('Do Not Adjust Medications Independently');

    // Practical Doctor Questions
    expect(html).toContain('Questions to Explore with Your Physician');
    expect(html).toContain('How does my current fasting insulin compare to optimal metabolic ranges?');

    // Primary Citations
    expect(html).toContain('Primary Scientific Citations &amp; Source Attribution');
    expect(html).toContain('Bikman B et al. Cell Metab 2020.');
  });
});
