"use client";

import { useMemo, useState } from "react";
import type { ScoredOffer } from "@/lib/score";
import type { Recommendation } from "@/lib/recommendation";
import type { Tag, TagId } from "@/lib/tags";
import { HotelCard } from "./HotelCard";
import { ComparisonTable } from "./ComparisonTable";
import { RecommendationSummary } from "./RecommendationSummary";
import { ReviewsPanel } from "./ReviewsPanel";

interface Props {
  offers: ScoredOffer[];
  tags: Record<string, Tag[]>;
  recommendation: Recommendation | null;
  destination: string;
}

const MAX_COMPARE = 4;

const FILTER_OPTIONS: { id: TagId; label: string }[] = [
  { id: "free_cancellation", label: "Free Cancellation" },
  { id: "breakfast_included", label: "Breakfast Included" },
  { id: "near_metro", label: "Near Metro" },
  { id: "best_for_family", label: "Best for Family" },
];

export function ResultsView({ offers, tags, recommendation, destination }: Props) {
  const [selected, setSelected] = useState<string[]>(() =>
    offers.slice(0, Math.min(2, offers.length)).map((o) => o.id),
  );
  const [activeFilters, setActiveFilters] = useState<Set<TagId>>(new Set());

  function toggleSelect(id: string) {
    setSelected((cur) => {
      if (cur.includes(id)) return cur.filter((x) => x !== id);
      if (cur.length >= MAX_COMPARE) return cur;
      return [...cur, id];
    });
  }

  function toggleFilter(id: TagId) {
    setActiveFilters((cur) => {
      const next = new Set(cur);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const filtered = useMemo(() => {
    if (activeFilters.size === 0) return offers;
    return offers.filter((o) => {
      const offerTagIds = new Set((tags[o.id] ?? []).map((t) => t.id));
      for (const f of activeFilters) {
        if (!offerTagIds.has(f)) return false;
      }
      return true;
    });
  }, [offers, tags, activeFilters]);

  const selectedOffers = selected
    .map((id) => offers.find((o) => o.id === id))
    .filter((o): o is ScoredOffer => Boolean(o));

  const focusName = selectedOffers[0]?.hotelName ?? offers[0]?.hotelName;

  return (
    <>
      {recommendation && <RecommendationSummary recommendation={recommendation} offers={offers} />}

      <h2>Side-by-side comparison</h2>
      <ComparisonTable offers={selectedOffers} onRemove={toggleSelect} />

      <h2>Filter by tag</h2>
      <div className="filters">
        {FILTER_OPTIONS.map((f) => {
          const active = activeFilters.has(f.id);
          return (
            <button
              key={f.id}
              type="button"
              className={`chip${active ? " chip--on" : ""}`}
              onClick={() => toggleFilter(f.id)}
            >
              {f.label}
            </button>
          );
        })}
        {activeFilters.size > 0 && (
          <button
            type="button"
            className="chip chip--ghost"
            onClick={() => setActiveFilters(new Set())}
          >
            Reset
          </button>
        )}
      </div>

      <h2>
        All offers ({filtered.length}
        {filtered.length !== offers.length && ` of ${offers.length}`})
      </h2>
      <div className="cards">
        {filtered.map((o) => (
          <HotelCard
            key={o.id}
            offer={o}
            tags={tags[o.id] ?? []}
            selected={selected.includes(o.id)}
            onToggleSelect={toggleSelect}
            selectionDisabled={selected.length >= MAX_COMPARE}
          />
        ))}
        {filtered.length === 0 && (
          <p className="muted">No hotels match every selected filter.</p>
        )}
      </div>

      {focusName && (
        <>
          <h2>Social mentions · {focusName}</h2>
          <ReviewsPanel hotelName={focusName} city={destination} />
        </>
      )}
    </>
  );
}
