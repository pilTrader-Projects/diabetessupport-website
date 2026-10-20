import React from 'react';
import { parseInlineMarkdown } from '@/lib/markdownUtils';

type ContainerKind = 'soft' | 'panel' | 'amber';

type Block =
  | { type: 'h2' | 'h3' | 'p'; text: string }
  | { type: 'ul'; items: string[] }
  | { type: 'container'; kind: ContainerKind; blocks: Block[] };

const CONTAINER_KINDS: ContainerKind[] = ['soft', 'panel', 'amber'];

const SECTION_BASE = 'space-y-4 text-sm sm:text-base leading-relaxed';
const CONTAINER_CLASS: Record<ContainerKind, string> = {
  soft: `${SECTION_BASE} bg-slate-50 p-6 rounded-2xl border border-slate-200`,
  panel: `${SECTION_BASE} bg-slate-100 p-6 rounded-2xl border border-slate-200`,
  amber: `${SECTION_BASE} bg-amber-50 p-6 rounded-2xl border border-amber-200`,
};

/**
 * Parses the small markdown subset used by legal documents into blocks.
 * Supported: `##`/`###` headings, paragraphs, `-` lists and `::: soft|panel|amber` ... `:::` containers.
 */
export function parseLegalBlocks(markdown: string): Block[] {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n');
  const root: Block[] = [];
  const stack: { blocks: Block[]; kind?: ContainerKind }[] = [{ blocks: root }];

  let paragraph: string[] = [];
  let list: string[] | null = null;

  const current = () => stack[stack.length - 1].blocks;
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

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();
    const trimmed = line.trim();

    const open = trimmed.match(/^:::\s*(\w+)$/);
    if (open && CONTAINER_KINDS.includes(open[1] as ContainerKind)) {
      flush();
      const container: Block = { type: 'container', kind: open[1] as ContainerKind, blocks: [] };
      current().push(container);
      stack.push({ blocks: container.blocks, kind: container.kind });
      continue;
    }
    if (trimmed === ':::' && stack.length > 1) {
      flush();
      stack.pop();
      continue;
    }

    if (!trimmed) {
      flush();
      continue;
    }
    if (trimmed.startsWith('### ')) {
      flush();
      current().push({ type: 'h3', text: trimmed.slice(4) });
      continue;
    }
    if (trimmed.startsWith('## ')) {
      flush();
      current().push({ type: 'h2', text: trimmed.slice(3) });
      continue;
    }
    if (trimmed.startsWith('- ')) {
      if (paragraph.length) flush();
      list = list ?? [];
      list.push(trimmed.slice(2));
      continue;
    }

    if (list) flush();
    paragraph.push(trimmed);
  }
  flush();

  return root;
}

function renderBlocks(blocks: Block[], kind?: ContainerKind): React.ReactNode[] {
  let afterH3 = false;
  let paragraphCount = 0;

  return blocks.map((block, i) => {
    switch (block.type) {
      case 'h2':
        afterH3 = false;
        return (
          <h2
            key={i}
            className={`text-xl ${kind === 'amber' ? 'font-black text-amber-950' : 'font-bold text-slate-900'}`}
          >
            {parseInlineMarkdown(block.text)}
          </h2>
        );
      case 'h3':
        afterH3 = true;
        return (
          <h3 key={i} className="font-bold text-slate-900">
            {parseInlineMarkdown(block.text)}
          </h3>
        );
      case 'ul':
        return (
          <ul key={i} className="list-disc pl-6 space-y-2 text-slate-700 text-sm">
            {block.items.map((item, j) => (
              <li key={j}>{parseInlineMarkdown(item)}</li>
            ))}
          </ul>
        );
      case 'p': {
        const isFirst = paragraphCount++ === 0;
        let className: string | undefined;
        if (kind === 'amber') {
          className = isFirst ? 'text-amber-900' : 'text-amber-900 text-xs leading-relaxed';
        } else if (afterH3) {
          className = 'text-xs text-slate-600 leading-relaxed';
        }
        return (
          <p key={i} className={className}>
            {parseInlineMarkdown(block.text)}
          </p>
        );
      }
      case 'container':
        return (
          <section key={i} className={CONTAINER_CLASS[block.kind]}>
            {renderBlocks(block.blocks, block.kind)}
          </section>
        );
    }
  });
}

/**
 * Renders legal markdown as styled sections. Top-level content is grouped into one
 * <section> per `##` heading; explicit `:::` containers render as highlighted panels.
 */
export default function LegalMarkdown({ markdown }: { markdown: string }) {
  const blocks = parseLegalBlocks(markdown);

  const sections: Block[][] = [];
  let currentGroup: Block[] | null = null;
  for (const block of blocks) {
    if (block.type === 'container') {
      sections.push([block]);
      currentGroup = null;
    } else if (block.type === 'h2' || !currentGroup) {
      currentGroup = [block];
      sections.push(currentGroup);
    } else {
      currentGroup.push(block);
    }
  }

  return (
    <>
      {sections.map((group, i) =>
        group[0].type === 'container' ? (
          <React.Fragment key={i}>{renderBlocks(group)}</React.Fragment>
        ) : (
          <section key={i} className={SECTION_BASE}>
            {renderBlocks(group)}
          </section>
        )
      )}
    </>
  );
}
