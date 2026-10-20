import { Metadata } from 'next';
import LegalPageLayout from '@/components/legal/LegalPageLayout';
import { getLegalDocument } from '@/lib/legalContent';

const doc = getLegalDocument('terms');

export const metadata: Metadata = {
  title: doc.meta.metaTitle,
  description: doc.meta.description,
  alternates: {
    canonical: '/terms',
  },
};

/**
 * Terms of Service page. Content lives in src/content/legal/terms.md.
 */
export default function TermsPage() {
  return <LegalPageLayout doc={doc} />;
}
