import mongoose from 'mongoose';
import { dbConnect } from '@/lib/dbConnect';
import { CampaignConfigModel, ICampaignConfigDocument } from '@/models/CampaignConfig';
import {
  CAMPAIGN_CODES,
  METABOLIC_STAGES,
  BREVO_LISTS,
  DEFAULT_CAMPAIGNS,
  CampaignConfig as CampaignResolvedConfig,
} from '@/config/leadConfig';

export type CampaignOperationalMode = 'active' | 'waitlist' | 'closed';
export type { CampaignResolvedConfig };
export { DEFAULT_CAMPAIGNS };

/**
 * Service managing dynamic lead campaign routing, Brevo list mappings, and admin customization.
 */
export class CampaignService {
  /**
   * Derives high-level operational state ('active' | 'waitlist' | 'closed') from campaign config properties.
   */
  public static resolveModeFromConfig(
    config?: { isActive?: boolean; allowWaitlist?: boolean } | null
  ): CampaignOperationalMode {
    if (!config || config.isActive === false) {
      return config?.allowWaitlist ? 'waitlist' : 'closed';
    }
    return 'active';
  }

  /**
   * Resolves a campaign reference code and returns its current operational mode directly.
   *
   * @param {string} [rawCode] Campaign reference code or lead capture source tag.
   * @returns {Promise<CampaignOperationalMode>} Operational mode for the campaign.
   */
  public static async resolveCampaignMode(rawCode?: string): Promise<CampaignOperationalMode> {
    try {
      const campaign = await this.resolveCampaign(rawCode);
      return this.resolveModeFromConfig(campaign);
    } catch (err) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn('CampaignService.resolveCampaignMode fallback to active:', err);
      }
      return 'active';
    }
  }

  /**
   * Resolves a campaign reference code to its target Brevo list and metabolic stage.
   *
   * @usecase Decouples lead capture forms from hardcoded list IDs by dynamically looking up configuration.
   * @param {string} [rawCode] Campaign reference code or lead capture source tag.
   * @dependencies CampaignConfigModel, dbConnect
   * @returns {Promise<CampaignResolvedConfig>} Active campaign configuration with Brevo list and metabolic stage.
   */
  public static async resolveCampaign(rawCode?: string): Promise<CampaignResolvedConfig> {
    const cleanCode = (rawCode || '').trim().toLowerCase();

    // Map sub-sources / step variants to canonical parent campaign reference code
    let lookupCode = cleanCode;
    if (
      cleanCode.startsWith('recovery_protocol_') ||
      cleanCode.startsWith('recovery_protocol-') ||
      cleanCode.startsWith('learn-roadmap')
    ) {
      lookupCode = CAMPAIGN_CODES.RECOVERY_PROTOCOL;
    } else if (cleanCode.startsWith('insulin_reset_') || cleanCode === 'insulin_reset') {
      lookupCode = CAMPAIGN_CODES.INSULIN_RESET_FUNNEL;
    } else if (cleanCode.startsWith('companion_app_') || cleanCode === 'companion_app_users') {
      lookupCode = CAMPAIGN_CODES.COMPANION_APP_USERS;
    }

    // 1. Check MongoDB for custom campaign configuration (matching specific code or canonical parent code)
    try {
      await dbConnect();
      if (mongoose.connection && mongoose.connection.readyState === 1) {
        const query = CampaignConfigModel.findOne({
          referenceCode: { $in: [cleanCode, lookupCode] },
        });
        const customConfig =
          query && typeof (query as any).lean === 'function'
            ? await (query as any).lean()
            : await query;

        if (customConfig) {
          return {
            referenceCode: customConfig.referenceCode,
            name: customConfig.name,
            brevoList: customConfig.brevoList,
            defaultMetabolicStage: customConfig.defaultMetabolicStage,
            assetFileName: customConfig.assetFileName?.trim() || undefined,
            description: customConfig.description,
            isActive: customConfig.isActive !== false,
            allowWaitlist: customConfig.allowWaitlist === true,
            waitlistBrevoList: customConfig.waitlistBrevoList?.trim() || undefined,
          };
        }
      }
    } catch (err) {
      console.error('CampaignService.resolveCampaign DB lookup warning:', err);
    }

    // 2. Built-in alias & default campaign mapping
    if (DEFAULT_CAMPAIGNS[cleanCode]) {
      return { ...DEFAULT_CAMPAIGNS[cleanCode] };
    }

    if (DEFAULT_CAMPAIGNS[lookupCode]) {
      return { ...DEFAULT_CAMPAIGNS[lookupCode] };
    }

    if (
      cleanCode === 'newsletter' ||
      cleanCode === 'newsletter_funnel' ||
      cleanCode.startsWith('newsletter') ||
      cleanCode.startsWith('article_') ||
      cleanCode.includes('subscribe')
    ) {
      return { ...DEFAULT_CAMPAIGNS[CAMPAIGN_CODES.NEWSLETTER] };
    }

    if (
      cleanCode === 'insulin_reset_funnel' ||
      cleanCode === 'insulin_reset' ||
      cleanCode.startsWith('insulin_reset_')
    ) {
      return { ...DEFAULT_CAMPAIGNS[CAMPAIGN_CODES.INSULIN_RESET_FUNNEL] };
    }

    if (
      cleanCode === 'companion_app_users' ||
      cleanCode === 'companion_app_users_funnel' ||
      cleanCode.startsWith('companion_app_')
    ) {
      return { ...DEFAULT_CAMPAIGNS[CAMPAIGN_CODES.COMPANION_APP_USERS] };
    }

    if (
      cleanCode === 'recovery_protocol' ||
      cleanCode.startsWith('recovery_protocol') ||
      cleanCode === 'learn-roadmap' ||
      cleanCode.startsWith('learn-roadmap')
    ) {
      return { ...DEFAULT_CAMPAIGNS[CAMPAIGN_CODES.RECOVERY_PROTOCOL] };
    }

    // Default fallback to newsletter
    return { ...DEFAULT_CAMPAIGNS[CAMPAIGN_CODES.NEWSLETTER] };
  }

  /**
   * Retrieves all campaign configurations dynamically from config constants merged with database customizations.
   *
   * @usecase Populates the Owner Admin Dashboard Campaign Manager UI with dynamic config constant defaults.
   * @returns {Promise<CampaignResolvedConfig[]>} List of all active configured campaigns.
   */
  public static async getAllCampaigns(): Promise<CampaignResolvedConfig[]> {
    // 1. Initialize with active config constant settings
    const campaignsMap = new Map<string, CampaignResolvedConfig>();
    for (const def of Object.values(DEFAULT_CAMPAIGNS)) {
      campaignsMap.set(def.referenceCode, { ...def });
    }

    // 2. Fetch custom campaigns or overrides from MongoDB
    try {
      await dbConnect();
      const query = CampaignConfigModel.find().sort({ createdAt: -1 });
      const dbDocs: any[] =
        query && typeof (query as any).lean === 'function' ? await (query as any).lean() : await query;

      if (Array.isArray(dbDocs)) {
        for (const doc of dbDocs) {
          const code = (doc.referenceCode || '').trim().toLowerCase();
          if (!code) continue;

          // Filter out obsolete legacy default codes that don't match current config constants
          if (['newsletter', 'companion_app_users'].includes(code) && !campaignsMap.has(code)) {
            continue;
          }

          if (campaignsMap.has(code)) {
            const existing = campaignsMap.get(code)!;
            campaignsMap.set(code, {
              ...existing,
              name: doc.name || existing.name,
              brevoList: doc.brevoList || existing.brevoList,
              defaultMetabolicStage: doc.defaultMetabolicStage || existing.defaultMetabolicStage,
              assetFileName:
                doc.assetFileName !== undefined
                  ? (doc.assetFileName?.trim() || undefined)
                  : existing.assetFileName,
              description: doc.description !== undefined ? doc.description : existing.description,
              isActive: doc.isActive !== undefined ? doc.isActive : existing.isActive,
              allowWaitlist: doc.allowWaitlist !== undefined ? doc.allowWaitlist : existing.allowWaitlist,
              waitlistBrevoList: doc.waitlistBrevoList?.trim() || existing.waitlistBrevoList,
            });
          } else {
            campaignsMap.set(code, {
              referenceCode: code,
              name: doc.name,
              brevoList: doc.brevoList,
              defaultMetabolicStage: doc.defaultMetabolicStage,
              assetFileName: doc.assetFileName?.trim() || undefined,
              description: doc.description,
              isActive: doc.isActive !== false,
              allowWaitlist: doc.allowWaitlist === true,
              waitlistBrevoList: doc.waitlistBrevoList?.trim() || undefined,
            });
          }
        }
      }
    } catch (err) {
      console.error('CampaignService.getAllCampaigns DB lookup warning:', err);
    }

    return Array.from(campaignsMap.values());
  }
}
