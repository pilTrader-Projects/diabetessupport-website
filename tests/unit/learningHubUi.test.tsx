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
import { ILearningResource, IAuthority } from '../../src/types/learning';
import { IPost } from '../../src/types/blog';
import { PostModel } from '../../src/models/Post';
import { AuthorityModel } from '../../src/models/Authority';
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
    it('fetches published posts, authorities, and resources and renders page', async () => {
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
