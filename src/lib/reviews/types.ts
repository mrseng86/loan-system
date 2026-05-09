/**
 * Shared types for social-platform review connectors.
 */

export type ReviewSourceId =
  | "youtube"
  | "reddit"
  | "twitter"
  | "xiaohongshu"
  | "tripadvisor";

export interface ReviewQuery {
  hotelName: string;
  city?: string;
  /** ISO language hint for ranking results. */
  language?: string;
  limit?: number;
}

export interface SocialReview {
  id: string;
  source: ReviewSourceId;
  author?: string;
  /** Title or headline if the platform provides one. */
  title?: string;
  /** Plain-text snippet of the review body. */
  snippet: string;
  url: string;
  /** Engagement signal (likes, upvotes, views, etc.) for ranking. */
  engagement?: number;
  /** ISO timestamp of when the review was posted. */
  postedAt?: string;
  /** Connector's best-effort sentiment label. */
  sentiment?: "positive" | "neutral" | "negative";
  isMock?: boolean;
}

export interface ReviewConnector {
  readonly source: ReviewSourceId;
  readonly displayName: string;
  isConfigured(): boolean;
  fetch(query: ReviewQuery): Promise<SocialReview[]>;
}
