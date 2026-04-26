import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useLocation from "../../hooks/useLocation";
import api from "../../services/api";
import ProductCard from "../../components/ProductCard";
import CartDrawer from "../../components/CartDrawer";
import { useAuth } from "../../context/AuthContext";
import logo from "../../assets/logo.png";

const CATEGORIES = [
  "all",
  "food",
  "furniture",
  "clothing",
  "electronics",
  "other",
];
const CAT_ICONS = {
  all: "🏠",
  food: "🍱",
  furniture: "🪑",
  clothing: "👗",
  electronics: "📱",
  other: "📦",
};

const RED = "#e53935";
const REDLT = "#ffebee";

const BuyerHome = () => {
  const { coords, error, loading } = useLocation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [fetching, setFetching] = useState(false);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);

  useEffect(() => {
    if (!coords) return;
    const fetchProducts = async () => {
      setFetching(true);
      try {
        const params = new URLSearchParams({
          lng: coords.lng,
          lat: coords.lat,
          ...(search && { search }),
          ...(category !== "all" && { category }),
        });
        const { data } = await api.get(`/api/products?${params}`);
        setProducts(data);
      } catch (err) {
        console.error(err);
      } finally {
        setFetching(false);
      }
    };
    fetchProducts();
  }, [coords, search, category]);

  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((i) => i._id === product._id);
      if (existing)
        return prev.map((i) =>
          i._id === product._id ? { ...i, quantity: i.quantity + 1 } : i,
        );
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (id) =>
    setCart((prev) => prev.filter((i) => i._id !== id));
  const updateQuantity = (id, qty) => {
    if (qty < 1) return removeFromCart(id);
    setCart((prev) =>
      prev.map((i) => (i._id === id ? { ...i, quantity: qty } : i)),
    );
  };

  const cartCount = cart.reduce((sum, i) => sum + i.quantity, 0);
  const cartTotal = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);

  // ── Loading screen ───────────────────────────────────────
  if (loading)
    return (
      <div style={s.splash}>
        <img
          src={logo}
          alt="Mini Bazar"
          style={{ width: 80, marginBottom: 16 }}
        />
        <p style={{ color: RED, fontWeight: 800, fontSize: 20, margin: 0 }}>
          Mini Bazar
        </p>
        <p style={{ color: "#aaa", fontSize: 13, marginTop: 8 }}>
          Getting your location...
        </p>
      </div>
    );

  // ── Location error screen ────────────────────────────────
  if (error)
    return (
      <div style={s.splash}>
        <img
          src={logo}
          alt="Mini Bazar"
          style={{ width: 80, marginBottom: 16 }}
        />
        <p style={{ color: RED, fontWeight: 800, fontSize: 20, margin: 0 }}>
          Mini Bazar
        </p>
        <p style={{ color: RED, fontSize: 14, marginTop: 12 }}>{error}</p>
        <p style={{ color: "#aaa", fontSize: 12, marginTop: 4 }}>
          Allow location access to see nearby products
        </p>
      </div>
    );

  return (
    <div style={s.page}>
      {/* ── Navbar ─────────────────────────────────────────── */}
      <nav style={s.nav}>
        <div style={s.navLeft}>
          <img src={logo} alt="Mini Bazar" style={s.navLogo} />
          <div>
            <h2 style={s.navTitle}>Mini Bazar</h2>
            <p style={s.navSub}>📍 Showing products near you</p>
          </div>
        </div>

        <div style={s.navRight}>
          <span style={s.greeting}>Hi, {user?.name}</span>

          {/* Orders button */}
          <button style={s.ordersBtn} onClick={() => navigate("/buyer/orders")}>
            📋 My orders
          </button>

          {/* Cart button */}
          <button style={s.cartBtn} onClick={() => setCartOpen(true)}>
            🛒
            {cartCount > 0 && <span style={s.cartBadge}>{cartCount}</span>}
            {cartCount > 0 && <span style={s.cartTotal}> ₹{cartTotal}</span>}
          </button>

          {/* Logout button */}
          <button
            style={s.logoutBtn}
            onClick={() => {
              logout();
              navigate("/login");
            }}
          >
            Logout
          </button>
        </div>
      </nav>

      {/* ── Search bar ─────────────────────────────────────── */}
      <div style={s.searchBar}>
        <div style={s.searchWrap}>
          <span style={s.searchIcon}>🔍</span>
          <input
            style={s.searchInput}
            placeholder="Search products near you..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button style={s.clearBtn} onClick={() => setSearch("")}>
              ✕
            </button>
          )}
        </div>
      </div>

      {/* ── Category filter ────────────────────────────────── */}
      <div style={s.catBar}>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            style={{
              ...s.catBtn,
              ...(category === cat ? s.catBtnActive : {}),
            }}
            onClick={() => setCategory(cat)}
          >
            <span style={{ fontSize: 16 }}>{CAT_ICONS[cat]}</span>
            <span style={{ fontSize: 12 }}>
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </span>
          </button>
        ))}
      </div>

      {/* ── Product grid ───────────────────────────────────── */}
      <div style={s.content}>
        {fetching ? (
          <div style={s.loadingWrap}>
            <p style={{ color: "#aaa" }}>Finding products near you...</p>
          </div>
        ) : products.length === 0 ? (
          <div style={s.empty}>
            <p style={{ fontSize: 48 }}>🛍️</p>
            <p style={{ fontWeight: 700, color: "#333", fontSize: 16 }}>
              No products found
            </p>
            <p style={{ color: "#aaa", fontSize: 13 }}>
              {search
                ? `No results for "${search}" — try a different search`
                : "No sellers nearby yet — check back later!"}
            </p>
            {search && (
              <button style={s.clearSearchBtn} onClick={() => setSearch("")}>
                Clear search
              </button>
            )}
          </div>
        ) : (
          <>
            <p style={s.resultCount}>
              {products.length} product{products.length !== 1 ? "s" : ""} near
              you
            </p>
            <div style={s.grid}>
              {products.map((p) => (
                <ProductCard key={p._id} product={p} onAddToCart={addToCart} />
              ))}
            </div>
          </>
        )}
      </div>

      {/* ── Cart drawer ────────────────────────────────────── */}
      {cartOpen && (
        <CartDrawer
          cart={cart}
          onClose={() => setCartOpen(false)}
          onRemove={removeFromCart}
          onUpdateQty={updateQuantity}
          onCheckout={() => {
            setCartOpen(false);
            navigate("/buyer/checkout", { state: { cart } });
          }}
        />
      )}
    </div>
  );
};

