import { GET, POST } from '../../src/app/api/v1/cron/learning-sync/route';
import { LearningService } from '../../src/services/learningService';
import { validateApiKey } from '../../src/lib/auth';
import { isAdminAuthenticated } from '../../src/lib/adminAuth';

jest.mock('../../src/services/learningService');
jest.mock('../../src/lib/auth');
jest.mock('../../src/lib/adminAuth');

describe('Cron Learning Sync API (TDD Unit Tests)', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv, API_SECRET_KEY: 'test-secret-key' };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('should return 401 when unauthorized request is received', async () => {
    (validateApiKey as jest.Mock).mockResolvedValue({ valid: false });
    (isAdminAuthenticated as jest.Mock).mockResolvedValue(false);

    const req = new Request('http://localhost:3000/api/v1/cron/learning-sync', {
      method: 'GET',
    });

    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(401);
    expect(data.success).toBe(false);
    expect(LearningService.runCronSyndication).not.toHaveBeenCalled();
  });

  it('should execute cron syndication when valid API key is in query params', async () => {
    (LearningService.runCronSyndication as jest.Mock).mockResolvedValue({
      processedAuthorities: 3,
      totalAdded: 5,
      totalSkipped: 2,
      details: [],
    });

    const req = new Request('http://localhost:3000/api/v1/cron/learning-sync?key=test-secret-key', {
      method: 'GET',
    });

    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.summary.totalAdded).toBe(5);
    expect(data.summary.totalSkipped).toBe(2);
    expect(LearningService.runCronSyndication).toHaveBeenCalled();
  });

  it('should execute cron syndication on POST when authorized via validateApiKey', async () => {
    (validateApiKey as jest.Mock).mockResolvedValue({ valid: true });
    (LearningService.runCronSyndication as jest.Mock).mockResolvedValue({
      processedAuthorities: 2,
      totalAdded: 1,
      totalSkipped: 0,
      details: [],
    });

    const req = new Request('http://localhost:3000/api/v1/cron/learning-sync', {
      method: 'POST',
      headers: { 'X-API-KEY': 'test-secret-key' },
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(LearningService.runCronSyndication).toHaveBeenCalled();
  });
});
