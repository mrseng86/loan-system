import { searchAll } from "@/lib/connectors";
import { scoreOffers } from "@/lib/score";
import { HotelCard } from "@/components/HotelCard";
import { ReviewsPanel } from "@/components/ReviewsPanel";
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
        <h1>Missing search params</h1>
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
  const top = offers[0];

  const allMocked = result.mocked.length === 4 && result.configured.length === 0;

  return (
    <div>
      <h1>
        Hotels in {query.destination} · {query.checkIn} → {query.checkOut}
      </h1>
      <p className="subtitle">
        {offers.length} offers from {new Set(offers.map((o) => o.platform)).size} platforms.
        Ranked by combined value score.
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

      <h2>Best matches</h2>
      <div className="cards">
        {offers.map((o) => (
          <HotelCard key={o.id} offer={o} />
        ))}
      </div>

      {top && (
        <>
          <h2>Social reviews · {top.hotelName}</h2>
          <ReviewsPanel hotelName={top.hotelName} city={query.destination} />
        </>
      )}
    </div>
  );
}
