import type { ScoredOffer } from "./score";

export type TagId =
  | "cheapest"
  | "best_value"
  | "best_for_family"
  | "near_metro"
  | "free_cancellation"
  | "breakfast_included"
  | "highest_rated";

export interface Tag {
  id: TagId;
  label: string;
  /** Tone hint for UI styling. */
  tone: "good" | "info" | "highlight";
}

export const TAGS: Record<TagId, Tag> = {
  cheapest: { id: "cheapest", label: "Cheapest", tone: "highlight" },
  best_value: { id: "best_value", label: "Best Value", tone: "highlight" },
  best_for_family: { id: "best_for_family", label: "Best for Family", tone: "info" },
  near_metro: { id: "near_metro", label: "Near Metro", tone: "info" },
  free_cancellation: { id: "free_cancellation", label: "Free Cancellation", tone: "good" },
  breakfast_included: { id: "breakfast_included", label: "Breakfast Included", tone: "good" },
  highest_rated: { id: "highest_rated", label: "Highest Rated", tone: "highlight" },
};

const NEAR_METRO_KM = 0.5;

/**
 * Compute the set of tags that apply to each offer, given the full result set.
 * "Cheapest", "Best Value", "Highest Rated" are awarded to a single offer
 * (the leader). Other tags are intrinsic per-offer flags.
 */
export function tagOffers(offers: ScoredOffer[]): Map<string, Tag[]> {
  const tags = new Map<string, Tag[]>();
  if (offers.length === 0) return tags;

  for (const o of offers) tags.set(o.id, []);

  const cheapest = offers.reduce((a, b) => (a.totalPrice.amount <= b.totalPrice.amount ? a : b));
  tags.get(cheapest.id)!.push(TAGS.cheapest);

  const bestValue = offers.reduce((a, b) => (a.score >= b.score ? a : b));
  tags.get(bestValue.id)!.push(TAGS.best_value);

  const rated = offers.filter((o) => o.reviewScore != null);
  if (rated.length > 0) {
    const top = rated.reduce((a, b) => ((a.reviewScore ?? 0) >= (b.reviewScore ?? 0) ? a : b));
    tags.get(top.id)!.push(TAGS.highest_rated);
  }

  for (const o of offers) {
    const list = tags.get(o.id)!;
    if (o.familyFriendly) list.push(TAGS.best_for_family);
    if (o.metroDistanceKm != null && o.metroDistanceKm <= NEAR_METRO_KM) {
      list.push(TAGS.near_metro);
    }
    if (o.freeCancellation) list.push(TAGS.free_cancellation);
    if (o.breakfastIncluded) list.push(TAGS.breakfast_included);
  }

  return tags;
}
