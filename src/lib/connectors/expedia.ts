import type { HotelConnector, HotelOffer, SearchQuery } from "./types";

/**
 * Expedia Rapid (EPS) connector stub.
 *
 * Real API: https://developers.expediagroup.com/docs/rapid
 * EPS uses HMAC-SHA512 signed requests with API key + shared secret.
 */
export class ExpediaConnector implements HotelConnector {
  readonly platform = "expedia" as const;
  readonly displayName = "Expedia";

  private readonly apiKey = process.env.EXPEDIA_API_KEY ?? "";
  private readonly sharedSecret = process.env.EXPEDIA_SHARED_SECRET ?? "";

  isConfigured(): boolean {
    return Boolean(this.apiKey && this.sharedSecret);
  }

  async search(query: SearchQuery): Promise<HotelOffer[]> {
    if (this.isConfigured()) {
      // TODO: implement EPS /shopping/v3/properties/availability with HMAC auth.
      return [];
    }
    const nights = Math.max(1, days(query.checkIn, query.checkOut));
    return ["Hilton", "Marriott", "Hyatt"].map((brand, i) => {
      const nightly = 130 + i * 35;
      const total = nightly * nights;
      return {
        id: `expedia:mock-${i}`,
        platform: "expedia",
        hotelName: `${brand} ${query.destination}`,
        starRating: 4 + (i % 2),
        reviewScore: 8.2 + i * 0.15,
        reviewCount: 540 + i * 213,
        address: `${query.destination} airport area`,
        totalPrice: { amount: total, currency: query.currency ?? "USD" },
        perNightPrice: { amount: nightly, currency: query.currency ?? "USD" },
        distanceKm: 1.2 + i * 0.4,
        freeCancellation: i === 1,
        breakfastIncluded: i !== 2,
        deepLink: `https://www.expedia.com/Hotel-Search?destination=${encodeURIComponent(query.destination)}`,
        isMock: true,
      };
    });
  }
}

function days(a: string, b: string): number {
  const ms = Date.parse(b) - Date.parse(a);
  return Number.isFinite(ms) ? Math.round(ms / 86_400_000) : 1;
}
