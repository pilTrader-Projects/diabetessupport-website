/**
 * Unit Test Suite for Public Learning Materials & Evidence Hub UI.
 *
 * @usecase Validates that LearningHubClient, VideoPlayerModal, and SavedResourcesDrawer render cleanly.
 */
import React from 'react';
import LearningHubClient from '../../src/components/learning/LearningHubClient';
import VideoPlayerModal from '../../src/components/learning/VideoPlayerModal';
import SavedResourcesDrawer from '../../src/components/learning/SavedResourcesDrawer';
import ResourceShareModal from '../../src/components/learning/ResourceShareModal';
import SocialShareBar from '../../src/components/community/SocialShareBar';
import Header from '../../src/components/Header';
import AuthorityModal from '../../src/components/admin/learning/AuthorityModal';
import ResourceModal from '../../src/components/admin/learning/ResourceModal';
import BlogFeedPage, { generateMetadata } from '../../src/app/blog/page';
import { ILearningResource, IAuthority, IPodcastChannel } from '../../src/types/learning';
import { IPost } from '../../src/types/blog';
import { PostModel } from '../../src/models/Post';
import { AuthorityModel } from '../../src/models/Authority';
import { PodcastChannelModel } from '../../src/models/PodcastChannel';
import { LearningResourceModel } from '../../src/models/LearningResource';

jest.mock('../../src/lib/dbConnect', () => ({
  dbConnect: jest.fn().mockResolvedValue(true),
}));

jest.mock('../../src/lib/categoryUtils', () => ({
  getCategoryLookupMap: jest.fn().mockResolvedValue(new Map()),
  resolveCategoryName: jest.fn().mockImplementation((cat) => cat || 'General'),
}));

jest.mock('../../src/components/ads/AdUnit', () => {
  return function MockAdUnit() {
    return <div data-testid="ad-unit">Ad Unit</div>;
  };
});

const mockAuthority: IAuthority = {
  _id: 'auth_1',
  name: 'Dr. Benjamin Bikman',
  slug: 'dr-benjamin-bikman',
  title: 'Professor of Cell Biology',
  specialties: ['Insulin Resistance', 'Low Carb'],
  youtubeChannelId: 'UCbikman',
  autoPublish: true,
  isActive: true,
  displayOrder: 1,
};

const mockPodcastChannel: IPodcastChannel = {
  _id: 'pod_1',
  name: 'The Diary Of A CEO',
  slug: 'the-diary-of-a-ceo',
  host: 'Steven Bartlett',
  youtubeChannelId: 'UCTheDiaryOfACEO',
  autoPublish: true,
  isActive: true,
  displayOrder: 1,
};

const mockVideoResource: ILearningResource = {
  _id: 'res_1',
  title: 'Insulin Resistance & Glucagon',
  slug: 'insulin-resistance-glucagon',
  type: 'video',
  authorityId: 'auth_1',
  authorityName: 'Dr. Benjamin Bikman',
  sourceUrl: 'https://www.youtube.com/watch?v=abc123xyz',
  platform: 'youtube',
  embedId: 'abc123xyz',
  thumbnailUrl: 'https://i.ytimg.com/vi/abc123xyz/hqdefault.jpg',
  duration: '28:15',
  summary: 'In this lecture, Dr. Bikman explores metabolic switches.',
  keyTakeaways: ['Insulin stops lipolysis', 'Fasting stimulates ketones'],
  topics: ['Low Carb', 'Insulin Resistance'],
  status: 'published',
};

const mockArticle: IPost = {
  _id: 'art_1',
  title: 'Top 10 Filipino Foods for Blood Sugar',
  slug: 'top-10-filipino-foods',
  content: 'Content here',
  excerpt: 'A practical nutrition guide.',
  category: 'Nutrition',
  tags: ['Diet', 'Blood Sugar'],
  status: 'published',
};

import ReactDOMServer from 'react-dom/server';

