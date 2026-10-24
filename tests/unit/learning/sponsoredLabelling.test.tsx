/**
 * Unit Test Suite for Catalog Hygiene, Sponsored Content Labelling, and Fasting Safety (Item P2-04).
 *
 * @usecase Validates that sponsored resources carry clear disclaimers, admin filtering works,
 * and fasting topics prompt clinical safety boxes.
 */
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import LearningHubClient from '@/components/learning/LearningHubClient';
import ResourceModal from '@/components/admin/learning/ResourceModal';
import ResourcesManagerClient from '@/components/admin/learning/ResourcesManagerClient';
import { LearningResourceService } from '@/services/learning/LearningResourceService';
import { LearningResourceModel } from '@/models/LearningResource';
import { ILearningResource, IAuthority } from '@/types/learning';

jest.mock('@/lib/dbConnect', () => ({
  dbConnect: jest.fn().mockResolvedValue(true),
}));

jest.mock('@/models/LearningResource');

jest.mock('@/models/Authority', () => ({
  AuthorityModel: {
    find: jest.fn().mockReturnValue({
      lean: jest.fn().mockResolvedValue([
        {
          _id: 'auth_1',
          name: 'Dr. Jason Fung',
          slug: 'dr-jason-fung',
          title: 'Nephrologist',
          specialties: ['Intermittent Fasting'],
          isActive: true,
        },
      ]),
    }),
  },
}));

jest.mock('@/components/ads/AdUnit', () => {
  return function MockAdUnit() {
    return <div data-testid="ad-unit">Ad Unit</div>;
  };
});

jest.mock('@/analytics', () => ({
  dispatchFeedFilterClick: jest.fn(),
  dispatchResourceClick: jest.fn(),
  dispatchAffiliateBookClick: jest.fn(),
  dispatchRoadmapStepClick: jest.fn(),
  dispatchEmailSignup: jest.fn(),
  dispatchLeadMagnetDownload: jest.fn(),
}));

const mockAuthority: IAuthority = {
  _id: 'auth_1',
  name: 'Dr. Jason Fung',
  slug: 'dr-jason-fung',
  title: 'Nephrologist',
  specialties: ['Intermittent Fasting', 'Insulin Resistance'],
  autoPublish: true,
  isActive: true,
  displayOrder: 1,
};

const mockResources: ILearningResource[] = [
  {
    _id: 'res_sponsored_video',
    title: 'Continuous Glucose Monitoring Masterclass',
    slug: 'cgm-masterclass-video',
    type: 'video',
    authorityId: 'auth_1',
    authorityName: 'Dr. Jason Fung',
    sourceUrl: 'https://youtube.com/watch?v=cgm123',
    platform: 'youtube',
    embedId: 'cgm123',
    duration: '15:00',
    summary: 'A deep dive into sensor calibration and glycemic indices.',
    keyTakeaways: ['CGMs show real-time glucose spikes.'],
    topics: ['Continuous Glucose Monitoring', 'Technology'],
    status: 'published',
    sponsored: true,
    sponsorName: 'GlycoSense',
  },
  {
    _id: 'res_study_sponsored',
    title: 'Trial of Time-Restricted Eating in Metabolic Syndrome',
    slug: 'trial-tre-metabolic-syndrome',
    type: 'study',
    authorityId: 'auth_1',
    authorityName: 'Dr. Jason Fung',
    sourceUrl: 'https://nejm.org/doi/10.1056/NEJMoa123',
    platform: 'web',
    duration: '10 min read',
    summary: 'A randomized controlled clinical evaluation.',
    keyTakeaways: ['Eating windows correlate with insulin reduction.'],
    topics: ['Intermittent Fasting', 'Clinical Trials'],
    status: 'published',
    sponsored: true,
  },
  {
    _id: 'res_book_sponsored',
    title: 'The Diabetes Reset Protocol',
    slug: 'the-diabetes-reset-protocol',
    type: 'book',
    authorityId: 'auth_1',
    authorityName: 'Dr. Jason Fung',
    sourceUrl: 'https://amazon.com/dp/sample',
    platform: 'web',
    duration: '320 pages',
    summary: 'Practical dietary guide.',
    keyTakeaways: ['Whole foods reduce post-prandial glycemic excursions.'],
    topics: ['Nutrition', 'Intermittent Fasting'],
    status: 'published',
    sponsored: true,
    sponsorName: 'HealthPress',
  },
  {
    _id: 'res_organic_video',
    title: 'Insulin Resistance Explained',
    slug: 'insulin-resistance-explained',
    type: 'video',
    authorityId: 'auth_1',
    authorityName: 'Dr. Jason Fung',
    sourceUrl: 'https://youtube.com/watch?v=organic123',
    platform: 'youtube',
    embedId: 'organic123',
    duration: '20:00',
    summary: 'Standard non-sponsored physiology lesson.',
    keyTakeaways: ['Hyperinsulinemia precedes hyperglycemia.'],
    topics: ['Insulin Resistance'],
    status: 'published',
    sponsored: false,
  },
];

