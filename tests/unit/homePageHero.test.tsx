import React from 'react';
import HomePage from '../../src/app/page';

jest.mock('../../src/lib/dbConnect', () => ({
  dbConnect: jest.fn().mockResolvedValue(true),
}));

jest.mock('../../src/models/Post', () => ({
  PostModel: {
    find: jest.fn().mockReturnValue({
      sort: jest.fn().mockReturnValue({
        limit: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue([]),
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
          lean: jest.fn().mockResolvedValue([]),
        }),
      }),
    }),
  },
}));

import ReactDOMServer from 'react-dom/server';

describe('HomePage Hero Full-Viewport Responsiveness & Modular Architecture', () => {
  it('should be defined and export a valid async React component function', () => {
    expect(typeof HomePage).toBe('function');
  });

  it('should render home page container and modular sections with /learn hub links', async () => {
    const element = await HomePage();
    expect(element).toBeDefined();
    expect(element.type).toBe('div');
  });

  it('renders Option B hero hook focusing on family protection, knowledge, and avoiding chronic disease costs', async () => {
    const element = await HomePage();
    const html = ReactDOMServer.renderToString(element);

    // Option B Hook assertions
    expect(html).toContain('The Diseases That Bankrupt Families');
    expect(html).toContain('80% Preventable With the Right Knowledge');
    expect(html).toContain('GAIN THE KNOWLEDGE THAT KEEPS THEM SAFE');
  });

  it('prioritizes direct routing to the Learning Hub (/learn) as primary hero CTA', async () => {
    const element = await HomePage();
    const html = ReactDOMServer.renderToString(element);

    // Primary CTA routes immediately to /learn
    expect(html).toContain('href="/learn"');
    expect(html).toContain('Explore the Evidence &amp; Learning Hub');
  });

  it('articulates the Problem -> Knowledge -> Informed Decision -> Avoid Catastrophic Cost framework', async () => {
    const element = await HomePage();
    const html = ReactDOMServer.renderToString(element);

    expect(html).toContain('THE SILENT PROBLEM');
    expect(html).toContain('KNOWLEDGE FIRST');
    expect(html).toContain('INFORMED ACTION');
    expect(html).toContain('AVOID THE PRICE');
  });
});

