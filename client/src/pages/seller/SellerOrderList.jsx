import { useEffect, useState } from "react";
import api from "../../services/api";

const STATUS_CONFIG = {
  pending: { bg: "#fff3e0", color: "#e65100", icon: "🕐", label: "Pending" },
  confirmed: {
    bg: "#e3f2fd",
    color: "#1565c0",
    icon: "✅",
    label: "Confirmed",
  },
  ready: { bg: "#e8f5e9", color: "#2e7d32", icon: "📦", label: "Ready" },
  delivered: {
    bg: "#f3e5f5",
    color: "#6a1b9a",
    icon: "🎉",
    label: "Delivered",
  },
  cancelled: { bg: "#ffebee", color: "#c62828", icon: "✕", label: "Cancelled" },
};

const NEXT_STATUS = {
  pending: {
    status: "confirmed",
    label: "Confirm order",
    color: "#1565c0",
    bg: "#e3f2fd",
  },
  confirmed: {
    status: "ready",
    label: "Mark as ready",
    color: "#2e7d32",
    bg: "#e8f5e9",
  },
  ready: {
    status: "delivered",
    label: "Mark delivered",
    color: "#6a1b9a",
    bg: "#f3e5f5",
  },
};

const TABS = ["all", "pending", "confirmed", "ready", "delivered", "cancelled"];

