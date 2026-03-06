import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("admin@lms.com");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState("");

  const from = location.state?.from?.pathname || "/";

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.detail || "Login failed");
    }
  };

  return (
    <div className="login-page">
      <form className="card login-card" onSubmit={onSubmit}>
        <h2>Login</h2>
        <p className="muted">Use admin@lms.com / admin123 for first login.</p>
        {error && <p className="error">{error}</p>}
        <label>Email</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <label>Password</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button className="btn" type="submit">Sign in</button>
      </form>
    </div>
  );
}

export default LoginPage;

