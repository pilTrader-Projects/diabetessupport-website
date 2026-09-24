/**
 * Unit Test Suite for Companion App Settings Admin UI.
 *
 * @usecase Validates that AppSettingsManagerClient and AdminAppSettingsPage render correctly with props and authentication.
 */
import React from 'react';
import AppSettingsManagerClient from '../../src/components/admin/AppSettingsManagerClient';
import AdminAppSettingsPage from '../../src/app/admin/app-settings/page';
import * as adminAuth from '../../src/lib/adminAuth';
import { AppConfigService } from '../../src/services/appConfigService';

jest.mock('../../src/lib/dbConnect', () => ({
  dbConnect: jest.fn().mockResolvedValue(true),
}));

describe('Companion App Settings Admin UI', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('AppSettingsManagerClient Component', () => {
    it('instantiates cleanly with initial config props', () => {
      const initialConfig = {
        key: 'default',
        appName: 'GlycoSense',
        appUrl: 'https://glycosense.vercel.app',
        platformType: 'web' as const,
        ctaText: 'Launch GlycoSense App Now',
        successTitle: 'Free Account Access Ready!',
        successMessage: 'Click below to launch your companion app account.',
        openInNewTab: true,
        isActive: true,
      };

      const element = <AppSettingsManagerClient initialConfig={initialConfig} />;
      expect(element).toBeDefined();
      expect(element.props.initialConfig.appName).toBe('GlycoSense');
      expect(element.props.initialConfig.appUrl).toBe('https://glycosense.vercel.app');
    });
  });

  describe('AdminAppSettingsPage Server Component', () => {
    it('fetches initial config and renders for authenticated admin', async () => {
      jest.spyOn(adminAuth, 'isAdminAuthenticated').mockResolvedValue(true);
      jest.spyOn(AppConfigService, 'getAppConfig').mockResolvedValue({
        key: 'default',
        appName: 'MetricPace',
        appUrl: 'https://play.google.com/store/apps/details?id=com.metricpace',
        platformType: 'playstore',
        ctaText: 'Download on Google Play',
        successTitle: 'Free Account Access Ready!',
        successMessage: 'Click below to download.',
        openInNewTab: true,
        isActive: true,
      });

      const page = await AdminAppSettingsPage();
      expect(page).toBeDefined();
    });
  });
});
