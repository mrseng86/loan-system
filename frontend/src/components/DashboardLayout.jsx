import { Link, NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const navItems = [
  { to: "/", label: "Dashboard" },
  { to: "/customers", label: "Customers" },
  { to: "/loans", label: "Loans" },
  { to: "/repayments", label: "Repayments" },
  { to: "/collections", label: "Collections" },
];

function DashboardLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="layout">
      <aside className="sidebar">
        <Link to="/" className="brand">LMS Admin</Link>
        <nav>
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.to === "/"} className="nav-item">
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <main className="content">
        <header className="topbar">
          <div>
            <h1>Loan Management System</h1>
            <p>{user?.email} ({user?.role})</p>
          </div>
          <button onClick={logout} className="btn danger">Logout</button>
        </header>
        <Outlet />
      </main>
    </div>
  );
}

export default DashboardLayout;
