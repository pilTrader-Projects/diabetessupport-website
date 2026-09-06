import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import { DeviceSyncModel } from '@/models/DeviceSync';
import { COMMUNITY_CONFIG } from '@/config/constants';

/**
 * POST Handler for Generating a Cross-Device 6-Digit Sync Code.
 *
 * @usecase Allows a user on one device (e.g. iPhone) to generate an expiring 6-digit code to link a second device (e.g. PC).
 * @dependencies dbConnect, DeviceSyncModel, COMMUNITY_CONFIG.
 * @param {NextRequest} req Incoming HTTP request containing author credentials.
 * @returns {Promise<NextResponse>} JSON response with 6-digit code and expiration timestamp.
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    await dbConnect();
    const body = await req.json();
    const { authorId, authorAlias, authorTag } = body;

    if (!authorId || !authorAlias) {
      return NextResponse.json(
        { success: false, message: 'Author ID and Alias are required' },
        { status: 400 }
      );
    }

    // Generate random 6-digit numeric sync code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(
      Date.now() + COMMUNITY_CONFIG.syncCodeExpiresMinutes * 60 * 1000
    );

    const syncDoc = await DeviceSyncModel.create({
      code,
      authorId: authorId.trim(),
      authorAlias: authorAlias.trim(),
      authorTag: (authorTag || '#1001').trim(),
      expiresAt,
      claimed: false,
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          code: syncDoc.code,
          expiresAt: syncDoc.expiresAt,
          expiresMinutes: COMMUNITY_CONFIG.syncCodeExpiresMinutes,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error generating device sync code:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to generate sync code' },
      { status: 500 }
    );
  }
}

/**
 * PUT Handler for Claiming a 6-Digit Device Sync Code.
 *
 * @usecase Validates sync code from the second device and transfers the author credentials without passwords.
 * @dependencies dbConnect, DeviceSyncModel.
 * @param {NextRequest} req Incoming HTTP request containing 6-digit code.
 * @returns {Promise<NextResponse>} JSON response with claimed author identity.
 */
export async function PUT(req: NextRequest): Promise<NextResponse> {
  try {
    await dbConnect();
    const body = await req.json();
    const { code } = body;

    if (!code || !code.trim()) {
      return NextResponse.json(
        { success: false, message: '6-digit sync code is required' },
        { status: 400 }
      );
    }

    const cleanCode = code.trim().replace(/\D/g, '');
    const syncDoc = await DeviceSyncModel.findOne({
      code: cleanCode,
      claimed: false,
      expiresAt: { $gt: new Date() },
    });

    if (!syncDoc) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid or expired sync code. Please generate a new code from your first device.',
        },
        { status: 404 }
      );
    }

    // Mark code as claimed
    syncDoc.claimed = true;
    await syncDoc.save();

    return NextResponse.json({
      success: true,
      message: 'Device successfully linked!',
      data: {
        authorId: syncDoc.authorId,
        authorAlias: syncDoc.authorAlias,
        authorTag: syncDoc.authorTag,
      },
    });
  } catch (error: any) {
    console.error('Error claiming device sync code:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to claim sync code' },
      { status: 500 }
    );
  }
}
