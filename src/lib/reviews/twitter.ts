import type { ReviewConnector, ReviewQuery, SocialReview } from "./types";
import { mockReviews } from "./youtube";

/**
 * X (Twitter) recent search connector.
 * https://docs.x.com/x-api/posts/search/recent-search
 */
export class TwitterReviewConnector implements ReviewConnector {
  readonly source = "twitter" as const;
  readonly displayName = "X / Twitter";
  private readonly bearer = process.env.TWITTER_BEARER_TOKEN ?? "";

  isConfigured(): boolean {
    return Boolean(this.bearer);
  }

  async fetch(query: ReviewQuery): Promise<SocialReview[]> {
    if (!this.isConfigured()) return mockReviews(this.source, query);

    const url = new URL("https://api.x.com/2/tweets/search/recent");
    url.searchParams.set("query", `"${query.hotelName}" -is:retweet lang:${query.language ?? "en"}`);
    url.searchParams.set("max_results", String(Math.min(query.limit ?? 10, 100)));
    url.searchParams.set("tweet.fields", "public_metrics,created_at,author_id");

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${this.bearer}` },
      next: { revalidate: 300 },
    });
    if (!res.ok) throw new Error(`Twitter API ${res.status}`);
    const json = (await res.json()) as TwitterResponse;
    return (json.data ?? []).map((t) => ({
      id: `twitter:${t.id}`,
      source: "twitter",
      author: t.author_id,
      snippet: t.text,
      url: `https://x.com/i/web/status/${t.id}`,
      engagement: (t.public_metrics?.like_count ?? 0) + (t.public_metrics?.retweet_count ?? 0),
      postedAt: t.created_at,
    }));
  }
}

interface TwitterResponse {
  data?: {
    id: string;
    text: string;
    author_id?: string;
    created_at?: string;
    public_metrics?: { like_count: number; retweet_count: number };
  }[];
}
