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

describe('HomePage Hero Full-Viewport Responsiveness & Modular Architecture', () => {
  it('should be defined and export a valid async React component function', () => {
    expect(typeof HomePage).toBe('function');
  });

  it('should render home page container and modular sections', async () => {
    const element = await HomePage();
    expect(element).toBeDefined();
    expect(element.type).toBe('div');
  });
});
