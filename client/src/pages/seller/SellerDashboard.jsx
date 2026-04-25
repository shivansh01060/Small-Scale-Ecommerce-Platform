import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import ProductForm from "./ProductForm";
import SellerOrderList from "./SellerOrderList";
import logo from "../../assets/logo.png";

const TABS = ["listings", "add product", "orders"];

const SellerDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [tab, setTab] = useState("listings");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editItem, setEditItem] = useState(null);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/api/products/my");
      setProducts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleToggle = async (id, isActive) => {
    try {
      await api.patch(`/api/products/${id}/toggle`);
      setProducts((prev) =>
        prev.map((p) => (p._id === id ? { ...p, isActive: !isActive } : p)),
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      await api.delete(`/api/products/${id}`);
      setProducts((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (product) => {
    setEditItem(product);
    setTab("add product");
  };

  const handleFormSuccess = () => {
    setEditItem(null);
    setTab("listings");
    fetchProducts();
  };

  return (
    <div style={styles.page}>
      {/* Navbar */}
      <nav style={styles.nav}>
        <div style={styles.navLeft}>
          <img src={logo} alt="Mini Bazar" style={styles.logoImg} />
          <div>
            <h2 style={styles.logoText}>Mini Bazar</h2>
            <p style={styles.subtext}>Seller Portal</p>
          </div>
        </div>
        <div style={styles.navRight}>
          <span style={styles.welcomeText}>👋 {user?.name}</span>
          <button
            style={styles.logoutBtn}
            onClick={() => {
              logout();
              navigate("/login");
            }}
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Stats bar */}
      <div style={styles.statsBar}>
        <div style={styles.stat}>
          <span style={styles.statNum}>{products.length}</span>
          <span style={styles.statLabel}>Total listings</span>
        </div>
        <div style={styles.statDivider} />
        <div style={styles.stat}>
          <span style={styles.statNum}>
            {products.filter((p) => p.isActive).length}
          </span>
          <span style={styles.statLabel}>Active</span>
        </div>
        <div style={styles.statDivider} />
        <div style={styles.stat}>
          <span style={styles.statNum}>
            {products.filter((p) => !p.isActive).length}
          </span>
          <span style={styles.statLabel}>Inactive</span>
        </div>
        <div style={styles.statDivider} />
        <div style={styles.stat}>
          <span style={styles.statNum}>
            {products.reduce((s, p) => s + p.stock, 0)}
          </span>
          <span style={styles.statLabel}>Total stock</span>
        </div>
      </div>

      {/* Tabs */}
      <div style={styles.tabs}>
        {TABS.map((t) => (
          <button
            key={t}
            style={{ ...styles.tab, ...(tab === t ? styles.tabActive : {}) }}
            onClick={() => {
              setTab(t);
              if (t !== "add product") setEditItem(null);
            }}
          >
            {t === "listings" && "📦 "}
            {t === "add product" && "➕ "}
            {t === "orders" && "📋 "}
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div style={styles.content}>
        {tab === "listings" &&
          (loading ? (
            <p style={styles.muted}>Loading your products...</p>
          ) : products.length === 0 ? (
            <div style={styles.empty}>
              <p style={{ fontSize: 48 }}>🛍️</p>
              <p style={{ fontWeight: 600, color: "#2c3e50" }}>
                No products yet
              </p>
              <p style={{ color: "#888", fontSize: 13, marginBottom: 16 }}>
                Start selling on Mini Bazar today!
              </p>
              <button
                style={styles.addFirstBtn}
                onClick={() => setTab("add product")}
              >
                + Add your first product
              </button>
            </div>
          ) : (
            <div style={styles.grid}>
              {products.map((p) => (
                <ProductCard
                  key={p._id}
                  product={p}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onToggle={handleToggle}
                />
              ))}
            </div>
          ))}

        {tab === "add product" && (
          <ProductForm
            editData={editItem}
            onSuccess={handleFormSuccess}
            onCancel={() => {
              setEditItem(null);
              setTab("listings");
            }}
          />
        )}

        {tab === "orders" && <SellerOrderList />}
      </div>
    </div>
  );
};

const ProductCard = ({ product, onEdit, onDelete, onToggle }) => {
  const { _id, title, price, stock, category, images, isActive, description } =
    product;
  return (
    <div style={{ ...styles.card, opacity: isActive ? 1 : 0.65 }}>
      <div style={styles.cardImg}>
        {images?.[0] ? (
          <img
            src={images[0]}
            alt={title}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <span style={{ fontSize: 40 }}>🛒</span>
        )}
        <span
          style={{
            ...styles.badge,
            backgroundColor: isActive ? "#e8f5e9" : "#fce4ec",
            color: isActive ? "#2e7d32" : "#c62828",
          }}
        >
          {isActive ? "● Active" : "● Inactive"}
        </span>
      </div>
      <div style={styles.cardBody}>
        <div style={styles.cardTop}>
          <span style={styles.catPill}>{category}</span>
          <span style={styles.stockText}>Stock: {stock}</span>
        </div>
        <h3 style={styles.cardTitle}>{title}</h3>
        <p style={styles.cardDesc}>{description}</p>
        <p style={styles.cardPrice}>₹{price}</p>
        <div style={styles.cardActions}>
          <button style={styles.editBtn} onClick={() => onEdit(product)}>
            ✏️ Edit
          </button>
          <button
            style={{
              ...styles.toggleBtn,
              backgroundColor: isActive ? "#fff3e0" : "#e8f5e9",
              color: isActive ? "#e65100" : "#2e7d32",
            }}
            onClick={() => onToggle(_id, isActive)}
          >
            {isActive ? "⏸ Pause" : "▶ Activate"}
          </button>
          <button style={styles.deleteBtn} onClick={() => onDelete(_id)}>
            🗑
          </button>
        </div>
      </div>
    </div>
  );
};

const RED = "#e53935";
const REDDK = "#c62828";
const REDLT = "#ffebee";

const styles = {
  page: {
    minHeight: "100vh",
    backgroundColor: "#fafafa",
    fontFamily: "sans-serif",
  },

  // Navbar
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
  logoImg: { width: 52, height: 52, objectFit: "contain" },
  logoText: {
    margin: 0,
    fontSize: 22,
    fontWeight: 800,
    color: RED,
    letterSpacing: -0.5,
  },
  subtext: { margin: 0, fontSize: 11, color: "#888", marginTop: 1 },
  navRight: { display: "flex", alignItems: "center", gap: 12 },
  welcomeText: { fontSize: 13, color: "#555" },
  logoutBtn: {
    padding: "8px 16px",
    backgroundColor: REDLT,
    color: RED,
    border: `1px solid ${RED}`,
    borderRadius: 8,
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 600,
  },

  // Stats
  statsBar: {
    display: "flex",
    alignItems: "center",
    backgroundColor: "#fff",
    borderBottom: "1px solid #f0f0f0",
    padding: "0 24px",
  },
  stat: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "14px 0",
  },
  statNum: { fontSize: 24, fontWeight: 800, color: RED },
  statLabel: { fontSize: 11, color: "#888", marginTop: 2 },
  statDivider: { width: 1, height: 40, backgroundColor: "#f0f0f0" },

  // Tabs
  tabs: {
    display: "flex",
    borderBottom: `2px solid #f0f0f0`,
    backgroundColor: "#fff",
    paddingLeft: 20,
  },
  tab: {
    padding: "13px 20px",
    border: "none",
    backgroundColor: "transparent",
    cursor: "pointer",
    fontSize: 14,
    color: "#888",
    borderBottom: "3px solid transparent",
    marginBottom: -2,
  },
  tabActive: { color: RED, borderBottomColor: RED, fontWeight: 700 },

  // Content
  content: { padding: 24 },
  muted: { color: "#888", fontSize: 14 },
  empty: { textAlign: "center", padding: "60px 0", color: "#555" },
  addFirstBtn: {
    padding: "12px 24px",
    backgroundColor: RED,
    color: "#fff",
    border: "none",
    borderRadius: 10,
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 700,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
    gap: 20,
  },

  // Product card
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    overflow: "hidden",
    boxShadow: "0 2px 10px rgba(0,0,0,0.07)",
    border: "1px solid #f5f5f5",
    transition: "box-shadow 0.2s",
  },
  cardImg: {
    position: "relative",
    height: 165,
    backgroundColor: "#fafafa",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  badge: {
    position: "absolute",
    top: 10,
    right: 10,
    fontSize: 10,
    padding: "3px 8px",
    borderRadius: 20,
    fontWeight: 700,
  },
  cardBody: { padding: 14 },
  cardTop: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  catPill: {
    fontSize: 10,
    backgroundColor: REDLT,
    color: REDDK,
    padding: "2px 8px",
    borderRadius: 10,
    fontWeight: 600,
  },
  stockText: { fontSize: 11, color: "#999" },
  cardTitle: {
    margin: "0 0 4px",
    fontSize: 15,
    fontWeight: 700,
    color: "#1a1a2e",
  },
  cardDesc: {
    fontSize: 12,
    color: "#888",
    margin: "0 0 8px",
    overflow: "hidden",
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
  },
  cardPrice: { fontSize: 18, fontWeight: 800, color: RED, margin: "0 0 12px" },
  cardActions: { display: "flex", gap: 6 },
  editBtn: {
    flex: 1,
    padding: "7px 0",
    backgroundColor: "#e3f2fd",
    color: "#1565c0",
    border: "none",
    borderRadius: 7,
    cursor: "pointer",
    fontSize: 12,
    fontWeight: 600,
  },
  toggleBtn: {
    flex: 1,
    padding: "7px 0",
    border: "none",
    borderRadius: 7,
    cursor: "pointer",
    fontSize: 12,
    fontWeight: 600,
  },
  deleteBtn: {
    padding: "7px 12px",
    backgroundColor: REDLT,
    color: RED,
    border: "none",
    borderRadius: 7,
    cursor: "pointer",
    fontSize: 13,
  },
};

export default SellerDashboard;
