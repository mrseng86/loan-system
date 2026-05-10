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

function yesNo(v: boolean | undefined): string {
  if (v === true) return "Yes";
  if (v === false) return "No";
  return "—";
}

function km(v: number | undefined): string {
  return v == null ? "—" : `${v.toFixed(1)} km`;
}

interface Props {
  offers: ScoredOffer[];
  onRemove: (id: string) => void;
}

/**
 * Side-by-side comparison table for the hotels the user picked.
 * Read-only — no booking action lives here.
 */
export function ComparisonTable({ offers, onRemove }: Props) {
  if (offers.length === 0) {
    return (
      <p className="muted">
        Pick up to 4 hotels using the &quot;Add to compare&quot; checkbox below to see them
        side by side here.
      </p>
    );
  }

  const cheapest = Math.min(...offers.map((o) => o.totalPrice.amount));
  const bestRated = Math.max(...offers.map((o) => o.reviewScore ?? -Infinity));
  const bestScore = Math.max(...offers.map((o) => o.score));

  return (
    <div className="compare-wrapper">
      <table className="compare">
        <thead>
          <tr>
            <th>Attribute</th>
            {offers.map((o) => (
              <th key={o.id}>
                <div className="compare-head">
                  <span className="platform">{PLATFORM_LABEL[o.platform] ?? o.platform}</span>
                  <strong>{o.hotelName}</strong>
                  <button className="link-button" onClick={() => onRemove(o.id)}>
                    Remove
                  </button>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            <th>Total price</th>
            {offers.map((o) => (
              <td key={o.id} className={o.totalPrice.amount === cheapest ? "winner" : undefined}>
                {fmtMoney(o.totalPrice.amount, o.totalPrice.currency)}
              </td>
            ))}
          </tr>
          <tr>
            <th>Per night</th>
            {offers.map((o) => (
              <td key={o.id}>
                {o.perNightPrice
                  ? fmtMoney(o.perNightPrice.amount, o.perNightPrice.currency)
                  : "—"}
              </td>
            ))}
          </tr>
          <tr>
            <th>Combined score</th>
            {offers.map((o) => (
              <td key={o.id} className={o.score === bestScore ? "winner" : undefined}>
                {o.score} / 100
              </td>
            ))}
          </tr>
          <tr>
            <th>Star rating</th>
            {offers.map((o) => (
              <td key={o.id}>{o.starRating != null ? "★".repeat(o.starRating) : "—"}</td>
            ))}
          </tr>
          <tr>
            <th>Review score</th>
            {offers.map((o) => (
              <td
                key={o.id}
                className={o.reviewScore === bestRated && bestRated !== -Infinity ? "winner" : undefined}
              >
                {o.reviewScore != null
                  ? `${o.reviewScore.toFixed(1)} / 10 (${o.reviewCount ?? 0})`
                  : "—"}
              </td>
            ))}
          </tr>
          <tr>
            <th>City centre</th>
            {offers.map((o) => (
              <td key={o.id}>{km(o.distanceKm)}</td>
            ))}
          </tr>
          <tr>
            <th>Nearest metro</th>
            {offers.map((o) => (
              <td key={o.id}>{km(o.metroDistanceKm)}</td>
            ))}
          </tr>
          <tr>
            <th>Landmark</th>
            {offers.map((o) => (
              <td key={o.id}>
                {o.nearestLandmark ? `${o.nearestLandmark} (${km(o.landmarkDistanceKm)})` : "—"}
              </td>
            ))}
          </tr>
          <tr>
            <th>Cancellation</th>
            {offers.map((o) => (
              <td key={o.id}>{o.cancellationPolicy ?? yesNo(o.freeCancellation)}</td>
            ))}
          </tr>
          <tr>
            <th>Breakfast</th>
            {offers.map((o) => (
              <td key={o.id}>{yesNo(o.breakfastIncluded)}</td>
            ))}
          </tr>
          <tr>
            <th>Family-friendly</th>
            {offers.map((o) => (
              <td key={o.id}>{yesNo(o.familyFriendly)}</td>
            ))}
          </tr>
          <tr>
            <th>Source</th>
            {offers.map((o) => (
              <td key={o.id}>
                <a href={o.sourceUrl} target="_blank" rel="noreferrer noopener">
                  Check Source ↗
                </a>
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}
