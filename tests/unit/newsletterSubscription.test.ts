/**
 * Unit & Integration Test Suite for Newsletter & Lead Capture Subscription API (/api/v1/subscribe).
 *
 * @usecase Validates that POST /api/v1/subscribe enforces email format validation and syncs contacts to Brevo.
 * @dependencies POST handler from src/app/api/v1/subscribe/route.ts, BrevoService.
 */
import { POST } from '../../src/app/api/v1/subscribe/route';

jest.mock('../../src/lib/dbConnect', () => ({
  dbConnect: jest.fn().mockResolvedValue(true),
}));

describe('Newsletter & Lead Subscription API (/api/v1/subscribe)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 400 Bad Request if email is missing', async () => {
    const req = new Request('http://localhost:3000/api/v1/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ firstName: 'John' }),
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
      body: JSON.stringify({ email: 'not-an-email-address' }),
    });

    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.success).toBe(false);
    expect(body.error).toContain('valid email');
  });

  it('should return 400 Bad Request if campaign source is missing', async () => {
    const req = new Request('http://localhost:3000/api/v1/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'subscriber@example.com', firstName: 'Jane' }),
    });

    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.success).toBe(false);
    expect(body.error).toContain('Campaign source is required');
  });

  it('should return 200 OK with success response for valid newsletter subscription', async () => {
    const req = new Request('http://localhost:3000/api/v1/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'subscriber@example.com', firstName: 'Jane', source: 'newsletter_funnel' }),
    });

    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.message).toContain('Thank you');
  });

  it('should sync newsletter subscriber to Brevo subscribed_contacts list', async () => {
    const syncSpy = jest.spyOn(require('../../src/services/brevoService').BrevoService, 'syncContact')
      .mockResolvedValueOnce({ success: true, contactId: 333 });

    const req = new Request('http://localhost:3000/api/v1/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'newsletter@example.com', firstName: 'Elena', source: 'newsletter' }),
    });

    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
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
      body: JSON.stringify({ email: 'glycosense.user@example.com', firstName: 'Marco', source: 'companion_app_users' }),
    });

    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.message).toContain('Free account access reserved');
    expect(syncSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'glycosense.user@example.com',
        firstName: 'Marco',
        metabolicStage: 'COMPANION_APP_USER',
        listIds: ['companion_app_users'],
      })
    );
  });

  it('should accept tag parameter and route tag: "newsletter" to subscribed_contacts', async () => {
    const syncSpy = jest.spyOn(require('../../src/services/brevoService').BrevoService, 'syncContact')
      .mockResolvedValueOnce({ success: true, contactId: 555 });

    const req = new Request('http://localhost:3000/api/v1/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'tag.user@example.com', firstName: 'TagUser', tag: 'newsletter' }),
    });

    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(syncSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'tag.user@example.com',
        firstName: 'TagUser',
        metabolicStage: 'GENERAL_AWARENESS',
        listIds: ['subscribed_contacts'],
      })
    );
  });
});
