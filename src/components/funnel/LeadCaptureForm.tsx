'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import EmailCapture from '@/components/common/EmailCapture';

interface LeadCaptureFormProps {
  symptomsChecked?: string[];
  source: string;
}

/**
 * Lead Capture Form Component for the Insulin Reset Protocol.
 *
 * @usecase Captures firstName and email in compliance with RA 10173 delegating to the unified
 * <EmailCapture /> component with signature GlycoSense funnel styling and automatic /reset-success bridge redirect.
 */
export default function LeadCaptureForm({
  symptomsChecked = [],
  source,
}: LeadCaptureFormProps): React.JSX.Element {
  const router = useRouter();

  return (
    <div id="lead-form" className="scroll-mt-12">
      <EmailCapture
        source={source}
        layout="funnel"
        symptomsChecked={symptomsChecked}
        title="Where Should We Send Your Guide?"
        subtitle="Enter your details below to receive the complete 8-page protocol immediately in your inbox."
        buttonText="Send My Free Guide"
        onSuccess={() => {
          router.push('/reset-success');
        }}
      />
    </div>
  );
}
