import { useEffect, useState } from "react";
import api from "../api/client";

const initialForm = {
  loan_id: "",
  action_type: "call",
  notes: "",
};

function CollectionsPage() {
  const [actions, setActions] = useState([]);
  const [loans, setLoans] = useState([]);
  const [form, setForm] = useState(initialForm);

  const loadData = async () => {
    const [actionsRes, loansRes] = await Promise.all([
      api.get("/collections"),
      api.get("/loans"),
    ]);
    setActions(actionsRes.data);
    setLoans(loansRes.data.filter((loan) => loan.status === "overdue" || loan.status === "bad_debt"));
  };

  useEffect(() => {
    loadData();
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    await api.post("/collections", {
      loan_id: Number(form.loan_id),
      action_type: form.action_type,
      notes: form.notes || null,
    });
    setForm(initialForm);
    loadData();
  };

  return (
    <div className="grid page-grid">
      <form className="card" onSubmit={onSubmit}>
        <h3>Collection Tracking</h3>
        <select value={form.loan_id} onChange={(e) => setForm({ ...form, loan_id: e.target.value })} required>
          <option value="">Select overdue loan</option>
          {loans.map((l) => (
            <option key={l.id} value={l.id}>Loan #{l.id} - {l.status} ({l.days_overdue} days)</option>
          ))}
        </select>
        <select value={form.action_type} onChange={(e) => setForm({ ...form, action_type: e.target.value })}>
          <option value="call">Call</option>
          <option value="whatsapp">WhatsApp</option>
          <option value="visit">Visit</option>
          <option value="legal_notice">Legal Notice</option>
        </select>
        <input placeholder="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
        <button className="btn" type="submit">Log Action</button>
      </form>

      <div className="card">
        <h3>Collection Logs</h3>
        <table>
          <thead>
            <tr><th>ID</th><th>Loan</th><th>Action</th><th>Notes</th><th>Date</th></tr>
          </thead>
          <tbody>
            {actions.map((a) => (
              <tr key={a.id}>
                <td>{a.id}</td>
                <td>{a.loan_id}</td>
                <td>{a.action_type}</td>
                <td>{a.notes || "-"}</td>
                <td>{new Date(a.action_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default CollectionsPage;
