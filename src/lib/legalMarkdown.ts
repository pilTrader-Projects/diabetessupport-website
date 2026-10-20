export type ContainerKind = 'soft' | 'panel' | 'amber';

export type LegalBlock =
  | { type: 'h2' | 'h3' | 'p'; text: string }
  | { type: 'ul'; items: string[] }
  | { type: 'container'; kind: ContainerKind; blocks: LegalBlock[] };

const CONTAINER_KINDS: readonly ContainerKind[] = ['soft', 'panel', 'amber'];

function isContainerKind(value: string): value is ContainerKind {
  return (CONTAINER_KINDS as readonly string[]).includes(value);
}

/**
 * Parses the small markdown subset used by legal documents into blocks (pure, no React).
 * Supported: `##`/`###` headings, paragraphs, `-` lists and `::: soft|panel|amber` ... `:::` containers.
 *
 * @throws On an unknown container kind, a stray closing fence, or an unclosed container, so authoring
 *   mistakes in the markdown fail the build/tests instead of silently rendering as text.
 */
export function parseLegalBlocks(markdown: string): LegalBlock[] {
  const root: LegalBlock[] = [];
  const stack: LegalBlock[][] = [root];

  let paragraph: string[] = [];
  let list: string[] | null = null;

  const current = () => stack[stack.length - 1];
  const flush = () => {
    if (paragraph.length) {
      current().push({ type: 'p', text: paragraph.join(' ') });
      paragraph = [];
    }
    if (list) {
      current().push({ type: 'ul', items: list });
      list = null;
    }
  };

  for (const rawLine of markdown.replace(/\r\n/g, '\n').split('\n')) {
    const trimmed = rawLine.trim();

    const open = trimmed.match(/^:::\s*(\w+)$/);
    if (open) {
      if (!isContainerKind(open[1])) {
        throw new Error(`Unknown container "${open[1]}" (expected: ${CONTAINER_KINDS.join(', ')})`);
      }
      flush();
      const container: LegalBlock = { type: 'container', kind: open[1], blocks: [] };
      current().push(container);
      stack.push(container.blocks);
      continue;
    }
    if (trimmed === ':::') {
      if (stack.length === 1) throw new Error('Unexpected closing ":::" with no open container');
      flush();
      stack.pop();
      continue;
    }

    if (!trimmed) {
      flush();
    } else if (trimmed.startsWith('### ')) {
      flush();
      current().push({ type: 'h3', text: trimmed.slice(4) });
    } else if (trimmed.startsWith('## ')) {
      flush();
      current().push({ type: 'h2', text: trimmed.slice(3) });
    } else if (trimmed.startsWith('- ')) {
      if (paragraph.length) flush();
      list = list ?? [];
      list.push(trimmed.slice(2));
    } else {
      if (list) flush();
      paragraph.push(trimmed);
    }
  }

  if (stack.length > 1) throw new Error('Unclosed container: missing closing ":::"');
  flush();

  return root;
}
