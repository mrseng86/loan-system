import { searchAll } from "@/lib/connectors";
import { scoreOffers } from "@/lib/score";
import { tagOffers } from "@/lib/tags";
import { recommend } from "@/lib/recommendation";
import { ResultsView } from "@/components/ResultsView";
import { SearchForm } from "@/components/SearchForm";

interface SearchPageProps {
  searchParams: Promise<{
    destination?: string;
    checkIn?: string;
    checkOut?: string;
    guests?: string;
    rooms?: string;
  }>;
}

const PLATFORM_LABEL: Record<string, string> = {
  booking: "Booking.com",
  agoda: "Agoda",
  expedia: "Expedia",
  trip: "Trip.com",
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const sp = await searchParams;
  if (!sp.destination || !sp.checkIn || !sp.checkOut) {
    return (
      <div>
        <h1>Missing search parameters</h1>
        <SearchForm />
      </div>
    );
  }

  const query = {
    destination: sp.destination,
    checkIn: sp.checkIn,
    checkOut: sp.checkOut,
    guests: Number(sp.guests ?? 2),
    rooms: Number(sp.rooms ?? 1),
  };

  const result = await searchAll(query);
  const offers = scoreOffers(result.offers);
  const tagsMap = tagOffers(offers);
  const tags = Object.fromEntries(tagsMap.entries());
  const recommendation = recommend(offers);
  const allMocked = result.mocked.length === 4 && result.configured.length === 0;

  return (
    <div>
      <h1>
        Hotel comparison · {query.destination} · {query.checkIn} → {query.checkOut}
      </h1>
      <p className="subtitle">
        {offers.length} options compared across {new Set(offers.map((o) => o.platform)).size} platforms.
        This page only compares — it does not handle bookings, payments, or guest details.
      </p>

      <SearchForm
        defaults={{
          destination: query.destination,
          checkIn: query.checkIn,
          checkOut: query.checkOut,
          guests: query.guests,
          rooms: query.rooms,
        }}
      />

      {allMocked && (
        <div className="alert">
          No connectors are configured – showing mock data. Add API keys to{" "}
          <code>.env.local</code> to fetch live prices.
        </div>
      )}
      {result.errors.length > 0 && (
        <div className="alert">
          Some connectors failed:{" "}
          {result.errors.map((e) => `${PLATFORM_LABEL[e.platform] ?? e.platform} (${e.message})`).join(", ")}
        </div>
      )}

      <ResultsView
        offers={offers}
        tags={tags}
        recommendation={recommendation}
        destination={query.destination}
      />
    </div>
  );
}
