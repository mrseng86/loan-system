# Hotel Compare

Next.js app that compares hotel **price + convenience + quality** across major
booking platforms in a single view, and pulls **social reviews** from public
platforms so you can sanity-check a hotel before clicking _Book_.

> Currently in skeleton stage: project structure, all connector interfaces,
> the Booking.com connector, and the comparison UI are wired up. Other
> platforms ship as stubs that fall back to realistic mock data — add API
> keys to `.env.local` to switch each one to live data.

## Stack

- **Next.js 15** (App Router) + **React 19** + **TypeScript**
- **Zod** for request validation
- Connectors are plain TS classes – no DB required for the demo.

## Quick start

```bash
npm install
cp .env.example .env.local   # optional – fill in any keys you have
npm run dev
```

Open http://localhost:3000 and search any city.
Without API keys you'll see mock offers from all four platforms and mock
reviews from all five social sources, so the UI is fully exercisable offline.

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
    HotelCard.tsx
    ReviewsPanel.tsx
  lib/
    connectors/         # Hotel-platform connectors (Booking, Agoda, …)
      types.ts          # HotelConnector, HotelOffer, SearchQuery
      booking.ts        # Live + mock impl (demo)
      agoda.ts          # Stub + mock
      expedia.ts        # Stub + mock
      trip.ts           # Stub + mock
      index.ts          # Registry + searchAll()
    reviews/            # Social-review connectors
      types.ts
      youtube.ts        # Live + mock impl
      reddit.ts         # Live + mock impl
      twitter.ts        # Live + mock impl
      xiaohongshu.ts    # Mock-only (no public API)
      tripadvisor.ts    # Live + mock impl
      index.ts          # Registry + fetchAllReviews()
    score.ts            # Combined value scoring
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

The same pattern is used for social reviews via `ReviewConnector`.

## Adding real API keys

| Platform | Env vars | Docs |
| --- | --- | --- |
| Booking.com | `BOOKING_AFFILIATE_ID`, `BOOKING_API_KEY` | https://developers.booking.com/ |
| Agoda | `AGODA_SITE_ID`, `AGODA_API_KEY` | https://partners.agoda.com/ |
| Expedia (Rapid / EPS) | `EXPEDIA_API_KEY`, `EXPEDIA_SHARED_SECRET` | https://developers.expediagroup.com/docs/rapid |
| Trip.com Open Platform | `TRIP_APP_KEY`, `TRIP_APP_SECRET` | https://open.trip.com/ |
| YouTube Data API | `YOUTUBE_API_KEY` | https://developers.google.com/youtube/v3 |
| Reddit | `REDDIT_CLIENT_ID`, `REDDIT_CLIENT_SECRET`, `REDDIT_USER_AGENT` | https://www.reddit.com/dev/api/ |
| X / Twitter | `TWITTER_BEARER_TOKEN` | https://docs.x.com/x-api/ |
| TripAdvisor | `TRIPADVISOR_API_KEY` | https://tripadvisor-content-api.readme.io/ |
| 小红书 / 微博 | _no public API_ | needs a third-party data provider |

## What's done vs. what's next

Done:

- Connector framework + scoring
- Booking.com live + mock implementation as the reference connector
- YouTube / Reddit / X / TripAdvisor live implementations (mock fallback)
- Search UI, comparison cards, social-review panel
- API routes for both aggregators

Next steps:

- Implement live calls for Agoda / Expedia / Trip.com (currently stubs)
- Token caching for Reddit OAuth
- Persistent search history + favourite hotels (DB layer)
- Currency normalisation across platforms
- A 小红书 / Weibo data provider (or scraper) – left as a documented gap

## API reference

```
GET /api/hotels/search?destination=Tokyo&checkIn=2026-06-01&checkOut=2026-06-04&guests=2&rooms=1
GET /api/reviews?hotelName=Park%20Hyatt%20Tokyo&city=Tokyo&limit=5
```

Both return JSON with `configured`, `mocked`, and `errors` fields so the UI
can show the user which platforms are live vs. stubbed.
