import React from 'react';
import ReactDOMServer from 'react-dom/server';
import LearningRoadmapSection from '@/components/learning/LearningRoadmapSection';
import { ResolvedRoadmapStep } from '@/services/learning/roadmapService';
import { dispatchRoadmapStepClick } from '@/analytics';

jest.mock('@/analytics', () => ({
  dispatchRoadmapStepClick: jest.fn(),
  dispatchEmailSignup: jest.fn(),
  dispatchLeadMagnetDownload: jest.fn(),
}));

jest.mock('next/image', () => {
  return function MockImage(props: any) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} alt={props.alt || ''} />;
  };
});

describe('P2-02: LearningRoadmapSection UI Component', () => {
  const mockSteps = [
    {
      step: {
        id: 'understand',
        order: 1,
        title: 'Understand',
        goal: 'What insulin does and why cells become resistant.',
        resourceSlugs: ['slug-1', 'slug-2'],
      },
      resources: [
        {
          _id: 'r1',
          title: 'What is Insulin?',
          slug: 'slug-1',
          authorityName: 'Dr. Jamnadas',
          status: 'published',
          editionNote: 'Foundational physiology lecture.',
          thumbnailUrl: 'https://img.youtube.com/vi/123/hqdefault.jpg',
        },
        {
          _id: 'r2',
          title: 'What is Insulin Resistance?',
          slug: 'slug-2',
          authorityName: 'Dr. Jason Fung',
          status: 'published',
          editionNote: 'Receptor downregulation mechanics.',
          thumbnailUrl: 'https://img.youtube.com/vi/456/hqdefault.jpg',
        },
      ],
      edition: 'global',
    },
    {
      step: {
        id: 'spot-signs',
        order: 2,
        title: 'Spot the Signs',
        goal: 'Why standard fasting glucose tests can look normal.',
        resourceSlugs: ['slug-3', 'slug-4'],
      },
      resources: [
        {
          _id: 'r3',
          title: 'Your blood sugar can look normal',
          slug: 'slug-3',
          authorityName: 'Dr. Ken Berry',
          status: 'published',
          editionNote: 'Early pancreatic compensation.',
        },
        {
          _id: 'r4',
          title: 'What Your Glucose Monitor Is Missing',
          slug: 'slug-4',
          authorityName: 'Dr. Ben Bikman',
          status: 'published',
          editionNote: 'Insulin trajectories.',
        },
      ],
      edition: 'global',
    },
    {
      step: {
        id: 'know-causes',
        order: 3,
        title: 'Know the Causes',
        goal: 'Food frequency, refined carbohydrates, and visceral fat.',
        resourceSlugs: ['slug-5'],
      },
      resources: [
        {
          _id: 'r5',
          title: 'What Causes Insulin Resistance?',
          slug: 'slug-5',
          authorityName: 'Dr. Jason Fung',
          status: 'published',
        },
      ],
      edition: 'global',
    },
    {
      step: {
        id: 'take-action',
        order: 4,
        title: 'Take Action',
        goal: 'Evidence-based nutrition changes and daily muscle movement.',
        resourceSlugs: ['slug-6'],
      },
      resources: [
        {
          _id: 'r6',
          title: 'How To Reverse Insulin Resistance',
          slug: 'slug-6',
          authorityName: 'Dr. Ben Bikman',
          status: 'published',
        },
      ],
      edition: 'global',
    },
    {
      step: {
        id: 'stay-safe',
        order: 5,
        title: 'Stay Safe',
        goal: 'Essential medication precautions and clinical monitoring.',
        safetyNote: 'Consult your prescribing physician before altering your diet.',
        resourceSlugs: ['slug-7'],
      },
      resources: [
        {
          _id: 'r7',
          title: 'Fasting and medication precautions',
          slug: 'slug-7',
          authorityName: 'Dr. Jason Fung',
          status: 'published',
        },
      ],
      edition: 'global',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    delete process.env.NEXT_PUBLIC_FLAG_STARTER_PACK;
  });

  it('instantiates cleanly and renders all 5 sequential steps', () => {
    const html = ReactDOMServer.renderToString(<LearningRoadmapSection steps={mockSteps as unknown as ResolvedRoadmapStep[]} />);

    expect(html).toContain('5 Steps to Understand &amp; Reverse Insulin Resistance');
    expect(html).toContain('Step 1: Understand');
    expect(html).toContain('Step 2: Spot the Signs');
    expect(html).toContain('Step 3: Know the Causes');
    expect(html).toContain('Step 4: Take Action');
    expect(html).toContain('Step 5: Stay Safe');

    expect(html).toContain('What insulin does and why cells become resistant');
  });

  it('renders resource cards with titles, authorities, and localized notes', () => {
    const html = ReactDOMServer.renderToString(<LearningRoadmapSection steps={mockSteps as unknown as ResolvedRoadmapStep[]} />);

    expect(html).toContain('What is Insulin?');
    expect(html).toContain('Dr. Jamnadas');
    expect(html).toContain('Foundational physiology lecture.');

    expect(html).toContain('What is Insulin Resistance?');
    expect(html).toContain('Dr. Jason Fung');
    expect(html).toContain('Receptor downregulation mechanics.');
  });

  it('renders <EmailCapture source="learn-roadmap" /> immediately after Step 2', () => {
    const html = ReactDOMServer.renderToString(<LearningRoadmapSection steps={mockSteps as unknown as ResolvedRoadmapStep[]} />);

    expect(html).toContain('data-testid="learn-roadmap-email-capture"');
    expect(html).toContain('Keep Your Roadmap Progress');
  });

  it('renders Clinical Safety Notice immediately before Step 5', () => {
    const html = ReactDOMServer.renderToString(<LearningRoadmapSection steps={mockSteps as unknown as ResolvedRoadmapStep[]} />);

    expect(html).toContain('data-testid="learn-roadmap-safety-notice"');
    expect(html).toContain('Clinical Safety &amp; Guidance Notice');
    expect(html).toContain('Do Not Adjust Medications Independently');
  });

  it('hides Starter Pack slot by default when NEXT_PUBLIC_FLAG_STARTER_PACK is false/undefined', () => {
    const html = ReactDOMServer.renderToString(<LearningRoadmapSection steps={mockSteps as unknown as ResolvedRoadmapStep[]} />);

    expect(html).not.toContain('data-testid="starter-pack-slot"');
  });

  it('renders Starter Pack slot when NEXT_PUBLIC_FLAG_STARTER_PACK="true"', () => {
    process.env.NEXT_PUBLIC_FLAG_STARTER_PACK = 'true';
    const html = ReactDOMServer.renderToString(<LearningRoadmapSection steps={mockSteps as unknown as ResolvedRoadmapStep[]} />);

    expect(html).toContain('data-testid="starter-pack-slot"');
    expect(html).toContain('Filipino Metabolic Starter Pack');
  });

  it('renders accessible checkboxes with proper aria-labels and progress indicators', () => {
    const html = ReactDOMServer.renderToString(<LearningRoadmapSection steps={mockSteps as unknown as ResolvedRoadmapStep[]} />);

    expect(html).toContain('aria-label="Mark &quot;What is Insulin?&quot; as completed"');
    expect(html).toContain('Mark as done');
    expect(html).toMatch(/0.*\/.*7.*Done/);
  });

  it('renders step links for shareable step routing', () => {
    const html = ReactDOMServer.renderToString(<LearningRoadmapSection steps={mockSteps as unknown as ResolvedRoadmapStep[]} />);

    expect(html).toContain('href="/learn/roadmap/understand"');
    expect(html).toContain('href="/learn/roadmap/spot-signs"');
    expect(html).toContain('href="/learn/roadmap/stay-safe"');
  });

  describe('Edge Cases & Defensive Boundaries', () => {
    it('gracefully renders empty string when steps array is empty', () => {
      const html = ReactDOMServer.renderToString(<LearningRoadmapSection steps={[]} />);
      expect(html).toBe('');
    });

    it('renders fallback placeholder when resource thumbnail is null, undefined, or empty', () => {
      const stepWithEmptyThumb = {
        step: {
          id: 'understand',
          order: 1,
          title: 'Understand',
          goal: 'Insulin dynamics',
          resourceSlugs: ['no-thumb-res'],
        },
        resources: [
          {
            _id: 'r_no_thumb',
            title: 'No Thumb Lecture',
            slug: 'no-thumb-res',
            authorityName: 'Dr. Test',
            status: 'published',
            thumbnailUrl: '',
          },
        ],
        edition: 'global',
      } as unknown as ResolvedRoadmapStep;

      const html = ReactDOMServer.renderToString(<LearningRoadmapSection steps={[stepWithEmptyThumb]} />);
      expect(html).toContain('▶ Video Lecture');
      expect(html).toContain('No Thumb Lecture');
    });

    it('handles steps with empty resources array without NaN or division-by-zero errors', () => {
      const stepWithNoResources = {
        step: {
          id: 'understand',
          order: 1,
          title: 'Empty Step',
          goal: 'No resources yet',
          resourceSlugs: [],
        },
        resources: [],
        edition: 'global',
      } as unknown as ResolvedRoadmapStep;

      const html = ReactDOMServer.renderToString(<LearningRoadmapSection steps={[stepWithNoResources]} />);
      expect(html).toMatch(/0.*of.*0.*completed/);
      expect(html).toMatch(/0.*\/.*0.*Done/);
      expect(html).toContain('style="width:0%"');
      expect(html).not.toContain('NaN');
    });

    it('propagates edition="ph" to EmailCapture and localized context', () => {
      const html = ReactDOMServer.renderToString(
        <LearningRoadmapSection steps={mockSteps as unknown as ResolvedRoadmapStep[]} edition="ph" />
      );
      expect(html).toContain('Keep Your Roadmap Progress');
      expect(html).toContain('data-testid="learn-roadmap-email-capture"');
    });
  });
});

