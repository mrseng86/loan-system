import { SearchForm } from "@/components/SearchForm";

export default function Home() {
  return (
    <div>
      <h1>Compare hotels before you decide</h1>
      <p className="subtitle">
        Side-by-side price, location, cancellation, breakfast and rating comparison
        across Booking, Agoda, Expedia and Trip.com — plus social mentions from
        YouTube, Reddit, X, 小红书 and TripAdvisor. This is a comparison tool: it
        does not book hotels, take payment, or collect guest details.
      </p>
      <SearchForm />
      <h2>What you get</h2>
      <ul className="feature-list">
        <li>Multi-platform price comparison (total and per-night).</li>
        <li>Cancellation policy comparison side by side.</li>
        <li>Breakfast included &amp; family-friendly indicators.</li>
        <li>Distance to city centre, metro, and a nearby landmark.</li>
        <li>Rating &amp; review count comparison from each platform.</li>
        <li>Tags like <em>Cheapest</em>, <em>Best Value</em>, <em>Highest Rated</em>, <em>Near Metro</em>.</li>
        <li>A rule-based smart summary that highlights the best fit per use case.</li>
        <li>Outbound &quot;View Source&quot; links so you can verify and decide on the original platform.</li>
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
