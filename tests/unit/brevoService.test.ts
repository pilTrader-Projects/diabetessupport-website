/**
 * TDD Unit Test Suite for BrevoService.
 *
 * @usecase Validates Brevo API v3 contact syncing, list membership, attributes, transactional email dispatch, sandbox fallback, and error handling.
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
      });

      expect(result.success).toBe(true);
      expect(result.sandbox).toBe(true);
    });

    it('should successfully dispatch contact creation to Brevo API v3 (201 Created)', async () => {
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
      expect(requestBody.attributes.SYMPTOMS).toBe('The Belly Anchor, The 3 PM Crash');
      expect(requestBody.listIds).toEqual([42]);
      expect(requestBody.updateEnabled).toBe(true);
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
        firstName: 'Maria',
        listIds: [5],
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

      global.fetch = jest.fn().mockRejectedValueOnce(new Error('DNS resolution failed'));

      const result = await BrevoService.syncContact({
        email: 'test@example.com',
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('DNS resolution failed');
    });
  });

  describe('sendTransactionalEmail()', () => {
    it('should return sandbox mode success when BREVO_API_KEY is not configured', async () => {
      delete process.env.BREVO_API_KEY;

      const result = await BrevoService.sendTransactionalEmail({
        toEmail: 'patient@example.com',
        subject: 'Test Subject',
        htmlContent: '<p>Hello</p>',
      });

      expect(result.success).toBe(true);
      expect(result.sandbox).toBe(true);
    });

    it('should dispatch transactional email payload to Brevo SMTP API', async () => {
      process.env.BREVO_API_KEY = 'xkeysib-mock-test-key';
      process.env.BREVO_SENDER_EMAIL = 'protocols@diabetescareph.com';
      process.env.BREVO_SENDER_NAME = 'DiabetesCare PH';

      const mockFetch = jest.fn().mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => ({ messageId: '<mock-message-id@brevo>' }),
      });
      global.fetch = mockFetch;

      const result = await BrevoService.sendTransactionalEmail({
        toEmail: 'recipient@example.com',
        toName: 'Pedro',
        subject: 'Your Protocol',
        htmlContent: '<p>Cheat Sheet Content</p>',
        tags: ['insulin-reset'],
      });

      expect(result.success).toBe(true);
      expect(result.messageId).toBe('<mock-message-id@brevo>');
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.brevo.com/v3/smtp/email',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'api-key': 'xkeysib-mock-test-key',
            'Content-Type': 'application/json',
          }),
        })
      );

      const requestBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(requestBody.sender.email).toBe('protocols@diabetescareph.com');
      expect(requestBody.sender.name).toBe('DiabetesCare PH');
      expect(requestBody.to).toEqual([{ email: 'recipient@example.com', name: 'Pedro' }]);
      expect(requestBody.tags).toEqual(['insulin-reset']);
    });

    it('should handle Brevo SMTP API error response gracefully', async () => {
      process.env.BREVO_API_KEY = 'xkeysib-mock-test-key';

      const mockFetch = jest.fn().mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ code: 'missing_parameter', message: 'Sender email not verified' }),
      });
      global.fetch = mockFetch;

      const result = await BrevoService.sendTransactionalEmail({
        toEmail: 'recipient@example.com',
        subject: 'Test',
        htmlContent: '<p>Content</p>',
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Sender email not verified');
    });
  });

  describe('sendLeadMagnetCheatSheet()', () => {
    it('should call sendTransactionalEmail with proper cheat sheet subject and template', async () => {
      const sendSpy = jest.spyOn(BrevoService, 'sendTransactionalEmail').mockResolvedValueOnce({
        success: true,
        messageId: 'mock-id-123',
      });

      const result = await BrevoService.sendLeadMagnetCheatSheet('juan@example.com', 'Juan');

      expect(result.success).toBe(true);
      expect(sendSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          toEmail: 'juan@example.com',
          toName: 'Juan',
          subject: expect.stringContaining('Hidden Clock'),
          tags: expect.arrayContaining(['insulin-reset-protocol', 'lead-magnet']),
        })
      );
    });
  });
});
