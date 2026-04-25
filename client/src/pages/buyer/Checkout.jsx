import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../../services/api";
import logo from "../../assets/logo.png";

const RED = "#e53935";
const REDLT = "#ffebee";

const Checkout = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const cart = state?.cart || [];

  const [form, setForm] = useState({
    deliveryAddress: "",
    contactNumber: "",
    note: "",
    paymentMethod: "cod",
  });
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState("");

  const total = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleOrder = async () => {
    if (!form.deliveryAddress)
      return setError("Please enter your delivery address");
    setPlacing(true);
    setError("");
    try {
      await api.post("/api/orders", {
        items: cart.map((i) => ({ product: i._id, quantity: i.quantity })),
        ...form,
      });
      navigate("/buyer/orders", { state: { success: true } });
    } catch (err) {
      setError(err.response?.data?.message || "Order failed, please try again");
    } finally {
      setPlacing(false);
    }
  };

  return (
    <div style={s.page}>
      {/* Header */}
      <div style={s.header}>
        <button style={s.backBtn} onClick={() => navigate(-1)}>
          ← Back
        </button>
        <div style={s.headerCenter}>
          <img src={logo} alt="Mini Bazar" style={s.headerLogo} />
          <span style={s.headerTitle}>Checkout</span>
        </div>
        <div style={{ width: 60 }} />
      </div>

      <div style={s.container}>
        <div style={s.left}>
          {/* Order summary */}
          <div style={s.card}>
            <h4 style={s.cardTitle}>🛒 Order summary</h4>
            {cart.map((item) => (
              <div key={item._id} style={s.summaryRow}>
                <div style={s.summaryLeft}>
                  {item.images?.[0] && (
                    <img src={item.images[0]} alt="" style={s.summaryImg} />
                  )}
                  <span style={s.summaryName}>{item.title}</span>
                </div>
                <div style={s.summaryRight}>
                  <span style={s.summaryQty}>×{item.quantity}</span>
                  <span style={s.summaryPrice}>
                    ₹{item.price * item.quantity}
                  </span>
                </div>
              </div>
            ))}
            <div style={s.totalRow}>
              <span style={s.totalLabel}>Total</span>
              <span style={s.totalAmt}>₹{total}</span>
            </div>
          </div>

          {/* Payment method */}
          <div style={s.card}>
            <h4 style={s.cardTitle}>💳 Payment method</h4>
            <div style={s.paymentGrid}>
              {[
                {
                  value: "cod",
                  icon: "💵",
                  label: "Cash on delivery",
                  sub: "Pay when you receive",
                },
                {
                  value: "online",
                  icon: "💳",
                  label: "Online payment",
                  sub: "UPI / Card / Net banking",
                },
              ].map((opt) => (
                <label
                  key={opt.value}
                  style={{
                    ...s.paymentOpt,
                    ...(form.paymentMethod === opt.value
                      ? s.paymentOptActive
                      : {}),
                  }}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={opt.value}
                    checked={form.paymentMethod === opt.value}
                    onChange={handleChange}
                    style={{ display: "none" }}
                  />
                  <span style={{ fontSize: 24 }}>{opt.icon}</span>
                  <div>
                    <p style={s.paymentLabel}>{opt.label}</p>
                    <p style={s.paymentSub}>{opt.sub}</p>
                  </div>
                  {form.paymentMethod === opt.value && (
                    <span style={s.paymentCheck}>✓</span>
                  )}
                </label>
              ))}
            </div>
          </div>
        </div>

        <div style={s.right}>
          {/* Delivery details */}
          <div style={s.card}>
            <h4 style={s.cardTitle}>📍 Delivery details</h4>

            <label style={s.label}>Your flat / tower *</label>
            <input
              style={s.input}
              name="deliveryAddress"
              placeholder="e.g. Tower A, Flat 302"
              value={form.deliveryAddress}
              onChange={handleChange}
            />

            <label style={s.label}>Contact number</label>
            <input
              style={s.input}
              name="contactNumber"
              placeholder="e.g. 9876543210"
              value={form.contactNumber}
              onChange={handleChange}
            />

            <label style={s.label}>Note for seller</label>
            <textarea
              style={{ ...s.input, height: 80, resize: "vertical" }}
              name="note"
              placeholder="Any special instructions..."
              value={form.note}
              onChange={handleChange}
            />
          </div>

          {error && <div style={s.errorBox}>⚠️ {error}</div>}

          <button
            style={{ ...s.orderBtn, opacity: placing ? 0.75 : 1 }}
            onClick={handleOrder}
            disabled={placing}
          >
            {placing ? "Placing order..." : `Place order · ₹${total}`}
          </button>

          <p style={s.safeNote}>
            🔒 Your order is safe and secure with Mini Bazar
          </p>
        </div>
      </div>
    </div>
  );
};

