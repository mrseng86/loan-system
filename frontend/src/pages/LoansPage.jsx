import { useEffect, useState } from "react";
import api from "../api/client";

const initialForm = {
  customer_id: "",
  loan_amount: "",
  interest_rate: "",
  tenure_months: "",
  disbursed_at: "",
};

function LoansPage() {
  const [customers, setCustomers] = useState([]);
  const [loans, setLoans] = useState([]);
  const [form, setForm] = useState(initialForm);

  const loadData = async () => {
    const [customersRes, loansRes] = await Promise.all([
      api.get("/customers"),
      api.get("/loans"),
    ]);
    setCustomers(customersRes.data);
    setLoans(loansRes.data);
  };

  useEffect(() => {
    loadData();
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    await api.post("/loans", {
      customer_id: Number(form.customer_id),
      loan_amount: Number(form.loan_amount),
      interest_rate: Number(form.interest_rate),
      tenure_months: Number(form.tenure_months),
      disbursed_at: form.disbursed_at,
    });
    setForm(initialForm);
    loadData();
  };

  return (
    <div className="grid page-grid">
      <form className="card" onSubmit={onSubmit}>
        <h3>Create Loan Account</h3>
        <select value={form.customer_id} onChange={(e) => setForm({ ...form, customer_id: e.target.value })} required>
          <option value="">Select customer</option>
          {customers.map((c) => (
            <option key={c.id} value={c.id}>{c.full_name}</option>
          ))}
        </select>
        <input type="number" step="0.01" placeholder="Loan amount" value={form.loan_amount} onChange={(e) => setForm({ ...form, loan_amount: e.target.value })} required />
        <input type="number" step="0.01" placeholder="Interest %" value={form.interest_rate} onChange={(e) => setForm({ ...form, interest_rate: e.target.value })} required />
        <input type="number" placeholder="Tenure (months)" value={form.tenure_months} onChange={(e) => setForm({ ...form, tenure_months: e.target.value })} required />
        <input type="date" value={form.disbursed_at} onChange={(e) => setForm({ ...form, disbursed_at: e.target.value })} required />
        <button className="btn" type="submit">Create Loan</button>
      </form>

      <div className="card">
        <h3>Loan Accounts</h3>
        <table>
          <thead>
            <tr><th>ID</th><th>Customer ID</th><th>Amount</th><th>Installment</th><th>Balance</th><th>Status</th><th>Overdue Days</th></tr>
          </thead>
          <tbody>
            {loans.map((l) => (
              <tr key={l.id}>
                <td>{l.id}</td>
                <td>{l.customer_id}</td>
                <td>{l.loan_amount}</td>
                <td>{l.installment_amount}</td>
                <td>{l.current_balance}</td>
                <td>{l.status}</td>
                <td>{l.days_overdue}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default LoansPage;
