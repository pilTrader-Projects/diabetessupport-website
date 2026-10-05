import React from 'react';
import MarkdownContent, { stripMarkdown } from '@/components/community/MarkdownContent';
import ReactDOMServer from 'react-dom/server';

describe('Community MarkdownContent Component', () => {
  it('should render headings without literal hashes', () => {
    const markdown = '### Understanding Insulin Resistance\n\nThis is paragraph text.';
    const html = ReactDOMServer.renderToString(<MarkdownContent content={markdown} />);

    expect(html).not.toContain('###');
    expect(html).toContain('<h3');
    expect(html).toContain('Understanding Insulin Resistance</h3>');
    expect(html).toContain('<p');
    expect(html).toContain('This is paragraph text.</p>');
  });

  it('should render h2 headings properly', () => {
    const markdown = '## Key Biological Findings\n\nGlucose and insulin dynamic.';
    const html = ReactDOMServer.renderToString(<MarkdownContent content={markdown} />);

    expect(html).not.toContain('##');
    expect(html).toContain('<h2');
    expect(html).toContain('Key Biological Findings</h2>');
  });

  it('should render bold and italic inline markup', () => {
    const markdown = 'This is **very important** and *crucial* to note.';
    const html = ReactDOMServer.renderToString(<MarkdownContent content={markdown} />);

    expect(html).toContain('<strong class="font-bold text-slate-900">very important</strong>');
    expect(html).toContain('<em class="italic">crucial</em>');
  });

  it('should render horizontal rules and unordered lists', () => {
    const markdown = 'Intro\n\n---\n\n- Eat low-GI foods\n- Walk after meals\n- Sleep 8 hours';
    const html = ReactDOMServer.renderToString(<MarkdownContent content={markdown} />);

    expect(html).toContain('<hr');
    expect(html).toContain('<ul');
    expect(html).toContain('<li>Eat low-GI foods</li>');
    expect(html).toContain('<li>Walk after meals</li>');
    expect(html).toContain('<li>Sleep 8 hours</li>');
  });

  it('should render links with safe attributes', () => {
    const markdown = 'Check our [Guidelines](/community) for tips.';
    const html = ReactDOMServer.renderToString(<MarkdownContent content={markdown} />);

    expect(html).toContain('<a href="/community"');
    expect(html).toContain('Guidelines</a>');
  });

  describe('stripMarkdown helper', () => {
    it('should strip markdown tokens for clean preview snippets in thread cards', () => {
      const markdown = '### 💡 Your Body Can Heal\n\nIn the last article, we learned how **insulin resistance** begins...';
      const stripped = stripMarkdown(markdown);

      expect(stripped).not.toContain('###');
      expect(stripped).not.toContain('**');
      expect(stripped).toContain('💡 Your Body Can Heal In the last article, we learned how insulin resistance begins...');
    });
  });
});
