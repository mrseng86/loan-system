import type { MapPoint, PriceConfidence } from "./types";

export function daysBetween(checkIn: string, checkOut: string): number {
  const a = Date.parse(checkIn);
  const b = Date.parse(checkOut);
  if (Number.isNaN(a) || Number.isNaN(b)) return 1;
  return Math.max(1, Math.round((b - a) / 86_400_000));
}

export function hashSeed(s: string, salt: number): number {
  let h = salt + 1;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) >>> 0;
  }
  return h;
}

/**
 * Generate a deterministic synthetic lat/lng around (0, 0) for a hotel.
 * The map view treats (0, 0) as the destination centroid and only uses the
 * relative offset, so absolute values don't have to be geographically real.
 */
export function syntheticCoords(seed: string, distanceKm: number): MapPoint {
  const h = hashSeed(seed, 7);
  const angle = (h % 360) * (Math.PI / 180);
  // 1 degree latitude ≈ 111 km.
  const offset = distanceKm / 111;
  return {
    lat: Math.cos(angle) * offset,
    lng: Math.sin(angle) * offset,
  };
}

/**
 * Build deterministic price-confidence info for a mock offer. Real connectors
 * should derive this from their own price history endpoints when available.
 */
export function syntheticPriceConfidence(
  seed: string,
  total: number,
  checkIn: string,
): PriceConfidence {
  const h = hashSeed(seed, 11);
  const trendBucket = h % 10;
  const trend = trendBucket < 3 ? "down" : trendBucket < 7 ? "stable" : "up";
  const trendPercent = trend === "stable" ? 0 : (h % 12) + 2;
  const averagePrice = Math.round(total * (1 + ((h % 30) - 10) / 100));
  const goodDeal = total < averagePrice * 0.95;
  // Pin the lastChecked relative to checkIn for determinism, falling back to now.
  const base = Date.parse(checkIn);
  const checkedAt = Number.isFinite(base)
    ? new Date(base - ((h % 6) + 1) * 3_600_000).toISOString()
    : new Date(Date.now() - ((h % 6) + 1) * 3_600_000).toISOString();
  return {
    lastCheckedAt: checkedAt,
    trend,
    trendPercent,
    averagePrice,
    goodDeal,
  };
}
