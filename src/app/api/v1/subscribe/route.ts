import { NextResponse } from 'next/server';

/**
 * Regex helper for basic email format validation.
 * @usecase Ensures submitted email input is well-formed before sending to Kit API.
 */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * HTTP POST API Route handler for Kit (ConvertKit) Lead Capture Subscriptions.
 *
 * @usecase Processes email newsletter opt-ins and lead magnet download requests.
 * @param {Request} req Incoming Next.js HTTP Request object with email and optional firstName.
 * @dependencies process.env.KIT_API_KEY, process.env.NEXT_PUBLIC_KIT_FORM_ID.
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

  const { email, firstName } = body || {};

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

  const apiKey = process.env.KIT_API_KEY;
  const formId = process.env.NEXT_PUBLIC_KIT_FORM_ID || process.env.KIT_FORM_ID;

  // If Kit credentials configured, forward opt-in to ConvertKit REST API v3
  if (apiKey && formId) {
    try {
      const kitResponse = await fetch(`https://api.convertkit.com/v3/forms/${formId}/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          api_key: apiKey,
          email: cleanEmail,
          first_name: firstName ? String(firstName).trim() : undefined,
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

  // Fallback dev mode success when Kit environment variables are not populated
  console.log(`[Kit Dev Opt-In]: Subscribed ${cleanEmail} (First Name: ${firstName || 'N/A'})`);
  return NextResponse.json({
    success: true,
    message: 'Thank you for subscribing! Check your inbox for your free guide.',
  });
}
