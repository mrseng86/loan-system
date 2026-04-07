import { useEffect, useState } from "react";
import api from "../api/client";

const initialForm = {
  loan_id: "",
  amount: "",
  method: "cash",
  note: "",
  paid_at: "",
};

const formatDateTimeLocal = (value) => {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  const timezoneOffset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 16);
};

function RepaymentsPage() {
  const [repayments, setRepayments] = useState([]);
  const [loans, setLoans] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingRepaymentId, setEditingRepaymentId] = useState(null);
  const [actionMessage, setActionMessage] = useState("");
  const [actionError, setActionError] = useState("");

  const loadData = async () => {
    const [repaymentsRes, loansRes, customersRes] = await Promise.all([
      api.get("/repayments"),
      api.get("/loans"),
      api.get("/customers"),
    ]);
    setRepayments(repaymentsRes.data);
    setLoans(loansRes.data);
    setCustomers(customersRes.data);
  };

  useEffect(() => {
    loadData();
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    setActionMessage("");
    setActionError("");

    const payload = {
      loan_id: Number(form.loan_id),
      amount: Number(form.amount),
      method: form.method,
      note: form.note || null,
      paid_at: form.paid_at || null,
    };

    if (editingRepaymentId) {
      await api.put(`/repayments/${editingRepaymentId}`, payload);
      setActionMessage("Repayment updated.");
    } else {
      await api.post("/repayments", payload);
      setActionMessage("Repayment saved.");
    }

    setEditingRepaymentId(null);
    setForm(initialForm);
    loadData();
  };

  const onEdit = (repayment) => {
    setActionMessage("");
    setActionError("");
    setEditingRepaymentId(repayment.id);
    setForm({
      loan_id: String(repayment.loan_id),
      amount: String(repayment.amount),
      method: repayment.method || "cash",
      note: repayment.note || "",
      paid_at: formatDateTimeLocal(repayment.paid_at),
    });
  };

  const onDelete = async (repayment) => {
    const confirmed = window.confirm(`Delete repayment #${repayment.id}?`);
    if (!confirmed) {
      return;
    }

    setActionMessage("");
    setActionError("");

    try {
      await api.delete(`/repayments/${repayment.id}`);
      if (editingRepaymentId === repayment.id) {
        setEditingRepaymentId(null);
        setForm(initialForm);
      }
      setActionMessage("Repayment deleted.");
      await loadData();
    } catch (error) {
      setActionError(error.response?.data?.detail || "Unable to delete repayment.");
    }
  };

  const onCancelEdit = () => {
    setEditingRepaymentId(null);
    setForm(initialForm);
    setActionMessage("");
    setActionError("");
  };

  const getCustomerName = (customerId) => {
    const customer = customers.find((c) => c.id === customerId);
    return customer ? customer.full_name : `Customer #${customerId}`;
  };

  const getLoanLabel = (loanId) => {
    const loan = loans.find((l) => l.id === loanId);
    if (!loan) {
      return `Loan #${loanId}`;
    }

    return `${getCustomerName(loan.customer_id)} - Loan #${loan.id} - Balance ${loan.current_balance}`;
  };

  return (
    <div className="grid page-grid">
      <form className="card" onSubmit={onSubmit}>
        <h3>{editingRepaymentId ? `Edit Repayment #${editingRepaymentId}` : "Record Repayment"}</h3>
        {actionMessage ? <p className="muted">{actionMessage}</p> : null}
        {actionError ? <p className="error">{actionError}</p> : null}
        <select value={form.loan_id} onChange={(e) => setForm({ ...form, loan_id: e.target.value })} required>
          <option value="">Select loan</option>
          {loans.map((l) => (
            <option key={l.id} value={l.id}>{getLoanLabel(l.id)}</option>
          ))}
        </select>
        <input type="number" step="0.01" placeholder="Amount" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required />
        <input placeholder="Method (cash/bank/etc)" value={form.method} onChange={(e) => setForm({ ...form, method: e.target.value })} required />
        <input type="datetime-local" value={form.paid_at} onChange={(e) => setForm({ ...form, paid_at: e.target.value })} />
        <input placeholder="Note" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
        <button className="btn" type="submit">{editingRepaymentId ? "Update Repayment" : "Save Repayment"}</button>
        {editingRepaymentId ? <button className="btn small" type="button" onClick={onCancelEdit}>Cancel Edit</button> : null}
      </form>

      <div className="card">
        <h3>Repayment History</h3>
        <table>
          <thead>
            <tr><th>ID</th><th>Loan</th><th>Amount</th><th>Method</th><th>Date</th><th>Action</th></tr>
          </thead>
          <tbody>
            {repayments.map((r) => (
              <tr key={r.id}>
                <td>{r.id}</td>
                <td>{getLoanLabel(r.loan_id)}</td>
                <td>{r.amount}</td>
                <td>{r.method}</td>
                <td>{new Date(r.paid_at).toLocaleString()}</td>
                <td>
                  <div className="action-row">
                    <button className="btn small" type="button" onClick={() => onEdit(r)}>Edit</button>
                    <button className="btn small danger" type="button" onClick={() => onDelete(r)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default RepaymentsPage;
