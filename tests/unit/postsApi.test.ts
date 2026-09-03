import { POST } from '../../src/app/api/v1/posts/route';
import { PostModel } from '../../src/models/Post';
import { ApiKeyModel } from '../../src/models/ApiKey';
import { dbConnect } from '../../src/lib/dbConnect';

jest.mock('../../src/lib/dbConnect', () => ({
  dbConnect: jest.fn().mockResolvedValue(true),
}));

jest.mock('../../src/models/Post', () => ({
  PostModel: {
    findOne: jest.fn(),
    create: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
  },
}));

jest.mock('../../src/models/ApiKey', () => ({
  ApiKeyModel: {
    findOne: jest.fn(),
  },
}));

jest.mock('../../src/models/Category', () => ({
  CategoryModel: {
    updateOne: jest.fn().mockResolvedValue({ acknowledged: true }),
    find: jest.fn().mockReturnValue({
      lean: jest.fn().mockResolvedValue([]),
    }),
  },
}));

describe('POST /api/v1/posts Automated Publishing API', () => {
  const SECRET_KEY = 'sk_dev_diabetessupport_secret_key_change_in_production';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 401 Unauthorized if auth header is missing', async () => {
    const req = new Request('http://localhost:3000/api/v1/posts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: 'Test Article',
        content: 'Article content',
      }),
    });

    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.success).toBe(false);
    expect(body.error).toContain('Unauthorized');
  });

  it('should return 401 Unauthorized if API key is invalid', async () => {
    (ApiKeyModel.findOne as jest.Mock).mockResolvedValue(null);

    const req = new Request('http://localhost:3000/api/v1/posts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': 'invalid_key_123',
      },
      body: JSON.stringify({
        title: 'Test Article',
        content: 'Article content',
      }),
    });

    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.success).toBe(false);
  });

  it('should return 400 Bad Request if title or content is missing', async () => {
    const req = new Request('http://localhost:3000/api/v1/posts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': SECRET_KEY,
      },
      body: JSON.stringify({
        title: 'Only Title, No Content',
      }),
    });

    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.success).toBe(false);
    expect(body.error).toContain('required');
  });

  it('should successfully create a post with valid Bearer token', async () => {
    (PostModel.findOne as jest.Mock).mockResolvedValue(null);
    (PostModel.create as jest.Mock).mockImplementation((data) =>
      Promise.resolve({
        _id: 'mock_post_id_123',
        ...data,
      })
    );

    const req = new Request('http://localhost:3000/api/v1/posts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${SECRET_KEY}`,
      },
      body: JSON.stringify({
        title: 'Understanding Insulin Resistance Early',
        content: '<p>Insulin resistance occurs when cells in your muscles...</p>',
        category: 'Education',
        tags: ['insulin', 'prediabetes'],
      }),
    });

    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(201);
    expect(body.success).toBe(true);
    expect(body.data.slug).toBe('understanding-insulin-resistance-early');
    expect(body.data.category).toBe('Education');
    expect(PostModel.create).toHaveBeenCalledTimes(1);
  });

  it('should authenticate via DB ApiKeyModel when X-API-KEY matches stored key', async () => {
    (ApiKeyModel.findOne as jest.Mock).mockResolvedValue({
      key: 'db_valid_api_key_456',
      name: 'AI Generator Bot',
      active: true,
    });
    (PostModel.findOne as jest.Mock).mockResolvedValue(null);
    (PostModel.create as jest.Mock).mockImplementation((data) =>
      Promise.resolve({
        _id: 'mock_post_id_456',
        ...data,
      })
    );

    const req = new Request('http://localhost:3000/api/v1/posts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': 'db_valid_api_key_456',
      },
      body: JSON.stringify({
        title: '5 Warning Signs of High Blood Sugar',
        content: '<p>Frequent urination and excessive thirst are key warning signs...</p>',
      }),
    });

    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(201);
    expect(body.success).toBe(true);
    expect(ApiKeyModel.findOne).toHaveBeenCalledWith({ key: 'db_valid_api_key_456', active: true });
  });
});

describe('GET /api/v1/posts API Query Endpoint', () => {
  const { GET } = require('../../src/app/api/v1/posts/route');

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return published posts with pagination metadata', async () => {
    const mockPosts = [
      { title: 'Article 1', slug: 'article-1', status: 'published' },
      { title: 'Article 2', slug: 'article-2', status: 'published' },
    ];

    const mockQuery = {
      sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue(mockPosts),
    };

    (PostModel.find as jest.Mock) = jest.fn().mockReturnValue(mockQuery);
    (PostModel.countDocuments as jest.Mock) = jest.fn().mockResolvedValue(2);

    const req = new Request('http://localhost:3000/api/v1/posts?page=1&limit=10');
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.length).toBe(2);
    expect(body.pagination.total).toBe(2);
  });
});

describe('GET & PUT /api/v1/posts/[id] Single Post Route Handlers', () => {
  const { GET: GET_POST, PUT: PUT_POST } = require('../../src/app/api/v1/posts/[id]/route');

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch post by ID successfully via GET', async () => {
    (PostModel.findById as jest.Mock).mockReturnValue({
      lean: jest.fn().mockResolvedValue({ _id: 'post_123', title: 'Test Article', content: '<p>Content</p>' }),
    });

    const req = new Request('http://localhost:3000/api/v1/posts/post_123');
    const res = await GET_POST(req, { params: Promise.resolve({ id: 'post_123' }) });
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.title).toBe('Test Article');
  });

  it('should update post content successfully via PUT when authenticated', async () => {
    const validSecret = process.env.API_SECRET_KEY || 'dev_secret_key_123';
    (PostModel.findByIdAndUpdate as jest.Mock).mockResolvedValue({
      _id: 'post_123',
      title: 'Updated Title',
      content: '<h2>Updated HTML Content</h2>',
    });

    const req = new Request('http://localhost:3000/api/v1/posts/post_123', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${validSecret}`,
      },
      body: JSON.stringify({
        title: 'Updated Title',
        content: '<h2>Updated HTML Content</h2>',
      }),
    });

    const res = await PUT_POST(req, { params: Promise.resolve({ id: 'post_123' }) });
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.title).toBe('Updated Title');
  });

  it('should resolve Category ObjectId hex string to human-readable Category Name', async () => {
    const { CategoryModel } = require('../../src/models/Category');
    const { resolveCategoryName } = require('../../src/lib/categoryUtils');

    const mockMap = new Map();
    mockMap.set('6a982af85ccfcd99b26c3bb0', 'Educational Guides');

    expect(resolveCategoryName('6a982af85ccfcd99b26c3bb0', mockMap)).toBe('Educational Guides');
    expect(resolveCategoryName('6a982af85ccfcd99b26c3bb9', mockMap)).toBe('General');
    expect(resolveCategoryName('Insulin Sensitivity', mockMap)).toBe('Insulin Sensitivity');
  });
});
