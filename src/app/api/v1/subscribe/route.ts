import { NextResponse } from 'next/server';
import { BrevoService } from '@/services/brevoService';
import { CampaignService } from '@/services/campaignService';
import { AssetStorageService } from '@/services/assetStorageService';
import { CAMPAIGN_CODES, BREVO_LISTS } from '@/config/leadConfig';

/**
 * Regex helper for basic email format validation.
 * @usecase Ensures submitted email input is well-formed before sending to Brevo API.
 */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * HTTP POST API Route handler for Newsletter & Lead Capture Subscriptions.
 *
 * @usecase Processes email newsletter opt-ins and companion app access requests via dynamic campaign configuration and Brevo.
 * @param {Request} req Incoming Next.js HTTP Request object with email, optional firstName, and optional source.
 * @dependencies BrevoService, CampaignService.
 * @returns {Promise<NextResponse>} JSON response indicating subscription result or validation error.
 * @throws {Error} Returns 400 Bad Request for invalid input or 500 for network errors.
 */
export async function POST(req: Request): Promise<NextResponse> {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { success: false, error: 'Invalid JSON request payload.' },
      { status: 400 }
    );
  }

  const { email, firstName, source, tag, tags, campaign: campaignParam } = body || {};

  if (!email || typeof email !== 'string' || !email.trim()) {
    return NextResponse.json(
      { success: false, error: 'Email address is required.' },
      { status: 400 }
    );
  }

  const cleanEmail = email.trim().toLowerCase();
  if (!EMAIL_REGEX.test(cleanEmail)) {
    return NextResponse.json(
      { success: false, error: 'Please enter a valid email address.' },
      { status: 400 }
    );
  }

  const cleanFirstName = firstName ? String(firstName).trim() : undefined;
  const rawTag = source || tag || (Array.isArray(tags) ? tags[0] : undefined) || campaignParam;

  if (!rawTag || typeof rawTag !== 'string' || !rawTag.trim()) {
    return NextResponse.json(
      { success: false, error: 'Campaign source is required.' },
      { status: 400 }
    );
  }

  const leadSource = rawTag.trim();

  // 1. Resolve dynamic campaign mapping
  const campaign = await CampaignService.resolveCampaign(leadSource);

  // 2. Generate personalized, expiring digital asset token if campaign delivers an asset
  let downloadUrl: string | undefined = undefined;
  if (campaign.assetFileName) {
    try {
      const tokenDoc = await AssetStorageService.generateDownloadToken({
        fileName: campaign.assetFileName,
        expiresInHours: 48,
        maxDownloads: 3,
        createdBy: `subscriber_${cleanEmail}`,
      });
      if (tokenDoc) {
        const origin = req.headers.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
        downloadUrl = `${origin}/api/v1/assets/download?token=${tokenDoc.token}`;
      }
    } catch (tokenErr) {
      console.warn('Could not generate dynamic asset download link for subscriber:', tokenErr);
    }
  }

  // 3. Sync contact to Brevo using mapped list, metabolic stage, and DOWNLOAD_URL
  let syncResult: any = null;
  try {
    syncResult = await BrevoService.syncContact({
      email: cleanEmail,
      firstName: cleanFirstName,
      source: campaign.referenceCode,
      metabolicStage: campaign.defaultMetabolicStage,
      downloadUrl,
      listIds: [campaign.brevoList],
    });
  } catch (brevoErr) {
    console.error('Brevo newsletter sync error:', brevoErr);
  }

  const successMessage =
    campaign.referenceCode === CAMPAIGN_CODES.COMPANION_APP_USERS ||
    campaign.brevoList === BREVO_LISTS.COMPANION_APP_USERS
      ? 'Free account access reserved! Check your email for login instructions.'
      : 'Thank you for subscribing! Check your inbox for your free guide.';

  return NextResponse.json({
    success: true,
    message: successMessage,
    downloadUrl,
    data: syncResult,
  });
}
