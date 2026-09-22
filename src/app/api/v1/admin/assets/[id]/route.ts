import { NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/adminAuth';
import { AssetStorageService } from '@/services/assetStorageService';

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * HTTP DELETE handler for removing an asset from GridFS and cleaning up associated tokens.
 *
 * @usecase Enables Admin to permanently delete uploaded files and revoke all issued tokens.
 * @dependencies isAdminAuthenticated, AssetStorageService.
 */
export async function DELETE(
  req: Request,
  context: RouteContext
): Promise<NextResponse> {
  const isAuth = await isAdminAuthenticated(req);
  if (!isAuth) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized. Admin session required.' },
      { status: 401 }
    );
  }

  const { id } = await context.params;
  if (!id || typeof id !== 'string') {
    return NextResponse.json(
      { success: false, error: 'Asset ID is required.' },
      { status: 400 }
    );
  }

  try {
    await AssetStorageService.deleteAsset(id);
    return NextResponse.json({
      success: true,
      message: 'Asset and associated tokens deleted successfully.',
    });
  } catch (err: any) {
    console.error('Error deleting digital asset:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to delete digital asset.' },
      { status: 500 }
    );
  }
}
