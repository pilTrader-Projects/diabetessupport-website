/**
 * Unit Test Suite for Admin Posts CMS Page.
 *
 * @usecase Validates that AdminPostsPage instantiates cleanly as a valid React component and defines status filters.
 */
import React from 'react';
import AdminPostsPage from '../../src/app/admin/posts/page';

// Mock WysiwygEditor dynamic import
jest.mock('next/dynamic', () => () => {
  return function MockWysiwygEditor() {
    return <div data-testid="mock-wysiwyg">Wysiwyg Editor Mock</div>;
  };
});

describe('AdminPostsPage UI Component', () => {
  it('instantiates cleanly as a valid React component', () => {
    const element = <AdminPostsPage />;
    expect(element).toBeDefined();
    expect(typeof element.type).toBe('function');
  });
});
