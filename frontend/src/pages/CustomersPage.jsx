import { useEffect, useState } from "react";
import api from "../api/client";

const initialForm = {
  full_name: "",
  email: "",
  phone: "",
  address: "",
  national_id: "",
};

const initialLookupForm = {
  national_id: "",
  legacy_id: "",
};

function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [lookupForm, setLookupForm] = useState(initialLookupForm);
  const [lookupResult, setLookupResult] = useState(null);
  const [lookupError, setLookupError] = useState("");
  const [lookupLoading, setLookupLoading] = useState(false);
  const [copyMessage, setCopyMessage] = useState("");
  const [editingId, setEditingId] = useState(null);

  const loadCustomers = async () => {
    const { data } = await api.get("/customers");
    setCustomers(data);
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (editingId) {
      await api.put(`/customers/${editingId}`, form);
    } else {
      await api.post("/customers", form);
    }
    setForm(initialForm);
    setEditingId(null);
    loadCustomers();
  };

  const onEdit = (customer) => {
    setEditingId(customer.id);
    setForm({
      full_name: customer.full_name,
      email: customer.email || "",
      phone: customer.phone,
      address: customer.address || "",
      national_id: customer.national_id || "",
    });
  };

  const onDelete = async (customer) => {
    const confirmed = window.confirm(`Delete customer "${customer.full_name}"? This will also remove related loans, repayments, and collections.`);
    if (!confirmed) {
      return;
    }

    await api.delete(`/customers/${customer.id}`);

    if (editingId === customer.id) {
      setEditingId(null);
      setForm(initialForm);
    }

    loadCustomers();
  };

  const onLookup = async (e) => {
    e.preventDefault();
    setLookupLoading(true);
    setLookupError("");

    try {
      const { data } = await api.post("/perkeso/check", lookupForm);
      setLookupResult(data);
      setForm((current) => ({
        ...current,
        full_name: current.full_name || data.customer_name,
        national_id: lookupForm.national_id,
      }));
    } catch (error) {
      setLookupResult(null);
      setLookupError(error.response?.data?.detail || "Unable to query PERKESO right now.");
    } finally {
      setLookupLoading(false);
    }
  };

  const applyLookupResult = () => {
    if (!lookupResult) {
      return;
    }

    setEditingId(null);
    setForm((current) => ({
      ...current,
      full_name: lookupResult.customer_name,
      national_id: lookupResult.national_id,
    }));
  };

  const latestRecord = lookupResult?.records?.[0] || null;

  const copyLookupJson = async () => {
    if (!lookupResult) {
      return;
    }

    try {
      await navigator.clipboard.writeText(JSON.stringify(lookupResult, null, 2));
      setCopyMessage("JSON copied.");
      window.setTimeout(() => setCopyMessage(""), 2000);
    } catch {
      setCopyMessage("Copy failed.");
      window.setTimeout(() => setCopyMessage(""), 2000);
    }
  };

  const downloadLookupCsv = () => {
    if (!lookupResult) {
      return;
    }

    const headers = [
      "Customer Name",
      "National ID",
      "Company",
      "Start Month",
      "Contribution Months",
      "Last Contribution Month",
      "Estimated Last Working Day",
      "Estimated LOE",
    ];

    const rows = lookupResult.records.map((record) => [
      lookupResult.customer_name,
      lookupResult.national_id,
      record.company,
      record.start_month,
      record.paid_contribution_count,
      record.last_contribution_month,
      record.estimated_last_working_day,
      record.estimated_loe,
    ]);

    const escapeValue = (value) => `"${String(value ?? "").replace(/"/g, "\"\"")}"`;
    const csvContent = [headers, ...rows].map((row) => row.map(escapeValue).join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `perkeso-${lookupResult.national_id}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="grid customers-page">
      <div className="grid customer-top-grid">
        <form className="card" onSubmit={onLookup}>
          <div className="section-heading">
            <div>
              <h3>PERKESO / EIS Lookup</h3>
              <p className="muted">Enter IC number to fetch the insured person's name and employment contribution history.</p>
            </div>
            {lookupResult ? (
              <button className="btn small" type="button" onClick={applyLookupResult}>
                Use Result
              </button>
            ) : null}
          </div>

          <input
            placeholder="National ID (12 digits)"
            value={lookupForm.national_id}
            onChange={(e) => setLookupForm({ ...lookupForm, national_id: e.target.value.replace(/\D/g, "").slice(0, 12) })}
            required
          />
          <input
            placeholder="Old ID / Pseudo / Passport (optional)"
            value={lookupForm.legacy_id}
            onChange={(e) => setLookupForm({ ...lookupForm, legacy_id: e.target.value.toUpperCase() })}
          />

          {lookupError ? <p className="error">{lookupError}</p> : null}

          <button className="btn" type="submit" disabled={lookupLoading}>
            {lookupLoading ? "Checking..." : "Check PERKESO"}
          </button>
        </form>

        <form className="card" onSubmit={onSubmit}>
          <h3>{editingId ? "Edit Customer" : "Add Customer"}</h3>
          <input placeholder="Full name" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} required />
          <input placeholder="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <input placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
          <input placeholder="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          <input placeholder="National ID" value={form.national_id} onChange={(e) => setForm({ ...form, national_id: e.target.value })} />
          <button className="btn" type="submit">{editingId ? "Update" : "Create"}</button>
        </form>
      </div>

      {lookupResult ? (
        <div className="card">
          <div className="section-heading">
            <div>
              <h3>Employment Result</h3>
              <p className="muted">{lookupResult.customer_name} ({lookupResult.national_id})</p>
            </div>
            <div className="action-row">
              <button className="btn small" type="button" onClick={copyLookupJson}>Copy JSON</button>
              <button className="btn small" type="button" onClick={downloadLookupCsv}>Download CSV</button>
            </div>
          </div>

          <div className="result-summary">
            <div className="result-metric">
              <span className="muted">Matched Name</span>
              <strong>{lookupResult.customer_name}</strong>
            </div>
            <div className="result-metric">
              <span className="muted">Employer Records</span>
              <strong>{lookupResult.records.length}</strong>
            </div>
            <div className="result-metric">
              <span className="muted">Latest Employer</span>
              <strong>{latestRecord?.company || "-"}</strong>
            </div>
            <div className="result-metric">
              <span className="muted">Latest Estimated LOE</span>
              <strong>{latestRecord?.estimated_loe || "-"}</strong>
            </div>
          </div>

          {copyMessage ? <p className="muted">{copyMessage}</p> : null}

          <table>
            <thead>
              <tr>
                <th>Company</th>
                <th>Start Month</th>
                <th>Contribution Months</th>
                <th>Last Contribution</th>
                <th>Estimated Last Work Day</th>
                <th>Estimated LOE</th>
              </tr>
            </thead>
            <tbody>
              {lookupResult.records.map((record) => (
                <tr key={`${record.company}-${record.start_month}`}>
                  <td>{record.company || "-"}</td>
                  <td>{record.start_month || "-"}</td>
                  <td>{record.paid_contribution_count}</td>
                  <td>{record.last_contribution_month}</td>
                  <td>{record.estimated_last_working_day}</td>
                  <td>{record.estimated_loe}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      <div className="card">
        <h3>Customer Profiles</h3>
        <table>
          <thead>
            <tr><th>Name</th><th>Phone</th><th>Email</th><th>National ID</th><th>Action</th></tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c.id}>
                <td>{c.full_name}</td>
                <td>{c.phone}</td>
                <td>{c.email || "-"}</td>
                <td>{c.national_id || "-"}</td>
                <td>
                  <div className="action-row">
                    <button className="btn small" type="button" onClick={() => onEdit(c)}>Edit</button>
                    <button className="btn small danger" type="button" onClick={() => onDelete(c)}>Delete</button>
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

export default CustomersPage;
