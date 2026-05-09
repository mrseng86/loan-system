import type { HotelOffer } from "./connectors/types";

export interface ScoredOffer extends HotelOffer {
  score: number;
  scoreBreakdown: {
    price: number;
    convenience: number;
    quality: number;
  };
}

/**
 * Combined value score (0-100). Higher is better.
 *
 *   convenience = closer to centre + free cancellation + breakfast
 *   quality     = star rating + review score
 *   price       = inverse of total cost, normalised against the cheapest offer
 *
 * Weights are simple and intentionally tweakable from the UI later.
 */
export function scoreOffers(offers: HotelOffer[]): ScoredOffer[] {
  if (offers.length === 0) return [];
  const cheapest = Math.min(...offers.map((o) => o.totalPrice.amount));
  return offers
    .map((o) => {
      const price = cheapest > 0 ? Math.min(100, (cheapest / o.totalPrice.amount) * 100) : 0;
      const distancePts = o.distanceKm == null ? 50 : Math.max(0, 100 - o.distanceKm * 15);
      const convenience =
        distancePts * 0.7 +
        (o.freeCancellation ? 20 : 0) +
        (o.breakfastIncluded ? 10 : 0);
      const stars = (o.starRating ?? 3) * 20;
      const reviews = (o.reviewScore ?? 7.5) * 10;
      const quality = stars * 0.4 + reviews * 0.6;
      const score = Math.round(price * 0.4 + convenience * 0.3 + quality * 0.3);
      return {
        ...o,
        score,
        scoreBreakdown: {
          price: Math.round(price),
          convenience: Math.round(convenience),
          quality: Math.round(quality),
        },
      };
    })
    .sort((a, b) => b.score - a.score);
}
