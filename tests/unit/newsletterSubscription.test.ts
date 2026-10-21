/**
 * Unit & Integration Test Suite for Newsletter & Lead Capture Subscription API (/api/v1/subscribe).
 *
 * @usecase Validates that POST /api/v1/subscribe enforces Zod schema validation, affirmative consent (RA 10173),
 * in-memory rate limiting, honeypot bot trap, ConsentRecord creation, and routes contacts to Brevo lists.
 * @dependencies POST handler from src/app/api/v1/subscribe/route.ts, BrevoService, ConsentRecordModel.
 */
import { POST } from '../../src/app/api/v1/subscribe/route';
import { clearRateLimitStore } from '../../src/lib/subscribeValidation';
import { ConsentRecordModel } from '../../src/models/ConsentRecord';

jest.mock('../../src/lib/dbConnect', () => ({
  dbConnect: jest.fn().mockResolvedValue(true),
}));

jest.mock('../../src/models/ConsentRecord', () => ({
  ConsentRecordModel: {
    create: jest.fn().mockResolvedValue({ _id: 'consent-rec-123' }),
  },
}));

describe('Newsletter & Lead Subscription API (/api/v1/subscribe)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    clearRateLimitStore();
  });

  it('should return 400 Bad Request if email is missing', async () => {
    const req = new Request('http://localhost:3000/api/v1/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ firstName: 'John', consent: true, source: 'newsletter_funnel' }),
    });

    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.success).toBe(false);
    expect(body.error).toContain('Email');
  });

  it('should return 400 Bad Request if email format is invalid', async () => {
    const req = new Request('http://localhost:3000/api/v1/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'not-an-email-address', consent: true, source: 'newsletter_funnel' }),
    });

    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.success).toBe(false);
    expect(body.error).toContain('valid email');
  });

  it('should return 400 Bad Request if affirmative consent is missing or false', async () => {
    const req = new Request('http://localhost:3000/api/v1/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'subscriber@example.com', source: 'newsletter_funnel', consent: false }),
    });

    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.success).toBe(false);
    expect(body.error).toMatch(/agree|privacy/i);
  });

  it('should return 400 Bad Request if campaign source is missing', async () => {
    const req = new Request('http://localhost:3000/api/v1/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'subscriber@example.com', firstName: 'Jane', consent: true }),
    });

    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.success).toBe(false);
    expect(body.error).toContain('Campaign source is required');
  });

  it('should return 200 OK and safely drop honeypot bot submissions without syncing to Brevo', async () => {
    const syncSpy = jest.spyOn(require('../../src/services/brevoService').BrevoService, 'syncContact');

    const req = new Request('http://localhost:3000/api/v1/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'spambot@example.com',
        source: 'newsletter_funnel',
        consent: true,
        honeypot: 'i-am-a-bot',
      }),
    });

    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(syncSpy).not.toHaveBeenCalled();
    expect(ConsentRecordModel.create).not.toHaveBeenCalled();
  });

  it('should enforce rate limiting after multiple rapid requests from the same IP', async () => {
    const makeReq = () =>
      new Request('http://localhost:3000/api/v1/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-forwarded-for': '203.177.100.5',
        },
        body: JSON.stringify({
          email: 'rate.limit@example.com',
          source: 'newsletter_funnel',
          consent: true,
        }),
      });

    // 5 requests allowed
    for (let i = 0; i < 5; i++) {
      const res = await POST(makeReq());
      expect(res.status).toBe(200);
    }

    // 6th request should be rate limited (429)
    const blockedRes = await POST(makeReq());
    expect(blockedRes.status).toBe(429);
    const body = await blockedRes.json();
    expect(body.success).toBe(false);
    expect(body.error).toContain('Too many subscription attempts');
  });

  it('should return 200 OK, persist ConsentRecord, and sync to Brevo subscribed_contacts list', async () => {
    const syncSpy = jest.spyOn(require('../../src/services/brevoService').BrevoService, 'syncContact')
      .mockResolvedValueOnce({ success: true, contactId: 333 });

    const req = new Request('http://localhost:3000/api/v1/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-forwarded-for': '120.28.1.1',
      },
      body: JSON.stringify({
        email: 'newsletter@example.com',
        firstName: 'Elena',
        source: 'newsletter_funnel',
        consent: true,
      }),
    });

    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.message).toContain('Thank you');

    // Verify ConsentRecord persisted
    expect(ConsentRecordModel.create).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'newsletter@example.com',
        source: 'newsletter_funnel',
        edition: 'ph',
        noticeVersion: '2026.1',
      })
    );

    // Verify Brevo sync called with subscribed_contacts list
    expect(syncSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'newsletter@example.com',
        firstName: 'Elena',
        metabolicStage: 'GENERAL_AWARENESS',
        listIds: ['subscribed_contacts'],
      })
    );
  });

  it('should sync companion_app_users subscriber to Brevo companion_app_users list', async () => {
    const syncSpy = jest.spyOn(require('../../src/services/brevoService').BrevoService, 'syncContact')
      .mockResolvedValueOnce({ success: true, contactId: 444 });

    const req = new Request('http://localhost:3000/api/v1/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'glycosense.user@example.com',
        firstName: 'Marco',
        source: 'companion_app_users',
        consent: true,
      }),
    });

    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.message).toContain('Free account access');
    expect(body.appUrl).toBeDefined();
    expect(syncSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'glycosense.user@example.com',
        firstName: 'Marco',
        metabolicStage: 'COMPANION_APP_USER',
        listIds: ['companion_app_users'],
      })
    );
  });
});
