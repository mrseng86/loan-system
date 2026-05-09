import { SearchForm } from "@/components/SearchForm";

export default function Home() {
  return (
    <div>
      <h1>Compare hotels across platforms</h1>
      <p className="subtitle">
        Pulls live prices from Booking, Agoda, Expedia and Trip.com, then ranks each option by a
        combined price + convenience + quality score. Social reviews from YouTube, Reddit, X,
        小红书 and TripAdvisor are aggregated alongside.
      </p>
      <SearchForm />
      <h2>How it works</h2>
      <ul style={{ color: "var(--muted)", lineHeight: 1.7 }}>
        <li>Each booking platform has a <code>HotelConnector</code> in <code>src/lib/connectors/</code>.</li>
        <li>Without API credentials, connectors return realistic mock offers so the UI is usable.</li>
        <li>
          Add real keys in <code>.env.local</code> (see <code>.env.example</code>) to switch to live
          data per platform.
        </li>
      </ul>
    </div>
  );
}
