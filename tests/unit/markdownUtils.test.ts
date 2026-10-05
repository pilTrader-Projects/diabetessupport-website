import {
  sanitizeUrl,
  stripMarkdown,
  parseInlineMarkdown,
} from '@/lib/markdownUtils';
import React from 'react';
import ReactDOMServer from 'react-dom/server';

describe('Markdown Utilities (Clean Architecture & Security)', () => {
  describe('sanitizeUrl', () => {
    it('allows valid http, https, and internal relative URLs (Happy Path)', () => {
      expect(sanitizeUrl('https://beforethenumbers.org')).toBe('https://beforethenumbers.org');
      expect(sanitizeUrl('http://example.com/guide')).toBe('http://example.com/guide');
      expect(sanitizeUrl('/community/starting-journey')).toBe('/community/starting-journey');
      expect(sanitizeUrl('mailto:support@beforethenumbers.org')).toBe('mailto:support@beforethenumbers.org');
    });

    it('neutralizes malicious javascript: and data: URLs to prevent XSS (Sad / Security Path)', () => {
      expect(sanitizeUrl('javascript:alert(1)')).toBe('#');
      expect(sanitizeUrl('JAVASCRIPT:alert(document.cookie)')).toBe('#');
      expect(sanitizeUrl('data:text/html,<script>alert(1)</script>')).toBe('#');
      expect(sanitizeUrl('vbscript:msgbox("xss")')).toBe('#');
    });

    it('handles empty, null, or malformed inputs gracefully (Edge Cases)', () => {
      expect(sanitizeUrl('')).toBe('#');
      expect(sanitizeUrl('   ')).toBe('#');
      expect(sanitizeUrl(null as any)).toBe('#');
      expect(sanitizeUrl(undefined as any)).toBe('#');
    });
  });

  describe('stripMarkdown', () => {
    it('removes headings, bold, italic, links, and list markers (Happy Path)', () => {
      const input = '### 💡 Your Body Can Heal\n\n- Eat **low-GI** foods and *walk* [daily](/tips)';
      const output = stripMarkdown(input);

      expect(output).not.toContain('###');
      expect(output).not.toContain('**');
      expect(output).not.toContain('*');
      expect(output).not.toContain('[');
      expect(output).toContain('💡 Your Body Can Heal Eat low-GI foods and walk daily');
    });

    it('handles plain text unchanged (Edge Case)', () => {
      expect(stripMarkdown('Simple message without markdown')).toBe('Simple message without markdown');
    });

    it('handles empty or whitespace strings (Edge Case)', () => {
      expect(stripMarkdown('')).toBe('');
      expect(stripMarkdown('   ')).toBe('');
      expect(stripMarkdown(null as any)).toBe('');
      expect(stripMarkdown(undefined as any)).toBe('');
    });
  });

  describe('parseInlineMarkdown', () => {
    it('parses bold, italic, inline code, and links into React nodes (Happy Path)', () => {
      const text = 'Testing **bold text**, *italic emphasis*, `code block`, and [Community](/community)';
      const nodes = parseInlineMarkdown(text);
      const html = ReactDOMServer.renderToString(React.createElement('div', null, ...nodes));

      expect(html).toContain('<strong class="font-bold text-slate-900">bold text</strong>');
      expect(html).toContain('<em class="italic">italic emphasis</em>');
      expect(html).toContain('<code class="bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded text-xs font-mono border border-slate-200">code block</code>');
      expect(html).toContain('<a href="/community"');
    });

    it('safeguards against XSS in markdown links (Sad / Security Path)', () => {
      const malicious = 'Click [here](javascript:stealTokens()) for free meal plan';
      const nodes = parseInlineMarkdown(malicious);
      const html = ReactDOMServer.renderToString(React.createElement('div', null, ...nodes));

      expect(html).not.toContain('javascript:');
      expect(html).toContain('<a href="#"');
    });

    it('handles plain strings and empty inputs gracefully (Edge Cases)', () => {
      const emptyNodes = parseInlineMarkdown('');
      expect(emptyNodes).toEqual(['']);

      const plainText = 'Plain regular sentence.';
      const plainNodes = parseInlineMarkdown(plainText);
      expect(plainNodes).toEqual(['Plain regular sentence.']);
    });
  });
});
