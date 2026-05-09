/**
 * Shared types for hotel-platform connectors.
 *
 * Each platform (Booking, Agoda, Expedia, Trip.com, ...) implements
 * `HotelConnector` so the aggregator can query them uniformly.
 */

export type Currency = "USD" | "EUR" | "GBP" | "CNY" | "MYR" | "SGD" | "JPY" | "HKD" | "TWD" | string;

export interface SearchQuery {
  destination: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  rooms?: number;
  currency?: Currency;
}

export interface Money {
  amount: number;
  currency: Currency;
}

export interface HotelOffer {
  /** Stable per-platform hotel id, namespaced by platform name. */
  id: string;
  platform: PlatformId;
  hotelName: string;
  thumbnail?: string;
  starRating?: number;
  /** 0-10 user score from the platform itself. */
  reviewScore?: number;
  reviewCount?: number;
  address?: string;
  /** Total price for the requested stay (not nightly). */
  totalPrice: Money;
  perNightPrice?: Money;
  /** Distance in km from the searched destination centroid, if known. */
  distanceKm?: number;
  freeCancellation?: boolean;
  breakfastIncluded?: boolean;
  /** Deep link the user clicks to book. */
  deepLink: string;
  /** True if data came from a mock fallback rather than a live API. */
  isMock?: boolean;
}

export type PlatformId = "booking" | "agoda" | "expedia" | "trip";

export interface HotelConnector {
  readonly platform: PlatformId;
  readonly displayName: string;
  /** Returns true when API credentials are present. */
  isConfigured(): boolean;
  search(query: SearchQuery): Promise<HotelOffer[]>;
}
