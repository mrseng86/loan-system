import { useEffect, useState } from "react";
import api from "../api/client";

const initialForm = {
  customer_id: "",
  loan_amount: "",
  interest_rate: "",
  monthly_interest_rate: "",
  combined_charge_rate: "",
  tenure_months: "",
  installment_amount: "",
  disbursed_at: "",
};

const initialShortTermForm = {
  customer_id: "",
  principal_amount: "",
  interest_rate: "",
  disbursed_at: "",
  due_date: "",
  note: "",
};

const isClosedShortTermLoan = (loan) =>
  Number(loan?.current_balance ?? 0) <= 0 || loan?.status === "settled";

const getShortTermStatusLabel = (loan) => (isClosedShortTermLoan(loan) ? "closed" : loan.status);

const getShortTermStatusStyle = (loan) => {
  const status = getShortTermStatusLabel(loan);

  if (status === "overdue") {
    return {
      color: "#991b1b",
      backgroundColor: "#fee2e2",
      fontWeight: 700,
      padding: "0.2rem 0.5rem",
      borderRadius: "999px",
      display: "inline-block",
      textTransform: "capitalize",
    };
  }

  if (status === "active") {
    return {
      color: "#166534",
      backgroundColor: "#dcfce7",
      fontWeight: 700,
      padding: "0.2rem 0.5rem",
      borderRadius: "999px",
      display: "inline-block",
      textTransform: "capitalize",
    };
  }

  return {
    color: "#475569",
    backgroundColor: "#e2e8f0",
    fontWeight: 700,
    padding: "0.2rem 0.5rem",
    borderRadius: "999px",
    display: "inline-block",
    textTransform: "capitalize",
  };
};

