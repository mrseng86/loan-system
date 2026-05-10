# Hotel Compare — comparison & decision-support tool

> **This is not a booking platform.** Hotel Compare does **not** book hotels,
> reserve rooms, accept payments, collect guest details, or issue
> confirmations. It only fetches publicly available offer data from major
> hotel platforms so you can compare options side-by-side and then follow a
> **View Source** / **Check Source** link back to the original platform to
> decide and book there.

Next.js app that compares hotel offers across major platforms and helps you
decide which one fits your needs — by price, location, cancellation policy,
breakfast, rating and family-friendliness — with a rule-based smart summary
and a side-by-side comparison table.

## What it compares

For every hotel found, the app shows and compares:

- **Multi-platform price comparison** — total stay price + per-night price.
- **Cancellation policy comparison** — free / partial / non-refundable, with
  the platform's own wording.
- **Breakfast included comparison** — Yes / No per offer.
- **Distance comparison** — to city centre, nearest metro, and a nearby
  landmark.
- **Rating &amp; review comparison** — star rating, review score, review count.

## Hotel tags

Each result is automatically tagged so you can scan quickly:

- **Cheapest** — lowest total stay price in the result set.
- **Best Value** — highest combined price+convenience+quality score.
- **Best for Family** — family-friendly heuristic (room type, amenities).
- **Near Metro** — within 500&nbsp;m of a metro / subway station.
- **Free Cancellation** — fully refundable booking conditions.
- **Breakfast Included** — breakfast bundled into the rate.
- **Highest Rated** — best user score in the result set.

## Side-by-side comparison

Tick **Add to compare** on up to four cards to render a comparison table that
puts every attribute (price, distances, cancellation, breakfast, family,
rating, source link) on a single screen. The cheapest price, highest score
and highest review score are highlighted automatically.

## Smart summary (rule-based)

The result page opens with a deterministic summary that picks:

- **Best value** — highest combined score.
- **Lowest price** — cheapest total stay.
- **Highest rated** — best user review score.
- **Best for family** — when a family-friendly option exists.
- **Most flexible** — best free-cancellation option, for late deciders.

The logic is intentionally rule-based so you can audit why every pick was
made. The same `Recommendation` interface leaves room to swap in an LLM
later without changing the UI.

## Outbound links only

Every place the UI could have said _"Book Now"_, _"Reserve"_, _"Checkout"_ or
_"Payment"_ instead says **View Source** or **Check Source** and opens the
relevant page on the original platform in a new tab. The app itself never
collects guest details, processes payments, or sends bookings.

## Stack

- **Next.js 15** (App Router) + **React 19** + **TypeScript**
- **Zod** for request validation
- Connectors are plain TS classes — no DB required for the demo.

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
    layout.tsx          # Root layout
    page.tsx            # Landing + search form
    search/page.tsx     # Server-rendered comparison results
    api/
      hotels/search/    # Aggregator endpoint over all HotelConnectors
      reviews/          # Aggregator endpoint over all ReviewConnectors
    globals.css
  components/
    SearchForm.tsx
    HotelCard.tsx              # Tagged card + add-to-compare toggle
    ComparisonTable.tsx        # Side-by-side selected-hotels table
    RecommendationSummary.tsx  # Rule-based smart summary
    ResultsView.tsx            # Client wrapper holding selection state
    ReviewsPanel.tsx
  lib/
    connectors/         # Hotel-platform connectors (Booking, Agoda, …)
      types.ts
      booking.ts        # Reference connector with live + mock paths
      agoda.ts | expedia.ts | trip.ts
      index.ts
    reviews/            # Social-mention connectors
      types.ts
      youtube.ts | reddit.ts | twitter.ts | tripadvisor.ts
      xiaohongshu.ts    # mock-only (no public API)
      index.ts
    score.ts            # Combined value score
    tags.ts             # Tag computation
    recommendation.ts   # Rule-based summary
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
connector returns deterministic mock offers so the UI keeps working.

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
