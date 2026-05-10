import type { HotelConnector, HotelOffer, SearchQuery } from "./types";
import { daysBetween, hashSeed, syntheticCoords, syntheticPriceConfidence } from "./mockHelpers";

/**
 * Booking.com connector (read-only price/availability lookup for comparison).
 *
 * This connector never books, reserves, or charges anything. It only fetches
 * publicly available offer data so the user can compare options and then
 * follow `sourceUrl` to the original platform.
 *
 * Uses Booking's Partner API when BOOKING_PARTNER_ID and BOOKING_API_KEY are
 * set; otherwise returns deterministic mock data so the comparison UI stays
 * usable in development.
 *
 * Real API docs: https://developers.booking.com/connectivity/docs
 */
export class BookingConnector implements HotelConnector {
  readonly platform = "booking" as const;
  readonly displayName = "Booking.com";

  private readonly partnerId = process.env.BOOKING_PARTNER_ID ?? "";
  private readonly apiKey = process.env.BOOKING_API_KEY ?? "";

  isConfigured(): boolean {
    return Boolean(this.partnerId && this.apiKey);
  }

  async search(query: SearchQuery): Promise<HotelOffer[]> {
    if (!this.isConfigured()) {
      return this.mockSearch(query);
    }
    return this.liveSearch(query);
  }

  private async liveSearch(query: SearchQuery): Promise<HotelOffer[]> {
    const auth = Buffer.from(`${this.partnerId}:${this.apiKey}`).toString("base64");
    const url = new URL("https://distribution-xml.booking.com/json/bookings.getHotelAvailabilityV2");
    url.searchParams.set("city", query.destination);
    url.searchParams.set("checkin", query.checkIn);
    url.searchParams.set("checkout", query.checkOut);
    url.searchParams.set("guests", String(query.guests));
    url.searchParams.set("rooms", String(query.rooms ?? 1));
    if (query.currency) url.searchParams.set("currency", query.currency);

    const res = await fetch(url, {
      headers: { Authorization: `Basic ${auth}`, Accept: "application/json" },
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      throw new Error(`Booking API error ${res.status}: ${await res.text()}`);
    }

    const json = (await res.json()) as BookingResponse;
    return (json.hotels ?? []).map((h) => this.mapHotel(h, query));
  }

  private mapHotel(h: BookingHotel, query: SearchQuery): HotelOffer {
    const nights = daysBetween(query.checkIn, query.checkOut);
    const total = h.price?.total ?? 0;
    const currency = h.price?.currency ?? query.currency ?? "USD";
    return {
      id: `booking:${h.hotel_id}`,
      platform: "booking",
      hotelName: h.name,
      thumbnail: h.main_photo_url,
      starRating: h.class,
      reviewScore: h.review_score,
      reviewCount: h.review_nr,
      address: h.address,
      totalPrice: { amount: total, currency },
      perNightPrice: { amount: total / nights, currency },
      distanceKm: h.distance_km,
      freeCancellation: h.is_free_cancellable,
      breakfastIncluded: h.is_breakfast_included,
      sourceUrl: h.url,
    };
  }

  private mockSearch(query: SearchQuery): HotelOffer[] {
    const nights = daysBetween(query.checkIn, query.checkOut);
    const seeds = ["Grand", "Royal", "Harbor", "Garden", "Sky"];
    return seeds.map((name, idx) => {
      const id = `booking:mock-${idx}`;
      const nightly = 110 + idx * 25 + (hashSeed(query.destination, idx) % 30);
      const total = nightly * nights;
      const free = idx % 2 === 0;
      const distanceKm = 0.4 + idx * 0.6;
      return {
        id,
        platform: "booking",
        hotelName: `${name} Hotel ${query.destination}`,
        thumbnail: undefined,
        starRating: 3 + (idx % 3),
        reviewScore: 7.5 + (idx % 5) * 0.3,
        reviewCount: 200 + idx * 137,
        address: `${query.destination} city center`,
        totalPrice: { amount: total, currency: query.currency ?? "USD" },
        perNightPrice: { amount: nightly, currency: query.currency ?? "USD" },
        distanceKm,
        metroDistanceKm: 0.2 + idx * 0.3,
        nearestLandmark: `${query.destination} Central Station`,
        landmarkDistanceKm: 0.5 + idx * 0.4,
        freeCancellation: free,
        cancellationPolicy: free ? "Free until 24h before check-in" : "Non-refundable",
        cancellationKind: free ? "free" : "non_refundable",
        breakfastIncluded: idx % 3 === 0,
        familyFriendly: idx === 1 || idx === 4,
        coords: syntheticCoords(id, distanceKm),
        priceConfidence: syntheticPriceConfidence(id, total, query.checkIn),
        sourceUrl: `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(query.destination)}`,
        isMock: true,
      };
    });
  }
}

interface BookingResponse {
  hotels?: BookingHotel[];
}

interface BookingHotel {
  hotel_id: number;
  name: string;
  main_photo_url?: string;
  class?: number;
  review_score?: number;
  review_nr?: number;
  address?: string;
  price?: { total: number; currency: string };
  distance_km?: number;
  is_free_cancellable?: boolean;
  is_breakfast_included?: boolean;
  url: string;
}
