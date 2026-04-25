const RED = "#e53935";
const REDLT = "#ffebee";
const REDDK = "#c62828";

const ProductCard = ({ product, onAddToCart }) => {
  const {
    title,
    description,
    price,
    images,
    category,
    stock,
    distanceKm,
    seller,
  } = product;

  return (
    <div style={s.card}>
      <div style={s.imgWrap}>
        {images?.[0] ? (
          <img src={images[0]} alt={title} style={s.img} />
        ) : (
          <div style={s.noImg}>🛒</div>
        )}
        <span style={s.catTag}>{category}</span>
        {stock <= 3 && stock > 0 && (
          <span style={s.lowStock}>Only {stock} left!</span>
        )}
        {stock === 0 && <div style={s.soldOutOverlay}>Sold out</div>}
      </div>
      <div style={s.body}>
        <div style={s.distRow}>
          <span style={s.dist}>📍 {distanceKm} km away</span>
          <span style={s.seller}>{seller?.name}</span>
        </div>
        <h3 style={s.title}>{title}</h3>
        <p style={s.desc}>{description}</p>
        <div style={s.footer}>
          <span style={s.price}>₹{price}</span>
          <button
            style={{
              ...s.addBtn,
              ...(stock === 0 ? s.addBtnDisabled : {}),
            }}
            onClick={() => stock > 0 && onAddToCart(product)}
            disabled={stock === 0}
          >
            {stock === 0 ? "Sold out" : "+ Add"}
          </button>
        </div>
      </div>
    </div>
  );
};

const s = {
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    overflow: "hidden",
    boxShadow: "0 2px 10px rgba(0,0,0,0.07)",
    border: "1px solid #f5f5f5",
  },
  imgWrap: {
    position: "relative",
    height: 180,
    backgroundColor: "#fafafa",
    overflow: "hidden",
  },
  img: { width: "100%", height: "100%", objectFit: "cover" },
  noImg: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    fontSize: 48,
  },
  catTag: {
    position: "absolute",
    top: 10,
    left: 10,
    backgroundColor: "rgba(0,0,0,0.5)",
    color: "#fff",
    fontSize: 10,
    padding: "3px 8px",
    borderRadius: 20,
    fontWeight: 600,
  },
  lowStock: {
    position: "absolute",
    bottom: 10,
    left: 10,
    backgroundColor: "#ff6f00",
    color: "#fff",
    fontSize: 10,
    padding: "3px 8px",
    borderRadius: 20,
    fontWeight: 700,
  },
  soldOutOverlay: {
    position: "absolute",
    inset: 0,
    backgroundColor: "rgba(255,255,255,0.7)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 15,
    fontWeight: 800,
    color: "#999",
  },
  body: { padding: "12px 14px" },
  distRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  dist: { fontSize: 11, color: RED, fontWeight: 600 },
  seller: { fontSize: 11, color: "#aaa" },
  title: { margin: "0 0 4px", fontSize: 15, fontWeight: 700, color: "#1a1a2e" },
  desc: {
    fontSize: 12,
    color: "#888",
    margin: "0 0 12px",
    overflow: "hidden",
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
  },
  footer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  price: { fontSize: 18, fontWeight: 800, color: RED },
  addBtn: {
    padding: "8px 16px",
    backgroundColor: RED,
    color: "#fff",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 700,
  },
  addBtnDisabled: {
    backgroundColor: "#e0e0e0",
    color: "#aaa",
    cursor: "not-allowed",
  },
};

export default ProductCard;
