/**
 * Integration & Unit Test Suite for Kit (ConvertKit) Lead Capture & Subscription API.
 *
 * @usecase Validates that POST /api/v1/subscribe enforces email format validation and interacts with Kit API.
 * @dependencies POST handler from src/app/api/v1/subscribe/route.ts.
 */
import { POST } from '../../src/app/api/v1/subscribe/route';

describe('Kit Lead Capture Subscription API (/api/v1/subscribe)', () => {
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

  it('should return 200 OK with success response for valid email', async () => {
    const req = new Request('http://localhost:3000/api/v1/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'subscriber@example.com', firstName: 'Jane' }),
    });

    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.message).toContain('Thank you');
  });

  it('should call ConvertKit API when KIT_API_KEY and KIT_FORM_ID are provided', async () => {
    process.env.KIT_API_KEY = 'test_kit_api_key';
    process.env.NEXT_PUBLIC_KIT_FORM_ID = '123456';

    const mockFetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ subscription: { id: 999, state: 'active' } }),
    });
    global.fetch = mockFetch;

    const req = new Request('http://localhost:3000/api/v1/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'convertkit@example.com', firstName: 'Alice' }),
    });

    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.convertkit.com/v3/forms/123456/subscribe',
      expect.objectContaining({
        method: 'POST',
      })
    );

    delete process.env.KIT_API_KEY;
    delete process.env.NEXT_PUBLIC_KIT_FORM_ID;
  });
});
