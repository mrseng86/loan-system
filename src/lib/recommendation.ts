import type { ScoredOffer } from "./score";

export interface Recommendation {
  /** One-line headline summarising the result set. */
  headline: string;
  /** 2-4 sentences expanding on the headline. */
  summary: string;
  /** Specific picks with a one-line rationale each. */
  picks: { label: string; offerId: string; reason: string }[];
}

const PLATFORM_LABEL: Record<string, string> = {
  booking: "Booking.com",
  agoda: "Agoda",
  expedia: "Expedia",
  trip: "Trip.com",
};

function fmtMoney(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency, maximumFractionDigits: 0 }).format(amount);
  } catch {
    return `${currency} ${Math.round(amount)}`;
  }
}

/**
 * Rule-based recommendation summary. Intentionally deterministic so users can
 * reason about why each pick was made. Keeps the door open to swap in an LLM
 * later behind the same `Recommendation` shape.
 */
export function recommend(offers: ScoredOffer[]): Recommendation | null {
  if (offers.length === 0) return null;

  const cheapest = offers.reduce((a, b) => (a.totalPrice.amount <= b.totalPrice.amount ? a : b));
  const bestValue = offers.reduce((a, b) => (a.score >= b.score ? a : b));
  const family = offers.find((o) => o.familyFriendly);
  const flexible = offers
    .filter((o) => o.freeCancellation)
    .sort((a, b) => b.score - a.score)[0];
  const rated = offers.filter((o) => o.reviewScore != null);
  const topRated = rated.length
    ? rated.reduce((a, b) => ((a.reviewScore ?? 0) >= (b.reviewScore ?? 0) ? a : b))
    : null;

  const platforms = Array.from(new Set(offers.map((o) => o.platform)));
  const priceRange =
    `${fmtMoney(cheapest.totalPrice.amount, cheapest.totalPrice.currency)} – ` +
    `${fmtMoney(Math.max(...offers.map((o) => o.totalPrice.amount)), cheapest.totalPrice.currency)}`;
  const flexibleCount = offers.filter((o) => o.freeCancellation).length;
  const breakfastCount = offers.filter((o) => o.breakfastIncluded).length;

  const headline =
    `Best overall: ${bestValue.hotelName} (${PLATFORM_LABEL[bestValue.platform] ?? bestValue.platform}) ` +
    `at ${fmtMoney(bestValue.totalPrice.amount, bestValue.totalPrice.currency)}.`;

  const summary =
    `Compared ${offers.length} offers across ${platforms.length} platform${platforms.length > 1 ? "s" : ""}. ` +
    `Total price range ${priceRange}. ` +
    `${flexibleCount} offer${flexibleCount === 1 ? "" : "s"} allow free cancellation, ` +
    `${breakfastCount} include breakfast.`;

  const picks: Recommendation["picks"] = [];
  picks.push({
    label: "Best value",
    offerId: bestValue.id,
    reason: `Highest combined score (${bestValue.score}/100): balances price, location and quality.`,
  });
  if (cheapest.id !== bestValue.id) {
    picks.push({
      label: "Lowest price",
      offerId: cheapest.id,
      reason: `Cheapest total at ${fmtMoney(cheapest.totalPrice.amount, cheapest.totalPrice.currency)}.`,
    });
  }
  if (topRated && topRated.id !== bestValue.id && topRated.id !== cheapest.id) {
    picks.push({
      label: "Highest rated",
      offerId: topRated.id,
      reason: `${topRated.reviewScore?.toFixed(1)}/10 from ${topRated.reviewCount ?? 0} reviews.`,
    });
  }
  if (family && family.id !== bestValue.id) {
    picks.push({
      label: "Best for family",
      offerId: family.id,
      reason: "Family-friendly amenities and room layout.",
    });
  }
  if (flexible && flexible.id !== bestValue.id && flexible.id !== cheapest.id) {
    picks.push({
      label: "Most flexible",
      offerId: flexible.id,
      reason: `Free cancellation – good if your plans might change.`,
    });
  }

  return { headline, summary, picks };
}
