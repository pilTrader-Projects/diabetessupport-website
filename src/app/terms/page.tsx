import LegalPageLayout from '@/components/legal/LegalPageLayout';
import { buildLegalMetadata, getLegalDocument } from '@/lib/legalContent';

const doc = getLegalDocument('terms');

export const metadata = buildLegalMetadata(doc, '/terms');

/**
 * Terms of Service page. Content lives in src/content/legal/terms.md.
 */
export default function TermsPage() {
  return <LegalPageLayout doc={doc} />;
}
