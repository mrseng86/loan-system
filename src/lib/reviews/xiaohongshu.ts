import type { ReviewConnector, ReviewQuery, SocialReview } from "./types";
import { mockReviews } from "./youtube";

/**
 * Xiaohongshu (小红书) and Weibo connector.
 *
 * Neither platform offers a public review API. Production implementations
 * usually require a third-party data provider (e.g., Datayes, Zhuge IO) or
 * a headless-browser scraper that respects each platform's TOS.
 *
 * This stub returns mock data and documents the expected shape.
 */
export class XiaohongshuReviewConnector implements ReviewConnector {
  readonly source = "xiaohongshu" as const;
  readonly displayName = "小红书 / 微博";

  isConfigured(): boolean {
    return false;
  }

  async fetch(query: ReviewQuery): Promise<SocialReview[]> {
    return mockReviews(this.source, query).map((r) => ({
      ...r,
      snippet: `【${query.hotelName}】${r.snippet}`,
    }));
  }
}
