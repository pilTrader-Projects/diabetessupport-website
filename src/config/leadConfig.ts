/**
 * Centralized Configuration Constants & Qualification Logic for Leads and Metabolic Stages.
 *
 * @usecase Single source of truth for metabolic stage awareness labels, campaign reference codes, Brevo list targets, and clinical symptom qualification thresholds.
 * @dependencies None.
 */

/**
 * Standardized lead metabolic stage awareness levels.
 *
 * @usecase Qualifies leads dynamically according to symptom severity, campaign source, or explicit user self-assessment.
 */
export const METABOLIC_STAGES = {
  GENERAL_AWARENESS: 'GENERAL_AWARENESS',
  COMPANION_APP_USER: 'COMPANION_APP_USER',
  LOW_AWARENESS_CURIOUS: 'LOW_AWARENESS_CURIOUS',
  EARLY_STAGE_HYPERINSULINEMIA: 'EARLY_STAGE_HYPERINSULINEMIA',
  HIGH_RISK_HYPERINSULINEMIA: 'HIGH_RISK_HYPERINSULINEMIA',
} as const;

export type MetabolicStage = (typeof METABOLIC_STAGES)[keyof typeof METABOLIC_STAGES];

/**
 * Standardized campaign reference codes for lead capture and Brevo list mapping.
 *
 * @usecase Decouples lead capture forms from hardcoded list names and magic strings.
 */
export const CAMPAIGN_CODES = {
  NEWSLETTER: 'newsletter',
  INSULIN_RESET_FUNNEL: 'insulin_reset_funnel',
  COMPANION_APP_USERS: 'companion_app_users',
} as const;

export type CampaignCode = (typeof CAMPAIGN_CODES)[keyof typeof CAMPAIGN_CODES];

/**
 * Standardized Brevo contact list identifiers.
 *
 * @usecase Directs leads to the correct Brevo marketing automation sequence.
 */
export const BREVO_LISTS = {
  SUBSCRIBED_CONTACTS: 'subscribed_contacts',
  INSULIN_RESET_FUNNEL: 'insulin_reset_funnel',
  COMPANION_APP_USERS: 'companion_app_users',
} as const;

export type BrevoList = (typeof BREVO_LISTS)[keyof typeof BREVO_LISTS];

/**
 * Symptom count thresholds and corresponding metabolic stage ratings.
 *
 * @usecase Evaluates symptom checklist submissions to calculate clinical hyperinsulinemia probability.
 */
export const SYMPTOM_STAGING_THRESHOLDS = {
  HIGH_RISK_MIN_SYMPTOMS: 3,
  HIGH_RISK_STAGE: METABOLIC_STAGES.HIGH_RISK_HYPERINSULINEMIA,
  EARLY_STAGE_MIN_SYMPTOMS: 1,
  EARLY_STAGE: METABOLIC_STAGES.EARLY_STAGE_HYPERINSULINEMIA,
  DEFAULT_STAGE: METABOLIC_STAGES.LOW_AWARENESS_CURIOUS,
} as const;

export interface QualifyMetabolicStageParams {
  explicitStage?: string;
  campaignReferenceCode: string;
  defaultMetabolicStage: string;
  symptomsCount?: number;
}

/**
 * Qualifies a lead's metabolic status awareness based on explicit input, symptoms count, or campaign defaults.
 *
 * @usecase Standardizes metabolic stage qualification across lead capture endpoints, eliminating scattered conditional branches and magic strings.
 * @param {QualifyMetabolicStageParams} params Qualification inputs.
 * @param {string} [params.explicitStage] Direct user or client-provided metabolic stage override.
 * @param {string} params.campaignReferenceCode The reference code of the resolved campaign.
 * @param {string} params.defaultMetabolicStage The default stage defined by the resolved campaign.
 * @param {number} [params.symptomsCount=0] Number of symptoms checked by the user.
 * @returns {string} Standardized qualified metabolic stage.
 */
export function qualifyMetabolicStage(params: QualifyMetabolicStageParams): string {
  if (params.explicitStage && params.explicitStage.trim()) {
    return params.explicitStage.trim().toUpperCase();
  }

  const { campaignReferenceCode, defaultMetabolicStage, symptomsCount = 0 } = params;

  if (campaignReferenceCode === CAMPAIGN_CODES.NEWSLETTER) {
    return METABOLIC_STAGES.GENERAL_AWARENESS;
  }

  if (campaignReferenceCode === CAMPAIGN_CODES.COMPANION_APP_USERS) {
    return METABOLIC_STAGES.COMPANION_APP_USER;
  }

  if (campaignReferenceCode === CAMPAIGN_CODES.INSULIN_RESET_FUNNEL || symptomsCount > 0) {
    if (symptomsCount >= SYMPTOM_STAGING_THRESHOLDS.HIGH_RISK_MIN_SYMPTOMS) {
      return SYMPTOM_STAGING_THRESHOLDS.HIGH_RISK_STAGE;
    }
    if (symptomsCount >= SYMPTOM_STAGING_THRESHOLDS.EARLY_STAGE_MIN_SYMPTOMS) {
      return SYMPTOM_STAGING_THRESHOLDS.EARLY_STAGE;
    }
    return SYMPTOM_STAGING_THRESHOLDS.DEFAULT_STAGE;
  }

  return defaultMetabolicStage || METABOLIC_STAGES.GENERAL_AWARENESS;
}
