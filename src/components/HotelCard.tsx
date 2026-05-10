import type { ScoredOffer } from "@/lib/score";
import type { Tag } from "@/lib/tags";

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

interface Props {
  offer: ScoredOffer;
  tags: Tag[];
  selected: boolean;
  onToggleSelect: (id: string) => void;
  selectionDisabled: boolean;
}

export function HotelCard({ offer, tags, selected, onToggleSelect, selectionDisabled }: Props) {
  return (
    <article className={`card${selected ? " card--selected" : ""}`}>
      <div className="row">
        <span className="platform">{PLATFORM_LABEL[offer.platform] ?? offer.platform}</span>
        <span className="score" title="Combined value score (0-100)">
          {offer.score}
        </span>
      </div>
      <div className="name">{offer.hotelName}</div>

      {tags.length > 0 && (
        <div className="badges">
          {tags.map((t) => (
            <span key={t.id} className={`badge tag tag--${t.tone}`}>
              {t.label}
            </span>
          ))}
        </div>
      )}

      <div className="meta">
        {offer.starRating != null && <span>{"★".repeat(offer.starRating)}</span>}
        {offer.reviewScore != null && (
          <span>
            {offer.reviewScore.toFixed(1)} / 10 ({offer.reviewCount ?? 0} reviews)
          </span>
        )}
      </div>

      <dl className="facts">
        {offer.distanceKm != null && (
          <>
            <dt>City centre</dt>
            <dd>{offer.distanceKm.toFixed(1)} km</dd>
          </>
        )}
        {offer.metroDistanceKm != null && (
          <>
            <dt>Metro</dt>
            <dd>{offer.metroDistanceKm.toFixed(1)} km</dd>
          </>
        )}
        {offer.nearestLandmark && offer.landmarkDistanceKm != null && (
          <>
            <dt>{offer.nearestLandmark}</dt>
            <dd>{offer.landmarkDistanceKm.toFixed(1)} km</dd>
          </>
        )}
        {offer.cancellationPolicy && (
          <>
            <dt>Cancellation</dt>
            <dd>{offer.cancellationPolicy}</dd>
          </>
        )}
      </dl>

      {offer.isMock && (
        <div className="badges">
          <span className="badge mock">Mock data</span>
        </div>
      )}

      <div className="row" style={{ marginTop: 8 }}>
        <div>
          <div className="price">{fmtMoney(offer.totalPrice.amount, offer.totalPrice.currency)}</div>
          <div className="pernight">total for the stay</div>
          {offer.perNightPrice && (
            <div className="pernight">
              ≈ {fmtMoney(offer.perNightPrice.amount, offer.perNightPrice.currency)} / night
            </div>
          )}
        </div>
        <a className="link-source" href={offer.sourceUrl} target="_blank" rel="noreferrer noopener">
          View Source ↗
        </a>
      </div>

      <div className="score-bar">
        <span>price {offer.scoreBreakdown.price}</span>
        <span>convenience {offer.scoreBreakdown.convenience}</span>
        <span>quality {offer.scoreBreakdown.quality}</span>
      </div>

      <label className="select-row">
        <input
          type="checkbox"
          checked={selected}
          disabled={!selected && selectionDisabled}
          onChange={() => onToggleSelect(offer.id)}
        />
        <span>{selected ? "In comparison" : "Add to compare"}</span>
      </label>
    </article>
  );
}
