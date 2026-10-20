import LegalPageLayout from '@/components/legal/LegalPageLayout';
import { buildLegalMetadata, getLegalDocument } from '@/lib/legalContent';

const doc = getLegalDocument('copyright');

export const metadata = buildLegalMetadata(doc, '/copyright');

/**
 * Copyright & Takedown Policy page. Content lives in src/content/legal/copyright.md.
 */
export default function CopyrightPage() {
  return <LegalPageLayout doc={doc} />;
}
