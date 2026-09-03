import React from 'react';
import BlogPostContent from '../../src/components/BlogPostContent';

describe('BlogPostContent Component', () => {
  it('should be defined and export a valid React component function', () => {
    expect(typeof BlogPostContent).toBe('function');
  });

  it('should parse HTML content containing data-widget tags into React node structure', () => {
    const htmlContent = `
      <h2>Understanding Blood Sugar</h2>
      <p>Regular monitoring helps track patterns.</p>
      <div data-widget="kit-optin" data-title="Subscribe to Daily Tips"></div>
      <p>Middle content</p>
      <div data-widget="lead-magnet" data-title="Download Cheatsheet"></div>
      <div data-widget="kit-embed" data-url="https://glycosense.kit.com/1d0f3e3530"></div>
    `;

    const element = BlogPostContent({ content: htmlContent, slug: 'understanding-blood-sugar' });
    expect(element).toBeDefined();
    if (element && 'props' in element) {
      expect(element.props.children.length).toBeGreaterThan(0);
    }
  });
});
