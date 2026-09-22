import { NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/adminAuth';
import { AssetStorageService } from '@/services/assetStorageService';
import { AssetDownloadTokenModel } from '@/models/AssetDownloadToken';
import mongoose from 'mongoose';

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * HTTP GET and POST handlers for managing tokens for a specific digital asset.
 *
 * @usecase Generates new secured download links and lists active tokens for an asset.
 * @dependencies isAdminAuthenticated, AssetStorageService, AssetDownloadTokenModel.
 */
export async function GET(
  req: Request,
  context: RouteContext
): Promise<NextResponse> {
  const isAuth = await isAdminAuthenticated(req);
  if (!isAuth) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized.' },
      { status: 401 }
    );
  }

  const { id } = await context.params;
  try {
    const tokens = await AssetDownloadTokenModel.find({
      fileId: new mongoose.Types.ObjectId(id),
    })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ success: true, data: tokens });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch tokens.' },
      { status: 500 }
    );
  }
}

export async function POST(
  req: Request,
  context: RouteContext
): Promise<NextResponse> {
  const isAuth = await isAdminAuthenticated(req);
  if (!isAuth) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized.' },
      { status: 401 }
    );
  }

  const { id } = await context.params;
  let body: any = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  const { expiresInHours, maxDownloads } = body;

  try {
    const tokenDoc = await AssetStorageService.generateDownloadToken({
      fileId: id,
      expiresInHours: Number(expiresInHours) || 48,
      maxDownloads: Number(maxDownloads) || 3,
    });

    if (!tokenDoc) {
      return NextResponse.json(
        { success: false, error: 'Digital asset not found.' },
        { status: 404 }
      );
    }

    const url = new URL(req.url);
    const downloadUrl = `${url.origin}/api/v1/assets/download?token=${tokenDoc.token}`;

    return NextResponse.json({
      success: true,
      message: 'Secure download link generated successfully.',
      data: tokenDoc,
      downloadUrl,
    });
  } catch (err: any) {
    console.error('Error generating asset download token:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to generate download token.' },
      { status: 500 }
    );
  }
}
