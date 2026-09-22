/**
 * Brevo (Sendinblue) API v3 Service Integration.
 *
 * @usecase Manages contact list synchronization, custom attributes, metabolic stage labeling, and automated sequence enrollment for captured leads.
 * @dependencies process.env.BREVO_API_KEY.
 */

import { BREVO_ATTRIBUTES } from '@/config/leadConfig';

export interface BrevoContactParams {
  email: string;
  firstName?: string;
  source?: string;
  symptomsChecked?: string[];
  metabolicStage?: string;
  downloadUrl?: string;
  listIds?: (number | string)[];
  unlinkListIds?: (number | string)[];
}

export interface BrevoResult {
  success: boolean;
  contactId?: number;
  updated?: boolean;
  sandbox?: boolean;
  error?: string;
}

export class BrevoService {
  private static readonly BASE_URL = 'https://api.brevo.com/v3';

  /**
   * Resolves list identifiers (both numeric IDs and named list slugs) to valid Brevo integer list IDs.
   *
   * @param {string | undefined} apiKey Brevo API key for list lookup.
   * @param {(number | string)[]} identifiers List numbers or name slugs.
   * @returns {Promise<number[]>} Array of resolved numeric list IDs.
   */
  private static async resolveListIds(
    apiKey: string | undefined,
    identifiers: (number | string)[]
  ): Promise<number[]> {
    const numericIds: number[] = [];
    const namedQueries: string[] = [];

    for (const item of identifiers) {
      const parsed = Number(item);
      if (!isNaN(parsed) && parsed > 0) {
        numericIds.push(parsed);
      } else if (typeof item === 'string' && item.trim()) {
        namedQueries.push(item.trim().toLowerCase());
      }
    }

    if (namedQueries.length === 0 || !apiKey) {
      return numericIds;
    }

    try {
      const res = await fetch(`${this.BASE_URL}/contacts/lists?limit=50&offset=0`, {
        headers: { 'api-key': apiKey, Accept: 'application/json' },
      });
      if (res.ok) {
        const data = await res.json();
        const lists: Array<{ id: number; name: string }> = data.lists || [];
        for (const nameQuery of namedQueries) {
          const normalizedQuery = nameQuery.replace(/[^a-z0-9]/g, '');
          const match = lists.find(
            (l) => l.name.toLowerCase().replace(/[^a-z0-9]/g, '') === normalizedQuery
          );
          if (match && !numericIds.includes(match.id)) {
            numericIds.push(match.id);
          }
        }
      }
    } catch (err) {
      console.error('Brevo resolveListIds lookup error:', err);
    }

    return numericIds;
  }

  /**
   * Synchronizes or updates a subscriber contact within Brevo contact lists and sets METABOLIC_STAGE attributes.
   *
   * @usecase Labels and qualifies leads in Brevo by metabolic status awareness and adds to automated sequence lists.
   * @param {BrevoContactParams} params Lead details including email, firstName, source, symptoms, metabolicStage, target lists, and optional lists to unlink.
   * @dependencies process.env.BREVO_API_KEY, global.fetch
   * @returns {Promise<BrevoResult>} Result status indicating success, contact ID, or error message.
   * @throws {Error} Safely caught and returned as structured error result.
   */
  public static async syncContact(params: BrevoContactParams): Promise<BrevoResult> {
    const apiKey = process.env.BREVO_API_KEY?.trim();
    const cleanEmail = params.email.trim().toLowerCase();
    const cleanFirstName = params.firstName?.trim() || undefined;

    // Resolve target and unlink list identifiers strictly from params or fallback env
    const candidateListIds: (number | string)[] = [];
    if (params.listIds && params.listIds.length > 0) {
      candidateListIds.push(...params.listIds);
    } else if (process.env.BREVO_LEAD_LIST_ID) {
      candidateListIds.push(process.env.BREVO_LEAD_LIST_ID);
    }

    const targetListIds = await this.resolveListIds(apiKey, candidateListIds);
    const unlinkListIds = params.unlinkListIds && params.unlinkListIds.length > 0
      ? await this.resolveListIds(apiKey, params.unlinkListIds)
      : [];

    // Graceful sandbox fallback when Brevo credentials are not configured
    if (!apiKey) {
      console.log(
        `[Brevo Sandbox Sync]: Enrolled ${cleanEmail} (Stage: ${params.metabolicStage || 'N/A'}, Lists: ${targetListIds.join(',') || 'none'})`
      );
      return { success: true, sandbox: true };
    }

    const attributes: Record<string, string> = {};
    if (cleanFirstName) attributes[BREVO_ATTRIBUTES.FIRSTNAME] = cleanFirstName;
    if (params.source) attributes[BREVO_ATTRIBUTES.SOURCE] = params.source.trim();
    if (params.metabolicStage) {
      attributes[BREVO_ATTRIBUTES.METABOLIC_STAGE] = params.metabolicStage.trim().toUpperCase();
    }
    if (params.symptomsChecked && params.symptomsChecked.length > 0) {
      attributes[BREVO_ATTRIBUTES.SYMPTOMS] = params.symptomsChecked.join(', ');
    }
    if (params.downloadUrl) {
      attributes[BREVO_ATTRIBUTES.DOWNLOAD_URL] = params.downloadUrl.trim();
    }

    const payload: Record<string, any> = {
      email: cleanEmail,
      updateEnabled: true,
    };
    if (Object.keys(attributes).length > 0) payload.attributes = attributes;
    if (targetListIds.length > 0) payload.listIds = targetListIds;
    if (unlinkListIds.length > 0) payload.unlinkListIds = unlinkListIds;

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

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        if (
          apiKey &&
          attributes[BREVO_ATTRIBUTES.DOWNLOAD_URL] &&
          typeof data.message === 'string' &&
          data.message.toLowerCase().includes('download_url')
        ) {
          console.log('[Brevo Auto-Provision]: Creating DOWNLOAD_URL attribute in Brevo...');
          await fetch(`${this.BASE_URL}/contacts/attributes/normal/DOWNLOAD_URL`, {
            method: 'POST',
            headers: { 'api-key': apiKey, 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'text' }),
          }).catch(() => null);

          const retryRes = await fetch(`${this.BASE_URL}/contacts`, {
            method: 'POST',
            headers: { 'api-key': apiKey, 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
          if (retryRes.status === 204) return { success: true, updated: true };
          if (retryRes.ok) {
            const retryData = await retryRes.json().catch(() => ({}));
            return { success: true, contactId: retryData.id };
          }
        }
        return { success: false, error: data.message || `Brevo HTTP error ${response.status}` };
      }

      return { success: true, contactId: data.id };
    } catch (err: any) {
      console.error('Brevo syncContact network error:', err);
      return { success: false, error: err.message || 'Network error communicating with Brevo' };
    }
  }
}
