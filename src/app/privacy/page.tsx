import { Metadata } from 'next';
import LegalPageLayout from '@/components/legal/LegalPageLayout';
import { getLegalDocument } from '@/lib/legalContent';

const doc = getLegalDocument('privacy');

export const metadata: Metadata = {
  title: doc.meta.metaTitle,
  description: doc.meta.description,
  alternates: {
    canonical: '/privacy',
  },
};

/**
 * Privacy Policy page. Content lives in src/content/legal/privacy.md.
 */
export default function PrivacyPage() {
  return <LegalPageLayout doc={doc} />;
}
