'use client';

/**
 * Backward compatibility re-export for NewsletterOptInForm.
 *
 * @usecase Maintains legacy component import compatibility while routing all lead capture to native Brevo workflow.
 */
import NewsletterOptInForm, { NewsletterOptInFormProps } from './NewsletterOptInForm';

export type KitOptInFormProps = NewsletterOptInFormProps;
export default NewsletterOptInForm;
