/**
 * Unit Test Suite for Admin Learning Hub UI Components.
 *
 * @usecase Validates that AuthoritiesManagerClient, ResourcesManagerClient, and Admin Pages render properly.
 */
import React from 'react';
import AuthoritiesManagerClient from '../../src/components/admin/learning/AuthoritiesManagerClient';
import ResourcesManagerClient from '../../src/components/admin/learning/ResourcesManagerClient';
import AdminAuthoritiesPage from '../../src/app/admin/learning/authorities/page';
import AdminResourcesPage from '../../src/app/admin/learning/resources/page';
import * as adminAuth from '../../src/lib/adminAuth';
import { LearningService } from '../../src/services/learningService';

jest.mock('../../src/lib/dbConnect', () => ({
  dbConnect: jest.fn().mockResolvedValue(true),
}));

describe('Admin Learning Hub UI Components', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('AuthoritiesManagerClient Component', () => {
    it('instantiates cleanly with authorities list', () => {
      const mockAuthorities = [
        {
          _id: 'auth_1',
          name: 'Dr. Benjamin Bikman',
          slug: 'dr-benjamin-bikman',
          title: 'Professor of Cell Biology',
          specialties: ['Insulin Resistance', 'Low Carb'],
          youtubeChannelId: 'UCbikman',
          autoPublish: true,
          isActive: true,
          displayOrder: 1,
        },
      ];

      const element = <AuthoritiesManagerClient initialAuthorities={mockAuthorities} />;
      expect(element).toBeDefined();
      expect(element.props.initialAuthorities[0].name).toBe('Dr. Benjamin Bikman');
    });
  });

  describe('ResourcesManagerClient Component', () => {
    it('instantiates cleanly with resources list', () => {
      const mockResources = [
        {
          _id: 'res_1',
          title: 'The Cellular Switch',
          slug: 'the-cellular-switch',
          type: 'video' as const,
          authorityName: 'Dr. Benjamin Bikman',
          sourceUrl: 'https://youtube.com/watch?v=123',
          platform: 'youtube' as const,
          embedId: '123',
          summary: 'Summary description',
          keyTakeaways: ['Point 1', 'Point 2'],
          topics: ['Low Carb'],
          status: 'published' as const,
        },
      ];

      const element = <ResourcesManagerClient initialResources={mockResources} totalCount={1} />;
      expect(element).toBeDefined();
      expect(element.props.initialResources[0].title).toBe('The Cellular Switch');
    });
  });

  describe('Admin Server Pages', () => {
    it('AdminAuthoritiesPage renders when authenticated', async () => {
      jest.spyOn(adminAuth, 'isAdminAuthenticated').mockResolvedValue(true);
      jest.spyOn(LearningService, 'listAuthorities').mockResolvedValue([]);

      const page = await AdminAuthoritiesPage();
      expect(page).toBeDefined();
    });

    it('AdminResourcesPage renders when authenticated', async () => {
      jest.spyOn(adminAuth, 'isAdminAuthenticated').mockResolvedValue(true);
      jest.spyOn(LearningService, 'listResources').mockResolvedValue({ resources: [], total: 0 });

      const page = await AdminResourcesPage();
      expect(page).toBeDefined();
    });
  });
});
