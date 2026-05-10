import type { ScoredOffer } from "@/lib/score";
import type { Recommendation } from "@/lib/recommendation";

interface Props {
  recommendation: Recommendation;
  offers: ScoredOffer[];
}

export function RecommendationSummary({ recommendation, offers }: Props) {
  const byId = new Map(offers.map((o) => [o.id, o]));
  return (
    <section className="reco">
      <div className="reco-tag">Smart summary · rule-based</div>
      <h3>{recommendation.headline}</h3>
      <p className="reco-prose">{recommendation.summary}</p>
      <ul className="reco-picks">
        {recommendation.picks.map((p) => {
          const offer = byId.get(p.offerId);
          return (
            <li key={p.label}>
              <span className="reco-pick-label">{p.label}</span>
              <span className="reco-pick-name">{offer?.hotelName ?? "—"}</span>
              <span className="reco-pick-reason">{p.reason}</span>
            </li>
          );
        })}
      </ul>
      <p className="reco-disclaimer">
        Heuristic summary — this app does not book or charge anything. Always verify
        details on the original platform before deciding.
      </p>
    </section>
  );
}
