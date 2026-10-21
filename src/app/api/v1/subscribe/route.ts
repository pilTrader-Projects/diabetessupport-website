import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import { BrevoService } from '@/services/brevoService';
import { CampaignService } from '@/services/campaignService';
import { AssetStorageService } from '@/services/assetStorageService';
import { AppConfigService } from '@/services/appConfigService';
import { CAMPAIGN_CODES, BREVO_LISTS } from '@/config/leadConfig';
import { ConsentRecordModel } from '@/models/ConsentRecord';
import {
  subscribeSchema,
  checkRateLimit,
  hashIpAddress,
} from '@/lib/subscribeValidation';

/**
 * HTTP POST API Route handler for Newsletter & Lead Capture Subscriptions (P1-04).
 *
 * @usecase Hardened subscription endpoint enforcing Zod validation, affirmative consent (RA 10173),
 * in-memory sliding-window IP rate limiting, honeypot spam protection, auditable ConsentRecord logging,
 * and dynamic Brevo campaign list routing.
 *
 * @param {Request} req Incoming HTTP Request.
 * @returns {Promise<NextResponse>} JSON response indicating subscription result or validation error.
 */
export async function POST(req: Request): Promise<NextResponse> {
  // 1. IP extraction & Rate limiting
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip')?.trim() ||
    '127.0.0.1';

  const rateLimit = checkRateLimit(ip);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        success: false,
        error: 'Too many subscription attempts. Please wait a moment before trying again.',
      },
      {
        status: 429,
        headers: {
          'Retry-After': String(Math.ceil(rateLimit.resetInMs / 1000)),
        },
      }
    );
  }

  // 2. Parse JSON payload
  let rawBody: any;
  try {
    rawBody = await req.json();
  } catch {
    return NextResponse.json(
      { success: false, error: 'Invalid JSON request payload.' },
      { status: 400 }
    );
  }

  // 3. Honeypot check: If bot filled the hidden honeypot field, return fake success without processing
  if (
    rawBody?.honeypot &&
    typeof rawBody.honeypot === 'string' &&
    rawBody.honeypot.trim().length > 0
  ) {
    return NextResponse.json({
      success: true,
      message: 'Thank you for subscribing! Check your inbox for confirmation.',
    });
  }

  // 4. Normalize backwards-compatible aliases for source
  if (!rawBody?.source && (rawBody?.tag || rawBody?.campaign)) {
    rawBody.source = rawBody.tag || rawBody.campaign;
  }

  // 5. Zod schema validation
  const validationResult = subscribeSchema.safeParse(rawBody);
  if (!validationResult.success) {
    const firstError =
      validationResult.error.issues?.[0]?.message ||
      (validationResult.error as any).errors?.[0]?.message ||
      'Invalid subscription input.';
    return NextResponse.json(
      { success: false, error: firstError },
      { status: 400 }
    );
  }

  const { email, firstName, source, edition, noticeVersion } = validationResult.data;

  // 6. Connect to database and record auditable ConsentRecord (RA 10173)
  await dbConnect();
  const ipHash = hashIpAddress(ip);

  try {
    await ConsentRecordModel.create({
      email,
      source,
      edition,
      noticeVersion,
      consentedAt: new Date(),
      ipHash,
    });
  } catch (consentErr) {
    // Non-fatal logging: Continue execution so subscriber flow succeeds even if audit collection lags
    console.error('ConsentRecord persistence warning:', consentErr);
  }

  // 7. Resolve dynamic campaign mapping (preserves existing Brevo lists & attributes)
  const campaign = await CampaignService.resolveCampaign(source);

  // 8. Generate personalized, expiring digital asset token if campaign delivers an asset
  let downloadUrl: string | undefined = undefined;
  if (campaign.assetFileName) {
    try {
      const tokenDoc = await AssetStorageService.generateDownloadToken({
        fileName: campaign.assetFileName,
        expiresInHours: 48,
        maxDownloads: 3,
        createdBy: `subscriber_${ipHash.slice(0, 8)}`,
      });
      if (tokenDoc) {
        const origin =
          req.headers.get('origin') ||
          process.env.NEXT_PUBLIC_SITE_URL ||
          'http://localhost:3000';
        downloadUrl = `${origin}/api/v1/assets/download?token=${tokenDoc.token}`;
      }
    } catch (tokenErr) {
      console.warn('Could not generate dynamic asset download link for subscriber:', tokenErr);
    }
  }

  // 9. Sync contact to Brevo using resolved campaign list, metabolic stage, and download URL
  let syncResult: any = null;
  try {
    syncResult = await BrevoService.syncContact({
      email,
      firstName,
      source: campaign.referenceCode,
      metabolicStage: campaign.defaultMetabolicStage,
      downloadUrl,
      listIds: [campaign.brevoList],
    });
  } catch (brevoErr) {
    console.error('Brevo newsletter sync error:', brevoErr);
  }

  // 10. Check if companion app campaign & resolve response message
  const isCompanionApp =
    campaign.referenceCode === CAMPAIGN_CODES.COMPANION_APP_USERS ||
    campaign.brevoList === BREVO_LISTS.COMPANION_APP_USERS;

  const appConfig = await AppConfigService.getAppConfig();

  const successMessage = isCompanionApp
    ? appConfig.successMessage || 'Free account access ready! Click below to launch your account.'
    : 'Thank you for subscribing! Check your inbox for your free guide.';

  return NextResponse.json({
    success: true,
    message: successMessage,
    downloadUrl,
    appUrl: isCompanionApp ? appConfig.appUrl : undefined,
    appName: isCompanionApp ? appConfig.appName : undefined,
    ctaText: isCompanionApp ? appConfig.ctaText : undefined,
    successTitle: isCompanionApp ? appConfig.successTitle : undefined,
    openInNewTab: isCompanionApp ? appConfig.openInNewTab : undefined,
    data: syncResult,
  });
}
