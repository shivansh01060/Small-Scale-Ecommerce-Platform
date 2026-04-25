import logo from "../assets/logo.png";

const RED = "#e53935";
const REDLT = "#ffebee";

const CartDrawer = ({ cart, onClose, onRemove, onUpdateQty, onCheckout }) => {
  const total = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <>
      <div style={s.backdrop} onClick={onClose} />
      <div style={s.drawer}>
        {/* Header */}
        <div style={s.header}>
          <div style={s.headerLeft}>
            <img src={logo} alt="" style={s.headerLogo} />
            <div>
              <h3 style={s.headerTitle}>Your cart</h3>
              <p style={s.headerSub}>
                {cart.length} item{cart.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
          <button style={s.closeBtn} onClick={onClose}>
            ✕
          </button>
        </div>

        {cart.length === 0 ? (
          <div style={s.empty}>
            <p style={{ fontSize: 48 }}>🛒</p>
            <p style={{ fontWeight: 600, color: "#555" }}>Your cart is empty</p>
            <p style={{ fontSize: 13, color: "#aaa" }}>
              Add products from the home page
            </p>
          </div>
        ) : (
          <>
            <div style={s.items}>
              {cart.map((item) => (
                <div key={item._id} style={s.item}>
                  <div style={s.itemImg}>
                    {item.images?.[0] ? (
                      <img
                        src={item.images[0]}
                        alt={item.title}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          borderRadius: 8,
                        }}
                      />
                    ) : (
                      <span style={{ fontSize: 22 }}>🛒</span>
                    )}
                  </div>
                  <div style={s.itemInfo}>
                    <p style={s.itemTitle}>{item.title}</p>
                    <p style={s.itemPrice}>₹{item.price} each</p>
                    <div style={s.qtyRow}>
                      <button
                        style={s.qtyBtn}
                        onClick={() => onUpdateQty(item._id, item.quantity - 1)}
                      >
                        −
                      </button>
                      <span style={s.qty}>{item.quantity}</span>
                      <button
                        style={s.qtyBtn}
                        onClick={() => onUpdateQty(item._id, item.quantity + 1)}
                      >
                        +
                      </button>
                      <button
                        style={s.removeBtn}
                        onClick={() => onRemove(item._id)}
                      >
                        🗑
                      </button>
                    </div>
                  </div>
                  <p style={s.itemTotal}>₹{item.price * item.quantity}</p>
                </div>
              ))}
            </div>

            <div style={s.footer}>
              <div style={s.totalRow}>
                <span style={{ fontSize: 14, color: "#555" }}>Order total</span>
                <span style={s.totalAmt}>₹{total}</span>
              </div>
              <button style={s.checkoutBtn} onClick={onCheckout}>
                Proceed to checkout →
              </button>
              <button style={s.continueBtn} onClick={onClose}>
                Continue shopping
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
};

const s = {
  backdrop: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(0,0,0,0.45)",
    zIndex: 200,
  },
  drawer: {
    position: "fixed",
    top: 0,
    right: 0,
    width: 390,
    height: "100vh",
    backgroundColor: "#fff",
    zIndex: 201,
    display: "flex",
    flexDirection: "column",
    boxShadow: "-4px 0 24px rgba(0,0,0,0.12)",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 20px",
    borderBottom: `3px solid ${RED}`,
  },
  headerLeft: { display: "flex", alignItems: "center", gap: 10 },
  headerLogo: { width: 36, height: 36, objectFit: "contain" },
  headerTitle: { margin: 0, fontSize: 16, fontWeight: 800, color: RED },
  headerSub: { margin: "2px 0 0", fontSize: 11, color: "#aaa" },
  closeBtn: {
    background: "none",
    border: "none",
    fontSize: 18,
    cursor: "pointer",
    color: "#aaa",
    padding: 4,
  },
  empty: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  items: { flex: 1, overflowY: "auto", padding: "12px 20px" },
  item: {
    display: "flex",
    gap: 12,
    padding: "12px 0",
    borderBottom: "1px solid #f5f5f5",
  },
  itemImg: {
    width: 62,
    height: 62,
    borderRadius: 8,
    backgroundColor: "#fafafa",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    overflow: "hidden",
  },
  itemInfo: { flex: 1 },
  itemTitle: {
    margin: "0 0 2px",
    fontSize: 14,
    fontWeight: 600,
    color: "#1a1a2e",
  },
  itemPrice: { margin: "0 0 6px", fontSize: 12, color: "#aaa" },
  qtyRow: { display: "flex", alignItems: "center", gap: 8 },
  qtyBtn: {
    width: 28,
    height: 28,
    borderRadius: 7,
    border: `1.5px solid ${RED}`,
    background: REDLT,
    color: RED,
    cursor: "pointer",
    fontSize: 15,
    fontWeight: 700,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 0,
  },
  qty: { minWidth: 22, textAlign: "center", fontWeight: 700, fontSize: 14 },
  removeBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: 14,
    color: "#ccc",
    marginLeft: 4,
  },
  itemTotal: {
    fontWeight: 800,
    fontSize: 15,
    color: RED,
    whiteSpace: "nowrap",
    alignSelf: "center",
  },
  footer: { padding: "16px 20px", borderTop: "1px solid #f0f0f0" },
  totalRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  totalAmt: { fontSize: 20, fontWeight: 800, color: RED },
  checkoutBtn: {
    width: "100%",
    padding: 14,
    backgroundColor: RED,
    color: "#fff",
    border: "none",
    borderRadius: 10,
    fontSize: 15,
    fontWeight: 700,
    cursor: "pointer",
    marginBottom: 8,
  },
  continueBtn: {
    width: "100%",
    padding: 11,
    backgroundColor: "#fff",
    color: RED,
    border: `1.5px solid ${RED}`,
    borderRadius: 10,
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
  },
};

export default CartDrawer;
