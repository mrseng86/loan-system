import { useEffect, useState } from "react";
import api from "../api/client";

const initialForm = {
  full_name: "",
  email: "",
  phone: "",
  address: "",
  national_id: "",
};

function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [form, setForm] = useState(initialForm);
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

  return (
    <div className="grid page-grid">
      <form className="card" onSubmit={onSubmit}>
        <h3>{editingId ? "Edit Customer" : "Add Customer"}</h3>
        <input placeholder="Full name" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} required />
        <input placeholder="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <input placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
        <input placeholder="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
        <input placeholder="National ID" value={form.national_id} onChange={(e) => setForm({ ...form, national_id: e.target.value })} />
        <button className="btn" type="submit">{editingId ? "Update" : "Create"}</button>
      </form>

      <div className="card">
        <h3>Customer Profiles</h3>
        <table>
          <thead>
            <tr><th>Name</th><th>Phone</th><th>Email</th><th>Action</th></tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c.id}>
                <td>{c.full_name}</td>
                <td>{c.phone}</td>
                <td>{c.email || "-"}</td>
                <td><button className="btn small" onClick={() => onEdit(c)}>Edit</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default CustomersPage;
