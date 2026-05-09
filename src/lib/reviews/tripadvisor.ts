import type { ReviewConnector, ReviewQuery, SocialReview } from "./types";
import { mockReviews } from "./youtube";

/**
 * TripAdvisor Content API.
 * https://tripadvisor-content-api.readme.io/
 *
 * Flow: location_search -> location_details with reviews. Free tier requires
 * an approved API key. This stub falls back to mock data when key is missing.
 */
export class TripAdvisorReviewConnector implements ReviewConnector {
  readonly source = "tripadvisor" as const;
  readonly displayName = "TripAdvisor";
  private readonly apiKey = process.env.TRIPADVISOR_API_KEY ?? "";

  isConfigured(): boolean {
    return Boolean(this.apiKey);
  }

  async fetch(query: ReviewQuery): Promise<SocialReview[]> {
    if (!this.isConfigured()) return mockReviews(this.source, query);

    const searchUrl = new URL("https://api.content.tripadvisor.com/api/v1/location/search");
    searchUrl.searchParams.set("key", this.apiKey);
    searchUrl.searchParams.set("searchQuery", query.hotelName);
    if (query.city) searchUrl.searchParams.set("address", query.city);
    searchUrl.searchParams.set("category", "hotels");

    const sRes = await fetch(searchUrl, { next: { revalidate: 3600 } });
    if (!sRes.ok) throw new Error(`TripAdvisor search ${sRes.status}`);
    const sJson = (await sRes.json()) as { data?: { location_id: string; name: string }[] };
    const first = sJson.data?.[0];
    if (!first) return [];

    const reviewsUrl = new URL(
      `https://api.content.tripadvisor.com/api/v1/location/${first.location_id}/reviews`,
    );
    reviewsUrl.searchParams.set("key", this.apiKey);
    reviewsUrl.searchParams.set("limit", String(query.limit ?? 5));

    const rRes = await fetch(reviewsUrl, { next: { revalidate: 3600 } });
    if (!rRes.ok) throw new Error(`TripAdvisor reviews ${rRes.status}`);
    const rJson = (await rRes.json()) as TripAdvisorReviewResponse;

    return (rJson.data ?? []).map((rv) => ({
      id: `tripadvisor:${rv.id}`,
      source: "tripadvisor",
      author: rv.user?.username,
      title: rv.title,
      snippet: rv.text,
      url: rv.url,
      engagement: rv.helpful_votes,
      postedAt: rv.published_date,
    }));
  }
}

interface TripAdvisorReviewResponse {
  data?: {
    id: string;
    title: string;
    text: string;
    url: string;
    helpful_votes?: number;
    published_date?: string;
    user?: { username?: string };
  }[];
}
