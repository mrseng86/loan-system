"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { HotelOffer } from "@/lib/connectors/types";
import { scoreOffers } from "@/lib/score";
import { tagOffers, type TagId } from "@/lib/tags";
import { recommend } from "@/lib/recommendation";
import { DEFAULT_INTENT, INTENT_MODES, type IntentId } from "@/lib/intent";
import { HotelCard } from "./HotelCard";
import { ComparisonTable } from "./ComparisonTable";
import { RecommendationSummary } from "./RecommendationSummary";
import { ReviewsPanel } from "./ReviewsPanel";
import { IntentSelector } from "./IntentSelector";
import { MapPanel } from "./MapPanel";
import { BattleView } from "./BattleView";
import { ShareLinkButton } from "./ShareLinkButton";

interface Props {
  offers: HotelOffer[];
  destination: string;
  initialIntent: IntentId;
  initialCompare: string[];
}

const MAX_COMPARE = 4;

const FILTER_OPTIONS: { id: TagId; label: string }[] = [
  { id: "free_cancellation", label: "Free Cancellation" },
  { id: "breakfast_included", label: "Breakfast Included" },
  { id: "near_metro", label: "Near Metro" },
  { id: "best_for_family", label: "Best for Family" },
];

export function ResultsView({ offers: rawOffers, destination, initialIntent, initialCompare }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [intent, setIntent] = useState<IntentId>(initialIntent);
  const [selected, setSelected] = useState<string[]>(initialCompare);
  const [activeFilters, setActiveFilters] = useState<Set<TagId>>(new Set());
  const [highlighted, setHighlighted] = useState<string | null>(null);
  const [view, setView] = useState<"split" | "list">("split");
  const [shareUrl, setShareUrl] = useState<string>("");

  // Rescore + retag whenever intent changes — keeps the entire result list
  // consistent with the active travel mode without a server round-trip.
  const offers = useMemo(() => scoreOffers(rawOffers, intent), [rawOffers, intent]);
  const tagsMap = useMemo(() => tagOffers(offers), [offers]);
  const tags = useMemo(() => Object.fromEntries(tagsMap.entries()), [tagsMap]);
  const recommendation = useMemo(() => recommend(offers, intent), [offers, intent]);

  // Drop selected ids that no longer exist in the result set.
  useEffect(() => {
    setSelected((cur) => cur.filter((id) => offers.some((o) => o.id === id)));
  }, [offers]);

  // Sync intent + selection back to the URL so the page is shareable.
  useEffect(() => {
    const next = new URLSearchParams(searchParams.toString());
    if (intent === DEFAULT_INTENT) next.delete("intent");
    else next.set("intent", intent);
    if (selected.length === 0) next.delete("compare");
    else next.set("compare", selected.join(","));
    const newQs = next.toString();
    const currentQs = searchParams.toString();
    if (newQs !== currentQs) {
      // typedRoutes can't validate a dynamic query string, so cast to Route.
      const href = `${pathname}?${newQs}` as Parameters<typeof router.replace>[0];
      router.replace(href, { scroll: false });
    }
    if (typeof window !== "undefined") {
      const u = new URL(window.location.href);
      u.search = newQs;
      setShareUrl(u.toString());
    }
  }, [intent, selected, pathname, router, searchParams]);

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
    .filter((o): o is (typeof offers)[number] => Boolean(o));

  const focusName = selectedOffers[0]?.hotelName ?? offers[0]?.hotelName;
  const inBattle = selectedOffers.length === 2;

  return (
    <>
      <div className="toolbar">
        <IntentSelector value={intent} onChange={setIntent} />
        <div className="toolbar-actions">
          <div className="view-toggle" role="tablist" aria-label="Layout">
            <button
              type="button"
              role="tab"
              aria-selected={view === "split"}
              className={`chip${view === "split" ? " chip--on" : ""}`}
              onClick={() => setView("split")}
            >
              List + map
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={view === "list"}
              className={`chip${view === "list" ? " chip--on" : ""}`}
              onClick={() => setView("list")}
            >
              List only
            </button>
          </div>
          <ShareLinkButton url={shareUrl} />
        </div>
      </div>

      {recommendation && <RecommendationSummary recommendation={recommendation} offers={offers} />}

      {inBattle ? (
        <BattleView
          a={selectedOffers[0]}
          b={selectedOffers[1]}
          onClose={() => setSelected([selectedOffers[0].id])}
        />
      ) : (
        <>
          <h2>
            Side-by-side comparison
            {selectedOffers.length > 0 && (
              <span className="muted h2-hint">
                {" "}
                · {selectedOffers.length}/{MAX_COMPARE} picked
                {selectedOffers.length === 1 && " · pick one more for battle mode"}
              </span>
            )}
          </h2>
          <ComparisonTable offers={selectedOffers} onRemove={toggleSelect} />
        </>
      )}

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
        {filtered.length !== offers.length && ` of ${offers.length}`}) ·{" "}
        <span className="muted">scored for {INTENT_MODES[intent].label.toLowerCase()}</span>
      </h2>

      <div className={`results-${view}`}>
        <div className="cards">
          {filtered.map((o) => (
            <HotelCard
              key={o.id}
              offer={o}
              tags={tags[o.id] ?? []}
              selected={selected.includes(o.id)}
              highlighted={highlighted === o.id}
              onToggleSelect={toggleSelect}
              onHover={setHighlighted}
              selectionDisabled={selected.length >= MAX_COMPARE}
            />
          ))}
          {filtered.length === 0 && (
            <p className="muted">No hotels match every selected filter.</p>
          )}
        </div>
        {view === "split" && (
          <aside className="map-aside">
            <MapPanel
              offers={filtered}
              highlightedId={highlighted}
              onHighlight={setHighlighted}
              onSelect={toggleSelect}
              selectedIds={selected}
              destination={destination}
            />
          </aside>
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
