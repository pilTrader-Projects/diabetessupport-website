import { NextResponse } from 'next/server';
import { BrevoService } from '@/services/brevoService';
import { CampaignService } from '@/services/campaignService';

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

  const { email, firstName, source } = body || {};

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
  const leadSource = source && typeof source === 'string' ? source.trim() : 'newsletter';

  // 1. Resolve dynamic campaign mapping
  const campaign = await CampaignService.resolveCampaign(leadSource);

  // 2. Sync contact to Brevo using mapped list and metabolic stage
  let syncResult: any = null;
  try {
    syncResult = await BrevoService.syncContact({
      email: cleanEmail,
      firstName: cleanFirstName,
      source: campaign.referenceCode,
      metabolicStage: campaign.defaultMetabolicStage,
      listIds: [campaign.brevoList],
    });
  } catch (brevoErr) {
    console.error('Brevo newsletter sync error:', brevoErr);
  }

  const successMessage =
    campaign.referenceCode === 'companion_app_users'
      ? 'Free account access reserved! Check your email for login instructions.'
      : 'Thank you for subscribing! Check your inbox for your free guide.';

  return NextResponse.json({
    success: true,
    message: successMessage,
    data: syncResult,
  });
}
