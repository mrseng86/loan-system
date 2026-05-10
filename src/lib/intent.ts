/**
 * Travel-intent modes change how the comparison is scored and described.
 * Weights are deliberately simple and deterministic so users can audit them.
 */

export type IntentId = "family" | "couple" | "budget" | "luxury";

export interface IntentWeights {
  /** Weight on the price-vs-cheapest score, 0-1. */
  price: number;
  /** Weight on the convenience score (location, metro, breakfast, flex). */
  convenience: number;
  /** Weight on the quality score (stars + review score). */
  quality: number;
  /** Bonus added when the hotel is family-friendly. */
  familyBonus: number;
  /** Bonus added when the hotel offers free cancellation. */
  flexibilityBonus: number;
  /** Penalty applied when star rating is below 4 (used for "luxury"). */
  lowStarPenalty: number;
}

export interface IntentMode {
  id: IntentId;
  label: string;
  emoji: string;
  blurb: string;
  weights: IntentWeights;
}

export const INTENT_MODES: Record<IntentId, IntentMode> = {
  family: {
    id: "family",
    label: "Family",
    emoji: "👨‍👩‍👧",
    blurb: "Bigger rooms, kid-friendly amenities and a forgiving cancellation policy.",
    weights: {
      price: 0.3,
      convenience: 0.3,
      quality: 0.2,
      familyBonus: 15,
      flexibilityBonus: 5,
      lowStarPenalty: 0,
    },
  },
  couple: {
    id: "couple",
    label: "Couple",
    emoji: "💑",
    blurb: "Quiet, well-rated stays close to attractions, with flexible cancellation.",
    weights: {
      price: 0.2,
      convenience: 0.3,
      quality: 0.3,
      familyBonus: 0,
      flexibilityBonus: 10,
      lowStarPenalty: 0,
    },
  },
  budget: {
    id: "budget",
    label: "Budget",
    emoji: "💸",
    blurb: "Lowest total cost wins; convenience and rating are tie-breakers.",
    weights: {
      price: 0.6,
      convenience: 0.2,
      quality: 0.1,
      familyBonus: 0,
      flexibilityBonus: 5,
      lowStarPenalty: 0,
    },
  },
  luxury: {
    id: "luxury",
    label: "Luxury",
    emoji: "✨",
    blurb: "High star rating and review score first; price is secondary.",
    weights: {
      price: 0.1,
      convenience: 0.2,
      quality: 0.6,
      familyBonus: 0,
      flexibilityBonus: 5,
      lowStarPenalty: 8,
    },
  },
};

export const DEFAULT_INTENT: IntentId = "couple";

export function isIntentId(v: string | undefined | null): v is IntentId {
  return v === "family" || v === "couple" || v === "budget" || v === "luxury";
}
