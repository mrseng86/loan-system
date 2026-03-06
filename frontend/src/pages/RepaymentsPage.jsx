import { useEffect, useState } from "react";
import api from "../api/client";

const initialForm = {
  loan_id: "",
  amount: "",
  method: "cash",
  note: "",
};

function RepaymentsPage() {
  const [repayments, setRepayments] = useState([]);
  const [loans, setLoans] = useState([]);
  const [form, setForm] = useState(initialForm);

  const loadData = async () => {
    const [repaymentsRes, loansRes] = await Promise.all([
      api.get("/repayments"),
      api.get("/loans"),
    ]);
    setRepayments(repaymentsRes.data);
    setLoans(loansRes.data);
  };

  useEffect(() => {
    loadData();
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    await api.post("/repayments", {
      loan_id: Number(form.loan_id),
      amount: Number(form.amount),
      method: form.method,
      note: form.note || null,
    });
    setForm(initialForm);
    loadData();
  };

  return (
    <div className="grid page-grid">
      <form className="card" onSubmit={onSubmit}>
        <h3>Record Repayment</h3>
        <select value={form.loan_id} onChange={(e) => setForm({ ...form, loan_id: e.target.value })} required>
          <option value="">Select loan</option>
          {loans.map((l) => (
            <option key={l.id} value={l.id}>Loan #{l.id} - Balance {l.current_balance}</option>
          ))}
        </select>
        <input type="number" step="0.01" placeholder="Amount" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required />
        <input placeholder="Method (cash/bank/etc)" value={form.method} onChange={(e) => setForm({ ...form, method: e.target.value })} required />
        <input placeholder="Note" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
        <button className="btn" type="submit">Save Repayment</button>
      </form>

      <div className="card">
        <h3>Repayment History</h3>
        <table>
          <thead>
            <tr><th>ID</th><th>Loan</th><th>Amount</th><th>Method</th><th>Date</th></tr>
          </thead>
          <tbody>
            {repayments.map((r) => (
              <tr key={r.id}>
                <td>{r.id}</td>
                <td>{r.loan_id}</td>
                <td>{r.amount}</td>
                <td>{r.method}</td>
                <td>{new Date(r.paid_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default RepaymentsPage;
