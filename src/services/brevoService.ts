/**
 * Brevo (Sendinblue) API v3 Service Integration.
 *
 * @usecase Manages contact list synchronization, custom attributes, automated sequence enrollment, and transactional email delivery for lead capture.
 * @dependencies process.env.BREVO_API_KEY, process.env.BREVO_LEAD_LIST_ID, process.env.BREVO_SENDER_EMAIL.
 */

export interface BrevoContactParams {
  email: string;
  firstName?: string;
  source?: string;
  symptomsChecked?: string[];
  listIds?: number[];
}

export interface BrevoEmailParams {
  toEmail: string;
  toName?: string;
  subject: string;
  htmlContent: string;
  tags?: string[];
}

export interface BrevoResult {
  success: boolean;
  contactId?: number;
  updated?: boolean;
  messageId?: string;
  sandbox?: boolean;
  error?: string;
}

export class BrevoService {
  private static readonly BASE_URL = 'https://api.brevo.com/v3';

  /**
   * Synchronizes or updates a subscriber contact within Brevo contact lists and attributes.
   *
   * @usecase Enrolls lead in automated nurturing sequences or newsletter campaigns with custom metabolic attributes.
   * @param {BrevoContactParams} params Lead details including email, firstName, source, symptoms, and target lists.
   * @dependencies process.env.BREVO_API_KEY, process.env.BREVO_LEAD_LIST_ID, global.fetch
   * @returns {Promise<BrevoResult>} Result status indicating success, contact ID, or error message.
   * @throws {Error} Safely caught and returned as structured error result.
   */
  public static async syncContact(params: BrevoContactParams): Promise<BrevoResult> {
    const apiKey = process.env.BREVO_API_KEY;
    const cleanEmail = params.email.trim().toLowerCase();
    const cleanFirstName = params.firstName?.trim() || undefined;

    // Resolve target list IDs
    let targetListIds: number[] = [];
    if (params.listIds && params.listIds.length > 0) {
      targetListIds = params.listIds.map(Number).filter((id) => !isNaN(id));
    } else if (process.env.BREVO_LEAD_LIST_ID) {
      const defaultId = Number(process.env.BREVO_LEAD_LIST_ID);
      if (!isNaN(defaultId)) {
        targetListIds.push(defaultId);
      }
    }

    // Graceful sandbox fallback when Brevo credentials are not configured
    if (!apiKey) {
      console.log(
        `[Brevo Sandbox Sync]: Enrolled ${cleanEmail} (Lists: ${targetListIds.join(',') || 'none'})`
      );
      return { success: true, sandbox: true };
    }

    const attributes: Record<string, string> = {};
    if (cleanFirstName) attributes.FIRSTNAME = cleanFirstName;
    if (params.source) attributes.SOURCE = params.source.trim();
    if (params.symptomsChecked && params.symptomsChecked.length > 0) {
      attributes.SYMPTOMS = params.symptomsChecked.join(', ');
    }

    const payload: Record<string, any> = {
      email: cleanEmail,
      updateEnabled: true,
    };
    if (Object.keys(attributes).length > 0) payload.attributes = attributes;
    if (targetListIds.length > 0) payload.listIds = targetListIds;

    try {
      const response = await fetch(`${this.BASE_URL}/contacts`, {
        method: 'POST',
        headers: {
          'api-key': apiKey,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.status === 204) {
        return { success: true, updated: true };
      }

      const data = await response.json();
      if (!response.ok) {
        return { success: false, error: data.message || `Brevo HTTP error ${response.status}` };
      }

      return { success: true, contactId: data.id };
    } catch (err: any) {
      console.error('Brevo syncContact network error:', err);
      return { success: false, error: err.message || 'Network error communicating with Brevo' };
    }
  }

  /**
   * Dispatches a transactional email via Brevo SMTP API.
   *
   * @usecase Sends instantaneous protocol cheat sheet or system alerts.
   * @param {BrevoEmailParams} params Email parameters including recipient, subject, HTML content, and tags.
   * @dependencies process.env.BREVO_API_KEY, process.env.BREVO_SENDER_EMAIL, process.env.BREVO_SENDER_NAME, global.fetch
   * @returns {Promise<BrevoResult>} Result status indicating success with message ID or error message.
   * @throws {Error} Safely caught and returned as structured error result.
   */
  public static async sendTransactionalEmail(params: BrevoEmailParams): Promise<BrevoResult> {
    const apiKey = process.env.BREVO_API_KEY;
    const senderEmail = process.env.BREVO_SENDER_EMAIL || 'protocols@diabetescareph.com';
    const senderName = process.env.BREVO_SENDER_NAME || 'DiabetesCare PH';

    if (!apiKey) {
      console.log(`[Brevo Sandbox Email]: Dispatched "${params.subject}" to ${params.toEmail}`);
      return { success: true, sandbox: true };
    }

    const payload = {
      sender: { name: senderName, email: senderEmail },
      to: [{ email: params.toEmail.trim().toLowerCase(), name: params.toName?.trim() }],
      subject: params.subject,
      htmlContent: params.htmlContent,
      tags: params.tags || [],
    };

    try {
      const response = await fetch(`${this.BASE_URL}/smtp/email`, {
        method: 'POST',
        headers: {
          'api-key': apiKey,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) {
        return { success: false, error: data.message || `Brevo HTTP error ${response.status}` };
      }

      return { success: true, messageId: data.messageId };
    } catch (err: any) {
      console.error('Brevo sendTransactionalEmail network error:', err);
      return { success: false, error: err.message || 'Network error communicating with Brevo' };
    }
  }

  /**
   * Sends the automated 3-Page Hidden Clock & Insulin Reset Protocol Cheat Sheet email.
   *
   * @usecase Immediate lead magnet fulfillment upon symptom checklist completion.
   * @param {string} email Recipient email address.
   * @param {string} [firstName] Recipient first name.
   * @dependencies sendTransactionalEmail
   * @returns {Promise<BrevoResult>} Delivery result.
   */
  public static async sendLeadMagnetCheatSheet(
    email: string,
    firstName?: string
  ): Promise<BrevoResult> {
    const cleanName = firstName?.trim() || 'there';
    const subject = 'Your 3-Page Hidden Clock & Insulin Reset Protocol Cheat Sheet';
    const htmlContent = `
      <div style="font-family: sans-serif; line-height: 1.6; color: #1e293b; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2>Hi ${cleanName},</h2>
        <p>Thank you for requesting the <strong>3-Page "Hidden Clock" Insulin Reset Cheat Sheet</strong>.</p>
        <p>Your guide reveals how chronic hyperinsulinemia operates silently 10 to 15 years before blood sugar tests sound the alarm, plus the 4 golden rules to reset your metabolic response tonight.</p>
        <div style="margin: 25px 0;">
          <a href="https://diabetescareph.com/downloads/hidden-clock-cheat-sheet.pdf" style="background-color: #0f172a; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Download Free 3-Page Cheat Sheet (PDF)</a>
        </div>
        <p>Warm regards,<br/>The DiabetesCare PH &amp; GlycoSense Team</p>
      </div>
    `;

    return this.sendTransactionalEmail({
      toEmail: email,
      toName: firstName,
      subject,
      htmlContent,
      tags: ['insulin-reset-protocol', 'lead-magnet'],
    });
  }
}
