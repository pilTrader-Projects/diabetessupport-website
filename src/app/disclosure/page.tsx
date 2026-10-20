import LegalPageLayout from '@/components/legal/LegalPageLayout';
import { buildLegalMetadata, getLegalDocument } from '@/lib/legalContent';

const doc = getLegalDocument('disclosure');

export const metadata = buildLegalMetadata(doc, '/disclosure');

/**
 * Transparency & Editorial Disclosure page. Content lives in src/content/legal/disclosure.md.
 */
export default function DisclosurePage() {
  return <LegalPageLayout doc={doc} />;
}
