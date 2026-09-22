import { NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/adminAuth';
import { AssetStorageService } from '@/services/assetStorageService';

/**
 * HTTP GET and POST handlers for Admin Digital Assets.
 *
 * @usecase Lists all stored digital assets and handles new file uploads to MongoDB GridFS.
 * @dependencies isAdminAuthenticated, AssetStorageService.
 */
export async function GET(): Promise<NextResponse> {
  const isAuth = await isAdminAuthenticated();
  if (!isAuth) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized. Admin session required.' },
      { status: 401 }
    );
  }

  try {
    const assets = await AssetStorageService.listAssets();
    return NextResponse.json({ success: true, data: assets });
  } catch (err: any) {
    console.error('Error listing digital assets:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to list digital assets.' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request): Promise<NextResponse> {
  const isAuth = await isAdminAuthenticated(req);
  if (!isAuth) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized. Admin session required.' },
      { status: 401 }
    );
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file || typeof file === 'string') {
      return NextResponse.json(
        { success: false, error: 'A valid file must be uploaded.' },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const contentType = file.type || 'application/pdf';

    const uploaded = await AssetStorageService.uploadAsset(
      buffer,
      file.name,
      contentType
    );

    return NextResponse.json({
      success: true,
      message: 'File uploaded successfully to MongoDB GridFS.',
      data: uploaded,
    });
  } catch (err: any) {
    console.error('Error uploading digital asset to GridFS:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to upload digital asset.' },
      { status: 500 }
    );
  }
}
