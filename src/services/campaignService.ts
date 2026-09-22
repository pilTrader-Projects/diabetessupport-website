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

export type { CampaignResolvedConfig };
export { DEFAULT_CAMPAIGNS };

/**
 * Service managing dynamic lead campaign routing, Brevo list mappings, and admin customization.
 */
export class CampaignService {
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

    // 1. Check MongoDB for custom active campaign configuration if connection is open
    try {
      if (mongoose.connection && mongoose.connection.readyState === 1) {
        const query = CampaignConfigModel.findOne({
          referenceCode: cleanCode,
          isActive: true,
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
            description: customConfig.description,
            isActive: customConfig.isActive,
          };
        }
      }
    } catch (err) {
      console.error('CampaignService.resolveCampaign DB lookup warning:', err);
    }

    // 2. Built-in alias & default campaign mapping
    if (DEFAULT_CAMPAIGNS[cleanCode]) {
      return DEFAULT_CAMPAIGNS[cleanCode];
    }

    if (
      cleanCode.includes('newsletter') ||
      cleanCode.includes('subscribe') ||
      cleanCode.includes('general') ||
      cleanCode.includes('weekly')
    ) {
      return DEFAULT_CAMPAIGNS[CAMPAIGN_CODES.NEWSLETTER];
    }

    if (
      cleanCode.includes('insulin') ||
      cleanCode.includes('reset') ||
      cleanCode.includes('hidden_clock') ||
      cleanCode.includes('cheat')
    ) {
      return DEFAULT_CAMPAIGNS[CAMPAIGN_CODES.INSULIN_RESET_FUNNEL];
    }

    if (
      cleanCode.includes('companion') ||
      cleanCode.includes('glycosense') ||
      cleanCode.includes('app')
    ) {
      return DEFAULT_CAMPAIGNS[CAMPAIGN_CODES.COMPANION_APP_USERS];
    }

    // Default fallback to newsletter
    return DEFAULT_CAMPAIGNS[CAMPAIGN_CODES.NEWSLETTER];
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
              description: doc.description !== undefined ? doc.description : existing.description,
              isActive: doc.isActive !== undefined ? doc.isActive : existing.isActive,
            });
          } else {
            campaignsMap.set(code, {
              referenceCode: code,
              name: doc.name,
              brevoList: doc.brevoList,
              defaultMetabolicStage: doc.defaultMetabolicStage,
              description: doc.description,
              isActive: doc.isActive !== false,
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
