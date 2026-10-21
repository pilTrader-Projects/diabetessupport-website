/**
 * Google Analytics 4 (GA4) Event Names and Parameter Constants.
 */
export const GA4_EVENTS = {
  AFFILIATE_CARD_CLICK: 'affiliate_card_click',
  VIDEO_ENGAGEMENT: 'video_engagement',
  EMAIL_SIGNUP: 'email_signup',
  LEAD_MAGNET_DOWNLOAD: 'lead_magnet_download',
  ROADMAP_STEP_CLICK: 'roadmap_step_click',
  CHECKOUT_CLICK: 'checkout_click',
} as const;

export type GA4EventName = (typeof GA4_EVENTS)[keyof typeof GA4_EVENTS];

/**
 * Valid action types for video engagement lifecycle.
 */
export const VIDEO_ENGAGEMENT_ACTIONS = {
  PLAY: 'play',
  PAUSE: 'pause',
  HEARTBEAT: 'heartbeat',
} as const;

/**
 * Click type attribute identifier for affiliate card DOM elements.
 */
export const AFFILIATE_CLICK_TYPE = 'affiliate_card';

/**
 * Default fallback values for missing affiliate parameters.
 */
export const DEFAULT_AFFILIATE_ITEM = 'unknown_item';
export const DEFAULT_LAYOUT_POSITION = 'unknown_position';

/**
 * Default heartbeat tick interval for video watching duration (15 seconds).
 */
export const DEFAULT_HEARTBEAT_INTERVAL_MS = 15000;

/**
 * Trusted YouTube origins for iframe postMessage listener validation.
 */
export const TRUSTED_YOUTUBE_ORIGINS = [
  'https://www.youtube.com',
  'https://www.youtube-nocookie.com',
  'https://youtube.com',
];
