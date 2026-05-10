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

type Cmp = "lower-is-better" | "higher-is-better";

interface Round {
  label: string;
  a: { display: string; value: number | null };
  b: { display: string; value: number | null };
  cmp: Cmp;
}

function pickWinner(round: Round): "a" | "b" | "tie" {
  const { a, b, cmp } = round;
  if (a.value == null && b.value == null) return "tie";
  if (a.value == null) return "b";
  if (b.value == null) return "a";
  if (a.value === b.value) return "tie";
  if (cmp === "lower-is-better") return a.value < b.value ? "a" : "b";
  return a.value > b.value ? "a" : "b";
}

interface Props {
  a: ScoredOffer;
  b: ScoredOffer;
  onClose: () => void;
}

export function BattleView({ a, b, onClose }: Props) {
  const rounds: Round[] = [
    {
      label: "Total price",
      a: { display: fmtMoney(a.totalPrice.amount, a.totalPrice.currency), value: a.totalPrice.amount },
      b: { display: fmtMoney(b.totalPrice.amount, b.totalPrice.currency), value: b.totalPrice.amount },
      cmp: "lower-is-better",
    },
    {
      label: "Per night",
      a: {
        display: a.perNightPrice ? fmtMoney(a.perNightPrice.amount, a.perNightPrice.currency) : "—",
        value: a.perNightPrice?.amount ?? null,
      },
      b: {
        display: b.perNightPrice ? fmtMoney(b.perNightPrice.amount, b.perNightPrice.currency) : "—",
        value: b.perNightPrice?.amount ?? null,
      },
      cmp: "lower-is-better",
    },
    {
      label: "Combined score",
      a: { display: `${a.score} / 100`, value: a.score },
      b: { display: `${b.score} / 100`, value: b.score },
      cmp: "higher-is-better",
    },
    {
      label: "Star rating",
      a: { display: a.starRating ? "★".repeat(a.starRating) : "—", value: a.starRating ?? null },
      b: { display: b.starRating ? "★".repeat(b.starRating) : "—", value: b.starRating ?? null },
      cmp: "higher-is-better",
    },
    {
      label: "Review score",
      a: {
        display: a.reviewScore != null ? `${a.reviewScore.toFixed(1)} / 10` : "—",
        value: a.reviewScore ?? null,
      },
      b: {
        display: b.reviewScore != null ? `${b.reviewScore.toFixed(1)} / 10` : "—",
        value: b.reviewScore ?? null,
      },
      cmp: "higher-is-better",
    },
    {
      label: "Walk to centre",
      a: { display: a.distanceKm != null ? `${a.distanceKm.toFixed(1)} km` : "—", value: a.distanceKm ?? null },
      b: { display: b.distanceKm != null ? `${b.distanceKm.toFixed(1)} km` : "—", value: b.distanceKm ?? null },
      cmp: "lower-is-better",
    },
    {
      label: "Walk to metro",
      a: {
        display: a.metroDistanceKm != null ? `${a.metroDistanceKm.toFixed(1)} km` : "—",
        value: a.metroDistanceKm ?? null,
      },
      b: {
        display: b.metroDistanceKm != null ? `${b.metroDistanceKm.toFixed(1)} km` : "—",
        value: b.metroDistanceKm ?? null,
      },
      cmp: "lower-is-better",
    },
    {
      label: "Free cancellation",
      a: { display: a.freeCancellation ? "Yes" : "No", value: a.freeCancellation ? 1 : 0 },
      b: { display: b.freeCancellation ? "Yes" : "No", value: b.freeCancellation ? 1 : 0 },
      cmp: "higher-is-better",
    },
    {
      label: "Breakfast",
      a: { display: a.breakfastIncluded ? "Yes" : "No", value: a.breakfastIncluded ? 1 : 0 },
      b: { display: b.breakfastIncluded ? "Yes" : "No", value: b.breakfastIncluded ? 1 : 0 },
      cmp: "higher-is-better",
    },
    {
      label: "Family-friendly",
      a: { display: a.familyFriendly ? "Yes" : "No", value: a.familyFriendly ? 1 : 0 },
      b: { display: b.familyFriendly ? "Yes" : "No", value: b.familyFriendly ? 1 : 0 },
      cmp: "higher-is-better",
    },
  ];

  const wins = { a: 0, b: 0, tie: 0 };
  const winners = rounds.map((r) => {
    const w = pickWinner(r);
    wins[w]++;
    return w;
  });

  const overall = wins.a > wins.b ? "a" : wins.b > wins.a ? "b" : "tie";
  const overallText =
    overall === "tie"
      ? `It's a tie — ${wins.a} categories each.`
      : `${overall === "a" ? a.hotelName : b.hotelName} wins ${overall === "a" ? wins.a : wins.b} of ${rounds.length} categories.`;

  return (
    <section className="battle">
      <div className="battle-head">
        <span className="reco-tag">Hotel battle · head-to-head</span>
        <button type="button" className="link-button" onClick={onClose}>
          Close battle
        </button>
      </div>
      <div className="battle-grid">
        <div className={`battle-card${overall === "a" ? " battle-card--winner" : ""}`}>
          <span className="platform">{PLATFORM_LABEL[a.platform] ?? a.platform}</span>
          <h3>{a.hotelName}</h3>
          <p className="muted">Wins {wins.a} categor{wins.a === 1 ? "y" : "ies"}</p>
          <a className="link-source" href={a.sourceUrl} target="_blank" rel="noreferrer noopener">
            View Source ↗
          </a>
        </div>
        <div className="battle-vs">VS</div>
        <div className={`battle-card${overall === "b" ? " battle-card--winner" : ""}`}>
          <span className="platform">{PLATFORM_LABEL[b.platform] ?? b.platform}</span>
          <h3>{b.hotelName}</h3>
          <p className="muted">Wins {wins.b} categor{wins.b === 1 ? "y" : "ies"}</p>
          <a className="link-source" href={b.sourceUrl} target="_blank" rel="noreferrer noopener">
            View Source ↗
          </a>
        </div>
      </div>

      <p className="battle-verdict">{overallText}</p>

      <ul className="battle-rounds">
        {rounds.map((r, i) => (
          <li key={r.label} className="battle-round">
            <span className="battle-round-label">{r.label}</span>
            <span className={`battle-round-cell${winners[i] === "a" ? " winner" : ""}`}>
              {r.a.display}
            </span>
            <span className="battle-round-vs">vs</span>
            <span className={`battle-round-cell${winners[i] === "b" ? " winner" : ""}`}>
              {r.b.display}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
