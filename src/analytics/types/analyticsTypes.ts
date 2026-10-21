export type VideoEngagementAction = 'play' | 'pause' | 'heartbeat';

/**
 * Payload structure for GA4 affiliate_card_click events.
 */
export interface AffiliateCardClickPayload {
  page_location: string;
  affiliate_item: string;
  card_layout_position: string;
  destination_url: string;
}

/**
 * Payload structure for GA4 video_engagement events.
 */
export interface VideoEngagementPayload {
  video_title: string;
  video_current_time: number;
  engagement_action: VideoEngagementAction;
  completion_percentage: number;
}

/**
 * Raw context extracted from an affiliate card DOM element.
 */
export interface AffiliateCardContext {
  bookTitle: string;
  cardPosition: string;
  destinationUrl: string;
}

/**
 * Configuration options for initializing a video tracker instance.
 */
export interface VideoTrackingConfig {
  videoTitle: string;
  duration?: number;
  heartbeatIntervalMs?: number;
  win?: Window;
}

/**
 * Internal state maintained by a video tracker instance.
 */
export interface VideoTrackerState {
  videoTitle: string;
  duration: number;
  currentTime: number;
  isPlaying: boolean;
}

/**
 * Public interface exposed by a video tracker instance.
 */
export interface VideoTrackerInstance {
  trackPlay: (currentTime?: number, duration?: number) => boolean;
  trackPause: (currentTime?: number, duration?: number) => boolean;
  trackHeartbeat: (currentTime?: number, duration?: number) => boolean;
  updateCurrentTime: (time: number) => void;
  updateDuration: (dur: number) => void;
  destroy: () => void;
  getState: () => VideoTrackerState;
}

/**
 * Global window interface extended with GA4 gtag function.
 */
export type GtagFunction = (
  command: 'event' | 'config' | 'set' | 'js' | 'consent',
  targetOrAction: string | Date | Record<string, any>,
  params?: Record<string, any>
) => void;

export interface GtagWindow extends Window {
  gtag?: GtagFunction;
  dataLayer?: any[];
}

/**
 * Payload structure for GA4 email_signup conversion events.
 * MANDATORY PRIVACY (RA 10173): Strictly non-PII. Email addresses, names, and phone numbers are forbidden.
 */
export interface EmailSignupPayload {
  source: string;
  edition?: string;
}

/**
 * Payload structure for GA4 lead_magnet_download conversion events.
 * MANDATORY PRIVACY: Only file/resource name and source campaign. No user tokens or PII.
 */
export interface LeadMagnetDownloadPayload {
  file_name: string;
  source: string;
  edition?: string;
}

/**
 * Payload structure for GA4 roadmap_step_click conversion events.
 */
export interface RoadmapStepClickPayload {
  step_number: number;
  step_slug: string;
  edition?: string;
}

/**
 * Payload structure for GA4 checkout_click conversion events.
 */
export interface CheckoutClickPayload {
  product_id: string;
  product_name: string;
  currency: string;
  price: number;
  destination_url?: string;
}
