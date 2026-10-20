import { parseLegalBlocks } from '@/lib/legalMarkdown';

describe('parseLegalBlocks (legal markdown subset)', () => {
  it('parses headings, paragraphs (joined lines) and lists', () => {
    const blocks = parseLegalBlocks('## Title\n\nline one\nline two\n\n- a\n- b\n\n### Sub\n\ntext');
    expect(blocks).toEqual([
      { type: 'h2', text: 'Title' },
      { type: 'p', text: 'line one line two' },
      { type: 'ul', items: ['a', 'b'] },
      { type: 'h3', text: 'Sub' },
      { type: 'p', text: 'text' },
    ]);
  });

  it('parses containers, including their nested blocks', () => {
    const blocks = parseLegalBlocks('::: amber\n## Warn\n\nBody\n:::\n\nAfter');
    expect(blocks).toEqual([
      { type: 'container', kind: 'amber', blocks: [{ type: 'h2', text: 'Warn' }, { type: 'p', text: 'Body' }] },
      { type: 'p', text: 'After' },
    ]);
  });

  it('handles CRLF input', () => {
    expect(parseLegalBlocks('## A\r\n\r\ntext\r\n')).toEqual([
      { type: 'h2', text: 'A' },
      { type: 'p', text: 'text' },
    ]);
  });

  it('fails loudly on an unknown container kind instead of rendering it as text', () => {
    expect(() => parseLegalBlocks('::: sof\ntext\n:::')).toThrow(/unknown container "sof"/i);
  });

  it('fails loudly on an unclosed container', () => {
    expect(() => parseLegalBlocks('::: soft\ntext')).toThrow(/unclosed container/i);
  });

  it('returns empty array when given empty or non-string input', () => {
    expect(parseLegalBlocks('')).toEqual([]);
    expect(parseLegalBlocks(null as unknown as string)).toEqual([]);
    expect(parseLegalBlocks(undefined as unknown as string)).toEqual([]);
  });

  it('supports asterisk bullets alongside dashes', () => {
    const blocks = parseLegalBlocks('* item 1\n* item 2\n- item 3');
    expect(blocks).toEqual([
      { type: 'ul', items: ['item 1', 'item 2', 'item 3'] },
    ]);
  });
});
