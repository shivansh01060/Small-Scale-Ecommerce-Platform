import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/logo.png";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.email || !form.password)
      return setError("Please fill in all fields");
    setLoading(true);
    setError("");
    try {
      const user = await login(form.email, form.password);
      navigate(user.role === "seller" ? "/seller/dashboard" : "/buyer/home");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.page}>
      <div style={s.card}>
        {/* Logo */}
        <div style={s.logoWrap}>
          <img src={logo} alt="Mini Bazar" style={s.logo} />
          <h1 style={s.appName}>Mini Bazar</h1>
          <p style={s.tagline}>Your neighbourhood marketplace</p>
        </div>

        <h2 style={s.title}>Welcome back</h2>
        <p style={s.sub}>Sign in to your account</p>

        <div style={s.field}>
          <label style={s.label}>Email address</label>
          <input
            style={s.input}
            name="email"
            type="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={handleChange}
          />
        </div>

        <div style={s.field}>
          <label style={s.label}>Password</label>
          <input
            style={s.input}
            name="password"
            type="password"
            placeholder="Enter your password"
            value={form.password}
            onChange={handleChange}
          />
        </div>

        {error && <div style={s.errorBox}>⚠️ {error}</div>}

        <button
          style={{ ...s.submitBtn, opacity: loading ? 0.75 : 1 }}
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "Signing in..." : "Sign in →"}
        </button>

        <p style={s.switchText}>
          Don't have an account?{" "}
          <Link to="/register" style={s.link}>
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
};

const RED = "#e53935";
const REDLT = "#ffebee";

const s = {
  page: {
    minHeight: "100vh",
    backgroundColor: "#fafafa",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "sans-serif",
    padding: 20,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: "36px 32px",
    width: "100%",
    maxWidth: 400,
    boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
    border: "1px solid #f0f0f0",
  },
  logoWrap: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    marginBottom: 24,
  },
  logo: { width: 72, height: 72, objectFit: "contain", marginBottom: 8 },
  appName: { margin: 0, fontSize: 24, fontWeight: 800, color: RED },
  tagline: { margin: "4px 0 0", fontSize: 12, color: "#aaa" },
  title: { margin: "0 0 4px", fontSize: 20, fontWeight: 700, color: "#1a1a2e" },
  sub: { margin: "0 0 24px", fontSize: 13, color: "#aaa" },
  field: { marginBottom: 16 },
  label: {
    display: "block",
    fontSize: 13,
    fontWeight: 600,
    color: "#444",
    marginBottom: 6,
  },
  input: {
    width: "100%",
    padding: "12px 14px",
    fontSize: 14,
    border: "1.5px solid #e8e8e8",
    borderRadius: 9,
    boxSizing: "border-box",
    outline: "none",
    fontFamily: "sans-serif",
    color: "#333",
  },
  errorBox: {
    backgroundColor: REDLT,
    color: RED,
    padding: "10px 14px",
    borderRadius: 8,
    fontSize: 13,
    marginBottom: 14,
    border: `1px solid ${RED}`,
  },
  submitBtn: {
    width: "100%",
    padding: "13px",
    backgroundColor: RED,
    color: "#fff",
    border: "none",
    borderRadius: 10,
    fontSize: 15,
    fontWeight: 700,
    cursor: "pointer",
    marginBottom: 16,
  },
  switchText: { textAlign: "center", fontSize: 13, color: "#888", margin: 0 },
  link: { color: RED, fontWeight: 600, textDecoration: "none" },
};

export default Login;
