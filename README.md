# Hotel Compare — AI-assisted hotel decision experience

> **This is not a booking platform.** Hotel Compare does **not** book hotels,
> reserve rooms, accept payments, collect guest details, or issue
> confirmations. It only fetches publicly available offer data from major
> hotel platforms so you can compare options side-by-side and then follow a
> **View Source** / **Check Source** link back to the original platform to
> decide and book there.

Next.js app that compares hotel offers across major platforms and helps you
decide. Travel-mode scoring, price-confidence signals, a smart natural-language
summary, a split list / map view, head-to-head battle mode, and shareable
comparison links — all comparison-focused, no booking flow anywhere.

## Headline features

### 1. Smart summary in natural language
A rule-based assistant (`src/lib/recommendation.ts`) writes a 3-4 sentence
prose summary of the result set: how many platforms were compared, the price
range, how many offers are flexible or include breakfast, which prices are
trending down or look like good deals, and the top-rated option. The wording
adapts to the active travel mode and remains fully deterministic so users can
audit why each phrase was chosen.

### 2. Price confidence on every offer
Each offer carries a `priceConfidence` block:

- **Last checked** timestamp (`5 min ago`, `2 h ago`, …)
- **Trend** — up / down / stable with a percentage delta
- **Good deal** flag when the price is meaningfully below the typical range
- **Average price** for context

These show up as compact badges on every hotel card so you can tell at a
glance whether a price is fresh and whether it's actually a deal.

### 3. Split list / map experience
A schematic, dependency-free SVG map renders alongside the list with
distance rings (0.5 / 1 / 2 km) and a colour-coded pin per platform. Hovering
a pin highlights its card and vice versa. Tap a pin to add it to the
comparison. Switch to **List only** when you want a denser layout.

The map is intentionally schematic, not a real basemap. When real coords
become available the same projection math holds — just pass real lat/lng in
on `HotelOffer.coords`.

### 4. Travel intent modes
Pick **Family / Couple / Budget / Luxury** to instantly rescore the entire
list. Each mode applies different weights to price, convenience, quality,
plus a family-friendly or flexibility bonus and a low-star penalty for
luxury. The smart summary's wording follows the chosen mode.

### 5. Hotel battle comparison view
Add **exactly 2** hotels to the compare set and the page automatically
swaps to a head-to-head battle view: per-category winners highlighted, an
overall winner banner, and an outbound View Source link on each side.
Add a 3rd hotel and it falls back to the standard side-by-side table.

### 6. Shareable comparison links
The active travel mode and the selected hotel ids live in the URL
(`?intent=family&compare=booking:mock-1,agoda:mock-0`). The **🔗 Share
comparison** button copies the current permalink to the clipboard.

### 7. Mobile-first UX polish
Single-column layout on small screens with 44 px tap targets and 16 px
input fonts (no iOS auto-zoom). The split layout collapses to vertical
on mobile, the comparison table scrolls horizontally with a sticky
attribute column, the battle view stacks vertically.

### 8. Comparison-focused, not booking-focused
Every CTA is **View Source** or **Check Source**. No "Book", "Reserve",
"Checkout", "Payment" or "Affiliate" wording anywhere.

## Stack

- **Next.js 15** (App Router) + **React 19** + **TypeScript**
- **Zod** for request validation
- Connectors are plain TS classes — no DB required for the demo.
- Map is a hand-rolled inline SVG, no map dependency.

## Quick start

```bash
npm install
cp .env.example .env.local   # optional — fill in any keys you have
npm run dev
```

Open <http://localhost:3000> and search any city. Without API keys you'll see
mock offers from all four platforms and mock mentions from all five social
sources, so the UI is fully exercisable offline.

## Project layout

```
src/
  app/
    layout.tsx
    page.tsx
    search/page.tsx                # Server-rendered comparison results
    api/
      hotels/search/               # Aggregator endpoint over HotelConnectors
      reviews/                     # Aggregator endpoint over ReviewConnectors
    globals.css
  components/
    SearchForm.tsx
    HotelCard.tsx                  # Card with tags + price-confidence + add-to-compare
    ComparisonTable.tsx            # Side-by-side selected-hotels table
    BattleView.tsx                 # Head-to-head 2-hotel view
    RecommendationSummary.tsx      # Natural-language summary
    IntentSelector.tsx             # Family / Couple / Budget / Luxury
    MapPanel.tsx                   # Schematic SVG map
    ShareLinkButton.tsx            # Copies the comparison permalink
    ResultsView.tsx                # Client wrapper holding state + URL sync
    ReviewsPanel.tsx
  lib/
    connectors/
      types.ts
      booking.ts | agoda.ts | expedia.ts | trip.ts
      mockHelpers.ts               # Shared deterministic mock helpers
      index.ts
    reviews/
      types.ts
      youtube.ts | reddit.ts | twitter.ts | tripadvisor.ts | xiaohongshu.ts
      index.ts
    intent.ts                      # Travel modes + scoring weights
    score.ts                       # Intent-aware combined value score
    tags.ts                        # Tag computation
    recommendation.ts              # Natural-language summary
```

## How connectors work

Every hotel platform implements the same interface:

```ts
interface HotelConnector {
  readonly platform: "booking" | "agoda" | "expedia" | "trip";
  readonly displayName: string;
  isConfigured(): boolean;
  search(query: SearchQuery): Promise<HotelOffer[]>;
}
```

`searchAll()` runs every connector in parallel with `Promise.allSettled`, so
one failing platform never breaks the whole search. Each connector reads its
own credentials from env vars (see `.env.example`); when they're absent the
connector returns deterministic mock offers — including coords, price-
confidence and family-friendly flags — so the UI keeps working offline.

The same pattern is used for social mentions via `ReviewConnector`.

## Adding real API keys

| Platform | Env vars | Docs |
| --- | --- | --- |
| Booking.com | `BOOKING_PARTNER_ID`, `BOOKING_API_KEY` | https://developers.booking.com/ |
| Agoda | `AGODA_SITE_ID`, `AGODA_API_KEY` | https://partners.agoda.com/ |
| Expedia (Rapid / EPS) | `EXPEDIA_API_KEY`, `EXPEDIA_SHARED_SECRET` | https://developers.expediagroup.com/docs/rapid |
| Trip.com Open Platform | `TRIP_APP_KEY`, `TRIP_APP_SECRET` | https://open.trip.com/ |
| YouTube Data API | `YOUTUBE_API_KEY` | https://developers.google.com/youtube/v3 |
| Reddit | `REDDIT_CLIENT_ID`, `REDDIT_CLIENT_SECRET`, `REDDIT_USER_AGENT` | https://www.reddit.com/dev/api/ |
| X / Twitter | `TWITTER_BEARER_TOKEN` | https://docs.x.com/x-api/ |
| TripAdvisor | `TRIPADVISOR_API_KEY` | https://tripadvisor-content-api.readme.io/ |
| 小红书 / 微博 | _no public API_ | needs a third-party data provider |

## API reference

```
GET /api/hotels/search?destination=Tokyo&checkIn=2026-06-01&checkOut=2026-06-04&guests=2&rooms=1
GET /api/reviews?hotelName=Park%20Hyatt%20Tokyo&city=Tokyo&limit=5
```

Both return JSON with `configured`, `mocked`, and `errors` fields so the UI
can show the user which platforms are live vs. stubbed. Neither endpoint
performs any booking or payment action — they only return read-only data.
