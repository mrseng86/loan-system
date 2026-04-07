import { useEffect, useState } from "react";
import api from "../api/client";

const initialForm = {
  customer_id: "",
  loan_amount: "",
  interest_rate: "",
  monthly_interest_rate: "",
  service_charge_rate: "",
  stamp_duty_rate: "",
  tenure_months: "",
  installment_amount: "",
  disbursed_at: "",
};

function LoansPage() {
  const [customers, setCustomers] = useState([]);
  const [loans, setLoans] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [schedule, setSchedule] = useState(null);

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
      monthly_interest_rate: form.monthly_interest_rate ? Number(form.monthly_interest_rate) : null,
      service_charge_rate: form.service_charge_rate ? Number(form.service_charge_rate) : 0,
      stamp_duty_rate: form.stamp_duty_rate ? Number(form.stamp_duty_rate) : 0,
      tenure_months: Number(form.tenure_months),
      installment_amount: form.installment_amount ? Number(form.installment_amount) : null,
      disbursed_at: form.disbursed_at,
    });
    setForm(initialForm);
    loadData();
  };

  const viewSchedule = async (loanId) => {
    const { data } = await api.get(`/loans/${loanId}/schedule`);
    setSchedule(data);
  };

  return (
    <div className="grid page-grid">
      <form className="card" onSubmit={onSubmit}>
        <h3>Create Loan (Schedule Mode)</h3>
        <p className="muted">Formula: amount + one-time charges, flat monthly interest, monthly payment rounds up to next 10, then add fixed 10 every month.</p>
        <select value={form.customer_id} onChange={(e) => setForm({ ...form, customer_id: e.target.value })} required>
          <option value="">Select customer</option>
          {customers.map((c) => (
            <option key={c.id} value={c.id}>{c.full_name}</option>
          ))}
        </select>
        <input type="number" step="0.01" placeholder="Loan amount" value={form.loan_amount} onChange={(e) => setForm({ ...form, loan_amount: e.target.value })} required />
        <input type="number" step="0.01" placeholder="Total interest % (optional)" value={form.interest_rate} onChange={(e) => setForm({ ...form, interest_rate: e.target.value })} />
        <input type="number" step="0.0001" placeholder="Monthly interest % (example: 3)" value={form.monthly_interest_rate} onChange={(e) => setForm({ ...form, monthly_interest_rate: e.target.value })} />
        <input type="number" step="0.0001" placeholder="Service charge % (one-time)" value={form.service_charge_rate} onChange={(e) => setForm({ ...form, service_charge_rate: e.target.value })} />
        <input type="number" step="0.0001" placeholder="Stamp duty % (one-time)" value={form.stamp_duty_rate} onChange={(e) => setForm({ ...form, stamp_duty_rate: e.target.value })} />
        <input type="number" placeholder="Tenure (months)" value={form.tenure_months} onChange={(e) => setForm({ ...form, tenure_months: e.target.value })} required />
        <input type="number" step="0.01" placeholder="Monthly payment (optional override)" value={form.installment_amount} onChange={(e) => setForm({ ...form, installment_amount: e.target.value })} />
        <input type="date" value={form.disbursed_at} onChange={(e) => setForm({ ...form, disbursed_at: e.target.value })} required />
        <button className="btn" type="submit">Create Loan</button>
      </form>

      <div className="card">
        <h3>Loan Accounts</h3>
        <table>
          <thead>
            <tr><th>ID</th><th>Customer ID</th><th>Amount</th><th>Installment</th><th>Balance</th><th>Status</th><th>Overdue</th><th>Action</th></tr>
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
                <td><button className="btn small" onClick={() => viewSchedule(l.id)}>Schedule</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {schedule && (
        <div className="card" style={{ gridColumn: "1 / -1", overflowX: "auto" }}>
          <h3>Loan Schedule #{schedule.loan_id}</h3>
          <p>
            Loan Date: {schedule.loan_date} | Tenure: {schedule.tenure_months} months |
            Payment: {schedule.installment_amount} | Monthly Interest: {schedule.monthly_interest_rate}% |
            Service: {schedule.service_charge_rate}% | Stamp: {schedule.stamp_duty_rate}%
          </p>
          <p>
            Periods Paid: {schedule.periods_paid} | Periods Remaining: {schedule.periods_remaining}
          </p>
          <table>
            <thead>
              <tr>
                <th>Period</th><th>Month</th><th>Payment Date</th><th>Opening</th><th>Principal</th>
                <th>Interest</th><th>Service</th><th>Stamp</th><th>Total Payment</th><th>Paid Amount</th>
                <th>Actual Paid Date</th><th>Status</th><th>Closing</th><th>Cumulative Interest</th>
              </tr>
            </thead>
            <tbody>
              {schedule.rows.map((r) => (
                <tr key={r.period}>
                  <td>{r.period}</td>
                  <td>{r.month}</td>
                  <td>{r.payment_date}</td>
                  <td>{r.opening_balance}</td>
                  <td>{r.principal_paid}</td>
                  <td>{r.interest_paid}</td>
                  <td>{r.service_charge}</td>
                  <td>{r.stamp_duty}</td>
                  <td>{r.total_payment}</td>
                  <td>{r.paid_amount}</td>
                  <td>{r.actual_payment_date || "-"}</td>
                  <td>{r.installment_status}</td>
                  <td>{r.closing_balance}</td>
                  <td>{r.cumulative_interest}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default LoansPage;
