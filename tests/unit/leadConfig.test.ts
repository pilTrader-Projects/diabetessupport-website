/**
 * TDD Unit Tests for Lead Qualification Constants & Helpers.
 *
 * @usecase Validates centralized metabolic stage constants, campaign codes, and qualification helper function.
 * @dependencies src/config/leadConfig.ts
 */
import {
  METABOLIC_STAGES,
  CAMPAIGN_CODES,
  BREVO_LISTS,
  DEFAULT_CAMPAIGNS,
  SYMPTOM_STAGING_THRESHOLDS,
  qualifyMetabolicStage,
} from '../../src/config/leadConfig';

describe('Lead Qualification Config & Helper', () => {
  describe('Constants Integrity', () => {
    it('should define standardized METABOLIC_STAGES', () => {
      expect(METABOLIC_STAGES.GENERAL_AWARENESS).toBe('GENERAL_AWARENESS');
      expect(METABOLIC_STAGES.COMPANION_APP_USER).toBe('COMPANION_APP_USER');
      expect(METABOLIC_STAGES.LOW_AWARENESS_CURIOUS).toBe('LOW_AWARENESS_CURIOUS');
      expect(METABOLIC_STAGES.EARLY_STAGE_HYPERINSULINEMIA).toBe('EARLY_STAGE_HYPERINSULINEMIA');
      expect(METABOLIC_STAGES.HIGH_RISK_HYPERINSULINEMIA).toBe('HIGH_RISK_HYPERINSULINEMIA');
    });

    it('should define standardized CAMPAIGN_CODES', () => {
      expect(CAMPAIGN_CODES.NEWSLETTER).toBe('newsletter_funnel');
      expect(CAMPAIGN_CODES.INSULIN_RESET_FUNNEL).toBe('insulin_reset_funnel');
      expect(CAMPAIGN_CODES.COMPANION_APP_USERS).toBe('companion_app_users_funnel');
    });

    it('should define standardized BREVO_LISTS', () => {
      expect(BREVO_LISTS.SUBSCRIBED_CONTACTS).toBe('subscribed_contacts');
      expect(BREVO_LISTS.INSULIN_RESET_FUNNEL).toBe('insulin_reset_funnel');
      expect(BREVO_LISTS.COMPANION_APP_USERS).toBe('companion_app_users');
    });

    it('should dynamically construct DEFAULT_CAMPAIGNS from constants', () => {
      const newsletter = DEFAULT_CAMPAIGNS[CAMPAIGN_CODES.NEWSLETTER];
      expect(newsletter).toBeDefined();
      expect(newsletter.referenceCode).toBe(CAMPAIGN_CODES.NEWSLETTER);
      expect(newsletter.brevoList).toBe(BREVO_LISTS.SUBSCRIBED_CONTACTS);
      expect(newsletter.defaultMetabolicStage).toBe(METABOLIC_STAGES.GENERAL_AWARENESS);

      const companion = DEFAULT_CAMPAIGNS[CAMPAIGN_CODES.COMPANION_APP_USERS];
      expect(companion).toBeDefined();
      expect(companion.referenceCode).toBe(CAMPAIGN_CODES.COMPANION_APP_USERS);
      expect(companion.brevoList).toBe(BREVO_LISTS.COMPANION_APP_USERS);
      expect(companion.defaultMetabolicStage).toBe(METABOLIC_STAGES.COMPANION_APP_USER);

      const insulin = DEFAULT_CAMPAIGNS[CAMPAIGN_CODES.INSULIN_RESET_FUNNEL];
      expect(insulin).toBeDefined();
      expect(insulin.referenceCode).toBe(CAMPAIGN_CODES.INSULIN_RESET_FUNNEL);
      expect(insulin.brevoList).toBe(BREVO_LISTS.INSULIN_RESET_FUNNEL);
      expect(insulin.defaultMetabolicStage).toBe(METABOLIC_STAGES.EARLY_STAGE_HYPERINSULINEMIA);
    });

    it('should define symptom count thresholds', () => {
      expect(SYMPTOM_STAGING_THRESHOLDS.HIGH_RISK_MIN_SYMPTOMS).toBe(3);
      expect(SYMPTOM_STAGING_THRESHOLDS.HIGH_RISK_STAGE).toBe(METABOLIC_STAGES.HIGH_RISK_HYPERINSULINEMIA);
      expect(SYMPTOM_STAGING_THRESHOLDS.EARLY_STAGE_MIN_SYMPTOMS).toBe(1);
      expect(SYMPTOM_STAGING_THRESHOLDS.EARLY_STAGE).toBe(METABOLIC_STAGES.EARLY_STAGE_HYPERINSULINEMIA);
      expect(SYMPTOM_STAGING_THRESHOLDS.DEFAULT_STAGE).toBe(METABOLIC_STAGES.LOW_AWARENESS_CURIOUS);
    });
  });

  describe('qualifyMetabolicStage Helper', () => {
    it('should prioritize explicitStage override and format it uppercase', () => {
      const result = qualifyMetabolicStage({
        explicitStage: ' custom_stage ',
        campaignReferenceCode: CAMPAIGN_CODES.NEWSLETTER,
        defaultMetabolicStage: METABOLIC_STAGES.GENERAL_AWARENESS,
        symptomsCount: 4,
      });

      expect(result).toBe('CUSTOM_STAGE');
    });

    it('should qualify newsletter campaign as GENERAL_AWARENESS even if symptoms are checked', () => {
      const result = qualifyMetabolicStage({
        campaignReferenceCode: CAMPAIGN_CODES.NEWSLETTER,
        defaultMetabolicStage: METABOLIC_STAGES.GENERAL_AWARENESS,
        symptomsCount: 3,
      });

      expect(result).toBe(METABOLIC_STAGES.GENERAL_AWARENESS);
    });

    it('should qualify companion_app_users campaign as COMPANION_APP_USER', () => {
      const result = qualifyMetabolicStage({
        campaignReferenceCode: CAMPAIGN_CODES.COMPANION_APP_USERS,
        defaultMetabolicStage: METABOLIC_STAGES.COMPANION_APP_USER,
        symptomsCount: 0,
      });

      expect(result).toBe(METABOLIC_STAGES.COMPANION_APP_USER);
    });

    it('should qualify insulin_reset_funnel with 3+ symptoms as HIGH_RISK_HYPERINSULINEMIA', () => {
      const result = qualifyMetabolicStage({
        campaignReferenceCode: CAMPAIGN_CODES.INSULIN_RESET_FUNNEL,
        defaultMetabolicStage: METABOLIC_STAGES.EARLY_STAGE_HYPERINSULINEMIA,
        symptomsCount: 3,
      });

      expect(result).toBe(METABOLIC_STAGES.HIGH_RISK_HYPERINSULINEMIA);
    });

    it('should qualify insulin_reset_funnel with 1-2 symptoms as EARLY_STAGE_HYPERINSULINEMIA', () => {
      const result = qualifyMetabolicStage({
        campaignReferenceCode: CAMPAIGN_CODES.INSULIN_RESET_FUNNEL,
        defaultMetabolicStage: METABOLIC_STAGES.EARLY_STAGE_HYPERINSULINEMIA,
        symptomsCount: 2,
      });

      expect(result).toBe(METABOLIC_STAGES.EARLY_STAGE_HYPERINSULINEMIA);
    });

    it('should qualify insulin_reset_funnel with 0 symptoms as LOW_AWARENESS_CURIOUS', () => {
      const result = qualifyMetabolicStage({
        campaignReferenceCode: CAMPAIGN_CODES.INSULIN_RESET_FUNNEL,
        defaultMetabolicStage: METABOLIC_STAGES.EARLY_STAGE_HYPERINSULINEMIA,
        symptomsCount: 0,
      });

      expect(result).toBe(METABOLIC_STAGES.LOW_AWARENESS_CURIOUS);
    });

    it('should fall back to campaign defaultMetabolicStage for unhandled campaigns', () => {
      const result = qualifyMetabolicStage({
        campaignReferenceCode: 'custom_corporate_wellness',
        defaultMetabolicStage: 'CORPORATE_EMPLOYEE',
        symptomsCount: 0,
      });

      expect(result).toBe('CORPORATE_EMPLOYEE');
    });

    it('should fall back to GENERAL_AWARENESS if defaultMetabolicStage is empty', () => {
      const result = qualifyMetabolicStage({
        campaignReferenceCode: 'unknown',
        defaultMetabolicStage: '',
      });

      expect(result).toBe(METABOLIC_STAGES.GENERAL_AWARENESS);
    });
  });
});
