import type { ScoredOffer } from "@/lib/score";

const PLATFORM_LABEL: Record<string, string> = {
  booking: "Booking.com",
  agoda: "Agoda",
  expedia: "Expedia",
  trip: "Trip.com",
};

function fmtMoney(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(0)}`;
  }
}

export function HotelCard({ offer }: { offer: ScoredOffer }) {
  return (
    <article className="card">
      <div className="row">
        <span className="platform">{PLATFORM_LABEL[offer.platform] ?? offer.platform}</span>
        <span className="score" title="Combined value score (0-100)">
          {offer.score}
        </span>
      </div>
      <div className="name">{offer.hotelName}</div>
      <div className="meta">
        {offer.starRating != null && <span>{"★".repeat(offer.starRating)}</span>}
        {offer.reviewScore != null && (
          <span>
            {offer.reviewScore.toFixed(1)} / 10 ({offer.reviewCount ?? 0} reviews)
          </span>
        )}
        {offer.distanceKm != null && <span>{offer.distanceKm.toFixed(1)} km from centre</span>}
      </div>
      <div className="badges">
        {offer.freeCancellation && <span className="badge good">Free cancellation</span>}
        {offer.breakfastIncluded && <span className="badge good">Breakfast included</span>}
        {offer.isMock && <span className="badge mock">Mock data</span>}
      </div>
      <div className="row" style={{ marginTop: 8 }}>
        <div>
          <div className="price">{fmtMoney(offer.totalPrice.amount, offer.totalPrice.currency)}</div>
          {offer.perNightPrice && (
            <div className="pernight">
              {fmtMoney(offer.perNightPrice.amount, offer.perNightPrice.currency)} / night
            </div>
          )}
        </div>
        <a className="primary" href={offer.deepLink} target="_blank" rel="noreferrer"
           style={{ padding: "10px 14px", borderRadius: 8, background: "var(--accent)", color: "white" }}>
          Book →
        </a>
      </div>
      <div className="score-bar">
        <span>price {offer.scoreBreakdown.price}</span>
        <span>convenience {offer.scoreBreakdown.convenience}</span>
        <span>quality {offer.scoreBreakdown.quality}</span>
      </div>
    </article>
  );
}
