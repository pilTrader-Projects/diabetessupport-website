/**
 * Unit Test Suite for Home Page Learning Materials Hub Showcase Section.
 *
 * @usecase Validates that the root landing page (/) prominently promotes the /learn hub,
 *          featuring multi-format quick filters, doctor authority lectures, and the My Library value prop.
 */
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import HomePage from '../../src/app/page';

jest.mock('../../src/lib/dbConnect', () => ({
  dbConnect: jest.fn().mockResolvedValue(true),
}));

jest.mock('../../src/models/Post', () => ({
  PostModel: {
    find: jest.fn().mockReturnValue({
      sort: jest.fn().mockReturnValue({
        limit: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue([
            {
              _id: 'post-1',
              title: 'Understanding Insulin Resistance Early',
              slug: 'understanding-insulin-resistance-early',
              excerpt: 'Learn the silent warning signs of hyperinsulinemia.',
              status: 'published',
            },
          ]),
        }),
      }),
    }),
  },
}));

jest.mock('../../src/models/LearningResource', () => ({
  LearningResourceModel: {
    find: jest.fn().mockReturnValue({
      sort: jest.fn().mockReturnValue({
        limit: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue([
            {
              _id: 'lr-1',
              title: 'The Root Cause of Insulin Resistance',
              slug: 'the-root-cause-of-insulin-resistance',
              type: 'video',
              authorityName: 'Dr. Jason Fung',
              authorityTitle: 'Nephrologist & Author',
              duration: '18 min',
              status: 'published',
            },
          ]),
        }),
      }),
    }),
  },
}));

describe('HomePage Learning Materials Hub Showcase (TDD Unit Tests)', () => {
  it('renders the Learning Hub hero callout with link to /learn', async () => {
    const element = await HomePage();
    const html = ReactDOMServer.renderToString(element);

    expect(html).toContain('/learn');
    expect(html).toContain('Learning Materials');
  });

  it('renders quick format filter chips for videos, studies, podcasts, books, and saved library', async () => {
    const element = await HomePage();
    const html = ReactDOMServer.renderToString(element);

    expect(html).toContain('/learn?format=video');
    expect(html).toContain('/learn?format=study');
    expect(html).toContain('/learn?format=podcast');
    expect(html).toContain('/learn?format=book');
    expect(html).toContain('/learn?format=saved');
  });

  it('renders the My Library personal bookmarking value proposition', async () => {
    const element = await HomePage();
    const html = ReactDOMServer.renderToString(element);

    expect(html).toContain('My Library');
    expect(html).toContain('Bookmark');
  });
});
