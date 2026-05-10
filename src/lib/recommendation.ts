import type { ScoredOffer } from "./score";
import { INTENT_MODES, type IntentId } from "./intent";

export interface Recommendation {
  /** One-line headline summarising the result set. */
  headline: string;
  /** 2-4 prose sentences explaining the picks in natural language. */
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
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currency} ${Math.round(amount)}`;
  }
}

function joinList(items: string[]): string {
  if (items.length <= 1) return items.join("");
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`;
}

/**
 * Rule-based recommendation written as natural-language prose. Intent-aware:
 * the wording leans toward the chosen mode (family / couple / budget / luxury).
 * Deterministic so users can audit why the words were chosen; keeps the door
 * open to swap in an LLM later behind the same `Recommendation` shape.
 */
export function recommend(offers: ScoredOffer[], intent: IntentId): Recommendation | null {
  if (offers.length === 0) return null;

  const mode = INTENT_MODES[intent];
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
  const goodDeals = offers.filter((o) => o.priceConfidence?.goodDeal);

  const platforms = Array.from(new Set(offers.map((o) => o.platform))).map(
    (p) => PLATFORM_LABEL[p] ?? p,
  );
  const cheapestPrice = fmtMoney(cheapest.totalPrice.amount, cheapest.totalPrice.currency);
  const dearestPrice = fmtMoney(
    Math.max(...offers.map((o) => o.totalPrice.amount)),
    cheapest.totalPrice.currency,
  );
  const flexibleCount = offers.filter((o) => o.freeCancellation).length;
  const breakfastCount = offers.filter((o) => o.breakfastIncluded).length;

  // Headline that adapts to the intent.
  let headline: string;
  switch (intent) {
    case "budget":
      headline =
        `For a budget trip, ${cheapest.hotelName} on ${PLATFORM_LABEL[cheapest.platform]} ` +
        `comes out cheapest at ${cheapestPrice}.`;
      break;
    case "luxury":
      headline =
        `For a luxury stay, ${bestValue.hotelName} on ${PLATFORM_LABEL[bestValue.platform]} ` +
        `pairs the strongest rating with a fair price.`;
      break;
    case "family":
      headline = family
        ? `For a family trip, ${family.hotelName} stands out with family-friendly amenities.`
        : `For a family trip, ${bestValue.hotelName} is the most balanced option here.`;
      break;
    default:
      headline =
        `For a couple, ${bestValue.hotelName} on ${PLATFORM_LABEL[bestValue.platform]} ` +
        `lands the best overall balance.`;
  }

  // Build the prose summary as 3-4 connected sentences.
  const sentences: string[] = [];

  sentences.push(
    `I compared ${offers.length} options across ${joinList(platforms)} ` +
      `using your ${mode.label.toLowerCase()} preferences.`,
  );

  sentences.push(
    `Total prices range from ${cheapestPrice} to ${dearestPrice}, so there's room to trade ` +
      `cost for comfort.`,
  );

  if (flexibleCount > 0 || breakfastCount > 0) {
    const flexBit =
      flexibleCount > 0
        ? `${flexibleCount} option${flexibleCount === 1 ? "" : "s"} let you cancel for free`
        : "";
    const breakBit =
      breakfastCount > 0
        ? `${breakfastCount} include${breakfastCount === 1 ? "s" : ""} breakfast`
        : "";
    const both = [flexBit, breakBit].filter(Boolean).join(" and ");
    sentences.push(`${both.charAt(0).toUpperCase()}${both.slice(1)}, which can swing the value calc.`);
  }

  if (goodDeals.length > 0) {
    const names = goodDeals
      .slice(0, 2)
      .map((o) => o.hotelName)
      .join(" and ");
    sentences.push(
      `Heads up — ${names} ${goodDeals.length > 1 ? "are" : "is"} priced below their typical range right now, ` +
        `so they look like genuine deals.`,
    );
  } else {
    const trendingDown = offers.filter((o) => o.priceConfidence?.trend === "down").length;
    if (trendingDown > 0) {
      sentences.push(
        `${trendingDown} of these prices have been trending down recently, which is a small positive signal.`,
      );
    }
  }

  if (topRated && intent !== "budget") {
    sentences.push(
      `${topRated.hotelName} has the strongest user score at ${topRated.reviewScore?.toFixed(1)}/10 ` +
        `from ${topRated.reviewCount ?? 0} reviews.`,
    );
  }

  const summary = sentences.join(" ");

  // Picks list — adapts the order to the intent.
  const picks: Recommendation["picks"] = [];
  picks.push({
    label: intent === "luxury" ? "Best stay" : "Best value",
    offerId: bestValue.id,
    reason: `Highest combined score (${bestValue.score}/100) for the ${mode.label.toLowerCase()} weighting.`,
  });
  if (cheapest.id !== bestValue.id) {
    picks.push({
      label: "Lowest price",
      offerId: cheapest.id,
      reason: `Cheapest total at ${cheapestPrice}.`,
    });
  }
  if (topRated && topRated.id !== bestValue.id && topRated.id !== cheapest.id) {
    picks.push({
      label: "Highest rated",
      offerId: topRated.id,
      reason: `${topRated.reviewScore?.toFixed(1)}/10 from ${topRated.reviewCount ?? 0} reviews.`,
    });
  }
  if (intent === "family" && family && family.id !== bestValue.id) {
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
      reason: "Free cancellation — useful if your plans might still change.",
    });
  }

  return { headline, summary, picks };
}
