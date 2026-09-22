import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import { LeadModel } from '@/models/Lead';
import { BrevoService } from '@/services/brevoService';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * HTTP POST API Route handler for Low-Awareness Lead Capture (Bikman/Insulin Reset Protocol).
 *
 * @usecase Captures lead email, first name, and selected metabolic symptoms, persists to database, syncs with Brevo and Kit, and returns bridge redirect URL.
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
  }

  // 2. Sync contact with Brevo and dispatch automated sequence / cheat sheet
  try {
    await BrevoService.syncContact({
      email: cleanEmail,
      firstName: cleanFirstName,
      source: leadSource,
      symptomsChecked: cleanSymptoms,
    });
    await BrevoService.sendLeadMagnetCheatSheet(cleanEmail, cleanFirstName);
  } catch (brevoErr) {
    console.error('Brevo sync / dispatch error:', brevoErr);
  }

  // 3. Fallback sync with Kit (ConvertKit) if configured
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
  }

  return NextResponse.json({
    success: true,
    message: 'Lead captured successfully. Check your email for your free cheat sheet!',
    redirectUrl: '/reset-success',
  });
}
