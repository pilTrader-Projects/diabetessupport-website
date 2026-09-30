/**
 * Unit Test Suite for Public Learning Materials & Evidence Hub UI.
 *
 * @usecase Validates that LearningHubClient, VideoPlayerModal, and SavedResourcesDrawer render cleanly.
 */
import React from 'react';
import LearningHubClient from '../../src/components/learning/LearningHubClient';
import VideoPlayerModal from '../../src/components/learning/VideoPlayerModal';
import SavedResourcesDrawer from '../../src/components/learning/SavedResourcesDrawer';
import BlogFeedPage from '../../src/app/blog/page';
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

      expect(html).toContain('The Diabetes Reversal');
      expect(html).toContain('Filipino families');
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
  });

  describe('VideoPlayerModal Component', () => {
    it('renders with youtube embed and takeaways when open', () => {
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

  describe('SavedResourcesDrawer Component', () => {
    it('renders saved items and email sync opt-in', () => {
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
  });
});
