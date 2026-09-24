import { NextResponse } from 'next/server';
import { AppConfigService } from '@/services/appConfigService';

export const revalidate = 60; // Cache public config for 60 seconds

/**
 * Public HTTP GET API handler for retrieving companion app branding, destination URL, and CTA copy.
 *
 * @usecase Powers frontend promotional cards and lead capture forms with dynamic companion app links.
 * @returns {Promise<NextResponse>} JSON response with dynamic companion app configuration.
 */
export async function GET(): Promise<NextResponse> {
  try {
    const config = await AppConfigService.getAppConfig();
    return NextResponse.json({
      success: true,
      data: {
        appName: config.appName,
        appUrl: config.appUrl,
        platformType: config.platformType,
        ctaText: config.ctaText,
        successTitle: config.successTitle,
        successMessage: config.successMessage,
        openInNewTab: config.openInNewTab,
      },
    });
  } catch (err: any) {
    console.error('Error fetching public app config:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to retrieve app configuration.' },
      { status: 500 }
    );
  }
}
