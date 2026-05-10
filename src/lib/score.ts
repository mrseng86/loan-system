import type { HotelOffer } from "./connectors/types";
import { DEFAULT_INTENT, INTENT_MODES, type IntentId } from "./intent";

export interface ScoredOffer extends HotelOffer {
  score: number;
  scoreBreakdown: {
    price: number;
    convenience: number;
    quality: number;
    bonus: number;
  };
}

/**
 * Combined value score (0-100). Higher is better. Intent-aware: each travel
 * mode (family/couple/budget/luxury) tweaks the weights so the same hotel
 * list is reranked when the user switches mode.
 *
 *   convenience = closer to centre + closer to metro + free cancellation + breakfast
 *   quality     = star rating + review score
 *   price       = inverse of total cost, normalised against the cheapest offer
 *   bonus       = intent-specific add-ons (family-friendly, flexibility, ...)
 */
export function scoreOffers(offers: HotelOffer[], intent: IntentId = DEFAULT_INTENT): ScoredOffer[] {
  if (offers.length === 0) return [];
  const w = INTENT_MODES[intent].weights;
  const cheapest = Math.min(...offers.map((o) => o.totalPrice.amount));
  return offers
    .map((o) => {
      const price = cheapest > 0 ? Math.min(100, (cheapest / o.totalPrice.amount) * 100) : 0;
      const distancePts = o.distanceKm == null ? 50 : Math.max(0, 100 - o.distanceKm * 15);
      const metroPts = o.metroDistanceKm == null ? 50 : Math.max(0, 100 - o.metroDistanceKm * 30);
      const convenience =
        distancePts * 0.45 +
        metroPts * 0.25 +
        (o.freeCancellation ? 20 : 0) +
        (o.breakfastIncluded ? 10 : 0);
      const stars = (o.starRating ?? 3) * 20;
      const reviews = (o.reviewScore ?? 7.5) * 10;
      const quality = stars * 0.4 + reviews * 0.6;

      let bonus = 0;
      if (o.familyFriendly) bonus += w.familyBonus;
      if (o.freeCancellation) bonus += w.flexibilityBonus;
      if ((o.starRating ?? 3) < 4) bonus -= w.lowStarPenalty;

      const score = Math.round(
        price * w.price + convenience * w.convenience + quality * w.quality + bonus,
      );

      return {
        ...o,
        score: Math.max(0, Math.min(100, score)),
        scoreBreakdown: {
          price: Math.round(price),
          convenience: Math.round(convenience),
          quality: Math.round(quality),
          bonus: Math.round(bonus),
        },
      };
    })
    .sort((a, b) => b.score - a.score);
}
