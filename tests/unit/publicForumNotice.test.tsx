import React from 'react';
import ReactDOMServer from 'react-dom/server';
import PublicForumNotice from '@/components/community/PublicForumNotice';

describe('PublicForumNotice Component', () => {
  it('renders the public forum safe harbor warning message and icon', () => {
    const html = ReactDOMServer.renderToString(<PublicForumNotice />);

    expect(html).toContain('data-testid="public-forum-notice"');
    expect(html).toContain('Public Forum Notice:');
    expect(html).toContain('Discussions are publicly visible to all members');
    expect(html).toContain('do not include confidential medical records');
  });

  it('accepts and applies custom className prop', () => {
    const html = ReactDOMServer.renderToString(<PublicForumNotice className="custom-forum-alert-class" />);

    expect(html).toContain('custom-forum-alert-class');
  });
});
