import mongoose from 'mongoose';
import { dbConnect } from '@/lib/dbConnect';
import { AppConfigModel } from '@/models/AppConfig';

export interface AppConfigData {
  key: string;
  appName: string;
  appUrl: string;
  platformType: 'web' | 'playstore' | 'appstore' | 'custom';
  ctaText: string;
  successTitle: string;
  successMessage: string;
  openInNewTab: boolean;
  isActive: boolean;
  description?: string;
}

export const DEFAULT_APP_CONFIG: AppConfigData = {
  key: 'default',
  appName: 'GlycoSense',
  appUrl: process.env.NEXT_PUBLIC_GLYCOSENSE_URL || 'https://glycosense.vercel.app',
  platformType: 'web',
  ctaText: 'Launch GlycoSense App Now',
  successTitle: 'Free Account Access Ready!',
  successMessage: 'Free account access ready! Click below to launch your account immediately.',
  openInNewTab: true,
  isActive: true,
  description: 'Primary companion app integration and instant access destination',
};

/**
 * Service managing dynamic companion app integration, destination URLs, and rebranding.
 *
 * @usecase Decouples companion app redirection and naming from static deployment.
 */
export class AppConfigService {
  /**
   * Retrieves the active companion app configuration from MongoDB or fallback defaults.
   *
   * @returns {Promise<AppConfigData>} Active companion app configuration.
   */
  public static async getAppConfig(): Promise<AppConfigData> {
    try {
      await dbConnect();
      if (mongoose.connection && mongoose.connection.readyState === 1) {
        const query = AppConfigModel.findOne({ key: 'default', isActive: true });
        const doc =
          query && typeof (query as any).lean === 'function'
            ? await (query as any).lean()
            : await query;

        if (doc) {
          return {
            key: doc.key || 'default',
            appName: doc.appName || DEFAULT_APP_CONFIG.appName,
            appUrl: doc.appUrl || DEFAULT_APP_CONFIG.appUrl,
            platformType: (doc.platformType as any) || DEFAULT_APP_CONFIG.platformType,
            ctaText: doc.ctaText || DEFAULT_APP_CONFIG.ctaText,
            successTitle: doc.successTitle || DEFAULT_APP_CONFIG.successTitle,
            successMessage: doc.successMessage || DEFAULT_APP_CONFIG.successMessage,
            openInNewTab: doc.openInNewTab !== undefined ? Boolean(doc.openInNewTab) : DEFAULT_APP_CONFIG.openInNewTab,
            isActive: doc.isActive !== false,
          };
        }
      }
    } catch (err) {
      console.warn('AppConfigService.getAppConfig DB lookup warning, falling back to default:', err);
    }

    return { ...DEFAULT_APP_CONFIG };
  }

  /**
   * Updates or creates the companion app configuration in MongoDB.
   *
   * @param {Partial<AppConfigData>} data Updated configuration parameters.
   * @returns {Promise<AppConfigData>} Upserted configuration document data.
   */
  public static async updateAppConfig(data: Partial<AppConfigData>): Promise<AppConfigData> {
    await dbConnect();

    const cleanName = (data.appName || DEFAULT_APP_CONFIG.appName).trim();
    const cleanUrl = (data.appUrl || DEFAULT_APP_CONFIG.appUrl).trim();
    const cleanPlatform = data.platformType || DEFAULT_APP_CONFIG.platformType;
    const cleanCta = (data.ctaText || DEFAULT_APP_CONFIG.ctaText).trim();
    const cleanTitle = (data.successTitle || DEFAULT_APP_CONFIG.successTitle).trim();
    const cleanMessage = (data.successMessage || DEFAULT_APP_CONFIG.successMessage).trim();
    const openInNewTab = data.openInNewTab !== undefined ? Boolean(data.openInNewTab) : true;
    const isActive = data.isActive !== undefined ? Boolean(data.isActive) : true;
    const description = data.description?.trim();

    const updated = await AppConfigModel.findOneAndUpdate(
      { key: 'default' },
      {
        $set: {
          key: 'default',
          appName: cleanName,
          appUrl: cleanUrl,
          platformType: cleanPlatform,
          ctaText: cleanCta,
          successTitle: cleanTitle,
          successMessage: cleanMessage,
          openInNewTab,
          isActive,
          description,
        },
      },
      { upsert: true, returnDocument: 'after', runValidators: true }
    );

    return {
      key: updated.key || 'default',
      appName: updated.appName,
      appUrl: updated.appUrl,
      platformType: updated.platformType as any,
      ctaText: updated.ctaText,
      successTitle: updated.successTitle,
      successMessage: updated.successMessage,
      openInNewTab: Boolean(updated.openInNewTab),
      isActive: Boolean(updated.isActive),
      description: updated.description,
    };
  }
}
