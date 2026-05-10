/**
 * Shared types for hotel-platform connectors.
 *
 * Each platform (Booking, Agoda, Expedia, Trip.com, ...) implements
 * `HotelConnector` so the aggregator can query them uniformly.
 *
 * This app does not process bookings or payments — connectors only return
 * data used to compare options. The `sourceUrl` field links the user back
 * to the original platform to verify or proceed independently.
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

export type CancellationPolicy = "free" | "partial" | "non_refundable" | "unknown";

export type PriceTrend = "up" | "down" | "stable";

export interface PriceConfidence {
  /** ISO timestamp when this offer's price was last verified. */
  lastCheckedAt: string;
  /** Direction the price has moved over the last few days. */
  trend: PriceTrend;
  /** Magnitude of the trend in percent (positive number). */
  trendPercent?: number;
  /** True when the current price is meaningfully below the typical range. */
  goodDeal?: boolean;
  /** Typical total-stay price for this hotel/window, used for context. */
  averagePrice?: number;
}

/** Synthetic 2-D coordinates for the schematic map view. */
export interface MapPoint {
  /** Approximate latitude, only used for relative placement on the map view. */
  lat: number;
  /** Approximate longitude, only used for relative placement on the map view. */
  lng: number;
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
  /** Distance in km to the nearest metro / subway station. */
  metroDistanceKm?: number;
  /** Name of a nearby landmark used for "distance to landmark" comparison. */
  nearestLandmark?: string;
  /** Distance in km to that landmark. */
  landmarkDistanceKm?: number;
  freeCancellation?: boolean;
  /** Free-text cancellation policy, e.g. "Free until 24h before check-in". */
  cancellationPolicy?: string;
  cancellationKind?: CancellationPolicy;
  breakfastIncluded?: boolean;
  /** Family-friendly heuristic (multi-bed rooms, kid amenities, etc.). */
  familyFriendly?: boolean;
  /** Approximate map coordinates for the schematic split list/map view. */
  coords?: MapPoint;
  /** Price confidence signals (last checked, trend, good-deal flag). */
  priceConfidence?: PriceConfidence;
  /** Outbound link to the source page on the original platform. */
  sourceUrl: string;
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
