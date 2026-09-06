import { COMMUNITY_CONFIG, SITE_CONFIG } from '@/config/constants';

export interface ReplyNotificationPayload {
  authorEmail?: string;
  authorAlias: string;
  replierName: string;
  threadTitle: string;
  threadSlug: string;
  syncToken?: string;
}

export interface NotificationResult {
  sent: boolean;
  reason?: string;
}

/**
 * Conditional Community Reply Email Notification Dispatcher.
 *
 * @usecase Sends instant email notification when someone replies to a user's thread; safely no-ops on vercel.app or sandbox mode.
 * @dependencies COMMUNITY_CONFIG, SITE_CONFIG.
 * @param {ReplyNotificationPayload} payload Author details, thread title, and reply metadata.
 * @returns {Promise<NotificationResult>} Notification delivery outcome.
 */
export async function sendReplyNotification(
  payload: ReplyNotificationPayload
): Promise<NotificationResult> {
  const { authorEmail, authorAlias, replierName, threadTitle, threadSlug, syncToken } = payload;

  if (!authorEmail) {
    return { sent: false, reason: 'no_email_provided' };
  }

  if (!COMMUNITY_CONFIG.emailNotificationsEnabled) {
    console.log(
      `[Community Notification (Sandbox/Disabled)]: Reply by ${replierName} on "${threadTitle}" to ${authorEmail}. (Skipped in sandbox mode)`
    );
    return { sent: false, reason: 'notifications_disabled_in_sandbox' };
  }

  try {
    const threadUrl = `https://${SITE_CONFIG.domain}/community/${threadSlug}${
      syncToken ? `?sync_token=${syncToken}` : ''
    }`;

    // Programmatic email delivery using Resend API when enabled
    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      return { sent: false, reason: 'missing_resend_api_key' };
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: `DiabetesCare PH Community <notifications@${SITE_CONFIG.domain}>`,
        to: [authorEmail],
        subject: `💬 ${replierName} replied to your thread: "${threadTitle}"`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1e293b;">
            <h2 style="color: #0f172a;">Hi ${authorAlias},</h2>
            <p><strong>${replierName}</strong> just replied to your discussion topic:</p>
            <blockquote style="background: #f1f5f9; border-left: 4px solid #0d9488; padding: 12px; margin: 16px 0; border-radius: 6px;">
              "${threadTitle}"
            </blockquote>
            <p style="margin-top: 24px;">
              <a href="${threadUrl}" style="background-color: #0d9488; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                View Reply & Continue Discussion &rarr;
              </a>
            </p>
            <hr style="margin: 32px 0 16px; border: none; border-top: 1px solid #e2e8f0;" />
            <p style="font-size: 11px; color: #64748b;">
              You received this because you opted in to reply alerts on DiabetesCare PH Community.
            </p>
          </div>
        `,
      }),
    });

    if (!response.ok) {
      const errJson = await response.json();
      console.warn('Resend API delivery error:', errJson);
      return { sent: false, reason: 'api_delivery_failure' };
    }

    return { sent: true };
  } catch (error: any) {
    console.error('Error dispatching community notification:', error);
    return { sent: false, reason: error.message };
  }
}
