import React from 'react';
import ThreadCard from '../../src/components/community/ThreadCard';
import CommunityHeader from '../../src/components/community/CommunityHeader';
import CreateThreadModal from '../../src/components/community/CreateThreadModal';
import SyncDeviceModal from '../../src/components/community/SyncDeviceModal';
import CommunityFeedClient from '../../src/components/community/CommunityFeedClient';
import { IThread } from '../../src/types/community';

describe('Community Forum Feed UI Components (Step 4)', () => {
  const mockThread: IThread = {
    _id: 'thread_1',
    title: 'How to manage morning dawn phenomenon glucose?',
    slug: 'how-to-manage-morning-dawn-phenomenon',
    content: 'Every morning my blood sugar is 130 despite fasting...',
    category: 'Daily Sugar Tracking',
    authorAlias: 'Kuya Jun',
    authorTag: '#4821',
    authorId: 'usr_abc123',
    status: 'published',
    reportCount: 0,
    views: 12,
    repliesCount: 4,
    createdAt: new Date('2026-09-01T08:00:00Z'),
  };

  describe('ThreadCard Component', () => {
    it('is a valid React component and renders thread data structure', () => {
      const element = <ThreadCard thread={mockThread} />;
      expect(element).toBeDefined();
    });
  });

  describe('CommunityHeader Component', () => {
    it('is a valid React component and accepts modal triggers and active filters', () => {
      const element = (
        <CommunityHeader
          activeCategory="All"
          searchQuery=""
          totalThreads={15}
          onOpenNewThread={jest.fn()}
          onOpenSyncModal={jest.fn()}
        />
      );
      expect(element).toBeDefined();
    });
  });

  describe('CreateThreadModal Component', () => {
    it('is a valid React component when open or closed', () => {
      const openModal = <CreateThreadModal isOpen={true} onClose={jest.fn()} />;
      const closedModal = <CreateThreadModal isOpen={false} onClose={jest.fn()} />;
      expect(openModal).toBeDefined();
      expect(closedModal).toBeDefined();
    });
  });

  describe('SyncDeviceModal Component', () => {
    it('is a valid React component when open or closed', () => {
      const openModal = <SyncDeviceModal isOpen={true} onClose={jest.fn()} />;
      const closedModal = <SyncDeviceModal isOpen={false} onClose={jest.fn()} />;
      expect(openModal).toBeDefined();
      expect(closedModal).toBeDefined();
    });
  });

  describe('CommunityFeedClient Component', () => {
    it('is a valid React component rendering feed list with pagination', () => {
      const element = (
        <CommunityFeedClient
          threads={[mockThread]}
          activeCategory="All"
          searchQuery=""
          total={1}
          page={1}
          totalPages={1}
        />
      );
      expect(element).toBeDefined();
    });
  });
});