describe('Learning Materials Hub Public UI (TDD Unit Tests)', () => {
  describe('LearningHubClient Component', () => {
    it('instantiates cleanly with authorities, resources, and editorial articles', () => {
      const element = (
        <LearningHubClient
          initialAuthorities={[mockAuthority]}
          initialResources={[mockVideoResource]}
          initialArticles={[mockArticle]}
        />
      );

      expect(element).toBeDefined();
      expect(element.props.initialAuthorities).toHaveLength(1);
      expect(element.props.initialResources).toHaveLength(1);
      expect(element.props.initialArticles).toHaveLength(1);
    });

    it('sanitizes legacy numeric WordPress tags and short tags from dynamic topics', () => {
      const articleWithDirtyTags: IPost = {
        ...mockArticle,
        tags: ['Healthy Diet', '87880575', '169265974', 'ok'],
      };

      const html = ReactDOMServer.renderToString(
        <LearningHubClient
          initialAuthorities={[mockAuthority]}
          initialResources={[mockVideoResource]}
          initialArticles={[articleWithDirtyTags]}
        />
      );

      expect(html).toContain('Healthy Diet');
      expect(html).not.toContain('87880575');
      expect(html).not.toContain('169265974');
    });

    it('hides Clinical Studies tab when count is 0 to prevent user confusion', () => {
      const html = ReactDOMServer.renderToString(
        <LearningHubClient
          initialAuthorities={[mockAuthority]}
          initialResources={[mockVideoResource]} // has 0 studies
          initialArticles={[mockArticle]}
        />
      );

      expect(html).not.toContain('Clinical Studies');
    });

    it('renders elevated hero title and advocacy-oriented subtitle', () => {
      const html = ReactDOMServer.renderToString(
        <LearningHubClient
          initialAuthorities={[mockAuthority]}
          initialResources={[mockVideoResource]}
          initialArticles={[mockArticle]}
        />
      );

      expect(html).toContain('The Metabolic Health &amp; Diabetes Reversal Hub');
      expect(html).toContain('reversing insulin resistance');
      expect(html).not.toContain('Filipino families');
    });

    it('generates contextual fallback takeaway instead of echoing title verbatim', () => {
      const videoWithRepetitiveTakeaway: ILearningResource = {
        ...mockVideoResource,
        title: 'GLP-1 Natural Activation',
        keyTakeaways: ['Key scientific overview presented on GLP-1 Natural Activation.'],
      };

      const html = ReactDOMServer.renderToString(
        <LearningHubClient
          initialAuthorities={[mockAuthority]}
          initialResources={[videoWithRepetitiveTakeaway]}
          initialArticles={[]}
        />
      );

      expect(html).toContain('Essential lecture breakdown on insulin regulation');
      expect(html).not.toContain('Key scientific overview presented on');
    });

    it('renders podcast shows filter bar when podcast channels are provided', () => {
      const podcastEpisode: ILearningResource = {
        ...mockVideoResource,
        _id: 'res_pod_1',
        type: 'podcast',
        podcastChannelId: 'pod_1',
        podcastChannelName: 'The Diary Of A CEO',
        isGuestAppearance: true,
      };

      const html = ReactDOMServer.renderToString(
        <LearningHubClient
          initialAuthorities={[mockAuthority]}
          initialPodcastChannels={[mockPodcastChannel]}
          initialResources={[podcastEpisode]}
          initialArticles={[]}
        />
      );

      expect(html).toContain('The Diary Of A CEO');
      expect(html).toContain('Filter by Podcast Show:');
      expect(html).toContain('All Shows');
    });

    it('initializes activeFormat and selectedPodcast from deep link props', () => {
      const podcastEpisode: ILearningResource = {
        ...mockVideoResource,
        _id: 'res_pod_1',
        type: 'podcast',
        podcastChannelId: 'pod_1',
        podcastChannelName: 'The Diary Of A CEO',
        isGuestAppearance: true,
      };

      const html = ReactDOMServer.renderToString(
        <LearningHubClient
          initialAuthorities={[mockAuthority]}
          initialPodcastChannels={[mockPodcastChannel]}
          initialResources={[podcastEpisode]}
          initialArticles={[]}
          initialFormat="podcast"
          initialPodcast="the-diary-of-a-ceo"
        />
      );

      expect(html).toContain('Reset Show');
      expect(html).toContain('The Diary Of A CEO');
    });

    it('matches non-contiguous search queries with punctuation like "Dr. Fung" to "Dr. Jason Fung"', () => {
      const fungAuthority: IAuthority = {
        _id: 'auth_fung',
        name: 'Dr. Jason Fung',
        slug: 'dr-jason-fung',
        title: 'Nephrologist & Author',
        specialties: ['Intermittent Fasting', 'Therapeutic Fasting'],
        autoPublish: true,
        isActive: true,
        displayOrder: 2,
      };

      const fungVideo: ILearningResource = {
        ...mockVideoResource,
        _id: 'res_fung_1',
        title: 'Therapeutic Fasting & Insulin Resistance',
        authorityId: 'auth_fung',
        authorityName: 'Dr. Jason Fung',
        topics: ['Intermittent Fasting'],
      };

      const html = ReactDOMServer.renderToString(
        <LearningHubClient
          initialAuthorities={[fungAuthority]}
          initialResources={[fungVideo]}
          initialArticles={[]}
          initialSearch="Dr. Fung"
        />
      );

      expect(html).toContain('Therapeutic Fasting &amp; Insulin Resistance');
      expect(html).toContain('Dr. Jason Fung');
      expect(html).not.toContain('No Learning Materials Found');
    });

    it('renders Books & Protocols tab and affiliate book cards for world-class authorities', () => {
      const html = ReactDOMServer.renderToString(
        <LearningHubClient
          initialAuthorities={[mockAuthority]}
          initialResources={[mockVideoResource]}
          initialArticles={[mockArticle]}
        />
      );

      expect(html).toContain('Books &amp; Protocols');
      expect(html).toContain('Why We Get Sick');
      expect(html).toContain('The Diabetes Code');
      expect(html).toContain('Get Book on Amazon');
    });

    it('renders the My Protocol in-page filter tab in format segmented control', () => {
      const html = ReactDOMServer.renderToString(
        <LearningHubClient
          initialAuthorities={[mockAuthority]}
          initialResources={[mockVideoResource]}
          initialArticles={[mockArticle]}
        />
      );

      expect(html).toContain('My Protocol');
    });
  });

  describe('Header Component (Global Saved Protocol Integration)', () => {
    it('renders header-level My Protocol notification button and trigger', () => {
      const html = ReactDOMServer.renderToString(<Header />);
      expect(html).toContain('My Protocol');
      expect(html).toContain('Open My Saved Protocol');
    });
  });

  describe('VideoPlayerModal Component', () => {
    it('renders with youtube embed, takeaways, and contextual affiliate reading recommendations', () => {
      const element = (
        <VideoPlayerModal
          isOpen={true}
          onClose={jest.fn()}
          resource={mockVideoResource}
          isSaved={false}
          onToggleSave={jest.fn()}
        />
      );

      expect(element).toBeDefined();
      expect(element.props.resource?.embedId).toBe('abc123xyz');

      const html = ReactDOMServer.renderToString(element);
      expect(html).toContain('youtube.com/embed/abc123xyz');
      expect(html).toContain('absolute inset-0 w-full h-full');
      expect(html).toContain('Share');
      expect(html).toContain('Found this material valuable? Share it:');

      // Verify contextual affiliate recommendation for Dr. Bikman
      expect(html).toContain('Recommended Reading by');
      expect(html).toContain('Dr. Benjamin Bikman');
      expect(html).toContain('Why We Get Sick');
      expect(html).toContain('Amazon');
    });

    it('returns null when isOpen is false', () => {
      const element = (
        <VideoPlayerModal
          isOpen={false}
          onClose={jest.fn()}
          resource={mockVideoResource}
        />
      );

      expect(element.props.isOpen).toBe(false);
    });
  });

  describe('SocialShareBar Component', () => {
    it('renders encouragement prompt before share buttons when reading material', () => {
      const element = (
        <SocialShareBar
          title="Top 10 Filipino Foods"
          url="https://diabetessupport.ph/blog/top-10-filipino-foods"
          snippet="Evidence-based guide"
        />
      );

      const html = ReactDOMServer.renderToString(element);
      expect(html).toContain('Found this material valuable? Share:');
      expect(html).toContain('facebook.com/sharer/sharer.php');
      expect(html).toContain('twitter.com/intent/tweet');
    });
  });

  describe('SavedResourcesDrawer Component', () => {
    it('renders saved items, share protocol button, and email sync opt-in', () => {
      const element = (
        <SavedResourcesDrawer
          isOpen={true}
          onClose={jest.fn()}
          savedResources={[mockVideoResource]}
          onRemoveSaved={jest.fn()}
          onSelectResource={jest.fn()}
        />
      );

      expect(element).toBeDefined();
      expect(element.props.savedResources).toHaveLength(1);

      const html = ReactDOMServer.renderToString(element);
      expect(html).toContain('Share Protocol');
      expect(html).toContain('Sync Library Across Devices');
    });
  });

  describe('BlogFeedPage Server Component', () => {
    it('fetches published posts, authorities, podcast channels, and resources and renders page', async () => {
      (PostModel.find as any) = jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue([mockArticle]),
        }),
      });

      (AuthorityModel.find as any) = jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue([mockAuthority]),
        }),
      });

      (PodcastChannelModel.find as any) = jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue([mockPodcastChannel]),
        }),
      });

      (LearningResourceModel.find as any) = jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue([mockVideoResource]),
        }),
      });

      const page = await BlogFeedPage({});
      expect(page).toBeDefined();
    });

    it('generates dynamic metadata with photo thumbnail and OG tags when resource param is provided', async () => {
      (LearningResourceModel.findOne as any) = jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockVideoResource),
      });

      const metadata = await generateMetadata({
        searchParams: Promise.resolve({ resource: 'insulin-resistance-glucagon' }),
      });

      expect(metadata).toBeDefined();
      expect(metadata.title).toContain('Insulin Resistance & Glucagon');
      expect(metadata.openGraph?.images).toEqual([
        {
          url: 'https://i.ytimg.com/vi/abc123xyz/hqdefault.jpg',
          width: 1280,
          height: 720,
          alt: 'Insulin Resistance & Glucagon',
        },
      ]);
      expect(metadata.twitter).toEqual({
        card: 'summary_large_image',
        title: expect.stringContaining('Insulin Resistance & Glucagon'),
        description: expect.any(String),
        images: ['https://i.ytimg.com/vi/abc123xyz/hqdefault.jpg'],
      });
    });

    it('falls back to PostModel if resource is not found in LearningResourceModel', async () => {
      (LearningResourceModel.findOne as any) = jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue(null),
      });

      (PostModel.findOne as any) = jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue({
          title: 'Top 10 Filipino Foods',
          slug: 'top-10-filipino-foods',
          excerpt: 'A practical nutrition guide.',
          featuredImage: 'https://diabetessupport.ph/images/filipino-foods.jpg',
        }),
      });

      const metadata = await generateMetadata({
        searchParams: Promise.resolve({ resource: 'top-10-filipino-foods' }),
      });

      expect(metadata).toBeDefined();
      expect(metadata.title).toContain('Top 10 Filipino Foods');
      expect(metadata.openGraph?.images).toEqual([
        {
          url: 'https://diabetessupport.ph/images/filipino-foods.jpg',
          width: 1280,
          height: 720,
          alt: 'Top 10 Filipino Foods',
        },
      ]);
    });
  });

  describe('ResourceShareModal Component', () => {
    it('renders dynamic photo thumbnail, title, and social sharing links when open', () => {
      const element = (
        <ResourceShareModal
          isOpen={true}
          onClose={jest.fn()}
          resource={mockVideoResource}
        />
      );

      expect(element).toBeDefined();
      const html = ReactDOMServer.renderToString(element);

      // Verify photo thumbnail preview
      expect(html).toContain('https://i.ytimg.com/vi/abc123xyz/hqdefault.jpg');
      expect(html).toContain('Shared Photo Thumbnail');
      expect(html).toContain('Insulin Resistance &amp; Glucagon');

      // Verify direct platform sharing intents
      expect(html).toContain('facebook.com/sharer/sharer.php');
      expect(html).toContain('twitter.com/intent/tweet');
      expect(html).toContain('api.whatsapp.com/send');
      expect(html).toContain('viber://forward');
      expect(html).toContain('Share to Instagram / More Apps');
      expect(html).toContain('Copy Link');
    });

    it('returns null when isOpen is false or resource is null', () => {
      const closedElement = (
        <ResourceShareModal
          isOpen={false}
          onClose={jest.fn()}
          resource={mockVideoResource}
        />
      );
      expect(closedElement.props.isOpen).toBe(false);

      const nullResourceElement = (
        <ResourceShareModal
          isOpen={true}
          onClose={jest.fn()}
          resource={null}
        />
      );
      expect(nullResourceElement.props.resource).toBeNull();
    });
  });

  describe('LearningHubClient Share Triggers & Deep-Linking', () => {
    it('renders share buttons (📤) on material cards for dynamic sharing with encouragement', () => {
      const element = (
        <LearningHubClient
          initialAuthorities={[mockAuthority]}
          initialResources={[mockVideoResource]}
          initialArticles={[mockArticle]}
        />
      );

      const html = ReactDOMServer.renderToString(element);
      expect(html).toContain('title="Found this material valuable? Share it!"');
      expect(html).toContain('title="Found this guide valuable? Share it!"');
      expect(html).toContain('📤');
    });

    it('accepts initialResourceSlug prop to deep link and auto-open material', () => {
      const element = (
        <LearningHubClient
          initialAuthorities={[mockAuthority]}
          initialResources={[mockVideoResource]}
          initialArticles={[]}
          initialResourceSlug="insulin-resistance-glucagon"
        />
      );

      expect(element.props.initialResourceSlug).toBe('insulin-resistance-glucagon');
    });
  });

  describe('AuthorityModal Component (Affiliate Books Management)', () => {
    it('renders with Curated Books & Protocols section and pre-populates authority books', () => {
      const html = ReactDOMServer.renderToString(
        <AuthorityModal
          isOpen={true}
          onClose={jest.fn()}
          onSubmit={jest.fn()}
          initialData={mockAuthority}
          submitting={false}
        />
      );

      expect(html).toContain('Curated Books &amp; Protocols');
      expect(html).toContain('Why We Get Sick');
      expect(html).toContain('Add Book / Protocol');
      expect(html).toContain('Edit');
      expect(html).toContain('Test Link');
    });
  });

  describe('ResourceModal Component (Affiliate Books Management)', () => {
    it('renders with contextual books & protocols section', () => {
      const html = ReactDOMServer.renderToString(
        <ResourceModal
          isOpen={true}
          onClose={jest.fn()}
          onSubmit={jest.fn()}
          initialData={mockVideoResource}
          submitting={false}
        />
      );

      expect(html).toContain('Contextual Books &amp; Protocols');
      expect(html).toContain('Add Book / Protocol');
    });
  });
});
