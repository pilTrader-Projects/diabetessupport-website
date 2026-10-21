import { z } from 'zod';
import crypto from 'crypto';

/**
 * Standard Zod Schema for Email Capture & Newsletter Subscription.
 *
 * @usecase Validates incoming payloads to ensure affirmative consent, RFC-compliant email,
 * and optional campaign parameters while rejecting spam bot submissions.
 */
export const subscribeSchema = z.object({
  email: z
    .string('Email address is required.')
    .trim()
    .toLowerCase()
    .email('Please enter a valid email address.'),
  firstName: z
    .string()
    .trim()
    .max(100, 'First name is too long.')
    .optional()
    .transform((val) => (val && val.length > 0 ? val : undefined)),
  source: z
    .string('Campaign source is required.')
    .trim()
    .min(1, 'Campaign source is required.'),
  edition: z.string().trim().default('ph'),
  noticeVersion: z.string().trim().default('2026.1'),
  consent: z.literal(true, 'You must agree to the privacy policy to continue.'),
  honeypot: z.string().optional(),
  symptomsChecked: z.array(z.string()).optional(),
});

export type SubscribeInput = z.infer<typeof subscribeSchema>;

/**
 * Creates an irreversible anonymized SHA-256 hash of an IP address.
 *
 * @usecase Satisfies RA 10173 and GDPR data minimization requirements by producing an
 * auditable tamper-evident verification token without storing raw IP addresses.
 */
export function hashIpAddress(ip: string): string {
  const salt = process.env.IP_HASH_SALT || 'bts_consent_salt_2026';
  return crypto.createHash('sha256').update(`${ip.trim()}:${salt}`).digest('hex');
}

/**
 * In-Memory Sliding Window Rate Limiter for Subscription Endpoints.
 */
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 5;

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const ipRateLimitStore = new Map<string, RateLimitEntry>();

export function checkRateLimit(ip: string): { allowed: boolean; remaining: number; resetInMs: number } {
  const now = Date.now();
  const cleanIp = ip.trim();
  const entry = ipRateLimitStore.get(cleanIp);

  if (!entry || now > entry.resetAt) {
    ipRateLimitStore.set(cleanIp, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true, remaining: MAX_REQUESTS_PER_WINDOW - 1, resetInMs: RATE_LIMIT_WINDOW_MS };
  }

  if (entry.count >= MAX_REQUESTS_PER_WINDOW) {
    return { allowed: false, remaining: 0, resetInMs: Math.max(0, entry.resetAt - now) };
  }

  entry.count += 1;
  return { allowed: true, remaining: MAX_REQUESTS_PER_WINDOW - entry.count, resetInMs: Math.max(0, entry.resetAt - now) };
}

/**
 * Helper to reset rate limiter storage (primarily for automated testing).
 */
export function clearRateLimitStore(): void {
  ipRateLimitStore.clear();
}
