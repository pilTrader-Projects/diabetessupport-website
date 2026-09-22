/**
 * TDD Unit Test Suite for CampaignConfig Model and CampaignService.
 *
 * @usecase Validates schema structure, default campaign resolution, database lookups, and fallback behaviors.
 * @dependencies CampaignConfigModel, CampaignService.
 */
import mongoose from 'mongoose';
import { CampaignConfigModel } from '../../src/models/CampaignConfig';
import { CampaignService } from '../../src/services/campaignService';

// Mock dbConnect
jest.mock('../../src/lib/dbConnect', () => ({
  dbConnect: jest.fn().mockResolvedValue(true),
}));

describe('CampaignConfig & CampaignService Unit Tests', () => {
  beforeEach(() => {
    (mongoose.connection as any).readyState = 1;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('CampaignConfigModel Schema Validation', () => {
    it('should validate a complete and valid CampaignConfig document', async () => {
      const doc = new CampaignConfigModel({
        referenceCode: 'summer_promo_2026',
        name: 'Summer Promo 2026',
        brevoList: 'summer_leads',
        defaultMetabolicStage: 'PRE_DIABETES',
        description: 'Summer health awareness promotion',
      });

      const err = await doc.validate().catch((e) => e);
      expect(err).toBeUndefined();
      expect(doc.referenceCode).toBe('summer_promo_2026');
      expect(doc.brevoList).toBe('summer_leads');
      expect(doc.defaultMetabolicStage).toBe('PRE_DIABETES');
      expect(doc.isActive).toBe(true);
    });

    it('should require referenceCode and brevoList', async () => {
      const invalidDoc = new CampaignConfigModel({
        name: 'Incomplete',
      });

      const err = await invalidDoc.validate().catch((e) => e);
      expect(err).toBeDefined();
      expect(err.errors.referenceCode).toBeDefined();
      expect(err.errors.brevoList).toBeDefined();
    });
  });

  describe('CampaignService.resolveCampaign()', () => {
    it('should resolve default newsletter campaign when reference code matches newsletter', async () => {
      jest.spyOn(CampaignConfigModel, 'findOne').mockResolvedValueOnce(null);

      const campaign = await CampaignService.resolveCampaign('newsletter');
      expect(campaign.referenceCode).toBe('newsletter');
      expect(campaign.brevoList).toBe('subscribed_contacts');
      expect(campaign.defaultMetabolicStage).toBe('GENERAL_AWARENESS');
    });

    it('should resolve default insulin reset funnel when reference code matches', async () => {
      jest.spyOn(CampaignConfigModel, 'findOne').mockResolvedValueOnce(null);

      const campaign = await CampaignService.resolveCampaign('insulin_reset_funnel');
      expect(campaign.referenceCode).toBe('insulin_reset_funnel');
      expect(campaign.brevoList).toBe('insulin_reset_funnel');
      expect(campaign.defaultMetabolicStage).toBe('EARLY_STAGE_HYPERINSULINEMIA');
    });

    it('should resolve default companion app users campaign when reference code matches', async () => {
      jest.spyOn(CampaignConfigModel, 'findOne').mockResolvedValueOnce(null);

      const campaign = await CampaignService.resolveCampaign('companion_app_users');
      expect(campaign.referenceCode).toBe('companion_app_users');
      expect(campaign.brevoList).toBe('companion_app_users');
      expect(campaign.defaultMetabolicStage).toBe('COMPANION_APP_USER');
    });

    it('should resolve custom campaign from MongoDB if present and active', async () => {
      jest.spyOn(CampaignConfigModel, 'findOne').mockResolvedValueOnce({
        referenceCode: 'custom_quiz_lead',
        name: 'Metabolic Quiz Lead',
        brevoList: 'quiz_leads_list',
        defaultMetabolicStage: 'ASSESSED_PRE_DIABETIC',
        isActive: true,
      } as any);

      const campaign = await CampaignService.resolveCampaign('custom_quiz_lead');
      expect(campaign.referenceCode).toBe('custom_quiz_lead');
      expect(campaign.brevoList).toBe('quiz_leads_list');
      expect(campaign.defaultMetabolicStage).toBe('ASSESSED_PRE_DIABETIC');
    });

    it('should fallback gracefully to default general awareness for unknown reference code', async () => {
      jest.spyOn(CampaignConfigModel, 'findOne').mockResolvedValueOnce(null);

      const campaign = await CampaignService.resolveCampaign('unknown_promo');
      expect(campaign.brevoList).toBe('subscribed_contacts');
      expect(campaign.defaultMetabolicStage).toBe('GENERAL_AWARENESS');
    });
  });
});
