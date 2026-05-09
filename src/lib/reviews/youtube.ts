import type { ReviewConnector, ReviewQuery, SocialReview } from "./types";

/**
 * YouTube review connector. Uses YouTube Data API v3 search.
 * https://developers.google.com/youtube/v3/docs/search/list
 */
export class YouTubeReviewConnector implements ReviewConnector {
  readonly source = "youtube" as const;
  readonly displayName = "YouTube";
  private readonly apiKey = process.env.YOUTUBE_API_KEY ?? "";

  isConfigured(): boolean {
    return Boolean(this.apiKey);
  }

  async fetch(query: ReviewQuery): Promise<SocialReview[]> {
    if (!this.isConfigured()) return mockReviews(this.source, query);

    const url = new URL("https://www.googleapis.com/youtube/v3/search");
    url.searchParams.set("part", "snippet");
    url.searchParams.set("q", `${query.hotelName} review`);
    url.searchParams.set("type", "video");
    url.searchParams.set("maxResults", String(query.limit ?? 5));
    url.searchParams.set("key", this.apiKey);

    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) throw new Error(`YouTube API ${res.status}`);
    const json = (await res.json()) as YouTubeResponse;
    return (json.items ?? []).map((it) => ({
      id: `youtube:${it.id.videoId}`,
      source: "youtube",
      title: it.snippet.title,
      author: it.snippet.channelTitle,
      snippet: it.snippet.description,
      url: `https://www.youtube.com/watch?v=${it.id.videoId}`,
      postedAt: it.snippet.publishedAt,
    }));
  }
}

interface YouTubeResponse {
  items?: {
    id: { videoId: string };
    snippet: {
      title: string;
      channelTitle: string;
      description: string;
      publishedAt: string;
    };
  }[];
}

export function mockReviews(source: SocialReview["source"], q: ReviewQuery): SocialReview[] {
  const base = [
    `Honest review of ${q.hotelName}: rooms were clean and staff was friendly.`,
    `${q.hotelName} - was it worth the hype? Breakfast underwhelming.`,
    `Stayed 3 nights at ${q.hotelName}, location is unbeatable.`,
  ];
  return base.map((snippet, i) => ({
    id: `${source}:mock-${i}`,
    source,
    title: snippet.split(":")[0],
    author: `traveller_${i}`,
    snippet,
    url: `https://example.com/${source}/mock/${i}`,
    engagement: 100 - i * 20,
    postedAt: new Date(Date.now() - i * 86_400_000 * 10).toISOString(),
    sentiment: i === 1 ? "neutral" : "positive",
    isMock: true,
  }));
}