function LoansPage() {
  const [customers, setCustomers] = useState([]);
  const [loans, setLoans] = useState([]);
  const [shortTermLoans, setShortTermLoans] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [shortTermForm, setShortTermForm] = useState(initialShortTermForm);
  const [schedule, setSchedule] = useState(null);
  const [loanSearchTerm, setLoanSearchTerm] = useState("");
  const [scheduleSearchTerm, setScheduleSearchTerm] = useState("");
  const [shortTermMessage, setShortTermMessage] = useState("");
  const [shortTermError, setShortTermError] = useState("");
  const [loanError, setLoanError] = useState("");
  const [scheduleError, setScheduleError] = useState("");
  const [showClosedShortTerm, setShowClosedShortTerm] = useState(false);
  const [showClosedLoans, setShowClosedLoans] = useState(false);

  const loadData = async () => {
    setLoanError("");
    const results = await Promise.allSettled([
      api.get("/customers"),
      api.get("/loans"),
      api.get("/short-term-loans"),
    ]);

    if (results[0].status === "fulfilled") {
      setCustomers(results[0].value.data);
    } else {
      setCustomers([]);
      setLoanError(results[0].reason?.response?.data?.detail || "Unable to load customers.");
    }

    if (results[1].status === "fulfilled") {
      setLoans(results[1].value.data);
    } else {
      setLoans([]);
      setLoanError(results[1].reason?.response?.data?.detail || "Unable to load loans.");
    }

    if (results[2].status === "fulfilled") {
      setShortTermLoans(results[2].value.data);
    } else {
      setShortTermLoans([]);
    }
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
      service_charge_rate: form.combined_charge_rate ? Number(form.combined_charge_rate) : 0,
      stamp_duty_rate: 0,
      tenure_months: Number(form.tenure_months),
      installment_amount: form.installment_amount ? Number(form.installment_amount) : null,
      disbursed_at: form.disbursed_at,
    });
    setForm(initialForm);
    loadData();
  };

  const viewSchedule = async (loanId) => {
    setScheduleError("");
    try {
      const { data } = await api.get(`/loans/${loanId}/schedule`);
      setSchedule(data);
      setScheduleSearchTerm("");
      setShowClosedShortTerm(false);
    } catch (error) {
      setSchedule(null);
      setScheduleError(error.response?.data?.detail || "Unable to open this schedule.");
    }
  };

  const onShortTermSubmit = async (e) => {
    e.preventDefault();
    setShortTermMessage("");
    setShortTermError("");

    try {
      await api.post("/short-term-loans", {
        customer_id: Number(shortTermForm.customer_id),
        principal_amount: Number(shortTermForm.principal_amount),
        interest_rate: Number(shortTermForm.interest_rate),
        disbursed_at: shortTermForm.disbursed_at,
        due_date: shortTermForm.due_date,
        note: shortTermForm.note.trim() || null,
      });
      setShortTermForm(initialShortTermForm);
      setShortTermMessage("Short-term borrowing created.");
      await loadData();
    } catch (error) {
      setShortTermError(error.response?.data?.detail || "Unable to save short-term borrowing.");
    }
  };

  const normalizedLoanSearch = loanSearchTerm.trim().toLowerCase();
  const filteredLoans = loans.filter((loan) => {
    if (!showClosedLoans && loan.status === "closed") {
      return false;
    }

    if (!normalizedLoanSearch) {
      return true;
    }

    const customerName = customers.find((customer) => customer.id === loan.customer_id)?.full_name || "";

    return [
      loan.id,
      customerName,
      loan.status,
      loan.loan_amount,
      loan.installment_amount,
      loan.current_balance,
    ]
      .filter((value) => value !== null && value !== undefined)
      .some((value) => String(value).toLowerCase().includes(normalizedLoanSearch));
  });

  const normalizedScheduleSearch = scheduleSearchTerm.trim().toLowerCase();
  const filteredScheduleRows = schedule
    ? schedule.rows.filter((row) => {
        if (!normalizedScheduleSearch) {
          return true;
        }

        return [
          row.period,
          row.month,
          row.payment_date,
          row.actual_payment_date,
          row.installment_status,
        ]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(normalizedScheduleSearch));
      })
    : [];
  const openShortTermLoans = schedule
    ? shortTermLoans.filter(
        (loan) =>
          loan.customer_id === schedule.customer_id &&
          !isClosedShortTermLoan(loan)
      )
    : [];
  const closedShortTermLoans = schedule
    ? shortTermLoans.filter(
        (loan) =>
          loan.customer_id === schedule.customer_id &&
          isClosedShortTermLoan(loan)
      )
    : [];

  return (
    <div className="grid page-grid">
      <div className="grid">
        <form className="card" onSubmit={onSubmit}>
          <h3>Create Loan (Schedule Mode)</h3>
          <p className="muted">Formula: principal + one-time fee %, then monthly interest, divide by tenure, add fixed 10, then round up to nearest 10.</p>
          <select value={form.customer_id} onChange={(e) => setForm({ ...form, customer_id: e.target.value })} required>
            <option value="">Select customer</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>{c.full_name}</option>
            ))}
          </select>
          <input type="number" step="0.01" placeholder="Loan amount" value={form.loan_amount} onChange={(e) => setForm({ ...form, loan_amount: e.target.value })} required />
          <input type="number" step="0.01" placeholder="Total interest % (optional)" value={form.interest_rate} onChange={(e) => setForm({ ...form, interest_rate: e.target.value })} />
          <input type="number" step="0.0001" placeholder="Monthly interest % (example: 3)" value={form.monthly_interest_rate} onChange={(e) => setForm({ ...form, monthly_interest_rate: e.target.value })} />
          <input type="number" step="0.0001" placeholder="One-time fee % (service + stamping)" value={form.combined_charge_rate} onChange={(e) => setForm({ ...form, combined_charge_rate: e.target.value })} />
          <input type="number" placeholder="Tenure (months)" value={form.tenure_months} onChange={(e) => setForm({ ...form, tenure_months: e.target.value })} required />
          <input type="number" step="0.01" placeholder="Monthly payment (optional override)" value={form.installment_amount} onChange={(e) => setForm({ ...form, installment_amount: e.target.value })} />
          <input type="date" value={form.disbursed_at} onChange={(e) => setForm({ ...form, disbursed_at: e.target.value })} required />
          <button className="btn" type="submit">Create Loan</button>
        </form>

        <form className="card" onSubmit={onShortTermSubmit}>
          <h3>Create Short-Term Borrowing</h3>
          <p className="muted">No fee. Interest is charged once. Customer can later pay interest only or principal separately.</p>
          {shortTermMessage ? <p className="muted">{shortTermMessage}</p> : null}
          {shortTermError ? <p className="error">{shortTermError}</p> : null}
          <select value={shortTermForm.customer_id} onChange={(e) => setShortTermForm({ ...shortTermForm, customer_id: e.target.value })} required>
            <option value="">Select customer</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>{c.full_name}</option>
            ))}
          </select>
          <input type="number" step="0.01" placeholder="Principal amount" value={shortTermForm.principal_amount} onChange={(e) => setShortTermForm({ ...shortTermForm, principal_amount: e.target.value })} required />
          <input type="number" step="0.01" placeholder="Interest % (example: 20)" value={shortTermForm.interest_rate} onChange={(e) => setShortTermForm({ ...shortTermForm, interest_rate: e.target.value })} required />
          <input type="date" value={shortTermForm.disbursed_at} onChange={(e) => setShortTermForm({ ...shortTermForm, disbursed_at: e.target.value })} required />
          <input type="date" value={shortTermForm.due_date} onChange={(e) => setShortTermForm({ ...shortTermForm, due_date: e.target.value })} required />
          <input placeholder="Note (optional)" value={shortTermForm.note} onChange={(e) => setShortTermForm({ ...shortTermForm, note: e.target.value })} />
          <button className="btn" type="submit">Create Short-Term</button>
        </form>
      </div>

      <div className="card">
        <div className="section-heading">
          <div>
            <h3>Loan Accounts</h3>
            <p className="muted">Search by customer name, loan ID, status, amount, or balance.</p>
            {loanError ? <p className="error">{loanError}</p> : null}
            {scheduleError ? <p className="error">{scheduleError}</p> : null}
          </div>
          <button
            className="btn small"
            type="button"
            onClick={() => setShowClosedLoans((value) => !value)}
          >
            {showClosedLoans ? "Hide Closed Loans" : "Show Closed Loans"}
          </button>
        </div>
        <input
          placeholder="Search loan"
          value={loanSearchTerm}
          onChange={(e) => setLoanSearchTerm(e.target.value)}
        />
        <table>
          <thead>
            <tr><th>ID</th><th>Customer Name</th><th>Amount</th><th>Installment</th><th>Balance</th><th>Status</th><th>Overdue</th><th>Action</th></tr>
          </thead>
          <tbody>
            {filteredLoans.map((l) => (
              <tr key={l.id}>
                <td>{l.id}</td>
                <td>{customers.find((c) => c.id === l.customer_id)?.full_name || `Customer #${l.customer_id}`}</td>
                <td>{l.loan_amount}</td>
                <td>{l.installment_amount}</td>
                <td>{l.current_balance}</td>
                <td>{l.status}</td>
                <td>{l.days_overdue}</td>
                <td><button className="btn small" type="button" onClick={() => viewSchedule(l.id)}>Schedule</button></td>
              </tr>
            ))}
            {!filteredLoans.length ? (
              <tr>
                <td colSpan="8" className="muted">No loan matched your search.</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      {schedule && (
        <div className="card" style={{ gridColumn: "1 / -1", overflowX: "auto" }}>
          <h3>Loan Schedule #{schedule.loan_id} - {schedule.customer_name}</h3>
          <p>
            Loan Date: {schedule.loan_date} | Tenure: {schedule.tenure_months} months |
            Payment: {schedule.installment_amount} | Monthly Interest: {schedule.monthly_interest_rate}% |
            One-time Fee: {Number(schedule.service_charge_rate) + Number(schedule.stamp_duty_rate)}%
          </p>
          <p>
            Principal: {schedule.principal_amount} | Latest Balance: {schedule.latest_balance}
          </p>
          <p>
            Arrears: {schedule.arrears_amount} | Next Due Amount: {schedule.next_due_amount}
          </p>
          <p>
            Periods Paid: {schedule.periods_paid} | Periods Remaining: {schedule.periods_remaining}
          </p>
          {openShortTermLoans.length ? (
            <div style={{ marginBottom: "1rem" }}>
              <h4>Short-Term Borrowing</h4>
              <table>
                <thead>
                  <tr><th>ID</th><th>Principal</th><th>Interest %</th><th>Interest Due</th><th>Total Due</th><th>Interest Paid</th><th>Principal Paid</th><th>Interest Balance</th><th>Principal Balance</th><th>Balance</th><th>Due Date</th><th>Status</th><th>Note</th></tr>
                </thead>
                <tbody>
                  {openShortTermLoans.map((item) => (
                    <tr key={item.id}>
                      <td>{item.id}</td>
                      <td>{item.principal_amount}</td>
                      <td>{item.interest_rate}</td>
                      <td>{item.interest_due}</td>
                      <td>{item.total_due}</td>
                      <td>{item.interest_paid}</td>
                      <td>{item.principal_paid}</td>
                      <td>{(Number(item.interest_due) - Number(item.interest_paid)).toFixed(2)}</td>
                      <td>{(Number(item.principal_amount) - Number(item.principal_paid)).toFixed(2)}</td>
                      <td>{item.current_balance}</td>
                      <td>{item.due_date}</td>
                      <td>
                        <span style={getShortTermStatusStyle(item)}>
                          {getShortTermStatusLabel(item)}
                        </span>
                      </td>
                      <td>{item.note || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
          {closedShortTermLoans.length ? (
            <div style={{ marginBottom: "1rem" }}>
              <div className="section-heading" style={{ marginBottom: "0.75rem" }}>
                <div>
                  <h4>Closed Short-Term Accounts</h4>
                  <p className="muted">{closedShortTermLoans.length} closed account(s).</p>
                </div>
                <button
                  className="btn small"
                  type="button"
                  onClick={() => setShowClosedShortTerm((value) => !value)}
                >
                  {showClosedShortTerm ? "Hide Closed" : "Show Closed"}
                </button>
              </div>
              {showClosedShortTerm ? (
                <table>
                  <thead>
                    <tr><th>ID</th><th>Principal</th><th>Total Due</th><th>Interest Paid</th><th>Principal Paid</th><th>Closed Balance</th><th>Status</th><th>Note</th></tr>
                  </thead>
                  <tbody>
                    {closedShortTermLoans.map((item) => (
                      <tr key={item.id}>
                        <td>{item.id}</td>
                        <td>{item.principal_amount}</td>
                        <td>{item.total_due}</td>
                        <td>{item.interest_paid}</td>
                        <td>{item.principal_paid}</td>
                        <td>{item.current_balance}</td>
                        <td>
                          <span style={getShortTermStatusStyle(item)}>
                            closed
                          </span>
                        </td>
                        <td>{item.note || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : null}
            </div>
          ) : null}
          <input
            placeholder="Search schedule row"
            value={scheduleSearchTerm}
            onChange={(e) => setScheduleSearchTerm(e.target.value)}
          />
          <table>
            <thead>
              <tr>
                <th>Period</th><th>Month</th><th>Payment Date</th><th>Opening</th><th>Principal</th>
                <th>Interest</th><th>Service</th><th>Stamp</th><th>Total Payment</th><th>Paid Amount</th><th>Outstanding</th>
                <th>Actual Paid Date</th><th>Status</th><th>Closing</th><th>Cumulative Interest</th>
              </tr>
            </thead>
            <tbody>
              {filteredScheduleRows.map((r) => (
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
                  <td>{r.outstanding_amount}</td>
                  <td>{r.actual_payment_date || "-"}</td>
                  <td>{r.installment_status}</td>
                  <td>{r.closing_balance}</td>
                  <td>{r.cumulative_interest}</td>
                </tr>
              ))}
              {!filteredScheduleRows.length ? (
                <tr>
                  <td colSpan="15" className="muted">No schedule row matched your search.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default LoansPage;
