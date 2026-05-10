import type { HotelConnector, HotelOffer, SearchQuery } from "./types";

/**
 * Agoda connector stub (read-only price/availability lookup for comparison).
 *
 * Real API: Agoda Partner API (XML/JSON) https://partners.agoda.com/
 * Until credentials are available, returns mock offers shaped like real ones.
 */
export class AgodaConnector implements HotelConnector {
  readonly platform = "agoda" as const;
  readonly displayName = "Agoda";

  private readonly siteId = process.env.AGODA_SITE_ID ?? "";
  private readonly apiKey = process.env.AGODA_API_KEY ?? "";

  isConfigured(): boolean {
    return Boolean(this.siteId && this.apiKey);
  }

  async search(query: SearchQuery): Promise<HotelOffer[]> {
    if (this.isConfigured()) {
      // TODO: implement against Agoda Partner API once credentials are issued.
      return [];
    }
    const nights = Math.max(1, days(query.checkIn, query.checkOut));
    return ["Sunrise", "Pearl", "Orchid"].map((seed, i) => {
      const nightly = 95 + i * 28;
      const total = nightly * nights;
      const free = i !== 1;
      return {
        id: `agoda:mock-${i}`,
        platform: "agoda",
        hotelName: `${seed} ${query.destination} Hotel`,
        starRating: 3 + (i % 3),
        reviewScore: 7.8 + i * 0.2,
        reviewCount: 320 + i * 91,
        address: `${query.destination} downtown`,
        totalPrice: { amount: total, currency: query.currency ?? "USD" },
        perNightPrice: { amount: nightly, currency: query.currency ?? "USD" },
        distanceKm: 0.6 + i * 0.5,
        metroDistanceKm: 0.4 + i * 0.2,
        nearestLandmark: `${query.destination} Old Town`,
        landmarkDistanceKm: 0.8 + i * 0.3,
        freeCancellation: free,
        cancellationPolicy: free ? "Free until 48h before check-in" : "Partial refund only",
        cancellationKind: free ? "free" : "partial",
        breakfastIncluded: i === 0,
        familyFriendly: i === 2,
        sourceUrl: `https://www.agoda.com/search?city=${encodeURIComponent(query.destination)}`,
        isMock: true,
      };
    });
  }
}

function days(a: string, b: string): number {
  const ms = Date.parse(b) - Date.parse(a);
  return Number.isFinite(ms) ? Math.round(ms / 86_400_000) : 1;
}
