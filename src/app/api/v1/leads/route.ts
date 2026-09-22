import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import { LeadModel } from '@/models/Lead';
import { BrevoService } from '@/services/brevoService';
import { CampaignService } from '@/services/campaignService';
import { qualifyMetabolicStage, CAMPAIGN_CODES } from '@/config/leadConfig';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * HTTP POST API Route handler for Dynamic Lead Capture & Campaign Routing.
 *
 * @usecase Captures lead details, dynamically resolves target Brevo list & metabolic stage from campaign configuration, persists to DB, and syncs to Brevo.
 * @param {Request} req Incoming Next.js Request with email, firstName, symptomsChecked, source, and optional metabolicStage.
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

  const { email, firstName, symptomsChecked, source, tag, tags, campaign: campaignParam, metabolicStage } = body || {};

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
  const rawTag = source || tag || (Array.isArray(tags) ? tags[0] : undefined) || campaignParam;
  const defaultFallbackSource = cleanSymptoms.length > 0 ? CAMPAIGN_CODES.INSULIN_RESET_FUNNEL : CAMPAIGN_CODES.NEWSLETTER;
  const leadSource = rawTag && typeof rawTag === 'string' ? rawTag.trim() : defaultFallbackSource;

  // Resolve dynamic campaign mapping from Admin Configuration / defaults
  const campaign = await CampaignService.resolveCampaign(leadSource);

  // Qualify lead's metabolic status awareness depending on campaign config, capture point, and symptoms
  const qualifiedMetabolicStage = qualifyMetabolicStage({
    explicitStage: metabolicStage,
    campaignReferenceCode: campaign.referenceCode,
    defaultMetabolicStage: campaign.defaultMetabolicStage,
    symptomsCount: cleanSymptoms.length,
  });

  // 1. Persist lead to MongoDB with qualified metabolicStage
  try {
    await dbConnect();
    await LeadModel.findOneAndUpdate(
      { email: cleanEmail },
      {
        $set: {
          email: cleanEmail,
          firstName: cleanFirstName,
          source: leadSource,
          metabolicStage: qualifiedMetabolicStage,
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

  // 2. Sync contact with Brevo for automated sequences, dynamic list enrollment & METABOLIC_STAGE labeling
  try {
    await BrevoService.syncContact({
      email: cleanEmail,
      firstName: cleanFirstName,
      source: leadSource,
      symptomsChecked: cleanSymptoms,
      metabolicStage: qualifiedMetabolicStage,
      listIds: [campaign.brevoList],
    });
  } catch (brevoErr) {
    console.error('Brevo contact sync error:', brevoErr);
  }

  return NextResponse.json({
    success: true,
    message: 'Lead captured successfully. Check your email for your free cheat sheet!',
    redirectUrl: '/reset-success',
  });
}
