import { NextResponse } from 'next/server';
import { BrevoService } from '@/services/brevoService';
import { CampaignService } from '@/services/campaignService';

/**
 * Regex helper for basic email format validation.
 * @usecase Ensures submitted email input is well-formed before sending to Brevo/Kit API.
 */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * HTTP POST API Route handler for Newsletter & Lead Capture Subscriptions.
 *
 * @usecase Processes email newsletter opt-ins and lead magnet download requests via dynamic campaign configuration.
 * @param {Request} req Incoming Next.js HTTP Request object with email, optional firstName, and optional source.
 * @dependencies BrevoService, CampaignService, process.env.KIT_API_KEY, process.env.NEXT_PUBLIC_KIT_FORM_ID.
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
  try {
    await BrevoService.syncContact({
      email: cleanEmail,
      firstName: cleanFirstName,
      source: campaign.referenceCode,
      metabolicStage: campaign.defaultMetabolicStage,
      listIds: [campaign.brevoList],
    });
  } catch (brevoErr) {
    console.error('Brevo newsletter sync error:', brevoErr);
  }

  // 2. If Kit credentials configured, forward opt-in to ConvertKit REST API v3
  const apiKey = process.env.KIT_API_KEY;
  const formId = process.env.NEXT_PUBLIC_KIT_FORM_ID || process.env.KIT_FORM_ID;

  if (apiKey && formId) {
    try {
      const kitResponse = await fetch(`https://api.convertkit.com/v3/forms/${formId}/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          api_key: apiKey,
          email: cleanEmail,
          first_name: cleanFirstName,
        }),
      });

      const kitData = await kitResponse.json();

      if (!kitResponse.ok) {
        return NextResponse.json(
          { success: false, error: kitData.message || 'Failed to submit subscription to Kit.' },
          { status: kitResponse.status }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Thank you for subscribing! Please check your inbox to confirm your subscription.',
        data: kitData.subscription,
      });
    } catch (err: any) {
      console.error('Kit API subscription network error:', err);
      return NextResponse.json(
        { success: false, error: 'Network error communicating with subscriber service.' },
        { status: 500 }
      );
    }
  }

  // Fallback dev mode success when third-party environment variables are not populated
  console.log(`[Newsletter Dev Opt-In]: Subscribed ${cleanEmail} (First Name: ${cleanFirstName || 'N/A'})`);
  return NextResponse.json({
    success: true,
    message: 'Thank you for subscribing! Check your inbox for your free guide.',
  });
}

