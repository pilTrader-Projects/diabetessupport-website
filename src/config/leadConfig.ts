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
  NEWSLETTER: 'newsletter_funnel',
  INSULIN_RESET_FUNNEL: 'insulin_reset_funnel',
  COMPANION_APP_USERS: 'companion_app_users_funnel',
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
 * Standardized Brevo contact attribute field names.
 *
 * @usecase Syncs lead metadata, clinical status, and dynamic secure download links into Brevo contact records.
 */
export const BREVO_ATTRIBUTES = {
  FIRSTNAME: 'FIRSTNAME',
  SOURCE: 'SOURCE',
  METABOLIC_STAGE: 'METABOLIC_STAGE',
  SYMPTOMS: 'SYMPTOMS',
  DOWNLOAD_URL: 'DOWNLOAD_URL',
} as const;

export type BrevoAttribute = (typeof BREVO_ATTRIBUTES)[keyof typeof BREVO_ATTRIBUTES];

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

/**
 * Configuration definition for an active lead capture campaign.
 */
export interface CampaignConfig {
  referenceCode: string;
  name: string;
  brevoList: string;
  defaultMetabolicStage: string;
  assetFileName?: string;
  description?: string;
  isActive: boolean;
}

/**
 * Standardized default active campaigns dynamically generated from config constants.
 *
 * @usecase Drives default lead capture routes and admin dashboard active campaign cards without hardcoded strings.
 */
export const DEFAULT_CAMPAIGNS: Record<string, CampaignConfig> = {
  [CAMPAIGN_CODES.NEWSLETTER]: {
    referenceCode: CAMPAIGN_CODES.NEWSLETTER,
    name: 'Newsletter Subscription',
    brevoList: BREVO_LISTS.SUBSCRIBED_CONTACTS,
    defaultMetabolicStage: METABOLIC_STAGES.GENERAL_AWARENESS,
    description: 'General newsletter opt-ins and educational health updates',
    isActive: true,
  },
  [CAMPAIGN_CODES.INSULIN_RESET_FUNNEL]: {
    referenceCode: CAMPAIGN_CODES.INSULIN_RESET_FUNNEL,
    name: 'Insulin Reset Protocol Cheat Sheet',
    brevoList: BREVO_LISTS.INSULIN_RESET_FUNNEL,
    defaultMetabolicStage: METABOLIC_STAGES.EARLY_STAGE_HYPERINSULINEMIA,
    assetFileName: 'The_Hidden_Metabolic_Clock.pdf',
    description: 'Low-awareness metabolic symptom checklist & cheat sheet funnel',
    isActive: true,
  },
  [CAMPAIGN_CODES.COMPANION_APP_USERS]: {
    referenceCode: CAMPAIGN_CODES.COMPANION_APP_USERS,
    name: 'GlycoSense Companion App Claim',
    brevoList: BREVO_LISTS.COMPANION_APP_USERS,
    defaultMetabolicStage: METABOLIC_STAGES.COMPANION_APP_USER,
    assetFileName: 'glycosense_starter_guide.pdf',
    description: 'Direct response companion app onboarding and claim leads',
    isActive: true,
  },
};

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
