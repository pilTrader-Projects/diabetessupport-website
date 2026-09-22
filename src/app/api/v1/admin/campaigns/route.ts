import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import { isAdminAuthenticated } from '@/lib/adminAuth';
import { CampaignConfigModel } from '@/models/CampaignConfig';
import { CampaignService } from '@/services/campaignService';
import { METABOLIC_STAGES } from '@/config/leadConfig';

/**
 * HTTP GET handler for retrieving all Brevo campaign lead capture configurations.
 *
 * @usecase Powers the Admin Dashboard Campaign Manager interface with list of active configurations.
 * @dependencies isAdminAuthenticated, CampaignService
 * @returns {Promise<NextResponse>} JSON response containing list of campaigns or 401 if unauthorized.
 */
export async function GET(req: Request): Promise<NextResponse> {
  const isAuth = await isAdminAuthenticated();
  if (!isAuth) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized. Admin session required.' },
      { status: 401 }
    );
  }

  try {
    const campaigns = await CampaignService.getAllCampaigns();
    return NextResponse.json({ success: true, data: campaigns });
  } catch (err: any) {
    console.error('Error fetching campaigns in admin API:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to retrieve campaigns.' },
      { status: 500 }
    );
  }
}

/**
 * HTTP POST handler for creating or updating a Brevo campaign lead capture configuration.
 *
 * @usecase Enables admin to map new lead capture reference codes to Brevo lists and metabolic stages.
 * @param {Request} req Incoming request containing referenceCode, name, brevoList, defaultMetabolicStage.
 * @dependencies isAdminAuthenticated, CampaignConfigModel, dbConnect
 * @returns {Promise<NextResponse>} JSON response containing the upserted campaign document.
 */
export async function POST(req: Request): Promise<NextResponse> {
  const isAuth = await isAdminAuthenticated();
  if (!isAuth) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized. Admin session required.' },
      { status: 401 }
    );
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { success: false, error: 'Invalid JSON request payload.' },
      { status: 400 }
    );
  }

  const {
    referenceCode,
    name,
    brevoList,
    defaultMetabolicStage,
    assetFileName,
    description,
    isActive,
  } = body || {};

  if (!referenceCode || typeof referenceCode !== 'string' || !referenceCode.trim()) {
    return NextResponse.json(
      { success: false, error: 'Reference code is required.' },
      { status: 400 }
    );
  }

  if (!name || typeof name !== 'string' || !name.trim()) {
    return NextResponse.json(
      { success: false, error: 'Campaign name is required.' },
      { status: 400 }
    );
  }

  if (!brevoList || typeof brevoList !== 'string' || !brevoList.trim()) {
    return NextResponse.json(
      { success: false, error: 'Target Brevo list identifier is required.' },
      { status: 400 }
    );
  }

  const cleanCode = referenceCode.trim().toLowerCase();
  const cleanName = name.trim();
  const cleanList = brevoList.trim();
  const cleanStage = (defaultMetabolicStage || METABOLIC_STAGES.GENERAL_AWARENESS).trim().toUpperCase();
  const cleanAsset = typeof assetFileName === 'string' && assetFileName.trim() ? assetFileName.trim() : '';

  try {
    await dbConnect();
    const updatedCampaign = await CampaignConfigModel.findOneAndUpdate(
      { referenceCode: cleanCode },
      {
        $set: {
          referenceCode: cleanCode,
          name: cleanName,
          brevoList: cleanList,
          defaultMetabolicStage: cleanStage,
          assetFileName: cleanAsset,
          description: description?.trim() || undefined,
          isActive: isActive !== false,
        },
      },
      { upsert: true, new: true, runValidators: true }
    );

    return NextResponse.json({
      success: true,
      message: 'Campaign configuration saved successfully.',
      data: updatedCampaign,
    });
  } catch (err: any) {
    console.error('Error saving campaign configuration:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to save campaign configuration.' },
      { status: 500 }
    );
  }
}
