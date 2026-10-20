import LegalPageLayout from '@/components/legal/LegalPageLayout';
import { buildLegalMetadata, getLegalDocument } from '@/lib/legalContent';

const doc = getLegalDocument('privacy');

export const metadata = buildLegalMetadata(doc, '/privacy');

/**
 * Privacy Policy page. Content lives in src/content/legal/privacy.md.
 */
export default function PrivacyPage() {
  return <LegalPageLayout doc={doc} />;
}
