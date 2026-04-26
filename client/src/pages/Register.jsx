import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/logo.png";

const RED = "#e53935";
const REDLT = "#ffebee";

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState("buyer");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    apartment: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [locMsg, setLocMsg] = useState("");

  const handleChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.password)
      return setError("Name, email and password are required");
    if (form.password.length < 6)
      return setError("Password must be at least 6 characters");
    setLoading(true);
    setError("");

    const doRegister = async (locationData = null) => {
      try {
        const payload = {
          name: form.name,
          email: form.email,
          password: form.password,
          role,
          apartment: form.apartment, // ✅ top-level
          ...(role === "seller" && locationData
            ? { location: locationData }
            : {}),
        };
        const user = await register(payload);
        navigate(user.role === "seller" ? "/seller/dashboard" : "/buyer/home");
      } catch (err) {
        setError(err.response?.data?.message || "Registration failed");
      } finally {
        setLoading(false);
      }
    };

    if (role === "seller") {
      setLocMsg("Getting your location...");
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => {
          setLocMsg("");
          doRegister({
            type: "Point",
            coordinates: [coords.longitude, coords.latitude],
          });
        },
        () => {
          setLocMsg("");
          setError(
            "Location access is required for sellers. Please allow it and try again.",
          );
          setLoading(false);
        },
      );
    } else {
      doRegister();
    }
  };

  return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={s.logoWrap}>
          <img src={logo} alt="Mini Bazar" style={s.logo} />
          <h1 style={s.appName}>Mini Bazar</h1>
          <p style={s.tagline}>Your neighbourhood marketplace</p>
        </div>
        <h2 style={s.title}>Create account</h2>
        <p style={s.sub}>Join your apartment community</p>

        {/* Role toggle */}
        <div style={s.roleRow}>
          {["buyer", "seller"].map((r) => (
            <button
              key={r}
              style={{ ...s.roleBtn, ...(role === r ? s.roleBtnActive : {}) }}
              onClick={() => setRole(r)}
            >
              {r === "buyer" ? "🛒 I want to buy" : "🏪 I want to sell"}
            </button>
          ))}
        </div>

        <div
          style={{
            ...s.banner,
            backgroundColor: role === "seller" ? "#fff3e0" : "#e8f5e9",
          }}
        >
          <span>{role === "seller" ? "📍" : "🛍️"}</span>
          <p
            style={{
              margin: 0,
              fontSize: 12,
              color: role === "seller" ? "#e65100" : "#2e7d32",
            }}
          >
            {role === "seller"
              ? "Your GPS location will be saved so buyers within 10km can find you"
              : "Browse and buy from sellers inside your apartment complex"}
          </p>
        </div>

        <label style={s.label}>Full name</label>
        <input
          style={s.input}
          name="name"
          placeholder="Your name"
          value={form.name}
          onChange={handleChange}
        />

        <label style={s.label}>Email address</label>
        <input
          style={s.input}
          name="email"
          type="email"
          placeholder="you@example.com"
          value={form.email}
          onChange={handleChange}
        />

        <label style={s.label}>Password</label>
        <input
          style={s.input}
          name="password"
          type="password"
          placeholder="Minimum 6 characters"
          value={form.password}
          onChange={handleChange}
        />

        <label style={s.label}>
          {role === "seller"
            ? "Your flat / tower"
            : "Your flat / tower (optional)"}
        </label>
        <input
          style={s.input}
          name="apartment"
          placeholder="e.g. Tower B, Flat 204"
          value={form.apartment}
          onChange={handleChange}
        />
        {locMsg && (
          <p style={{ color: "#e65100", fontSize: 13, marginBottom: 8 }}>
            📍 {locMsg}
          </p>
        )}
        {error && <div style={s.errorBox}>⚠️ {error}</div>}

        <button
          style={{ ...s.btn, opacity: loading ? 0.75 : 1 }}
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "Creating account..." : `Create ${role} account →`}
        </button>
        <p style={s.switchText}>
          Already have an account?{" "}
          <Link to="/login" style={s.link}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

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
    maxWidth: 420,
    boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
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
  sub: { margin: "0 0 20px", fontSize: 13, color: "#aaa" },
  roleRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 10,
    marginBottom: 14,
  },
  roleBtn: {
    padding: "12px 8px",
    border: "1.5px solid #e8e8e8",
    borderRadius: 10,
    backgroundColor: "#fff",
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 600,
    color: "#888",
  },
  roleBtnActive: { borderColor: RED, backgroundColor: REDLT, color: RED },
  banner: {
    display: "flex",
    alignItems: "flex-start",
    gap: 10,
    padding: "10px 12px",
    borderRadius: 8,
    marginBottom: 20,
  },
  label: {
    display: "block",
    fontSize: 13,
    fontWeight: 600,
    color: "#444",
    marginBottom: 6,
    marginTop: 4,
  },
  input: {
    width: "100%",
    padding: "12px 14px",
    fontSize: 14,
    border: "1.5px solid #e8e8e8",
    borderRadius: 9,
    marginBottom: 14,
    boxSizing: "border-box",
    outline: "none",
    fontFamily: "sans-serif",
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
  btn: {
    width: "100%",
    padding: 13,
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

export default Register;