describe('P2-04: Catalog Hygiene & Sponsored Content Labelling', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('LearningResourceService.listResources Filtering', () => {
    it('queries for sponsored === true when sponsored filter is true', async () => {
      (LearningResourceModel.find as jest.Mock).mockReturnValue({
        sort: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue([mockResources[0]]),
        }),
      });

      const result = await LearningResourceService.listResources({ sponsored: true });
      expect(result.resources).toHaveLength(1);
      expect(LearningResourceModel.find).toHaveBeenCalledWith(
        expect.objectContaining({ sponsored: true })
      );
    });

    it('queries for sponsored $ne true when sponsored filter is false', async () => {
      (LearningResourceModel.find as jest.Mock).mockReturnValue({
        sort: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue([mockResources[3]]),
        }),
      });

      const result = await LearningResourceService.listResources({ sponsored: false });
      expect(result.resources).toHaveLength(1);
      expect(LearningResourceModel.find).toHaveBeenCalledWith(
        expect.objectContaining({ sponsored: { $ne: true } })
      );
    });
  });

  describe('Public Catalog Sponsored Content Labelling', () => {
    it('renders "Sponsored by [Partner]" badge on sponsored video cards', () => {
      const html = ReactDOMServer.renderToString(
        <LearningHubClient
          initialAuthorities={[mockAuthority]}
          initialResources={mockResources}
          initialArticles={[]}
        />
      );

      expect(html).toContain('data-testid="sponsored-badge-cgm-masterclass-video"');
      expect(html).toContain('Sponsored by GlycoSense');
    });

    it('renders fallback "Sponsored Content" when sponsorName is omitted', () => {
      const html = ReactDOMServer.renderToString(
        <LearningHubClient
          initialAuthorities={[mockAuthority]}
          initialResources={mockResources}
          initialArticles={[]}
        />
      );

      expect(html).toContain('data-testid="sponsored-badge-trial-tre-metabolic-syndrome"');
      expect(html).toContain('Sponsored Content');
    });

    it('renders sponsored badge on sponsored book cards', () => {
      const html = ReactDOMServer.renderToString(
        <LearningHubClient
          initialAuthorities={[mockAuthority]}
          initialResources={mockResources}
          initialArticles={[]}
        />
      );

      expect(html).toContain('data-testid="sponsored-badge-the-diabetes-reset-protocol"');
      expect(html).toContain('Sponsored by HealthPress');
    });

    it('does not render sponsored badge on organic resources', () => {
      const html = ReactDOMServer.renderToString(
        <LearningHubClient
          initialAuthorities={[mockAuthority]}
          initialResources={mockResources}
          initialArticles={[]}
        />
      );

      expect(html).not.toContain('data-testid="sponsored-badge-insulin-resistance-explained"');
    });
  });

  describe('Fasting Safety Banner & Topic Disclaimers', () => {
    it('displays fasting clinical safety box when initialTopic is fasting-related', () => {
      const html = ReactDOMServer.renderToString(
        <LearningHubClient
          initialAuthorities={[mockAuthority]}
          initialResources={mockResources}
          initialArticles={[]}
          initialTopic="Intermittent Fasting"
        />
      );

      expect(html).toContain('data-testid="fasting-safety-box"');
      expect(html).toContain('Clinical Safety &amp; Guidance Notice');
      expect(html).toContain('Fasting &amp; Dietary Changes:');
    });

    it('does not display fasting clinical safety box when initialTopic is All or non-fasting', () => {
      const html = ReactDOMServer.renderToString(
        <LearningHubClient
          initialAuthorities={[mockAuthority]}
          initialResources={mockResources}
          initialArticles={[]}
          initialTopic="All"
        />
      );

      expect(html).not.toContain('data-testid="fasting-safety-box"');
    });
  });

  describe('Admin Sponsored Controls', () => {
    it('ResourceModal renders Flag as Sponsored Content checkbox and sponsor input', () => {
      const html = ReactDOMServer.renderToString(
        <ResourceModal
          isOpen={true}
          onClose={jest.fn()}
          onSubmit={jest.fn()}
          submitting={false}
          initialData={mockResources[0]}
        />
      );

      expect(html).toContain('Flag as Sponsored Content / Commercial Partner');
      expect(html).toContain('GlycoSense');
    });

    it('ResourcesManagerClient renders sponsored filter options and sponsored card indicator', () => {
      const html = ReactDOMServer.renderToString(
        <ResourcesManagerClient
          initialResources={mockResources}
          totalCount={4}
        />
      );

      expect(html).toContain('All Sponsorship');
      expect(html).toContain('⭐ Sponsored Only');
      expect(html).toContain('🌿 Organic Only');
      expect(html).toContain('★ Sponsored by GlycoSense');
    });
  });
});
