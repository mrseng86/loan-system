import { useEffect, useState } from "react";
import api from "../api/client";

function DashboardPage() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get("/dashboard/stats").then(({ data }) => setStats(data));
  }, []);

  if (!stats) return <p>Loading dashboard...</p>;

  return (
    <div className="grid stats-grid">
      <div className="card stat"><h3>Total Loans</h3><p>{stats.total_loans}</p></div>
      <div className="card stat"><h3>Overdue Loans</h3><p>{stats.overdue_loans}</p></div>
      <div className="card stat"><h3>Bad Debt</h3><p>{stats.bad_debt_loans}</p></div>
      <div className="card stat"><h3>Total Disbursed</h3><p>{stats.total_disbursed}</p></div>
      <div className="card stat"><h3>Total Repaid</h3><p>{stats.total_repaid}</p></div>
      <div className="card stat"><h3>Repayment Rate</h3><p>{stats.repayment_rate_percent}%</p></div>
    </div>
  );
}

export default DashboardPage;
