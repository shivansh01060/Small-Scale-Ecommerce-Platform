import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../../services/api";
import logo from "../../assets/logo.png";

const STATUS_CONFIG = {
  pending: { bg: "#fff3e0", color: "#e65100", icon: "🕐", label: "Pending" },
  confirmed: {
    bg: "#e3f2fd",
    color: "#1565c0",
    icon: "✅",
    label: "Confirmed",
  },
  ready: {
    bg: "#e8f5e9",
    color: "#2e7d32",
    icon: "📦",
    label: "Ready for pickup",
  },
  delivered: {
    bg: "#f3e5f5",
    color: "#6a1b9a",
    icon: "🎉",
    label: "Delivered",
  },
  cancelled: { bg: "#ffebee", color: "#c62828", icon: "✕", label: "Cancelled" },
};

const RED = "#e53935";
const REDLT = "#ffebee";

const BuyerOrders = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const justOrdered = location.state?.success;

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await api.get("/api/orders/my");
        setOrders(data);
        // Auto-expand the most recent order if just placed
        if (justOrdered && data.length > 0) setExpandedId(data[0]._id);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  return (
    <div style={s.page}>
      {/* Navbar */}
      <nav style={s.nav}>
        <div style={s.navLeft}>
          <img src={logo} alt="Mini Bazar" style={s.navLogo} />
          <div>
            <h2 style={s.navTitle}>Mini Bazar</h2>
            <p style={s.navSub}>My orders</p>
          </div>
        </div>
        <button style={s.backBtn} onClick={() => navigate("/buyer/home")}>
          ← Back to shopping
        </button>
      </nav>

      <div style={s.content}>
        {/* Success banner — shown right after placing an order */}
        {justOrdered && (
          <div style={s.successBanner}>
            <span style={{ fontSize: 24 }}>🎉</span>
            <div>
              <p style={s.successTitle}>Order placed successfully!</p>
              <p style={s.successSub}>
                Your seller has been notified and will confirm shortly.
              </p>
            </div>
          </div>
        )}

        <h3 style={s.heading}>
          Your orders
          <span style={s.orderCount}>{orders.length}</span>
        </h3>

        {loading ? (
          <div style={s.centered}>
            <p style={{ color: "#aaa" }}>Loading your orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div style={s.empty}>
            <p style={{ fontSize: 48 }}>🛍️</p>
            <p style={{ fontWeight: 700, color: "#333", fontSize: 16 }}>
              No orders yet
            </p>
            <p style={{ color: "#aaa", fontSize: 13, marginBottom: 20 }}>
              Browse products near you and place your first order!
            </p>
            <button style={s.shopBtn} onClick={() => navigate("/buyer/home")}>
              Start shopping →
            </button>
          </div>
        ) : (
          <div style={s.list}>
            {orders.map((order) => {
              const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
              const isExpanded = expandedId === order._id;
              const date = new Date(order.createdAt).toLocaleDateString(
                "en-IN",
                {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                },
              );

              return (
                <div key={order._id} style={s.card}>
                  {/* Card header — always visible, click to expand */}
                  <div
                    style={s.cardHeader}
                    onClick={() => setExpandedId(isExpanded ? null : order._id)}
                  >
                    <div style={{ ...s.statusDot, backgroundColor: cfg.bg }}>
                      <span style={{ fontSize: 18 }}>{cfg.icon}</span>
                    </div>

                    <div style={s.cardInfo}>
                      <div style={s.cardTop}>
                        <span style={s.orderId}>
                          Order #{order._id.slice(-6).toUpperCase()}
                        </span>
                        <span style={s.dot}>·</span>
                        <span style={s.sellerName}>{order.seller?.name}</span>
                      </div>
                      <div style={s.cardMeta}>
                        <span style={s.date}>{date}</span>
                        <span style={s.dot}>·</span>
                        <span style={s.itemCount}>
                          {order.items.length} item
                          {order.items.length !== 1 ? "s" : ""}
                        </span>
                      </div>
                    </div>

                    <div style={s.cardRight}>
                      <span style={s.total}>₹{order.totalAmount}</span>
                      <span
                        style={{
                          ...s.statusBadge,
                          backgroundColor: cfg.bg,
                          color: cfg.color,
                        }}
                      >
                        {cfg.label}
                      </span>
                      <span style={s.chevron}>{isExpanded ? "▲" : "▼"}</span>
                    </div>
                  </div>

                  {/* Expanded detail */}
                  {isExpanded && (
                    <div style={s.detail}>
                      {/* Items */}
                      <div style={s.section}>
                        <p style={s.sectionTitle}>Items ordered</p>
                        {order.items.map((item, i) => (
                          <div key={i} style={s.itemRow}>
                            <div style={s.itemImg}>
                              {item.image ? (
                                <img
                                  src={item.image}
                                  alt=""
                                  style={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "cover",
                                    borderRadius: 6,
                                  }}
                                />
                              ) : (
                                <span style={{ fontSize: 20 }}>🛒</span>
                              )}
                            </div>
                            <span style={s.itemName}>{item.title}</span>
                            <span style={s.itemQty}>×{item.quantity}</span>
                            <span style={s.itemPrice}>
                              ₹{item.price * item.quantity}
                            </span>
                          </div>
                        ))}
                        <div style={s.totalRow}>
                          <span style={{ color: "#888", fontSize: 13 }}>
                            Total paid
                          </span>
                          <span style={s.totalAmt}>₹{order.totalAmount}</span>
                        </div>
                      </div>

                      {/* Delivery + seller info */}
                      <div style={s.section}>
                        <p style={s.sectionTitle}>Delivery details</p>
                        <div style={s.infoGrid}>
                          <div style={s.infoItem}>
                            <span style={s.infoIcon}>📍</span>
                            <div>
                              <p style={s.infoLabel}>Deliver to</p>
                              <p style={s.infoValue}>{order.deliveryAddress}</p>
                            </div>
                          </div>
                          <div style={s.infoItem}>
                            <span style={s.infoIcon}>🏪</span>
                            <div>
                              <p style={s.infoLabel}>Seller</p>
                              <p style={s.infoValue}>
                                {order.seller?.name}
                                {order.seller?.apartment
                                  ? ` · ${order.seller.apartment}`
                                  : ""}
                              </p>
                            </div>
                          </div>
                          <div style={s.infoItem}>
                            <span style={s.infoIcon}>💳</span>
                            <div>
                              <p style={s.infoLabel}>Payment</p>
                              <p style={s.infoValue}>
                                {order.paymentMethod === "cod"
                                  ? "Cash on delivery"
                                  : "Online payment"}
                              </p>
                            </div>
                          </div>
                          {order.contactNumber && (
                            <div style={s.infoItem}>
                              <span style={s.infoIcon}>📞</span>
                              <div>
                                <p style={s.infoLabel}>Contact</p>
                                <p style={s.infoValue}>{order.contactNumber}</p>
                              </div>
                            </div>
                          )}
                          {order.note && (
                            <div style={s.infoItem}>
                              <span style={s.infoIcon}>📝</span>
                              <div>
                                <p style={s.infoLabel}>Your note</p>
                                <p style={s.infoValue}>{order.note}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Status timeline */}
                      <div style={s.section}>
                        <p style={s.sectionTitle}>Order status</p>
                        <div style={s.timeline}>
                          {["pending", "confirmed", "ready", "delivered"].map(
                            (step, i) => {
                              const stepCfg = STATUS_CONFIG[step];
                              const isDone = getStepIndex(order.status) >= i;
                              const isCurrent = order.status === step;
                              return (
                                <div key={step} style={s.timelineStep}>
                                  <div
                                    style={{
                                      ...s.timelineDot,
                                      backgroundColor: isDone ? RED : "#e0e0e0",
                                      transform: isCurrent
                                        ? "scale(1.3)"
                                        : "scale(1)",
                                    }}
                                  />
                                  {i < 3 && (
                                    <div
                                      style={{
                                        ...s.timelineLine,
                                        backgroundColor:
                                          getStepIndex(order.status) > i
                                            ? RED
                                            : "#e0e0e0",
                                      }}
                                    />
                                  )}
                                  <p
                                    style={{
                                      ...s.timelineLabel,
                                      color: isDone ? RED : "#aaa",
                                      fontWeight: isCurrent ? 700 : 400,
                                    }}
                                  >
                                    {stepCfg.label}
                                  </p>
                                </div>
                              );
                            },
                          )}
                        </div>
                        {order.status === "cancelled" && (
                          <p
                            style={{
                              color: "#c62828",
                              fontSize: 13,
                              fontWeight: 600,
                              backgroundColor: "#ffebee",
                              padding: "8px 12px",
                              borderRadius: 8,
                              marginTop: 12,
                            }}
                          >
                            ✕ This order was cancelled
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

// Helper — convert status string to step index for timeline
const getStepIndex = (status) => {
  const steps = ["pending", "confirmed", "ready", "delivered"];
  return steps.indexOf(status);
};

const s = {
  page: {
    minHeight: "100vh",
    backgroundColor: "#fafafa",
    fontFamily: "sans-serif",
  },
  nav: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 24px",
    backgroundColor: "#fff",
    borderBottom: `3px solid ${RED}`,
    position: "sticky",
    top: 0,
    zIndex: 100,
    boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
  },
  navLeft: { display: "flex", alignItems: "center", gap: 12 },
  navLogo: { width: 44, height: 44, objectFit: "contain" },
  navTitle: { margin: 0, fontSize: 20, fontWeight: 800, color: RED },
  navSub: { margin: "2px 0 0", fontSize: 11, color: "#aaa" },
  backBtn: {
    padding: "8px 16px",
    backgroundColor: REDLT,
    color: RED,
    border: `1px solid ${RED}`,
    borderRadius: 8,
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 600,
  },
  content: { padding: 24, maxWidth: 720, margin: "0 auto" },
  successBanner: {
    display: "flex",
    alignItems: "center",
    gap: 16,
    padding: "16px 20px",
    backgroundColor: "#e8f5e9",
    border: "1px solid #a5d6a7",
    borderRadius: 12,
    marginBottom: 24,
  },
  successTitle: { margin: 0, fontWeight: 700, color: "#2e7d32", fontSize: 15 },
  successSub: { margin: "3px 0 0", fontSize: 13, color: "#388e3c" },
  heading: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    margin: "0 0 20px",
    fontSize: 20,
    fontWeight: 800,
    color: "#1a1a2e",
  },
  orderCount: {
    fontSize: 13,
    backgroundColor: REDLT,
    color: RED,
    padding: "2px 10px",
    borderRadius: 20,
    fontWeight: 700,
  },
  centered: { display: "flex", justifyContent: "center", padding: 60 },
  empty: { textAlign: "center", padding: "60px 0" },
  shopBtn: {
    padding: "12px 24px",
    backgroundColor: RED,
    color: "#fff",
    border: "none",
    borderRadius: 10,
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 700,
  },
  list: { display: "flex", flexDirection: "column", gap: 14 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    border: "1px solid #f0f0f0",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
    overflow: "hidden",
  },
  cardHeader: {
    display: "flex",
    alignItems: "center",
    gap: 14,
    padding: "16px 20px",
    cursor: "pointer",
  },
  statusDot: {
    width: 46,
    height: 46,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  cardInfo: { flex: 1, minWidth: 0 },
  cardTop: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
    flexWrap: "wrap",
  },
  orderId: { fontWeight: 800, fontSize: 14, color: "#1a1a2e" },
  dot: { color: "#ddd" },
  sellerName: { fontSize: 13, color: "#555" },
  cardMeta: { display: "flex", alignItems: "center", gap: 6 },
  date: { fontSize: 12, color: "#aaa" },
  itemCount: { fontSize: 12, color: "#aaa" },
  cardRight: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: 6,
    flexShrink: 0,
  },
  total: { fontSize: 17, fontWeight: 800, color: RED },
  statusBadge: {
    fontSize: 11,
    padding: "3px 10px",
    borderRadius: 20,
    fontWeight: 700,
    textAlign: "center",
  },
  chevron: { fontSize: 10, color: "#ccc" },
  detail: { padding: "0 20px 20px", borderTop: "1px solid #f8f8f8" },
  section: { marginTop: 18 },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 700,
    color: "#aaa",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    margin: "0 0 12px",
  },
  itemRow: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "8px 0",
    borderBottom: "1px solid #f8f8f8",
  },
  itemImg: {
    width: 38,
    height: 38,
    borderRadius: 6,
    backgroundColor: "#f5f5f5",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    overflow: "hidden",
  },
  itemName: { flex: 1, fontSize: 13, color: "#333" },
  itemQty: { fontSize: 12, color: "#aaa" },
  itemPrice: { fontSize: 13, fontWeight: 700, color: "#1a1a2e" },
  totalRow: {
    display: "flex",
    justifyContent: "space-between",
    paddingTop: 10,
  },
  totalAmt: { fontSize: 16, fontWeight: 800, color: RED },
  infoGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 },
  infoItem: {
    display: "flex",
    gap: 10,
    alignItems: "flex-start",
    backgroundColor: "#fafafa",
    padding: "10px 12px",
    borderRadius: 8,
  },
  infoIcon: { fontSize: 16, flexShrink: 0 },
  infoLabel: {
    margin: "0 0 2px",
    fontSize: 10,
    color: "#aaa",
    fontWeight: 600,
    textTransform: "uppercase",
  },
  infoValue: { margin: 0, fontSize: 13, color: "#333", fontWeight: 500 },
  timeline: { display: "flex", alignItems: "flex-start", gap: 0 },
  timelineStep: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    flex: 1,
  },
  timelineDot: {
    width: 14,
    height: 14,
    borderRadius: "50%",
    transition: "all 0.3s",
    marginBottom: 6,
  },
  timelineLine: {
    width: "100%",
    height: 3,
    marginTop: -8,
    marginBottom: 8,
    transition: "background-color 0.3s",
  },
  timelineLabel: {
    fontSize: 11,
    textAlign: "center",
    transition: "color 0.3s",
  },
};

export default BuyerOrders;
