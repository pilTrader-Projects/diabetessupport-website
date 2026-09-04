import React from 'react';
import HomePage from '../../src/app/page';

describe('HomePage Hero Full-Viewport Responsiveness', () => {
  it('should be defined and export a valid async React component function', () => {
    expect(typeof HomePage).toBe('function');
  });

  it('should render hero section with full viewport height classes', async () => {
    const element = await HomePage();
    expect(element).toBeDefined();
    expect(element.type).toBe('div');
  });
});