const s = {
  page: {
    minHeight: "100vh",
    backgroundColor: "#fafafa",
    fontFamily: "sans-serif",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "14px 24px",
    backgroundColor: "#fff",
    borderBottom: `3px solid ${RED}`,
    position: "sticky",
    top: 0,
    zIndex: 10,
  },
  backBtn: {
    background: "none",
    border: "none",
    fontSize: 14,
    color: RED,
    cursor: "pointer",
    fontWeight: 600,
    width: 60,
  },
  headerCenter: { display: "flex", alignItems: "center", gap: 8 },
  headerLogo: { width: 32, height: 32, objectFit: "contain" },
  headerTitle: { fontSize: 17, fontWeight: 800, color: RED },
  container: {
    display: "grid",
    gridTemplateColumns: "1fr 380px",
    gap: 20,
    padding: 24,
    maxWidth: 960,
    margin: "0 auto",
  },
  left: { display: "flex", flexDirection: "column", gap: 16 },
  right: { display: "flex", flexDirection: "column", gap: 16 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: "20px 20px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
    border: "1px solid #f5f5f5",
  },
  cardTitle: {
    margin: "0 0 16px",
    fontSize: 15,
    fontWeight: 700,
    color: "#1a1a2e",
  },
  summaryRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "8px 0",
    borderBottom: "1px solid #f8f8f8",
  },
  summaryLeft: { display: "flex", alignItems: "center", gap: 10 },
  summaryImg: { width: 36, height: 36, borderRadius: 6, objectFit: "cover" },
  summaryName: { fontSize: 13, color: "#333" },
  summaryRight: { display: "flex", alignItems: "center", gap: 12 },
  summaryQty: { fontSize: 12, color: "#aaa" },
  summaryPrice: { fontSize: 13, fontWeight: 700, color: "#1a1a2e" },
  totalRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    marginTop: 4,
  },
  totalLabel: { fontSize: 14, fontWeight: 600, color: "#555" },
  totalAmt: { fontSize: 20, fontWeight: 800, color: RED },
  paymentGrid: { display: "flex", flexDirection: "column", gap: 10 },
  paymentOpt: {
    display: "flex",
    alignItems: "center",
    gap: 14,
    padding: "14px 16px",
    border: "1.5px solid #e8e8e8",
    borderRadius: 10,
    cursor: "pointer",
    position: "relative",
  },
  paymentOptActive: { borderColor: RED, backgroundColor: REDLT },
  paymentLabel: {
    margin: "0 0 2px",
    fontSize: 14,
    fontWeight: 600,
    color: "#333",
  },
  paymentSub: { margin: 0, fontSize: 11, color: "#aaa" },
  paymentCheck: {
    position: "absolute",
    right: 14,
    color: RED,
    fontWeight: 800,
    fontSize: 16,
  },
  label: {
    display: "block",
    fontSize: 13,
    fontWeight: 600,
    color: "#444",
    marginBottom: 6,
  },
  input: {
    width: "100%",
    padding: "11px 14px",
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
    border: `1px solid ${RED}`,
  },
  orderBtn: {
    width: "100%",
    padding: 16,
    backgroundColor: RED,
    color: "#fff",
    border: "none",
    borderRadius: 12,
    fontSize: 16,
    fontWeight: 800,
    cursor: "pointer",
  },
  safeNote: {
    textAlign: "center",
    fontSize: 12,
    color: "#aaa",
    margin: "8px 0 0",
  },
};

export default Checkout;
