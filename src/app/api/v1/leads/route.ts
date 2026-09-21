import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import { LeadModel } from '@/models/Lead';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * HTTP POST API Route handler for Low-Awareness Lead Capture (Bikman/Insulin Reset Protocol).
 *
 * @usecase Captures lead email, first name, and selected metabolic symptoms, persists to database, syncs with Kit, and returns bridge redirect URL.
 * @param {Request} req Incoming Next.js Request with email, firstName, symptomsChecked, and source.
 * @returns {Promise<NextResponse>} JSON response with success status and redirection target.
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

  const { email, firstName, symptomsChecked, source } = body || {};

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

  const cleanFirstName = firstName && typeof firstName === 'string' ? firstName.trim() : undefined;
  const cleanSymptoms = Array.isArray(symptomsChecked) ? symptomsChecked.map(String) : [];
  const leadSource = source && typeof source === 'string' ? source.trim() : 'insulin_reset_protocol';

  // 1. Persist lead to MongoDB
  try {
    await dbConnect();
    await LeadModel.findOneAndUpdate(
      { email: cleanEmail },
      {
        $set: {
          email: cleanEmail,
          firstName: cleanFirstName,
          source: leadSource,
          status: 'subscribed',
        },
        $addToSet: {
          symptomsChecked: { $each: cleanSymptoms },
        },
      },
      { upsert: true, new: true, runValidators: true }
    );
  } catch (dbErr: any) {
    console.error('Database error saving lead:', dbErr);
    // Proceed to attempt marketing webhook/sync even if DB logs warning
  }

  // 2. Sync with Kit (ConvertKit) if configured
  const apiKey = process.env.KIT_API_KEY;
  const formId = process.env.NEXT_PUBLIC_KIT_FORM_ID || process.env.KIT_FORM_ID;

  if (apiKey && formId) {
    try {
      await fetch(`https://api.convertkit.com/v3/forms/${formId}/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          api_key: apiKey,
          email: cleanEmail,
          first_name: cleanFirstName,
          tags: ['insulin-reset-protocol', 'hidden-clock'],
        }),
      });
    } catch (kitErr) {
      console.error('Kit subscription forward error:', kitErr);
    }
  } else {
    console.log(`[Lead Capture Dev/Sandbox]: Subscribed ${cleanEmail} (First Name: ${cleanFirstName || 'N/A'}, Source: ${leadSource})`);
  }

  // 3. Dispatch automated email payload via Resend if enabled
  const resendApiKey = process.env.RESEND_API_KEY;
  if (resendApiKey) {
    try {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${resendApiKey}`,
        },
        body: JSON.stringify({
          from: 'DiabetesCare PH <protocols@diabetescareph.com>',
          to: [cleanEmail],
          subject: 'Your 3-Page Hidden Clock & Insulin Reset Protocol Cheat Sheet',
          html: `
            <div style="font-family: sans-serif; line-height: 1.6; color: #1e293b; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2>Hi ${cleanFirstName || 'there'},</h2>
              <p>Thank you for requesting the <strong>3-Page "Hidden Clock" Insulin Reset Cheat Sheet</strong>.</p>
              <p>Your guide reveals how chronic hyperinsulinemia operates silently 10 to 15 years before blood sugar tests sound the alarm, plus the 4 golden rules to reset your metabolic response tonight.</p>
              <div style="margin: 25px 0;">
                <a href="https://diabetescareph.com/downloads/hidden-clock-cheat-sheet.pdf" style="background-color: #0f172a; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Download Free 3-Page Cheat Sheet (PDF)</a>
              </div>
              <p>Warm regards,<br/>The DiabetesCare PH &amp; GlycoSense Team</p>
            </div>
          `,
        }),
      });
    } catch (emailErr) {
      console.error('Automated email dispatch error:', emailErr);
    }
  }

  return NextResponse.json({
    success: true,
    message: 'Lead captured successfully. Check your email for your free cheat sheet!',
    redirectUrl: '/reset-success',
  });
}
