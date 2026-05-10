import type { ScoredOffer } from "@/lib/score";
import type { Tag } from "@/lib/tags";
import type { PriceConfidence } from "@/lib/connectors/types";

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

function relativeTime(iso: string): string {
  const diffMs = Date.now() - Date.parse(iso);
  if (!Number.isFinite(diffMs)) return "recently";
  const mins = Math.round(diffMs / 60_000);
  if (mins < 60) return `${Math.max(1, mins)} min ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} h ago`;
  const days = Math.round(hours / 24);
  return `${days} d ago`;
}

function trendArrow(p: PriceConfidence): string {
  if (p.trend === "down") return "▼";
  if (p.trend === "up") return "▲";
  return "■";
}

interface Props {
  offer: ScoredOffer;
  tags: Tag[];
  selected: boolean;
  highlighted?: boolean;
  onToggleSelect: (id: string) => void;
  onHover?: (id: string | null) => void;
  selectionDisabled: boolean;
}

export function HotelCard({
  offer,
  tags,
  selected,
  highlighted,
  onToggleSelect,
  onHover,
  selectionDisabled,
}: Props) {
  const pc = offer.priceConfidence;
  return (
    <article
      className={[
        "card",
        selected ? "card--selected" : "",
        highlighted ? "card--highlighted" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      onMouseEnter={() => onHover?.(offer.id)}
      onMouseLeave={() => onHover?.(null)}
    >
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

      {pc && (
        <div className="confidence">
          {pc.goodDeal && <span className="badge tag tag--good">Good deal</span>}
          <span className={`badge confidence-trend confidence-trend--${pc.trend}`}>
            {trendArrow(pc)} {pc.trend === "stable" ? "stable" : `${pc.trendPercent}% ${pc.trend}`}
          </span>
          <span className="confidence-meta">checked {relativeTime(pc.lastCheckedAt)}</span>
          {pc.averagePrice != null && (
            <span className="confidence-meta">
              avg {fmtMoney(pc.averagePrice, offer.totalPrice.currency)}
            </span>
          )}
        </div>
      )}

      <div className="score-bar">
        <span>price {offer.scoreBreakdown.price}</span>
        <span>conv {offer.scoreBreakdown.convenience}</span>
        <span>quality {offer.scoreBreakdown.quality}</span>
        {offer.scoreBreakdown.bonus !== 0 && <span>bonus {offer.scoreBreakdown.bonus > 0 ? "+" : ""}{offer.scoreBreakdown.bonus}</span>}
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
