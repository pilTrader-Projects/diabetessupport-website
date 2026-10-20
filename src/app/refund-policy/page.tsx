import LegalPageLayout from '@/components/legal/LegalPageLayout';
import { buildLegalMetadata, getLegalDocument } from '@/lib/legalContent';

const doc = getLegalDocument('refund-policy');

export const metadata = buildLegalMetadata(doc, '/refund-policy');

/**
 * Refund Policy page. Content lives in src/content/legal/refund-policy.md.
 */
export default function RefundPolicyPage() {
  return <LegalPageLayout doc={doc} />;
}
