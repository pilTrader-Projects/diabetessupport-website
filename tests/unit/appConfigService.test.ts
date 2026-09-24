/**
 * Unit Test Suite for AppConfigService.
 *
 * @usecase Validates that AppConfigService retrieves dynamic app configuration from MongoDB,
 * falls back to safe defaults, and handles updates correctly.
 */
import mongoose from 'mongoose';
import { AppConfigService, DEFAULT_APP_CONFIG } from '../../src/services/appConfigService';
import { AppConfigModel } from '../../src/models/AppConfig';

jest.mock('../../src/lib/dbConnect', () => ({
  dbConnect: jest.fn().mockResolvedValue(true),
}));

describe('AppConfigService', () => {
  beforeEach(() => {
    (mongoose.connection as any).readyState = 1;
    jest.clearAllMocks();
  });

  it('should return default app configuration when database has no entry', async () => {
    jest.spyOn(AppConfigModel, 'findOne').mockReturnValue({
      lean: jest.fn().mockResolvedValue(null),
    } as any);

    const config = await AppConfigService.getAppConfig();

    expect(config).toBeDefined();
    expect(config.appName).toBe(DEFAULT_APP_CONFIG.appName);
    expect(config.appUrl).toBe(DEFAULT_APP_CONFIG.appUrl);
    expect(config.platformType).toBe(DEFAULT_APP_CONFIG.platformType);
    expect(config.ctaText).toBe(DEFAULT_APP_CONFIG.ctaText);
    expect(config.openInNewTab).toBe(true);
  });

  it('should return custom app configuration when present in MongoDB', async () => {
    const customRecord = {
      key: 'default',
      appName: 'MetricPace',
      appUrl: 'https://play.google.com/store/apps/details?id=com.metricpace.app',
      platformType: 'playstore',
      ctaText: 'Download on Google Play',
      successTitle: 'Your MetricPace Account is Ready!',
      successMessage: 'Install directly from Google Play to begin tracking your vitals immediately.',
      openInNewTab: true,
      isActive: true,
    };

    jest.spyOn(AppConfigModel, 'findOne').mockReturnValue({
      lean: jest.fn().mockResolvedValue(customRecord),
    } as any);

    const config = await AppConfigService.getAppConfig();

    expect(config.appName).toBe('MetricPace');
    expect(config.appUrl).toBe('https://play.google.com/store/apps/details?id=com.metricpace.app');
    expect(config.platformType).toBe('playstore');
    expect(config.ctaText).toBe('Download on Google Play');
    expect(config.successTitle).toBe('Your MetricPace Account is Ready!');
    expect(config.successMessage).toContain('Install directly from Google Play');
  });

  it('should update app configuration in MongoDB via updateAppConfig', async () => {
    const updateSpy = jest.spyOn(AppConfigModel, 'findOneAndUpdate').mockResolvedValue({
      key: 'default',
      appName: 'MetricPace Web',
      appUrl: 'https://app.metricpace.com',
      platformType: 'web',
      ctaText: 'Open MetricPace Dashboard',
      successTitle: 'Instant Access Granted!',
      successMessage: 'Click below to access your dashboard.',
      openInNewTab: true,
      isActive: true,
    } as any);

    const updated = await AppConfigService.updateAppConfig({
      appName: 'MetricPace Web',
      appUrl: 'https://app.metricpace.com',
      platformType: 'web',
      ctaText: 'Open MetricPace Dashboard',
      successTitle: 'Instant Access Granted!',
      successMessage: 'Click below to access your dashboard.',
      openInNewTab: true,
    });

    expect(updateSpy).toHaveBeenCalledWith(
      { key: 'default' },
      expect.objectContaining({
        $set: expect.objectContaining({
          appName: 'MetricPace Web',
          appUrl: 'https://app.metricpace.com',
        }),
      }),
      expect.objectContaining({ upsert: true, returnDocument: 'after' })
    );
    expect(updated.appName).toBe('MetricPace Web');
    expect(updated.appUrl).toBe('https://app.metricpace.com');
  });
});
