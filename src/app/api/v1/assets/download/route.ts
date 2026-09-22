import { NextResponse } from 'next/server';
import { Readable } from 'stream';
import { dbConnect } from '@/lib/dbConnect';
import { AssetDownloadTokenModel } from '@/models/AssetDownloadToken';
import { AssetStorageService } from '@/services/assetStorageService';

/**
 * Public streaming gateway for secured digital asset downloads.
 *
 * @usecase Validates security token, checks expiry and quota, and streams file directly from MongoDB GridFS.
 * @dependencies dbConnect, AssetDownloadTokenModel, AssetStorageService.
 */
export async function GET(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const token = url.searchParams.get('token');

  if (!token || typeof token !== 'string' || !token.trim()) {
    return createErrorResponse(
      'Missing Security Token',
      'A valid security token is required to download this asset.',
      400
    );
  }

  try {
    await dbConnect();
    const tokenDoc = await AssetDownloadTokenModel.findOne({
      token: token.trim(),
    });

    if (!tokenDoc) {
      return createErrorResponse(
        'Invalid Download Link',
        'The security token provided does not exist or has been removed.',
        404
      );
    }

    if (!tokenDoc.isActive) {
      return createErrorResponse(
        'Link Revoked',
        'This download link has been revoked by the site administrator.',
        403
      );
    }

    if (new Date(tokenDoc.expiresAt) < new Date()) {
      return createErrorResponse(
        'Link Expired',
        'This download link has expired. Please request a fresh copy from our website.',
        410
      );
    }

    if (tokenDoc.downloadCount >= tokenDoc.maxDownloads) {
      return createErrorResponse(
        'Download Quota Exceeded',
        `This download link has reached its maximum allowed limit (${tokenDoc.maxDownloads} downloads). Please request a fresh link.`,
        410
      );
    }

    const assetData = await AssetStorageService.getAssetStream(
      tokenDoc.fileId.toString()
    );

    if (!assetData) {
      return createErrorResponse(
        'Asset Unavailable',
        'The requested digital file is no longer available on our servers.',
        404
      );
    }

    // Atomically increment download count and update timestamp
    tokenDoc.downloadCount += 1;
    tokenDoc.lastDownloadedAt = new Date();
    await tokenDoc.save();

    // Convert Node.js Readable stream to Web ReadableStream for Next.js Response
    const webStream = Readable.toWeb(assetData.stream as any);

    return new Response(webStream as any, {
      status: 200,
      headers: {
        'Content-Type': assetData.file.contentType,
        'Content-Length': String(assetData.file.length),
        'Content-Disposition': `attachment; filename="${encodeURIComponent(
          assetData.file.fileName
        )}"`,
        'Cache-Control': 'no-store, no-cache, must-revalidate, private',
      },
    });
  } catch (err: any) {
    console.error('Error serving secured digital asset download:', err);
    return createErrorResponse(
      'Server Error',
      'An unexpected error occurred while preparing your download.',
      500
    );
  }
}

function createErrorResponse(
  title: string,
  message: string,
  status: number
): Response {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title} | DiabetesCare PH</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #020617; color: #f8fafc; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 1.5rem; box-sizing: border-box; }
    .card { max-width: 480px; width: 100%; background: #0f172a; border: 1px solid #1e293b; border-radius: 1.25rem; padding: 2rem; text-align: center; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.5); }
    .badge { display: inline-block; padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; background: #fef3c7; color: #92400e; margin-bottom: 1rem; }
    h1 { font-size: 1.5rem; font-weight: 800; margin: 0 0 0.75rem; color: #ffffff; }
    p { font-size: 0.95rem; color: #94a3b8; line-height: 1.6; margin: 0 0 1.5rem; }
    a { display: inline-block; width: 100%; padding: 0.75rem 1.5rem; border-radius: 0.75rem; background: #0d9488; color: #ffffff; text-decoration: none; font-weight: 700; font-size: 0.95rem; transition: background 0.2s; box-sizing: border-box; }
    a:hover { background: #14b8a6; }
  </style>
</head>
<body>
  <div class="card">
    <div class="badge">Security Notice</div>
    <h1>${title}</h1>
    <p>${message}</p>
    <a href="/">&larr; Return to DiabetesCare PH</a>
  </div>
</body>
</html>`;

  return new Response(html, {
    status,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}
