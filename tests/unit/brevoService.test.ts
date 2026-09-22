/**
 * TDD Unit Test Suite for BrevoService.
 *
 * @usecase Validates Brevo API v3 contact syncing, METABOLIC_STAGE attribute labeling, list/segment resolution, sandbox fallback, and error handling.
 * @dependencies BrevoService, global.fetch mock.
 */
import { BrevoService } from '../../src/services/brevoService';

describe('BrevoService Unit Tests', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('syncContact()', () => {
    it('should return sandbox success when BREVO_API_KEY is not configured', async () => {
      delete process.env.BREVO_API_KEY;

      const result = await BrevoService.syncContact({
        email: 'patient@example.com',
        firstName: 'Juan',
        source: 'insulin_reset_protocol',
        metabolicStage: 'EARLY_STAGE_HYPERINSULINEMIA',
      });

      expect(result.success).toBe(true);
      expect(result.sandbox).toBe(true);
    });

    it('should successfully dispatch contact creation with METABOLIC_STAGE attribute and numeric list ID', async () => {
      process.env.BREVO_API_KEY = 'xkeysib-mock-test-key';
      process.env.BREVO_LEAD_LIST_ID = '42';

      const mockFetch = jest.fn().mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => ({ id: 987 }),
      });
      global.fetch = mockFetch;

      const result = await BrevoService.syncContact({
        email: '  juan.delacruz@example.com  ',
        firstName: 'Juan',
        source: 'insulin_reset_protocol',
        symptomsChecked: ['The Belly Anchor', 'The 3 PM Crash'],
        metabolicStage: 'HIGH_RISK_HYPERINSULINEMIA',
      });

      expect(result.success).toBe(true);
      expect(result.contactId).toBe(987);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.brevo.com/v3/contacts',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'api-key': 'xkeysib-mock-test-key',
            'Content-Type': 'application/json',
          }),
        })
      );

      const requestBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(requestBody.email).toBe('juan.delacruz@example.com');
      expect(requestBody.attributes.FIRSTNAME).toBe('Juan');
      expect(requestBody.attributes.SOURCE).toBe('insulin_reset_protocol');
      expect(requestBody.attributes.METABOLIC_STAGE).toBe('HIGH_RISK_HYPERINSULINEMIA');
      expect(requestBody.attributes.SYMPTOMS).toBe('The Belly Anchor, The 3 PM Crash');
      expect(requestBody.listIds).toEqual([42]);
      expect(requestBody.updateEnabled).toBe(true);
    });

    it('should resolve named list slug to list ID by querying Brevo lists API', async () => {
      process.env.BREVO_API_KEY = 'xkeysib-mock-test-key';
      process.env.BREVO_LEAD_LIST_ID = 'insulin_reset_funnel';

      const mockFetch = jest
        .fn()
        // 1st call: GET /contacts/lists to resolve 'insulin_reset_funnel'
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => ({
            lists: [
              { id: 7, name: 'Insulin Reset Funnel' },
              { id: 8, name: 'General Newsletter' },
            ],
          }),
        })
        // 2nd call: POST /contacts
        .mockResolvedValueOnce({
          ok: true,
          status: 201,
          json: async () => ({ id: 555 }),
        });
      global.fetch = mockFetch;

      const result = await BrevoService.syncContact({
        email: 'maria@example.com',
        firstName: 'Maria',
        source: 'insulin_reset_landing_page',
        metabolicStage: 'EARLY_STAGE_HYPERINSULINEMIA',
      });

      expect(result.success).toBe(true);
      expect(result.contactId).toBe(555);

      // Verify list ID 7 was resolved and attached
      expect(mockFetch).toHaveBeenCalledTimes(2);
      expect(mockFetch.mock.calls[0][0]).toContain('/contacts/lists');
      const contactsCallBody = JSON.parse(mockFetch.mock.calls[1][1].body);
      expect(contactsCallBody.listIds).toEqual([7]);
      expect(contactsCallBody.attributes.METABOLIC_STAGE).toBe('EARLY_STAGE_HYPERINSULINEMIA');
    });

    it('should handle existing contact update (204 No Content)', async () => {
      process.env.BREVO_API_KEY = 'xkeysib-mock-test-key';

      const mockFetch = jest.fn().mockResolvedValueOnce({
        ok: true,
        status: 204,
        text: async () => '',
      });
      global.fetch = mockFetch;

      const result = await BrevoService.syncContact({
        email: 'existing@example.com',
        firstName: 'Pedro',
        listIds: [5],
        metabolicStage: 'GENERAL_AWARENESS',
      });

      expect(result.success).toBe(true);
      expect(result.updated).toBe(true);
    });

    it('should return error object on 400 Bad Request from Brevo', async () => {
      process.env.BREVO_API_KEY = 'xkeysib-mock-test-key';

      const mockFetch = jest.fn().mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ code: 'invalid_parameter', message: 'Email address is invalid' }),
      });
      global.fetch = mockFetch;

      const result = await BrevoService.syncContact({
        email: 'invalid-email',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Email address is invalid');
    });

    it('should return error object on 401 Unauthorized from Brevo', async () => {
      process.env.BREVO_API_KEY = 'invalid-key';

      const mockFetch = jest.fn().mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ code: 'unauthorized', message: 'Key not found' }),
      });
      global.fetch = mockFetch;

      const result = await BrevoService.syncContact({
        email: 'test@example.com',
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Key not found');
    });

    it('should catch and handle unexpected network errors gracefully', async () => {
      process.env.BREVO_API_KEY = 'xkeysib-mock-test-key';

      global.fetch = jest.fn().mockRejectedValueOnce(new Error('Network offline'));

      const result = await BrevoService.syncContact({
        email: 'test@example.com',
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Network offline');
    });
  });
});
