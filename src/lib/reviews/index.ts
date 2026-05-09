import { RedditReviewConnector } from "./reddit";
import { TripAdvisorReviewConnector } from "./tripadvisor";
import { TwitterReviewConnector } from "./twitter";
import { XiaohongshuReviewConnector } from "./xiaohongshu";
import { YouTubeReviewConnector } from "./youtube";
import type { ReviewConnector, ReviewQuery, ReviewSourceId, SocialReview } from "./types";

export const reviewConnectors: ReviewConnector[] = [
  new YouTubeReviewConnector(),
  new RedditReviewConnector(),
  new TwitterReviewConnector(),
  new XiaohongshuReviewConnector(),
  new TripAdvisorReviewConnector(),
];

export interface ReviewAggregateResult {
  reviews: SocialReview[];
  errors: { source: ReviewSourceId; message: string }[];
  configured: ReviewSourceId[];
  mocked: ReviewSourceId[];
}

export async function fetchAllReviews(query: ReviewQuery): Promise<ReviewAggregateResult> {
  const settled = await Promise.allSettled(
    reviewConnectors.map(async (c) => ({ connector: c, reviews: await c.fetch(query) })),
  );

  const reviews: SocialReview[] = [];
  const errors: ReviewAggregateResult["errors"] = [];
  const configured: ReviewSourceId[] = [];
  const mocked: ReviewSourceId[] = [];

  settled.forEach((r, i) => {
    const c = reviewConnectors[i];
    if (r.status === "fulfilled") {
      reviews.push(...r.value.reviews);
      if (c.isConfigured()) configured.push(c.source);
      if (r.value.reviews.some((rv) => rv.isMock)) mocked.push(c.source);
    } else {
      errors.push({ source: c.source, message: String(r.reason?.message ?? r.reason) });
    }
  });

  return { reviews, errors, configured, mocked };
}

export type { ReviewConnector, ReviewQuery, ReviewSourceId, SocialReview } from "./types";
