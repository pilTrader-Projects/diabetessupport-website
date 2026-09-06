import React from 'react';
import SocialShareBar from '@/components/community/SocialShareBar';
import { POST as likeThread } from '@/app/api/v1/community/threads/[slug]/like/route';
import { ThreadModel } from '@/models/Thread';
import { NextRequest } from 'next/server';

jest.mock('@/lib/dbConnect', () => ({
  dbConnect: jest.fn().mockResolvedValue(true),
}));

jest.mock('@/models/Thread', () => ({
  ThreadModel: {
    findOneAndUpdate: jest.fn(),
  },
}));

describe('Social Sharing & Helpful Like Reactions (Step 7)', () => {
  describe('SocialShareBar Component', () => {
    it('renders with title, url, and snippet', () => {
      const el = (
        <SocialShareBar
          title="Fasting Glucose Tips"
          url="https://diabetescareph.com/community/fasting-glucose-tips"
          snippet="What are your go-to tips for morning glucose spikes?"
          showLikeButton={true}
          likesCount={5}
        />
      );

      expect(el.props.title).toBe('Fasting Glucose Tips');
      expect(el.props.url).toBe('https://diabetescareph.com/community/fasting-glucose-tips');
      expect(el.props.showLikeButton).toBe(true);
      expect(el.props.likesCount).toBe(5);
    });
  });

  describe('POST /api/v1/community/threads/[slug]/like', () => {
    it('returns 400 if slug parameter is missing', async () => {
      const req = new NextRequest('http://localhost:3000/api/v1/community/threads//like', {
        method: 'POST',
      });
      const response = await likeThread(req, { params: Promise.resolve({ slug: '' }) });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });

    it('increments thread likes atomically and returns updated count', async () => {
      (ThreadModel.findOneAndUpdate as jest.Mock).mockReturnValue({
        lean: jest.fn().mockResolvedValue({
          slug: 'fasting-glucose-tips',
          likes: 6,
        }),
      });

      const req = new NextRequest('http://localhost:3000/api/v1/community/threads/fasting-glucose-tips/like', {
        method: 'POST',
      });
      const response = await likeThread(req, {
        params: Promise.resolve({ slug: 'fasting-glucose-tips' }),
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.likes).toBe(6);
    });

    it('returns 404 if thread is not found', async () => {
      (ThreadModel.findOneAndUpdate as jest.Mock).mockReturnValue({
        lean: jest.fn().mockResolvedValue(null),
      });

      const req = new NextRequest('http://localhost:3000/api/v1/community/threads/unknown/like', {
        method: 'POST',
      });
      const response = await likeThread(req, {
        params: Promise.resolve({ slug: 'unknown' }),
      });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
    });
  });
});
