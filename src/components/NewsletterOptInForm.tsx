'use client';

import React from 'react';
import EmailCapture from '@/components/common/EmailCapture';
import { CAMPAIGN_CODES } from '@/config/leadConfig';

export interface NewsletterOptInFormProps {
  title?: string;
  subtitle?: string;
  buttonText?: string;
  layout?: 'card' | 'inline' | 'hero';
  source?: string;
}

/**
 * Interactive Lead Capture & Newsletter Opt-In Form Component.
 *
 * @usecase Standardized opt-in form wrapping <EmailCapture /> with affirmative consent,
 * honeypot spam protection, and dynamic Brevo list synchronization.
 */
export default function NewsletterOptInForm({
  title = 'Get Our Free Diabetes Care & Insulin Sensitivity Guide',
  subtitle = 'Join the growing movement of Filipino family providers receiving evidence-based lifestyle tips, low-GI meal plans, and blood sugar tracking advice directly in their inbox.',
  buttonText = 'Claim Free Guide',
  layout = 'card',
  source = CAMPAIGN_CODES.NEWSLETTER,
}: NewsletterOptInFormProps): React.JSX.Element {
  return (
    <EmailCapture
      title={title}
      subtitle={subtitle}
      buttonText={buttonText}
      layout={layout}
      source={source}
    />
  );
}
