/**
 * Integration Test Suite for WordPress Migration API Endpoint.
 *
 * @usecase Validates that POST /api/v1/migration requires a valid Bearer secret key and blocks unauthorized requests.
 * @dependencies POST handler from src/app/api/v1/migration/route.ts.
 */
import { POST } from '../../src/app/api/v1/migration/route';

describe('WordPress Migration API Authorization Security', () => {
  it('should reject unauthorized requests missing authorization header with 401', async () => {
    const mockRequest = new Request('http://localhost:3000/api/v1/migration', {
      method: 'POST',
      headers: {},
    });

    const response = await POST(mockRequest);
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.success).toBe(false);
    expect(body.error).toContain('Unauthorized');
  });

  it('should reject requests with invalid authorization bearer token with 401', async () => {
    const mockRequest = new Request('http://localhost:3000/api/v1/migration', {
      method: 'POST',
      headers: {
        authorization: 'Bearer invalid_secret_token_123',
      },
    });

    const response = await POST(mockRequest);
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.success).toBe(false);
  });
});
