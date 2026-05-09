import type { ReviewConnector, ReviewQuery, SocialReview } from "./types";
import { mockReviews } from "./youtube";

/**
 * Reddit search connector.
 * https://www.reddit.com/dev/api/#GET_search
 *
 * Uses script-app OAuth (client credentials) when REDDIT_CLIENT_ID +
 * REDDIT_CLIENT_SECRET are set. Token caching is left for a follow-up;
 * for now each request fetches a fresh token, which is fine for low traffic.
 */
export class RedditReviewConnector implements ReviewConnector {
  readonly source = "reddit" as const;
  readonly displayName = "Reddit";
  private readonly clientId = process.env.REDDIT_CLIENT_ID ?? "";
  private readonly clientSecret = process.env.REDDIT_CLIENT_SECRET ?? "";
  private readonly userAgent = process.env.REDDIT_USER_AGENT ?? "hotel-comparison-app/0.1";

  isConfigured(): boolean {
    return Boolean(this.clientId && this.clientSecret);
  }

  async fetch(query: ReviewQuery): Promise<SocialReview[]> {
    if (!this.isConfigured()) return mockReviews(this.source, query);

    const auth = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString("base64");
    const tokenRes = await fetch("https://www.reddit.com/api/v1/access_token", {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": this.userAgent,
      },
      body: "grant_type=client_credentials",
    });
    if (!tokenRes.ok) throw new Error(`Reddit auth ${tokenRes.status}`);
    const { access_token: token } = (await tokenRes.json()) as { access_token: string };

    const search = new URL("https://oauth.reddit.com/search");
    search.searchParams.set("q", `${query.hotelName} review`);
    search.searchParams.set("limit", String(query.limit ?? 5));
    search.searchParams.set("sort", "relevance");
    const res = await fetch(search, {
      headers: { Authorization: `Bearer ${token}`, "User-Agent": this.userAgent },
    });
    if (!res.ok) throw new Error(`Reddit search ${res.status}`);
    const json = (await res.json()) as RedditResponse;
    return (json.data?.children ?? []).map(({ data }) => ({
      id: `reddit:${data.id}`,
      source: "reddit",
      title: data.title,
      author: data.author,
      snippet: data.selftext?.slice(0, 280) ?? data.title,
      url: `https://reddit.com${data.permalink}`,
      engagement: data.score,
      postedAt: new Date(data.created_utc * 1000).toISOString(),
    }));
  }
}

interface RedditResponse {
  data?: {
    children: {
      data: {
        id: string;
        title: string;
        author: string;
        selftext?: string;
        permalink: string;
        score: number;
        created_utc: number;
      };
    }[];
  };
}