const s = {
  // Full page
  page: {
    minHeight: "100vh",
    backgroundColor: "#fafafa",
    fontFamily: "sans-serif",
  },

  // Splash (loading / error)
  splash: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "sans-serif",
    padding: 20,
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
  navLogo: { width: 48, height: 48, objectFit: "contain" },
  navTitle: { margin: 0, fontSize: 20, fontWeight: 800, color: RED },
  navSub: { margin: "2px 0 0", fontSize: 11, color: "#aaa" },
  navRight: { display: "flex", alignItems: "center", gap: 12 },
  greeting: { fontSize: 13, color: "#555" },

  // Nav buttons
  ordersBtn: {
    padding: "8px 14px",
    backgroundColor: REDLT,
    color: RED,
    border: `1px solid ${RED}`,
    borderRadius: 8,
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 600,
  },
  cartBtn: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    gap: 4,
    padding: "9px 16px",
    backgroundColor: RED,
    color: "#fff",
    border: "none",
    borderRadius: 10,
    cursor: "pointer",
    fontWeight: 700,
    fontSize: 14,
  },
  cartBadge: {
    backgroundColor: "#fff",
    color: RED,
    borderRadius: "50%",
    width: 18,
    height: 18,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 10,
    fontWeight: 800,
  },
  cartTotal: { fontSize: 13 },
  logoutBtn: {
    padding: "8px 14px",
    backgroundColor: "transparent",
    border: "1px solid #ddd",
    borderRadius: 8,
    cursor: "pointer",
    fontSize: 13,
    color: "#666",
  },

  // Search
  searchBar: {
    backgroundColor: "#fff",
    padding: "14px 24px",
    borderBottom: "1px solid #f0f0f0",
  },
  searchWrap: { position: "relative", maxWidth: 600 },
  searchIcon: {
    position: "absolute",
    left: 14,
    top: "50%",
    transform: "translateY(-50%)",
    fontSize: 16,
    pointerEvents: "none",
  },
  searchInput: {
    width: "100%",
    padding: "11px 40px",
    fontSize: 14,
    border: "1.5px solid #e8e8e8",
    borderRadius: 10,
    boxSizing: "border-box",
    outline: "none",
    fontFamily: "sans-serif",
  },
  clearBtn: {
    position: "absolute",
    right: 12,
    top: "50%",
    transform: "translateY(-50%)",
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "#aaa",
    fontSize: 14,
  },

  // Categories
  catBar: {
    display: "flex",
    gap: 8,
    padding: "12px 24px",
    backgroundColor: "#fff",
    borderBottom: "1px solid #f0f0f0",
    overflowX: "auto",
  },
  catBtn: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 3,
    padding: "8px 14px",
    border: "1.5px solid #e8e8e8",
    borderRadius: 10,
    backgroundColor: "#fff",
    cursor: "pointer",
    color: "#888",
    flexShrink: 0,
    minWidth: 60,
  },
  catBtnActive: { borderColor: RED, backgroundColor: REDLT, color: RED },

  // Content
  content: { padding: 24 },
  loadingWrap: { display: "flex", justifyContent: "center", padding: 60 },
  empty: { textAlign: "center", padding: "60px 0" },
  clearSearchBtn: {
    marginTop: 14,
    padding: "10px 20px",
    backgroundColor: RED,
    color: "#fff",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 600,
  },
  resultCount: { fontSize: 13, color: "#aaa", marginBottom: 16 },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
    gap: 20,
  },
};

export default BuyerHome;
