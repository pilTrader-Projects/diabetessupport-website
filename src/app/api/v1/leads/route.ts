import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import { LeadModel } from '@/models/Lead';
import { BrevoService } from '@/services/brevoService';
import { CampaignService } from '@/services/campaignService';
import { AssetStorageService } from '@/services/assetStorageService';
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

  if (!rawTag || typeof rawTag !== 'string' || !rawTag.trim()) {
    return NextResponse.json(
      { success: false, error: 'Campaign source is required.' },
      { status: 400 }
    );
  }

  const leadSource = rawTag.trim();
  await dbConnect();

  // Resolve dynamic campaign mapping from MongoDB
  const campaign = await CampaignService.resolveCampaign(leadSource);
  console.log(`[Lead Capture]: Resolved campaign "${campaign.referenceCode}" from MongoDB -> Asset: "${campaign.assetFileName || 'None'}", Brevo List: "${campaign.brevoList}"`);

  // Qualify lead's metabolic status awareness depending on campaign config, capture point, and symptoms
  const qualifiedMetabolicStage = qualifyMetabolicStage({
    explicitStage: metabolicStage,
    campaignReferenceCode: campaign.referenceCode,
    defaultMetabolicStage: campaign.defaultMetabolicStage,
    symptomsCount: cleanSymptoms.length,
  });

  // 1. Persist lead to MongoDB with qualified metabolicStage
  try {
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
      { upsert: true, returnDocument: 'after', runValidators: true }
    );
  } catch (dbErr: any) {
    console.error('Database error saving lead:', dbErr);
  }

  // 2. Generate personalized, expiring digital asset token if campaign delivers an asset
  let downloadUrl: string | undefined = undefined;
  if (campaign.assetFileName) {
    try {
      const tokenDoc = await AssetStorageService.generateDownloadToken({
        fileName: campaign.assetFileName,
        expiresInHours: 48,
        maxDownloads: 3,
        createdBy: `lead_${cleanEmail}`,
      });
      if (tokenDoc) {
        const origin = req.headers.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
        downloadUrl = `${origin}/api/v1/assets/download?token=${tokenDoc.token}`;
        console.log(`[Lead Capture]: Issued token for ${campaign.assetFileName}: ${downloadUrl}`);
      } else {
        console.warn(`[Lead Capture]: Asset "${campaign.assetFileName}" not found in GridFS.`);
      }
    } catch (tokenErr) {
      console.warn('[Lead Capture]: Failed generating download link:', tokenErr);
    }
  }

  // 3. Sync contact with Brevo for automated sequences, dynamic list enrollment, METABOLIC_STAGE & DOWNLOAD_URL
  try {
    const brevoRes = await BrevoService.syncContact({
      email: cleanEmail,
      firstName: cleanFirstName,
      source: leadSource,
      symptomsChecked: cleanSymptoms,
      metabolicStage: qualifiedMetabolicStage,
      downloadUrl,
      listIds: [campaign.brevoList],
    });
    if (!brevoRes.success) {
      console.error('[Lead Capture] Brevo sync returned error:', brevoRes.error);
    }
  } catch (brevoErr) {
    console.error('Brevo contact sync error:', brevoErr);
  }

  return NextResponse.json({
    success: true,
    message: 'Lead captured successfully. Check your email for your free cheat sheet!',
    redirectUrl: '/reset-success',
    downloadUrl,
  });
}
