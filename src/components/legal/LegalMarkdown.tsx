import React from 'react';
import { parseInlineMarkdown } from '@/lib/markdownUtils';
import { parseLegalBlocks, type ContainerKind, type LegalBlock } from '@/lib/legalMarkdown';

const SECTION_BASE = 'space-y-4 text-sm sm:text-base leading-relaxed';
const CONTAINER_CLASS: Record<ContainerKind, string> = {
  soft: `${SECTION_BASE} bg-slate-50 p-6 rounded-2xl border border-slate-200`,
  panel: `${SECTION_BASE} bg-slate-100 p-6 rounded-2xl border border-slate-200`,
  amber: `${SECTION_BASE} bg-amber-50 p-6 rounded-2xl border border-amber-200`,
};

function renderBlocks(blocks: LegalBlock[], kind?: ContainerKind): React.ReactNode[] {
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

  const sections: LegalBlock[][] = [];
  let currentGroup: LegalBlock[] | null = null;
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
