import LegalPageLayout from '@/components/legal/LegalPageLayout';
import { buildLegalMetadata, getLegalDocument } from '@/lib/legalContent';

const doc = getLegalDocument('medical-disclaimer');

export const metadata = buildLegalMetadata(doc, '/medical-disclaimer');

/**
 * Medical Disclaimer page. Content lives in src/content/legal/medical-disclaimer.md.
 */
export default function MedicalDisclaimerPage() {
  return <LegalPageLayout doc={doc} />;
}