const SellerOrderList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [expandedId, setExpandedId] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/api/orders/seller");
      setOrders(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatus = async (orderId, status) => {
    try {
      const { data } = await api.patch(`/api/orders/${orderId}/status`, {
        status,
      });
      setOrders((prev) =>
        prev.map((o) =>
          o._id === orderId ? { ...o, status: data.status } : o,
        ),
      );
    } catch (err) {
      console.error(err);
    }
  };

  const filtered =
    activeTab === "all" ? orders : orders.filter((o) => o.status === activeTab);

  const countFor = (tab) =>
    tab === "all"
      ? orders.length
      : orders.filter((o) => o.status === tab).length;

  if (loading)
    return (
      <div style={s.centered}>
        <p style={{ color: "#aaa", fontSize: 14 }}>Loading orders...</p>
      </div>
    );

  return (
    <div style={s.page}>
      {/* Header */}
      <div style={s.header}>
        <div>
          <h3 style={s.headerTitle}>Incoming orders</h3>
          <p style={s.headerSub}>
            {orders.length} total order{orders.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button style={s.refreshBtn} onClick={fetchOrders}>
          ↻ Refresh
        </button>
      </div>

      {/* Summary pills */}
      <div style={s.summaryRow}>
        {["pending", "confirmed", "ready", "delivered", "cancelled"].map(
          (status) => {
            const cfg = STATUS_CONFIG[status];
            const count = countFor(status);
            return (
              <div
                key={status}
                style={{ ...s.summaryPill, backgroundColor: cfg.bg }}
              >
                <span style={{ fontSize: 16 }}>{cfg.icon}</span>
                <span style={{ ...s.summaryCount, color: cfg.color }}>
                  {count}
                </span>
                <span style={{ ...s.summaryLabel, color: cfg.color }}>
                  {cfg.label}
                </span>
              </div>
            );
          },
        )}
      </div>

      {/* Filter tabs */}
      <div style={s.tabs}>
        {TABS.map((tab) => (
          <button
            key={tab}
            style={{ ...s.tab, ...(activeTab === tab ? s.tabActive : {}) }}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
            <span
              style={{
                ...s.tabCount,
                ...(activeTab === tab ? s.tabCountActive : {}),
              }}
            >
              {countFor(tab)}
            </span>
          </button>
        ))}
      </div>

      {/* Orders list */}
      {filtered.length === 0 ? (
        <div style={s.empty}>
          <p style={{ fontSize: 40 }}>📋</p>
          <p style={{ fontWeight: 600, color: "#555" }}>
            No {activeTab === "all" ? "" : activeTab} orders yet
          </p>
          <p style={{ fontSize: 13, color: "#aaa" }}>
            {activeTab === "pending"
              ? "New orders will appear here"
              : "Orders in this status will show here"}
          </p>
        </div>
      ) : (
        <div style={s.list}>
          {filtered.map((order) => {
            const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
            const next = NEXT_STATUS[order.status];
            const isExpanded = expandedId === order._id;
            const date = new Date(order.createdAt).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
            });

            return (
              <div key={order._id} style={s.card}>
                {/* Card top — always visible */}
                <div
                  style={s.cardTop}
                  onClick={() => setExpandedId(isExpanded ? null : order._id)}
                >
                  <div style={s.cardLeft}>
                    {/* Status icon circle */}
                    <div style={{ ...s.statusCircle, backgroundColor: cfg.bg }}>
                      <span style={{ fontSize: 18 }}>{cfg.icon}</span>
                    </div>
                    <div>
                      <div style={s.orderMeta}>
                        <span style={s.orderId}>
                          #{order._id.slice(-6).toUpperCase()}
                        </span>
                        <span style={s.dot}>·</span>
                        <span style={s.buyerName}>{order.buyer?.name}</span>
                        <span style={s.dot}>·</span>
                        <span style={s.orderDate}>{date}</span>
                      </div>
                      <div style={s.itemPreview}>
                        {order.items.map((item, i) => (
                          <span key={i} style={s.itemChip}>
                            {item.title} ×{item.quantity}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div style={s.cardRight}>
                    <span style={s.totalAmt}>₹{order.totalAmount}</span>
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
                    {/* Items breakdown */}
                    <div style={s.section}>
                      <p style={s.sectionTitle}>Order items</p>
                      {order.items.map((item, i) => (
                        <div key={i} style={s.itemRow}>
                          {item.image ? (
                            <img src={item.image} alt="" style={s.itemImg} />
                          ) : (
                            <div style={s.itemImgFallback}>🛒</div>
                          )}
                          <span style={s.itemName}>{item.title}</span>
                          <span style={s.itemQty}>×{item.quantity}</span>
                          <span style={s.itemTotal}>
                            ₹{item.price * item.quantity}
                          </span>
                        </div>
                      ))}
                      <div style={s.totalRow}>
                        <span style={s.totalLabel}>Total</span>
                        <span style={s.totalValue}>₹{order.totalAmount}</span>
                      </div>
                    </div>

                    {/* Delivery info */}
                    <div style={s.section}>
                      <p style={s.sectionTitle}>Delivery details</p>
                      <div style={s.deliveryGrid}>
                        <div style={s.deliveryItem}>
                          <span style={s.deliveryIcon}>📍</span>
                          <div>
                            <p style={s.deliveryLabel}>Deliver to</p>
                            <p style={s.deliveryValue}>
                              {order.deliveryAddress}
                            </p>
                          </div>
                        </div>
                        {order.contactNumber && (
                          <div style={s.deliveryItem}>
                            <span style={s.deliveryIcon}>📞</span>
                            <div>
                              <p style={s.deliveryLabel}>Contact</p>
                              <p style={s.deliveryValue}>
                                {order.contactNumber}
                              </p>
                            </div>
                          </div>
                        )}
                        <div style={s.deliveryItem}>
                          <span style={s.deliveryIcon}>💳</span>
                          <div>
                            <p style={s.deliveryLabel}>Payment</p>
                            <p style={s.deliveryValue}>
                              {order.paymentMethod === "cod"
                                ? "Cash on delivery"
                                : "Online payment"}
                            </p>
                          </div>
                        </div>
                        {order.note && (
                          <div style={s.deliveryItem}>
                            <span style={s.deliveryIcon}>📝</span>
                            <div>
                              <p style={s.deliveryLabel}>Note from buyer</p>
                              <p style={s.deliveryValue}>{order.note}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action buttons */}
                    {(next ||
                      (order.status !== "cancelled" &&
                        order.status !== "delivered")) && (
                      <div style={s.actions}>
                        {next && (
                          <button
                            style={{
                              ...s.actionBtn,
                              backgroundColor: next.bg,
                              color: next.color,
                              border: `1.5px solid ${next.color}`,
                            }}
                            onClick={() => handleStatus(order._id, next.status)}
                          >
                            {next.label} →
                          </button>
                        )}
                        {order.status !== "cancelled" &&
                          order.status !== "delivered" && (
                            <button
                              style={s.cancelBtn}
                              onClick={() =>
                                handleStatus(order._id, "cancelled")
                              }
                            >
                              Cancel order
                            </button>
                          )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const RED = "#e53935";
const REDLT = "#ffebee";
const REDDK = "#c62828";

const s = {
  page: { fontFamily: "sans-serif" },
  centered: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 60,
  },

  // Header
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  headerTitle: { margin: 0, fontSize: 20, fontWeight: 800, color: "#1a1a2e" },
  headerSub: { margin: "3px 0 0", fontSize: 13, color: "#aaa" },
  refreshBtn: {
    padding: "8px 16px",
    backgroundColor: REDLT,
    color: RED,
    border: `1px solid ${RED}`,
    borderRadius: 8,
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 600,
  },

  // Summary pills
  summaryRow: { display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" },
  summaryPill: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: "8px 14px",
    borderRadius: 10,
    flex: 1,
    minWidth: 100,
  },
  summaryCount: { fontSize: 18, fontWeight: 800 },
  summaryLabel: { fontSize: 11, fontWeight: 600 },

  // Tabs
  tabs: {
    display: "flex",
    gap: 4,
    borderBottom: "2px solid #f0f0f0",
    marginBottom: 20,
    flexWrap: "wrap",
  },
  tab: {
    padding: "8px 14px",
    border: "none",
    backgroundColor: "transparent",
    cursor: "pointer",
    fontSize: 13,
    color: "#999",
    borderBottom: "2px solid transparent",
    marginBottom: -2,
    display: "flex",
    alignItems: "center",
    gap: 6,
  },
  tabActive: { color: RED, borderBottomColor: RED, fontWeight: 700 },
  tabCount: {
    fontSize: 10,
    backgroundColor: "#f0f0f0",
    color: "#999",
    borderRadius: 10,
    padding: "1px 6px",
    fontWeight: 600,
  },
  tabCountActive: { backgroundColor: REDLT, color: RED },

  // Empty
  empty: { textAlign: "center", padding: "50px 0", color: "#aaa" },

  // List
  list: { display: "flex", flexDirection: "column", gap: 12 },

  // Card
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    border: "1px solid #f0f0f0",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
    overflow: "hidden",
  },
  cardTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "14px 18px",
    cursor: "pointer",
  },
  cardLeft: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    flex: 1,
    minWidth: 0,
  },
  statusCircle: {
    width: 44,
    height: 44,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  orderMeta: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
    flexWrap: "wrap",
  },
  orderId: { fontWeight: 800, fontSize: 14, color: "#1a1a2e" },
  dot: { color: "#ddd" },
  buyerName: { fontSize: 13, color: "#555" },
  orderDate: { fontSize: 12, color: "#aaa" },
  itemPreview: { display: "flex", gap: 6, flexWrap: "wrap" },
  itemChip: {
    fontSize: 11,
    backgroundColor: "#f5f5f5",
    color: "#666",
    padding: "2px 8px",
    borderRadius: 6,
  },
  cardRight: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    flexShrink: 0,
    marginLeft: 12,
  },
  totalAmt: { fontSize: 16, fontWeight: 800, color: RED },
  statusBadge: {
    fontSize: 11,
    padding: "3px 10px",
    borderRadius: 20,
    fontWeight: 700,
  },
  chevron: { fontSize: 10, color: "#ccc" },

  // Expanded detail
  detail: { padding: "0 18px 18px", borderTop: "1px solid #f8f8f8" },
  section: { marginTop: 16 },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 700,
    color: "#aaa",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    margin: "0 0 10px",
  },

  // Items
  itemRow: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "8px 0",
    borderBottom: "1px solid #f8f8f8",
  },
  itemImg: {
    width: 36,
    height: 36,
    borderRadius: 6,
    objectFit: "cover",
    flexShrink: 0,
  },
  itemImgFallback: {
    width: 36,
    height: 36,
    borderRadius: 6,
    backgroundColor: "#f5f5f5",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 16,
    flexShrink: 0,
  },
  itemName: { flex: 1, fontSize: 13, color: "#333" },
  itemQty: { fontSize: 12, color: "#aaa" },
  itemTotal: { fontSize: 13, fontWeight: 700, color: "#1a1a2e" },
  totalRow: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 16,
    paddingTop: 10,
  },
  totalLabel: { fontSize: 13, color: "#888" },
  totalValue: { fontSize: 15, fontWeight: 800, color: RED },

  // Delivery
  deliveryGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 },
  deliveryItem: {
    display: "flex",
    gap: 10,
    alignItems: "flex-start",
    backgroundColor: "#fafafa",
    padding: "10px 12px",
    borderRadius: 8,
  },
  deliveryIcon: { fontSize: 16, flexShrink: 0, marginTop: 1 },
  deliveryLabel: {
    margin: "0 0 2px",
    fontSize: 10,
    color: "#aaa",
    fontWeight: 600,
    textTransform: "uppercase",
  },
  deliveryValue: { margin: 0, fontSize: 13, color: "#333", fontWeight: 500 },

  // Actions
  actions: { display: "flex", gap: 10, marginTop: 16 },
  actionBtn: {
    padding: "10px 20px",
    border: "none",
    borderRadius: 9,
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 700,
  },
  cancelBtn: {
    padding: "10px 18px",
    backgroundColor: "#fff",
    border: `1.5px solid ${RED}`,
    color: RED,
    borderRadius: 9,
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 600,
  },
};

export default SellerOrderList;
