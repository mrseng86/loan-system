import { AgodaConnector } from "./agoda";
import { BookingConnector } from "./booking";
import { ExpediaConnector } from "./expedia";
import { TripConnector } from "./trip";
import type { HotelConnector, HotelOffer, PlatformId, SearchQuery } from "./types";

export const connectors: HotelConnector[] = [
  new BookingConnector(),
  new AgodaConnector(),
  new ExpediaConnector(),
  new TripConnector(),
];

export interface AggregateResult {
  offers: HotelOffer[];
  errors: { platform: PlatformId; message: string }[];
  configured: PlatformId[];
  mocked: PlatformId[];
}

export async function searchAll(query: SearchQuery): Promise<AggregateResult> {
  const settled = await Promise.allSettled(
    connectors.map(async (c) => ({ connector: c, offers: await c.search(query) })),
  );

  const offers: HotelOffer[] = [];
  const errors: AggregateResult["errors"] = [];
  const configured: PlatformId[] = [];
  const mocked: PlatformId[] = [];

  settled.forEach((r, i) => {
    const c = connectors[i];
    if (r.status === "fulfilled") {
      offers.push(...r.value.offers);
      if (c.isConfigured()) configured.push(c.platform);
      if (r.value.offers.some((o) => o.isMock)) mocked.push(c.platform);
    } else {
      errors.push({ platform: c.platform, message: String(r.reason?.message ?? r.reason) });
    }
  });

  return { offers, errors, configured, mocked };
}

export type { HotelConnector, HotelOffer, PlatformId, SearchQuery } from "./types";
