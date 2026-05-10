import type { HotelConnector, HotelOffer, SearchQuery } from "./types";
import { daysBetween, syntheticCoords, syntheticPriceConfidence } from "./mockHelpers";

/**
 * Trip.com (Ctrip) connector stub (read-only lookup for comparison).
 *
 * Real API: Trip.com Open Platform https://open.trip.com/
 * Uses signed JSON-RPC over HTTPS with appKey + appSecret.
 */
export class TripConnector implements HotelConnector {
  readonly platform = "trip" as const;
  readonly displayName = "Trip.com";

  private readonly appKey = process.env.TRIP_APP_KEY ?? "";
  private readonly appSecret = process.env.TRIP_APP_SECRET ?? "";

  isConfigured(): boolean {
    return Boolean(this.appKey && this.appSecret);
  }

  async search(query: SearchQuery): Promise<HotelOffer[]> {
    if (this.isConfigured()) {
      // TODO: call Trip Open Platform /hotel/search with signed payload.
      return [];
    }
    const nights = daysBetween(query.checkIn, query.checkOut);
    return ["如家", "锦江", "汉庭"].map((seed, i) => {
      const id = `trip:mock-${i}`;
      const nightly = 78 + i * 22;
      const total = nightly * nights;
      const free = i % 2 === 1;
      const distanceKm = 0.3 + i * 0.7;
      return {
        id,
        platform: "trip",
        hotelName: `${seed} ${query.destination}`,
        starRating: 3 + (i % 2),
        reviewScore: 8.0 + i * 0.25,
        reviewCount: 1200 + i * 410,
        address: `${query.destination} 市中心`,
        totalPrice: { amount: total, currency: query.currency ?? "CNY" },
        perNightPrice: { amount: nightly, currency: query.currency ?? "CNY" },
        distanceKm,
        metroDistanceKm: 0.15 + i * 0.25,
        nearestLandmark: `${query.destination} 火车站`,
        landmarkDistanceKm: 0.4 + i * 0.5,
        freeCancellation: free,
        cancellationPolicy: free ? "免费取消（入住前24小时）" : "不可退款",
        cancellationKind: free ? "free" : "non_refundable",
        breakfastIncluded: i === 1,
        familyFriendly: i === 0,
        coords: syntheticCoords(id, distanceKm),
        priceConfidence: syntheticPriceConfidence(id, total, query.checkIn),
        sourceUrl: `https://hotels.trip.com/hotels/list?city=${encodeURIComponent(query.destination)}`,
        isMock: true,
      };
    });
  }
}
