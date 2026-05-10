import { SearchForm } from "@/components/SearchForm";

export default function Home() {
  return (
    <div>
      <h1>An AI-assisted hotel decision experience</h1>
      <p className="subtitle">
        Compare hotel offers across Booking, Agoda, Expedia and Trip.com — with travel-mode
        scoring, a price-confidence read on every offer, a split list / map view, head-to-head
        battle mode, and shareable comparison links. This is a comparison tool: it does not
        book hotels, take payment, or collect guest details.
      </p>
      <SearchForm />
      <h2>What you get</h2>
      <ul className="feature-list">
        <li><strong>Smart summary in natural language</strong> — a rule-based assistant that explains the picks.</li>
        <li><strong>Travel intent modes</strong> — Family, Couple, Budget, Luxury reweight the scoring instantly.</li>
        <li><strong>Price confidence</strong> — last-checked timestamp, recent trend, and a &quot;good deal&quot; flag.</li>
        <li><strong>Split list + map experience</strong> — a schematic map shows where each hotel sits relative to the city centre.</li>
        <li><strong>Hotel battle mode</strong> — pick exactly two hotels for a head-to-head, category-by-category fight.</li>
        <li><strong>Shareable comparison links</strong> — your selection and travel mode live in the URL.</li>
        <li>Multi-platform price, cancellation, breakfast, distance and rating comparison.</li>
        <li>Tags like <em>Cheapest</em>, <em>Best Value</em>, <em>Highest Rated</em>, <em>Near Metro</em>.</li>
        <li>Outbound &quot;View Source&quot; links so you verify and decide on the original platform.</li>
      </ul>
      <h2>How it works</h2>
      <ul className="feature-list muted">
        <li>Each booking platform has a <code>HotelConnector</code> in <code>src/lib/connectors/</code>.</li>
        <li>Without API credentials, connectors return realistic mock offers so the UI is usable offline.</li>
        <li>Add real keys in <code>.env.local</code> (see <code>.env.example</code>) to switch to live data per platform.</li>
      </ul>
    </div>
  );
}
