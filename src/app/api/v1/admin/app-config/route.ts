import { NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/adminAuth';
import { AppConfigService } from '@/services/appConfigService';

/**
 * HTTP GET handler for retrieving companion app integration settings for the Admin Panel.
 *
 * @usecase Loads current companion app destination, branding, and CTA configuration for admin editing.
 * @dependencies isAdminAuthenticated, AppConfigService
 * @returns {Promise<NextResponse>} JSON response with full app configuration or 401.
 */
export async function GET(req: Request): Promise<NextResponse> {
  const isAuth = await isAdminAuthenticated(req);
  if (!isAuth) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized. Admin session required.' },
      { status: 401 }
    );
  }

  try {
    const config = await AppConfigService.getAppConfig();
    return NextResponse.json({ success: true, data: config });
  } catch (err: any) {
    console.error('Error fetching admin app config:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to retrieve app configuration.' },
      { status: 500 }
    );
  }
}

/**
 * HTTP POST handler for updating companion app integration settings.
 *
 * @usecase Saves new companion app destination (PlayStore, AppStore, Web URL), brand name, and CTA copy.
 * @dependencies isAdminAuthenticated, AppConfigService
 * @returns {Promise<NextResponse>} JSON response indicating success or validation error.
 */
export async function POST(req: Request): Promise<NextResponse> {
  const isAuth = await isAdminAuthenticated(req);
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
    appName,
    appUrl,
    platformType,
    ctaText,
    successTitle,
    successMessage,
    openInNewTab,
    isActive,
    description,
  } = body || {};

  if (!appName || typeof appName !== 'string' || !appName.trim()) {
    return NextResponse.json(
      { success: false, error: 'App brand name is required.' },
      { status: 400 }
    );
  }

  if (!appUrl || typeof appUrl !== 'string' || !appUrl.trim()) {
    return NextResponse.json(
      { success: false, error: 'Destination app URL is required.' },
      { status: 400 }
    );
  }

  try {
    const updated = await AppConfigService.updateAppConfig({
      appName: appName.trim(),
      appUrl: appUrl.trim(),
      platformType: platformType || 'web',
      ctaText: typeof ctaText === 'string' ? ctaText.trim() : undefined,
      successTitle: typeof successTitle === 'string' ? successTitle.trim() : undefined,
      successMessage: typeof successMessage === 'string' ? successMessage.trim() : undefined,
      openInNewTab: openInNewTab !== undefined ? Boolean(openInNewTab) : true,
      isActive: isActive !== undefined ? Boolean(isActive) : true,
      description: typeof description === 'string' ? description.trim() : undefined,
    });

    return NextResponse.json({
      success: true,
      message: 'Companion app configuration updated successfully.',
      data: updated,
    });
  } catch (err: any) {
    console.error('Error updating admin app config:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to update companion app configuration.' },
      { status: 500 }
    );
  }
}
