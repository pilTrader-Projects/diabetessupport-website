import mongoose from 'mongoose';
import { dbConnect } from '@/lib/dbConnect';
import { CampaignConfigModel, ICampaignConfigDocument } from '@/models/CampaignConfig';

export interface CampaignResolvedConfig {
  referenceCode: string;
  name: string;
  brevoList: string;
  defaultMetabolicStage: string;
  description?: string;
  isActive: boolean;
}

export const DEFAULT_CAMPAIGNS: Record<string, CampaignResolvedConfig> = {
  newsletter: {
    referenceCode: 'newsletter',
    name: 'Newsletter Subscription',
    brevoList: 'subscribed_contacts',
    defaultMetabolicStage: 'GENERAL_AWARENESS',
    description: 'General newsletter opt-ins and educational health updates',
    isActive: true,
  },
  insulin_reset_funnel: {
    referenceCode: 'insulin_reset_funnel',
    name: 'Insulin Reset Protocol Cheat Sheet',
    brevoList: 'insulin_reset_funnel',
    defaultMetabolicStage: 'EARLY_STAGE_HYPERINSULINEMIA',
    description: 'Low-awareness metabolic symptom checklist & cheat sheet funnel',
    isActive: true,
  },
  companion_app_users: {
    referenceCode: 'companion_app_users',
    name: 'GlycoSense Companion App Claim',
    brevoList: 'companion_app_users',
    defaultMetabolicStage: 'COMPANION_APP_USER',
    description: 'Direct response companion app onboarding and claim leads',
    isActive: true,
  },
};

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
      cleanCode.includes('insulin') ||
      cleanCode.includes('reset') ||
      cleanCode.includes('hidden_clock') ||
      cleanCode.includes('cheat')
    ) {
      return DEFAULT_CAMPAIGNS.insulin_reset_funnel;
    }

    if (
      cleanCode.includes('companion') ||
      cleanCode.includes('glycosense') ||
      cleanCode.includes('app')
    ) {
      return DEFAULT_CAMPAIGNS.companion_app_users;
    }

    // Default fallback to newsletter
    return DEFAULT_CAMPAIGNS.newsletter;
  }

  /**
   * Retrieves all campaign configurations from DB or seeds defaults if collection is empty.
   *
   * @usecase Populates the Owner Admin Dashboard Campaign Manager UI.
   * @returns {Promise<CampaignResolvedConfig[]>} List of all configured campaigns.
   */
  public static async getAllCampaigns(): Promise<CampaignResolvedConfig[]> {
    await dbConnect();
    const query = CampaignConfigModel.find().sort({ createdAt: -1 });
    let campaigns: any[] =
      query && typeof (query as any).lean === 'function' ? await (query as any).lean() : await query;

    if (!campaigns || campaigns.length === 0) {
      // Seed default campaigns for immediate admin visibility
      for (const def of Object.values(DEFAULT_CAMPAIGNS)) {
        await CampaignConfigModel.findOneAndUpdate(
          { referenceCode: def.referenceCode },
          { $setOnInsert: def },
          { upsert: true, new: true }
        );
      }
      const refetchQuery = CampaignConfigModel.find().sort({ createdAt: -1 });
      campaigns =
        refetchQuery && typeof (refetchQuery as any).lean === 'function'
          ? await (refetchQuery as any).lean()
          : await refetchQuery;
    }

    return campaigns.map((c) => ({
      referenceCode: c.referenceCode,
      name: c.name,
      brevoList: c.brevoList,
      defaultMetabolicStage: c.defaultMetabolicStage,
      description: c.description,
      isActive: c.isActive,
    }));
  }
}
